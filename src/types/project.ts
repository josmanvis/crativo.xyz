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
}
