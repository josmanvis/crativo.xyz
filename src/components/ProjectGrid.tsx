import { Project } from "@/types/project";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 relative z-10">
      <div
        className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        role="list"
        aria-label="Project gallery"
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
