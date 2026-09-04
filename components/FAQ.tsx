"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const FAQ_ITEMS = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
];

export default function FAQ() {
  const { t } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad border-y border-subtle bg-base-alt">
      <div className="container-port">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">{t("faq.tag")}</span>
          <h2 className="section-title">
            {t("faq.title")} <span className="grad-text">{t("faq.titleHighlight")}</span>
          </h2>
        </motion.div>

        <div className="mx-auto max-w-[760px] space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIdx === i;
            return (
              <motion.div
                key={item.q}
                className="glass overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-surface/50"
                >
                  <MessageCircleQuestion size={18} className="shrink-0 text-primary-light" />
                  <span className="flex-1 font-medium text-body">{t(item.q)}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{t(item.a)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

