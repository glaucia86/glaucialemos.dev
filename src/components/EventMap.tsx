"use client";

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { JourneyCopy } from '@/i18n/journey';
import type { HolonetCopy } from '@/i18n/holonet';
import { groupEvents, hasCoordinates, type MapEvent } from '@/lib/home-curation';
import { gsap, useGSAP } from '@/lib/gsap';
import { useMotionEnabled } from '@/lib/use-motion';

const project = (lat: number, lon: number) => ({ x: (lon + 180) * 2, y: (90 - lat) * 2 });

// Chronological hyperspace routes between located events, as quadratic arcs.
function buildRoute(events: MapEvent[]) {
  const stops = events.filter(hasCoordinates).map((event, order) => ({ ...project(event.lat, event.lon), year: event.ano, order }))
    .sort((a, b) => a.year - b.year || a.order - b.order)
    .filter((stop, index, list) => index === 0 || stop.x !== list[index - 1].x || stop.y !== list[index - 1].y);
  const path = stops.map((stop, index) => {
    if (!index) return `M${stop.x} ${stop.y}`;
    const previous = stops[index - 1];
    const distance = Math.hypot(stop.x - previous.x, stop.y - previous.y);
    return `Q${(previous.x + stop.x) / 2} ${Math.min(previous.y, stop.y) - distance * .3} ${stop.x} ${stop.y}`;
  }).join('');
  return { path, years: stops.map((stop) => stop.year) };
}

export function EventMap({ events, locale, copy, source, galaxy }: { events: MapEvent[]; locale: string; copy: JourneyCopy['map']; source: string; galaxy: HolonetCopy['galaxy'] }) {
  const groups = groupEvents(events, locale);
  const languages = new Intl.DisplayNames([locale], { type: 'language' });
  const [selected, setSelected] = useState(groups.some(group => group.country === 'Brasil') ? 'Brasil' : groups[0]?.country);
  const name = (country: string) => country === 'unlocated' ? copy.unlocated : copy.countryNames[country] ?? country;
  const points = [...new Map(events.filter(hasCoordinates).map(event => [`${event.lat},${event.lon}`, event])).values()];
  const route = useMemo(() => buildRoute(events), [events]);
  const root = useRef<HTMLDivElement>(null);
  const year = useRef<HTMLElement>(null);
  const motion = useMotionEnabled();

  useGSAP(() => {
    if (!motion) return;
    const frame = root.current?.querySelector('.event-map-frame');
    gsap.fromTo('.map-route', { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', ease: 'none', scrollTrigger: {
      trigger: frame, start: 'top 80%', end: 'bottom 40%', scrub: .6,
      onUpdate: ({ progress }) => { if (year.current) year.current.textContent = String(route.years[Math.min(route.years.length - 1, Math.floor(progress * route.years.length))] ?? ''); },
    } });
    gsap.from('.event-map circle', { scale: 0, transformOrigin: 'center', duration: .5, stagger: { each: .02, from: 'random' }, ease: 'back.out(3)', scrollTrigger: { trigger: frame, start: 'top 80%', once: true } });
  }, { scope: root, dependencies: [motion, route], revertOnUpdate: true });

  return <div ref={root} className="event-explorer">
    <noscript><style>{'.home-page .country-controls{display:none}@layer base{.home-page .event-explorer .event-country[hidden]{display:block!important}}.home-page .event-explorer .event-country ul{max-height:none;overflow:visible}'}</style></noscript>
    <div className="event-map-panel">
      <div className="event-map-frame">
        <Image className="map-land-image" src="/maps/world-land.svg" alt="" width={720} height={360} loading="lazy" />
        <span className="map-land-dots" aria-hidden="true" />
        <svg className="event-map" viewBox="0 0 720 360" role="img" aria-label={copy.label}>
          <defs><pattern id="geographic-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" className="map-grid" /></pattern></defs>
          <rect width="720" height="360" fill="url(#geographic-grid)" />
          <path className="map-equator" d="M0 180H720" />
          <path className="map-route map-route--glow" d={route.path} />
          <path className="map-route" d={route.path} />
          {points.map(event => <circle key={`${event.lat},${event.lon}`} cx={(event.lon + 180) * 2} cy={(90 - event.lat) * 2} r={event.pais === selected ? 5 : 3} data-selected={selected !== 'unlocated' && event.pais === selected}><title>{`${event.cidade} · ${event.pais ? name(event.pais) : copy.unlocated}`}</title></circle>)}
        </svg>
        <p className="map-hud" aria-hidden="true"><span>{galaxy.routes}</span><span>{galaxy.year} <b ref={year}>{route.years.at(-1)}</b></span></p>
      </div>
      <p className="map-caption">{copy.label} <span>90° N / 90° S</span></p>
      <div className="country-controls" role="group" aria-label={copy.countries}>
        {groups.map((group, index) => <button type="button" key={group.country} data-country={group.country} aria-pressed={selected === group.country} aria-controls={`country-${index}`} onClick={() => setSelected(group.country)}>{name(group.country)} <span>{group.events.length}</span></button>)}
      </div>
    </div>
    <div className="event-results">
      <p className="sr-only" role="status">{name(selected ?? 'unlocated')} · {groups.find(group => group.country === selected)?.events.length} {copy.count}</p>
      {groups.map((group, index) => <div className="event-country" key={group.country} id={`country-${index}`} hidden={selected !== group.country}>
        <h3>{name(group.country)} <span>{group.events.length} {galaxy.signal}</span></h3>
        <ul tabIndex={0} aria-label={name(group.country)}>{group.events.map((event, eventIndex) => <li key={`${event.nome}-${event.ano}-${eventIndex}`}>
          <p className="event-meta"><span>{event.ano}</span> · {event.cidade} · <span>{languages.of(event.idioma)}</span></p>
          <h4>{event.nome}</h4><a href={event.fonte}>{source}<span aria-hidden="true"> ↗</span></a>
        </li>)}</ul>
      </div>)}
    </div>
  </div>;
}
