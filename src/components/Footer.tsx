import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const index = [
  { href: '/', label: 'Work' },
  { href: '/apps', label: 'Tools' },
  { href: '/blog', label: 'Writing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const elsewhere = [
  { href: 'https://github.com/josmanvis', label: 'GitHub' },
  { href: 'https://www.npmjs.com/~vivalavisca', label: 'npm' },
  { href: 'https://linkedin.com/in/joseviscasillas', label: 'LinkedIn' },
  { href: '/feed.xml', label: 'RSS feed' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-32 border-t border-rule-strong bg-paper">
      <div className="shell grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10 py-14">
        <div className="col-span-2 md:col-span-6">
          <p className="t-label text-graphite mb-4">§ End of document</p>
          <p className="t-h2 max-w-[14ch]">Built by hand, documented in public.</p>
          <a
            href="mailto:viscasillas@me.com"
            className="group mt-8 inline-flex items-center gap-2 text-lg link-ink"
            data-hud="mailto · viscasillas@me.com"
          >
            viscasillas@me.com
            <ArrowUpRight size={18} strokeWidth={1.5} className="arrow-nudge" />
          </a>
        </div>

        <nav aria-label="Footer" className="md:col-span-2">
          <p className="t-label text-graphite mb-4">Index</p>
          <ul className="space-y-2">
            {index.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-signal-ink transition-colors duration-150">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <p className="t-label text-graphite mb-4">Elsewhere</p>
          <ul className="space-y-2">
            {elsewhere.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 hover:text-signal-ink transition-colors duration-150"
                >
                  {item.label}
                  <ArrowUpRight size={14} strokeWidth={1.5} className="arrow-nudge" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-2">
          <p className="t-label text-graphite mb-4">Colophon</p>
          <p className="text-sm text-graphite leading-relaxed">
            Set in Archivo and JetBrains Mono. Built with Next.js, GSAP and Lenis. Deployed on
            Vercel.
          </p>
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-4 t-label text-graphite">
          <span>© {year} crativo.xyz</span>
          <span>Doc. JV-21 · Rev. {year}</span>
          <a href="#top" className="hover:text-ink" data-hud="Return to top of document">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
