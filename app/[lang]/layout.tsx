import ThemeProvider from "@/components/ui/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/layout/BackToTop";
import ChatBot from "@/components/ui/ChatBot";
import ScrollProgress from "@/components/layout/ScrollProgress";
import CommandPalette from "@/components/ui/CommandPalette";
import Toast from "@/components/ui/Toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Lang } from "@/lib/i18n/LanguageContext";

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Lang };
}) {
  return (
    <ThemeProvider>
      <LanguageProvider lang={params.lang}>
        <ScrollProgress />
        <CommandPalette />
        <Navbar lang={params.lang} />
        {children}
        <Footer />
        <BackToTop />
        <Toast />
        <ChatBot />
        <Analytics />
        <SpeedInsights />
      </LanguageProvider>
    </ThemeProvider>
  );
}
