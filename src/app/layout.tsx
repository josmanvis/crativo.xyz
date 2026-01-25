import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation/Navigation";
import { SplashProvider } from "@/lib/SplashContext";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://crativo.xyz'),
  title: {
    default: 'Jose Viscasillas | Senior Software Engineer',
    template: '%s | Jose Viscasillas',
  },
  description: 'Senior Software Engineer specializing in React, video platforms, and developer tools. Building at ON24, previously Innovation Lab at Retail Business Services.',
  keywords: [
    'Jose Viscasillas',
    'Software Engineer',
    'React Developer',
    'TypeScript',
    'Video Conferencing',
    'ON24',
    'Tauri',
    'Developer Tools',
  ],
  authors: [{ name: 'Jose Viscasillas', url: 'https://crativo.xyz' }],
  creator: 'Jose Viscasillas',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://crativo.xyz',
    siteName: 'crativo.xyz',
    title: 'Jose Viscasillas | Senior Software Engineer',
    description: 'Senior Software Engineer specializing in React, video platforms, and developer tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Jose Viscasillas - Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jose Viscasillas | Senior Software Engineer',
    description: 'Senior Software Engineer specializing in React, video platforms, and developer tools.',
    images: ['/og-image.png'],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
