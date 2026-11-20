'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ProjectPreview } from '@/types/project';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface AppStoreGalleryProps {
  previews: ProjectPreview[];
  title: string;
}

export default function AppStoreGallery({ previews, title }: AppStoreGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goToPrev = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  }, [lightboxIndex]);

  const goToNext = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex < previews.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  }, [lightboxIndex, previews.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, goToPrev, goToNext]);

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

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="pt-20 md:pt-28" data-hud-section={`Plates — ${title}`}>
      <div className="relative flex items-center justify-between gap-4 pb-3 mb-8 t-label text-graphite">
        <span>Plates — {previews.length} figures</span>
        {previews.length > 1 && (
          <div className="flex gap-px bg-ink border border-ink">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Previous figure"
              className="w-10 h-9 grid place-items-center bg-paper text-ink hover:bg-paper-2 disabled:opacity-40"
              disabled={activeIndex === 0}
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Next figure"
              className="w-10 h-9 grid place-items-center bg-paper text-ink hover:bg-paper-2 disabled:opacity-40"
              disabled={activeIndex >= previews.length - 1}
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
        <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
      >
        {previews.map((preview, index) => (
          <figure key={index} className="shrink-0 snap-start w-[85vw] sm:w-[360px]">
            <button
              type="button"
              onClick={() => openLightbox(index)}
              data-hud={`Fig. ${pad(index + 1)} · ${preview.caption || preview.alt} · click to enlarge`}
              className="group bezel relative block w-full aspect-video overflow-hidden cursor-zoom-in"
            >
              <Image
                src={preview.src}
                alt={preview.alt}
                fill
                sizes="(min-width: 640px) 360px, 85vw"
                className={`${preview.type === 'demo' ? 'object-contain p-4' : 'object-cover'} transition-transform duration-500 ease-[var(--ease-reveal)] group-hover:scale-[1.03]`}
              />
              <span className="absolute right-2 bottom-2 w-8 h-8 grid place-items-center bg-paper text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <ZoomIn size={16} strokeWidth={1.5} />
              </span>
            </button>
            <figcaption className="mt-3 flex gap-3 text-sm text-graphite">
              <span className="t-label pt-[3px] text-ink">Fig. {pad(index + 1)}</span>
              <span>{preview.caption || preview.alt}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — figure ${lightboxIndex + 1} of ${previews.length}`}
          className="fixed inset-0 z-[120] bg-screen/95 text-screen-ink flex items-center justify-center"
          onClick={closeLightbox}
          data-lenis-prevent
        >
          <div className="absolute top-0 inset-x-0 h-12 flex items-center justify-between px-[var(--gutter)] t-label border-b border-white/10">
            <span>
              Fig. {pad(lightboxIndex + 1)} / {pad(previews.length)}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close"
              className="flex items-center gap-2 h-9 px-3 border border-white/30 hover:bg-white hover:text-black"
            >
              <X size={16} strokeWidth={1.5} /> Close
            </button>
          </div>

          {lightboxIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              aria-label="Previous figure"
              className="absolute left-[var(--gutter)] z-10 w-11 h-11 grid place-items-center border border-white/30 hover:bg-white hover:text-black"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
          )}
          {lightboxIndex < previews.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              aria-label="Next figure"
              className="absolute right-[var(--gutter)] z-10 w-11 h-11 grid place-items-center border border-white/30 hover:bg-white hover:text-black"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          )}

          <div
            className="relative w-[84vw] h-[76dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={previews[lightboxIndex].src}
              alt={previews[lightboxIndex].alt}
              fill
              className="object-contain"
              sizes="84vw"
              priority
            />
          </div>

          {previews[lightboxIndex].caption && (
            <p className="absolute bottom-[calc(var(--hud-h)+16px)] inset-x-0 text-center t-label opacity-80">
              {previews[lightboxIndex].caption}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
