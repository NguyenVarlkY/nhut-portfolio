/* Search engine + link preview settings: built-in defaults, overridden from /admin → SEO. */
import type { Metadata } from "next";
import { getOverrides } from "./content/store";
import { mergeData } from "./content/types";
import { profile } from "./data";
import { st } from "./i18n/server";
import type { Lang } from "./i18n/LanguageContext";

/** Built-in title/description per language (what the admin's SEO page starts from). */
export function seoDefaults(lang: string) {
  return {
    title: `${profile.name} — ${profile.role}`,
    description: st(lang as Lang, "hero.description"),
  };
}

const envUrl = () => {
  const u = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  return u ? u.replace(/\/$/, "") : "https://nhut-y-portfolio.vercel.app";
};

/** Public address used in canonical links, the sitemap and share previews. */
export async function siteUrl(): Promise<string> {
  const o = await getOverrides().catch(() => ({}));
  return mergeData(o).seo.siteUrl || envUrl();
}

export async function seoSettings(lang: Lang) {
  const o = await getOverrides().catch(() => ({}) as Awaited<ReturnType<typeof getOverrides>>);
  const data = mergeData(o);
  const text = { ...seoDefaults(lang), ...((o.i18n?.[lang]?.seo as Record<string, string> | undefined) ?? {}) };
  return {
    url: data.seo.siteUrl || envUrl(),
    title: text.title || seoDefaults(lang).title,
    description: text.description || seoDefaults(lang).description,
    ogImage: data.seo.ogImage || "/og-image.png",
    keywords: data.seo.keywords,
    indexable: data.seo.indexable !== false,
    name: data.profile.name,
  };
}

/** Site-wide metadata (root layout). */
export async function rootMetadata(): Promise<Metadata> {
  const s = await seoSettings("en");
  return {
    metadataBase: new URL(s.url),
    title: s.title,
    description: s.description,
    keywords: s.keywords,
    robots: s.indexable ? undefined : { index: false, follow: false },
    alternates: { canonical: s.url },
    openGraph: {
      type: "website",
      url: s.url,
      title: s.title,
      description: s.description,
      siteName: `${s.name} Portfolio`,
      images: [{ url: s.ogImage, width: 1200, height: 630, alt: `${s.name} portfolio` }],
    },
    twitter: { card: "summary_large_image", title: s.title, description: s.description, images: [s.ogImage] },
    manifest: "/manifest.json",
  };
}
