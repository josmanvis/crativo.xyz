'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { aboutDataHuman, aboutDataHR } from '@/data/about';
import ModeToggle from '@/components/about/ModeToggle';
import SkillsGrid from '@/components/about/SkillsGrid';
import Timeline from '@/components/about/Timeline';
import { ensureGsap, gsap, EASE } from '@/lib/gsap';
import { hud, prefersReducedMotion } from '@/lib/hud';

const FIRST_LINE_OF_CODE = 2005;

export default function AboutPageContent() {
  const [isHRMode, setIsHRMode] = useState(false);
  const aboutData = isHRMode ? aboutDataHR : aboutDataHuman;
  const body = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const years = new Date().getFullYear() - FIRST_LINE_OF_CODE;

  // Switching readers redraws the document like a display changing source.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    hud.flash(isHRMode ? 'Reader switched · HR mode engaged' : 'Reader switched · human mode');
    const node = body.current;
    if (!node || prefersReducedMotion()) return;
    ensureGsap();
    gsap.fromTo(
      node,
      { clipPath: 'inset(0% 0% 100% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: EASE.reveal, overwrite: true }
    );
  }, [isHRMode]);

  const specs = [
    ['Location', 'Charlotte, NC'],
    ['In service', `${years} years — since age 13`],
    ['Currently', 'Senior Software Engineer, ON24'],
    ['Previously', 'Innovation Lab, Retail Business Services'],
    ['Published', 'too-bored, gappa-comments, ace, + more'],
  ];

  return (
    <main className="shell pt-10 md:pt-16">
      <div className="relative flex items-center justify-between gap-4 pb-3 t-label text-graphite">
        <span>§ 03 — Operator manual</span>
        <span>{isHRMode ? 'Rev. HR' : 'Rev. Human'}</span>
        <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
      </div>

      <div className="mt-8 md:mt-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <h1
          data-reveal="mask"
          data-reveal-load
          data-hud-section="§ 03 — Operator"
          className="t-display max-w-[11ch]"
        >
          {aboutData.bio.name}
        </h1>
        <div data-reveal="up" data-reveal-load data-delay="0.2" className="shrink-0 lg:mb-[0.4em]">
          <ModeToggle isHRMode={isHRMode} onToggle={() => setIsHRMode((v) => !v)} />
        </div>
      </div>

      <div ref={body}>
        <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-12">
          <dl className="lg:col-span-4 border-t border-ink self-start" data-reveal="up" data-reveal-load data-delay="0.25">
            {specs.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[6.5rem_1fr] gap-4 py-2.5 border-b border-rule-strong">
                <dt className="t-label text-graphite pt-[3px]">{label}</dt>
                <dd className="text-[15px]">{value}</dd>
              </div>
            ))}
            <div className="pt-6">
              <Link href="/contact" className="btn" data-variant="solid">
                Open a channel <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
            </div>
          </dl>

          <div className="lg:col-span-7 lg:col-start-6">
            <p className="t-lede mb-10 pl-4 border-l-2 border-signal" data-reveal="up" data-reveal-load data-delay="0.3">
              {aboutData.bio.tagline}
            </p>
            <div className="space-y-5 text-[18px] leading-[1.7] max-w-[64ch]">
              {aboutData.bio.description.map((paragraph, i) => (
                <p key={i} data-reveal="up">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <SkillsGrid skills={aboutData.skills} isHRMode={isHRMode} />
        <Timeline events={aboutData.timeline} isHRMode={isHRMode} />
      </div>
    </main>
  );
}
