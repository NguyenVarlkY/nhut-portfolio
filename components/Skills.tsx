"use client";

import { motion } from "framer-motion";
import { Monitor, Server, Cloud, Brain } from "lucide-react";
import { skills } from "@/lib/data";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const ICONS: Record<string, any> = { display: Monitor, server: Server, cloud: Cloud, brain: Brain };

export default function Skills() {
  const { t } = useTranslation();
  return (
    <section id="skills" className="section-pad border-y border-subtle bg-base-alt">
      <div className="container-port">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">{t("skills.tag")}</span>
          <h2 className="section-title">
            {t("skills.title")} <span className="grad-text">{t("skills.titleHighlight")}</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {skills.map((group, gi) => {
            const Icon = ICONS[group.icon] ?? Monitor;
            return (
              <motion.div
                key={group.title}
                className="glass p-7 transition-all hover:-translate-y-1 hover:border-accent/40"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: gi * 0.1 }}
              >
                <h3 className="mb-4 flex items-center gap-3 font-display text-lg">
                  <Icon size={20} className="text-accent" />
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

