"use client";
/* Visit statistics (no cookies, no IPs): headline numbers vs the previous period, visits per day,
 * and what people looked at, clicked and where they came from. */
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Clock, Eye, Loader2, MousePointerClick, RefreshCw, Table2, UserPlus, Users, TrendingDown, TrendingUp } from "lucide-react";
import { Empty, api } from "./ui";
import { LANG_NAMES } from "./labels";

interface Day { day: string; sessions: number; visitors: number; views: number; seconds: number; reports: number; pages: Record<string, number>; sections: Record<string, number>; projects: Record<string, number>; clicks: Record<string, number>; countries: Record<string, number>; refs: Record<string, number>; devices: Record<string, number>; langs: Record<string, number>; hours: number[] }

const CLICK_NAMES: Record<string, string> = { cv: "Tải CV", email: "Bấm email", phone: "Bấm số điện thoại", github: "Mở GitHub", linkedin: "Mở LinkedIn", facebook: "Mở Facebook", contact_cta: "Nút “Liên hệ”", projects_cta: "Nút “Xem dự án”", blog_post: "Mở bài blog", contact_sent: "Gửi form liên hệ" };
const SECTION_NAMES: Record<string, string> = { home: "Trang đầu", about: "Giới thiệu", services: "Dịch vụ", skills: "Kỹ năng", experience: "Kinh nghiệm", projects: "Dự án", education: "Học vấn", testimonials: "Nhận xét", faq: "Hỏi đáp", contact: "Liên hệ" };
const DEVICE_NAMES: Record<string, string> = { mobile: "Điện thoại", tablet: "Máy tính bảng", desktop: "Máy tính" };

function sum(days: Day[], k: "pages" | "sections" | "projects" | "clicks" | "countries" | "refs" | "devices" | "langs") {
  const out: Record<string, number> = {};
  for (const d of days) for (const [x, n] of Object.entries(d[k] ?? {})) out[x] = (out[x] ?? 0) + n;
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}
const tot = (days: Day[], k: "sessions" | "visitors" | "views" | "seconds" | "reports") => days.reduce((n, d) => n + (d[k] ?? 0), 0);
const dur = (s: number) => (s < 60 ? `${Math.round(s)} giây` : `${Math.floor(s / 60)} phút ${Math.round(s % 60)} giây`);
const dLabel = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const flag = (cc: string) => (/^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...Array.from(cc).map((c) => 0x1f1a5 + c.charCodeAt(0))) : "🌐");

