'use client';

import { useRef, useState } from 'react';
import { ProjectPreview } from '@/types/project';
import Image from 'next/image';

interface AppStoreGalleryProps {
  previews: ProjectPreview[];
  title: string;
}

export default function AppStoreGallery({ previews, title }: AppStoreGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    const newScrollLeft = direction === 'left' 
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;
    
    scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = 380;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(newIndex, previews.length - 1));
  };

  if (!previews || previews.length === 0) return null;

  return (
    <section className="py-12 border-t border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Preview</h2>
        
        {previews.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
              disabled={activeIndex === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
              disabled={activeIndex >= previews.length - 1}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable gallery */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {previews.map((preview, index) => (
          <div
            key={index}
            className="flex-shrink-0 snap-center"
            style={{ width: '360px' }}
          >
            <div className="relative aspect-[9/16] sm:aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
              {preview.type === 'screenshot' && (
                <Image
                  src={preview.src}
                  alt={preview.alt}
                  fill
                  className="object-cover"
                />
              )}
              {preview.type === 'demo' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <Image
                    src={preview.src}
                    alt={preview.alt}
                    fill
                    className="object-contain p-4"
                  />
                </div>
              )}
              
              {/* Reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            
            {preview.caption && (
              <p className="mt-3 text-sm text-gray-400 text-center px-2">
                {preview.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {previews.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {previews.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!scrollRef.current) return;
                scrollRef.current.scrollTo({ left: index * 380, behavior: 'smooth' });
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
