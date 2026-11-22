"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import CurrencyConverter from "@/components/tools/CurrencyConverter";

interface Pkg {
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

        {/* Hourly rate: one line, not a box */}
        <p className="mb-10 max-w-2xl text-muted">
          <span className="font-semibold text-body">{t("services.hourlyTitle")} {t("services.hourlyPrice")}</span>
          {" — "}{t("services.hourlyDesc")}
        </p>

        {/* Packages */}
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, pi) => (
            <motion.div
              key={pkg.titleKey}
              className={`group relative flex flex-col rounded-xl border bg-surface p-7 backdrop-blur-xl transition-all ${
                pkg.popular
                  ? "border-primary-light/60 ring-1 ring-primary-light/30"
                  : "border-subtle hover:border-primary-light/45"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: pi * 0.1 }}
            >
              <h3 className="font-display text-xl">{t(pkg.titleKey)}</h3>
              <div className="mt-1 font-mono text-sm text-muted">{t(pkg.timeKey)}</div>

              <div className="my-4 border-t border-subtle" />

              <div className="font-display text-2xl font-bold">{t(pkg.priceKey)}</div>

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

