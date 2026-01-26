'use client';

import { useEffect, useRef } from 'react';

type AdVariant = 'inline' | 'sidebar' | 'banner';

interface AdUnitProps {
  variant?: AdVariant;
  className?: string;
}

declare global {
  interface Window {
    ezstandalone?: {
      cmd: Array<() => void>;
      showAds: (...ids: number[]) => void;
    };
  }
}

// Map variants to Ezoic placeholder IDs
// Configure these in your Ezoic dashboard: https://pubdash.ezoic.com/ezoicads/adpositions/placeholders
const PLACEHOLDER_IDS: Record<AdVariant, number> = {
  inline: 101,   // Top of article content
  banner: 102,   // Between sections
  sidebar: 103,  // Sidebar widget
};

export default function AdUnit({
  variant = 'inline',
  className = ''
}: AdUnitProps) {
  const hasShown = useRef(false);
  const placeholderId = PLACEHOLDER_IDS[variant];

  useEffect(() => {
    if (hasShown.current) return;
    
    // Check if Ezoic is loaded and ready
    if (typeof window !== 'undefined' && window.ezstandalone?.cmd) {
      window.ezstandalone.cmd.push(() => {
        window.ezstandalone?.showAds(placeholderId);
      });
      hasShown.current = true;
    }
  }, [placeholderId]);

  return (
    <aside
      className={className}
      aria-label="Advertisement"
    >
      {/* Ezoic Ad Placeholder - DO NOT add styling to this div */}
      <div id={`ezoic-pub-ad-placeholder-${placeholderId}`} />
    </aside>
  );
}
