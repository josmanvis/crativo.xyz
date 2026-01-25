import { getAllPosts, categories } from '@/lib/blog';
import BlogList from '@/components/blog/BlogList';
import { DotGrid } from '@/components/DotGrid';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative">
      <DotGrid opacity={0.08} spacing={60} dotSize={1.5} />
      
      {/* Header */}
      <div className="text-center py-16 relative z-10">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-gray-400 mt-2">
          Thoughts on code, tools, and engineering
        </p>
      </div>

      {/* Blog List with filtering */}
      <div className="relative z-10">
        <BlogList posts={posts} categories={categories} />
      </div>
    </main>
  );
}
