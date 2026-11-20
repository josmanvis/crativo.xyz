import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  getPostBySlug,
  getAllSlugs,
  getRelatedPosts,
  getPostSummaries,
  categoryName,
  formatDateCompact,
  extractHeadings,
} from '@/lib/blog';
import MarkdownContent from '@/components/blog/MarkdownContent';
import RecommendedReads from '@/components/blog/RecommendedReads';
import ProtectedBlogContent from '@/components/blog/ProtectedBlogContent';
import NewsletterSignup from '@/components/NewsletterSignup';
import Comments from '@/components/blog/Comments';
import { AdUnit } from '@/components/ads';
import Script from 'next/script';
import type { BlogPostSummary } from '@/types/blog';

const DEFAULT_PROTECTED_PASSWORD = process.env.PROTECTED_CONTENT_PASSWORD || 'crativo2026';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = 'https://crativo.xyz';
const AUTHOR = 'Jose Viscasillas';
const TWITTER_HANDLE = '@crativo';

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  const ogImage = post.coverImage 
    ? `${SITE_URL}${post.coverImage}`
    : `${SITE_URL}/og-image.png`;

  return {
    title: `${post.title} | ${AUTHOR}`,
    description: post.excerpt,
    authors: [{ name: AUTHOR, url: SITE_URL }],
    creator: AUTHOR,
    publisher: AUTHOR,
    keywords: [
      AUTHOR,
      'Jose Viscasillas blog',
      'software engineering',
      'web development',
      ...post.tags,
      post.category,
    ],
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: `${SITE_URL}/blog/${slug}`,
      siteName: 'crativo.xyz',
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      authors: [AUTHOR],
      publishedTime: new Date(post.publishedAt).toISOString(),
      modifiedTime: post.updatedAt 
        ? new Date(post.updatedAt).toISOString() 
        : new Date(post.publishedAt).toISOString(),
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts for recommendations
  const summaries = getPostSummaries();
  const relatedPosts = getRelatedPosts(post, 3)
    .map((r) => summaries.find((s) => s.slug === r.slug))
    .filter((s): s is BlogPostSummary => Boolean(s));
  const headings = extractHeadings(post.content);
  const number = summaries.find((p) => p.slug === slug)?.number ?? 0;
  const no = `No. ${String(number).padStart(3, '0')}`;

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? `${SITE_URL}${post.coverImage}` : `${SITE_URL}/og-image.png`,
    author: {
      '@type': 'Person',
      name: AUTHOR,
      url: SITE_URL,
      sameAs: [
        'https://github.com/josmanvis',
        'https://twitter.com/crativo',
        'https://linkedin.com/in/joseviscasillas',
      ],
    },
    publisher: {
      '@type': 'Person',
      name: AUTHOR,
      url: SITE_URL,
    },
    datePublished: new Date(post.publishedAt).toISOString(),
    dateModified: post.updatedAt 
      ? new Date(post.updatedAt).toISOString() 
      : new Date(post.publishedAt).toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
    keywords: [AUTHOR, ...post.tags].join(', '),
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
    inLanguage: 'en-US',
  };

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${slug}`,
      },
    ],
  };

  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="shell pt-6 md:pt-10">
        {/* Header row */}
        <div className="relative flex items-center justify-between gap-4 pb-3 t-label text-graphite">
          <Link href="/blog" className="flex items-center gap-2 hover:text-ink" data-hud="Back to the log">
            <ArrowLeft size={14} strokeWidth={1.5} /> Log
          </Link>
          <span className="flex items-center gap-2">
            <span className="led" data-on="true" />
            {no} · {categoryName(post.category)}
          </span>
          <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
        </div>

        <header className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 pt-10 md:pt-16" data-hud-section={`${no} — ${post.title}`}>
          <div className="lg:col-span-10">
            <h1 data-reveal="mask" data-reveal-load className="t-title max-w-[22ch]">
              {post.title}
            </h1>
            <p data-reveal="up" data-reveal-load data-delay="0.1" className="t-lede text-graphite mt-8 max-w-[58ch]">
              {post.excerpt}
            </p>
          </div>
          <dl
            data-reveal="up"
            data-reveal-load
            data-delay="0.2"
            className="lg:col-span-12 mt-10 grid grid-cols-2 md:grid-cols-4 border-t border-ink"
          >
            {[
              ['Author', AUTHOR],
              ['Filed', formatDateCompact(post.publishedAt)],
              ['Length', `${post.readingTime} min read`],
              ['Tags', post.tags.slice(0, 3).join(', ') || '—'],
            ].map(([label, value]) => (
              <div key={label} className="py-3 pr-4 border-b border-rule-strong">
                <dt className="t-label text-graphite mb-1">{label}</dt>
                <dd className="text-[15px] truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {post.protected ? (
          <ProtectedBlogContent
            slug={slug}
            password={post.password || DEFAULT_PROTECTED_PASSWORD}
            title={post.title}
          >
            <PostBody post={post} slug={slug} relatedPosts={relatedPosts} headings={headings} />
          </ProtectedBlogContent>
        ) : (
          <PostBody post={post} slug={slug} relatedPosts={relatedPosts} headings={headings} />
        )}
      </main>
    </>
  );
}

interface PostBodyProps {
  post: NonNullable<ReturnType<typeof getPostBySlug>>;
  slug: string;
  relatedPosts: BlogPostSummary[];
  headings: { id: string; text: string }[];
}

function PostBody({ post, slug, relatedPosts, headings }: PostBodyProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 pt-12 md:pt-16">
        {headings.length > 1 && (
          <aside className="hidden lg:block lg:col-span-3" aria-label="Contents">
            <nav className="sticky top-[calc(var(--nav-h)+32px)]">
              <p className="t-label text-graphite pb-3 border-b border-ink">Contents</p>
              <ol className="mt-2">
                {headings.map((h, i) => (
                  <li key={h.id + i}>
                    <a
                      href={`#${h.id}`}
                      className="group grid grid-cols-[2.25rem_1fr] gap-2 py-2 text-[14px] leading-snug text-graphite hover:text-ink border-b border-rule"
                    >
                      <span className="t-label pt-[2px]">{String(i + 1).padStart(2, '0')}</span>
                      <span>{h.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}

        <article className={`min-w-0 ${headings.length > 1 ? 'lg:col-span-7 lg:col-start-5' : 'lg:col-span-8 lg:col-start-3'}`}>
          <div className="max-w-[68ch]">
            <div className="mb-8">
              <AdUnit variant="inline" />
            </div>
            <MarkdownContent content={post.content} />

            {/* Author */}
            <section className="mt-20 border border-ink grid grid-cols-[auto_1fr]" aria-label="About the author">
              <div className="w-16 md:w-20 bg-ink text-paper grid place-items-center text-xl font-extrabold [font-stretch:125%] tracking-[-0.04em]">
                JV
              </div>
              <div className="p-5 md:p-6">
                <p className="t-label text-graphite mb-2">Filed by</p>
                <p className="font-bold text-lg">{AUTHOR}</p>
                <p className="text-graphite mt-2 text-[15px] leading-relaxed">
                  Senior Software Engineer building video platforms at ON24. 21 years of writing
                  code. I write about React, TypeScript, AI and developer tools.
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 t-label">
                  <a href="https://github.com/josmanvis" target="_blank" rel="noopener noreferrer" className="hover:text-signal-ink">GitHub ↗</a>
                  <a href="https://twitter.com/crativo" target="_blank" rel="noopener noreferrer" className="hover:text-signal-ink">Twitter ↗</a>
                  <a href="https://linkedin.com/in/joseviscasillas" target="_blank" rel="noopener noreferrer" className="hover:text-signal-ink">LinkedIn ↗</a>
                </div>
              </div>
            </section>
          </div>
        </article>
      </div>

      <div className="py-12">
        <AdUnit variant="banner" />
      </div>

      <RecommendedReads posts={relatedPosts} currentSlug={slug} />

      <section className="pt-20">
        <NewsletterSignup />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 pt-20">
        <div className="lg:col-span-8 lg:col-start-3">
          <Comments slug={slug} />
        </div>
      </div>
    </>
  );
}
