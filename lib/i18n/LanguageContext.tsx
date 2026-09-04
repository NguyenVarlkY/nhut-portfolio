"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import en from "./en.json";
import vi from "./vi.json";
import ko from "./ko.json";
import zh from "./zh.json";
import ja from "./ja.json";
import de from "./de.json";
import fr from "./fr.json";

export type Lang = "en" | "vi" | "ko" | "zh" | "ja" | "de" | "fr";
export const LANGS: Lang[] = ["en", "vi", "ko", "zh", "ja", "de", "fr"];
export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  vi: "Tiếng Việt",
  ko: "한국어",
  zh: "中文",
  ja: "日本語",
  de: "Deutsch",
  fr: "Français",
};
export const LANG_CODES: Record<Lang, string> = {
  en: "EN",
  vi: "VI",
  ko: "KO",
  zh: "中",
  ja: "日",
  de: "DE",
  fr: "FR",
};

const TRANSLATIONS: Record<Lang, Record<string, any>> = {
  en,
  vi,
  ko,
  zh,
  ja,
  de,
  fr,
};

const LOCALE_OVERRIDES: Partial<Record<Lang, Record<string, string>>> = {
  zh: {
    "nav.tools": "工具",
  },
};

const STORAGE_KEY = "ny-portfolio-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLang(v: string | null): v is Lang {
  return v !== null && LANGS.includes(v as Lang);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Hydrate from localStorage once mounted (avoid SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) setLang(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (path: string): string => {
      const override = LOCALE_OVERRIDES[lang]?.[path];
      if (override) return override;

      const keys = path.split(".");
      let result: any = TRANSLATIONS[lang];
      for (const k of keys) {
        if (result == null) return path;
        result = result[k];
      }
      if (typeof result === "string") return result;

      let fallback: any = en;
      for (const k of keys) {
        if (fallback == null) return path;
        fallback = fallback[k];
      }
      return typeof fallback === "string" ? fallback : path;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be inside LanguageProvider");
  return ctx;
}

