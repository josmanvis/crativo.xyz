import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getAllSlugs, getRelatedPosts } from '@/lib/blog';
import BlogHero from '@/components/blog/BlogHero';
import MarkdownContent from '@/components/blog/MarkdownContent';
import RecommendedReads from '@/components/blog/RecommendedReads';
import { DotGrid } from '@/components/DotGrid';
import NewsletterSignup from '@/components/NewsletterSignup';
import Script from 'next/script';

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
  const relatedPosts = getRelatedPosts(post, 3);

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
      <main className="min-h-screen bg-[#0a0a0a] text-white relative">
        <DotGrid opacity={0.12} spacing={60} dotSize={1.5} />
        <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
          {/* Hero */}
          <BlogHero post={post} />

          {/* Author byline for SEO */}
          <div className="flex items-center gap-3 py-4 border-b border-white/10 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              JV
            </div>
            <div>
              <p className="text-white font-medium">{AUTHOR}</p>
              <p className="text-zinc-500 text-sm">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {' · '}
                {post.readingTime} min read
              </p>
            </div>
          </div>

          {/* Content */}
          <section className="py-8">
            <MarkdownContent content={post.content} />
          </section>

          {/* Author bio for SEO */}
          <section className="py-8 border-t border-white/10">
            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  JV
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Written by {AUTHOR}</h3>
                  <p className="text-zinc-400 text-sm mb-3">
                    Senior Software Engineer building video platforms at ON24. 
                    21 years of coding experience. I write about React, TypeScript, 
                    AI, and developer tools.
                  </p>
                  <div className="flex gap-3">
                    <a 
                      href="https://github.com/josmanvis" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      GitHub
                    </a>
                    <a 
                      href="https://twitter.com/crativo" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      Twitter
                    </a>
                    <a 
                      href="https://linkedin.com/in/joseviscasillas" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recommended reads */}
          <RecommendedReads posts={relatedPosts} currentSlug={slug} />

          {/* Newsletter signup */}
          <section className="py-8">
            <NewsletterSignup />
          </section>

          {/* Footer with navigation */}
          <section className="py-8 border-t border-white/10">
            <div className="flex justify-between items-center">
              <a
                href="/blog"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← All Posts
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
