"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { motionAllowed } from "@/lib/use-motion";
import { bringIntoView, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import type { LuminaCopy } from "@/i18n/lumina";
import type { Artigo } from "@/lib/types";

type Props = { shelf: Artigo[]; copy: LuminaCopy["dusk"]; languages: LuminaCopy["languages"]; locale: string };
// Light at or below this value is dusk.
export const DUSK_AT = 20;

// library-dusk: a native range lowers the library's light; at dusk the page turns violet and the personal shelf lights
// up. The button, Esc or raising the light bring the day back. Without JavaScript the shelf is a native <details>.
export function LibraryDusk({ shelf, copy, languages, locale }: Props) {
  const [light, setLight] = useState(100);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const dusk = light <= DUSK_AT;
  const wasDusk = useRef(false);
  const dates = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  useEffect(() => setReady(true), []);

  // The whole page follows the light: a veil on <main>, and data-dusk while it lasts.
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main");
    if (!main) return;
    main.style.setProperty("--library-light", String(light / 100));
    if (dusk) main.dataset.dusk = "true"; else delete main.dataset.dusk;
    if (dusk && !wasDusk.current) { discover("library-dusk"); play("dusk"); }
    wasDusk.current = dusk;
  }, [light, dusk]);
  useEffect(() => () => { const main = document.querySelector<HTMLElement>("main"); main?.style.removeProperty("--library-light"); delete main?.dataset.dusk; }, []);
  useEffect(() => {
    if (!dusk) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !document.querySelector("dialog[open]")) setLight(100); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [dusk]);

  // From the radio or a typed phrase: the light goes down by itself.
  useEffect(() => onEgg("library-dusk", () => void bringIntoView(root.current).then(() => {
    if (!motionAllowed()) { setLight(0); return; }
    const state = { value: 100 };
    gsap.to(state, { value: 0, duration: 1.2, ease: "steps(10)", onUpdate: () => setLight(Math.round(state.value)) });
  })), []);
  const relight = () => { setLight(100); range.current?.focus(); };

  const list = <ul className="dusk-shelf__list">{shelf.map((article) => <li key={article.url}>
    <a href={article.url} target="_blank" rel="noopener noreferrer">{article.titulo}<span aria-hidden="true"> ↗</span></a>
    <small>{article.plataforma} · {dates.format(new Date(`${article.data}T00:00:00Z`))} · {languages[article.idioma]}</small>
  </li>)}</ul>;

  if (!ready) return <details className="dusk-shelf dusk-shelf--static"><summary>{copy.fallback}</summary><p>{copy.body}</p>{list}</details>;

  return <div ref={root} className="dusk-shelf" data-dusk={dusk || undefined} style={{ "--light": light / 100 } as CSSProperties}>
    <label className="dusk-shelf__control">
      <span>{copy.label}</span>
      <span className="dusk-shelf__scale" aria-hidden="true"><b>{copy.dusk}</b><b>{copy.day}</b></span>
      <input ref={range} type="range" min={0} max={100} step={5} value={light} aria-valuetext={dusk ? copy.dusk : `${light}%`}
        onChange={(event) => { setLight(Number(event.target.value)); play("link", { detune: -Number(event.target.value) * 6 }); }} />
    </label>
    <div className="dusk-shelf__body" role="region" aria-label={copy.title} hidden={!dusk}>
      <p className="dusk-shelf__title">{copy.title}</p>
      <p>{copy.body}</p>
      {list}
      <button type="button" className="dusk-shelf__relight" onClick={relight}>{copy.relight}</button>
    </div>
  </div>;
}
