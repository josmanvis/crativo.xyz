import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { categories } from '@/data/projects';
import { getIndexProjects } from '@/lib/catalogue';
import { getPostSummaries } from '@/lib/blog';
import ProjectIndex from '@/components/projects/ProjectIndex';
import SectionHeader from '@/components/ui/SectionHeader';
import PostRow from '@/components/blog/PostRow';

const FIRST_LINE_OF_CODE = 2005;

export default function Home() {
  const projects = getIndexProjects();
  const posts = getPostSummaries();
  const years = new Date().getFullYear() - FIRST_LINE_OF_CODE;
  const revision = new Date().toISOString().slice(0, 7).replace('-', '.');

  const specs: { label: string; value: React.ReactNode; hud: string }[] = [
    { label: 'Operator', value: 'Jose Viscasillas', hud: 'Operator · Jose Viscasillas · Charlotte, NC' },
    { label: 'Role', value: 'Senior Software Engineer, ON24', hud: 'Currently · video platform features at ON24' },
    {
      label: 'In service',
      value: (
        <>
          <span data-reveal="count" data-reveal-load data-count={years} data-delay="0.1">
            {years}
          </span>{' '}
          years
        </>
      ),
      hud: `First line of code at 13 · ${years} years ago`,
    },
    {
      label: 'Catalogue',
      value: (
        <>
          <span data-reveal="count" data-reveal-load data-count={projects.length} data-delay="0.2">
            {projects.length}
          </span>{' '}
          instruments
        </>
      ),
      hud: `${projects.length} projects · apps, libraries, tools, kiosks`,
    },
    {
      label: 'Log',
      value: (
        <>
          <span data-reveal="count" data-reveal-load data-count={posts.length} data-delay="0.3">
            {posts.length}
          </span>{' '}
          entries
        </>
      ),
      hud: `${posts.length} posts · deep dives, tutorials, hot takes`,
    },
  ];

  return (
    <main>
      {/* ── Masthead ─────────────────────────────────────────────── */}
      <section
        data-hud-section="§ 00 — Masthead"
        className="shell flex flex-col min-h-[calc(100dvh-var(--nav-h)-var(--hud-h))] pt-5 md:pt-8 pb-10"
      >
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 pb-3 t-label text-graphite">
          <span>Personal instrument catalogue</span>
          <span className="text-right md:text-left">Doc. JV-{years}</span>
          <span className="hidden md:block">Rev. {revision}</span>
          <span className="hidden md:block text-right">Charlotte, NC — 35.23°N</span>
          <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
        </div>

        <p
          aria-hidden="true"
          data-reveal="wordmark"
          data-reveal-load
          className="t-wordmark mt-6 md:mt-4 -ml-[0.04em] select-none whitespace-nowrap"
        >
          {'crativo'.split('').map((ch, i) => (
            <span key={i} data-letter className="inline-block">
              {ch}
            </span>
          ))}
        </p>

        <div className="mt-auto grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-10 pt-10">
          <div className="lg:col-span-7">
            <h1 data-reveal="mask" data-reveal-load data-delay="0.35" className="t-title !text-[clamp(2.25rem,4.4vw,4.25rem)] max-w-[19ch]">
              I build instruments that make hidden state{' '}
              <span className="text-signal-ink">visible.</span>
              <span className="sr-only"> — Jose Viscasillas, senior software engineer.</span>
            </h1>
            <div data-reveal="up" data-reveal-load data-delay="0.45" className="mt-8 flex flex-wrap gap-3">
              <a href="#index" className="btn" data-variant="solid" data-hud="Jump to § 01 — Index">
                View the index <ArrowDown size={16} strokeWidth={1.5} />
              </a>
              <Link href="/blog" className="btn" data-hud="Open the writing log">
                Read the log <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          <dl data-reveal="up" data-reveal-load data-delay="0.3" className="lg:col-span-5 lg:col-start-8 self-end border-t border-ink">
            {specs.map((s) => (
              <div
                key={s.label}
                data-hud={s.hud}
                className="grid grid-cols-[7.5rem_1fr] gap-4 py-2.5 border-b border-rule-strong"
              >
                <dt className="t-label text-graphite pt-[3px]">{s.label}</dt>
                <dd className="tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── § 01 Index ───────────────────────────────────────────── */}
      <section id="index" className="shell pt-20 md:pt-28 scroll-mt-[var(--nav-h)]">
        <SectionHeader
          number="01"
          label="Index"
          title="The catalogue."
          meta={`${projects.length} entries`}
          className="mb-10 md:mb-14"
        />
        <ProjectIndex projects={projects} categories={categories} />
      </section>

      {/* ── § 02 Writing ─────────────────────────────────────────── */}
      <section className="shell pt-28 md:pt-40">
        <SectionHeader
          number="02"
          label="Writing"
          title="Field notes."
          meta={`${posts.length} entries`}
          className="mb-6 md:mb-10"
        />
        <ol>
          {posts.slice(0, 6).map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </ol>
        <div className="mt-8">
          <Link href="/blog" className="btn" data-hud={`Open the full log · ${posts.length} entries`}>
            All {posts.length} entries <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* ── § 03 Contact ─────────────────────────────────────────── */}
      <section className="shell pt-28 md:pt-40" data-hud-section="§ 03 — Contact">
        <div className="relative pb-3 t-label text-graphite flex justify-between">
          <span>§ 03 — Contact</span>
          <span>Reply ≈ 24h</span>
          <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
        </div>
        <Link
          href="/contact"
          data-hud="Open a channel · email, SMS, calendar"
          className="group mt-8 flex items-end justify-between gap-6"
        >
          <span data-reveal="mask" className="block t-display max-w-[12ch]">
            Got a hidden-state problem?
          </span>
          <span className="shrink-0 mb-[0.6em] flex items-center justify-center w-14 h-14 md:w-20 md:h-20 border border-ink group-hover:bg-ink group-hover:text-paper transition-colors duration-150">
            <ArrowUpRight size={28} strokeWidth={1.5} className="arrow-nudge" />
          </span>
        </Link>
      </section>
    </main>
  );
}
