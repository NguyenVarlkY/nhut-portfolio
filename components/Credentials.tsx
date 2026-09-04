"use client";

import { motion } from "framer-motion";
import { Award, Languages, GraduationCap, BookOpen } from "lucide-react";
import { certifications, languages, education } from "@/lib/data";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function Credentials() {
  const { t } = useTranslation();
  return (
    <section id="education" className="section-pad">
      <div className="container-port">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">{t("credentials.tag")}</span>
          <h2 className="section-title">
            {t("credentials.title")} <span className="grad-text">{t("credentials.titleHighlight")}</span>
          </h2>
        </motion.div>

        <div className="grid gap-7 lg:grid-cols-2">
          {/* Certifications & Languages */}
          <motion.div
            className="glass p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="mb-4 flex items-center gap-3 font-display text-xl">
              <Award size={20} className="text-primary-light" /> {t("credentials.certifications")}
            </h3>
            <ul className="space-y-3">
              {certifications.map((c) => (
                <li key={c.title} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="text-body font-medium">▹ {c.title}</span>
                  <span className="text-muted">— {c.issuer}</span>
                  <span className="ml-auto font-mono text-xs text-muted">{c.date}</span>
                </li>
              ))}
            </ul>

            <h3 className="mb-4 mt-8 flex items-center gap-3 font-display text-xl">
              <Languages size={20} className="text-primary-light" /> {t("credentials.languages")}
            </h3>
            <ul className="space-y-3">
              {languages.map((l) => (
                <li key={l.name} className="text-sm">
                  <span className="text-body font-medium">▹ {l.name}</span>
                  <span className="ml-2 text-muted">{l.detail}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Education */}
          <motion.div
            className="glass p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            <h3 className="mb-4 flex items-center gap-3 font-display text-xl">
              <GraduationCap size={20} className="text-primary-light" /> {t("credentials.education")}
            </h3>
            <h4 className="font-display text-base text-body">{education.degree}</h4>
            <p className="text-sm text-muted">
              {education.school} — <span className="font-mono text-xs">{education.period}</span>
            </p>
            <ul className="mt-4 space-y-2">
              {education.highlights.map((h, hi) => (
                <li key={hi} className="flex gap-2 text-sm text-muted">
                  <span className="text-accent">▹</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <h3 className="mb-3 mt-8 flex items-center gap-3 font-display text-xl">
              <BookOpen size={20} className="text-primary-light" /> {t("credentials.selfDirected")}
            </h3>
            <p className="text-sm leading-relaxed text-muted">{education.selfDirected}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

