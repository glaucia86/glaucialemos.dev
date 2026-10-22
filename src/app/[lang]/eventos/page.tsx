import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlobeLoader } from "@/components/GlobeLoader";
import { HeroScene } from "@/components/HeroScene";
import { EventHistory } from "@/components/EventHistory";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { eventsUI } from "@/i18n/events-ui";
import { getEventos, getEventStats, getEventCountries } from "@/lib/data";
type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? getDictionary(lang).events.metadata : {};
}
export default async function Events({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang), ui = eventsUI[lang];
  const events = getEventos(), stats = getEventStats();
  const locations = new Map<string, { location: [number, number]; size: number }>();
  events.filter(event => event.lat !== null && event.lon !== null).forEach(event => locations.set(`${event.lat},${event.lon}`, { location: [event.lat!,event.lon!], size: .035 }));
  const types = { palestra: 0, workshop: 0, organizacao: 0 };
  events.forEach(event => types[event.tipo]++);
  return <main id="main" className="events-page">
    <section className="page-hero events-hero">
      <div className="events-hero-copy"><p className="eyebrow">{d.events.eyebrow}</p><h1>{d.events.title}</h1><p className="page-hero__subtitle">{d.events.intro}</p><div className="actions"><Link className="button primary" href={`/${lang}/servicos?assunto=palestra#contato`}>{d.events.primaryCta}</Link><a className="hero-link" href="#eventos">{d.events.secondaryCta} <span aria-hidden="true">↗</span></a></div></div>
      <div className="events-art"><Image className="page-hero__image" src="/pixel/eventos-grogu.jpg" alt={d.events.heroImageAlt} fill priority sizes="(max-width: 900px) 100vw, 60vw" /><HeroScene image="/pixel/eventos-grogu.jpg" /></div>
    </section>
    <section className="globe-wrap events-atlas" aria-labelledby="atlas-title">
      <GlobeLoader markers={[...locations.values()]} labels={ui.globe} />
      <div className="atlas-copy"><h2 id="atlas-title">{ui.journey}</h2><p>{ui.journeyBody}</p><div className="event-stats">{[stats.eventos,stats.paises,Object.values(stats.idiomas).filter(Boolean).length].map((value,i) => <div key={d.events.labels[i]}><strong>{value.toLocaleString(lang)}</strong><span>{d.events.labels[i]}</span></div>)}</div><div className="event-countries"><h3>{d.events.countriesTitle}</h3><ul>{getEventCountries().map(country => <li key={country}>{country}</li>)}</ul><details><summary>{d.events.mapNote}</summary><p>{d.events.countryNote}</p></details></div></div>
    </section>
    <section id="eventos" className="event-history"><div className="archive-heading"><h2>{ui.archive}</h2><p>{ui.archiveBody}</p></div><EventHistory events={events} labels={{...ui,source:d.common.source,types:d.events.types}} /><p className="archive-note">{d.events.note}</p></section>
    <section className="breakdowns"><div><h2>{d.events.languageBreakdown}</h2>{Object.entries(stats.idiomas).map(([key,value]) => <p key={key}><span>{key}</span><strong>{value}</strong></p>)}</div><div><h2>{d.events.typeBreakdown}</h2>{Object.entries(types).map(([key,value]) => <p key={key}><span>{d.events.types[key as keyof typeof types]}</span><strong>{value}</strong></p>)}</div></section>
    <p className="data-note">{d.events.audienceNote}</p>
  </main>;
}
