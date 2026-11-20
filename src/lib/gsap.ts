'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

/** Project easings — see docs/animation-map.md. Names are usable as `ease: EASE.reveal`. */
export const EASE = {
  primary: 'crativo-primary',
  reveal: 'crativo-reveal',
  transition: 'crativo-transition',
} as const;

let registered = false;

export function ensureGsap() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create(EASE.primary, '0.2,0,0,1');
  CustomEase.create(EASE.reveal, '0.16,1,0.3,1');
  CustomEase.create(EASE.transition, '0.76,0,0.24,1');
  registered = true;
}

export { gsap, ScrollTrigger };
