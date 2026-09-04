'use server';

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');

interface BlogPostFrontmatter {
  title: string;
  excerpt: string;
  date: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  readingTime: number;
}

export async function calculateReadingTime(content: string): Promise<number> {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export async function getPosts(): Promise<BlogPost[]> {
  try {
    const files = await fs.readdir(contentDir);
    const postsPromises = files.map(async (filename) => {
      const slug = filename.replace('.mdx', '');
      const fileContent = await fs.readFile(path.join(contentDir, filename), 'utf-8');
      const { data: frontmatter, content } = matter(fileContent);

      const validatedFrontmatter: BlogPostFrontmatter = {
        title: frontmatter.title || 'Untitled',
        excerpt: frontmatter.excerpt || '',
        date: frontmatter.date || new Date().toISOString().split('T')[0]
      };

      return { 
        slug, 
        frontmatter: validatedFrontmatter,
        readingTime: await calculateReadingTime(content)
      };
    });

    return await Promise.all(postsPromises);
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}