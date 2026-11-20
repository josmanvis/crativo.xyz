'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ensureGsap, gsap, EASE } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/hud';
import { useLenisInstance } from './SmoothScroll';

const NO_TRANSITION_PREFIXES = ['/api', '/admin', '/feed.xml'];

/**
 * Ink shutter page transition.
 * Internal link click → shutter wipes up and covers → router.push →
 * pathname changes → shutter exits through the top.
 * Back/forward and reduced motion skip it entirely.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenisInstance();
  const panel = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const covering = useRef(false);
  const safety = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Intercept internal navigations.
  useEffect(() => {
    ensureGsap();

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        prefersReducedMotion() ||
        covering.current
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!anchor || !anchor.href) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download') || anchor.dataset.noTransition !== undefined) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (NO_TRANSITION_PREFIXES.some((p) => url.pathname.startsWith(p))) return;
      if (url.pathname === window.location.pathname) return; // hash / same page

      event.preventDefault();
      event.stopPropagation();

      const node = panel.current;
      if (!node) {
        router.push(url.pathname + url.search + url.hash);
        return;
      }

      covering.current = true;
      lenis?.stop();
      if (label.current) label.current.textContent = url.pathname;

      gsap.killTweensOf(node);
      gsap.set(node, { visibility: 'visible', clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.to(node, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.32,
        ease: EASE.transition,
        onComplete: () => {
          router.push(url.pathname + url.search + url.hash, { scroll: false });
          // Never leave the user stuck behind the shutter.
          clearTimeout(safety.current);
          safety.current = setTimeout(reveal, 4000);
        },
      });
    };

    const reveal = () => {
      const node = panel.current;
      clearTimeout(safety.current);
      if (!node || !covering.current) return;
      covering.current = false;
      lenis?.start();
      gsap.to(node, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.42,
        delay: 0.05,
        ease: EASE.transition,
        onComplete: () => {
          gsap.set(node, { visibility: 'hidden' });
        },
      });
    };

    revealRef.current = reveal;
    // Capture phase so we run before Next's <Link> handler.
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      clearTimeout(safety.current);
    };
  }, [router, lenis]);

  const revealRef = useRef<() => void>(() => {});

  // New route rendered → reset scroll and lift the shutter.
  useEffect(() => {
    if (!covering.current) return;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.start();
    } else {
      window.scrollTo(0, 0);
    }
    requestAnimationFrame(() => revealRef.current());
  }, [pathname, lenis]);

  return (
    <div
      ref={panel}
      aria-hidden="true"
      className="fixed inset-0 z-[100] bg-ink text-paper flex items-end"
      style={{ visibility: 'hidden', clipPath: 'inset(100% 0% 0% 0%)' }}
    >
      <div className="shell pb-[calc(var(--hud-h)+24px)] flex items-center gap-3 t-label">
        <span className="led" data-on="true" />
        <span>Loading</span>
        <span ref={label} className="opacity-70" />
      </div>
    </div>
  );
}
