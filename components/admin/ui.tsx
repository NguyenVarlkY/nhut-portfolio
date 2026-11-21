"use client";
/* Small building blocks shared by every admin panel. */
import { RotateCcw } from "lucide-react";

export const inputCls = "w-full rounded-lg border border-subtle bg-base px-3 py-2 text-sm text-body placeholder:text-placeholder focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/30";

export function Section({ title, hint, edited, onReset, icon, extra, actions, children }: { title: string; hint: string; edited?: boolean; onReset?: () => void; icon?: React.ReactNode; extra?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary-light">{icon}</span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">{title}{edited && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-300">Đã chỉnh</span>}</h2>
          <p className="mt-0.5 text-sm text-muted">{hint}</p>
        </div>
        {actions}
        {edited && onReset && <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-subtle px-3 py-1.5 text-sm text-muted hover:text-body" onClick={() => { if (confirm("Đưa mục này về nội dung gốc?")) onReset() }}><RotateCcw size={15} /> Về gốc</button>}
      </div>
      {extra}
      {children}
    </section>
  );
}

export function ToolCard({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-subtle bg-surface p-4">
      <span className="text-primary-light">{icon}</span>
      <div><b className="font-display">{title}</b><p className="mt-1 text-sm text-muted">{text}</p></div>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

export function Empty({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-subtle px-6 py-12 text-center">
      <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary-light">{icon}</span>
      <b className="font-display">{title}</b>
      <p className="max-w-md text-sm text-muted">{text}</p>
      {children}
    </div>
  );
}

export const fmtDate = (t: number, withYear = false) => new Date(t).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", ...(withYear ? { year: "numeric" } : {}) });
export function ago(t: number) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "vừa xong";
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} ngày trước`;
  return fmtDate(t, true);
}
export const fmtSize = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);

/** fetch JSON from an admin API; throws Error(message) on failure, "401" when signed out */
export async function api<T = Record<string, unknown>>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const r = await fetch(url, { cache: "no-store", ...rest, ...(json !== undefined ? { body: JSON.stringify(json), headers: { "Content-Type": "application/json" } } : {}) });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) throw new Error("401");
  if (!r.ok) throw new Error((j as { error?: string }).error ?? "Có lỗi, thử lại nhé.");
  return j as T;
}
