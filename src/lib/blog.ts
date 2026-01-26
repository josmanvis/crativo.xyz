import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost } from '@/types/blog';

// Re-export client-safe utilities
export { blogCategories, categories, formatDate, getCategoryGradient, filterPostsByCategory } from './blog-utils';

const postsDirectory = path.join(process.cwd(), 'content/blog');

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        excerpt: data.excerpt || '',
        content,
        category: data.category || 'thoughts',
        publishedAt: data.publishedAt || data.date || new Date().toISOString(),
        updatedAt: data.updatedAt,
        readingTime: data.readingTime || calculateReadingTime(content),
        tags: data.tags || [],
        coverImage: data.coverImage,
        featured: data.featured || false,
        protected: data.protected || false,
        password: data.password,
      } as BlogPost;
    });

  return allPosts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || slug,
    excerpt: data.excerpt || '',
    content,
    category: data.category || 'thoughts',
    publishedAt: data.publishedAt || data.date || new Date().toISOString(),
    updatedAt: data.updatedAt,
    readingTime: data.readingTime || calculateReadingTime(content),
    tags: data.tags || [],
    coverImage: data.coverImage,
    featured: data.featured || false,
    protected: data.protected || false,
    password: data.password,
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''));
}

export function getRelatedPosts(currentPost: BlogPost, limit: number = 3): BlogPost[] {
  const allPosts = getAllPosts();
  
  // Score posts by relevance
  const scoredPosts = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      let score = 0;
      
      // Same category = highest priority
      if (post.category === currentPost.category) {
        score += 10;
      }
      
      // Matching tags
      const matchingTags = post.tags.filter(tag => 
        currentPost.tags.includes(tag)
      ).length;
      score += matchingTags * 3;
      
      // Recency bonus (posts from last 30 days get a small boost)
      const daysSincePublished = (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublished < 30) {
        score += 2;
      }
      
      return { post, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);

  return scoredPosts;
}
