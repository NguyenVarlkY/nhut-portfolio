import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://nhuty.dev"),
  title: "NGUYEN BUI NHUT Y — Full-Stack Developer",
  description: "Full-stack developer portfolio — building production-ready web products.",
  alternates: { canonical: "https://nhuty.dev" },
  openGraph: {
    type: "website",
    url: "https://nhuty.dev",
    title: "NGUYEN BUI NHUT Y — Full-Stack Developer",
    description: "Full-stack developer portfolio — building production-ready web products.",
    siteName: "NGUYEN BUI NHUT Y Portfolio",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NGUYEN BUI NHUT Y portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NGUYEN BUI NHUT Y — Full-Stack Developer",
    description: "Full-stack developer portfolio — building production-ready web products.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <body className="bg-base text-body font-body antialiased">
        {children}
      </body>
    </html>
  );
}
