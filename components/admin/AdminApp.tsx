"use client";
/* /admin — chủ portfolio tự sửa thông tin: hồ sơ, kỹ năng, kinh nghiệm, dự án, chứng chỉ, học vấn (dùng chung mọi ngôn ngữ)
 * và chữ hiển thị của từng mục theo 7 ngôn ngữ. Lưu một lần là trang web cập nhật sau vài giây. */
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Briefcase, Check, Download, ExternalLink, FileText, FolderGit2, GraduationCap, Award, Languages, Loader2, Lock, LogOut, Menu, RotateCcw, Save, Sparkles, Undo2, Upload, User, Wrench, X, Eye, EyeOff } from "lucide-react";
import JsonEditor from "./JsonEditor";
import { DATA_SECTIONS, LANG_NAMES, LANG_ORDER, TEXT_SECTION_INFO } from "./labels";

type V = any; // eslint-disable-line @typescript-eslint/no-explicit-any
interface Overrides { data?: Record<string, V>; i18n?: Record<string, Record<string, V>>; updatedAt?: number }
interface Loaded { defaults: { data: Record<string, V>; i18n: Record<string, Record<string, V>> }; overrides: Overrides; storage: "blob" | "local" | "none" }
type Sel = { kind: "data"; key: string } | { kind: "text"; key: string } | { kind: "tools" };

const ICON: Record<string, React.ReactNode> = {
  profile: <User size={16} />, roleRotator: <Sparkles size={16} />, skills: <Wrench size={16} />, experience: <Briefcase size={16} />, projects: <FolderGit2 size={16} />,
  certifications: <Award size={16} />, languages: <Languages size={16} />, education: <GraduationCap size={16} />,
};
const clone = <T,>(x: T): T => (x === undefined ? x : structuredClone(x));
const when = (t?: number) => (t ? new Date(t).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "");

export default function AdminApp() {
  const [session, setSession] = useState<{ signedIn: boolean; configured: boolean; storage: string } | null>(null);
  useEffect(() => { fetch("/api/admin/session", { cache: "no-store" }).then((r) => r.json()).then(setSession).catch(() => setSession({ signedIn: false, configured: false, storage: "none" })) }, []);
  if (!session) return <Center><Loader2 className="animate-spin text-muted" /></Center>;
  if (!session.signedIn) return <Login configured={session.configured} onDone={() => setSession({ ...session, signedIn: true })} />;
  return <Editor onSignOut={() => setSession({ ...session, signedIn: false })} />;
}

