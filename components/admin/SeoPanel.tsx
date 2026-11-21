"use client";
/* Search engines & link previews: site address, share image, keywords, indexing (all languages),
 * plus title / description per language with length hints and Google / Facebook previews. */
import { Globe, Search, Share2 } from "lucide-react";
import JsonEditor from "./JsonEditor";
import { LANG_NAMES, LANG_ORDER } from "./labels";
import { inputCls } from "./ui";

type V = any; // eslint-disable-line @typescript-eslint/no-explicit-any

function Count({ n, good, max }: { n: number; good: [number, number]; max: number }) {
  const c = n === 0 ? "text-muted" : n < good[0] ? "text-amber-300" : n <= good[1] ? "text-green-400" : n <= max ? "text-amber-300" : "text-red-400";
  return <span className={`text-[11px] tabular-nums ${c}`}>{n} ký tự · nên {good[0]}–{good[1]}</span>;
}

export default function SeoPanel({ data, template, onData, text, onText, lang, setLang, edited, siteUrl }: {
  data: V; template: V; onData: (v: V) => void; text: { title?: string; description?: string }; onText: (v: { title: string; description: string }) => void;
  lang: string; setLang: (l: string) => void; edited: (l: string) => boolean; siteUrl: string;
}) {
  const title = text?.title ?? "", desc = text?.description ?? "";
  const url = (data.siteUrl || siteUrl).replace(/^https?:\/\//, "");
  const img = data.ogImage || "/og-image.png";
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display font-semibold"><Globe size={17} className="text-primary-light" /> Chung cho mọi ngôn ngữ</h3>
        <JsonEditor value={data} template={template} fieldKey="seo" onChange={onData} />
        {data.indexable === false && <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">Đang tắt: Google sẽ không hiện trang của bạn trong kết quả tìm kiếm.</p>}
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display font-semibold"><Search size={17} className="text-primary-light" /> Tiêu đề & mô tả theo ngôn ngữ</h3>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {LANG_ORDER.map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} className={`relative rounded-lg border px-3 py-1.5 text-sm ${lang === l ? "border-primary-light bg-primary/15 font-semibold" : "border-subtle text-muted hover:text-body"}`}>
              {LANG_NAMES[l]}{edited(l) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />}
            </button>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="grid gap-1">
              <span className="flex justify-between text-xs font-semibold uppercase tracking-wide text-muted">Tiêu đề trang <Count n={title.length} good={[30, 60]} max={70} /></span>
              <input className={inputCls} value={title} maxLength={120} onChange={(e) => onText({ title: e.target.value, description: desc })} />
            </label>
            <label className="grid gap-1">
              <span className="flex justify-between text-xs font-semibold uppercase tracking-wide text-muted">Mô tả <Count n={desc.length} good={[110, 160]} max={200} /></span>
              <textarea className={`${inputCls} min-h-[110px]`} value={desc} maxLength={400} onChange={(e) => onText({ title, description: e.target.value })} />
            </label>
            <p className="text-xs text-muted">Google thường cắt tiêu đề sau ~60 ký tự và mô tả sau ~160 ký tự.</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-subtle bg-white p-4 text-left">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Trên Google</p>
              <p className="truncate text-xs text-[#4d5156]">{url} › {lang}</p>
              <p className="line-clamp-1 text-lg leading-snug text-[#1a0dab]">{title || "(chưa có tiêu đề)"}</p>
              <p className="line-clamp-2 text-sm text-[#4d5156]">{desc || "(chưa có mô tả)"}</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-subtle bg-[#f0f2f5] text-left">
              <p className="flex items-center gap-1.5 px-4 pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500"><Share2 size={12} /> Khi chia sẻ lên Facebook / Zalo</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="mt-2 aspect-[1200/630] w-full bg-gray-300 object-cover" />
              <div className="px-4 py-3">
                <p className="truncate text-[11px] uppercase text-gray-500">{url}</p>
                <p className="line-clamp-2 font-semibold text-[#050505]">{title || "(chưa có tiêu đề)"}</p>
                <p className="line-clamp-1 text-sm text-gray-600">{desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
