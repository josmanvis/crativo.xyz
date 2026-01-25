'use client';

import { useState, useMemo } from 'react';
import { BlogPost } from '@/types/blog';
import BlogGrid from './BlogGrid';
import CategoryFilter from '@/components/CategoryFilter';
import { filterPostsByCategory } from '@/lib/blog-utils';

interface BlogListProps {
  posts: BlogPost[];
  categories: readonly string[];
}

export default function BlogList({ posts, categories }: BlogListProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = useMemo(() => {
    return filterPostsByCategory(posts, activeCategory);
  }, [posts, activeCategory]);

  return (
    <>
      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        active={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Blog Grid */}
      <div className="py-8">
        <BlogGrid posts={filteredPosts} />
      </div>
    </>
  );
}
