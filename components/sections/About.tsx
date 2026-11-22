"use client";

import { motion } from "framer-motion";
import { UserRound, GitBranch, Rocket, Code2, Database, ShieldCheck, BriefcaseBusiness } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function About() {
  const { t } = useTranslation();

  const CARDS = [
    {
      icon: UserRound,
      title: t("about.whoTitle"),
      desc: t("about.whoDesc"),
    },
    {
      icon: GitBranch,
      title: t("about.whatTitle"),
      desc: t("about.whatDesc"),
    },
    {
      icon: Rocket,
      title: t("about.driveTitle"),
      desc: t("about.driveDesc"),
    },
  ];

  const HELP_CARDS = [
    {
      icon: Code2,
      title: t("about.help1Title"),
      desc: t("about.help1Desc"),
    },
    {
      icon: Database,
      title: t("about.help2Title"),
      desc: t("about.help2Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("about.help3Title"),
      desc: t("about.help3Desc"),
    },
    {
      icon: BriefcaseBusiness,
      title: t("about.help4Title"),
      desc: t("about.help4Desc"),
    },
  ];

  return (
    <section id="about" className="section-pad">
      <div className="container-port">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">{t("about.tag")}</span>
          <h2 className="section-title">
            {t("about.title")} <span className="grad-text">{t("about.titleHighlight")}</span>
          </h2>
        </motion.div>

        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              className="border-t border-subtle pt-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <h3 className="mb-3 flex items-center gap-2.5 font-display text-xl">
                <card.icon size={18} className="shrink-0 text-primary-light" aria-hidden />
                {card.title}
              </h3>
              <p className="text-[0.95rem] leading-relaxed text-muted">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 rounded-2xl border border-subtle bg-surface p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="section-tag">{t("about.availabilityTag")}</span>
              <h3 className="mt-3 font-display text-2xl md:text-3xl font-bold">{t("about.availabilityTitle")}</h3>
            </div>
            <a href="#contact" className="btn-primary inline-flex items-center justify-center">{t("about.availabilityAction")}</a>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{t("about.availabilityDesc")}</p>
        </motion.div>

        <div className="mt-12">
          <h3 className="mb-6 font-display text-2xl md:text-3xl font-bold">{t("about.helpTitle")}</h3>
          <ol className="grid gap-x-10 md:grid-cols-2">
            {HELP_CARDS.map((card, i) => (
              <motion.li
                key={card.title}
                className="grid grid-cols-[2.5rem_1fr] border-t border-subtle py-5"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <span className="font-mono text-sm text-primary-light tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h4 className="mb-1.5 font-display text-lg">{card.title}</h4>
                  <p className="text-[0.95rem] leading-relaxed text-muted">{card.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

