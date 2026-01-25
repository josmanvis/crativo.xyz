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
        <div className="flex flex-wrap gap-3 mt-6">
          {project.links.map((link) => {
            const isGitHub = link.label.toLowerCase().includes('github') || link.url.includes('github.com');
            const isNpm = link.label.toLowerCase().includes('npm') || link.url.includes('npmjs.com');
            const isAppStore = link.label.toLowerCase().includes('app store') || link.url.includes('apple.com');
            const isDemo = link.label.toLowerCase().includes('demo') || link.label.toLowerCase().includes('live');
            
            return (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 ring-1
                  ${isGitHub 
                    ? 'bg-[#161b22] hover:bg-[#1f2428] text-gray-100 ring-gray-700 hover:ring-gray-500' 
                    : isNpm 
                    ? 'bg-[#1a0000] hover:bg-[#2a0505] text-red-100 ring-red-900/50 hover:ring-red-700/50' 
                    : isAppStore
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-100 ring-blue-700/50 hover:ring-blue-500/50'
                    : isDemo
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 ring-emerald-700/50 hover:ring-emerald-500/50'
                    : 'bg-white/5 hover:bg-white/10 text-gray-200 ring-white/10 hover:ring-white/20'
                  }
                `}
              >
                {/* Icon */}
                {isGitHub && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                  </svg>
                )}
                {isNpm && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/>
                  </svg>
                )}
                {isAppStore && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                )}
                {isDemo && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
                {!isGitHub && !isNpm && !isAppStore && !isDemo && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
                <span>{link.label}</span>
                <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
