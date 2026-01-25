import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getAllSlugs } from '@/lib/blog';
import BlogHero from '@/components/blog/BlogHero';
import MarkdownContent from '@/components/blog/MarkdownContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} | crativo Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero */}
        <BlogHero post={post} />

        {/* Content */}
        <section className="py-12">
          <MarkdownContent content={post.content} />
        </section>

        {/* Footer with navigation */}
        <section className="py-12 border-t border-white/10">
          <div className="flex justify-between items-center">
            <a
              href="/blog"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              &larr; All Posts
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
