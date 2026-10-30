"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { motionAllowed, useMediaQuery } from "@/lib/use-motion";
import { MOBILE_EGG_QUERY } from "@/lib/mobile-eggs";
import { defaultLocale, isLocale } from "@/i18n/config";
import { bringIntoView, buzz, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import type { LuminaCopy } from "@/i18n/lumina";
import type { SeriesId } from "@/lib/lumina-records";
import type { Artigo } from "@/lib/types";

type Series = { id: SeriesId; parts: Artigo[] };
type Props = { series: Series[]; copy: LuminaCopy["collections"]; locale: string };

// series-constellation: each series is a chain of crystals read in order. Lighting them first to last completes the
// constellation and shows the series' real span; a crystal out of order softly puts the chain out. Without JavaScript the
// series are plain ordered lists of links.
export function Collections({ series, copy, locale }: Props) {
  const mobile = useMediaQuery(MOBILE_EGG_QUERY);
  const lang = locale.split("-")[0];
  const completed = { pt: "As histórias agora brilham juntas.", en: "The stories now shine together.", es: "Las historias ahora brillan juntas." }[isLocale(lang) ? lang : defaultLocale];
  const [lit, setLit] = useState<Record<string, number>>({});
  const [wrong, setWrong] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLOListElement>(null);
  const dates = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const format = (article: Artigo) => dates.format(new Date(`${article.data}T00:00:00Z`));
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (!mobile || !series.some(item => lit[item.id] === item.parts.length)) return;
    const timer = setTimeout(() => setLit({}), 4000);
    return () => clearTimeout(timer);
  }, [mobile, lit, series]);

  const light = (id: SeriesId, index: number, total: number) => {
    const count = lit[id] ?? 0;
    if (index < count) return;
    if (index !== count) { setLit((current) => ({ ...current, [id]: 0 })); setWrong(id); play("error"); return; }
    setWrong(null);
    setLit((current) => ({ ...current, [id]: index + 1 }));
    if (index + 1 === total) { discover("series-constellation"); play("prism"); buzz([20, 40, 20]); } else play("link", { detune: index * 100 });
  };

  // From the radio or a typed phrase: the first series lights up crystal by crystal.
  useEffect(() => onEgg("series-constellation", () => {
    const [first] = series;
    if (!first) return;
    const element = root.current?.querySelector(".series");
    void bringIntoView(element ?? null).then(() => {
      discover("series-constellation"); setWrong(null);
      if (!motionAllowed()) { setLit((current) => ({ ...current, [first.id]: first.parts.length })); return; }
      const state = { count: 0 };
      gsap.to(state, { count: first.parts.length, duration: first.parts.length * .18, ease: `steps(${first.parts.length})`, onUpdate: () => setLit((current) => ({ ...current, [first.id]: Math.round(state.count) })), onComplete: () => play("prism") });
    });
  }), [series]);

  return <ol className="collections" ref={root}>
    {series.map(({ id, parts }) => {
      const count = lit[id] ?? 0;
      const complete = count === parts.length;
      const first = parts[0]; const last = parts.at(-1)!;
      return <li key={id} className="series" data-complete={complete || undefined} data-wrong={wrong === id || undefined}>
        <h3>{copy.names[id]}</h3>
        <p className="series__meta">{copy.parts.replace("{n}", String(parts.length))} · <time dateTime={first.data}>{format(first)}</time> → <time dateTime={last.data}>{format(last)}</time></p>
        <ol className="series__parts">
          {parts.map((part, index) => <li key={part.url} data-lit={index < count || undefined}>
            {ready && <button type="button" className="series__node" aria-pressed={index < count}
              aria-label={copy.node.replace("{n}", String(index + 1)).replace("{total}", String(parts.length)).replace("{title}", part.titulo)}
              onClick={() => light(id, index, parts.length)}><i /></button>}
            <a href={part.url} target="_blank" rel="noopener noreferrer">{part.titulo}<span aria-hidden="true"> ↗</span></a>
            <time dateTime={part.data}>{format(part)}</time>
          </li>)}
        </ol>
        <p className="series__status" role="status" aria-live="polite">
          {complete ? mobile ? completed : copy.complete.replace("{n}", String(parts.length)).replace("{first}", format(first)).replace("{last}", format(last)) : wrong === id ? copy.wrong : ""}
        </p>
      </li>;
    })}
  </ol>;
}
