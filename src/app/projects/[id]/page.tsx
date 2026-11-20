import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight, GitBranch, Package, Globe } from 'lucide-react';
import { projects } from '@/data/projects';
import { partNumberFor } from '@/lib/catalogue';
import type { Project, ProjectLink } from '@/types/project';
import AppStoreGallery from '@/components/AppStoreGallery';
import ProjectDescription from '@/components/ProjectDescription';
import CodeSnippet from '@/components/CodeSnippet';
import DisqusComments from '@/components/DisqusComments';
import ProtectedProjectContent from '@/components/ProtectedProjectContent';
import SectionHeader from '@/components/ui/SectionHeader';
import { AdUnit } from '@/components/ads';

const DEFAULT_PROTECTED_PASSWORD = process.env.PROTECTED_CONTENT_PASSWORD || 'crativo2026';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) return { title: 'Project Not Found' };
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `https://crativo.xyz/projects/${project.id}` },
  };
}

function LinkIcon({ link }: { link: ProjectLink }) {
  const label = link.label.toLowerCase();
  if (label.includes('github') || link.url.includes('github.com')) return <GitBranch size={16} strokeWidth={1.5} />;
  if (label.includes('npm') || link.url.includes('npmjs.com')) return <Package size={16} strokeWidth={1.5} />;
  return <Globe size={16} strokeWidth={1.5} />;
}

/** "8,700+" → 8700 with suffix "+", so the reading can tick up. */
function parseReading(value: string): { n: number; prefix: string; suffix: string } | null {
  const m = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!m) return null;
  const n = Number(m[2].replace(/,/g, ''));
  if (!Number.isFinite(n) || m[2].includes('.') || n > 100000) return null;
  return { n, prefix: m[1], suffix: m[3] };
}

