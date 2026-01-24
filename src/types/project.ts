export interface ProjectLink {
  label: string;
  url: string;
  icon?: string;
}

export interface ProjectCodeSnippet {
  language: string;
  code: string;
  filename: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: "Apps" | "Libraries" | "Experiments" | "Tools" | "Games";
  techStack: string[];
  imageUrl: string;
  href: string;
  year: number;
  metrics: { label: string; value: string }[];
  longDescription: string;
  links: ProjectLink[];
  gallery: string[];
  codeSnippet: ProjectCodeSnippet;
}
