import fs from 'fs/promises';
import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentRoot = path.join(process.cwd(), 'content');

/** Language the posts are originally written in — every slug exists here. */
export const SOURCE_LANG = 'vi';

interface BlogPostFrontmatter {
  title: string;
  excerpt: string;
  date: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  readingTime: number;
  /** Language of the file actually served (differs from the requested one on fallback). */
  lang: string;
  isFallback: boolean;
}

export interface BlogPostWithContent extends BlogPost {
  content: string;
}

export async function calculateReadingTime(content: string): Promise<number> {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/** Resolve the file for a post in `lang`, falling back to the source language. */
function resolvePostFile(slug: string, lang: string): { file: string; lang: string } | null {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  for (const l of lang === SOURCE_LANG ? [lang] : [lang, SOURCE_LANG]) {
    const file = path.join(contentRoot, l, `${slug}.mdx`);
    if (existsSync(file)) return { file, lang: l };
  }
  return null;
}

function toFrontmatter(data: Record<string, any>): BlogPostFrontmatter {
  return {
    title: data.title || 'Untitled',
    excerpt: data.excerpt || '',
    date: data.date || new Date().toISOString().split('T')[0],
  };
}

/** All slugs, taken from the source-language folder. */
export function getSlugs(): string[] {
  try {
    return readdirSync(path.join(contentRoot, SOURCE_LANG))
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, ''));
  } catch {
    return [];
  }
}

/** Languages a given post has actually been written/translated in. */
export function getPostLangs(slug: string, langs: readonly string[]): string[] {
  return langs.filter((l) => existsSync(path.join(contentRoot, l, `${slug}.mdx`)));
}

export function getPostSync(slug: string, lang: string): BlogPostWithContent | null {
  const resolved = resolvePostFile(slug, lang);
  if (!resolved) return null;
  const { data, content } = matter(readFileSync(resolved.file, 'utf-8'));
  const words = content.trim().split(/\s+/).length;
  return {
    slug,
    frontmatter: toFrontmatter(data),
    readingTime: Math.ceil(words / 200),
    content,
    lang: resolved.lang,
    isFallback: resolved.lang !== lang,
  };
}

export async function getPost(slug: string, lang: string): Promise<BlogPostWithContent | null> {
  return getPostSync(slug, lang);
}

export async function getPosts(lang: string = SOURCE_LANG): Promise<BlogPost[]> {
  try {
    const posts = await Promise.all(
      getSlugs().map(async (slug) => {
        const resolved = resolvePostFile(slug, lang)!;
        const { data, content } = matter(await fs.readFile(resolved.file, 'utf-8'));
        return {
          slug,
          frontmatter: toFrontmatter(data),
          readingTime: await calculateReadingTime(content),
          lang: resolved.lang,
          isFallback: resolved.lang !== lang,
        };
      })
    );
    return posts.sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}
