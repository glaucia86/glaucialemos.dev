"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Flip, gsap } from "@/lib/gsap";
import { motionAllowed } from "@/lib/use-motion";
import { play } from "@/lib/sfx";
import { bringIntoView, buzz, discover, onEgg } from "@/lib/eggs";
import { CATEGORIES, isDroidQuery, matchesQuery, sortRepos, type Category, type SortKey } from "@/lib/repos";
import type { TatooineCopy } from "@/i18n/tatooine";
import { PixelSprite } from "@/components/about/sprites";
import { languageColor } from "./languages";
import { OBIWAN } from "./sprites";
import { say } from "./toast";

export type ArchiveRepo = {
  nome: string; url: string; estrelas: number; forks: number; linguagem: string | null; descricao: string;
  topicos: string[]; atualizado: string; categorias: Category[];
};

type Props = { repos: ArchiveRepo[]; copy: TatooineCopy["archive"]; eggs: TatooineCopy["eggs"]; locale: string; githubUrl: string };

const SORTS: SortKey[] = ["stars", "recent", "forks"];
const TRICK_MS = 3600;
const CANTINA_MS = 6500;

// Transmission III: the Mos Espa market. Server-rendered with every repository; filters only hide cards.
export function RepoArchive({ repos, copy, eggs, locale, githubUrl }: Props) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [language, setLanguage] = useState("all");
  const [sort, setSort] = useState<SortKey>("stars");
  const [query, setQuery] = useState("");
  const [trick, setTrick] = useState(false);
  const [cantina, setCantina] = useState(false);
  const [stolen, setStolen] = useState<string | null>(null);
  const grid = useRef<HTMLOListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const raced = useRef(false);
  const sortRef = useRef(sort);
  sortRef.current = sort;
  const format = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const dates = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }), [locale]);

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const repo of repos) if (repo.linguagem) counts.set(repo.linguagem, (counts.get(repo.linguagem) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name]) => name);
  }, [repos]);

  const shown = useMemo(() => sortRepos(repos.filter((repo) =>
    (category === "all" || repo.categorias.includes(category)) && (language === "all" || repo.linguagem === language) && matchesQuery(repo, query)), sort), [repos, category, language, query, sort]);

  // Podrace: every reorder is a race to the new grid position.
  const race = (next: SortKey, announce = false) => {
    if (next === sortRef.current) return;
    if (grid.current && motionAllowed()) flip.current = Flip.getState(grid.current.querySelectorAll(".repo-card"));
    setSort(next);
    play("pod"); discover("podrace");
    if (announce || !raced.current) say(eggs.podrace.text, eggs.podrace.sign);
    raced.current = true;
  };

  useLayoutEffect(() => {
    const state = flip.current;
    if (!state || !grid.current) return;
    flip.current = null;
    grid.current.dataset.racing = "true";
    Flip.from(state, {
      targets: grid.current.querySelectorAll(".repo-card"), duration: .9, ease: "power3.inOut", stagger: .025, absolute: true,
      onComplete: () => { if (grid.current) delete grid.current.dataset.racing; },
    });
  }, [sort]);

  // Jedi mind trick: searching for droids makes Obi-Wan wave the results away.
  useEffect(() => {
    if (!isDroidQuery(query)) return;
    setTrick(true); play("holo"); discover("mindtrick");
    const id = setTimeout(() => { setTrick(false); setQuery(""); }, TRICK_MS);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!cantina) return;
    play("cantina");
    const replay = setTimeout(() => play("cantina"), 1700);
    const id = setTimeout(() => setCantina(false), CANTINA_MS);
    return () => { clearTimeout(replay); clearTimeout(id); };
  }, [cantina]);

  const party = () => { setCantina(true); discover("cantina"); say(eggs.cantina); buzz([30, 60, 30]); };

  useEffect(() => {
    const heroVisible = () => { const hero = document.querySelector("[data-tatooine-hero]")?.getBoundingClientRect(); return !!hero && hero.bottom > 0 && hero.top < innerHeight; };
    const steal = () => {
      const pool = [...(grid.current?.querySelectorAll<HTMLElement>(".repo-card:not([data-stolen])") ?? [])];
      const card = pool[Math.floor(Math.random() * pool.length)];
      if (!card?.dataset.repo) return;
      setStolen(card.dataset.repo); play("jawa"); discover("utinni");
      say(`${eggs.utinni.shout} ${eggs.utinni.stolen}`);
    };
    const stops = [
      onEgg("utinni", () => { if (heroVisible()) steal(); else void bringIntoView(root.current).then(steal); }),
      onEgg("podrace", () => void bringIntoView(root.current).then(() => race(SORTS[(SORTS.indexOf(sortRef.current) + 1) % SORTS.length], true))),
      onEgg("mindtrick", () => void bringIntoView(root.current).then(() => setQuery(locale === "en" ? "droids" : "droides"))),
      onEgg("cantina", () => void bringIntoView(root.current).then(party)),
    ];
    return () => stops.forEach((stop) => stop());
  });

  // Three quick taps on the language filters bring the cantina band on stage.
  const taps = useRef<number[]>([]);
  const tapLanguages = () => {
    const now = performance.now();
    taps.current = [...taps.current.filter((time) => now - time < 1400), now];
    if (taps.current.length >= 3) { taps.current = []; party(); }
  };

  const bargain = () => {
    setStolen(null); play("success"); say(eggs.utinni.returned);
    const card = grid.current?.querySelector(".repo-card");
    if (card && motionAllowed()) gsap.fromTo(card, { scale: .9 }, { scale: 1, duration: .4, ease: "back.out(2)" });
  };

  const reset = () => { setCategory("all"); setLanguage("all"); setQuery(""); };
  const filterButton = (pressed: boolean, label: string, onClick: () => void, extra?: React.CSSProperties) =>
    <button key={label} type="button" aria-pressed={pressed} onClick={onClick} style={extra}>{label}</button>;

  return <div className="archive" ref={root} data-cantina={cantina || undefined}>
    <div className="archive__controls">
      <div className="archive__filter" role="group" aria-label={copy.categoriesLabel}>
        <span className="archive__label" aria-hidden="true">{copy.categoriesLabel}</span>
        {filterButton(category === "all", copy.all, () => setCategory("all"))}
        {CATEGORIES.map((item) => filterButton(category === item, copy.categories[item], () => setCategory(item)))}
      </div>
      <div className="archive__filter archive__filter--languages" role="group" aria-label={copy.languagesLabel} onClickCapture={tapLanguages}>
        <span className="archive__label" aria-hidden="true">{copy.languagesLabel}</span>
        {filterButton(language === "all", copy.anyLanguage, () => setLanguage("all"))}
        {languages.map((item) => filterButton(language === item, item, () => setLanguage(item), { "--crystal": languageColor(item) } as React.CSSProperties))}
      </div>
      <div className="archive__row">
        <label className="archive__search">
          <span>{copy.search}</span>
          <input type="search" value={trick ? (locale === "en" ? "droids" : "droides") : query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.placeholder} autoComplete="off" spellCheck={false} />
        </label>
        <div className="archive__filter archive__filter--sort" role="group" aria-label={copy.sortLabel}>
          <span className="archive__label" aria-hidden="true">{copy.sortLabel}</span>
          {SORTS.map((item) => filterButton(sort === item, copy.sorts[item], () => race(item)))}
        </div>
      </div>
      <p className="archive__count" role="status" aria-live="polite">{trick ? eggs.mindtrick.after : copy.count.replace("{n}", format.format(shown.length)).replace("{total}", format.format(repos.length))}</p>
    </div>

    {trick && <div className="mind-trick" role="note">
      <PixelSprite className="mind-trick__ben" {...OBIWAN} />
      <p>“{eggs.mindtrick.text}” <b>{eggs.mindtrick.sign}</b></p>
    </div>}

    <ol className="archive__grid" ref={grid} hidden={trick}>
      {shown.map((repo) => repo.nome === stolen
        ? <li key={repo.nome} className="repo-card repo-card--stolen" data-repo={repo.nome} data-stolen="true">
          <p className="repo-card__stolen">{eggs.utinni.stolen}</p>
          <button type="button" className="repo-card__bargain" onClick={bargain}>{eggs.utinni.bargain}</button>
        </li>
        : <li key={repo.nome} className="repo-card" data-repo={repo.nome} style={{ "--crystal": languageColor(repo.linguagem) } as React.CSSProperties}>
          <article>
            <p className="repo-card__meta"><span className="repo-card__lang"><span className="crystal" aria-hidden="true" />{repo.linguagem ?? "—"}</span><span>{repo.categorias.map((item) => copy.categories[item]).join(" · ")}</span></p>
            <h3><a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.nome}<span aria-hidden="true"> ↗</span></a></h3>
            <p className="repo-card__desc">{repo.descricao}</p>
            {repo.topicos.length > 0 && <ul className="repo-card__topics">{repo.topicos.slice(0, 4).map((topic) => <li key={topic}>{topic}</li>)}</ul>}
            <dl className="repo-card__stats">
              <div><dt>{copy.stars}</dt><dd>★ {format.format(repo.estrelas)}</dd></div>
              <div><dt>{copy.forks}</dt><dd>⑂ {format.format(repo.forks)}</dd></div>
              {repo.atualizado && <div><dt>{copy.updated}</dt><dd>{dates.format(new Date(`${repo.atualizado}T00:00:00Z`))}</dd></div>}
            </dl>
          </article>
        </li>)}
    </ol>
    {!trick && !shown.length && <p className="archive__empty">{copy.empty} <button type="button" onClick={reset}>{copy.clear}</button></p>}
    <p className="archive__more"><a className="text-link" href={githubUrl} target="_blank" rel="noopener noreferrer">{copy.more} <span aria-hidden="true">↗</span></a></p>
  </div>;
}
