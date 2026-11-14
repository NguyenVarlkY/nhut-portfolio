import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n/LanguageContext";

const SITE_URL = "https://nhuty.dev";

export async function generateMetadata({ params }: { params: { lang: Lang } }): Promise<Metadata> {
  const url = `${SITE_URL}/${params.lang}/tools`;
  const title = "Tools — NGUYEN BUI NHUT Y";
  const description = "Free web tools: todo dashboard, currency converter, SEO & security checker, system info viewer, and speech-to-text.";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
