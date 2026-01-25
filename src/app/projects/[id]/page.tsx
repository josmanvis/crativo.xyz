import { notFound } from "next/navigation";
import { Metadata } from "next";
import { projects } from "@/data/projects";
import ProjectHero from "@/components/ProjectHero";
import AppStoreGallery from "@/components/AppStoreGallery";
import FeatureHighlights from "@/components/FeatureHighlights";
import ProjectDescription from "@/components/ProjectDescription";
import CodeSnippet from "@/components/CodeSnippet";
import DisqusComments from "@/components/DisqusComments";
import { DotGrid } from "@/components/DotGrid";

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
    <main className="min-h-screen bg-[#0a0a0a] text-white relative">
      <DotGrid opacity={0.12} spacing={60} dotSize={1.5} />
      
      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        {/* Year badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-gray-500">{project.year}</span>
          <span className="text-gray-700">•</span>
          <span className="text-sm px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
            {project.category}
          </span>
        </div>

        {/* Hero */}
        <ProjectHero project={project} />

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-6">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                {link.icon === 'github' && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                )}
                {link.icon === 'external' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
                {link.icon === 'package' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* App Store Gallery - Previews */}
        {project.previews && project.previews.length > 0 && (
          <AppStoreGallery previews={project.previews} title={project.title} />
        )}

        {/* Feature Highlights */}
        {project.features && project.features.length > 0 && (
          <FeatureHighlights features={project.features} />
        )}

        {/* Long Description with formatting */}
        <ProjectDescription description={project.longDescription} />

        {/* Tech Stack */}
        <section className="py-12 border-t border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6">Built With</h2>
          <div className="flex flex-wrap gap-3">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-sm bg-gradient-to-br from-white/10 to-white/5 text-gray-300 rounded-xl px-4 py-2 border border-white/10"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Metrics */}
        {project.metrics && project.metrics.length > 0 && (
          <section className="py-12 border-t border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-6">Impact</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {project.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 overflow-hidden"
                >
                  {/* Glow accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  
                  <p className="text-gray-400 text-sm relative z-10">{metric.label}</p>
                  <p className="text-white text-2xl font-bold mt-1 relative z-10">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Code Snippet */}
        {project.codeSnippet && (
          <section className="py-12 border-t border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Under the Hood
            </h2>
            <p className="text-gray-400 mb-4 text-sm">
              A peek at the implementation — the kind of code that powers {project.title}.
            </p>
            <CodeSnippet snippet={project.codeSnippet} />
          </section>
        )}

        {/* Comments */}
        <DisqusComments 
          identifier={`project-${project.id}`}
          title={project.title}
        />
      </div>
    </main>
  );
}
