export interface BlogCategory {
  slug: string;
  name: string;
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
  protected?: boolean;
  password?: string;
}

/** What list views need — no markdown body. */
export type BlogPostSummary = Pick<
  BlogPost,
  'slug' | 'title' | 'excerpt' | 'category' | 'publishedAt' | 'readingTime' | 'tags'
> & { number: number };