function ProjectBody({ project }: { project: Project }) {
  let section = 1;
  const next = () => String(++section).padStart(2, '0');

  return (
    <>
      {project.previews && project.previews.length > 0 && (
        <AppStoreGallery previews={project.previews} title={project.title} />
      )}

      {project.features && project.features.length > 0 && (
        <section className="pt-24 md:pt-32">
          <SectionHeader number={next()} label="Features" title="What it does." className="mb-10" />
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
            {project.features.map((feature, i) => (
              <li
                key={feature.title}
                data-reveal="up"
                data-hud={`F-${String(i + 1).padStart(2, '0')} · ${feature.title}`}
                className="border-t border-ink pt-4 pb-10"
              >
                <p className="t-label text-graphite mb-3">F-{String(i + 1).padStart(2, '0')}</p>
                <h3 className="text-xl font-bold tracking-[-0.015em] [font-stretch:108%] mb-2">
                  {feature.title}
                </h3>
                <p className="text-graphite leading-relaxed">{feature.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="pt-24 md:pt-32">
        <SectionHeader number={next()} label="Notes" title="How it works." className="mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6">
          <div className="lg:col-span-8 lg:col-start-3">
            <ProjectDescription description={project.longDescription} />
          </div>
        </div>
      </section>

      <div className="py-8">
        <AdUnit variant="inline" />
      </div>

      {project.metrics.length > 0 && (
        <section className="pt-16 md:pt-24">
          <SectionHeader number={next()} label="Readings" title="By the numbers." className="mb-10" />
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6">
            {project.metrics.map((metric) => {
              const reading = parseReading(metric.value);
              return (
                <div key={metric.label} className="border-t border-ink pt-4 pb-10" data-hud={`${metric.label} · ${metric.value}`}>
                  <dt className="t-label text-graphite mb-3">{metric.label}</dt>
                  <dd className="text-[clamp(2rem,5vw,4rem)] font-extrabold leading-none tracking-[-0.04em] [font-stretch:125%] pb-[0.18em] tabular-nums">
                    {reading ? (
                      <>
                        {reading.prefix}
                        <span data-reveal="count" data-count={reading.n}>
                          {reading.n.toLocaleString('en-US')}
                        </span>
                        {reading.suffix}
                      </>
                    ) : (
                      metric.value
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      )}

      {project.codeSnippet && (
        <section className="pt-16 md:pt-24">
          <SectionHeader number={next()} label="Under the hood" title="A piece of the source." className="mb-10" />
          <div data-reveal="screen">
            <CodeSnippet snippet={project.codeSnippet} />
          </div>
        </section>
      )}

      <section className="pt-24">
        <DisqusComments identifier={`project-${project.id}`} title={project.title} />
      </section>
    </>
  );
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) notFound();
  const project = projects[index];
  const pn = partNumberFor(project.id);
  const nextProject = projects[(index + 1) % projects.length];
  const hasImage = project.imageUrl && !project.imageUrl.includes('placeholder');

  return (
    <main className="shell pt-6 md:pt-10">
      {/* Header row */}
      <div className="relative flex items-center justify-between gap-4 pb-3 t-label text-graphite">
        <Link href="/#index" className="group flex items-center gap-2 hover:text-ink" data-hud="Back to the index">
          <ArrowLeft size={14} strokeWidth={1.5} /> Index
        </Link>
        <span className="flex items-center gap-2">
          <span className="led" data-on="true" />
          {pn} · {project.category} · {project.year}
        </span>
        <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
      </div>

      <h1
        data-reveal="mask"
        data-reveal-load
        data-hud-section={`${pn} — ${project.title}`}
        className="t-display mt-8 md:mt-12 break-words"
      >
        {project.title}
      </h1>

      <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-10">
        <div className="lg:col-span-7" data-reveal="up" data-reveal-load data-delay="0.1">
          <p className="t-lede max-w-[46ch]">{project.description}</p>
          {project.links && project.links.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.links.map((link, i) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  data-variant={i === 0 ? 'solid' : undefined}
                  data-hud={`External · ${link.url.replace(/^https?:\/\//, '')}`}
                >
                  <LinkIcon link={link} />
                  {link.label}
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          )}
        </div>

        <dl
          data-reveal="up"
          data-reveal-load
          data-delay="0.2"
          className="lg:col-span-4 lg:col-start-9 border-t border-ink self-start"
        >
          {[
            ['Part', pn],
            ['Class', project.category],
            ['Year', String(project.year)],
            ['Stack', project.techStack.join(', ')],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[6rem_1fr] gap-4 py-2.5 border-b border-rule-strong">
              <dt className="t-label text-graphite pt-[3px]">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {hasImage && (
        <figure className="mt-14 md:mt-20">
          <div data-reveal="screen" data-reveal-load data-delay="0.15" className="bezel">
            <div className="flex items-center justify-between px-3 h-8 border-b border-white/10 t-label text-screen-ink/70">
              <span className="flex items-center gap-2">
                <span className="led" data-on="true" />
                Fig. 1
              </span>
              <span>{project.title}</span>
            </div>
            <div className="relative aspect-[4/3] md:aspect-[16/8]">
              <Image
                src={project.imageUrl}
                alt={`${project.title} cover illustration`}
                fill
                sizes="(min-width: 1440px) 1376px, 100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </figure>
      )}

      {project.protected ? (
        <ProtectedProjectContent
          projectId={project.id}
          password={project.password || DEFAULT_PROTECTED_PASSWORD}
          title={project.title}
        >
          <ProjectBody project={project} />
        </ProtectedProjectContent>
      ) : (
        <ProjectBody project={project} />
      )}

      {/* Next instrument */}
      <nav aria-label="Next project" className="mt-24 border-t border-ink">
        <Link
          href={nextProject.href.startsWith('/') ? nextProject.href : `/projects/${nextProject.id}`}
          className="group flex items-end justify-between gap-6 pt-4 pb-2"
          data-hud={`Next · ${partNumberFor(nextProject.id)} · ${nextProject.title}`}
        >
          <span>
            <span className="t-label text-graphite block mb-4">
              Next instrument — {partNumberFor(nextProject.id)}
            </span>
            <span className="block t-title">{nextProject.title}</span>
          </span>
          <ArrowRight size={36} strokeWidth={1.25} className="arrow-nudge mb-[0.5em] shrink-0" />
        </Link>
      </nav>
    </main>
  );
}
