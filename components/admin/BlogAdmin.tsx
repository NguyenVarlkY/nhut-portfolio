"use client";
/* Blog written from /admin: list of posts (yours + the ones in code), and an editor with 7 language tabs,
 * Markdown toolbar, pictures from the library, auto-translate, private preview, draft / published. */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bold, Code, Copy, Eye, FileCode2, Heading2, ImagePlus, Italic, Languages, Link2, List, Loader2, Newspaper, Plus, Quote, Save, Trash2, Wand2, Globe, EyeOff } from "lucide-react";
import { Empty, api, ago, inputCls } from "./ui";
import { MediaInput, MediaPicker } from "./Media";
import { LANG_NAMES, LANG_ORDER } from "./labels";

interface PostText { title: string; excerpt: string; content: string }
interface Post { slug: string; date: string; cover: string; tags: string[]; published: boolean; langs: Record<string, PostText | undefined>; updatedAt?: number }
interface FilePost { slug: string; title: string; date: string; langs: string[] }

const today = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const blankText = (): PostText => ({ title: "", excerpt: "", content: "" });
const titleOf = (p: Post) => p.langs.vi?.title || Object.values(p.langs).find((t) => t?.title)?.title || p.slug;

export default function BlogAdmin({ flash, canTranslate }: { flash: (ok: boolean, t: string) => void; canTranslate: boolean }) {
  const [stored, setStored] = useState<Post[] | null>(null);
  const [files, setFiles] = useState<FilePost[]>([]);
  const [edit, setEdit] = useState<{ post: Post; oldSlug?: string } | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    try { const j = await api<{ stored: Post[]; files: FilePost[] }>("/api/admin/blog"); setStored(j.stored); setFiles(j.files) } catch (e) { flash(false, (e as Error).message); setStored([]) }
  }
  useEffect(() => { void load() }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function copyFile(slug: string) {
    try {
      const j = await api<{ post: { slug: string; date: string; langs: Record<string, PostText> } }>(`/api/admin/blog?file=${slug}`);
      setEdit({ post: { slug: j.post.slug, date: j.post.date || today(), cover: "", tags: [], published: true, langs: j.post.langs } });
    } catch (e) { flash(false, (e as Error).message) }
  }

  if (edit) return <Editor key={edit.oldSlug ?? "new"} init={edit.post} oldSlug={edit.oldSlug} canTranslate={canTranslate} flash={flash} onClose={() => { setEdit(null); void load() }} replacesFile={files.some((f) => f.slug === edit.post.slug)} />;
  if (!stored) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-muted" /></div>;

  const mine = stored.filter((p) => !q || `${titleOf(p)} ${p.slug} ${p.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  const storedSlugs = new Set(stored.map((p) => p.slug));
  const code = files.filter((f) => !storedSlugs.has(f.slug) && (!q || `${f.title} ${f.slug}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary !px-4 !py-2 text-sm" onClick={() => setEdit({ post: { slug: "", date: today(), cover: "", tags: [], published: false, langs: { vi: blankText() } } })}><Plus size={16} /> Viết bài mới</button>
        <input className={`${inputCls} max-w-xs`} placeholder="Tìm bài viết" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="self-center text-xs text-muted">{stored.length} bài của bạn · {files.length} bài có sẵn</span>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-muted">Bài bạn viết</h3>
        {!mine.length ? <Empty icon={<Newspaper />} title="Chưa có bài nào" text="Viết bài chia sẻ kinh nghiệm giúp khách hiểu cách bạn làm việc, và giúp Google tìm thấy bạn." /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {mine.map((p) => {
              const langs = LANG_ORDER.filter((l) => p.langs[l]?.title);
              return (
                <button key={p.slug} type="button" onClick={() => setEdit({ post: structuredClone(p), oldSlug: p.slug })} className="flex gap-3 overflow-hidden rounded-xl border border-subtle bg-surface p-3 text-left transition hover:border-primary-light/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.cover ? <img src={p.cover} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" /> : <span className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white/80"><Newspaper /></span>}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.published ? "bg-green-500/15 text-green-300" : "bg-amber-400/15 text-amber-300"}`}>{p.published ? "Đã đăng" : "Bản nháp"}</span>
                      <span className="font-mono text-[11px] text-muted">{p.date}</span>
                    </div>
                    <b className="mt-1 line-clamp-2 block text-sm">{titleOf(p)}</b>
                    <p className="mt-1 truncate text-[11px] text-muted">{langs.map((l) => l.toUpperCase()).join(" · ")}{p.updatedAt ? ` · sửa ${ago(p.updatedAt)}` : ""}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!!code.length && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-muted">Bài có sẵn trong code ({code.length})</h3>
          <p className="mb-2 text-xs text-muted">Muốn sửa bài nào thì bấm “Sửa” — bản bạn lưu sẽ thay bài gốc trên trang.</p>
          <ul className="divide-y divide-[var(--border-subtle,#ffffff14)] rounded-xl border border-subtle bg-surface">
            {code.map((f) => (
              <li key={f.slug} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <FileCode2 size={16} className="shrink-0 text-muted" />
                <span className="min-w-0 flex-1 truncate">{f.title}</span>
                <span className="hidden font-mono text-[11px] text-muted sm:inline">{f.date}</span>
                <span className="hidden text-[11px] text-muted md:inline">{f.langs.length} ngôn ngữ</span>
                <button type="button" onClick={() => void copyFile(f.slug)} className="inline-flex items-center gap-1 rounded-md border border-subtle px-2.5 py-1 text-xs text-muted hover:text-body"><Copy size={12} /> Sửa</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Editor({ init, oldSlug, onClose, flash, canTranslate, replacesFile }: { init: Post; oldSlug?: string; onClose: () => void; flash: (ok: boolean, t: string) => void; canTranslate: boolean; replacesFile: boolean }) {
  const [p, setP] = useState<Post>(init);
  const [lang, setLang] = useState(LANG_ORDER.find((l) => init.langs[l]?.title) ?? "vi");
  const [slugTouched, setSlugTouched] = useState(!!init.slug);
  const [busy, setBusy] = useState<"" | "save" | "preview" | "translate" | "delete">("");
  const [pick, setPick] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [saved, setSaved] = useState(JSON.stringify(init));
  const ta = useRef<HTMLTextAreaElement>(null);
  const t = p.langs[lang] ?? blankText();
  const dirty = JSON.stringify(p) !== saved;

  const setT = (patch: Partial<PostText>) => setP((x) => {
    const next = { ...x, langs: { ...x.langs, [lang]: { ...(x.langs[lang] ?? blankText()), ...patch } } };
    if (!slugTouched && patch.title !== undefined && (lang === "vi" || !x.langs.vi?.title)) next.slug = slugify(patch.title);
    return next;
  });
  const words = useMemo(() => t.content.trim().split(/\s+/).filter(Boolean).length, [t.content]);

  function wrap(before: string, after = before, placeholder = "chữ") {
    const el = ta.current; if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e) || placeholder;
    setT({ content: value.slice(0, s) + before + sel + after + value.slice(e) });
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + sel.length) });
  }
  function linePrefix(prefix: string) {
    const el = ta.current; if (!el) return;
    const { selectionStart: s, value } = el;
    const ls = value.lastIndexOf("\n", s - 1) + 1;
    setT({ content: value.slice(0, ls) + prefix + value.slice(ls) });
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + prefix.length, s + prefix.length) });
  }
  const insert = (text: string) => { const el = ta.current; const s = el?.selectionStart ?? t.content.length; setT({ content: t.content.slice(0, s) + text + t.content.slice(s) }) };

  async function send(preview: boolean) {
    setBusy(preview ? "preview" : "save");
    const win = preview ? window.open("about:blank", "_blank") : null;
    try {
      const j = await api<{ preview?: string; post?: Post }>("/api/admin/blog", { method: "PUT", json: { post: p, oldSlug, preview } });
      if (preview && j.preview) { if (win) win.location.href = `${j.preview}&lang=${lang}`; else window.open(`${j.preview}&lang=${lang}`, "_blank") }
      else if (j.post) { setP(j.post); setSaved(JSON.stringify(j.post)); flash(true, p.published ? "Đã lưu — bài hiện trên blog sau vài giây." : "Đã lưu bản nháp (chưa hiện trên trang).") ; if (!oldSlug || oldSlug !== j.post.slug) onClose() }
    } catch (e) { win?.close(); flash(false, (e as Error).message) } finally { setBusy("") }
  }
  async function del() {
    if (!oldSlug || !confirm(`Xoá bài “${titleOf(p)}”? Không lấy lại được.`)) return;
    setBusy("delete");
    try { await api("/api/admin/blog", { method: "DELETE", json: { slug: oldSlug } }); flash(true, "Đã xoá bài"); onClose() } catch (e) { flash(false, (e as Error).message) } finally { setBusy("") }
  }
  async function translate(targets: string[]) {
    const from = p.langs.vi?.content.trim() ? "vi" : LANG_ORDER.find((l) => !targets.includes(l) && p.langs[l]?.content.trim()) ?? "vi";
    const value = p.langs[from];
    if (!value?.content.trim()) { flash(false, "Viết bài ở một ngôn ngữ trước đã, rồi mới dịch."); return }
    if (targets.some((l) => p.langs[l]?.content.trim()) && !confirm("Bản dịch sẽ ghi đè nội dung đang có ở ngôn ngữ đích. Tiếp tục?")) return;
    setBusy("translate");
    let ok = 0;
    for (const to of targets.filter((l) => l !== from)) {
      try {
        const j = await api<{ result: PostText }>("/api/admin/translate", { method: "POST", json: { from, to, value, kind: "markdown" } });
        setP((x) => ({ ...x, langs: { ...x.langs, [to]: j.result } })); ok++;
      } catch (e) { flash(false, `${LANG_NAMES[to]}: ${(e as Error).message}`); break }
    }
    setBusy("");
    if (ok) flash(true, `Đã dịch sang ${ok} ngôn ngữ từ ${LANG_NAMES[from]}. Xem lại rồi Lưu.`);
  }

  const tb = "rounded-md p-1.5 text-muted hover:bg-surface-hover hover:text-body";
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => { if (!dirty || confirm("Bỏ thay đổi chưa lưu của bài này?")) onClose() }} className="btn-ghost !px-3 !py-2 text-sm"><ArrowLeft size={16} /> Danh sách</button>
        <span className="text-sm text-muted">{oldSlug ? "Sửa bài" : "Bài mới"}{dirty && <span className="text-amber-400"> · chưa lưu</span>}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          {oldSlug && <button type="button" onClick={() => void del()} disabled={!!busy} className="btn-ghost !px-3 !py-2 text-sm text-red-400"><Trash2 size={16} /> Xoá</button>}
          <button type="button" onClick={() => void send(true)} disabled={!!busy} className="btn-ghost !px-3 !py-2 text-sm">{busy === "preview" ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />} Xem trước</button>
          <button type="button" onClick={() => void send(false)} disabled={!!busy} className="btn-primary !px-4 !py-2 text-sm">{busy === "save" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Lưu bài</button>
        </div>
      </div>
      {replacesFile && <p className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-200">Bài này trùng đường dẫn với một bài có sẵn trong code — khi lưu, bản của bạn sẽ hiện thay bài gốc.</p>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Ngôn ngữ">
            {LANG_ORDER.map((l) => (
              <button key={l} type="button" role="tab" aria-selected={lang === l} onClick={() => setLang(l)} className={`relative rounded-lg border px-3 py-1.5 text-sm ${lang === l ? "border-primary-light bg-primary/15 font-semibold" : "border-subtle text-muted hover:text-body"}`}>
                {LANG_NAMES[l]}{p.langs[l]?.title && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-green-400" />}
              </button>
            ))}
          </div>
          <input className={`${inputCls} !py-3 font-display !text-lg font-bold`} placeholder={`Tiêu đề (${LANG_NAMES[lang]})`} value={t.title} onChange={(e) => setT({ title: e.target.value })} maxLength={200} />
          <textarea className={`${inputCls} min-h-[70px]`} placeholder="Tóm tắt ngắn — hiện trong danh sách bài và khi chia sẻ link" value={t.excerpt} onChange={(e) => setT({ excerpt: e.target.value })} maxLength={600} rows={2} />
          <div className="overflow-hidden rounded-lg border border-subtle bg-base focus-within:border-primary-light">
            <div className="flex flex-wrap items-center gap-0.5 border-b border-subtle bg-surface px-2 py-1">
              <button type="button" className={tb} onClick={() => linePrefix("## ")} title="Tiêu đề mục" aria-label="Tiêu đề mục"><Heading2 size={16} /></button>
              <button type="button" className={tb} onClick={() => wrap("**")} title="In đậm" aria-label="In đậm"><Bold size={16} /></button>
              <button type="button" className={tb} onClick={() => wrap("*")} title="In nghiêng" aria-label="In nghiêng"><Italic size={16} /></button>
              <button type="button" className={tb} onClick={() => wrap("[", "](https://)", "chữ hiển thị")} title="Chèn link" aria-label="Chèn link"><Link2 size={16} /></button>
              <button type="button" className={tb} onClick={() => linePrefix("- ")} title="Danh sách" aria-label="Danh sách"><List size={16} /></button>
              <button type="button" className={tb} onClick={() => linePrefix("> ")} title="Trích dẫn" aria-label="Trích dẫn"><Quote size={16} /></button>
              <button type="button" className={tb} onClick={() => wrap("`")} title="Mã ngắn" aria-label="Mã ngắn"><Code size={16} /></button>
              <button type="button" className={tb} onClick={() => wrap("\n```ts\n", "\n```\n", "// code")} title="Khối mã" aria-label="Khối mã"><FileCode2 size={16} /></button>
              <button type="button" className={tb} onClick={() => setPick(true)} title="Chèn ảnh" aria-label="Chèn ảnh"><ImagePlus size={16} /></button>
              <span className="ml-auto text-[11px] text-muted">{words} chữ · ~{Math.max(1, Math.round(words / 220))} phút đọc</span>
            </div>
            <textarea ref={ta} className="block min-h-[440px] w-full resize-y bg-transparent p-4 font-mono text-[13px] leading-relaxed text-body outline-none" value={t.content} onChange={(e) => setT({ content: e.target.value })} placeholder={"Viết bằng Markdown.\n\n## Tiêu đề mục\nĐoạn văn… **in đậm**, `code`, [link](https://…)\n\n- gạch đầu dòng"} spellCheck={false} />
          </div>
          <p className="text-[11px] text-muted">Mẹo: ký tự <code>{"<"}</code> và <code>{"{"}</code> trong đoạn văn cần đặt trong dấu <code>`…`</code>. Bấm “Xem trước” để kiểm tra trước khi đăng.</p>
        </div>

        <aside className="space-y-4">
          <div className="space-y-3 rounded-xl border border-subtle bg-surface p-4">
            <button type="button" role="switch" aria-checked={p.published} onClick={() => setP((x) => ({ ...x, published: !x.published }))} className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm ${p.published ? "border-green-500/40 bg-green-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
              {p.published ? <Globe size={18} className="text-green-300" /> : <EyeOff size={18} className="text-amber-300" />}
              <span className="flex-1"><b className="block">{p.published ? "Đăng công khai" : "Bản nháp"}</b><span className="text-xs text-muted">{p.published ? "Ai cũng đọc được" : "Chỉ bạn thấy (qua Xem trước)"}</span></span>
            </button>
            <label className="grid gap-1"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Đường dẫn</span>
              <input className={`${inputCls} font-mono text-xs`} value={p.slug} onChange={(e) => { setSlugTouched(true); setP((x) => ({ ...x, slug: slugify(e.target.value) })) }} placeholder="bai-viet-dau-tien" />
              <span className="truncate text-[11px] text-muted">/{lang}/blog/{p.slug || "…"}</span>
            </label>
            <label className="grid gap-1"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Ngày đăng</span><input type="date" className={inputCls} value={p.date} onChange={(e) => setP((x) => ({ ...x, date: e.target.value }))} /></label>
            <div className="grid gap-1"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Ảnh bìa</span><MediaInput value={p.cover} onChange={(v) => setP((x) => ({ ...x, cover: v }))} wide /></div>
            <div className="grid gap-1"><span className="text-xs font-semibold uppercase tracking-wide text-muted">Thẻ</span>
              <div className="flex flex-wrap gap-1.5 rounded-lg border border-subtle bg-base p-2">
                {p.tags.map((g) => <span key={g} className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-xs">{g}<button type="button" onClick={() => setP((x) => ({ ...x, tags: x.tags.filter((y) => y !== g) }))} className="text-muted hover:text-red-400" aria-label={`Bỏ ${g}`}>×</button></span>)}
                <input className="min-w-[90px] flex-1 bg-transparent text-xs outline-none" value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} placeholder="Thêm thẻ + Enter"
                  onKeyDown={(e) => { if (e.key === "Enter" && tagDraft.trim()) { e.preventDefault(); const v = tagDraft.trim().slice(0, 40); setP((x) => ({ ...x, tags: x.tags.includes(v) ? x.tags : [...x.tags, v].slice(0, 12) })); setTagDraft("") } }} />
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-subtle bg-surface p-4">
            <b className="flex items-center gap-2 text-sm"><Languages size={16} className="text-primary-light" /> Dịch tự động</b>
            {!canTranslate ? <p className="text-xs text-muted">Chưa bật: thêm <code>OPENAI_API_KEY</code> trên Vercel.</p> : (
              <>
                <button type="button" disabled={!!busy || lang === "vi"} onClick={() => void translate([lang])} className="btn-ghost w-full justify-center !py-2 text-sm disabled:opacity-40">{busy === "translate" ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} Dịch sang {LANG_NAMES[lang]}</button>
                <button type="button" disabled={!!busy} onClick={() => void translate(LANG_ORDER.filter((l) => l !== "vi"))} className="btn-ghost w-full justify-center !py-2 text-sm disabled:opacity-40"><Languages size={15} /> Dịch từ Tiếng Việt sang 6 ngôn ngữ</button>
                <p className="text-[11px] text-muted">Giữ nguyên code, link và tên công nghệ. Bạn xem lại từng bản rồi bấm Lưu.</p>
              </>
            )}
          </div>
        </aside>
      </div>
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(u) => { insert(`\n![mô tả ảnh](${u})\n`); setPick(false) }} />}
    </div>
  );
}
