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

export interface ProjectFeature {
  icon: string;
  title: string;
  description: string;
}

export interface ProjectPreview {
  type: 'screenshot' | 'video' | 'demo';
  src: string;
  alt: string;
  caption?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: "Apps" | "Libraries" | "Experiments" | "Tools" | "Games" | "Kiosks";
  techStack: string[];
  imageUrl: string;
  href: string;
  year: number;
  metrics: { label: string; value: string }[];
  longDescription: string;
  links: ProjectLink[];
  gallery: string[];
  codeSnippet: ProjectCodeSnippet;
  features?: ProjectFeature[];
  previews?: ProjectPreview[];
}
