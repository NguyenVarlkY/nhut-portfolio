"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface TestimonialItem {
  quoteKey: string;
  nameKey: string;
  roleKey: string;
  initials: string;
  rating: number;
}

export default function Testimonials() {
  const { t } = useTranslation();

  const items: TestimonialItem[] = [
    {
      quoteKey: "testimonials.t1Quote",
      nameKey: "testimonials.t1Name",
      roleKey: "testimonials.t1Role",
      initials: "HC",
      rating: 5,
    },
    {
      quoteKey: "testimonials.t2Quote",
      nameKey: "testimonials.t2Name",
      roleKey: "testimonials.t2Role",
      initials: "MT",
      rating: 5,
    },
    {
      quoteKey: "testimonials.t3Quote",
      nameKey: "testimonials.t3Name",
      roleKey: "testimonials.t3Role",
      initials: "DK",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="section-pad">
      <div className="container-port">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">{t("testimonials.tag")}</span>
          <h2 className="section-title">
            {t("testimonials.title")}{" "}
            <span className="grad-text">{t("testimonials.titleHighlight")}</span>
          </h2>
        </motion.div>

        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.figure
              key={item.nameKey}
              className="group relative flex flex-col rounded-xl border border-subtle bg-surface p-7 backdrop-blur-xl transition-all hover:-translate-y-1.5 hover:border-primary-light/45 hover:shadow-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              <Quote
                size={28}
                className="absolute right-6 top-6 text-accent/20 transition-colors group-hover:text-accent/50"
              />

              <div className="mb-4 flex gap-1">
                {Array.from({ length: item.rating }).map((_, s) => (
                  <Star key={s} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <blockquote className="flex-1 text-sm leading-relaxed text-muted">
                “{t(item.quoteKey)}”
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-subtle pt-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-brand font-display text-sm font-bold text-white shadow-glow">
                  {item.initials}
                </div>
                <div>
                  <div className="font-display text-sm font-semibold">{t(item.nameKey)}</div>
                  <div className="text-xs text-muted">{t(item.roleKey)}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
