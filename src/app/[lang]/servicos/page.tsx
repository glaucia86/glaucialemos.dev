import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getServicos } from "@/lib/data";
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return isLocale(lang) ? getDictionary(lang).services.metadata : {}; }
export default async function Services({ params }: Props) { const { lang } = await params; if (!isLocale(lang)) notFound(); const d = getDictionary(lang); return <main id="main" className="inner-page"><PageHero eyebrow={d.services.eyebrow} title={d.services.title} subtitle={d.services.intro} image="/pixel/servicos-vader.jpg" imageAlt={d.services.heroImageAlt} primary={{ href: "#contato", label: d.home.primaryCta }} secondary={{ href: `/${lang}/eventos`, label: d.events.secondaryCta }} extra={<p className="page-hero__extra">{d.services.speech}</p>} /><section className="service-cards">{getServicos().map((service,index) => <article key={service.id}><span>0{index+1}</span><h2>{service.titulo[lang]}</h2><p>{service.descricao[lang]}</p><strong>{d.services.price}</strong></article>)}</section><Suspense fallback={null}><ContactForm copy={d.services} formId={process.env.NEXT_PUBLIC_FORMSPREE_ID} /></Suspense></main>; }
