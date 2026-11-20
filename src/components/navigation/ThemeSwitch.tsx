'use client';

import { useSyncExternalStore } from 'react';

const KEY = 'crativo-theme';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const isNight = () => document.documentElement.dataset.theme === 'night';

/** Two-position toggle: PAPER / NIGHT. The thumb is a detented ink block. */
export default function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  // The boot script sets data-theme before paint; the server always renders paper.
  const night = useSyncExternalStore(subscribe, isNight, () => false);

  const toggle = () => {
    const next = night ? 'paper' : 'night';
    if (next === 'night') document.documentElement.dataset.theme = 'night';
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // storage unavailable — the choice just won't persist
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={night}
      aria-label="Night mode"
      onClick={toggle}
      data-hud={night ? 'Display: night · switch to paper' : 'Display: paper · switch to night'}
      className="group t-label flex items-center gap-2 h-11 md:h-9"
    >
      {!compact && <span className="text-graphite">Paper</span>}
      <span className="relative block w-9 h-[18px] border border-ink">
        <span
          className="absolute top-[2px] left-[2px] w-[14px] h-[12px] bg-ink transition-transform duration-200 ease-[var(--ease-primary)]"
          style={{ transform: night ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </span>
      {!compact && <span className="text-graphite">Night</span>}
    </button>
  );
}
