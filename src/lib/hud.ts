/**
 * Tiny external store behind the Status Overlay HUD (the site's signature
 * interaction). Anything can push a readout; the HUD subscribes with
 * useSyncExternalStore.
 *
 * Most callers never touch this directly: put `data-hud="..."` on an element
 * (pointer/focus readout) or `data-hud-section="..."` on a section (scroll
 * readout) and the HUD picks it up.
 */

export interface HudState {
  /** What the pointer or keyboard focus is resting on. Highest priority. */
  readout: string;
  /** The section currently in focus while scrolling. */
  section: string;
  /** A transient system message, e.g. "TX … SENT". */
  flash: string;
}

let state: HudState = { readout: '', section: '', flash: '' };
const listeners = new Set<() => void>();
let flashTimer: ReturnType<typeof setTimeout> | undefined;

function emit() {
  for (const listener of listeners) listener();
}

export const hud = {
  get: (): HudState => state,
  getServer: (): HudState => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  set(partial: Partial<HudState>) {
    const next = { ...state, ...partial };
    if (
      next.readout === state.readout &&
      next.section === state.section &&
      next.flash === state.flash
    ) {
      return;
    }
    state = next;
    emit();
  },
  /** Show a system message for a few seconds, then fall back. */
  flash(message: string, ms = 3200) {
    clearTimeout(flashTimer);
    hud.set({ flash: message });
    flashTimer = setTimeout(() => hud.set({ flash: '' }), ms);
  },
  reset() {
    clearTimeout(flashTimer);
    state = { readout: '', section: '', flash: '' };
    emit();
  },
};

/** Catalogue numbers: P-07, No. 089. */
export function partNumber(prefix: string, n: number, width = 2) {
  return `${prefix}${String(n).padStart(width, '0')}`;
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
