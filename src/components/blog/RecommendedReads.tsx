import type { BlogPostSummary } from '@/types/blog';
import PostRow from './PostRow';

interface RecommendedReadsProps {
  posts: BlogPostSummary[];
  currentSlug: string;
}

export default function RecommendedReads({ posts, currentSlug }: RecommendedReadsProps) {
  const recommended = posts.filter((p) => p.slug !== currentSlug).slice(0, 3);
  if (recommended.length === 0) return null;

  return (
    <section className="pt-12" data-hud-section="Related entries">
      <div className="relative flex items-center justify-between pb-3 t-label text-graphite">
        <span>Related entries</span>
        <span>{recommended.length}</span>
        <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
      </div>
      <ol>
        {recommended.map((post) => (
          <PostRow key={post.slug} post={post} showExcerpt={false} />
        ))}
      </ol>
    </section>
  );
}
