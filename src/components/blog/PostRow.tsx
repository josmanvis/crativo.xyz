import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { BlogPostSummary } from '@/types/blog';
import { categoryName, formatDateCompact } from '@/lib/blog-utils';

/** One entry in the writing log. Works in server and client trees. */
export default function PostRow({ post, showExcerpt = true }: { post: BlogPostSummary; showExcerpt?: boolean }) {
  const no = `No. ${String(post.number).padStart(3, '0')}`;
  const category = categoryName(post.category);
  return (
    <li className="relative">
      <Link
        href={`/blog/${post.slug}`}
        data-hud={`${no} · ${category} · ${post.readingTime} min · ${post.title}`}
        className="group grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[5.5rem_6.5rem_minmax(0,1fr)_8rem_4rem_1.5rem] items-baseline gap-x-4 gap-y-1 py-5 md:py-6 hover:bg-paper-2 transition-colors duration-150 ease-[var(--ease-primary)]"
      >
        <span className="t-label text-graphite md:pl-1 col-start-1 row-start-1">
          {no}
          <span className="md:hidden"> · {formatDateCompact(post.publishedAt)}</span>
        </span>
        <span className="hidden md:block t-label text-graphite">{formatDateCompact(post.publishedAt)}</span>
        <span className="min-w-0 col-span-2 md:col-span-1">
          <span className="block text-[clamp(1.25rem,2vw,1.75rem)] font-bold leading-[1.12] tracking-[-0.02em] [font-stretch:108%] pb-[0.06em] transition-transform duration-200 ease-[var(--ease-primary)] group-hover:translate-x-1.5">
            {post.title}
          </span>
          {showExcerpt && post.excerpt && (
            <span className="mt-2 block text-graphite text-[15px] leading-snug line-clamp-2 max-w-[70ch]">
              {post.excerpt}
            </span>
          )}
        </span>
        <span className="hidden md:block t-label">{category}</span>
        <span className="t-label text-right col-start-2 row-start-1 md:col-auto md:row-auto">
          {post.readingTime} min
        </span>
        <span className="hidden md:flex justify-end text-graphite group-hover:text-ink">
          <ArrowRight size={18} strokeWidth={1.5} className="arrow-nudge" />
        </span>
      </Link>
      <span
        aria-hidden="true"
        data-reveal="rule"
        className="absolute inset-x-0 bottom-0 h-px bg-rule-strong"
      />
    </li>
  );
}
