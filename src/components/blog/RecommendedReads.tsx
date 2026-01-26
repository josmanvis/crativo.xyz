import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { formatDate, getCategoryGradient } from '@/lib/blog-utils';

interface RecommendedReadsProps {
  posts: BlogPost[];
  currentSlug: string;
}

export default function RecommendedReads({ posts, currentSlug }: RecommendedReadsProps) {
  // Filter out current post and limit to 3
  const recommended = posts
    .filter(p => p.slug !== currentSlug)
    .slice(0, 3);

  if (recommended.length === 0) return null;

  return (
    <section className="py-8 border-t border-white/10">
      <h2 className="text-xl font-semibold text-white mb-6">
        Recommended Reads
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommended.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-zinc-900/50 hover:bg-zinc-800/50 rounded-xl p-4 transition-all duration-300 border border-white/5 hover:border-white/10"
          >
            {/* Category badge */}
            <div className="mb-3">
              <span 
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryGradient(post.category)} text-white/90`}
              >
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{formatDate(post.publishedAt)}</span>
              <span>·</span>
              <span>{post.readingTime} min read</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
