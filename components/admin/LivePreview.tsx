"use client";
/* The real site in a frame beside the editor. Unsaved edits are sent to it by postMessage (same origin only)
 * and appear instantly; nothing is stored. The frame scrolls to the part being edited. */
import { useEffect, useRef, useState } from "react";
import { ExternalLink, Monitor, RefreshCw, Smartphone, Tablet, X } from "lucide-react";

const SECTION_ID: Record<string, string> = {
  profile: "home", roleRotator: "home", hero: "home", about: "about", stats: "about", services: "services", skills: "skills",
  experience: "experience", experienceData: "experience", projects: "projects", projectsData: "projects",
  certifications: "education", languages: "education", education: "education", credentialsData: "education", faq: "faq", contact: "contact", footer: "contact",
};
const SIZES = { desktop: { w: 1280, icon: Monitor, name: "Máy tính" }, tablet: { w: 820, icon: Tablet, name: "Máy tính bảng" }, mobile: { w: 390, icon: Smartphone, name: "Điện thoại" } } as const;

export default function LivePreview({ overrides, lang, section, onClose }: { overrides: unknown; lang: string; section?: string; onClose: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState<keyof typeof SIZES>("desktop");
  const [scale, setScale] = useState(1);
  const [nonce, setNonce] = useState(0);

  const post = (m: unknown) => frame.current?.contentWindow?.postMessage(m, window.location.origin);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => { if (e.origin === window.location.origin && e.source === frame.current?.contentWindow && e.data?.type === "ny-preview-ready") setReady(true) };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  useEffect(() => { setReady(false) }, [lang, nonce]);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => post({ type: "ny-preview", overrides }), 200);
    return () => window.clearTimeout(t);
  }, [overrides, ready]);
  useEffect(() => { if (ready && section && SECTION_ID[section]) post({ type: "ny-scroll", id: SECTION_ID[section] }) }, [section, ready]);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / SIZES[size].w)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  const W = SIZES[size].w;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-subtle bg-surface">
      <div className="flex items-center gap-1.5 border-b border-subtle px-3 py-2">
        <span className={`h-2 w-2 rounded-full ${ready ? "bg-green-400" : "animate-pulse bg-amber-400"}`} />
        <b className="text-sm">Xem trực tiếp</b>
        <span className="hidden text-xs text-muted sm:inline">· chưa lưu cũng thấy</span>
        <div className="ml-auto flex items-center gap-0.5">
          {(Object.keys(SIZES) as (keyof typeof SIZES)[]).map((k) => { const I = SIZES[k].icon; return <button key={k} type="button" onClick={() => setSize(k)} className={`rounded-md p-1.5 ${size === k ? "bg-primary/20 text-primary-light" : "text-muted hover:text-body"}`} title={SIZES[k].name} aria-label={SIZES[k].name}><I size={15} /></button> })}
          <button type="button" onClick={() => setNonce((n) => n + 1)} className="rounded-md p-1.5 text-muted hover:text-body" title="Tải lại" aria-label="Tải lại khung xem"><RefreshCw size={15} /></button>
          <a href={`/${lang}`} target="_blank" rel="noopener" className="rounded-md p-1.5 text-muted hover:text-body" title="Mở tab mới" aria-label="Mở tab mới"><ExternalLink size={15} /></a>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted hover:text-body" title="Đóng" aria-label="Đóng xem trực tiếp"><X size={15} /></button>
        </div>
      </div>
      <div ref={box} className="relative flex-1 overflow-hidden bg-[#05050a]">
        <iframe key={`${lang}-${nonce}`} ref={frame} src={`/${lang}`} title="Xem trước trang portfolio"
          className="absolute left-1/2 top-0 origin-top border-0 bg-base"
          style={{ width: W, height: `${100 / scale}%`, transform: `translateX(-50%) scale(${scale})` }} />
      </div>
    </div>
  );
}
