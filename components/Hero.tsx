"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Mail, MapPin, Phone, FileDown } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { profile, roleRotator } from "@/lib/data";
import { useTranslation } from "@/lib/i18n/LanguageContext";

// Client-only Three.js sculpture → lazy load to keep initial bundle small
const Hero3D = dynamic(() => import("@/components/Hero3D"), { ssr: false });

export default function Hero() {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const roleIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = roleRotator[roleIdx.current];
      const displayed = deleting.current
        ? current.slice(0, charIdx.current--)
        : current.slice(0, ++charIdx.current);

      setText(displayed);

      let speed = deleting.current ? 28 : 60;
      if (!deleting.current && charIdx.current === current.length) {
        speed = 1800;
        deleting.current = true;
      } else if (deleting.current && charIdx.current === 0) {
        deleting.current = false;
        roleIdx.current = (roleIdx.current + 1) % roleRotator.length;
        speed = 420;
      }
      timer = setTimeout(tick, speed);
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header id="home" className="relative flex min-h-screen items-center justify-center px-6 pt-[110px] pb-16">
      {/* Floating 3D sculpture (desktop only, positioned right) */}
      <Hero3D />

      <motion.div
        className="max-w-[880px] text-center md:mr-[160px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
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
          className="font-display text-4xl md:text-7xl font-bold tracking-wide"
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
          className="font-mono text-accent text-lg md:text-2xl min-h-[2.2em] mt-4 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {text}
          <span className="caret">|</span>
        </motion.p>

        <motion.p
          className="mx-auto max-w-[660px] text-muted text-base md:text-lg mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          {t("hero.description")}
        </motion.p>

        <motion.p
          className="mx-auto mb-8 max-w-[560px] text-sm text-muted md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.82 }}
        >
          {t("hero.subDescription")}
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-8"
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
          <a href="/assets/resume.pdf" download="Nguyen-Bui-Nhut-Y-CV.pdf" target="_blank" rel="noopener" className="btn-ghost">
            <FileDown size={16} /> CV
          </a>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted"
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

      <a
        href="#about"
        aria-label="Scroll down"
        className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[#9a9ab0] animate-bounce text-lg"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
    </header>
  );
}

