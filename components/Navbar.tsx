"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Menu, X, FileDown, Sun, Moon, Globe, ChevronDown, Command } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useTranslation, LANGS, LANG_LABELS, LANG_CODES, type Lang } from "@/lib/i18n/LanguageContext";

const LINKS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/#about", labelKey: "nav.about" },
  { href: "/#skills", labelKey: "nav.skills" },
  { href: "/#services", labelKey: "nav.services" },
  { href: "/#experience", labelKey: "nav.experience" },
{ href: "/#projects", labelKey: "nav.projects" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/tools", labelKey: "nav.tools" },
  { href: "/#contact", labelKey: "nav.contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useTranslation();

  useEffect(() => { setMounted(true); }, []);

  // Outside-click to close language dropdown (ref-based, robust)
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Scroll spy + scrolled style
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const pos = window.scrollY + 120;
      const sections = document.querySelectorAll("section[id], header[id]");
      let currentId = "home";
      sections.forEach((sec) => {
        if (pos >= (sec as HTMLElement).offsetTop) currentId = sec.id;
      });
      setActive(currentId);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ctrl/Cmd+K → open command palette (dispatched to CommandPalette)
  const openPalette = useCallback(() => {
    window.dispatchEvent(new CustomEvent("ny:open-palette"));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette]);

  const onSelectLang = (l: Lang) => {
    setLang(l);
    setLangOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] h-[70px] backdrop-blur-xl border-b transition-all duration-300 ${
        scrolled ? "bg-[var(--nav-bg-scrolled)] border-subtle" : "bg-[var(--nav-bg)] border-transparent"
      }`}
    >
      <div className="container-port h-full flex items-center justify-between gap-5">
        <Link href="#home" className="font-display font-bold text-[1.6rem] tracking-wider">
          NY<span className="text-primary-light">.</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-6">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`relative text-sm font-medium transition-colors duration-200 after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:rounded after:bg-gradient-brand after:transition-all after:duration-300 ${
                  active === l.href.slice(1)
                    ? "text-body after:w-full"
                    : "text-muted hover:text-body after:w-0 hover:after:w-full"
                }`}
              >
                {t(l.labelKey)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Command palette trigger */}
          {mounted && (
            <button
              onClick={openPalette}
              aria-label="Command palette (Ctrl+K)"
              title="Command palette (Ctrl+K)"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-subtle bg-surface text-muted transition-all hover:border-primary-light hover:text-body hover:-translate-y-0.5"
            >
              <Command size={15} />
            </button>
          )}

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? t("theme.light") : t("theme.dark")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-subtle bg-surface text-muted transition-all hover:border-primary-light hover:text-body hover:-translate-y-0.5"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {/* Language dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
              aria-label="Change language"
              aria-haspopup="true"
              aria-expanded={langOpen}
              className="flex h-9 items-center justify-center gap-1 rounded-xl border border-subtle bg-surface px-2.5 text-xs font-bold text-muted transition-all hover:border-primary-light hover:text-body hover:-translate-y-0.5"
            >
              <Globe size={14} />
              <span>{LANG_CODES[lang]}</span>
              <ChevronDown size={12} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div
                className="absolute right-0 top-[calc(100%+8px)] w-[170px] rounded-xl border border-subtle bg-base-alt/95 backdrop-blur-xl py-2 shadow-2xl z-[110]"
                onClick={(e) => e.stopPropagation()}
              >
                {LANGS.map((l) => (
                  <button
                    key={l}
                    onClick={() => onSelectLang(l)}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                      l === lang
                        ? "text-primary-light font-semibold"
                        : "text-muted hover:text-body hover:bg-surface"
                    }`}
                  >
                    <span>{LANG_LABELS[l]}</span>
                    {l === lang && <span className="text-primary-light">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="/assets/resume.pdf"
            target="_blank"
            rel="noopener"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-subtle bg-surface px-4 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-primary-light/40 hover:bg-surface-hover"
          >
            <FileDown size={14} /> {t("nav.resume")}
          </a>
          <button
            className="lg:hidden p-2 cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden absolute top-[70px] right-0 w-[260px] h-[calc(100vh-70px)] bg-base-alt/95 border-l border-subtle backdrop-blur-xl flex flex-col gap-5 p-8 overflow-y-auto z-[100]">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted hover:text-body transition-colors"
            >
              {t(l.labelKey)}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

