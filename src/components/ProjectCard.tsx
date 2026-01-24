import Link from "next/link";
import { Project } from "@/types/project";

const categoryGradients: Record<Project["category"], string> = {
  Apps: "from-blue-500/30 to-cyan-500/20",
  Libraries: "from-purple-500/30 to-pink-500/20",
  Experiments: "from-orange-500/30 to-yellow-500/20",
  Tools: "from-green-500/30 to-emerald-500/20",
  Games: "from-red-500/30 to-rose-500/20",
  Kiosks: "from-indigo-500/30 to-violet-500/20",
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={project.href} className="group block">
      <div className="bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/10 transition-all duration-200 group-hover:scale-[1.03] group-hover:ring-white/30 group-hover:shadow-lg group-hover:shadow-white/5">
        {/* Gradient placeholder for project image */}
        <div
          className={`h-40 bg-gradient-to-br ${categoryGradients[project.category]} flex items-end p-4`}
        >
          <span className="text-xs text-white/60 font-medium">
            {project.year}
          </span>
        </div>

        {/* Card content */}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {project.description}
          </p>

          {/* Tech stack pills */}
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs bg-white/10 text-gray-300 rounded-full px-2 py-0.5"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Metrics */}
          {project.metrics.length > 0 && (
            <div className="flex gap-4 pt-1">
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
  );
}
