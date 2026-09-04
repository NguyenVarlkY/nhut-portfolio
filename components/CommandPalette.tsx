"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, CornerDownLeft, Home, User, Wrench, Briefcase, FolderGit2, Mail, Sun, Moon, Languages, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation, LANGS, LANG_LABELS, type Lang } from "@/lib/i18n/LanguageContext";

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useTranslation();

  // Open / close via custom event dispatched from Navbar (Ctrl+K)
  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setQuery("");
      setActiveIdx(0);
    };
    const onClose = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("ny:open-palette", onOpen);
    window.addEventListener("ny:close-palette", onClose);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("ny:open-palette", onOpen);
      window.removeEventListener("ny:close-palette", onClose);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  }, []);

  const changeLang = useCallback(
    (l: Lang) => {
      setLang(l);
      setOpen(false);
    },
    [setLang]
  );

  const cmds = useMemo<Cmd[]>(() => {
    const sections: Cmd[] = [
      { id: "home", label: t("nav.home"), icon: <Home size={16} />, run: () => scrollTo("home") },
      { id: "about", label: t("nav.about"), icon: <User size={16} />, run: () => scrollTo("about") },
      { id: "skills", label: t("nav.skills"), icon: <Wrench size={16} />, run: () => scrollTo("skills") },
      { id: "services", label: t("nav.services"), icon: <Briefcase size={16} />, run: () => scrollTo("services") },
      { id: "experience", label: t("nav.experience"), icon: <Briefcase size={16} />, run: () => scrollTo("experience") },
      { id: "projects", label: t("nav.projects"), icon: <FolderGit2 size={16} />, run: () => scrollTo("projects") },
      { id: "contact", label: t("nav.contact"), icon: <Mail size={16} />, run: () => scrollTo("contact") },
    ];

    const actions: Cmd[] = [
      {
        id: "theme-light",
        label: t("theme.light"),
        hint: theme === "light" ? "✓" : "",
        icon: <Sun size={16} />,
        run: () => {
          setTheme("light");
          setOpen(false);
        },
      },
      {
        id: "theme-dark",
        label: t("theme.dark"),
        hint: theme === "dark" ? "✓" : "",
        icon: <Moon size={16} />,
        run: () => {
          setTheme("dark");
          setOpen(false);
        },
      },
      ...LANGS.map((l): Cmd => ({
        id: `lang-${l}`,
        label: LANG_LABELS[l],
        hint: l === lang ? "✓" : "",
        icon: <Languages size={16} />,
        run: () => changeLang(l),
      })),
    ];

    return [...sections, ...actions];
  }, [t, theme, lang, scrollTo, changeLang, setTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cmds;
    return cmds.filter((c) => c.label.toLowerCase().includes(q));
  }, [cmds, query]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIdx(0);
  }, [query, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center bg-black/50 px-4 pt-[18vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-xl border border-subtle bg-base-alt/95 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-subtle px-4">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && filtered[activeIdx]) {
                filtered[activeIdx].run();
              }
            }}
            placeholder="Type a command or search…"
            className="h-14 flex-1 bg-transparent text-body placeholder-placeholder outline-none"
          />
          <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted hover:text-body">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[46vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">No results.</p>
          ) : (
            filtered.map((c, i) => (
              <button
                key={c.id}
                onClick={c.run}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  i === activeIdx ? "bg-surface text-body" : "text-muted hover:text-body"
                }`}
              >
                <span className={`shrink-0 ${i === activeIdx ? "text-primary-light" : ""}`}>{c.icon}</span>
                <span className="flex-1">{c.label}</span>
                {c.hint && <span className="shrink-0 text-primary-light">{c.hint}</span>}
                {i === activeIdx && <CornerDownLeft size={14} className="shrink-0 text-muted" />}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-subtle px-4 py-2 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <CornerDownLeft size={12} /> select
          </span>
          <span className="flex items-center gap-1">↑↓ navigate</span>
          <span className="flex items-center gap-1">esc close</span>
        </div>
      </div>
    </div>
  );
}

