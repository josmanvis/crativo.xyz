import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation/Navigation";
import { SplashProvider } from "@/lib/SplashContext";
import ChatWidget from "@/components/ChatWidget";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://crativo.xyz'),
  title: {
    default: 'Jose Viscasillas | Senior Software Engineer | 21 Years Experience',
    template: '%s | Jose Viscasillas',
  },
  description: 'Jose Viscasillas is a Senior Software Engineer with 21 years of experience specializing in React, TypeScript, video platforms, and developer tools. Currently building at ON24, previously Innovation Lab at Retail Business Services.',
  keywords: [
    'Jose Viscasillas',
    'Jose Viscasillas software engineer',
    'Jose Viscasillas developer',
    'Senior Software Engineer',
    'React Developer',
    'TypeScript Developer',
    'Video Conferencing Developer',
    'ON24 Engineer',
    'Tauri Developer',
    'Developer Tools',
    'Full Stack Developer',
    'JavaScript Expert',
    'Node.js Developer',
    'Next.js Developer',
    'Web Developer Portfolio',
    'crativo.xyz',
  ],
  authors: [{ name: 'Jose Viscasillas', url: 'https://crativo.xyz' }],
  creator: 'Jose Viscasillas',
  publisher: 'Jose Viscasillas',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://crativo.xyz',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://crativo.xyz',
    siteName: 'crativo.xyz',
    title: 'Jose Viscasillas | Senior Software Engineer | 21 Years Experience',
    description: 'Senior Software Engineer with 21 years of experience. React, TypeScript, video platforms, and developer tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Jose Viscasillas - Senior Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@crativo',
    creator: '@crativo',
    title: 'Jose Viscasillas | Senior Software Engineer',
    description: 'Senior Software Engineer with 21 years of experience. React, TypeScript, video platforms, and developer tools.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },
  category: 'technology',
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://crativo.xyz/#website',
      url: 'https://crativo.xyz',
      name: 'crativo.xyz',
      description: 'Portfolio and blog of Jose Viscasillas, Senior Software Engineer',
      publisher: { '@id': 'https://crativo.xyz/#person' },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Person',
      '@id': 'https://crativo.xyz/#person',
      name: 'Jose Viscasillas',
      url: 'https://crativo.xyz',
      image: 'https://crativo.xyz/og-image.png',
      jobTitle: 'Senior Software Engineer',
      worksFor: {
        '@type': 'Organization',
        name: 'ON24',
      },
      description: 'Senior Software Engineer with 21 years of experience specializing in React, TypeScript, video platforms, and developer tools.',
      sameAs: [
        'https://github.com/josmanvis',
        'https://twitter.com/crativo',
        'https://linkedin.com/in/joseviscasillas',
      ],
      knowsAbout: [
        'React',
        'TypeScript',
        'JavaScript',
        'Node.js',
        'Next.js',
        'Video Conferencing',
        'WebRTC',
        'Tauri',
        'Developer Tools',
      ],
    },
    {
      '@type': 'ProfilePage',
      '@id': 'https://crativo.xyz/#profilepage',
      url: 'https://crativo.xyz',
      name: 'Jose Viscasillas Portfolio',
      mainEntity: { '@id': 'https://crativo.xyz/#person' },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="canonical" href="https://crativo.xyz" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="author" content="Jose Viscasillas" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} antialiased bg-[#0a0a0a] text-[#ededed]`}>
        <SplashProvider>
          <Navigation />
          <div className="pt-16">
            {children}
          </div>
          <ChatWidget />
        </SplashProvider>
      </body>
    </html>
  );
}
