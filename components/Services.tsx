"use client";

import { motion } from "framer-motion";
import { Clock, Package, Rocket, Store, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import CurrencyConverter from "@/components/tools/CurrencyConverter";

interface Pkg {
  icon: React.ReactNode;
  titleKey: string;
  priceKey: string;
  timeKey: string;
  featuresKey: string[];
  popular?: boolean;
}

export default function Services() {
  const { t } = useTranslation();

const packages: Pkg[] = [
    {
      icon: <Rocket size={24} />,
      titleKey: "services.package1Title",
      priceKey: "services.package1Price",
      timeKey: "services.package1Time",
      featuresKey: [
        "services.package1Features.0",
        "services.package1Features.1",
        "services.package1Features.2",
        "services.package1Features.3",
        "services.package1Features.4",
        "services.package1Features.5",
        "services.package1Features.6",
        "services.package1Features.7",
      ],
    },
    {
      icon: <Store size={24} />,
      titleKey: "services.package2Title",
      priceKey: "services.package2Price",
      timeKey: "services.package2Time",
      featuresKey: [
        "services.package2Features.0",
        "services.package2Features.1",
        "services.package2Features.2",
        "services.package2Features.3",
        "services.package2Features.4",
        "services.package2Features.5",
        "services.package2Features.6",
        "services.package2Features.7",
      ],
      popular: true,
    },
    {
      icon: <Package size={24} />,
      titleKey: "services.package3Title",
      priceKey: "services.package3Price",
      timeKey: "services.package3Time",
      featuresKey: [
        "services.package3Features.0",
        "services.package3Features.1",
        "services.package3Features.2",
        "services.package3Features.3",
        "services.package3Features.4",
        "services.package3Features.5",
        "services.package3Features.6",
        "services.package3Features.7",
      ],
    },
  ];

  return (
    <section id="services" className="section-pad">
      <div className="container-port">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">{t("services.tag")}</span>
          <h2 className="section-title">
            {t("services.title")}{" "}
            <span className="grad-text">{t("services.titleHighlight")}</span>
          </h2>
        </motion.div>

        {/* Hourly rate card */}
        <motion.div
          className="glass mx-auto mb-12 flex max-w-[680px] flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
            <Clock size={26} />
          </div>
          <div>
            <div className="font-display text-lg font-semibold">
              {t("services.hourlyTitle")}
              <span className="ml-2 grad-text text-xl font-bold">{t("services.hourlyPrice")}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t("services.hourlyDesc")}</p>
          </div>
        </motion.div>

        {/* Packages */}
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, pi) => (
            <motion.div
              key={pkg.titleKey}
              className={`group relative flex flex-col rounded-xl border bg-surface p-7 backdrop-blur-xl transition-all hover:-translate-y-1.5 ${
                pkg.popular
                  ? "border-primary-light/60 shadow-card ring-1 ring-primary-light/30"
                  : "border-subtle hover:border-primary-light/45 hover:shadow-card"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: pi * 0.1 }}
            >
              {pkg.popular && (
                <span className="absolute -top-3 right-5 rounded-full bg-gradient-brand px-3 py-1 font-mono text-[11px] font-bold text-white shadow-glow">
                  ★ Popular
                </span>
              )}

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-accent transition-colors group-hover:text-primary-light">
                {pkg.icon}
              </div>

              <h3 className="font-display text-xl">{t(pkg.titleKey)}</h3>
              <div className="mt-1 font-mono text-sm text-muted">{t(pkg.timeKey)}</div>

              <div className="my-4 border-t border-subtle" />

              <div className="font-display text-2xl font-bold grad-text">{t(pkg.priceKey)}</div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {pkg.featuresKey.map((fk) => (
                  <li key={fk} className="flex items-start gap-2 text-sm text-muted">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                    <span>{t(fk)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-[640px] text-center text-sm leading-relaxed text-muted">
          💡 {t("services.note")}
        </p>



        <CurrencyConverter />

      </div>
    </section>
  );
}

