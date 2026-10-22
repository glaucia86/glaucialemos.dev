import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { GlobeLoader } from "@/components/GlobeLoader";
import { PageHero } from "@/components/PageHero";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getEventos, getEventStats } from "@/lib/data";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? getDictionary(lang).events.metadata : {};
}

export default async function Events({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const events = getEventos();
  const stats = getEventStats();
  const locations = new Map(events.filter((event) => event.lat !== null && event.lon !== null)
    .map((event) => [`${event.lat},${event.lon}`, [event.lat!, event.lon!] as [number, number]]));
  const markers = [...locations.values()].map((location) => ({ location, size: .035 }));
  const types = { palestra: 0, workshop: 0, organizacao: 0 };
  events.forEach((event) => types[event.tipo]++);
  const years = [...new Set(events.map((event) => event.ano))].sort((a, b) => b - a);
  const breakdowns = [
    { title: d.events.languageBreakdown, rows: Object.entries(stats.idiomas) },
    { title: d.events.typeBreakdown, rows: Object.entries(types).map(([key, value]) => [d.events.types[key as keyof typeof types], value] as const) },
  ];

  return <main id="main" className="inner-page">
    <PageHero eyebrow={d.events.eyebrow} title={d.events.title} subtitle={d.events.intro}
      image="/pixel/eventos-grogu.jpg" imageAlt={d.events.heroImageAlt}
      primary={{ href: `/${lang}/servicos?assunto=palestra#contato`, label: d.events.primaryCta }}
      secondary={{ href: "#eventos", label: d.events.secondaryCta }} />
    <section className="event-reach" aria-labelledby="reach-title">
      <div className="event-reach__heading"><p className="eyebrow">{d.events.eyebrow}</p><h2 id="reach-title">{d.events.mapTitle}</h2></div>
      <div className="globe-wrap">
        <figure className="globe-stage">
          <div className="globe-stage__visual" aria-hidden="true">
            <div className="globe-orbit globe-orbit--outer" />
            <div className="globe-orbit globe-orbit--inner" />
            <div className="globe-fallback"><i /><i /><i /></div>
            <GlobeLoader markers={markers} />
          </div>
          <figcaption>
            <span className="globe-legend-dot" aria-hidden="true" />
            <span className="globe-caption--map">{d.events.mapLegend}</span>
            <span className="globe-caption--static">{d.events.mapFallback}</span>
          </figcaption>
        </figure>
        <div className="event-stats">
          {[stats.eventos, stats.paises, Object.values(stats.idiomas).filter(Boolean).length].map((value, i) =>
            <div key={d.events.labels[i]}><strong><AnimatedNumber value={value} locale={lang} /></strong><span>{d.events.labels[i]}</span></div>)}
        </div>
      </div>
    </section>
    <section className="breakdowns">
      {breakdowns.map(({ title, rows }) => <div key={title}>
        <h2>{title}</h2>
        <dl>{rows.map(([label, value]) => <div className="event-distribution" key={label}>
          <dt>{label}</dt><dd>{value}</dd>
          <div className="event-distribution__track" aria-hidden="true"><span style={{ "--share": `${value / stats.eventos * 100}%` } as CSSProperties} /></div>
        </div>)}</dl>
      </div>)}
    </section>
    <p className="data-note">{d.events.audienceNote}</p>
    <section id="eventos" className="event-history">
      <h2>{d.events.history}</h2><p>{d.events.note}</p>
      {years.map((year) => <details key={year}>
        <summary>{year} <span>{events.filter((event) => event.ano === year).length}</span></summary>
        <ul>{events.filter((event) => event.ano === year).map((event, index) => <li key={`${event.nome}-${index}`}>
          <div><strong>{event.nome}</strong><span>{event.cidade} · {event.idioma} · {d.events.types[event.tipo]}</span></div>
          <a href={event.fonte}>{d.common.source} ↗</a>
        </li>)}</ul>
      </details>)}
    </section>
  </main>;
}
