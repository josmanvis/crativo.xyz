'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Selector from '@/components/ui/Selector';
import { ensureGsap, gsap, EASE } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/hud';

export interface IndexProject {
  id: string;
  pn: string;
  title: string;
  description: string;
  category: string;
  year: number;
  techStack: string[];
  imageUrl: string;
  href: string;
  metrics: { label: string; value: string }[];
}

interface ProjectIndexProps {
  projects: IndexProject[];
  categories: readonly string[];
}

const isExternal = (href: string) => /^https?:\/\//.test(href);

function readout(p: IndexProject) {
  return [p.pn, p.title, p.category, p.techStack.slice(0, 2).join(' + '), p.year].join(' · ');
}

/**
 * Catalogue table + sticky monitor. Hover or focus a row and the monitor
 * (a little display bezel) switches to that instrument's spec; the HUD reads
 * it out at the same time.
 */
export default function ProjectIndex({ projects, categories }: ProjectIndexProps) {
  const [category, setCategory] = useState('All');
  const filtered = useMemo(
    () => (category === 'All' ? projects : projects.filter((p) => p.category === category)),
    [projects, category]
  );
  const [activeId, setActiveId] = useState(projects[0]?.id);
  const active = filtered.find((p) => p.id === activeId) ?? filtered[0];
  const screen = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: projects.length };
    for (const p of projects) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [projects]);

  // Monitor wipe on change — a fast horizontal scan, like a display redrawing.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const node = screen.current;
    if (!node || prefersReducedMotion()) return;
    ensureGsap();
    gsap.fromTo(
      node,
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.26, ease: EASE.primary, overwrite: true }
    );
  }, [active?.id]);

  return (
    <div>
      <div className="mb-8">
        <Selector
          label="Filter projects by category"
          options={categories}
          value={category}
          onChange={setCategory}
          counts={counts}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6">
        {/* Table */}
        <div className="lg:col-span-8">
          <div className="hidden md:grid grid-cols-[4rem_minmax(0,1fr)_7rem_4rem_1.5rem] gap-4 pb-3 border-b border-ink t-label text-graphite">
            <span>Part</span>
            <span>Instrument</span>
            <span>Class</span>
            <span className="text-right">Year</span>
            <span />
          </div>

          <ol>
            {filtered.map((p) => {
              const on = p.id === active?.id;
              const external = isExternal(p.href);
              return (
                <li key={p.id} className="relative">
                  <Link
                    href={p.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    onPointerEnter={() => setActiveId(p.id)}
                    onFocus={() => setActiveId(p.id)}
                    data-hud={readout(p) + (external ? ' · external' : '')}
                    className={`group grid grid-cols-[3rem_minmax(0,1fr)_auto] md:grid-cols-[4rem_minmax(0,1fr)_7rem_4rem_1.5rem] items-baseline gap-x-4 py-5 md:py-6 transition-colors duration-150 ease-[var(--ease-primary)] ${
                      on ? 'lg:bg-paper-2' : 'hover:bg-paper-2'
                    }`}
                  >
                    <span className="t-label text-graphite flex items-center gap-2 pl-1">
                      <span className="led hidden lg:inline-block" data-on={on ? 'true' : 'false'} />
                      {p.pn}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[clamp(1.375rem,2.4vw,2.125rem)] font-bold leading-[1.05] tracking-[-0.025em] [font-stretch:112%] pb-[0.08em] transition-transform duration-200 ease-[var(--ease-primary)] group-hover:translate-x-1.5">
                        {p.title}
                      </span>
                      <span className="mt-1.5 block text-graphite text-[15px] leading-snug line-clamp-2 lg:hidden">
                        {p.description}
                      </span>
                    </span>
                    <span className="hidden md:block t-label">{p.category}</span>
                    <span className="t-label text-right">{p.year}</span>
                    <span className="hidden md:flex justify-end text-graphite group-hover:text-ink">
                      {external ? (
                        <ArrowUpRight size={18} strokeWidth={1.5} className="arrow-nudge" />
                      ) : (
                        <ArrowRight size={18} strokeWidth={1.5} className="arrow-nudge" />
                      )}
                    </span>
                  </Link>
                  <span
                    aria-hidden="true"
                    data-reveal="rule"
                    className="absolute inset-x-0 bottom-0 h-px bg-rule-strong"
                  />
                </li>
              );
            })}
          </ol>
        </div>

        {/* Monitor */}
        <aside className="hidden lg:block lg:col-span-4" aria-label="Selected project preview">
          {active && (
            <div className="sticky top-[calc(var(--nav-h)+24px)]">
              <div className="bezel">
                <div className="flex items-center justify-between px-3 h-8 border-b border-white/10 t-label text-screen-ink/70">
                  <span className="flex items-center gap-2">
                    <span className="led" data-on="true" />
                    Monitor
                  </span>
                  <span>{active.pn}</span>
                </div>
                <div ref={screen}>
                  <div className="relative aspect-[4/3]">
                    {active.imageUrl ? (
                      <Image
                        src={active.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 30vw, 0px"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      // No artwork: a typographic plate, like a datasheet's part diagram.
                      <div className="absolute inset-0 p-5 flex flex-col justify-between text-screen-ink">
                        <span className="text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-none tracking-[-0.05em] [font-stretch:125%] pb-[0.18em] tabular-nums">
                          {active.pn}
                        </span>
                        <span>
                          <span className="block text-2xl font-bold leading-tight tracking-[-0.02em] [font-stretch:112%] pb-[0.1em]">
                            {active.title}
                          </span>
                          <span className="mt-3 block t-label opacity-70">
                            {active.techStack.slice(0, 3).join(' · ')}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
                <dt className="t-label text-graphite pt-0.5">Name</dt>
                <dd className="font-semibold">{active.title}</dd>
                <dt className="t-label text-graphite pt-0.5">Class</dt>
                <dd>
                  {active.category} · {active.year}
                </dd>
                <dt className="t-label text-graphite pt-0.5">Stack</dt>
                <dd>{active.techStack.join(', ')}</dd>
                {active.metrics.slice(0, 2).map((m) => (
                  <div key={m.label} className="contents">
                    <dt className="t-label text-graphite pt-0.5">{m.label}</dt>
                    <dd>{m.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 pt-5 border-t border-rule text-graphite leading-relaxed">
                {active.description}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
