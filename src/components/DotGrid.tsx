'use client';

import { memo } from 'react';

interface DotGridProps {
  className?: string;
  opacity?: number;
  spacing?: number;
  dotSize?: number;
  color?: string;
  animate?: boolean;
}

// Use SVG pattern for efficient rendering instead of individual circles
export const DotGrid = memo(function DotGrid({
  className = '',
  opacity = 0.15,
  spacing = 60,
  dotSize = 1.5,
  color = 'white',
}: DotGridProps) {
  const patternId = `dot-grid-pattern-${spacing}-${dotSize}`;
  
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      style={{ opacity }}
    >
      <svg
        width="100%"
        height="100%"
        className="w-full h-full"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={dotSize}
              fill={color}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
});

// Variant for sections (not full-page fixed)
export function DotGridSection({
  className = '',
  opacity = 0.1,
  spacing = 50,
  dotSize = 1,
  color = 'currentColor',
}: DotGridProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg width="100%" height="100%" className="w-full h-full">
        <defs>
          <pattern
            id="dot-pattern"
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={spacing / 2} cy={spacing / 2} r={dotSize} fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-pattern)" />
      </svg>
    </div>
  );
}
