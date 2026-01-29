import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types/project";

const categoryGradients: Record<Project["category"], string> = {
  Apps: "from-blue-500/30 to-cyan-500/20",
  Libraries: "from-teal-500/30 to-cyan-500/20",
  Experiments: "from-orange-500/30 to-yellow-500/20",
  Tools: "from-green-500/30 to-emerald-500/20",
  Games: "from-red-500/30 to-rose-500/20",
  Kiosks: "from-sky-500/30 to-blue-500/20",
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const hasImage = project.imageUrl && !project.imageUrl.includes('placeholder');

  return (
    <article className="group block relative z-10" aria-labelledby={`project-title-${project.id}`}>
      <Link href={project.href}>
        <div className="bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/10 transition-all duration-200 group-hover:scale-[1.03] group-hover:ring-white/30 group-hover:shadow-lg group-hover:shadow-white/5">
          {/* Project image or gradient fallback */}
          <div className="relative h-44 overflow-hidden">
            {hasImage ? (
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                priority={false}
              />
            ) : (
              <div
                className={`h-full bg-gradient-to-br ${categoryGradients[project.category]} flex items-end p-4`}
                aria-label={`${project.title} - ${project.year}`}
              >
                <span className="text-xs text-white/60 font-medium">
                  {project.year}
                </span>
              </div>
            )}
            {/* Year badge overlay when image exists */}
            {hasImage && (
              <div className="absolute bottom-2 left-2">
                <span className="text-xs text-white/80 font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                  {project.year}
                </span>
              </div>
            )}
          </div>

          {/* Card content */}
          <div className="p-4 space-y-3">
            <h3 id={`project-title-${project.id}`} className="text-lg font-semibold text-white">{project.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {project.description}
            </p>

            {/* Tech stack pills */}
            <div className="flex flex-wrap gap-1.5" aria-label="Technologies used">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs bg-white/10 text-gray-300 rounded-full px-2 py-0.5"
                  aria-label={`Technology: ${tech}`}
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Metrics */}
            {project.metrics.length > 0 && (
              <div className="flex gap-4 pt-1" aria-label="Project metrics">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="text-xs">
                    <span className="text-gray-500">{metric.label}</span>{" "}
                    <span className="text-white font-medium">{metric.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
