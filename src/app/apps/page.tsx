import { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import CopyCommand from '@/components/ui/CopyCommand';

export const metadata: Metadata = {
  title: 'Apps & Tools | Jose Viscasillas',
  description: 'Free CLI tools, npm packages, and developer utilities by Jose Viscasillas. Install via npm, Homebrew, or download directly.',
};

interface App {
  name: string;
  tagline: string;
  description: string;
  platforms: { name: string; command?: string; url?: string }[];
  downloads?: string;
  tags: string[];
  featured?: boolean;
}

const apps: App[] = [
  {
    name: 'pubsafe',
    tagline: 'Pre-publish security scanner',
    description: 'CLI tool to check if sensitive files in your coding projects are properly gitignored. Scans your package for secrets, API keys, and sensitive data before you accidentally publish them to npm.',
    platforms: [
      { name: 'npm', command: 'npx pubsafe' },
      { name: 'GitHub', url: 'https://github.com/crativo/pubsafe' },
    ],
    downloads: '2,400+',
    tags: ['security', 'npm', 'cli'],
    featured: true,
  },
  {
    name: 'projax',
    tagline: 'Project dashboard CLI',
    description: 'Cross-platform project management dashboard for managing local development projects across different tech stacks. See what\'s running, what has uncommitted changes, and what port each thing is using.',
    platforms: [
      { name: 'npm', command: 'npm i -g projax' },
      { name: 'GitHub', url: 'https://github.com/crativo/projax' },
    ],
    downloads: '8,700+',
    tags: ['cli', 'productivity', 'developer-tools'],
    featured: true,
  },
  {
    name: 'ace',
    tagline: 'React scaffolding CLI',
    description: 'Node.js-based CLI for bootstrapping React applications and quickly scaffolding views and components. Generate components, views, and entire project structures with consistent patterns.',
    platforms: [
      { name: 'npm', command: 'npm i -g @crativo/ace' },
      { name: 'GitHub', url: 'https://github.com/crativo/ace' },
    ],
    downloads: '1,200+',
    tags: ['scaffolding', 'cli', 'react'],
    featured: true,
  },
  {
    name: 'qortr',
    tagline: 'Room booking made simple',
    description: 'Modern room booking platform for businesses with instant booking, team management, and smart analytics. Real-time availability and seamless booking experience.',
    platforms: [
      { name: 'Web App', url: 'https://qortr.com' },
      { name: 'GitHub', url: 'https://github.com/crativo/qortr' },
    ],
    tags: ['web-app', 'booking', 'self-hosted'],
    featured: true,
  },
  {
    name: 'floatnote',
    tagline: 'Screen annotation overlay',
    description: 'Transparent always-on-top drawing and note-taking overlay for macOS with annotation tools. Draw on your screen during presentations, demos, or pair programming with arrows, shapes, and text.',
    platforms: [
      { name: 'npm', command: 'npm i -g floatnote' },
      { name: 'GitHub', url: 'https://github.com/josmanvis/floatnote' },
    ],
    downloads: '340+',
    tags: ['productivity', 'presentations', 'macos'],
  },
  {
    name: 'zeebra',
    tagline: 'Z-index management library',
    description: 'Performant z-index management library with virtual z-stack recycling for complex UI layering. No more z-index: 99999 problems - just ask for a layer and trust the system.',
    platforms: [
      { name: 'npm', command: 'npm i zeebra' },
      { name: 'GitHub', url: 'https://github.com/crativo/zeebra' },
    ],
    downloads: '475+',
    tags: ['react', 'ui', 'typescript'],
  },
  {
    name: 'too-bored',
    tagline: 'Virtual keyboard component',
    description: 'Configurable React.js virtual keyboard component used in retail kiosk applications. Fat fingers first design with visual feedback and accessible layouts.',
    platforms: [
      { name: 'npm', command: 'npm i too-bored' },
      { name: 'GitHub', url: 'https://github.com/crativo/too-bored' },
    ],
    downloads: '890+',
    tags: ['react', 'ui', 'accessibility'],
  },
];

function AppEntry({ app, index }: { app: App; index: number }) {
  const command = app.platforms.find((p) => p.command)?.command;
  const links = app.platforms.filter((p) => p.url);
  return (
    <li
      data-reveal="up"
      data-hud={`T-${String(index + 1).padStart(2, '0')} · ${app.name} · ${app.tagline}${app.downloads ? ` · ${app.downloads} downloads` : ''}`}
      className="border-t border-ink pt-4 pb-12 flex flex-col"
    >
      <div className="flex items-baseline justify-between gap-4 t-label text-graphite">
        <span>T-{String(index + 1).padStart(2, '0')}</span>
        {app.downloads && <span>{app.downloads} downloads</span>}
      </div>
      <h3 className="mt-5 text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-none tracking-[-0.035em] [font-stretch:120%] pb-[0.15em]">
        {app.name}
      </h3>
      <p className="t-label mt-2">{app.tagline}</p>
      <p className="text-graphite mt-4 leading-relaxed max-w-[52ch]">{app.description}</p>
      <div className="mt-auto pt-6 space-y-3">
        {command && <CopyCommand command={command} />}
        <div className="flex flex-wrap gap-x-5 gap-y-2 t-label">
          {links.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 hover:text-signal-ink"
            >
              {p.name}
              <ArrowUpRight size={14} strokeWidth={1.5} className="arrow-nudge" />
            </a>
          ))}
          {app.tags.map((tag) => (
            <span key={tag} className="text-graphite">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}

export default function AppsPage() {
  return (
    <main className="shell pt-10 md:pt-16">
      <SectionHeader
        as="h1"
        load
        number="05"
        label="Tools"
        title="Install-ready."
        meta={`${apps.length} entries · all free`}
        className="mb-6"
      />
      <p data-reveal="up" data-reveal-load className="t-lede text-graphite max-w-[52ch] mb-16">
        CLI tools, npm packages and developer utilities. Install them, break them, fork them —
        they&apos;re yours.
      </p>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6">
        {apps.map((app, i) => (
          <AppEntry key={app.name} app={app} index={i} />
        ))}
      </ul>

      <section className="mt-16 border border-ink p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="t-label text-graphite mb-4">Source</p>
          <p className="t-h2 max-w-[16ch]">Everything here is open source.</p>
        </div>
        <a
          href="https://github.com/josmanvis"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          data-variant="solid"
        >
          View on GitHub <ArrowUpRight size={16} strokeWidth={1.5} />
        </a>
      </section>
    </main>
  );
}
