"use client";
/* Saved versions: every Save keeps a copy. Pick one to see what is different from now, then restore it into the editor. */
import { useEffect, useState } from "react";
import { Clock, History as HistoryIcon, Loader2, RotateCcw, RefreshCw } from "lucide-react";
import { Empty, api, ago, fmtDate, fmtSize } from "./ui";
import { DATA_SECTIONS, LANG_NAMES, TEXT_SECTION_INFO } from "./labels";

type V = any; // eslint-disable-line @typescript-eslint/no-explicit-any
interface Ov { data?: Record<string, V>; i18n?: Record<string, Record<string, V>>; updatedAt?: number; note?: string }
interface Ver { id: string; savedAt: number; size: number }

const secName = (k: string) => DATA_SECTIONS.find((s) => s.key === k)?.title ?? TEXT_SECTION_INFO.find((s) => s.key === k)?.title ?? (k === "seo" ? "SEO" : k);

/** Sections that differ between two saved states. */
function diff(a: Ov, b: Ov) {
  const out: string[] = [];
  const keys = Array.from(new Set([...Object.keys(a.data ?? {}), ...Object.keys(b.data ?? {})]));
  for (const k of keys) if (JSON.stringify(a.data?.[k]) !== JSON.stringify(b.data?.[k])) out.push(secName(k));
  const langs = Array.from(new Set([...Object.keys(a.i18n ?? {}), ...Object.keys(b.i18n ?? {})]));
  for (const l of langs) {
    const ks = Array.from(new Set([...Object.keys(a.i18n?.[l] ?? {}), ...Object.keys(b.i18n?.[l] ?? {})]));
    for (const k of ks) if (JSON.stringify(a.i18n?.[l]?.[k]) !== JSON.stringify(b.i18n?.[l]?.[k])) out.push(`${secName(k)} (${LANG_NAMES[l] ?? l})`);
  }
  return out;
}

export default function History({ current, onRestore, flash }: { current: Ov; onRestore: (o: Ov) => void; flash: (ok: boolean, t: string) => void }) {
  const [list, setList] = useState<Ver[] | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [ver, setVer] = useState<Ov | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try { const j = await api<{ versions: Ver[] }>("/api/admin/history"); setList(j.versions) } catch (e) { flash(false, (e as Error).message); setList([]) }
  }
  useEffect(() => { void load() }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function open(id: string) {
    setSel(id); setVer(null); setBusy(true);
    try { setVer((await api<{ version: Ov }>(`/api/admin/history?id=${id}`)).version) } catch (e) { flash(false, (e as Error).message) } finally { setBusy(false) }
  }

  if (!list) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-muted" /></div>;
  if (!list.length) return <Empty icon={<HistoryIcon />} title="Chưa có bản lưu nào" text="Từ giờ mỗi lần bấm Lưu, một bản sao được giữ lại ở đây (tối đa 60 bản gần nhất). Lỡ sửa sai thì chọn bản cũ và khôi phục." />;

  const changes = ver ? diff(ver, current) : [];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted"><span>{list.length} bản lưu</span><button type="button" onClick={() => void load()} className="inline-flex items-center gap-1 hover:text-body"><RefreshCw size={13} /> Tải lại</button></div>
        <ol className="max-h-[65vh] overflow-y-auto pl-1.5">
          {list.map((v, i) => (
            <li key={v.id} className="relative border-l border-subtle py-0.5 pl-4">
              <span className={`absolute -left-[6px] top-4 h-2.5 w-2.5 rounded-full border-2 border-base ${sel === v.id ? "bg-primary-light" : i === 0 ? "bg-green-400" : "bg-surface-hover"}`} />
              <button type="button" onClick={() => void open(v.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${sel === v.id ? "bg-primary/15" : "hover:bg-surface"}`}>
                <b className="block">{fmtDate(v.savedAt, true)}</b>
                <span className="text-xs text-muted">{ago(v.savedAt)} · {fmtSize(v.size)}{i === 0 && " · đang dùng"}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-xl border border-subtle bg-surface p-5">
        {!sel ? <p className="py-10 text-center text-sm text-muted">Chọn một bản ở bên trái để xem khác gì so với hiện tại.</p>
          : busy || !ver ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted" /></div>
          : (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><Clock size={18} className="text-primary-light" /><h3 className="font-display text-lg font-bold">Bản lưu lúc {fmtDate(Number(sel), true)}</h3></div>
              {ver.note && <p className="text-sm text-muted">Ghi chú: {ver.note}</p>}
              {!changes.length ? <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-300">Bản này giống hệt nội dung đang lưu.</p> : (
                <div>
                  <p className="mb-2 text-sm">Khôi phục bản này sẽ đổi <b>{changes.length}</b> mục:</p>
                  <ul className="flex flex-wrap gap-1.5">{changes.map((c) => <li key={c} className="chip">{c}</li>)}</ul>
                </div>
              )}
              <div className="rounded-lg border border-subtle bg-base p-3 text-xs text-muted">
                Bản này có {Object.keys(ver.data ?? {}).length} mục thông tin chung và {Object.values(ver.i18n ?? {}).reduce((n, s) => n + Object.keys(s ?? {}).length, 0)} mục chữ đã chỉnh.
              </div>
              <button type="button" disabled={!changes.length} onClick={() => { if (confirm("Nạp bản này vào trang quản lý? Bạn xem lại rồi bấm Lưu để áp dụng lên web.")) onRestore({ data: ver.data ?? {}, i18n: ver.i18n ?? {} }) }} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50"><RotateCcw size={16} /> Khôi phục bản này</button>
              <p className="text-xs text-muted">Khôi phục chỉ nạp vào phần đang sửa; trang web chưa đổi cho tới khi bạn bấm Lưu.</p>
            </div>
          )}
      </div>
    </div>
  );
}
