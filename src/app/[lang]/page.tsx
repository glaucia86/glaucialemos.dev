import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getEventStats, getServicos } from "@/lib/data";
import { getProjetosComEstrelas } from "@/lib/github";
import { notFound } from "next/navigation";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (!isLocale(lang)) notFound();
  const d = getDictionary(lang); const stats = getEventStats(); const projects = await getProjetosComEstrelas();
  const stars = projects.slice(0, 4).reduce((sum, project) => sum + project.estrelas, 0);
  return <main id="main">
    <PageHero eyebrow={d.home.eyebrow} title={d.home.heading} subtitle={d.home.value} image="/pixel/home-yoda.jpg" imageAlt={d.home.heroImageAlt} primary={{ href: `/${lang}/servicos`, label: d.home.primaryCta }} secondary={{ href: `/${lang}/eventos`, label: d.home.secondaryCta }} />
    <section className="stats" aria-label={d.accessibility.highlights}>{[stats.eventos,stats.paises,Object.values(stats.idiomas).filter(Boolean).length,stars].map((value,index) => <div key={d.home.stats[index]}><strong>{value.toLocaleString()}</strong><span>{d.home.stats[index]}</span></div>)}</section>
    <section className="about-preview"><Image src="/pixel/jedi-glaucia.jpg" alt={d.home.aboutImageAlt} width={720} height={960} sizes="(max-width: 800px) 100vw, 42vw" /><div><p className="eyebrow">{d.about.eyebrow}</p><h2>{d.home.aboutTitle}</h2><p>{d.about.intro}</p><p>{d.about.mvp}</p></div></section>
    <section className="service-teaser"><div><p className="eyebrow">{d.home.servicesEyebrow}</p><h2>{d.home.servicesTitle}</h2><p>{d.home.servicesBody}</p></div><div className="mini-services">{getServicos().map((service, index) => <article key={service.id}><span>0{index+1}</span><h3>{service.titulo[lang]}</h3></article>)}</div></section>
    <section className="crawl-section"><h2>{d.home.crawlTitle}</h2><div className="crawl"><div>{d.home.crawl.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div></section>
  </main>;
}
