"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Badge, NiveoraCopy } from "@/i18n/niveora";
import { play } from "@/lib/sfx";

const TINTS = ["#55e9e8", "#b89dfc", "#f3a5d8", "#88cbe9"];
const SYMBOLS: Record<Badge["symbol"], string> = {
  star: "M7 1h2v4h2v2h4v2h-4v2H9v4H7v-4H5V9H1V7h4V5h2z",
  terminal: "M1 2h14v12H1z M3 4v8h10V4z M4 5h2v1h1v2H6v1H4V8h1V6H4z M8 10h4v1H8z",
  gear: "M6 1h4v2h2V2h2v2h-1v2h2v4h-2v2h1v2h-2v-1h-2v2H6v-2H4v1H2v-2h1v-2H1V6h2V4H2V2h2v1h2z M6 6v4h4V6z",
  book: "M1 2h5v1h4V2h5v12h-5v1H6v-1H1z M3 4v8h3v1h1V5H6V4z M9 5v8h1v-1h3V4h-3v1z",
};

function CrystalCard({ badge, index, copy }: { badge: Badge; index: number; copy: NiveoraCopy["log"] }) {
  const [back, setBack] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <li><div className="badge" data-flipped={back} data-ready={ready} style={{ "--tint": TINTS[index] } as CSSProperties}>
    <span className="snowcap" aria-hidden="true" />
    <div className="badge__inner">
      <div className="badge__face badge__face--front" hidden={back}>
        <svg className="badge__icon" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true" focusable="false"><path d={SYMBOLS[badge.symbol]} fill="currentColor" fillRule="evenodd" /></svg>
        <b>{badge.name}</b>
      </div>
      <div className="badge__face badge__face--back" hidden={ready && !back}>
        <b>{badge.name}</b><p>{badge.note}</p><a href={badge.href} target="_blank" rel="noopener noreferrer">{badge.linkLabel} ↗</a>
      </div>
    </div>
    <button hidden={!ready} className="badge__flip" type="button" aria-pressed={back} aria-label={`${back ? copy.back : copy.flip}: ${badge.name}`} onClick={() => { setBack(value => !value); play("blip"); }}>{back ? copy.back : copy.flip}</button>
  </div></li>;
}

export function CrystalBadges({ copy }: { copy: NiveoraCopy["log"] }) {
  return <ul className="badge-list" data-reveal="stagger">{copy.badges.map((badge, index) => <CrystalCard key={badge.id} badge={badge} index={index} copy={copy} />)}</ul>;
}
