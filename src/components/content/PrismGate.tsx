"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { bringIntoView, buzz, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import type { LuminaCopy } from "@/i18n/lumina";
import type { Artigo } from "@/lib/types";
import { LANGUAGE_COLORS } from "./platforms";

type Sprite = { src: string; w: number; h: number };
type Props = { pairs: (readonly [Artigo, Artigo])[]; copy: LuminaCopy["prism"]; languages: LuminaCopy["languages"]; locale: string; gate: { closed: Sprite; open: Sprite } };

const PRISMS = ["pt-BR", "en", "es"] as const;
// Starting turns (quarter turns, 0 = pointing at the gate): never aligned on arrival.
export const START = [1, 3, 2];
export const turn = (value: number, step: number) => ((value + step) % 4 + 4) % 4;
export const aligned = (turns: readonly number[]) => turns.every((value) => value === 0);

// prism-align: three prisms, one per language. Turn each until its beam points at the gate; the gate opens on the
// pairs written in two languages. Without JavaScript the pairs are a native <details>.
export function PrismGate({ pairs, copy, languages, locale, gate }: Props) {
  const [turns, setTurns] = useState(START);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const open = aligned(turns);
  const dates = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" });
  useEffect(() => setReady(true), []);

  const rotate = (index: number, step: number) => {
    const next = turns.map((value, at) => at === index ? turn(value, step) : value);
    if (aligned(next) && !open) { discover("prism-align"); play("prism"); buzz([20, 40, 20]); } else play("link", { detune: next[index] * 120 });
    setTurns(next);
  };
  const onKey = (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); rotate(index, 1); }
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); rotate(index, -1); }
  };
  useEffect(() => onEgg("prism-align", () => void bringIntoView(root.current).then(() => { discover("prism-align"); play("prism"); setTurns([0, 0, 0]); })), []);

  const list = <ul className="prism-pairs">{pairs.map(([a, b]) => <li key={a.url}>
    {[a, b].map((article) => <a key={article.url} href={article.url} target="_blank" rel="noopener noreferrer" style={{ "--beam": LANGUAGE_COLORS[article.idioma] } as CSSProperties}>
      <small>{languages[article.idioma]} · {dates.format(new Date(`${article.data}T00:00:00Z`))}</small>{article.titulo}<span aria-hidden="true"> ↗</span>
    </a>)}
  </li>)}</ul>;

  if (!ready) return <details className="prism-gate prism-gate--static"><summary>{copy.fallback}</summary><p>{copy.body}</p>{list}</details>;

  return <div ref={root} className="prism-gate" data-open={open || undefined}>
    <p className="prism-gate__label">{copy.label}</p>
    <p className="prism-gate__intro">{copy.intro}</p>
    <div className="prism-gate__bench">
      <ol className="prism-gate__prisms">
        {PRISMS.map((language, index) => <li key={language} style={{ "--beam": LANGUAGE_COLORS[language], "--turn": turns[index] } as CSSProperties} data-aligned={turns[index] === 0 || undefined}>
          <button type="button" className="prism" aria-label={copy.turn.replace("{lang}", languages[language]).replace("{n}", String(turns[index] + 1))}
            onClick={() => rotate(index, 1)} onKeyDown={onKey(index)}>
            <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true" focusable="false"><path fill="var(--beam)" d="M7 1h2v3h1v3h1v3h1v3h1v2H3v-2h1v-3h1V7h1V4h1z" /><path fill="#f7e6ff" d="M7 4h1v9H7z" /><path fill="#160c26" d="M9 7h1v6H9z" opacity=".45" /></svg>
          </button>
          <span className="prism__beam" aria-hidden="true" />
          <span className="prism__name" aria-hidden="true">{languages[language]}</span>
        </li>)}
      </ol>
      <span className="prism-gate__gate" aria-hidden="true">
        <i className="prism-gate__closed" style={{ backgroundImage: `url(${gate.closed.src})`, aspectRatio: `${gate.closed.w} / ${gate.closed.h}` }} />
        <i className="prism-gate__open" style={{ backgroundImage: `url(${gate.open.src})`, aspectRatio: `${gate.open.w} / ${gate.open.h}` }} />
      </span>
    </div>
    <p className="prism-gate__status" role="status" aria-live="polite">{open ? copy.aligned : "\u00a0"}</p>
    <div className="prism-gate__archive" role="region" aria-label={copy.title} hidden={!open}>
      <p className="prism-gate__title">{copy.title}</p>
      <p>{copy.body}</p>
      {list}
    </div>
  </div>;
}
