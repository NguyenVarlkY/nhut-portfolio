import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import BackToTop from "@/components/BackToTop";
import ChatBot from "@/components/ChatBot";
import ScrollProgress from "@/components/ScrollProgress";
import CommandPalette from "@/components/CommandPalette";
import Toast from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nhuty.dev"),
  title: "NGUYEN BUI NHUT Y — Full-Stack Developer",
  description:
    "Full-stack developer portfolio of Nguyen Bui Nhut Y — building production-ready web products with React, Next.js, TypeScript, Node.js, and MongoDB.",
  keywords: [
    "Nguyen Bui Nhut Y",
    "Full-Stack Developer",
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "Portfolio",
    "HCMC",
    "Vietnam",
    "Web Developer",
  ],
  openGraph: {
    title: "NGUYEN BUI NHUT Y — Full-Stack Developer",
    description:
      "Full-stack developer portfolio — building production-ready web products with React, Next.js, TypeScript, Node.js, and MongoDB.",
    type: "website",
    locale: "en_US",
    siteName: "Nguyen Bui Nhut Y Portfolio",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "Nguyen Bui Nhut Y Portfolio" },
      { url: "/og-image.png", width: 630, height: 1200, alt: "Nguyen Bui Nhut Y Portfolio Portrait" }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NGUYEN BUI NHUT Y — Full-Stack Developer",
    description:
      "Full-stack developer portfolio — building production-ready web products with React, Next.js, TypeScript, Node.js, and MongoDB.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://nhuty.dev",
    languages: {
      en: "/en",
      vi: "/vi",
      ko: "/ko",
      "zh-CN": "/zh",
      ja: "/ja",
      de: "/de",
      fr: "/fr",
    },
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Nguyen Bui Nhut Y",
      jobTitle: "Software Engineer (Fresher)",
      email: "y2002bt@gmail.com",
      telephone: "0825 400 965",
      address: { addressLocality: "District 7", addressRegion: "HCMC", addressCountry: "VN" },
      url: "https://nhuty.dev",
      knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "Docker"],
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <body className="bg-base text-body font-body antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <ScrollProgress />
            <CommandPalette />
            <Navbar />
            {children}
            <Footer />
            <BackToTop />
            <Toast />
            <ChatBot />
            <Analytics />
            <SpeedInsights />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

