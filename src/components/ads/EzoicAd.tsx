'use client';

import { useEffect, useRef } from 'react';

interface EzoicAdProps {
  placeholderId: number;
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

export default function EzoicAd({ placeholderId, className = '' }: EzoicAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;
    
    if (window.ezstandalone?.cmd) {
      window.ezstandalone.cmd.push(() => {
        window.ezstandalone?.showAds(placeholderId);
      });
      hasShown.current = true;
    }
  }, [placeholderId]);

  return (
    <div
      ref={adRef}
      id={`ezoic-pub-ad-placeholder-${placeholderId}`}
      className={className}
    />
  );
}
