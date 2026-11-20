'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ensureGsap, gsap, ScrollTrigger, EASE } from '@/lib/gsap';

/**
 * One place that reads the reveal vocabulary from the DOM (data-reveal="…",
 * see docs/animation-map.md) and builds every tween for the current route
 * inside a single gsap.context, reverted on navigation.
 *
 * Only transform, opacity and clip-path are animated. Reduced motion skips
 * everything: content is simply there.
 */
export default function MotionDirector() {
  const pathname = usePathname();

  useEffect(() => {
    ensureGsap();
    const mm = gsap.matchMedia();

    // Let the new route paint before measuring.
    const raf = requestAnimationFrame(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const all = <T extends Element = HTMLElement>(sel: string) =>
          gsap.utils.toArray<T>(sel);

        const isLoad = (el: Element) => el.hasAttribute('data-reveal-load');
        const delayOf = (el: Element) => Number((el as HTMLElement).dataset.delay || 0);

        // Mark load elements as owned by GSAP so the CSS fail-safe stands down.
        all('[data-reveal-load]').forEach((el) => {
          el.setAttribute('data-armed', '');
          gsap.set(el, { opacity: 1 });
        });

        /* ---- wordmark: condensed type opens, letters power on ---- */
        all('[data-reveal="wordmark"]').forEach((el) => {
          const letters = el.querySelectorAll('[data-letter]');
          const tl = gsap.timeline({ delay: 0.1 + delayOf(el) });
          tl.fromTo(
            el,
            { scaleX: 0.58, transformOrigin: '0% 50%' },
            { scaleX: 1, duration: 1.15, ease: EASE.reveal },
            0
          ).fromTo(
            letters,
            { opacity: 0 },
            { opacity: 1, duration: 0.01, stagger: { each: 0.055, from: 'start' } },
            0
          );
        });

        /* ---- mask: text rises out of its rule ---- */
        const masks = all('[data-reveal="mask"]');
        masks.forEach((el) => {
          const tween = {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            duration: 0.9,
            ease: EASE.reveal,
            delay: delayOf(el),
          };
          gsap.set(el, { clipPath: 'inset(0% 0% 100% 0%)', y: '0.25em' });
          if (isLoad(el)) {
            gsap.to(el, { ...tween, delay: 0.2 + delayOf(el) });
          } else {
            gsap.to(el, {
              ...tween,
              scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            });
          }
        });

        /* ---- up: blocks settle into a detent ---- */
        const ups = all('[data-reveal="up"]');
        ups.filter(isLoad).forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7, ease: EASE.reveal, delay: 0.3 + delayOf(el) }
          );
        });
        const scrollUps = ups.filter((el) => !isLoad(el));
        gsap.set(scrollUps, { opacity: 0, y: 16 });
        ScrollTrigger.batch(scrollUps, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: EASE.reveal,
              stagger: 0.06,
            }),
        });

        /* ---- rule: hairlines draw left to right, structure before content ---- */
        const rules = all('[data-reveal="rule"]');
        gsap.set(rules, { scaleX: 0, transformOrigin: '0% 50%' });
        ScrollTrigger.batch(rules, {
          start: 'top 96%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              scaleX: 1,
              duration: 0.9,
              ease: EASE.reveal,
              stagger: 0.035,
            }),
        });

        /* ---- count: integers tick like a 7-segment display ---- */
        all('[data-reveal="count"]').forEach((el) => {
          const target = Number(el.dataset.count);
          if (!Number.isFinite(target)) return;
          const suffix = el.dataset.suffix ?? '';
          const pad = Number(el.dataset.pad || 0);
          const fmt = (n: number) => String(Math.round(n)).padStart(pad, '0') + suffix;
          const counter = { v: 0 };
          const steps = Math.min(Math.max(target, 1), 24);
          el.textContent = fmt(0);
          gsap.to(counter, {
            v: target,
            duration: 0.9,
            ease: `steps(${steps})`,
            delay: isLoad(el) ? 0.5 + delayOf(el) : delayOf(el),
            onUpdate: () => {
              el.textContent = fmt(counter.v);
            },
            scrollTrigger: isLoad(el) ? undefined : { trigger: el, start: 'top 95%', once: true },
          });
        });

        /* ---- meter: segments light one at a time ---- */
        all('[data-reveal="meter"]').forEach((el) => {
          const lit = el.querySelectorAll('[data-on="true"]');
          gsap.fromTo(
            lit,
            { opacity: 0.15 },
            {
              opacity: 1,
              duration: 0.01,
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: 'top 95%', once: true },
            }
          );
        });

        /* ---- screen: display bezels wipe on like a CRT ---- */
        all('[data-reveal="screen"]').forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: 'inset(49.5% 0% 49.5% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 0.8,
              ease: EASE.reveal,
              delay: isLoad(el) ? 0.35 + delayOf(el) : 0,
              scrollTrigger: isLoad(el) ? undefined : { trigger: el, start: 'top 88%', once: true },
            }
          );
        });

        // Images and fonts shift layout after first paint.
        const refresh = () => ScrollTrigger.refresh();
        document.fonts?.ready.then(refresh);
        window.addEventListener('load', refresh, { once: true });
        return () => window.removeEventListener('load', refresh);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      mm.revert();
    };
  }, [pathname]);

  return null;
}
