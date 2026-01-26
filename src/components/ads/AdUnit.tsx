'use client';

import { useEffect, useState } from 'react';

type AdVariant = 'inline' | 'sidebar' | 'banner';
type AdProvider = 'carbon' | 'ethical' | 'placeholder';

interface AdUnitProps {
  variant?: AdVariant;
  provider?: AdProvider;
  className?: string;
}

// Placeholder ad content for demo purposes
const placeholderAds = [
  {
    image: 'https://placehold.co/130x100/1a1a1a/3b82f6?text=Raycast',
    title: 'Raycast Pro',
    description: 'Your shortcut to everything. Supercharge your workflow with AI-powered tools.',
    link: '#',
    sponsor: 'Raycast',
  },
  {
    image: 'https://placehold.co/130x100/1a1a1a/10b981?text=Linear',
    title: 'Linear',
    description: 'The issue tracking tool you\'ll enjoy using. Built for high-performance teams.',
    link: '#',
    sponsor: 'Linear',
  },
  {
    image: 'https://placehold.co/130x100/1a1a1a/f59e0b?text=Vercel',
    title: 'Vercel',
    description: 'Deploy your frontend instantly. The platform for frontend developers.',
    link: '#',
    sponsor: 'Vercel',
  },
  {
    image: 'https://placehold.co/130x100/1a1a1a/8b5cf6?text=Arc',
    title: 'Arc Browser',
    description: 'The browser that organizes everything for you. Browse beautifully.',
    link: '#',
    sponsor: 'The Browser Company',
  },
];

export default function AdUnit({
  variant = 'inline',
  provider = 'placeholder',
  className = ''
}: AdUnitProps) {
  const [ad, setAd] = useState(placeholderAds[0]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Randomly select a placeholder ad
    const randomAd = placeholderAds[Math.floor(Math.random() * placeholderAds.length)];
    setAd(randomAd);

    // Fade in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Carbon Ads style - inline variant (most common)
  if (variant === 'inline') {
    return (
      <aside
        className={`
          transition-opacity duration-500
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        aria-label="Advertisement"
      >
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 max-w-sm mx-auto">
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex gap-4 group"
          >
            {/* Ad Image */}
            <div className="flex-shrink-0">
              <img
                src={ad.image}
                alt={ad.title}
                className="w-[130px] h-[100px] rounded-lg object-cover bg-zinc-800"
                loading="lazy"
              />
            </div>

            {/* Ad Content */}
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
                {ad.title}
              </span>
              <span className="text-zinc-400 text-xs mt-1 line-clamp-2">
                {ad.description}
              </span>
            </div>
          </a>

          {/* Attribution */}
          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-600 text-[10px] uppercase tracking-wider">
              ads via Carbon
            </span>
            <span className="text-zinc-600 text-[10px]">
              {ad.sponsor}
            </span>
          </div>
        </div>
      </aside>
    );
  }

  // Sidebar variant (300x250 style)
  if (variant === 'sidebar') {
    return (
      <aside
        className={`
          transition-opacity duration-500
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        aria-label="Advertisement"
      >
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 w-[300px]">
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block group"
          >
            {/* Ad Image - larger for sidebar */}
            <div className="mb-3">
              <img
                src={`https://placehold.co/268x150/1a1a1a/3b82f6?text=${ad.title.replace(/\s/g, '+')}`}
                alt={ad.title}
                className="w-full h-[150px] rounded-lg object-cover bg-zinc-800"
                loading="lazy"
              />
            </div>

            {/* Ad Content */}
            <div>
              <span className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors block">
                {ad.title}
              </span>
              <span className="text-zinc-400 text-xs mt-1 block line-clamp-2">
                {ad.description}
              </span>
            </div>
          </a>

          {/* Attribution */}
          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-600 text-[10px] uppercase tracking-wider">
              ads via Carbon
            </span>
            <span className="text-zinc-600 text-[10px]">
              {ad.sponsor}
            </span>
          </div>
        </div>
      </aside>
    );
  }

  // Banner variant (728x90 style for blog listings)
  if (variant === 'banner') {
    return (
      <aside
        className={`
          transition-opacity duration-500
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        aria-label="Advertisement"
      >
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center gap-4 group"
          >
            {/* Ad Image */}
            <div className="flex-shrink-0">
              <img
                src={ad.image}
                alt={ad.title}
                className="w-[100px] h-[75px] rounded-lg object-cover bg-zinc-800"
                loading="lazy"
              />
            </div>

            {/* Ad Content */}
            <div className="flex-1 min-w-0">
              <span className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                {ad.title}
              </span>
              <span className="text-zinc-400 text-xs mt-0.5 block">
                {ad.description}
              </span>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 hidden sm:block">
              <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Learn more
              </span>
            </div>
          </a>

          {/* Attribution */}
          <div className="mt-2 flex items-center justify-end">
            <span className="text-zinc-600 text-[10px] uppercase tracking-wider">
              ads via Carbon
            </span>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
