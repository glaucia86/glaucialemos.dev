"use client";
import { useParams } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { isLocale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
export default function NotFound() { const params = useParams<{ lang?: string }>(); const lang = params.lang && isLocale(params.lang) ? params.lang : defaultLocale; const d = getDictionary(lang); return <main id="main" className="not-found"><PageHero sceneLabels={d.motion} eyebrow="404" title={d.notFound.title} subtitle={d.notFound.body} image="/pixel/404-stormtrooper.jpg" imageAlt={d.notFound.heroImageAlt} primary={{ href: `/${lang}`, label: d.notFound.back }} /></main>; }
