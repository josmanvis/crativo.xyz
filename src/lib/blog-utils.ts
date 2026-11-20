import { BlogPost, BlogCategory } from '@/types/blog';

export const blogCategories: BlogCategory[] = [
  { slug: 'deep-dives', name: 'Deep Dives' },
  { slug: 'tutorials', name: 'Tutorials' },
  { slug: 'devtools', name: 'DevTools' },
  { slug: 'thoughts', name: 'Thoughts' },
  { slug: 'tools', name: 'Tools & Tips' },
  { slug: 'career', name: 'Career' },
];

export const categories = ['All', ...blogCategories.map((c) => c.name)] as const;

/** Human name for a category slug; unknown slugs are title-cased. */
export function categoryName(slug: string): string {
  return (
    blogCategories.find((c) => c.slug === slug)?.name ??
    slug.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
  );
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** 2026.09.08 — datasheet-style date. */
export function formatDateCompact(dateString: string): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}.${mm}.${dd}`;
}

export function filterPostsByCategory<T extends Pick<BlogPost, 'category'>>(
  posts: T[],
  category: string
): T[] {
  if (category === 'All') return posts;
  const categorySlug = blogCategories.find((c) => c.name === category)?.slug;
  return posts.filter((p) => p.category === categorySlug);
}

/** Strip inline markdown so headings read cleanly in the TOC and HUD. */
export function plainHeading(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_]/g, '')
    .trim();
}

export function headingId(text: string): string {
  return plainHeading(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 64);
}

/** `## ` headings outside fenced code, in order. */
export function extractHeadings(markdown: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) inFence = !inFence;
    else if (!inFence && line.startsWith('## ')) {
      const text = plainHeading(line.slice(3));
      out.push({ id: headingId(text), text });
    }
  }
  return out;
}
