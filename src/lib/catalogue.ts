import { projects } from '@/data/projects';
import { partNumber } from '@/lib/hud';
import type { IndexProject } from '@/components/projects/ProjectIndex';

/**
 * Slim, numbered view of the project catalogue for client components, so the
 * long descriptions and code snippets never ship to the browser.
 */
export function getIndexProjects(): IndexProject[] {
  return projects.map((p, i) => ({
    id: p.id,
    pn: partNumber('P-', i + 1),
    title: p.title,
    description: p.description,
    category: p.category,
    year: p.year,
    techStack: p.techStack,
    imageUrl: p.imageUrl,
    href: p.href,
    metrics: p.metrics,
  }));
}

export function partNumberFor(id: string) {
  const i = projects.findIndex((p) => p.id === id);
  return i === -1 ? 'P-00' : partNumber('P-', i + 1);
}
