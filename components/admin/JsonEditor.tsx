"use client";
/* One editor for any piece of portfolio content: text → input / textarea, number → number,
 * list of words → tag list, list of items → cards (add, remove, move, collapse), object → labelled fields. */
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, Plus, Trash2, X } from "lucide-react";
import { LONG, PROJECT_ICONS, SKILL_ICONS, SKILL_KEYS, label } from "./labels";

type V = any; // eslint-disable-line @typescript-eslint/no-explicit-any
interface Props { value: V; onChange: (v: V) => void; template?: V; fieldKey?: string; itemTitle?: (item: V, i: number) => string; context?: string }

/** An empty copy of an item, used when adding a new one. */
export function blank(t: V): V {
  if (typeof t === "string") return "";
  if (typeof t === "number") return 0;
  if (typeof t === "boolean") return false;
  if (Array.isArray(t)) return [];
  if (t && typeof t === "object") return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, k === "g1" ? "#8b5cf6" : k === "g2" ? "#22d3ee" : k === "icon" ? (t.icon ?? "") : k === "key" ? t.key : blank(v)]));
  return "";
}
const move = <T,>(a: T[], i: number, d: number) => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b };

const inputCls = "w-full rounded-lg border border-subtle bg-base px-3 py-2 text-sm text-body placeholder:text-placeholder focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/30";

function Field({ k, value, onChange, context }: { k: string; value: V; onChange: (v: V) => void; context?: string }) {
  if (typeof value === "number") return <input type="number" className={inputCls} value={value} onChange={(e) => onChange(Number(e.target.value))} />;
  if (/^g[12]$/.test(k)) return (
    <div className="flex items-center gap-2">
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#8b5cf6"} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-subtle bg-transparent" aria-label={label(k)} />
      <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} maxLength={20} />
    </div>
  );
  if (k === "icon") {
    const opts = context === "skills" ? SKILL_ICONS : PROJECT_ICONS;
    return <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>{Array.from(new Set([value, ...opts])).filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}</select>;
  }
  if (k === "key" && context === "skills") return <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>{SKILL_KEYS.map((o) => <option key={o}>{o}</option>)}</select>;
  const long = LONG.test(k) || String(value ?? "").length > 90;
  if (long) return <textarea className={`${inputCls} min-h-[96px] leading-relaxed`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={Math.min(10, Math.max(3, Math.ceil(String(value ?? "").length / 90)))} />;
  const link = /url|github|linkedin|facebook/i.test(k);
  return <input className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} type={link ? "url" : k === "email" ? "email" : "text"} placeholder={link ? "https://…" : ""} />;
}

/** A list of short words (skills, tags, highlights): chips you can type into. */
function WordList({ value, onChange, long }: { value: string[]; onChange: (v: string[]) => void; long?: boolean }) {
  const [draft, setDraft] = useState("");
  if (long) {
    return (
      <div className="space-y-2">
        {value.map((s, i) => (
          <div key={i} className="flex gap-2">
            <span className="mt-2 font-mono text-xs text-muted">{i + 1}.</span>
            <textarea className={`${inputCls} min-h-[60px]`} value={s} rows={2} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            <div className="flex flex-col gap-1">
              <button type="button" className="rounded p-1 text-muted hover:text-body disabled:opacity-30" disabled={i === 0} onClick={() => onChange(move(value, i, -1))} aria-label="Lên"><ArrowUp size={14} /></button>
              <button type="button" className="rounded p-1 text-muted hover:text-body disabled:opacity-30" disabled={i === value.length - 1} onClick={() => onChange(move(value, i, 1))} aria-label="Xuống"><ArrowDown size={14} /></button>
              <button type="button" className="rounded p-1 text-muted hover:text-red-400" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Xoá"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-subtle px-3 py-1.5 text-sm text-muted hover:border-primary-light hover:text-body" onClick={() => onChange([...value, ""])}><Plus size={14} /> Thêm dòng</button>
      </div>
    );
  }
  const add = () => { const parts = draft.split(/[,\n]/).map((x) => x.trim()).filter(Boolean); if (parts.length) onChange([...value, ...parts]); setDraft("") };
  return (
    <div className="rounded-lg border border-subtle bg-base p-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((s, i) => (
          <span key={i} className="group inline-flex items-center gap-1 rounded-md border border-subtle bg-surface px-2 py-1 text-xs">
            <button type="button" className="text-muted opacity-0 group-hover:opacity-100 disabled:hidden" disabled={i === 0} onClick={() => onChange(move(value, i, -1))} aria-label="Sang trái">‹</button>
            <input className="w-auto min-w-[3ch] bg-transparent outline-none" size={Math.max(3, s.length)} value={s} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" className="text-muted hover:text-red-400" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Xoá ${s}`}><X size={12} /></button>
          </span>
        ))}
        <input className="min-w-[160px] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-placeholder" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Gõ rồi Enter (nhiều mục: cách nhau dấu phẩy)"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1)) }} onBlur={add} />
      </div>
    </div>
  );
}