function Center({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-base p-4 text-body">{children}</main>;
}

function Login({ configured, onDone }: { configured: boolean; onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) onDone(); else setErr(j.error ?? "Không đăng nhập được");
  }
  return (
    <Center>
      <div className="card w-full max-w-md p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white"><Lock size={20} /></span>
          <div><h1 className="font-display text-xl font-bold">Quản lý Portfolio</h1><p className="text-sm text-muted">Chỉ chủ trang mới vào được.</p></div>
        </div>
        {!configured ? (
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200"><AlertTriangle size={18} className="mt-0.5 shrink-0" /> Chưa đặt mật khẩu quản lý.</p>
            <ol className="list-decimal space-y-1.5 pl-5 text-muted">
              <li>Vào vercel.com → dự án <b className="text-body">nhut-portfolio</b> → Settings → Environment Variables.</li>
              <li>Thêm <code className="rounded bg-surface px-1">ADMIN_PASSWORD</code> = mật khẩu của bạn (ít nhất 8 ký tự).</li>
              <li>Deploy lại, rồi mở lại trang này.</li>
            </ol>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold">Mật khẩu</span>
              <span className="relative">
                <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} autoFocus autoComplete="current-password" required
                  className="w-full rounded-xl border border-subtle bg-base px-4 py-3 pr-11 text-body focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/30" />
                <button type="button" onClick={() => setShow((x) => !x)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-body" aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </span>
            </label>
            {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">{err}</p>}
            <button type="submit" disabled={busy || !pw} className="btn-primary w-full justify-center disabled:opacity-60">{busy ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />} Đăng nhập</button>
          </form>
        )}
        <a href="/vi" className="mt-6 block text-center text-sm text-muted hover:text-body">← Về trang portfolio</a>
      </div>
    </Center>
  );
}

function Editor({ onSignOut }: { onSignOut: () => void }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState<Overrides>({});
  const [saved, setSaved] = useState<Overrides>({});
  const [sel, setSel] = useState<Sel>({ kind: "data", key: "profile" });
  const [lang, setLang] = useState("vi");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [menu, setMenu] = useState(false);
  const flash = (ok: boolean, text: string) => { setToast({ ok, text }); window.setTimeout(() => setToast(null), 3500) };

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/content", { cache: "no-store" });
    if (r.status === 401) { onSignOut(); return }
    const j: Loaded = await r.json();
    setLoaded(j); setDraft(clone(j.overrides ?? {})); setSaved(clone(j.overrides ?? {}));
  }, [onSignOut]);
  useEffect(() => { void load() }, [load]);

  const dirty = useMemo(() => JSON.stringify(strip(draft)) !== JSON.stringify(strip(saved)), [draft, saved]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = "" } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(strip(draft)) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { onSignOut(); return }
      if (!r.ok) { flash(false, j.error ?? "Không lưu được"); return }
      const next = { ...strip(draft), updatedAt: j.updatedAt };
      setSaved(clone(next)); setDraft(clone(next));
      flash(true, "Đã lưu. Trang web cập nhật sau vài giây.");
    } catch { flash(false, "Mất kết nối, thử lại nhé.") } finally { setBusy(false) }
  }, [busy, draft, onSignOut]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (dirty) void save() } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [dirty, save]);

  if (!loaded) return <Center><Loader2 className="animate-spin text-muted" /></Center>;
  const D = loaded.defaults;

  // effective value = owner's edit, else the built-in default
  const dataVal = (k: string) => draft.data?.[k] ?? D.data[k];
  const textVal = (l: string, k: string) => draft.i18n?.[l]?.[k] ?? D.i18n[l]?.[k] ?? D.i18n.en?.[k];
  const setData = (k: string, v: V) => setDraft((d) => ({ ...d, data: { ...(d.data ?? {}), [k]: v } }));
  const setText = (l: string, k: string, v: V) => setDraft((d) => ({ ...d, i18n: { ...(d.i18n ?? {}), [l]: { ...(d.i18n?.[l] ?? {}), [k]: v } } }));
  const resetData = (k: string) => setDraft((d) => { const data = { ...(d.data ?? {}) }; delete data[k]; return { ...d, data } });
  const resetText = (l: string, k: string) => setDraft((d) => { const s = { ...(d.i18n?.[l] ?? {}) }; delete s[k]; return { ...d, i18n: { ...(d.i18n ?? {}), [l]: s } } });
  const dataEdited = (k: string) => draft.data?.[k] !== undefined;
  const textEdited = (l: string, k: string) => draft.i18n?.[l]?.[k] !== undefined;
  const editedCount = Object.keys(draft.data ?? {}).length + Object.values(draft.i18n ?? {}).reduce((n, s) => n + Object.keys(s ?? {}).length, 0);

  // item titles for text lists that follow the data lists (experienceData[i] ↔ experience id i)
  const jobs: V[] = dataVal("experience"), projects: V[] = dataVal("projects");
  const textItemTitle = (key: string) => (item: V, i: number) => key === "experienceData" ? `${jobs.find((j) => j.id === i)?.company ?? `#${i}`}${item?.title ? ` — ${item.title}` : ""}` : key === "projectsData" ? (projects.find((p) => p.id === i)?.title ?? `#${i}`) : "";

  async function signOut() {
    if (dirty && !confirm("Còn thay đổi chưa lưu. Vẫn đăng xuất?")) return;
    await fetch("/api/admin/session", { method: "DELETE" });
    onSignOut();
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify(strip(draft), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function importJson(f: File) {
    try { const j = JSON.parse(await f.text()); if (!j || typeof j !== "object") throw 0; setDraft({ data: j.data ?? {}, i18n: j.i18n ?? {} }); flash(true, "Đã nạp bản sao lưu. Kiểm tra rồi bấm Lưu.") } catch { flash(false, "File sao lưu không hợp lệ") }
  }

  const navBtn = (active: boolean) => `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${active ? "bg-primary/15 font-semibold text-body" : "text-muted hover:bg-surface-hover hover:text-body"}`;
  const pick = (s: Sel) => { setSel(s); setMenu(false); window.scrollTo({ top: 0 }) };

  const sidebar = (
    <nav className="space-y-6" aria-label="Mục cần sửa">
      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted">Thông tin chung</p>
        {DATA_SECTIONS.map((s) => (
          <button key={s.key} type="button" className={navBtn(sel.kind === "data" && sel.key === s.key)} onClick={() => pick({ kind: "data", key: s.key })}>
            {ICON[s.key]}<span className="flex-1">{s.title}</span>{dataEdited(s.key) && <Dot />}
          </button>
        ))}
      </div>
      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted">Nội dung chữ · 7 ngôn ngữ</p>
        {TEXT_SECTION_INFO.map((s) => (
          <button key={s.key} type="button" className={navBtn(sel.kind === "text" && sel.key === s.key)} onClick={() => pick({ kind: "text", key: s.key })}>
            <FileText size={16} /><span className="flex-1">{s.title}</span>{LANG_ORDER.some((l) => textEdited(l, s.key)) && <Dot />}
          </button>
        ))}
      </div>
      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted">Khác</p>
        <button type="button" className={navBtn(sel.kind === "tools")} onClick={() => pick({ kind: "tools" })}><Download size={16} /><span className="flex-1">Sao lưu & khôi phục</span></button>
      </div>
    </nav>
  );

  const dataInfo = sel.kind === "data" ? DATA_SECTIONS.find((s) => s.key === sel.key)! : null;
  const textInfo = sel.kind === "text" ? TEXT_SECTION_INFO.find((s) => s.key === sel.key)! : null;

  return (
    <div className="min-h-screen bg-base text-body">
      <header className="sticky top-0 z-30 border-b border-subtle bg-base/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
          <button type="button" className="rounded-lg p-2 text-muted hover:bg-surface-hover lg:hidden" onClick={() => setMenu(true)} aria-label="Mở menu"><Menu size={20} /></button>
          <span className="hidden h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand font-display text-sm font-bold text-white sm:flex">NY</span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-base font-bold text-body sm:text-lg" style={{ color: "var(--text-body)" }}>Quản lý Portfolio</h1>
            <p className="truncate text-xs text-muted">
              {dirty ? <span className="text-amber-400">● Có thay đổi chưa lưu</span> : saved.updatedAt ? <>Đã lưu lúc {when(saved.updatedAt)}</> : "Đang dùng nội dung gốc trong code"}
              {editedCount > 0 && <> · {editedCount} mục đã chỉnh</>}
            </p>
          </div>
          <a href={`/${lang}`} target="_blank" rel="noopener" className="btn-ghost hidden !px-3 !py-2 text-sm md:inline-flex"><ExternalLink size={16} /> Xem trang</a>
          <button type="button" className="btn-ghost !px-3 !py-2 text-sm disabled:opacity-40" disabled={!dirty || busy} onClick={() => { if (confirm("Bỏ mọi thay đổi chưa lưu?")) setDraft(clone(saved)) }} title="Bỏ thay đổi chưa lưu"><Undo2 size={16} /><span className="hidden sm:inline">Hoàn tác</span></button>
          <button type="button" className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50" disabled={!dirty || busy || loaded.storage === "none"} onClick={() => void save()} title="Lưu (Ctrl+S)">{busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Lưu</button>
          <button type="button" className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-body" onClick={() => void signOut()} aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={18} /></button>
        </div>
        {loaded.storage !== "blob" && (
          <div className={`border-t px-4 py-2 text-center text-xs ${loaded.storage === "none" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-amber-500/30 bg-amber-500/10 text-amber-200"}`}>
            {loaded.storage === "none"
              ? <>Chưa có kho lưu nên chưa lưu được: vào Vercel → nhut-portfolio → Storage → Create Database → <b>Blob</b> → Connect, rồi deploy lại.</>
              : <>Đang chạy trên máy: thay đổi lưu vào file <code>.data/content.json</code> (chỉ trên máy này, không lên web).</>}
          </div>
        )}
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-64 shrink-0 overflow-y-auto pr-2 lg:block">{sidebar}</aside>
        {menu && (
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMenu(false)}>
            <div className="h-full w-72 overflow-y-auto border-r border-subtle bg-base p-4" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between"><b className="font-display">Mục cần sửa</b><button type="button" onClick={() => setMenu(false)} aria-label="Đóng" className="rounded p-1.5 text-muted"><X size={18} /></button></div>
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          {dataInfo && sel.kind === "data" && (
            <Section title={dataInfo.title} hint={dataInfo.hint} edited={dataEdited(sel.key)} onReset={() => resetData(sel.key)} icon={ICON[sel.key]}>
              <JsonEditor value={dataVal(sel.key)} template={D.data[sel.key]} fieldKey={sel.key} context={sel.key} onChange={(v) => setData(sel.key, v)} />
            </Section>
          )}

          {textInfo && sel.kind === "text" && (
            <Section title={textInfo.title} hint="Chữ hiển thị trên trang theo từng ngôn ngữ. Ngôn ngữ nào chưa sửa thì dùng chữ gốc." edited={textEdited(lang, sel.key)} onReset={() => resetText(lang, sel.key)} icon={<FileText size={18} />}
              extra={
                <div className="mb-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Ngôn ngữ">
                  {LANG_ORDER.map((l) => (
                    <button key={l} type="button" role="tab" aria-selected={lang === l} onClick={() => setLang(l)}
                      className={`relative rounded-lg border px-3 py-1.5 text-sm ${lang === l ? "border-primary-light bg-primary/15 font-semibold" : "border-subtle text-muted hover:text-body"}`}>
                      {LANG_NAMES[l]}{textEdited(l, sel.key) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />}
                    </button>
                  ))}
                  {lang !== "en" && <button type="button" className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-subtle px-3 py-1.5 text-sm text-muted hover:text-body" onClick={() => { if (confirm(`Chép toàn bộ chữ tiếng Anh của mục này sang ${LANG_NAMES[lang]}?`)) setText(lang, sel.key, clone(textVal("en", sel.key))) }}><Languages size={15} /> Chép từ English</button>}
                </div>
              }>
              {textVal(lang, sel.key) == null
                ? <p className="text-sm text-muted">Mục này không có chữ cho ngôn ngữ này.</p>
                : <JsonEditor key={`${sel.key}-${lang}`} value={textVal(lang, sel.key)} template={D.i18n.en?.[sel.key]} fieldKey={sel.key} itemTitle={textItemTitle(sel.key)} onChange={(v) => setText(lang, sel.key, v)} />}
            </Section>
          )}

          {sel.kind === "tools" && (
            <Section title="Sao lưu & khôi phục" hint="Tải về toàn bộ phần bạn đã chỉnh để cất giữ, hoặc nạp lại từ file sao lưu." icon={<Download size={18} />}>
              <div className="grid gap-4 md:grid-cols-3">
                <ToolCard icon={<Download size={20} />} title="Tải bản sao lưu" text="File .json chứa mọi chỗ đã chỉnh (kể cả chưa lưu).">
                  <button type="button" className="btn-ghost !py-2 text-sm" onClick={exportJson}><Download size={16} /> Tải về</button>
                </ToolCard>
                <ToolCard icon={<Upload size={20} />} title="Nạp bản sao lưu" text="Thay phần đang chỉnh bằng nội dung trong file. Kiểm tra rồi bấm Lưu.">
                  <label className="btn-ghost cursor-pointer !py-2 text-sm"><Upload size={16} /> Chọn file<input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importJson(f); e.target.value = "" }} /></label>
                </ToolCard>
                <ToolCard icon={<RotateCcw size={20} />} title="Về nội dung gốc" text="Bỏ mọi chỉnh sửa, trang hiện lại đúng như trong code. Bấm Lưu để áp dụng.">
                  <button type="button" className="btn-ghost !py-2 text-sm text-red-400" onClick={() => { if (confirm("Bỏ toàn bộ chỉnh sửa và dùng lại nội dung gốc?")) setDraft({}) }}><RotateCcw size={16} /> Về gốc</button>
                </ToolCard>
              </div>
            </Section>
          )}
        </main>
      </div>

      {toast && (
        <div role="status" className={`fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-2xl ${toast.ok ? "border-green-500/40 bg-[#0d1f16] text-green-200" : "border-red-500/40 bg-[#24100f] text-red-200"}`}>
          {toast.ok ? <Check size={17} /> : <AlertTriangle size={17} />} {toast.text}
        </div>
      )}
    </div>
  );
}

/** Drop empty containers so "nothing edited" is stored as nothing. */
function strip(o: Overrides): Overrides {
  const out: Overrides = {};
  if (o.data && Object.keys(o.data).length) out.data = o.data;
  const i18n = Object.fromEntries(Object.entries(o.i18n ?? {}).filter(([, s]) => s && Object.keys(s).length));
  if (Object.keys(i18n).length) out.i18n = i18n;
  return out;
}

const Dot = () => <span className="h-2 w-2 rounded-full bg-amber-400" title="Đã chỉnh" />;

function Section({ title, hint, edited, onReset, icon, extra, children }: { title: string; hint: string; edited?: boolean; onReset?: () => void; icon?: React.ReactNode; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary-light">{icon}</span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">{title}{edited && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-300">Đã chỉnh</span>}</h2>
          <p className="mt-0.5 text-sm text-muted">{hint}</p>
        </div>
        {edited && onReset && <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-subtle px-3 py-1.5 text-sm text-muted hover:text-body" onClick={() => { if (confirm("Đưa mục này về nội dung gốc?")) onReset() }}><RotateCcw size={15} /> Về gốc</button>}
      </div>
      {extra}
      {children}
    </section>
  );
}

function ToolCard({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-subtle bg-surface p-4">
      <span className="text-primary-light">{icon}</span>
      <div><b className="font-display">{title}</b><p className="mt-1 text-sm text-muted">{text}</p></div>
      <div className="mt-auto">{children}</div>
    </div>
  );
}
