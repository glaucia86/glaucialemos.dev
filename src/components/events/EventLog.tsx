"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { bringIntoView } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import { FORMATS, LANGUAGES, NO_FILTERS, TYPES, filterEvents, isFiltered, parseFilters, serializeFilters, type Filters } from "@/lib/atlas-filters";
import type { AtlasEvent } from "@/lib/atlas-records";
import type { AtlasCopy } from "@/i18n/atlas";
import type { Evento } from "@/lib/types";
import { FILTER_YEAR, FIND_EVENT, LOG_ID, eventAnchor } from "./atlas-events";

type LogEvent = Pick<AtlasEvent, "id" | "nome" | "ano" | "cidade" | "pais" | "idioma" | "tipo" | "fonte" | "formato" | "order">;
type Props = {
  events: LogEvent[]; initial: Filters; path: string;
  copy: AtlasCopy["log"]; formats: AtlasCopy["formats"]; languages: AtlasCopy["languages"]; types: Record<Evento["tipo"], string>; locale: string;
};
const FOUND_MS = 2600;

// Chapter 3: the logbook. The server already renders the filtered list from the URL, and the form is a plain GET, so
// filtering works without JavaScript. With JavaScript the same filters apply instantly and the URL follows them.
export function EventLog({ events, initial, path, copy, formats, languages, types, locale }: Props) {
  const [filters, setFilters] = useState<Filters>(initial);
  const [ready, setReady] = useState(false);
  const [found, setFound] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const format = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const years = useMemo(() => [...new Set(events.map((event) => event.ano))].sort((a, b) => b - a), [events]);
  const shown = useMemo(() => filterEvents(events as AtlasEvent[], filters), [events, filters]);
  const shownYears = years.filter((year) => shown.some((event) => event.ano === year));
  const filtered = isFiltered(filters);

  useEffect(() => {
    setReady(true);
    const read = () => setFilters(parseFilters(location.search, years));
    addEventListener("popstate", read);
    return () => removeEventListener("popstate", read);
  }, [years]);
  useEffect(() => {
    if (!ready) return;
    const search = serializeFilters(filters, location.search);
    if (search !== location.search) history.replaceState(history.state, "", `${location.pathname}${search}${location.hash}`);
  }, [filters, ready]);
  const update = (patch: Partial<Filters>) => { setFilters((current) => ({ ...current, ...patch })); play("switch"); };

  // The hero's visor, the orbit card and the signal timeline open records and years here.
  useEffect(() => {
    const find = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (!events.some((item) => item.id === id)) return;
      event.preventDefault();
      setFilters(NO_FILTERS); setFound(id);
    };
    const year = (event: Event) => { setFilters({ ...NO_FILTERS, year: (event as CustomEvent<number>).detail }); void bringIntoView(root.current); };
    // Links to "?ano=YYYY#diario" (the timeline) work without JavaScript; with it they filter in place.
    const click = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[data-log-year]");
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      setFilters({ ...NO_FILTERS, year: Number(link.dataset.logYear) }); play("switch");
      void bringIntoView(root.current);
    };
    addEventListener(FIND_EVENT, find); addEventListener(FILTER_YEAR, year); document.addEventListener("click", click);
    return () => { removeEventListener(FIND_EVENT, find); removeEventListener(FILTER_YEAR, year); document.removeEventListener("click", click); };
  }, [events]);
  useEffect(() => {
    if (!found) return;
    const card = document.getElementById(eventAnchor(found));
    void bringIntoView(card).then(() => card?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true }));
    const id = setTimeout(() => setFound(null), FOUND_MS);
    return () => clearTimeout(id);
  }, [found]);

  const count = (n: number) => copy.open.replace("{n}", format.format(n));
  const select = <T extends string | number>(name: string, label: string, value: T | null, options: readonly T[], text: (option: T) => string, onChange: (value: T | null) => void) =>
    <label className="log__field"><span>{label}</span>
      <select name={name} value={value ?? ""} onChange={(event) => { const raw = event.target.value; onChange(raw ? (typeof options[0] === "number" ? Number(raw) : raw) as T : null); }}>
        <option value="">{copy.any}</option>
        {options.map((option) => <option key={option} value={option}>{text(option)}</option>)}
      </select>
    </label>;

  return <div className="log" ref={root}>
    <form className="log__form" method="get" action={`${path}#${LOG_ID}`} aria-label={copy.filters} onSubmit={(event) => { if (ready) event.preventDefault(); }}>
      {select("ano", copy.year, filters.year, years, String, (year) => update({ year }))}
      {select("formato", copy.format, filters.format, FORMATS, (value) => formats[value], (value) => update({ format: value }))}
      {select("tipo", copy.type, filters.type, TYPES, (value) => types[value], (value) => update({ type: value }))}
      {select("idioma", copy.language, filters.language, LANGUAGES, (value) => languages[value], (value) => update({ language: value }))}
      <label className="log__field log__field--search"><span>{copy.search}</span>
        <input type="search" name="q" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder={copy.placeholder} autoComplete="off" spellCheck={false} maxLength={80} />
      </label>
      <div className="log__buttons">
        <button type="submit" className="log__apply" hidden={ready}>{copy.apply}</button>
        {filtered && <a className="log__clear" href={`${path}#${LOG_ID}`} onClick={(event) => { if (ready) { event.preventDefault(); update(NO_FILTERS); } }}>{copy.clear}</a>}
      </div>
    </form>
    <p className="log__count" role="status" aria-live="polite">{copy.count.replace("{n}", format.format(shown.length)).replace("{total}", format.format(events.length))}</p>
    {!shown.length && <p className="log__empty">{copy.empty}</p>}
    {shownYears.map((year) => {
      const own = shown.filter((event) => event.ano === year);
      return <details key={`${year}-${serializeFilters(filters)}`} className="log__year" open={filtered || year === years[0] || own.some((event) => event.id === found)}>
        <summary><span className="log__year-label">{year}</span><span>{count(own.length)}</span><span className="log__meter" aria-hidden="true">{own.map((event) => <i key={event.id} data-format={event.formato} />)}</span><span className="log__expand" aria-hidden="true">+</span></summary>
        <ul>{own.map((event) => <li key={event.id} id={eventAnchor(event.id)} className="log__entry" data-format={event.formato} data-found={found === event.id || undefined}>
          <div>
            <p className="log__tags"><span className="log__badge" data-format={event.formato}><i aria-hidden="true" />{formats[event.formato]}</span><span>{types[event.tipo]}</span><span>{languages[event.idioma]}</span></p>
            <strong>{event.nome}</strong>
            <span className="log__place">{event.formato === "presencial" ? [event.cidade, event.pais].filter(Boolean).join(", ") : [event.cidade, event.pais].filter(Boolean).join(" · ")}</span>
          </div>
          <a href={event.fonte} target="_blank" rel="noopener noreferrer" aria-label={`${copy.source}: ${event.nome}`}>{copy.source} <span aria-hidden="true">↗</span></a>
        </li>)}</ul>
      </details>;
    })}
  </div>;
}
