import { Metadata } from 'next';
import AboutPageContent from '@/components/about/AboutPageContent';

export const metadata: Metadata = {
  title: 'About | Jose Viscasillas',
  description: 'Senior Software Engineer with 21 years of experience. Learn more about my skills, experience, and background.',
  alternates: {
    canonical: 'https://crativo.xyz/about',
  },
  openGraph: {
    title: 'About | Jose Viscasillas',
    description: 'Senior Software Engineer with 21 years of experience. Learn more about my skills, experience, and background.',
    url: 'https://crativo.xyz/about',
  },
};

export default function AboutPage() {
  return <AboutPageContent />;
}