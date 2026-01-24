import Link from "next/link";
import { Project } from "@/types/project";

const categoryGradients: Record<Project["category"], string> = {
  Apps: "from-blue-500/40 to-cyan-500/30",
  Libraries: "from-purple-500/40 to-pink-500/30",
  Experiments: "from-orange-500/40 to-yellow-500/30",
  Tools: "from-green-500/40 to-emerald-500/30",
  Games: "from-red-500/40 to-rose-500/30",
};

interface ProjectHeroProps {
  project: Project;
}

export default function ProjectHero({ project }: ProjectHeroProps) {
  return (
    <div className="relative">
      {/* Gradient banner */}
      <div
        className={`h-64 bg-gradient-to-br ${categoryGradients[project.category]} flex flex-col justify-between p-6 rounded-xl`}
      >
        {/* Back button */}
        <Link
          href="/"
          className="text-gray-400 hover:text-white transition-colors text-sm w-fit"
        >
          &larr; Back
        </Link>

        {/* Title and description */}
        <div>
          <h1 className="text-4xl font-bold text-white">{project.title}</h1>
          <p className="text-gray-300 mt-2 max-w-2xl">
            {project.description}
          </p>
        </div>
      </div>

      {/* Links row */}
      <div className="flex gap-4 mt-4">
        {project.links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
