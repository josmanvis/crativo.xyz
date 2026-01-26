import { Metadata } from 'next';
import { getAllPosts, categories } from '@/lib/blog';
import BlogList from '@/components/blog/BlogList';
import { DotGrid } from '@/components/DotGrid';
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
      </div>

      {/* Newsletter Signup */}
      <div className="max-w-2xl mx-auto px-6 mb-12 relative z-10">
        <NewsletterSignup />
      </div>

      {/* Sponsor Ad */}
      <div className="max-w-2xl mx-auto px-6 mb-12 relative z-10">
        <AdUnit variant="banner" />
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
