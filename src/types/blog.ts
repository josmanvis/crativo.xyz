export interface BlogCategory {
  slug: string;
  name: string;
  gradient: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  tags: string[];
  coverImage?: string;
  featured?: boolean;
}
