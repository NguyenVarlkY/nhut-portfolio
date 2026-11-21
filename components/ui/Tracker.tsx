"use client";
/* Counts visits for /admin → Thống kê, without cookies or personal data:
 * pages seen, sections scrolled to, projects opened, buttons clicked (CV, email, GitHub…), time on page, where the visitor came from.
 * One small report is sent when the visitor leaves or switches tab. Skipped for "Do Not Track", automated browsers and the admin preview. */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Pending = { pages: Record<string, number>; sections: Set<string>; projects: Set<string>; clicks: Record<string, number> };
const fresh = (): Pending => ({ pages: {}, sections: new Set(), projects: new Set(), clicks: {} });

/** Other components report things here: track("project", "Phan Thiet Hotel Web"), track("click", "contact_sent"). */
export function track(kind: "project" | "click", name: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("ny:track", { detail: { kind, name } }));
}

function clickName(el: Element): string | null {
  const a = el.closest("a, button");
  if (!a) return null;
  const href = a.getAttribute("href") ?? "";
  if (href.startsWith("mailto:")) return "email";
  if (href.startsWith("tel:")) return "phone";
  if (/resume|\.pdf$|cv/i.test(href) || a.hasAttribute("download")) return "cv";
  if (/github\.com/.test(href)) return "github";
  if (/linkedin\.com/.test(href)) return "linkedin";
  if (/facebook\.com/.test(href)) return "facebook";
  if (href === "#contact" || href.endsWith("#contact")) return "contact_cta";
  if (href === "#projects" || href.endsWith("#projects")) return "projects_cta";
  if (/\/blog\//.test(href)) return "blog_post";
  return null;
}

export default function Tracker({ lang }: { lang: string }) {
  const pathname = usePathname();
  const pending = useRef<Pending>(fresh());
  const started = useRef(Date.now());
  const firstSent = useRef(false);
  const enabled = useRef(false);

  useEffect(() => {
    try {
      const nav = navigator as Navigator & { webdriver?: boolean };
      enabled.current = window.top === window.self && nav.doNotTrack !== "1" && !nav.webdriver;
    } catch { enabled.current = false }
    if (!enabled.current) return;

    let isFirst = false, isNew = false;
    try {
      if (!sessionStorage.getItem("ny-s")) { sessionStorage.setItem("ny-s", "1"); isFirst = true }
      if (!localStorage.getItem("ny-v")) { localStorage.setItem("ny-v", "1"); isNew = true }
    } catch { isFirst = true }
    let ref = "";
    try { const r = document.referrer ? new URL(document.referrer) : null; ref = r && r.host !== location.host ? r.hostname : "" } catch { /* none */ }
    const w = window.innerWidth;
    const device = w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";

    const send = () => {
      const p = pending.current;
      if (!Object.keys(p.pages).length && !p.sections.size && !p.projects.size && !Object.keys(p.clicks).length) return;
      const body = JSON.stringify({
        first: isFirst && !firstSent.current, fresh: isNew && !firstSent.current, lang, ref: firstSent.current ? "" : ref, device,
        pages: p.pages, sections: Array.from(p.sections), projects: Array.from(p.projects), clicks: p.clicks,
        seconds: Math.round((Date.now() - started.current) / 1000),
      });
      firstSent.current = true;
      pending.current = fresh();
      started.current = Date.now();
      try {
        if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) void fetch("/api/track", { method: "POST", body, keepalive: true });
      } catch { /* ignore */ }
    };
    const onHide = () => { if (document.visibilityState === "hidden") send() };
    const onClick = (e: MouseEvent) => { const n = e.target instanceof Element ? clickName(e.target) : null; if (n) pending.current.clicks[n] = (pending.current.clicks[n] ?? 0) + 1 };
    const onTrack = (e: Event) => {
      const d = (e as CustomEvent<{ kind: string; name: string }>).detail;
      const name = String(d?.name ?? "").replace(/[^\w./#:@ -]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
      if (!name) return;
      if (d.kind === "project") pending.current.projects.add(name);
      else pending.current.clicks[name] = (pending.current.clicks[name] ?? 0) + 1;
    };
    // sections the visitor actually scrolled to
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting && en.target.id) pending.current.sections.add(en.target.id) }), { threshold: 0.35 });
    const watch = () => document.querySelectorAll("main section[id], main header[id]").forEach((s) => io.observe(s));
    watch();
    const mo = new MutationObserver(() => watch());
    mo.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", send);
    document.addEventListener("click", onClick, true);
    window.addEventListener("ny:track", onTrack);
    return () => {
      send();
      io.disconnect(); mo.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", send);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("ny:track", onTrack);
    };
  }, [lang]);

  // one page view per address (client-side navigation included)
  useEffect(() => {
    if (!enabled.current || !pathname) return;
    const key = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
    const k = key.length > 60 ? key.slice(0, 60) : key;
    pending.current.pages[k] = (pending.current.pages[k] ?? 0) + 1;
  }, [pathname]);

  return null;
}
