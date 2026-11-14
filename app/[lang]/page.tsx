import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Services from "@/components/sections/Services";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Credentials from "@/components/sections/Credentials";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import type { Lang } from "@/lib/i18n/LanguageContext";
import { st } from "@/lib/i18n/server";
import { i18n } from "@/lib/i18n/config";

const SITE_URL = "https://nhuty.dev";

export async function generateMetadata({ params }: { params: { lang: Lang } }): Promise<Metadata> {
  const url = `${SITE_URL}/${params.lang}`;
  const description = st(params.lang, "hero.description");

  return {
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(i18n.locales.map((l) => [l, `${SITE_URL}/${l}`])),
    },
    openGraph: { url, description },
    twitter: { description },
  };
}

// Three.js layers are client-only → dynamic import with ssr:false
const ThreeBackground = dynamic(() => import("@/components/ui/ThreeBackground"), {
  ssr: false,
});

// Background FX layers (fixed, behind content)
function BackgroundFX() {
  return (
    <>
      <div className="pointer-events-none fixed  inset-0 -z-10 overflow-hidden">
        {/* 3D particle starfield */}
        <ThreeBackground />
        <div className="absolute -top-36 -left-32 h-[520px] w-[520px] rounded-full bg-primary opacity-45 blur-[90px] animate-float" />
        <div className="absolute -bottom-32 -right-28 h-[420px] w-[420px] rounded-full bg-primary-light opacity-45 blur-[90px] animate-float-slow" />
        <div className="absolute top-[45%] left-[55%] h-[300px] w-[300px] rounded-full bg-accent opacity-20 blur-[90px] animate-float" />
      </div>
      <div className="grid-overlay" />
    </>
  );
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nguyen Bui Nhut Y",
  url: SITE_URL,
  jobTitle: "Full-Stack Developer",
  sameAs: ["https://github.com/NguyenNhutY", "https://www.linkedin.com/in/nguyen-nhut-y/"],
};

export default function Home({ params: _params }: { params: { lang: Lang } }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <BackgroundFX />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Credentials />    
        <Services />     
        <Stats />      
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
    </>
  );
}

