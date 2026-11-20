import type { ReactNode } from 'react';

interface SectionHeaderProps {
  number: string;
  label: string;
  title: ReactNode;
  meta?: ReactNode;
  as?: 'h1' | 'h2';
  load?: boolean;
  className?: string;
}

/** `§ 01 — INDEX ........ 18 ENTRIES` over a drawn hairline, then the title. */
export default function SectionHeader({
  number,
  label,
  title,
  meta,
  as: Tag = 'h2',
  load = false,
  className = '',
}: SectionHeaderProps) {
  const loadProps = load ? { 'data-reveal-load': '' } : {};
  return (
    <header className={className} data-hud-section={`§ ${number} — ${label}`}>
      <div className="relative flex items-center justify-between gap-4 pb-3 t-label text-graphite">
        <span>
          § {number} — {label}
        </span>
        {meta && <span className="text-right">{meta}</span>}
        <span
          aria-hidden="true"
          data-reveal="rule"
          className="absolute inset-x-0 bottom-0 h-px bg-ink"
        />
      </div>
      <Tag
        data-reveal="mask"
        {...loadProps}
        className={`${Tag === 'h1' ? 't-display' : 't-h2'} mt-6 md:mt-8`}
      >
        {title}
      </Tag>
    </header>
  );
}
