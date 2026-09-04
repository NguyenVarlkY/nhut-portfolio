"use client";

import { motion } from "framer-motion";
import { Briefcase, FolderGit2, Users, Layers } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATS = [
  { key: "stats.years", value: "2+", icon: Briefcase },
  { key: "stats.projects", value: "10+", icon: FolderGit2 },
  { key: "stats.clients", value: "5+", icon: Users },
  { key: "stats.tech", value: "15+", icon: Layers },
];

export default function Stats() {
  const { t } = useTranslation();
  return (
    <section className="section-pad py-14">
      <div className="container-port">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.key}
                className="glass flex items-center gap-4 p-6 transition-all hover:-translate-y-1 hover:border-primary-light/40"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white shadow-glow">
                  <Icon size={22} />
                </div>
                <div>
                  <div className="font-display text-3xl font-bold grad-text">{s.value}</div>
                  <div className="text-sm text-muted">{t(s.key)}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

