import { socialLinks } from "@/data/social";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentFilter } from "@/components/ContentFilter";
import { PageHero } from "@/components/PageHero";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getArtigos } from "@/lib/data";
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return isLocale(lang) ? getDictionary(lang).content.metadata : {}; }
export default async function Content({ params }: Props) { const { lang } = await params; if (!isLocale(lang)) notFound(); const d = getDictionary(lang); return <main id="main" className="inner-page"><PageHero sceneLabels={d.motion} eyebrow={d.content.eyebrow} title={d.content.title} subtitle={d.content.intro} image="/pixel/conteudo-chewbacca.jpg" imageAlt={d.content.heroImageAlt} primary={{ href: "#artigos", label: d.content.primaryCta }} secondary={{ href: socialLinks.youtube, label: d.content.secondaryCta }} /><ContentFilter articles={getArtigos()} all={d.common.all} label={d.content.filter} locale={lang === "pt" ? "pt-BR" : lang} /></main>; }
