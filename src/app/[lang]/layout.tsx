import "../globals.css";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale, isLocale, locales } from "@/i18n/config";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/SiteChrome";
import { geist, geistMono } from "../fonts";

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
  // Pages reject unknown locales through their not-found boundary. The root
  // document must still render so that boundary has a valid html/body shell.
  const locale = isLocale(lang) ? lang : defaultLocale;

  return (
    <html lang={locale === "pt" ? "pt-BR" : locale} className={`${geist.variable} ${geistMono.variable}`}>
      <body><SiteChrome lang={locale} dictionary={getDictionary(locale)}>{children}</SiteChrome></body>
    </html>
  );
}
