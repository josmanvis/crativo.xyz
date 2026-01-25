import { Metadata } from 'next';
import { DotGrid } from '@/components/DotGrid';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Apps & Tools | Jose Viscasillas',
  description: 'Free CLI tools, npm packages, and developer utilities by Jose Viscasillas. Install via npm, Homebrew, or download directly.',
};

interface App {
  name: string;
  tagline: string;
  description: string;
  icon: string;
  gradient: string;
  platforms: { name: string; command?: string; url?: string }[];
  downloads?: string;
  tags: string[];
  featured?: boolean;
}

const apps: App[] = [
  {
    name: 'pubsafe',
    tagline: 'Pre-publish security scanner',
    description: 'Scans your package for secrets, API keys, and sensitive data before you accidentally publish them to npm. Born from almost leaking my Stripe keys.',
    icon: '🔒',
    gradient: 'from-emerald-500 to-teal-600',
    platforms: [
      { name: 'npm', command: 'npx pubsafe' },
      { name: 'GitHub', url: 'https://github.com/crativo/pubsafe' },
    ],
    downloads: '2,400+',
    tags: ['security', 'npm', 'cli'],
    featured: true,
  },
  {
    name: 'too-bored',
    tagline: 'Project dashboard CLI',
    description: 'Scans your Developer folder, finds all projects, shows git status, package info, and last modified dates. Never lose track of side projects again.',
    icon: '📂',
    gradient: 'from-blue-500 to-cyan-600',
    platforms: [
      { name: 'npm', command: 'npm i -g too-bored' },
      { name: 'GitHub', url: 'https://github.com/crativo/too-bored' },
    ],
    downloads: '8,700+',
    tags: ['cli', 'productivity', 'developer-tools'],
    featured: true,
  },
  {
    name: 'ace',
    tagline: 'AI-powered CLI assistant',
    description: 'Natural language interface for your terminal. Ask it to find files, run commands, or explain code. Built with Claude and local LLM support.',
    icon: '🤖',
    gradient: 'from-orange-500 to-amber-600',
    platforms: [
      { name: 'npm', command: 'npm i -g ace-cli' },
      { name: 'GitHub', url: 'https://github.com/crativo/ace' },
    ],
    downloads: '1,200+',
    tags: ['ai', 'cli', 'productivity'],
    featured: true,
  },
  {
    name: 'zeebra',
    tagline: 'Screen annotation tool',
    description: 'Draw on your screen during presentations, demos, or pair programming. Arrows, shapes, freehand — all with keyboard shortcuts.',
    icon: '✏️',
    gradient: 'from-pink-500 to-rose-600',
    platforms: [
      { name: 'npm', command: 'npm i -g zeebra' },
      { name: 'Homebrew', command: 'brew install zeebra' },
    ],
    downloads: '475+',
    tags: ['productivity', 'presentations', 'macos'],
  },
  {
    name: 'floatnote',
    tagline: 'Floating sticky notes',
    description: 'Minimal floating notes that stay on top of your windows. Perfect for quick reminders during coding sessions.',
    icon: '📝',
    gradient: 'from-yellow-500 to-orange-500',
    platforms: [
      { name: 'npm', command: 'npm i -g floatnote' },
      { name: 'GitHub', url: 'https://github.com/josmanvis/floatnote' },
    ],
    downloads: '340+',
    tags: ['productivity', 'notes', 'macos'],
  },
  {
    name: 'qortr',
    tagline: 'Room booking made simple',
    description: 'Real-time room availability and booking for offices, coworking spaces, and venues. Self-hosted, privacy-first.',
    icon: '🏢',
    gradient: 'from-emerald-500 to-blue-600',
    platforms: [
      { name: 'Web App', url: 'https://qortr.com' },
      { name: 'GitHub', url: 'https://github.com/crativo/qortr' },
    ],
    tags: ['web-app', 'booking', 'self-hosted'],
    featured: true,
  },
  {
    name: 'angine',
    tagline: 'Lightweight search engine',
    description: 'Full-text search powered by Bun and SQLite. Add search to any project in minutes, no external services required.',
    icon: '🔍',
    gradient: 'from-violet-500 to-purple-600',
    platforms: [
      { name: 'npm', command: 'npm i angine' },
      { name: 'GitHub', url: 'https://github.com/crativo/angine' },
    ],
    downloads: '890+',
    tags: ['search', 'database', 'bun'],
  },
];

export default function AppsPage() {
  const featuredApps = apps.filter(app => app.featured);
  const otherApps = apps.filter(app => !app.featured);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative">
      <DotGrid opacity={0.12} spacing={60} dotSize={1.5} />
      
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-yellow-400 text-sm font-medium">🔥 All free & open source</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Apps & Tools
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            CLI tools, npm packages, and developer utilities I&apos;ve built. 
            Install them, break them, fork them — they&apos;re yours.
          </p>
        </div>

        {/* Quick install section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-12">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Install
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-2">Most Popular</p>
              <code className="text-emerald-400 text-sm font-mono">npx pubsafe</code>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-2">Project Scanner</p>
              <code className="text-blue-400 text-sm font-mono">npm i -g too-bored</code>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-2">AI Assistant</p>
              <code className="text-orange-400 text-sm font-mono">npm i -g ace-cli</code>
            </div>
          </div>
        </div>

        {/* Featured Apps */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>⭐</span> Featured
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredApps.map((app) => (
              <div
                key={app.name}
                className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                    {app.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-zinc-400 text-sm">{app.tagline}</p>
                  </div>
                  {app.downloads && (
                    <div className="text-right">
                      <p className="text-white font-semibold">{app.downloads}</p>
                      <p className="text-zinc-500 text-xs">downloads</p>
                    </div>
                  )}
                </div>
                
                <p className="text-zinc-300 text-sm mb-4 leading-relaxed">
                  {app.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {app.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-zinc-800 rounded-md text-xs text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {app.platforms.map((platform) => (
                    platform.command ? (
                      <div key={platform.name} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                        <span className="text-zinc-400 text-xs">{platform.name}:</span>
                        <code className="text-emerald-400 text-xs font-mono">{platform.command}</code>
                      </div>
                    ) : (
                      <a
                        key={platform.name}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 transition-colors"
                      >
                        {platform.name}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Apps */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📦</span> More Tools
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {otherApps.map((app) => (
              <div
                key={app.name}
                className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-lg`}>
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                      {app.name}
                    </h3>
                    {app.downloads && (
                      <p className="text-zinc-500 text-xs">{app.downloads} downloads</p>
                    )}
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-3">{app.tagline}</p>
                <div className="flex gap-2">
                  {app.platforms.slice(0, 2).map((platform) => (
                    platform.url ? (
                      <a
                        key={platform.name}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {platform.name} →
                      </a>
                    ) : (
                      <span key={platform.name} className="text-xs text-zinc-500">
                        {platform.name}
                      </span>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Want to see the code?</h2>
          <p className="text-zinc-400 mb-6">All my projects are open source. Star them, fork them, contribute.</p>
          <a
            href="https://github.com/josmanvis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </section>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Back to portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}
