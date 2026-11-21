"use client";
/* Uploaded pictures & files: the library page, a picker window, and the picture field used inside the editors
 * (avatar, project screenshots, CV, share image, blog cover). Big photos are shrunk in the browser before upload. */
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, FileText, ImageIcon, ImagePlus, Loader2, Search, Trash2, Upload, X, ArrowLeft, ArrowRight, Link2 } from "lucide-react";
import { Empty, api, fmtSize, ago, inputCls } from "./ui";

export interface MediaFile { path: string; url: string; size: number; uploadedAt: number; kind: "image" | "pdf" }

const MAX_SIDE = 2400;
const LIMIT = 4 * 1024 * 1024;

/** Shrink large photos (keeps GIF animations and PDFs as they are). */
async function prepare(file: File): Promise<Blob> {
  if (!/^image\/(png|jpeg|webp|avif)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size <= 1.5 * 1024 * 1024) { bmp.close(); return file }
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close();
    for (const q of [0.86, 0.78, 0.68]) {
      const out: Blob | null = await new Promise((r) => c.toBlob(r, "image/webp", q));
      if (out && out.size <= LIMIT) return out.size < file.size ? out : file;
    }
  } catch { /* keep the original */ }
  return file;
}

export async function uploadFile(file: File): Promise<MediaFile> {
  const blob = await prepare(file);
  if (blob.size > LIMIT) throw new Error(`“${file.name}” lớn quá (tối đa 4 MB).`);
  const fd = new FormData();
  const name = blob === file ? file.name : file.name.replace(/\.[^.]*$/, "") + ".webp";
  fd.append("file", blob, name);
  const j = await api<{ path: string; url: string; size: number; kind: "image" | "pdf" }>("/api/admin/media", { method: "POST", body: fd });
  return { ...j, uploadedAt: Date.now() };
}

function useMedia() {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [err, setErr] = useState("");
  const reload = useCallback(async () => {
    try { const j = await api<{ files: MediaFile[] }>("/api/admin/media"); setFiles(j.files.sort((a, b) => b.uploadedAt - a.uploadedAt)); setErr("") }
    catch (e) { setErr((e as Error).message); setFiles([]) }
  }, []);
  useEffect(() => { void reload() }, [reload]);
  return { files, setFiles, err, reload };
}

