import { notFound } from "next/navigation";
import { Metadata } from "next";
import { projects } from "@/data/projects";
import ProjectHero from "@/components/ProjectHero";
import ProjectGallery from "@/components/ProjectGallery";
import CodeSnippet from "@/components/CodeSnippet";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} | crativo`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Year */}
        <p className="text-gray-500 text-sm mb-4">{project.year}</p>

        {/* Hero */}
        <ProjectHero project={project} />

        {/* Long Description */}
        <section className="py-12">
          <p className="text-gray-300 leading-relaxed text-lg">
            {project.longDescription}
          </p>
        </section>

        {/* Tech Stack */}
        <section className="py-12 border-t border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-sm bg-white/10 text-gray-300 rounded-full px-3 py-1"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Metrics */}
        <section className="py-12 border-t border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-4">Impact</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {project.metrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-white/5 rounded-lg p-4"
              >
                <p className="text-gray-400 text-sm">{metric.label}</p>
                <p className="text-white text-xl font-semibold mt-1">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        <section className="py-12 border-t border-white/10">
          <ProjectGallery gallery={project.gallery} />
        </section>

        {/* Code Snippet */}
        <section className="py-12 border-t border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Implementation Highlight
          </h2>
          <CodeSnippet snippet={project.codeSnippet} />
        </section>
      </div>
    </main>
  );
}
