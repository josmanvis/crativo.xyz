import { getAllPosts, categories } from '@/lib/blog';
import BlogList from '@/components/blog/BlogList';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-gray-400 mt-2">
          Thoughts on code, tools, and engineering
        </p>
      </div>

      {/* Blog List with filtering */}
      <BlogList posts={posts} categories={categories} />
    </main>
  );
}
