"use client";
import { useId, useState } from "react";
import type { Evento } from "@/lib/types";

type Labels = { search: string; all: string; empty: string; source: string; year: string; results: string; resultSingular: string; types: Record<Evento["tipo"], string> };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function EventHistory({ events, labels }: { events: Evento[]; labels: Labels }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const id = useId();
  const countLabel = (count: number) => `${count} ${count === 1 ? labels.resultSingular : labels.results}`;
  const years = [...new Set(events.map(event => event.ano))].sort((a,b) => b-a);
  const filtered = events.filter(event => (!year || event.ano === Number(year)) && normalize(`${event.nome} ${event.cidade} ${event.pais ?? ""}`).includes(normalize(query)));
  const shownYears = years.filter(value => filtered.some(event => event.ano === value));
  return <>
    <div className="event-search"><div><label htmlFor={`${id}-search`}>{labels.search}</label><input id={`${id}-search`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={labels.search} /></div><div><label htmlFor={`${id}-year`}>{labels.year}</label><select id={`${id}-year`} value={year} onChange={event => setYear(event.target.value)}><option value="">{labels.all}</option>{years.map(value => <option key={value}>{value}</option>)}</select></div></div>
    <p className="event-result-count" aria-live="polite">{countLabel(filtered.length)}</p>
    {shownYears.length === 0 && <p className="event-empty">{labels.empty}</p>}
    {shownYears.map(value => <details key={`${value}-${query}-${year}`} open={Boolean(query || year) || value === years[0]}><summary><span className="event-year">{value}</span><span>{countLabel(filtered.filter(event => event.ano === value).length)}</span><span className="event-expand" aria-hidden="true">+</span></summary><ul>{filtered.filter(event => event.ano === value).map((event,index) => <li key={`${event.nome}-${index}`}><div><span className="event-type">{labels.types[event.tipo]}</span><strong>{event.nome}</strong><span>{event.cidade} · {event.idioma}</span></div><a href={event.fonte} target="_blank" rel="noopener noreferrer" aria-label={`${labels.source}: ${event.nome}`}>{labels.source} <span aria-hidden="true">↗</span></a></li>)}</ul></details>)}
  </>;
}
