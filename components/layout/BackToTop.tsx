"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("backToTop")}
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border border-subtle bg-gradient-to-br from-primary to-primary-light text-white shadow-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-lg ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}
