"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { bringIntoView, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import { NO_FILTERS, parseFilters, serializeFilters, shelve, type Filters, type Language } from "@/lib/lumina-shelves";
import type { LuminaCopy } from "@/i18n/lumina";
import type { Artigo } from "@/lib/types";
import { FILTER_YEAR_EVENT, FIND_ARTICLE_EVENT, articleAnchor } from "./lumina-events";
import { LANGUAGE_COLORS, platformColor } from "./platforms";

export type EchoOf = { url: string; plataforma: string; data: string; days: number };
type Props = { articles: Artigo[]; echoes: Record<string, EchoOf[]>; copy: LuminaCopy["shelves"]; languages: LuminaCopy["languages"]; locale: string };

const FOUND_MS = 2600;
const LANGUAGES: Language[] = ["pt-BR", "en", "es"];

// Chapter 3: every record, rendered on the server; filters only hide cards. Without JavaScript the full list stays,
// the controls stay hidden and each echo is a native <details>.
export function LuminaShelves({ articles, echoes, copy, languages, locale }: Props) {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [ready, setReady] = useState(false);
  const [found, setFound] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const format = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const dates = useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }), [locale]);
  const platforms = useMemo(() => [...new Set(articles.map((article) => article.plataforma))], [articles]);
  const years = useMemo(() => [...new Set(articles.map((article) => Number(article.data.slice(0, 4))))].sort((a, b) => b - a), [articles]);
  const shown = useMemo(() => shelve(articles, filters), [articles, filters]);

  // The URL is the source of the filters: read it on load and on back/forward, write it back on every change.
  useEffect(() => {
    const read = () => setFilters(parseFilters(location.search, { platforms, years }));
    read(); setReady(true);
    addEventListener("popstate", read);
    return () => removeEventListener("popstate", read);
  }, [platforms, years]);
  useEffect(() => {
    if (!ready) return;
    const search = serializeFilters(filters, location.search);
    if (search !== location.search) history.replaceState(history.state, "", `${location.pathname}${search}${location.hash}`);
  }, [filters, ready]);
  const update = (patch: Partial<Filters>) => { setFilters((current) => ({ ...current, ...patch })); play("switch"); };

  // "See it on the shelf" (hero) and the rings' years.
  useEffect(() => {
    const find = (event: Event) => {
      const url = (event as CustomEvent<string>).detail;
      if (!articles.some((article) => article.url === url)) return;
      event.preventDefault();
      setFilters(NO_FILTERS); setFound(url);
    };
    const year = (event: Event) => {
      setFilters({ ...NO_FILTERS, year: (event as CustomEvent<number>).detail });
      void bringIntoView(root.current);
    };
    addEventListener(FIND_ARTICLE_EVENT, find); addEventListener(FILTER_YEAR_EVENT, year);
    return () => { removeEventListener(FIND_ARTICLE_EVENT, find); removeEventListener(FILTER_YEAR_EVENT, year); };
  }, [articles]);
  useEffect(() => {
    if (!found) return;
    const card = document.getElementById(articleAnchor(found));
    void bringIntoView(card).then(() => card?.querySelector<HTMLAnchorElement>("h3 a")?.focus({ preventScroll: true }));
    const id = setTimeout(() => setFound(null), FOUND_MS);
    return () => clearTimeout(id);
  }, [found]);

  // crystal-echo from the radio or a typed phrase: show the first echo, wherever the filters were.
  useEffect(() => onEgg("crystal-echo", () => {
    setFilters(NO_FILTERS);
    requestAnimationFrame(() => {
      const echo = root.current?.querySelector<HTMLDetailsElement>(".echo");
      if (!echo) return;
      void bringIntoView(echo).then(() => { echo.open = true; echo.querySelector("summary")?.focus({ preventScroll: true }); });
    });
  }), []);
  const onEcho = (event: React.SyntheticEvent<HTMLDetailsElement>) => { if (event.currentTarget.open) { discover("crystal-echo"); play("echo"); } };

  const button = (pressed: boolean, label: string, onClick: () => void, style?: CSSProperties) =>
    <button key={label} type="button" aria-pressed={pressed} onClick={onClick} style={style}>{label}</button>;

  return <div className="shelves" ref={root}>
    <div className="shelves__controls" hidden={!ready}>
      <div className="shelves__filter" role="group" aria-label={copy.platform}>
        <span className="shelves__label" aria-hidden="true">{copy.platform}</span>
        {button(!filters.platform, copy.any, () => update({ platform: null }))}
        {platforms.map((item) => button(filters.platform === item, item, () => update({ platform: item }), { "--gem": platformColor(item) } as CSSProperties))}
      </div>
      <div className="shelves__filter" role="group" aria-label={copy.language}>
        <span className="shelves__label" aria-hidden="true">{copy.language}</span>
        {button(!filters.language, copy.any, () => update({ language: null }))}
        {LANGUAGES.map((item) => button(filters.language === item, languages[item], () => update({ language: item }), { "--gem": LANGUAGE_COLORS[item] } as CSSProperties))}
      </div>
      <div className="shelves__filter shelves__filter--years" role="group" aria-label={copy.year}>
        <span className="shelves__label" aria-hidden="true">{copy.year}</span>
        {button(!filters.year, copy.any, () => update({ year: null }))}
        {years.map((item) => button(filters.year === item, String(item), () => update({ year: item })))}
      </div>
      <div className="shelves__row">
        <label className="shelves__search">
          <span>{copy.search}</span>
          <input type="search" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder={copy.placeholder} autoComplete="off" spellCheck={false} />
        </label>
        <div className="shelves__filter" role="group" aria-label={copy.sort}>
          <span className="shelves__label" aria-hidden="true">{copy.sort}</span>
          {button(filters.sort === "recent", copy.sorts.recent, () => update({ sort: "recent" }))}
          {button(filters.sort === "oldest", copy.sorts.oldest, () => update({ sort: "oldest" }))}
        </div>
      </div>
      <p className="shelves__count" role="status" aria-live="polite">{copy.count.replace("{n}", format.format(shown.length)).replace("{total}", format.format(articles.length))}</p>
    </div>

    <ol className="shelves__grid">
      {shown.map((article) => {
        const echo = echoes[article.url];
        return <li key={article.url} id={articleAnchor(article.url)} className="shelf-card" data-found={found === article.url || undefined} style={{ "--gem": platformColor(article.plataforma) } as CSSProperties}>
          <article>
            <p className="shelf-card__meta">
              <span className="shelf-card__platform"><span className="gem" aria-hidden="true" />{article.plataforma}</span>
              <time dateTime={article.data}>{dates.format(new Date(`${article.data}T00:00:00Z`))}</time>
            </p>
            <h3><a href={article.url} target="_blank" rel="noopener noreferrer">{article.titulo}<span aria-hidden="true"> ↗</span></a></h3>
            <p className="shelf-card__foot">
              <span className="shelf-card__lang" style={{ "--beam": LANGUAGE_COLORS[article.idioma] } as CSSProperties}>{languages[article.idioma]}</span>
            </p>
            {echo && <details className="echo" onToggle={onEcho}>
              <summary aria-label={copy.echo.label} title={copy.echo.label}><span className="echo__twin" aria-hidden="true"><i /><i /></span><span className="echo__text">{copy.echo.label}</span></summary>
              <div className="echo__body">
                <p className="echo__title">{copy.echo.title}</p>
                <ul>{echo.map((item) => <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">{item.plataforma} · {dates.format(new Date(`${item.data}T00:00:00Z`))}<span aria-hidden="true"> ↗</span></a>
                  <small>{item.days === 0 ? copy.echo.same : (item.days > 0 ? copy.echo.later : copy.echo.earlier).replace("{n}", format.format(Math.abs(item.days)))}</small>
                </li>)}</ul>
              </div>
            </details>}
          </article>
        </li>;
      })}
    </ol>
    {!shown.length && <p className="shelves__empty">{copy.empty} <button type="button" onClick={() => update(NO_FILTERS)}>{copy.clear}</button></p>}
  </div>;
}
