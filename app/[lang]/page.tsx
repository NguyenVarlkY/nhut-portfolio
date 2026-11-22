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
import { seoSettings } from "@/lib/seo";
import { getOverrides } from "@/lib/content/store";
import { mergeData } from "@/lib/content/types";
import { i18n } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: { lang: Lang } }): Promise<Metadata> {
  const s = await seoSettings(params.lang);
  const url = `${s.url}/${params.lang}`;
  return {
    title: s.title,
    description: s.description,
    keywords: s.keywords,
    robots: s.indexable ? undefined : { index: false, follow: false },
    alternates: {
      canonical: url,
      languages: Object.fromEntries(i18n.locales.map((l) => [l, `${s.url}/${l}`])),
    },
    openGraph: { type: "website", url, title: s.title, description: s.description, locale: params.lang, images: [{ url: s.ogImage, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: s.title, description: s.description, images: [s.ogImage] },
  };
}


export default async function Home({ params }: { params: { lang: Lang } }) {
  const s = await seoSettings(params.lang);
  const o = await getOverrides().catch(() => ({}));
  const { profile } = mergeData(o);
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: s.url,
    jobTitle: profile.role,
    ...(profile.avatar ? { image: new URL(profile.avatar, s.url).toString() } : {}),
    sameAs: [profile.github, profile.linkedin, profile.facebook].filter(Boolean),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
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

