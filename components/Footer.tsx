"use client";

import { Github, Mail, Linkedin, Facebook } from "lucide-react";
import { profile } from "@/lib/data";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import ViewCounter from "@/components/ViewCounter";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-subtle bg-base-alt py-9 px-6">
      <div className="container-port flex flex-wrap items-center justify-between gap-4">
        <div className="font-display font-bold text-xl">
          NY<span className="text-primary-light">.</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <p>© {new Date().getFullYear()} {profile.name}. {t("footer.builtWith")}.</p>
          <ViewCounter />
        </div>
        <div className="flex gap-3">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-subtle bg-surface text-muted transition-all hover:border-primary-light hover:text-body hover:-translate-y-0.5"
          >
            <Github size={18} />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener"
            aria-label="LinkedIn"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-subtle bg-surface text-muted transition-all hover:border-primary-light hover:text-body hover:-translate-y-0.5"
          >
            <Linkedin size={18} />
          </a>
          <a
            href={profile.facebook}
            target="_blank"
            rel="noopener"
            aria-label="Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-subtle bg-surface text-muted transition-all hover:border-primary-light hover:text-body hover:-translate-y-0.5"
          >
            <Facebook size={18} />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-subtle bg-surface text-muted transition-all hover:border-primary-light hover:text-body hover:-translate-y-0.5"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}

