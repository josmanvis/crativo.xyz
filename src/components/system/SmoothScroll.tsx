'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { ensureGsap, gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/hud';

const LenisContext = createContext<Lenis | null>(null);

export function useLenisInstance() {
  return useContext(LenisContext);
}

/**
 * Lenis smooths *wheel* input only. Touch scrolling stays fully native
 * (syncTouch: false), and reduced-motion users get plain browser scrolling.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    ensureGsap();
    if (prefersReducedMotion()) return;

    const instance = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.12,
      anchors: { offset: -80 },
    });

    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // The instance only exists client-side after mount; publishing it to
    // context from here is the intended sync with an external system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
