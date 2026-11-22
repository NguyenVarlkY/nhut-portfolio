"use client";

import { motion } from "framer-motion";
import { Briefcase, Mail, MapPin, Phone, FileDown } from "lucide-react";
import Link from "next/link";
import { useContent } from "@/lib/content/ContentContext";
import { useTranslation } from "@/lib/i18n/LanguageContext";


export default function Hero() {
  const { profile, roleRotator } = useContent();
  const { t, tList } = useTranslation();
  const localizedRoles = tList("hero.roles");
  // roles are written out, not typed letter by letter
  const roles = (localizedRoles.length ? localizedRoles : roleRotator).slice(0, 3).join(" · ");

  return (
    <header id="home" className="relative flex min-h-[88vh] items-center pt-[110px] pb-16">
      <div className="container-port w-full">
      <motion.div
        className="relative max-w-[760px] text-left"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {profile.avatar && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="mb-6 h-28 w-28 rounded-full border border-subtle p-[3px] md:h-32 md:w-32">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.avatar} alt={profile.name} className="h-full w-full rounded-full border-4 border-[var(--bg-base,#0b0b14)] object-cover" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface px-5 py-2 text-sm text-muted backdrop-blur mb-7"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {t("hero.available")}
        </motion.div>

        <motion.h1
          className="font-display text-4xl md:text-7xl lg:text-6xl xl:text-7xl font-bold tracking-wide [text-wrap:balance]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          <span className="block text-lg md:text-xl font-normal text-muted tracking-[0.2em] mb-2">
            {t("hero.greeting")}
          </span>
          <span className="grad-text">{profile.name}</span>
        </motion.h1>

        <motion.p
          className="text-accent text-lg md:text-xl mt-4 mb-4 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {roles}
        </motion.p>

        <motion.p
          className="max-w-[640px] text-muted text-[1rem] md:text-lg mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          {t("hero.description")}
        </motion.p>

        <motion.p
          className="mb-8 max-w-[560px] text-sm text-muted md:text-[1rem]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.82 }}
        >
          {t("hero.subDescription")}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Link href="#projects" className="btn-primary">
            <Briefcase size={16} /> {t("hero.viewWork")}
          </Link>
          <Link href="#contact" className="btn-ghost">
            <Mail size={16} /> {t("hero.contactMe")}
          </Link>
          <a href={profile.cvUrl || "/assets/resume.pdf"} download="Nguyen-Bui-Nhut-Y-CV.pdf" target="_blank" rel="noopener" className="btn-ghost">
            <FileDown size={16} /> CV
          </a>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
        >
          <span className="flex items-center gap-2">
            <MapPin size={14} className="text-primary-light" /> {profile.location}
          </span>
          <span className="flex items-center gap-2">
            <Mail size={14} className="text-primary-light" /> {profile.email}
          </span>
          <span className="flex items-center gap-2">
            <Phone size={14} className="text-primary-light" /> {profile.phone}
          </span>
        </motion.div>
      </motion.div>

      </div>
    </header>
  );
}

