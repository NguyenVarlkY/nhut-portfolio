"use client";

import { motion } from "framer-motion";
import { experience } from "@/lib/data";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function Experience() {
  const { t } = useTranslation();
  return (
    <section id="experience" className="section-pad">
      <div className="container-port">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">{t("experience.tag")}</span>
          <h2 className="section-title">
            {t("experience.title")} <span className="grad-text">{t("experience.titleHighlight")}</span>
          </h2>
        </motion.div>

        <div className="relative max-w-[820px] mx-auto pl-9">
          {/* timeline line */}
          <div className="absolute left-[8px] top-2 bottom-2 w-[2px] rounded bg-gradient-to-b from-primary to-accent opacity-50" />

          {experience.map((job, ji) => (
            <motion.div
              key={ji}
              className="relative mb-8 rounded-xl border border-subtle bg-surface p-7 backdrop-blur-xl transition-all hover:translate-x-1.5 hover:border-primary-light/40"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: ji * 0.08 }}
            >
              {/* dot */}
              <span className="absolute -left-[34px] top-8 h-[18px] w-[18px] rounded-full border-[3px] border-primary-light bg-base" />

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg">{job.title}</h3>
                  <div className="font-mono text-sm text-primary-light">{job.company}</div>
                </div>
                <span className="whitespace-nowrap rounded-full border border-subtle bg-surface px-4 py-1 font-mono text-xs text-muted">
                  {job.date}
                </span>
              </div>

              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted">
                {job.desc.map((d, di) => (
                  <li key={di} className="flex gap-2">
                    <span className="text-accent">▹</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              {job.outcome && (
                <div className="mt-3 rounded-r-xl border-l-[3px] border-accent bg-accent/5 px-4 py-2.5 text-xs text-muted">
                  <span className="font-semibold text-accent">Outcome:</span> {job.outcome}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

