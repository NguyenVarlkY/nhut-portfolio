"use client";
/* Messages sent through the Contact form: list + reading pane, unread / starred, reply by email, delete. */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Globe, Inbox as InboxIcon, Loader2, Mail, MailOpen, RefreshCw, Reply, Search, Star, Trash2, AlertTriangle } from "lucide-react";
import { Empty, api, ago, fmtDate, inputCls } from "./ui";
import { LANG_NAMES } from "./labels";

export interface Msg { id: string; name: string; email: string; message: string; lang: string; country: string; page: string; createdAt: number; read: boolean; starred: boolean; emailed: boolean }
type Filter = "all" | "unread" | "starred";

const initials = (n: string) => n.trim().split(/\s+/).slice(-2).map((x) => x[0]?.toUpperCase()).join("") || "?";
const hue = (s: string) => Array.from(s).reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

export default function Inbox({ flash, onUnread }: { flash: (ok: boolean, t: string) => void; onUnread: (n: number) => void }) {
  const [list, setList] = useState<Msg[] | null>(null);
  const [emailOn, setEmailOn] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    try { const j = await api<{ messages: Msg[]; emailConfigured: boolean }>("/api/admin/inbox"); setList(j.messages); setEmailOn(j.emailConfigured) }
    catch (e) { flash(false, (e as Error).message); setList([]) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (list) onUnread(list.filter((m) => !m.read).length) }, [list, onUnread]);

  const shown = useMemo(() => (list ?? []).filter((m) => (filter === "all" || (filter === "unread" ? !m.read : m.starred)) && (!q || `${m.name} ${m.email} ${m.message}`.toLowerCase().includes(q.toLowerCase()))), [list, filter, q]);
  const cur = list?.find((m) => m.id === open) ?? null;

  async function patch(ids: string[], p: { read?: boolean; starred?: boolean }) {
    setList((l) => (l ?? []).map((m) => (ids.includes(m.id) ? { ...m, ...p } : m)));
    try { await api("/api/admin/inbox", { method: "PATCH", json: { ids, ...p } }) } catch (e) { flash(false, (e as Error).message); void load() }
  }
  async function del(ids: string[]) {
    if (!confirm(ids.length > 1 ? `Xoá ${ids.length} tin nhắn?` : "Xoá tin nhắn này?")) return;
    try { await api("/api/admin/inbox", { method: "DELETE", json: { ids } }); setList((l) => (l ?? []).filter((m) => !ids.includes(m.id))); setPicked(new Set()); if (open && ids.includes(open)) setOpen(null); flash(true, "Đã xoá") }
    catch (e) { flash(false, (e as Error).message) }
  }
  function view(m: Msg) { setOpen(m.id); if (!m.read) void patch([m.id], { read: true }) }
  const togglePick = (id: string) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n });
  const counts = { all: list?.length ?? 0, unread: list?.filter((m) => !m.read).length ?? 0, starred: list?.filter((m) => m.starred).length ?? 0 };

  if (!list) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-muted" /></div>;

  const replyHref = (m: Msg) => `mailto:${m.email}?subject=${encodeURIComponent("Re: Liên hệ từ portfolio")}&body=${encodeURIComponent(`\n\n---\n${m.name} đã viết lúc ${fmtDate(m.createdAt, true)}:\n> ${m.message.split("\n").join("\n> ")}`)}`;

  return (
    <div className="space-y-4">
      {!emailOn && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200"><AlertTriangle size={17} className="mt-0.5 shrink-0" />Tin nhắn vẫn được lưu ở đây. Muốn nhận thêm email báo tin mới, thêm <code className="rounded bg-black/20 px-1">RESEND_API_KEY</code> trên Vercel.</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "unread", "starred"] as Filter[]).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${filter === f ? "border-primary-light bg-primary/15 font-semibold" : "border-subtle text-muted hover:text-body"}`}>
            {f === "all" ? <InboxIcon size={15} /> : f === "unread" ? <Mail size={15} /> : <Star size={15} />}
            {f === "all" ? "Tất cả" : f === "unread" ? "Chưa đọc" : "Gắn sao"}<span className="rounded-full bg-surface-hover px-1.5 text-xs">{counts[f]}</span>
          </button>
        ))}
        <div className="relative min-w-[180px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input className={`${inputCls} pl-9`} placeholder="Tìm theo tên, email, nội dung" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <button type="button" onClick={() => void load()} className="rounded-lg border border-subtle p-2 text-muted hover:text-body" aria-label="Tải lại" title="Tải lại"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
      </div>

      {picked.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary-light/40 bg-primary/10 px-3 py-2 text-sm">
          <b>Đã chọn {picked.size}</b>
          <button type="button" className="rounded-md border border-subtle px-2.5 py-1 text-xs" onClick={() => void patch(Array.from(picked), { read: true })}>Đánh dấu đã đọc</button>
          <button type="button" className="rounded-md border border-subtle px-2.5 py-1 text-xs" onClick={() => void patch(Array.from(picked), { read: false })}>Chưa đọc</button>
          <button type="button" className="rounded-md border border-red-500/40 px-2.5 py-1 text-xs text-red-300" onClick={() => void del(Array.from(picked))}>Xoá</button>
          <button type="button" className="ml-auto text-xs text-muted" onClick={() => setPicked(new Set())}>Bỏ chọn</button>
        </div>
      )}

      {!list.length ? <Empty icon={<InboxIcon />} title="Chưa có tin nhắn nào" text="Khi khách gửi form Liên hệ trên trang, tin nhắn sẽ hiện ở đây kèm ngôn ngữ, quốc gia và trang họ đang xem." />
        : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            <ul className={`max-h-[70vh] space-y-1.5 overflow-y-auto pr-1 ${cur ? "hidden lg:block" : ""}`}>
              {!shown.length && <li className="py-8 text-center text-sm text-muted">Không có tin nào khớp.</li>}
              {shown.map((m) => (
                <li key={m.id}>
                  <div className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${open === m.id ? "border-primary-light/60 bg-primary/10" : "border-subtle bg-surface hover:border-primary-light/30"}`} onClick={() => view(m)}>
                    <input type="checkbox" checked={picked.has(m.id)} onChange={() => togglePick(m.id)} onClick={(e) => e.stopPropagation()} className="mt-2.5 accent-[var(--color-primary,#8b5cf6)]" aria-label={`Chọn tin của ${m.name}`} />
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: `hsl(${hue(m.email)} 55% 45%)` }}>{initials(m.name)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`truncate text-sm ${m.read ? "text-muted" : "font-bold text-body"}`}>{m.name}</span>
                        {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-light" />}
                        <span className="ml-auto shrink-0 text-[11px] text-muted">{ago(m.createdAt)}</span>
                      </div>
                      <p className="truncate text-xs text-muted">{m.email}</p>
                      <p className={`mt-1 line-clamp-2 text-xs ${m.read ? "text-muted" : "text-body"}`}>{m.message}</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); void patch([m.id], { starred: !m.starred }) }} className={`self-start p-1 ${m.starred ? "text-amber-400" : "text-muted hover:text-amber-300"}`} aria-label={m.starred ? "Bỏ sao" : "Gắn sao"}><Star size={15} fill={m.starred ? "currentColor" : "none"} /></button>
                  </div>
                </li>
              ))}
            </ul>

            <div className={`rounded-xl border border-subtle bg-surface ${cur ? "" : "hidden lg:flex lg:items-center lg:justify-center"}`}>
              {!cur ? <p className="p-10 text-sm text-muted">Chọn một tin nhắn để đọc.</p> : (
                <article className="p-5">
                  <button type="button" onClick={() => setOpen(null)} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted lg:hidden"><ArrowLeft size={15} /> Danh sách</button>
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: `hsl(${hue(cur.email)} 55% 45%)` }}>{initials(cur.name)}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-bold">{cur.name}</h3>
                      <button type="button" className="inline-flex items-center gap-1 text-sm text-primary-light hover:underline" onClick={() => { void navigator.clipboard.writeText(cur.email); setCopied(true); setTimeout(() => setCopied(false), 1400) }}>{cur.email} {copied ? <Check size={13} /> : <Copy size={13} />}</button>
                      <p className="mt-0.5 text-xs text-muted">{fmtDate(cur.createdAt, true)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    {cur.lang && <span className="chip"><Globe size={11} className="mr-1 inline" />{LANG_NAMES[cur.lang] ?? cur.lang}</span>}
                    {cur.country && <span className="chip">📍 {cur.country}</span>}
                    {cur.page && <span className="chip">Trang: {cur.page}</span>}
                    <span className="chip">{cur.emailed ? "✓ Đã gửi email báo" : "Chỉ lưu trong hộp thư"}</span>
                  </div>
                  <div className="mt-4 whitespace-pre-wrap rounded-xl border border-subtle bg-base p-4 text-sm leading-relaxed">{cur.message}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={replyHref(cur)} className="btn-primary !px-4 !py-2 text-sm"><Reply size={16} /> Trả lời bằng email</a>
                    <button type="button" className="btn-ghost !px-3 !py-2 text-sm" onClick={() => void patch([cur.id], { read: !cur.read })}>{cur.read ? <><Mail size={16} /> Đánh dấu chưa đọc</> : <><MailOpen size={16} /> Đã đọc</>}</button>
                    <button type="button" className="btn-ghost !px-3 !py-2 text-sm" onClick={() => void patch([cur.id], { starred: !cur.starred })}><Star size={16} fill={cur.starred ? "currentColor" : "none"} /> {cur.starred ? "Bỏ sao" : "Gắn sao"}</button>
                    <button type="button" className="btn-ghost !px-3 !py-2 text-sm text-red-400" onClick={() => void del([cur.id])}><Trash2 size={16} /> Xoá</button>
                  </div>
                </article>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
