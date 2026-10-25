"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Flip } from "@/lib/gsap";
import { motionAllowed } from "@/lib/use-motion";
import { play } from "@/lib/sfx";
import { bringIntoView } from "@/lib/eggs";
import { CATEGORIES, matchesQuery, sortRepos, type Category, type SortKey } from "@/lib/repos";
import type { MarteCopy } from "@/i18n/marte";
import { languageColor } from "./languages";
import { FIND_REPO_EVENT, repoAnchor } from "./repo-events";

export type ArchiveRepo = {
  nome: string; url: string; estrelas: number; forks: number; linguagem: string | null; descricao: string;
  topicos: string[]; atualizado: string; categorias: Category[];
};

type Props = { repos: ArchiveRepo[]; copy: MarteCopy["archive"]; locale: string; githubUrl: string; benches: Record<string, ReactNode>; children?: ReactNode };

const SORTS: SortKey[] = ["stars", "recent", "forks"];
const FOUND_MS = 2600;

// Chapter 3: the archive of inventions. Server-rendered with every repository; filters only hide cards.
// Some workbenches carry a casing (`benches`, rendered on the server) with their real first commit.
export function RepoArchive({ repos, copy, locale, githubUrl, benches, children }: Props) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [language, setLanguage] = useState("all");
  const [sort, setSort] = useState<SortKey>("stars");
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<string | null>(null);
  const grid = useRef<HTMLOListElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const format = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const dates = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }), [locale]);

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const repo of repos) if (repo.linguagem) counts.set(repo.linguagem, (counts.get(repo.linguagem) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name]) => name);
  }, [repos]);

  const shown = useMemo(() => sortRepos(repos.filter((repo) =>
    (category === "all" || repo.categorias.includes(category)) && (language === "all" || repo.linguagem === language) && matchesQuery(repo, query)), sort), [repos, category, language, query, sort]);

  // Reordering slides every card to its new place.
  const reorder = (next: SortKey) => {
    if (next === sort) return;
    if (grid.current && motionAllowed()) flip.current = Flip.getState(grid.current.querySelectorAll(".repo-card"));
    setSort(next); play("switch");
  };
  useLayoutEffect(() => {
    const state = flip.current;
    if (!state || !grid.current) return;
    flip.current = null;
    Flip.from(state, { targets: grid.current.querySelectorAll(".repo-card"), duration: .8, ease: "power3.inOut", stagger: .02, absolute: true });
  }, [sort]);

  // "See it in the archive": clear the filters, then bring the card into view and light it up.
  useEffect(() => {
    const find = (event: Event) => {
      const name = (event as CustomEvent<string>).detail;
      if (!repos.some((repo) => repo.nome === name)) return;
      event.preventDefault();
      setCategory("all"); setLanguage("all"); setQuery(""); setFound(name);
    };
    addEventListener(FIND_REPO_EVENT, find);
    return () => removeEventListener(FIND_REPO_EVENT, find);
  }, [repos]);
  useEffect(() => {
    if (!found) return;
    const card = document.getElementById(repoAnchor(found));
    void bringIntoView(card).then(() => card?.querySelector<HTMLAnchorElement>("h3 a")?.focus({ preventScroll: true }));
    const id = setTimeout(() => setFound(null), FOUND_MS);
    return () => clearTimeout(id);
  }, [found]);

  const reset = () => { setCategory("all"); setLanguage("all"); setQuery(""); };
  const filterButton = (pressed: boolean, label: string, onClick: () => void, extra?: React.CSSProperties) =>
    <button key={label} type="button" aria-pressed={pressed} onClick={onClick} style={extra}>{label}</button>;

  return <div className="archive">
    <div className="archive__controls">
      <div className="archive__filter" role="group" aria-label={copy.categoriesLabel}>
        <span className="archive__label" aria-hidden="true">{copy.categoriesLabel}</span>
        {filterButton(category === "all", copy.all, () => setCategory("all"))}
        {CATEGORIES.map((item) => filterButton(category === item, copy.categories[item], () => setCategory(item)))}
      </div>
      <div className="archive__filter archive__filter--languages" role="group" aria-label={copy.languagesLabel}>
        <span className="archive__label" aria-hidden="true">{copy.languagesLabel}</span>
        {filterButton(language === "all", copy.anyLanguage, () => setLanguage("all"))}
        {languages.map((item) => filterButton(language === item, item, () => setLanguage(item), { "--sample": languageColor(item) } as React.CSSProperties))}
      </div>
      <div className="archive__row">
        <label className="archive__search">
          <span>{copy.search}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.placeholder} autoComplete="off" spellCheck={false} />
        </label>
        <div className="archive__filter archive__filter--sort" role="group" aria-label={copy.sortLabel}>
          <span className="archive__label" aria-hidden="true">{copy.sortLabel}</span>
          {SORTS.map((item) => filterButton(sort === item, copy.sorts[item], () => reorder(item)))}
        </div>
      </div>
      <p className="archive__count" role="status" aria-live="polite">{copy.count.replace("{n}", format.format(shown.length)).replace("{total}", format.format(repos.length))}</p>
    </div>

    <ol className="archive__grid" ref={grid}>
      {shown.map((repo) => <li key={repo.nome} id={repoAnchor(repo.nome)} className="repo-card" data-repo={repo.nome} data-bench={benches[repo.nome] ? "true" : undefined} data-found={found === repo.nome || undefined} style={{ "--sample": languageColor(repo.linguagem) } as React.CSSProperties}>
        <article>
          <p className="repo-card__meta"><span className="repo-card__lang"><span className="sample-gem" aria-hidden="true" />{repo.linguagem ?? "—"}</span><span>{repo.categorias.map((item) => copy.categories[item]).join(" · ")}</span></p>
          <h3><a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.nome}<span aria-hidden="true"> ↗</span></a></h3>
          <p className="repo-card__desc">{repo.descricao}</p>
          {repo.topicos.length > 0 && <ul className="repo-card__topics">{repo.topicos.slice(0, 4).map((topic) => <li key={topic}>{topic}</li>)}</ul>}
          <dl className="repo-card__stats">
            <div><dt>{copy.stars}</dt><dd>★ {format.format(repo.estrelas)}</dd></div>
            <div><dt>{copy.forks}</dt><dd>⑂ {format.format(repo.forks)}</dd></div>
            {repo.atualizado && <div><dt>{copy.updated}</dt><dd>{dates.format(new Date(`${repo.atualizado}T00:00:00Z`))}</dd></div>}
          </dl>
          {benches[repo.nome]}
        </article>
      </li>)}
    </ol>
    {!shown.length && <p className="archive__empty">{copy.empty} <button type="button" onClick={reset}>{copy.clear}</button></p>}
    {children}
    <p className="archive__more"><a className="text-link" href={githubUrl} target="_blank" rel="noopener noreferrer">{copy.more} <span aria-hidden="true">↗</span></a></p>
  </div>;
}
