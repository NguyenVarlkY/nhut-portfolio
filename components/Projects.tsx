 "use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
Hotel, ShoppingCart, Car, Github, X, ExternalLink, Calendar, Tag,
  List, Zap, Shield, Code, Database, Server, Monitor, Cpu,
  AlertTriangle, CheckCircle, TrendingUp, Settings, Activity, Layout,
  BarChart3, PieChart, Lightbulb, Target, ArrowRight, Sparkles
} from "lucide-react";
import { projects, profile } from "@/lib/data";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const ICONS: Record<string, any> = {
  hotel: Hotel,
  cart: ShoppingCart,
  car: Car,
  server: Server,
  database: Database,
monitor: Monitor,
  cpu: Cpu,
  code: Code,
  shield: Shield,
  zap: Zap,
  list: List,
  alert: AlertTriangle,
  check: CheckCircle,
  trending: TrendingUp,
  settings: Settings,
  activity: Activity,
  layout: Layout,
  barChart: BarChart3,
  pieChart: PieChart,
};

export default function Projects() {
  const { t } = useTranslation();
  const [activeProj, setActiveProj] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((p) => p.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!filter) return projects;
    return projects.filter((p) => p.tags.includes(filter));
  }, [filter]);

  const activeProject = useMemo(
    () => projects.find((project) => project.title === activeProj) ?? null,
    [activeProj]
  );

  useEffect(() => {
    if (!activeProj) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveProj(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProj]);

  return (
    <section id="projects" className="section-pad border-y border-subtle bg-base-alt">
      <div className="container-port">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">{t("projects.tag")}</span>
          <h2 className="section-title">
            {t("projects.title")} <span className="grad-text">{t("projects.titleHighlight")}</span>
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            Selected work focused on real-world product delivery, user-facing interfaces, and business workflows that support growth and operations.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter(null)}
              className={`rounded-lg border px-3 py-1 font-mono text-xs transition-all ${
                !filter
                  ? "border-primary-light bg-primary-light/10 text-primary-light"
                  : "border-subtle bg-surface text-muted hover:border-primary-light hover:text-body"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`rounded-lg border px-3 py-1 font-mono text-xs transition-all ${
                  filter === tag
                    ? "border-primary-light bg-primary-light/10 text-primary-light"
                    : "border-subtle bg-surface text-muted hover:border-primary-light hover:text-body"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((proj) => {
            const Icon = ICONS[proj.icon] ?? Hotel;
            return (
              <motion.div
                key={proj.title}
                layout
                role="button"
                tabIndex={0}
                aria-label={`Open case study: ${proj.title}`}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-subtle bg-surface backdrop-blur-xl transition-all hover:-translate-y-1.5 hover:border-primary-light/45 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                onClick={() => setActiveProj(proj.title)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveProj(proj.title);
                  }
                }}
              >
                <div
                  className="flex h-[130px] items-center justify-center text-white text-4xl"
                  style={{ background: `linear-gradient(135deg, ${proj.g1}, ${proj.g2})` }}
                >
                  <Icon size={42} />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl">{proj.title}</h3>
                  <div className="mt-1 font-mono text-xs text-muted">{proj.date}</div>

                  {/* Business Core Badge */}
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-light/10 text-primary-light">
                      <Database size={12} /> {proj.tagline}
                    </span>
                  </div>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted line-clamp-4">{proj.desc}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {proj.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                    {proj.tags.length > 3 && (
                      <span className="chip">+{proj.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-subtle pt-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-primary-light">
                      <ExternalLink size={15} /> Open case study
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted">Case</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Project detail modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveProj(null)}
          >
            <motion.div
              className="relative max-h-[85vh] w-full max-w-[720px] overflow-y-auto rounded-xl border border-subtle bg-base-alt/95 p-7 shadow-2xl backdrop-blur-xl md:p-9"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveProj(null)}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-subtle bg-surface text-muted transition-all hover:border-primary-light hover:text-body"
              >
                <X size={17} />
              </button>

              {(() => {
                const proj = activeProject;
                const Icon = ICONS[proj.icon] ?? Hotel;
                return (
                  <>
                    <div
                      className="flex h-[110px] items-center justify-center rounded-xl text-white text-4xl"
                      style={{ background: `linear-gradient(135deg, ${proj.g1}, ${proj.g2})` }}
                    >
                      <Icon size={40} />
                    </div>

                    <h3 className="mt-5 font-display text-2xl font-bold">{proj.title}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={13} /> {proj.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Sparkles size={13} /> {proj.tagline}
                      </span>
                    </div>

                    {/* Business Core Section */}
                    <div className="mt-5 rounded-lg border border-subtle bg-surface p-4">
                      <h4 className="font-semibold text-sm text-body mb-1 flex items-center gap-2">
                        <Target size={15} className="text-primary-light" /> {t("projects.businessCore")}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted">{proj.businessCore}</p>
                    </div>

                    {/* Flow Section */}
                    <div className="mt-4 rounded-lg border border-subtle bg-surface p-4">
                      <h4 className="font-semibold text-sm text-body mb-3 flex items-center gap-2">
                        <Zap size={15} className="text-accent" /> {t("projects.flow")}
                      </h4>
                      <ol className="space-y-2.5">
                        {proj.flow.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-light/15 text-[11px] font-bold text-primary-light">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                            {i < proj.flow.length - 1 && (
                              <ArrowRight size={14} className="mt-1 shrink-0 text-subtle" />
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Problem Section */}
                    <div className="mt-4 rounded-lg border border-subtle bg-surface p-4">
                      <h4 className="font-semibold text-sm text-body mb-1 flex items-center gap-2">
                        <AlertTriangle size={15} className="text-red-400" /> {t("projects.problem")}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted">{proj.problem}</p>
                    </div>

                    {/* Solution Section */}
                    <div className="mt-4 rounded-lg border border-subtle bg-surface p-4">
                      <h4 className="font-semibold text-sm text-body mb-1 flex items-center gap-2">
                        <CheckCircle size={15} className="text-green-400" /> {t("projects.solution")}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted">{proj.solution}</p>
                    </div>

                    {/* Detailed description */}
                    <div className="mt-4 rounded-lg border border-subtle bg-surface p-4">
                      <h4 className="font-semibold text-sm text-body mb-1 flex items-center gap-2">
                        <Lightbulb size={15} className="text-amber-400" /> Overview
                      </h4>
                      <p className="text-sm leading-relaxed text-muted">{proj.desc}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href={proj.githubUrl ?? profile.github}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-2 rounded-xl border border-subtle bg-surface px-3 py-2 text-sm font-medium text-muted transition-all hover:border-primary-light hover:text-body"
                      >
                        <Github size={15} /> {t("projects.source")}
                      </a>
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-2 rounded-xl border border-primary-light/40 bg-primary-light/10 px-3 py-2 text-sm font-medium text-primary-light transition-all hover:border-primary-light hover:bg-primary-light/20"
                        >
                          <ExternalLink size={15} /> {t("projects.liveDemo")}
                        </a>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mt-4 rounded-lg border border-subtle bg-surface p-4">
                      <h4 className="font-semibold text-sm text-body mb-3 flex items-center gap-2">
                        <List size={15} className="text-primary-light" /> Key Features
                      </h4>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {proj.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted">
                            <CheckCircle size={14} className="mt-0.5 shrink-0 text-green-400" />
                            <span className="leading-relaxed">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-body">
                        <Tag size={15} className="text-accent" /> Tech Stack
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {proj.tags.map((tag) => (
                          <span key={tag} className="chip">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-subtle pt-5">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-body">
                        <Code size={15} className="text-accent" /> {t("projects.techHighlight")}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {proj.techHighlight.map((tech) => (
                          <span key={tech} className="chip chip-outline">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
