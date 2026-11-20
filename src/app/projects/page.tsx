import type { Metadata } from 'next';
import { categories } from '@/data/projects';
import { getIndexProjects } from '@/lib/catalogue';
import ProjectIndex from '@/components/projects/ProjectIndex';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'The full catalogue of apps, libraries, tools and kiosks built by Jose Viscasillas.',
  alternates: { canonical: 'https://crativo.xyz/projects' },
};

export default function ProjectsPage() {
  const projects = getIndexProjects();
  return (
    <main className="shell pt-10 md:pt-16">
      <SectionHeader
        as="h1"
        load
        number="01"
        label="Catalogue"
        title="Instruments."
        meta={`${projects.length} entries`}
        className="mb-6"
      />
      <p data-reveal="up" data-reveal-load className="t-lede text-graphite max-w-[48ch] mb-12 md:mb-16">
        Apps, libraries, tools and kiosks — each one built because something was hiding
        information it should have been showing.
      </p>
      <ProjectIndex projects={projects} categories={categories} />
    </main>
  );
}
