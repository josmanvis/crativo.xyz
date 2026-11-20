'use client';

import { useMemo, useState } from 'react';
import type { BlogPostSummary } from '@/types/blog';
import Selector from '@/components/ui/Selector';
import PostRow from './PostRow';
import { blogCategories, filterPostsByCategory } from '@/lib/blog-utils';

interface BlogListProps {
  posts: BlogPostSummary[];
  categories: readonly string[];
}

export default function BlogList({ posts, categories }: BlogListProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = useMemo(
    () => filterPostsByCategory(posts, activeCategory),
    [posts, activeCategory]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: posts.length };
    for (const cat of blogCategories) {
      c[cat.name] = posts.filter((p) => p.category === cat.slug).length;
    }
    return c;
  }, [posts]);

  // Hide empty categories so every option does something.
  const options = categories.filter((c) => c === 'All' || (counts[c] ?? 0) > 0);

  return (
    <>
      <div className="mb-6">
        <Selector
          label="Filter posts by category"
          options={options}
          value={activeCategory}
          onChange={setActiveCategory}
          counts={counts}
        />
      </div>

      <div className="hidden md:grid grid-cols-[5.5rem_6.5rem_minmax(0,1fr)_8rem_4rem_1.5rem] gap-4 pb-3 border-b border-ink t-label text-graphite">
        <span>No.</span>
        <span>Date</span>
        <span>Title</span>
        <span>Class</span>
        <span className="text-right">Read</span>
        <span />
      </div>
      <ol>
        {filteredPosts.map((post) => (
          <PostRow key={post.slug} post={post} />
        ))}
      </ol>
    </>
  );
}
