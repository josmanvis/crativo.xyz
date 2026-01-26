import { Metadata } from 'next';
import { getAllPosts, categories } from '@/lib/blog';
import BlogList from '@/components/blog/BlogList';
import { DotGrid } from '@/components/DotGrid';
import NewsletterSignup from '@/components/NewsletterSignup';

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
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative">
      <DotGrid opacity={0.15} spacing={60} dotSize={1.5} />
      
      {/* Header */}
      <div className="text-center py-16 relative z-10">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-gray-400 mt-2">
          Thoughts on code, tools, and engineering
        </p>
        <a
          href="/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm text-zinc-400 hover:text-orange-400 transition-colors"
          title="Subscribe via RSS"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
          </svg>
          RSS Feed
        </a>
      </div>

      {/* Newsletter Signup */}
      <div className="max-w-2xl mx-auto px-6 mb-12 relative z-10">
        <NewsletterSignup />
      </div>

      {/* Blog List with filtering */}
      <div className="relative z-10">
        <BlogList posts={posts} categories={categories} />
      </div>

      {/* Bottom Newsletter CTA */}
      <div className="max-w-2xl mx-auto px-6 py-16 relative z-10">
        <NewsletterSignup />
      </div>
    </main>
  );
}
