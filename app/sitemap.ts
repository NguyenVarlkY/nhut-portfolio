import { MetadataRoute } from "next";
import { getPosts, getPostLangs } from "@/lib/blog";
import { i18n } from "@/lib/i18n/config";

const BASE_URL = "https://nhuty.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  const langPages: MetadataRoute.Sitemap = i18n.locales.flatMap((lang) => [
    { url: `${BASE_URL}/${lang}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/${lang}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/${lang}/tools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ]);

  // Each post is listed once per language it has actually been written in;
  // languages without a translation would only serve the fallback original.
  const blogPostPages: MetadataRoute.Sitemap = posts.flatMap((post) => {
    const langs = getPostLangs(post.slug, i18n.locales);
    const languages = Object.fromEntries(langs.map((l) => [l, `${BASE_URL}/${l}/blog/${post.slug}`]));
    return langs.map((lang) => ({
      url: `${BASE_URL}/${lang}/blog/${post.slug}`,
      lastModified: new Date(post.frontmatter.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages },
    }));
  });

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    ...langPages,
    ...blogPostPages,
  ];
}
