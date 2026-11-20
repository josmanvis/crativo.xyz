'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ThemeSwitch from './ThemeSwitch';
import { ensureGsap, gsap, EASE } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/hud';

const navItems = [
  { href: '/', label: 'Work', match: ['/', '/projects'], hud: 'Project index · apps, libraries, tools, kiosks' },
  { href: '/apps', label: 'Tools', match: ['/apps'], hud: 'Install-ready CLIs and packages' },
  { href: '/blog', label: 'Writing', match: ['/blog'], hud: 'Field notes, deep dives, hot takes' },
  { href: '/about', label: 'About', match: ['/about'], hud: 'Operator: Jose Viscasillas' },
  { href: '/contact', label: 'Contact', match: ['/contact'], hud: 'Open a channel' },
];

function isActive(pathname: string, match: string[]) {
  return match.some((m) => (m === '/' ? pathname === '/' : pathname.startsWith(m)));
}

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);

  // Close the sheet on navigation (adjust state during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const node = sheet.current;
    if (!node) return;
    ensureGsap();
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (prefersReducedMotion()) {
      gsap.set(node, { clipPath: open ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' });
      return;
    }
    gsap.to(node, {
      clipPath: open ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
      duration: open ? 0.5 : 0.35,
      ease: EASE.transition,
    });
    if (open) {
      gsap.fromTo(
        node.querySelectorAll('[data-sheet-item]'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: EASE.reveal, stagger: 0.05, delay: 0.15 }
      );
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[70] h-[var(--nav-h)] bg-paper/92 backdrop-blur-[2px] border-b border-rule-strong">
        <nav aria-label="Main" className="shell h-full flex items-center justify-between gap-6">
          <Link
            href="/"
            className="group flex items-baseline gap-2"
            aria-label="crativo.xyz home"
            data-hud="crativo.xyz · personal instrument catalogue · rev. 2026"
          >
            <span className="text-[22px] font-extrabold tracking-[-0.04em] leading-none [font-stretch:125%]">
              crativo
            </span>
            <span className="t-label text-graphite hidden sm:inline">/ Jose Viscasillas</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, i) => {
              const active = isActive(pathname, item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  data-hud={item.hud}
                  className={`t-label flex items-center gap-2 h-9 px-3 transition-[color,background-color] duration-150 ease-[var(--ease-primary)] ${
                    active ? 'text-ink' : 'text-graphite hover:text-ink hover:bg-paper-2'
                  }`}
                >
                  <span className="led" data-on={active ? 'true' : 'false'} />
                  <span className="text-graphite">{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </Link>
              );
            })}
            <span className="w-px h-5 bg-rule-strong mx-3" aria-hidden="true" />
            <ThemeSwitch />
          </div>

          <div className="flex md:hidden items-center gap-3">
            <ThemeSwitch compact />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="nav-sheet"
              className="t-label flex items-center gap-2 h-11 px-3 border border-ink active:scale-[0.97] transition-transform duration-100"
            >
              {open ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      <div
        id="nav-sheet"
        ref={sheet}
        aria-hidden={!open}
        inert={!open}
        className="md:hidden fixed inset-0 z-[65] bg-ink text-paper pt-[var(--nav-h)] pb-[var(--hud-h)]"
        style={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      >
        <ul className="shell h-full flex flex-col justify-center gap-1">
          {navItems.map((item, i) => {
            const active = isActive(pathname, item.match);
            return (
              <li key={item.href} data-sheet-item className="border-b border-paper/15">
                <Link
                  href={item.href}
                  className="flex items-baseline justify-between py-4"
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="text-[13vw] leading-[0.95] font-extrabold tracking-[-0.045em] [font-stretch:125%] pb-[0.12em]">
                    {item.label}
                  </span>
                  <span className="t-label flex items-center gap-2 opacity-70">
                    <span className="led" data-on={active ? 'true' : 'false'} />
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
