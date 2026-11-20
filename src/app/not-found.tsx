import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="shell pt-10 md:pt-16 min-h-[calc(100dvh-var(--nav-h)-var(--hud-h))]">
      <div className="relative flex items-center justify-between gap-4 pb-3 t-label text-graphite">
        <span>Error E-404</span>
        <span className="flex items-center gap-2">
          <span className="led" data-on="true" /> Signal lost
        </span>
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
      </div>
      <h1 data-reveal="mask" data-reveal-load data-hud-section="E-404 — Signal lost" className="t-display mt-8 md:mt-12 max-w-[11ch]">
        Nothing at this address.
      </h1>
      <p data-reveal="up" data-reveal-load data-delay="0.1" className="t-lede text-graphite mt-8 max-w-[44ch]">
        The page moved, was retired, or never existed. The index still works.
      </p>
      <div data-reveal="up" data-reveal-load data-delay="0.2" className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn" data-variant="solid">
          Back to the index <ArrowRight size={16} strokeWidth={1.5} />
        </Link>
        <Link href="/blog" className="btn">
          Read the log
        </Link>
      </div>
    </main>
  );
}
