'use client';

import { useEffect, useState } from 'react';

interface DotGridProps {
  className?: string;
  opacity?: number;
  spacing?: number;
  dotSize?: number;
  color?: string;
  animate?: boolean;
}

export function DotGrid({
  className = '',
  opacity = 0.15,
  spacing = 60,
  dotSize = 1.5,
  color = 'white',
  animate = false,
}: DotGridProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const cols = Math.ceil(dimensions.width / spacing) + 1;
  const rows = Math.ceil(dimensions.height / spacing) + 1;

  const dots: React.ReactNode[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={col * spacing + spacing / 2}
          cy={row * spacing + spacing / 2}
          r={dotSize}
          fill={color}
          className={animate ? 'animate-pulse-subtle' : ''}
          style={animate ? { animationDelay: `${(row + col) * 50}ms` } : {}}
        />
      );
    }
  }

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      style={{ opacity }}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-full"
      >
        {dots}
      </svg>
    </div>
  );
}

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
