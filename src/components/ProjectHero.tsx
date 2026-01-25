import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types/project";

const categoryGradients: Record<Project["category"], string> = {
  Apps: "from-blue-500/40 to-cyan-500/30",
  Libraries: "from-teal-500/40 to-cyan-500/30",
  Experiments: "from-orange-500/40 to-yellow-500/30",
  Tools: "from-green-500/40 to-emerald-500/30",
  Games: "from-red-500/40 to-rose-500/30",
  Kiosks: "from-sky-500/40 to-blue-500/30",
};

interface ProjectHeroProps {
  project: Project;
}

export default function ProjectHero({ project }: ProjectHeroProps) {
  const hasImage = project.imageUrl && !project.imageUrl.includes('placeholder');

  return (
    <div className="relative">
      {/* Hero banner with image or gradient fallback */}
      <div className="relative h-72 rounded-xl overflow-hidden">
        {hasImage ? (
          <>
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover object-top"
              priority
            />
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        ) : (
          <div className={`h-full bg-gradient-to-br ${categoryGradients[project.category]}`} />
        )}

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          {/* Back button */}
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors text-sm w-fit flex items-center gap-1"
          >
            <span>&larr;</span> Back
          </Link>

          {/* Title and description */}
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">{project.title}</h1>
            <p className="text-gray-200 mt-2 max-w-2xl drop-shadow">
              {project.description}
            </p>
          </div>
        </div>
      </div>

      {/* Links row */}
      {project.links.length > 0 && (
        <div className="flex gap-4 mt-4">
          {project.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