/** Drop zone + file button. */
function Uploader({ onDone, accept = "image/*,application/pdf", compact }: { onDone: (f: MediaFile[]) => void; accept?: string; compact?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);
  async function run(list: FileList | File[]) {
    const arr = Array.from(list).slice(0, 20);
    if (!arr.length) return;
    setErr("");
    const done: MediaFile[] = [];
    for (let i = 0; i < arr.length; i++) { const f = arr[i];
      setBusy(arr.length > 1 ? `Đang tải ${i + 1}/${arr.length}…` : "Đang tải lên…");
      try { done.push(await uploadFile(f)) } catch (e) { setErr((e as Error).message) }
    }
    setBusy(null);
    if (done.length) onDone(done);
  }
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); void run(e.dataTransfer.files) }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-center transition ${compact ? "px-4 py-5" : "px-6 py-9"} ${over ? "border-primary-light bg-primary/10" : "border-subtle hover:border-primary-light/60 hover:bg-surface"}`}>
      {busy ? <Loader2 className="animate-spin text-primary-light" /> : <Upload className="text-primary-light" />}
      <b className="text-sm">{busy ?? "Kéo thả file vào đây, hoặc bấm để chọn"}</b>
      <span className="text-xs text-muted">Ảnh PNG, JPG, WebP, GIF, AVIF hoặc PDF · tối đa 4 MB · ảnh lớn được tự thu nhỏ</span>
      {err && <span className="mt-1 text-xs text-red-400">{err}</span>}
      <input type="file" multiple accept={accept} className="sr-only" disabled={!!busy} onChange={(e) => { if (e.target.files) void run(e.target.files); e.target.value = "" }} />
    </label>
  );
}

function Thumb({ f, className = "" }: { f: MediaFile | { url: string; kind?: string }; className?: string }) {
  const pdf = f.kind === "pdf" || /\.pdf$/i.test(f.url);
  if (pdf) return <div className={`flex flex-col items-center justify-center gap-1 bg-red-500/10 text-red-300 ${className}`}><FileText size={28} /><span className="text-[10px] font-bold">PDF</span></div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={f.url} alt="" loading="lazy" className={`bg-[repeating-conic-gradient(#ffffff10_0_25%,transparent_0_50%)] bg-[length:16px_16px] object-cover ${className}`} />;
}

const nameOf = (p: string) => p.split("/").pop()!.replace(/^[a-f0-9]{12}-/, "");

/** The full library page. */
export function MediaLibrary({ flash }: { flash: (ok: boolean, t: string) => void }) {
  const { files, setFiles, err } = useMedia();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "image" | "pdf">("all");
  const [copied, setCopied] = useState("");
  const shown = (files ?? []).filter((f) => (kind === "all" || f.kind === kind) && nameOf(f.path).includes(q.toLowerCase()));
  const total = (files ?? []).reduce((n, f) => n + f.size, 0);
  async function del(f: MediaFile) {
    if (!confirm(`Xoá “${nameOf(f.path)}”? Chỗ nào đang dùng file này sẽ mất ảnh.`)) return;
    try { await api(`/api/admin/media?path=${encodeURIComponent(f.path)}`, { method: "DELETE" }); setFiles((x) => (x ?? []).filter((y) => y.path !== f.path)); flash(true, "Đã xoá file") } catch (e) { flash(false, (e as Error).message) }
  }
  function copy(f: MediaFile) { void navigator.clipboard.writeText(location.origin + f.url); setCopied(f.path); setTimeout(() => setCopied(""), 1500) }
  return (
    <div className="space-y-5">
      <Uploader onDone={(n) => { setFiles((x) => [...n, ...(x ?? [])]); flash(true, `Đã tải lên ${n.length} file`) }} />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input className={`${inputCls} pl-9`} placeholder="Tìm theo tên file" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {(["all", "image", "pdf"] as const).map((k) => <button key={k} type="button" onClick={() => setKind(k)} className={`rounded-lg border px-3 py-2 text-sm ${kind === k ? "border-primary-light bg-primary/15 font-semibold" : "border-subtle text-muted"}`}>{k === "all" ? "Tất cả" : k === "image" ? "Ảnh" : "PDF"}</button>)}
        <span className="text-xs text-muted">{files?.length ?? 0} file · {fmtSize(total)}</span>
      </div>
      {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
      {!files ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted" /></div>
        : !shown.length ? <Empty icon={<ImageIcon />} title={files.length ? "Không có file khớp" : "Chưa có file nào"} text="Ảnh đại diện, ảnh chụp dự án, CV và ảnh bài viết bạn tải lên sẽ nằm ở đây." />
        : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {shown.map((f) => (
              <div key={f.path} className="group overflow-hidden rounded-xl border border-subtle bg-surface">
                <a href={f.url} target="_blank" rel="noopener" className="block"><Thumb f={f} className="aspect-[4/3] w-full" /></a>
                <div className="space-y-1.5 p-2.5">
                  <p className="truncate text-xs font-semibold" title={nameOf(f.path)}>{nameOf(f.path)}</p>
                  <p className="text-[11px] text-muted">{fmtSize(f.size)} · {ago(f.uploadedAt)}</p>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => copy(f)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-subtle px-2 py-1 text-[11px] text-muted hover:text-body">{copied === f.path ? <Check size={12} /> : <Copy size={12} />} {copied === f.path ? "Đã chép" : "Chép link"}</button>
                    <button type="button" onClick={() => void del(f)} className="rounded-md border border-subtle px-2 py-1 text-muted hover:border-red-500/40 hover:text-red-400" aria-label="Xoá"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

/** Modal: pick an uploaded file (or upload a new one). */
export function MediaPicker({ onPick, onClose, kind = "image" }: { onPick: (url: string) => void; onClose: () => void; kind?: "image" | "pdf" | "any" }) {
  const { files, setFiles } = useMedia();
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k) }, [onClose]);
  const shown = (files ?? []).filter((f) => kind === "any" || f.kind === kind);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-subtle bg-base shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-subtle px-5 py-3"><ImagePlus size={18} className="text-primary-light" /><b className="flex-1 font-display">Chọn {kind === "pdf" ? "file PDF" : "ảnh"}</b><button type="button" onClick={onClose} className="rounded p-1.5 text-muted hover:text-body" aria-label="Đóng"><X size={18} /></button></div>
        <div className="space-y-4 overflow-y-auto p-5">
          <Uploader compact accept={kind === "pdf" ? "application/pdf" : kind === "image" ? "image/*" : "image/*,application/pdf"} onDone={(n) => { setFiles((x) => [...n, ...(x ?? [])]); if (n.length === 1) onPick(n[0].url) }} />
          {!files ? <div className="flex justify-center py-6"><Loader2 className="animate-spin text-muted" /></div>
            : !shown.length ? <p className="py-6 text-center text-sm text-muted">Thư viện chưa có file phù hợp — tải lên ở trên.</p>
            : <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">{shown.map((f) => (
              <button key={f.path} type="button" onClick={() => onPick(f.url)} className="overflow-hidden rounded-lg border border-subtle text-left hover:border-primary-light focus-visible:ring-2 focus-visible:ring-primary-light">
                <Thumb f={f} className="aspect-[4/3] w-full" /><span className="block truncate px-2 py-1 text-[11px] text-muted">{nameOf(f.path)}</span>
              </button>))}</div>}
        </div>
      </div>
    </div>
  );
}

/** A single picture/file field: preview, upload, choose from library, or paste a link. */
export function MediaInput({ value, onChange, kind = "image", wide }: { value: string; onChange: (v: string) => void; kind?: "image" | "pdf"; wide?: boolean }) {
  const [pick, setPick] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [link, setLink] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  async function up(f?: File) { if (!f) return; setBusy(true); setErr(""); try { onChange((await uploadFile(f)).url) } catch (e) { setErr((e as Error).message) } finally { setBusy(false) } }
  return (
    <div className="flex items-start gap-3 rounded-lg border border-subtle bg-base p-2.5">
      <div className={`shrink-0 overflow-hidden rounded-md border border-subtle ${wide ? "h-[72px] w-[128px]" : "h-[72px] w-[72px]"}`}>
        {value ? <a href={value} target="_blank" rel="noopener"><Thumb f={{ url: value, kind }} className="h-full w-full" /></a> : <div className="flex h-full w-full items-center justify-center text-muted">{kind === "pdf" ? <FileText size={22} /> : <ImageIcon size={22} />}</div>}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-semibold text-primary-light hover:bg-primary/25">{busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Tải lên</button>
          <button type="button" onClick={() => setPick(true)} className="inline-flex items-center gap-1.5 rounded-md border border-subtle px-2.5 py-1.5 text-xs text-muted hover:text-body"><ImageIcon size={13} /> Thư viện</button>
          <button type="button" onClick={() => setLink((x) => !x)} className="inline-flex items-center gap-1.5 rounded-md border border-subtle px-2.5 py-1.5 text-xs text-muted hover:text-body"><Link2 size={13} /> Dán link</button>
          {value && <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted hover:text-red-400"><X size={13} /> Bỏ</button>}
        </div>
        {(link || (value && !value.startsWith("/api/media/"))) && <input className={`${inputCls} !py-1.5 text-xs`} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" />}
        {!link && value.startsWith("/api/media/") && <p className="truncate text-[11px] text-muted">{nameOf(value)}</p>}
        {!value && !link && <p className="text-[11px] text-muted">{kind === "pdf" ? "Chưa có file — đang dùng file mặc định." : "Chưa có ảnh."}</p>}
        {err && <p className="text-[11px] text-red-400">{err}</p>}
      </div>
      <input ref={ref} type="file" accept={kind === "pdf" ? "application/pdf" : "image/*"} className="sr-only" onChange={(e) => { void up(e.target.files?.[0]); e.target.value = "" }} />
      {pick && <MediaPicker kind={kind} onClose={() => setPick(false)} onPick={(u) => { onChange(u); setPick(false) }} />}
    </div>
  );
}

/** A list of pictures (project gallery). */
export function MediaList({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [pick, setPick] = useState(false);
  const mv = (i: number, d: number) => { const b = [...value]; const j = i + d; if (j < 0 || j >= b.length) return; [b[i], b[j]] = [b[j], b[i]]; onChange(b) };
  return (
    <div className="rounded-lg border border-subtle bg-base p-2.5">
      <div className="flex flex-wrap gap-2.5">
        {value.map((u, i) => (
          <div key={`${u}-${i}`} className="group relative h-[84px] w-[132px] overflow-hidden rounded-md border border-subtle">
            <Thumb f={{ url: u }} className="h-full w-full" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 p-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" onClick={() => mv(i, -1)} disabled={i === 0} className="rounded p-1 text-white disabled:opacity-30" aria-label="Sang trái"><ArrowLeft size={13} /></button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-red-300" aria-label="Xoá ảnh"><Trash2 size={13} /></button>
              <button type="button" onClick={() => mv(i, 1)} disabled={i === value.length - 1} className="rounded p-1 text-white disabled:opacity-30" aria-label="Sang phải"><ArrowRight size={13} /></button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setPick(true)} className="flex h-[84px] w-[132px] flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-subtle text-xs text-muted hover:border-primary-light hover:text-body"><ImagePlus size={18} /> Thêm ảnh</button>
      </div>
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(u) => { onChange([...value, u]); setPick(false) }} />}
    </div>
  );
}