export default function Stats({ flash }: { flash: (ok: boolean, t: string) => void }) {
  const [range, setRange] = useState(30);
  const [all, setAll] = useState<Day[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [table, setTable] = useState(false);

  async function load(n = range) {
    setBusy(true);
    try { const j = await api<{ days: Day[] }>(`/api/admin/stats?days=${Math.min(180, n * 2)}`); setAll(j.days) }
    catch (e) { flash(false, (e as Error).message); setAll([]) } finally { setBusy(false) }
  }
  useEffect(() => { void load(range) }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  const { cur, prev } = useMemo(() => {
    const a = all ?? [];
    return { cur: a.slice(-range), prev: a.length >= range * 2 ? a.slice(-range * 2, -range) : [] };
  }, [all, range]);

  if (!all) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-muted" /></div>;

  const contactClicks = (d: Day[]) => d.reduce((n, x) => n + (x.clicks?.email ?? 0) + (x.clicks?.contact_cta ?? 0) + (x.clicks?.contact_sent ?? 0) + (x.clicks?.phone ?? 0), 0);
  const kpis = [
    { icon: <Users size={18} />, label: "Lượt ghé thăm", v: tot(cur, "sessions"), p: tot(prev, "sessions") },
    { icon: <UserPlus size={18} />, label: "Người mới", v: tot(cur, "visitors"), p: tot(prev, "visitors") },
    { icon: <Eye size={18} />, label: "Lượt xem trang", v: tot(cur, "views"), p: tot(prev, "views") },
    { icon: <Clock size={18} />, label: "Thời gian TB / lượt", v: tot(cur, "sessions") ? tot(cur, "seconds") / tot(cur, "sessions") : 0, p: tot(prev, "sessions") ? tot(prev, "seconds") / tot(prev, "sessions") : 0, time: true },
    { icon: <MousePointerClick size={18} />, label: "Lần muốn liên hệ", v: contactClicks(cur), p: contactClicks(prev) },
  ];
  const max = Math.max(1, ...cur.map((d) => d.sessions));
  const hours = Array.from({ length: 24 }, (_, h) => cur.reduce((n, d) => n + (d.hours?.[h] ?? 0), 0));
  const hMax = Math.max(1, ...hours);
  const empty = tot(cur, "sessions") + tot(cur, "views") === 0;
  const ticks = cur.length <= 7 ? cur.map((_, i) => i) : [0, Math.floor(cur.length / 3), Math.floor((2 * cur.length) / 3), cur.length - 1];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90].map((n) => <button key={n} type="button" onClick={() => setRange(n)} className={`rounded-lg border px-3 py-2 text-sm ${range === n ? "border-primary-light bg-primary/15 font-semibold" : "border-subtle text-muted hover:text-body"}`}>{n} ngày</button>)}
        <span className="text-xs text-muted">So với {range} ngày trước đó · giờ Việt Nam</span>
        <button type="button" onClick={() => setTable((x) => !x)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-subtle px-3 py-2 text-sm text-muted hover:text-body">{table ? <BarChart3 size={15} /> : <Table2 size={15} />} {table ? "Biểu đồ" : "Bảng số"}</button>
        <button type="button" onClick={() => void load()} className="rounded-lg border border-subtle p-2 text-muted hover:text-body" aria-label="Tải lại"><RefreshCw size={16} className={busy ? "animate-spin" : ""} /></button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {kpis.map((k) => {
          const diff = k.p ? ((k.v - k.p) / k.p) * 100 : null;
          return (
            <div key={k.label} className="rounded-xl border border-subtle bg-surface p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted"><span className="text-primary-light">{k.icon}</span>{k.label}</div>
              <div className="mt-2 font-display text-2xl font-bold tabular-nums">{k.time ? dur(k.v) : Math.round(k.v).toLocaleString("vi-VN")}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                {diff === null ? "—" : <>{diff >= 0 ? <TrendingUp size={13} className="text-green-400" /> : <TrendingDown size={13} className="text-red-400" />}<span>{diff >= 0 ? "+" : ""}{diff.toFixed(0)}%</span></>}
              </div>
            </div>
          );
        })}
      </div>

      {empty ? <Empty icon={<BarChart3 />} title="Chưa có lượt xem nào trong khoảng này" text="Số liệu được ghi khi khách rời trang hoặc chuyển tab. Lượt xem của bạn trong khung xem trước không được tính." /> : (
        <>
          <div className="rounded-xl border border-subtle bg-surface p-4">
            <h3 className="mb-3 font-display font-semibold">Lượt ghé thăm mỗi ngày</h3>
            {table ? (
              <div className="max-h-[320px] overflow-auto">
                <table className="w-full text-sm"><thead className="sticky top-0 bg-surface text-left text-xs text-muted"><tr><th className="py-1.5">Ngày</th><th>Lượt ghé</th><th>Người mới</th><th>Lượt xem</th><th>Thời gian TB</th></tr></thead>
                  <tbody className="tabular-nums">{[...cur].reverse().map((d) => <tr key={d.day} className="border-t border-subtle"><td className="py-1.5">{dLabel(d.day)}</td><td>{d.sessions}</td><td>{d.visitors}</td><td>{d.views}</td><td>{d.sessions ? dur(d.seconds / d.sessions) : "—"}</td></tr>)}</tbody></table>
              </div>
            ) : (
              <div>
                <div className="flex h-[180px] items-end gap-[2px] border-b border-subtle">
                  {cur.map((d) => (
                    <div key={d.day} className="group relative flex h-full flex-1 items-end" tabIndex={0} aria-label={`${dLabel(d.day)}: ${d.sessions} lượt ghé`}>
                      <div className="w-full rounded-t-[4px] bg-primary-light/80 transition group-hover:bg-primary-light group-focus:bg-primary-light" style={{ height: `${(d.sessions / max) * 100}%`, minHeight: d.sessions ? 3 : 0 }} />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-subtle bg-base px-3 py-2 text-xs shadow-xl group-hover:block group-focus:block">
                        <b className="block">{dLabel(d.day)}</b>
                        <span className="block text-muted">{d.sessions} lượt ghé · {d.visitors} người mới</span>
                        <span className="block text-muted">{d.views} lượt xem trang</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative mt-1.5 h-4 text-[11px] text-muted">
                  {ticks.map((i) => <span key={i} className="absolute -translate-x-1/2" style={{ left: `${((i + 0.5) / cur.length) * 100}%` }}>{dLabel(cur[i].day)}</span>)}
                </div>
                <p className="mt-1 text-right text-[11px] text-muted">Cao nhất: {max} lượt/ngày</p>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <TopList title="Dự án được mở nhiều nhất" rows={sum(cur, "projects")} empty="Chưa ai mở chi tiết dự án." />
            <TopList title="Nút được bấm" rows={sum(cur, "clicks")} name={(k) => CLICK_NAMES[k] ?? k} empty="Chưa có lượt bấm nào." />
            <TopList title="Phần được cuộn tới" rows={sum(cur, "sections")} name={(k) => SECTION_NAMES[k] ?? k} />
            <TopList title="Trang được xem" rows={sum(cur, "pages")} />
            <TopList title="Đến từ đâu" rows={sum(cur, "refs")} name={(k) => k || "Gõ trực tiếp"} empty="Phần lớn khách gõ trực tiếp hoặc mở từ ứng dụng." />
            <TopList title="Quốc gia" rows={sum(cur, "countries")} name={(k) => `${flag(k)} ${k}`} />
            <TopList title="Ngôn ngữ trang" rows={sum(cur, "langs")} name={(k) => LANG_NAMES[k] ?? k} />
            <TopList title="Thiết bị" rows={sum(cur, "devices")} name={(k) => DEVICE_NAMES[k] ?? k} />
            <div className="rounded-xl border border-subtle bg-surface p-4">
              <h3 className="mb-3 font-display font-semibold">Giờ khách hay vào</h3>
              <div className="flex h-[96px] items-end gap-[2px]">
                {hours.map((n, h) => (
                  <div key={h} className="group relative flex h-full flex-1 items-end">
                    <div className="w-full rounded-t-[3px] bg-primary-light/70 group-hover:bg-primary-light" style={{ height: `${(n / hMax) * 100}%`, minHeight: n ? 2 : 0 }} />
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-base px-2 py-1 text-[11px] shadow group-hover:block">{h}h: {n}</span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-muted"><span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TopList({ title, rows, name = (k) => k, empty = "Chưa có dữ liệu." }: { title: string; rows: [string, number][]; name?: (k: string) => string; empty?: string }) {
  const [more, setMore] = useState(false);
  const top = rows[0]?.[1] ?? 1;
  const total = rows.reduce((n, r) => n + r[1], 0) || 1;
  const list = more ? rows : rows.slice(0, 6);
  return (
    <div className="rounded-xl border border-subtle bg-surface p-4">
      <h3 className="mb-3 font-display font-semibold">{title}</h3>
      {!rows.length ? <p className="text-sm text-muted">{empty}</p> : (
        <ul className="space-y-2">
          {list.map(([k, n]) => (
            <li key={k} title={`${name(k)}: ${n}`}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm"><span className="truncate">{name(k)}</span><span className="shrink-0 tabular-nums text-muted">{n} <span className="text-[11px]">· {Math.round((n / total) * 100)}%</span></span></div>
              <div className="h-1.5 rounded-full bg-surface-hover"><div className="h-full rounded-full bg-primary-light/80" style={{ width: `${(n / top) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
      {rows.length > 6 && <button type="button" onClick={() => setMore((x) => !x)} className="mt-3 text-xs text-primary-light">{more ? "Thu gọn" : `Xem thêm ${rows.length - 6}`}</button>}
    </div>
  );
}
