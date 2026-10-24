import "../globals.css";
import "../editorial.css";
import "../jedi-effects.css";
import "../pixel-ui.css";
import "../comlink.css";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/SiteChrome";
import localFont from "next/font/local";

const geist = localFont({ src: "../../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2", variable: "--font-geist", display: "swap" });
const geistMono = localFont({ src: "../../../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2", variable: "--font-geist-mono", display: "swap" });
// Departure Mono by Helena Zhang, SIL OFL 1.1 (src/app/fonts/DepartureMono-LICENSE.txt).
const departure = localFont({ src: "../fonts/DepartureMono-Regular.woff2", variable: "--font-departure", display: "swap", preload: true });

type Props = { children: ReactNode; params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return getDictionary(lang).metadata;
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang === "pt" ? "pt-BR" : lang} className={`${geist.variable} ${geistMono.variable} ${departure.variable}`} suppressHydrationWarning>
      <body><SiteChrome lang={lang} dictionary={getDictionary(lang)}>{children}</SiteChrome></body>
    </html>
  );
}
