/* Admin blog — GET: posts written in /admin (drafts too) + the posts that live in code
 *  · GET ?file=<slug>: a code post in every language (to copy it into the editor)
 *  · PUT {post, oldSlug?, preview?}: save (or keep a private preview copy) · DELETE {slug}. */
import { NextResponse } from "next/server";
import { compile } from "@mdx-js/mdx";
import { isAdmin, sameOrigin } from "@/lib/content/auth";
import { cleanPost, deletePost, InvalidPost, readAllStored, savePost, SLUG } from "@/lib/content/posts";
import { NoStorage, writeJson } from "@/lib/content/storage";
import { filePostForAdmin, getSlugs, getPostSync } from "@/lib/blog";
import { i18n } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";
const deny = () => NextResponse.json({ error: "Phiên đăng nhập đã hết, đăng nhập lại nhé." }, { status: 401 });
const noStore = { "Cache-Control": "no-store" };

export async function GET(req: Request) {
  if (!isAdmin()) return deny();
  const file = new URL(req.url).searchParams.get("file");
  if (file) {
    if (!SLUG.test(file) || !getSlugs().includes(file)) return NextResponse.json({ error: "Không có bài này" }, { status: 404 });
    return NextResponse.json({ post: filePostForAdmin(file, i18n.locales) }, { headers: noStore });
  }
  const stored = await readAllStored().catch(() => []);
  const files = getSlugs().map((slug) => {
    const p = getPostSync(slug, "vi");
    return { slug, title: p?.frontmatter.title ?? slug, date: p?.frontmatter.date ?? "", langs: i18n.locales.filter((l) => getPostSync(slug, l)?.lang === l) };
  });
  return NextResponse.json({ stored: stored.sort((a, b) => b.date.localeCompare(a.date)), files }, { headers: noStore });
}

/** Turn an MDX compile error into a sentence the owner can act on. */
async function checkMdx(post: ReturnType<typeof cleanPost>) {
  for (const [lang, t] of Object.entries(post.langs)) {
    if (!t?.content.trim()) continue;
    try {
      await compile(t.content, { format: "mdx" });
    } catch (err) {
      const e = err as { line?: number; reason?: string; message?: string };
      throw new InvalidPost(`Nội dung (${lang.toUpperCase()}) có lỗi${e.line ? ` ở dòng ${e.line}` : ""}: ${e.reason ?? e.message ?? ""}. Mẹo: ký tự < và { cần đặt trong \`code\`.`);
    }
  }
}

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Không được phép" }, { status: 403 });
  if (!isAdmin()) return deny();
  try {
    const b = await req.json();
    const post = cleanPost(b?.post);
    await checkMdx(post);
    if (b?.preview) {
      await writeJson(`blog-preview/${post.slug}.json`, post);
      return NextResponse.json({ ok: true, preview: `/admin/blog-preview?slug=${post.slug}` });
    }
    const oldSlug = typeof b?.oldSlug === "string" ? b.oldSlug : undefined;
    if (oldSlug !== post.slug) {
      const taken = (await readAllStored()).some((p) => p.slug === post.slug);
      if (taken) return NextResponse.json({ error: "Đường dẫn này đã có bài khác dùng rồi." }, { status: 409 });
    }
    await savePost(post, oldSlug);
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    if (err instanceof InvalidPost || err instanceof NoStorage) return NextResponse.json({ error: err.message }, { status: 400 });
    if (err instanceof SyntaxError) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    console.error("blog save", err);
    return NextResponse.json({ error: "Không lưu được, thử lại nhé." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Không được phép" }, { status: 403 });
  if (!isAdmin()) return deny();
  const b = await req.json().catch(() => ({}));
  if (typeof b.slug !== "string" || !SLUG.test(b.slug)) return NextResponse.json({ error: "Bài không hợp lệ" }, { status: 400 });
  await deletePost(b.slug);
  return NextResponse.json({ ok: true });
}
