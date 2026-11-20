import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Videos',
  description: 'Video tutorials, walkthroughs, and dev content. Coming soon.',
};

export default function VideosPage() {
  return (
    <main className="shell pt-10 md:pt-16">
      <div className="relative flex items-center justify-between gap-4 pb-3 t-label text-graphite">
        <span>§ 06 — Broadcast</span>
        <span className="flex items-center gap-2">
          <span className="led" data-on="false" /> Off air
        </span>
        <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
      </div>
      <h1 data-reveal="mask" data-reveal-load className="t-display mt-8 md:mt-12 max-w-[10ch]">
        Filming in progress.
      </h1>
      <p data-reveal="up" data-reveal-load data-delay="0.1" className="t-lede text-graphite mt-8 max-w-[46ch]">
        Tutorials, project walkthroughs and the occasional rant about CSS. Until then, the writing
        log is where the work lives.
      </p>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bezel aspect-video flex items-end justify-between p-3 t-label text-screen-ink/50">
            <span>CH-{String(i).padStart(2, '0')}</span>
            <span>No signal</span>
          </div>
        ))}
      </div>
      <Link href="/blog" className="btn mt-12" data-variant="solid">
        Read the log instead <ArrowRight size={16} strokeWidth={1.5} />
      </Link>
    </main>
  );
}
