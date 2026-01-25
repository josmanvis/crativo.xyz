import { BlogPost, BlogCategory } from '@/types/blog';

export const blogCategories: BlogCategory[] = [
  {
    slug: 'tutorials',
    name: 'Tutorials',
    gradient: 'from-blue-500/30 to-cyan-500/20',
  },
  {
    slug: 'deep-dives',
    name: 'Deep Dives',
    gradient: 'from-purple-500/30 to-pink-500/20',
  },
  {
    slug: 'tools',
    name: 'Tools & Tips',
    gradient: 'from-green-500/30 to-emerald-500/20',
  },
  {
    slug: 'career',
    name: 'Career',
    gradient: 'from-orange-500/30 to-yellow-500/20',
  },
  {
    slug: 'thoughts',
    name: 'Thoughts',
    gradient: 'from-indigo-500/30 to-violet-500/20',
  },
];

export const categories = [
  'All',
  ...blogCategories.map((c) => c.name),
] as const;

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getCategoryGradient(categoryName: string): string {
  const category = blogCategories.find((c) => c.name === categoryName);
  return category?.gradient ?? 'from-gray-500/30 to-gray-600/20';
}

export function filterPostsByCategory(
  posts: BlogPost[],
  category: string
): BlogPost[] {
  if (category === 'All') return posts;
  const categorySlug = blogCategories.find((c) => c.name === category)?.slug;
  return posts.filter((p) => p.category === categorySlug);
}
