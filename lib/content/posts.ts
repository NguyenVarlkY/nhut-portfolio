/* Blog posts written in /admin (the ones in content/<lang>/*.mdx stay in code). One file per post: blog/<slug>.json.
 * A post saved here with the same slug as a file post replaces it on the site. */
import { unstable_cache, revalidateTag } from "next/cache";
import { i18n } from "../i18n/config";
import { listFiles, pool, readJson, remove, storageKind, writeJson } from "./storage";

export const BLOG_TAG = "portfolio-blog";
const PREFIX = "blog/";
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LANGS = i18n.locales as readonly string[];

export interface PostText { title: string; excerpt: string; content: string }
export interface StoredPost {
  slug: string;
  date: string;
  cover: string;
  tags: string[];
  published: boolean;
  langs: Partial<Record<string, PostText>>;
  updatedAt: number;
}

export class InvalidPost extends Error {}
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(CTRL, "").slice(0, max) : "");

/** Checked copy of what the admin page sends. */
export function cleanPost(v: unknown): StoredPost {
  const p = (v ?? {}) as Record<string, unknown>;
  const slug = str(p.slug, 80).trim().toLowerCase();
  if (!SLUG.test(slug)) throw new InvalidPost("Đường dẫn bài viết chỉ gồm chữ thường không dấu, số và dấu gạch ngang (vd: bai-viet-dau-tien).");
  const date = str(p.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new InvalidPost("Ngày đăng phải có dạng YYYY-MM-DD.");
  const cover = str(p.cover, 300).trim();
  if (cover && !/^https:\/\//i.test(cover) && !/^\/api\/media\/[\w./-]+$/.test(cover)) throw new InvalidPost("Ảnh bìa không hợp lệ.");
  const tags = Array.isArray(p.tags) ? p.tags.map((t) => str(t, 40).trim()).filter(Boolean).slice(0, 12) : [];
  const langs: StoredPost["langs"] = {};
  const src = (p.langs ?? {}) as Record<string, unknown>;
  for (const [l, t] of Object.entries(src)) {
    if (!LANGS.includes(l)) throw new InvalidPost(`Ngôn ngữ ${l} không hỗ trợ`);
    const x = (t ?? {}) as Record<string, unknown>;
    const text = { title: str(x.title, 200).trim(), excerpt: str(x.excerpt, 600).trim(), content: str(x.content, 200_000) };
    if (text.title || text.content.trim()) langs[l] = text;
  }
  if (!Object.values(langs).some((t) => t?.title && t.content.trim())) throw new InvalidPost("Bài viết cần ít nhất một ngôn ngữ có tiêu đề và nội dung.");
  return { slug, date, cover, tags, published: !!p.published, langs, updatedAt: Date.now() };
}

export async function readAllStored(): Promise<StoredPost[]> {
  if (storageKind() === "none") return [];
  const files = (await listFiles(PREFIX, 500)).filter((f) => SLUG.test(f.path.slice(PREFIX.length, -5)) && f.path.endsWith(".json"));
  const posts = await pool(files, 8, (f) => readJson<StoredPost>(f.path));
  return posts.filter((p): p is StoredPost => !!p && SLUG.test(p.slug ?? ""));
}

export async function savePost(p: StoredPost, oldSlug?: string) {
  await writeJson(`${PREFIX}${p.slug}.json`, p);
  if (oldSlug && oldSlug !== p.slug && SLUG.test(oldSlug)) await remove([`${PREFIX}${oldSlug}.json`]);
  revalidateTag(BLOG_TAG);
}

export async function deletePost(slug: string) {
  if (!SLUG.test(slug)) return;
  await remove([`${PREFIX}${slug}.json`]);
  revalidateTag(BLOG_TAG);
}

/** Cached for the public pages; refreshed the moment a post is saved. */
export const getStoredPosts = unstable_cache(async () => readAllStored().catch(() => [] as StoredPost[]), ["portfolio-blog-v1"], { tags: [BLOG_TAG], revalidate: 3600 });
