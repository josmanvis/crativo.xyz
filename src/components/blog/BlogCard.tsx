import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { formatDate, blogCategories } from '@/lib/blog-utils';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const category = blogCategories.find((c) => c.slug === post.category);
  const gradient = category?.gradient ?? 'from-gray-500/30 to-gray-600/20';

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/10 transition-all duration-200 group-hover:scale-[1.03] group-hover:ring-white/30 group-hover:shadow-lg group-hover:shadow-white/5">
        {/* Gradient header */}
        <div
          className={`h-40 bg-gradient-to-br ${gradient} flex items-end p-4`}
        >
          <span className="text-xs text-white/60 font-medium">
            {formatDate(post.publishedAt)}
          </span>
        </div>

        {/* Card content */}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-semibold text-white">{post.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-white/10 text-gray-300 rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Meta info */}
          <div className="flex gap-4 pt-1">
            <div className="text-xs">
              <span className="text-gray-500">Category</span>{' '}
              <span className="text-white font-medium">{category?.name}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Read</span>{' '}
              <span className="text-white font-medium">
                {post.readingTime} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
