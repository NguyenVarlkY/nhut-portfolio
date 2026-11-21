import fs from 'fs/promises';
import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getStoredPosts, type StoredPost } from './content/posts';

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
  /** cover picture (posts written in /admin) */
  cover?: string;
  tags?: string[];
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

/** All slugs written as files, taken from the source-language folder. */
export function getSlugs(): string[] {
  try {
    return readdirSync(path.join(contentRoot, SOURCE_LANG))
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, ''));
  } catch {
    return [];
  }
}

/** Languages a file post has actually been written/translated in. */
function fileLangs(slug: string, langs: readonly string[]): string[] {
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

/* ---------- posts written in /admin ---------- */

const ready = (p: StoredPost, l: string) => !!(p.langs[l]?.title && p.langs[l]?.content.trim());
/** the language to show: the one asked for, else Vietnamese, else English, else any written one */
function pickLang(p: StoredPost, lang: string): string | null {
  for (const l of [lang, SOURCE_LANG, 'en', ...Object.keys(p.langs)]) if (ready(p, l)) return l;
  return null;
}
export function storedToPost(p: StoredPost, lang: string): BlogPostWithContent | null {
  const l = pickLang(p, lang);
  if (!l) return null;
  const t = p.langs[l]!;
  return {
    slug: p.slug,
    frontmatter: { title: t.title, excerpt: t.excerpt, date: p.date },
    readingTime: Math.max(1, Math.ceil(t.content.trim().split(/\s+/).length / 200)),
    content: t.content,
    lang: l,
    isFallback: l !== lang,
    cover: p.cover || undefined,
    tags: p.tags,
  };
}
async function published(): Promise<StoredPost[]> {
  return (await getStoredPosts()).filter((p) => p.published);
}

export async function getPost(slug: string, lang: string): Promise<BlogPostWithContent | null> {
  const stored = (await published()).find((p) => p.slug === slug);
  if (stored) return storedToPost(stored, lang);
  return getPostSync(slug, lang);
}

/** Languages a post really exists in (admin posts: the languages with a title and text). */
export async function getPostLangs(slug: string, langs: readonly string[]): Promise<string[]> {
  const stored = (await published()).find((p) => p.slug === slug);
  if (stored) return langs.filter((l) => ready(stored, l));
  return fileLangs(slug, langs);
}

export async function getPosts(lang: string = SOURCE_LANG): Promise<BlogPost[]> {
  try {
    const stored = await published();
    const storedSlugs = new Set(stored.map((p) => p.slug));
    const files = await Promise.all(
      getSlugs().filter((slug) => !storedSlugs.has(slug)).map(async (slug) => {
        const resolved = resolvePostFile(slug, lang)!;
        const { data, content } = matter(await fs.readFile(resolved.file, 'utf-8'));
        return {
          slug,
          frontmatter: toFrontmatter(data),
          readingTime: await calculateReadingTime(content),
          lang: resolved.lang,
          isFallback: resolved.lang !== lang,
        } as BlogPost;
      })
    );
    const mine = stored.map((p) => storedToPost(p, lang)).filter((p): p is BlogPostWithContent => !!p).map(({ content: _c, ...rest }) => rest);
    return [...mine, ...files].sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

/** Every file post in every language it has, for the admin's "edit an existing post". */
export function filePostForAdmin(slug: string, langs: readonly string[]) {
  const out: Record<string, { title: string; excerpt: string; content: string }> = {};
  let date = '';
  for (const l of fileLangs(slug, langs)) {
    const { data, content } = matter(readFileSync(path.join(contentRoot, l, `${slug}.mdx`), 'utf-8'));
    const fm = toFrontmatter(data);
    date = date || fm.date;
    out[l] = { title: fm.title, excerpt: fm.excerpt, content: content.trim() };
  }
  return { slug, date, langs: out };
}