function ItemList({ value, onChange, template, itemTitle, context, fieldKey }: { value: V[]; onChange: (v: V[]) => void; template: V; itemTitle?: (item: V, i: number) => string; context?: string; fieldKey?: string }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(value.length <= 2 ? value.map((_, i) => i) : [0]));
  const toggle = (i: number) => setOpen((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n });
  const [listId] = useState(() => `il-${Math.random().toString(36).slice(2, 8)}`);
  const nextId = () => Math.max(-1, ...value.map((x) => (typeof x?.id === "number" ? x.id : -1))) + 1;
  const add = (copyOf?: V) => {
    const item = copyOf ? structuredClone(copyOf) : blank(template);
    if (item && typeof item === "object" && "id" in item) item.id = nextId();
    onChange([...value, item]);
    // open only the new item and bring it into view, so it is obvious what you are editing
    setOpen(new Set([value.length]));
    window.setTimeout(() => document.getElementById(`${listId}-${value.length}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };
  return (
    <div className="space-y-2.5">
      {value.map((item, i) => {
        const title = itemTitle?.(item, i) || item?.title || item?.name || item?.company || item?.question || item?.q || `${label(fieldKey ?? "")} ${i + 1}`;
        const isOpen = open.has(i);
        return (
          <div key={i} id={`${listId}-${i}`} className={`scroll-mt-28 rounded-xl border ${isOpen ? "border-primary-light/40" : "border-subtle"} bg-surface`}>
            <div className="flex items-center gap-2 px-3 py-2">
              <button type="button" className="flex flex-1 items-center gap-2 text-left text-sm font-semibold" onClick={() => toggle(i)} aria-expanded={isOpen}>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {item?.g1 && <span className="h-3.5 w-3.5 rounded-full" style={{ background: `linear-gradient(135deg, ${item.g1}, ${item.g2})` }} />}
                <span className="truncate">{String(title) || "(chưa đặt tên)"}</span>
                {item?.date && <span className="hidden truncate font-mono text-xs font-normal text-muted sm:inline">· {item.date}</span>}
              </button>
              <button type="button" className="rounded p-1.5 text-muted hover:bg-surface-hover hover:text-body disabled:opacity-30" disabled={i === 0} onClick={() => onChange(move(value, i, -1))} aria-label="Đưa lên" title="Đưa lên"><ArrowUp size={15} /></button>
              <button type="button" className="rounded p-1.5 text-muted hover:bg-surface-hover hover:text-body disabled:opacity-30" disabled={i === value.length - 1} onClick={() => onChange(move(value, i, 1))} aria-label="Đưa xuống" title="Đưa xuống"><ArrowDown size={15} /></button>
              <button type="button" className="rounded p-1.5 text-muted hover:bg-surface-hover hover:text-body" onClick={() => add(item)} aria-label="Nhân bản" title="Nhân bản"><Copy size={15} /></button>
              <button type="button" className="rounded p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400" onClick={() => { if (confirm(`Xoá “${title}”?`)) onChange(value.filter((_, j) => j !== i)) }} aria-label="Xoá" title="Xoá"><Trash2 size={15} /></button>
            </div>
            {isOpen && <div className="border-t border-subtle p-3"><JsonEditor value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} template={template} context={context} /></div>}
          </div>
        );
      })}
      <button type="button" className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-subtle px-4 py-2 text-sm font-medium text-muted hover:border-primary-light hover:text-body" onClick={() => add()}><Plus size={15} /> Thêm mục</button>
    </div>
  );
}

export default function JsonEditor({ value, onChange, template, fieldKey, itemTitle, context }: Props) {
  if (Array.isArray(value)) {
    const model = Array.isArray(template) ? template[0] : template ?? value[0];
    if (model === undefined || typeof model === "string") return <WordList value={value as string[]} onChange={onChange} long={value.some((x: V) => String(x).length > 60) || LONG.test(fieldKey ?? "") || fieldKey === "highlights" || fieldKey === "features" || fieldKey === "flow"} />;
    return <ItemList value={value} onChange={onChange} template={model} itemTitle={itemTitle} context={context} fieldKey={fieldKey} />;
  }
  if (value && typeof value === "object") {
    const keys = Array.from(new Set([...Object.keys(template && typeof template === "object" && !Array.isArray(template) ? template : {}), ...Object.keys(value)]));
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {keys.filter((k) => k !== "id").map((k) => {
          const v = value[k] ?? (template ? blank(template[k]) : "");
          const wide = typeof v === "object" || LONG.test(k) || String(v).length > 60;
          const Wrap = typeof v === "object" && v !== null ? "div" : "label"; // a label around buttons would "click" them
          return (
            <Wrap key={k} className={`grid gap-1 ${wide ? "sm:col-span-2" : ""}`}>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label(k)}</span>
              {typeof v === "object" && v !== null
                ? <JsonEditor value={v} onChange={(x) => onChange({ ...value, [k]: x })} template={template?.[k]} fieldKey={k} context={context} />
                : <Field k={k} value={v} onChange={(x) => onChange({ ...value, [k]: x })} context={context} />}
            </Wrap>
          );
        })}
      </div>
    );
  }
  return <Field k={fieldKey ?? ""} value={value ?? ""} onChange={onChange} context={context} />;
}
