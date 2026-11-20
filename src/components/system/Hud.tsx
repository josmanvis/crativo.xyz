'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { hud, prefersReducedMotion } from '@/lib/hud';

function modeFor(pathname: string): string {
  if (pathname === '/') return 'Index';
  if (pathname.startsWith('/projects/')) return 'Spec sheet';
  if (pathname.startsWith('/projects')) return 'Catalogue';
  if (pathname.startsWith('/blog/')) return 'Reading';
  if (pathname.startsWith('/blog')) return 'Writing';
  if (pathname.startsWith('/apps')) return 'Tools';
  if (pathname.startsWith('/about')) return 'Operator';
  if (pathname.startsWith('/contact')) return 'Transmit';
  if (pathname.startsWith('/videos')) return 'Broadcast';
  return 'Standby';
}

const GLYPHS = '▖▘▝▗▚▞█';

/** Characters tick in left-to-right in discrete steps, like a segment display. */
function useTicker(text: string) {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (prefersReducedMotion() || !text) {
      setShown(text);
      return;
    }
    const steps = 8;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const cut = Math.ceil((text.length * step) / steps);
      const noise = step < steps ? GLYPHS[step % GLYPHS.length] : '';
      setShown(text.slice(0, cut) + noise);
      if (step >= steps) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text]);
  return shown;
}

/**
 * The Status Overlay — crativo's signature interaction. A fixed monospace
 * strip that reports what you're pointing at, where you are, and how far
 * you've read, the way Jose's FLX2 overlay reports a DJ controller's hidden
 * pad mode.
 */
export default function Hud() {
  const pathname = usePathname();
  const state = useSyncExternalStore(hud.subscribe, hud.get, hud.getServer);
  const [progress, setProgress] = useState(0);
  const [clock, setClock] = useState('');
  const progressRef = useRef(0);

  // Reset per route.
  useEffect(() => {
    hud.reset();
  }, [pathname]);

  // Pointer + keyboard focus readouts via [data-hud].
  useEffect(() => {
    const read = (target: EventTarget | null) =>
      (target as Element | null)?.closest?.<HTMLElement>('[data-hud]')?.dataset.hud ?? '';
    const onOver = (e: Event) => hud.set({ readout: read(e.target) });
    const onLeaveDoc = () => hud.set({ readout: '' });
    document.addEventListener('pointerover', onOver);
    document.addEventListener('focusin', onOver);
    document.documentElement.addEventListener('pointerleave', onLeaveDoc);
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('focusin', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeaveDoc);
    };
  }, []);

  // Section readouts via [data-hud-section] — works on touch, no hover needed.
  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    const raf = requestAnimationFrame(() => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-hud-section]')
      );
      if (!sections.length) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              hud.set({ section: (entry.target as HTMLElement).dataset.hudSection ?? '' });
            }
          }
        },
        // A thin band 35% down the viewport: whatever crosses it is "in focus".
        { rootMargin: '-35% 0px -64% 0px' }
      );
      sections.forEach((s) => observer!.observe(s));
    });
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [pathname]);

  // Scroll progress, quantised to whole percent.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      const clamped = Math.min(100, Math.max(0, p));
      if (clamped !== progressRef.current) {
        progressRef.current = clamped;
        setProgress(clamped);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  // Local time where Jose is (Charlotte, NC). Client-only to avoid hydration drift.
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/New_York',
    });
    const update = () => setClock(fmt.format(new Date()));
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, []);

  const live = state.flash || state.readout;
  const text = (state.flash || state.readout || state.section || '—').toUpperCase();
  const shown = useTicker(text);

  return (
    <div
      role="status"
      aria-live="off"
      className="fixed inset-x-0 bottom-0 z-[60] h-[var(--hud-h)] bg-paper-2 border-t border-rule-strong text-ink"
    >
      <div className="shell h-full flex items-center gap-3 md:gap-5 t-label tabular-nums">
        <span className="flex items-center gap-2 shrink-0">
          <span className="led" data-on={live ? 'true' : 'false'} />
          <span className="hidden sm:inline text-graphite">Mode</span>
          <span>{modeFor(pathname)}</span>
        </span>
        <span className="w-px h-3 bg-rule-strong shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate" title={text}>
          {shown}
        </span>
        <span className="shrink-0 flex items-center gap-2">
          <span className="hidden sm:inline text-graphite">Pos</span>
          <span>{String(progress).padStart(3, '0')}%</span>
        </span>
        <span className="hidden md:flex shrink-0 items-center gap-2">
          <span className="text-graphite">CLT</span>
          <span suppressHydrationWarning>{clock || '--:--'}</span>
        </span>
      </div>
      {/* progress hairline */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-[-1px] h-px w-full bg-signal origin-left"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
