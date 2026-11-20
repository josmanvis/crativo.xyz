import { Metadata } from 'next';
import { Rss } from 'lucide-react';
import { getPostSummaries, categories } from '@/lib/blog';
import BlogList from '@/components/blog/BlogList';
import SectionHeader from '@/components/ui/SectionHeader';
import NewsletterSignup from '@/components/NewsletterSignup';
import { AdUnit } from '@/components/ads';

export const metadata: Metadata = {
  title: 'Blog | Jose Viscasillas - Software Engineering & Web Development',
  description: 'Technical articles by Jose Viscasillas on React, TypeScript, AI, developer tools, and modern web development. 21 years of coding experience shared.',
  keywords: [
    'Jose Viscasillas',
    'Jose Viscasillas blog',
    'software engineering blog',
    'web development',
    'React tutorials',
    'TypeScript',
    'AI development',
    'developer tools',
  ],
  authors: [{ name: 'Jose Viscasillas', url: 'https://crativo.xyz' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://crativo.xyz/blog',
    siteName: 'crativo.xyz',
    title: 'Blog | Jose Viscasillas',
    description: 'Technical articles on React, TypeScript, AI, and developer tools by Jose Viscasillas.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@crativo',
    creator: '@crativo',
  },
  alternates: {
    canonical: 'https://crativo.xyz/blog',
    types: {
      'application/rss+xml': 'https://crativo.xyz/feed.xml',
    },
  },
};

export default function BlogPage() {
  const posts = getPostSummaries();

  return (
    <main className="shell pt-10 md:pt-16">
      <SectionHeader
        as="h1"
        load
        number="02"
        label="Writing"
        title="The log."
        meta={`${posts.length} entries`}
        className="mb-6"
      />
      <div
        data-reveal="up"
        data-reveal-load
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16"
      >
        <p className="t-lede text-graphite max-w-[52ch]">
          Deep dives, tutorials and the occasional hot take on React, TypeScript, AI tooling and
          the craft of shipping software.
        </p>
        <a
          href="/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="btn shrink-0 self-start md:self-auto"
          data-hud="Subscribe via RSS · /feed.xml"
        >
          <Rss size={16} strokeWidth={1.5} /> RSS feed
        </a>
      </div>

      <BlogList posts={posts} categories={categories} />

      <div className="py-12">
        <AdUnit variant="banner" />
      </div>

      <div className="pt-12">
        <NewsletterSignup />
      </div>
    </main>
  );
}
