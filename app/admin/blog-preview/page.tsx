/* Private preview of a blog post being written in /admin (only for the signed-in owner, never indexed). */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Clock, Eye } from "lucide-react";
import ThemeProvider from "@/components/ui/ThemeProvider";
import { isAdmin } from "@/lib/content/auth";
import { readJson } from "@/lib/content/storage";
import { SLUG, type StoredPost } from "@/lib/content/posts";
import { storedToPost } from "@/lib/blog";
import { LANG_NAMES } from "@/components/admin/labels";

export const metadata: Metadata = { title: "Xem trước bài viết", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function BlogPreview({ searchParams }: { searchParams: { slug?: string; lang?: string } }) {
  if (!isAdmin()) notFound();
  const slug = searchParams.slug ?? "";
  if (!SLUG.test(slug)) notFound();
  const stored = await readJson<StoredPost>(`blog-preview/${slug}.json`);
  if (!stored) notFound();
  const langs = Object.keys(stored.langs).filter((l) => stored.langs[l]?.title);
  const lang = searchParams.lang && langs.includes(searchParams.lang) ? searchParams.lang : langs[0] ?? "vi";
  const post = storedToPost(stored, lang);
  if (!post) notFound();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-base text-body">
        <div className="sticky top-0 z-10 border-b border-amber-500/30 bg-amber-500/10 backdrop-blur">
          <div className="mx-auto flex max-w-[800px] flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
            <Eye size={16} className="text-amber-300" />
            <b className="text-amber-200">Bản xem trước</b>
            <span className="text-muted">Chỉ bạn thấy trang này{stored.published ? "" : " · bài đang là bản nháp"}.</span>
            <span className="ml-auto flex flex-wrap gap-1.5">
              {langs.map((l) => (
                <a key={l} href={`?slug=${slug}&lang=${l}`} className={`rounded-md border px-2 py-0.5 text-xs ${l === lang ? "border-primary-light bg-primary/15 text-body" : "border-subtle text-muted hover:text-body"}`}>{LANG_NAMES[l] ?? l}</a>
              ))}
            </span>
          </div>
        </div>
        <article className="container-port section-pad max-w-[800px]">
          {post.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover} alt="" className="mb-8 aspect-[1200/630] w-full rounded-xl border border-subtle object-cover" />
          )}
          <h1 className="mb-4 text-4xl font-bold" lang={post.lang}>{post.frontmatter.title}</h1>
          {!!post.tags?.length && <div className="mb-4 flex flex-wrap gap-2">{post.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>}
          <div className="mb-8 flex items-center gap-4 text-sm text-muted">
            <span>{post.frontmatter.date}</span>
            <span className="h-1 w-1 rounded-full bg-subtle" />
            <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readingTime} phút đọc</span>
          </div>
          {post.frontmatter.excerpt && <p className="mb-8 border-l-2 border-primary-light pl-4 text-lg text-muted">{post.frontmatter.excerpt}</p>}
          <div className="prose prose-invert mb-12 max-w-none" lang={post.lang}>
            <MDXRemote source={post.content} options={{ parseFrontmatter: false, blockJS: true, blockDangerousJS: true }} />
          </div>
        </article>
      </div>
    </ThemeProvider>
  );
}
