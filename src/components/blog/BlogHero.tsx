import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { formatDate, blogCategories } from '@/lib/blog-utils';

interface BlogHeroProps {
  post: BlogPost;
}

export default function BlogHero({ post }: BlogHeroProps) {
  const category = blogCategories.find((c) => c.slug === post.category);
  const gradient = category?.gradient ?? 'from-gray-500/30 to-gray-600/20';

  return (
    <div className="relative">
      {/* Gradient banner */}
      <div
        className={`h-64 bg-gradient-to-br ${gradient} flex flex-col justify-between p-6 rounded-xl`}
      >
        {/* Back button */}
        <Link
          href="/blog"
          className="text-gray-400 hover:text-white transition-colors text-sm w-fit"
        >
          &larr; Back to Blog
        </Link>

        {/* Title and meta */}
        <div>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm text-white/70">{category?.name}</span>
            <span className="text-sm text-white/50">·</span>
            <span className="text-sm text-white/70">
              {formatDate(post.publishedAt)}
            </span>
            <span className="text-sm text-white/50">·</span>
            <span className="text-sm text-white/70">
              {post.readingTime} min read
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white">{post.title}</h1>
          <p className="text-gray-300 mt-2 max-w-2xl">{post.excerpt}</p>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex gap-2 mt-4">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-sm bg-white/10 text-gray-300 rounded-full px-3 py-1"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
