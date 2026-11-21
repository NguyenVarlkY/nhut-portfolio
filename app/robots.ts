import { MetadataRoute } from "next";
import { seoSettings } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await seoSettings("en");
  return {
    rules: s.indexable
      ? { userAgent: "*", allow: ["/", "/api/media/"], disallow: ["/api/", "/admin"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${s.url}/sitemap.xml`,
  };
}
