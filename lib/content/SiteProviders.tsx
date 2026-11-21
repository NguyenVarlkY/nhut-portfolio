"use client";
/* Content + language providers for the public pages.
 * Inside the /admin live preview (an iframe of this same site), the admin page sends the unsaved edits by postMessage
 * and they are shown right away — only in that iframe, nothing is stored. Messages from any other window are ignored. */
import { useEffect, useState, type ReactNode } from "react";
import { ContentProvider } from "./ContentContext";
import { mergeData, type BaseData, type Overrides } from "./types";
import { LanguageProvider, type Lang } from "../i18n/LanguageContext";

type Live = { data: BaseData; text?: Record<string, unknown> };

export default function SiteProviders({ data, overrides, lang, children }: { data: BaseData; overrides?: Record<string, unknown>; lang: Lang; children: ReactNode }) {
  const [live, setLive] = useState<Live | null>(null);
  useEffect(() => {
    if (window.parent === window) return;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const m = e.data as { type?: string; overrides?: Overrides; id?: string };
      if (m?.type === "ny-preview" && m.overrides && typeof m.overrides === "object") {
        setLive({ data: mergeData(m.overrides), text: (m.overrides.i18n?.[lang] as Record<string, unknown> | undefined) ?? {} });
      } else if (m?.type === "ny-scroll" && typeof m.id === "string" && /^[\w-]{1,40}$/.test(m.id)) {
        document.getElementById(m.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "ny-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMsg);
  }, [lang]);

  return (
    <ContentProvider data={live?.data ?? data}>
      <LanguageProvider lang={lang} overrides={live ? live.text : overrides}>
        {children}
      </LanguageProvider>
    </ContentProvider>
  );
}
