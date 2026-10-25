"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionEnabled } from "@/lib/use-motion";
import { bringIntoView, buzz, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";

// Each lot clicks into place once per visit; scrolling back does not replay it.
const built = new Set<number>();
import type { MarteCopy } from "@/i18n/marte";
import { colonyLots, type Lot } from "@/lib/mars-records";

const KINDS = ["habitat", "lab", "tower", "solar", "habitat", "lab", "tower"] as const;

type Newest = { nome: string; url: string; criado: string; linguagem: string | null };
type Props = { years: { year: number; count: number }[]; copy: MarteCopy["colony"]; sprout: MarteCopy["sprout"]; newest?: Newest; sproutArt: string; locale: string };

// "The colony that grew": one lot per year on the Martian ground. Modules rise with the repositories created that year;
// the newest lot carries a greenhouse whose sprout is the newest original repository (secret `first-sprout`).
// Scroll builds the colony year by year; with reduced motion or without JavaScript it is simply built.
export function ColonyGrowth({ years, copy, sprout, newest, sproutArt, locale }: Props) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Lot | null>(null);
  const [open, setOpen] = useState(false);
  const motion = useMotionEnabled();
  const lots = colonyLots(years);
  const format = new Intl.NumberFormat(locale);
  const dates = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const label = (lot: Lot) => copy.item.replace("{year}", String(lot.year)).replace("{n}", format.format(lot.count));

  useGSAP(() => {
    const element = root.current;
    if (!element || !motion) return;
    const columns = gsap.utils.toArray<HTMLElement>(".colony__lot", element);
    const timeline = gsap.timeline({ scrollTrigger: { trigger: element, start: "top 85%", end: "bottom 65%", scrub: .6 } });
    columns.forEach((column, index) => {
      timeline.from(column.querySelectorAll(".colony__module, .colony__greenhouse"), { yPercent: 120, autoAlpha: 0, stagger: .08, duration: .3, ease: "steps(3)" }, index * .22);
      timeline.call(() => { if (!built.has(index)) { built.add(index); play("build", { detune: index * 60 }); } }, undefined, index * .22 + .3);
    });
  }, { scope: root, dependencies: [motion], revertOnUpdate: true });

  const grow = () => {
    setOpen((current) => {
      if (!current) { discover("first-sprout"); play("sprout"); buzz(20); }
      return !current;
    });
  };
  const growRef = useRef(grow);
  growRef.current = () => { if (!open) grow(); };
  useEffect(() => onEgg("first-sprout", () => void bringIntoView(root.current).then(() => growRef.current())), []);

  const last = lots.length - 1;
  return <figure ref={root} className="colony" data-sprouted={open || undefined}>
    <figcaption><b>{copy.title}</b><span>{copy.note}</span></figcaption>
    <div className="colony__site">
      <p className="colony__readout" aria-live="polite">{active ? label(active) : "\u00a0"}</p>
      <ol className="colony__lots" style={{ "--lots": lots.length } as CSSProperties}>
        {lots.map((lot, index) => <li key={lot.year} className="colony__lot" data-active={active?.year === lot.year || undefined}>
          <span className="colony__stack" aria-hidden="true">
            {Array.from({ length: lot.modules }, (_, module) => <i key={module} className={`colony__module colony__module--${module === lot.modules - 1 && index !== last ? "dome" : KINDS[module % KINDS.length]}`} />)}
            {index === last && newest && <i className="colony__greenhouse" />}
          </span>
          {index === last && newest && <button type="button" className="colony__sprout" aria-label={sprout.label.replace("{year}", newest.criado.slice(0, 4))} aria-expanded={open} aria-controls="sprout-reading" onClick={grow} style={{ "--above": lot.modules } as CSSProperties}>
            <i style={{ backgroundImage: `url(${sproutArt})` }} />
          </button>}
          <button type="button" className="colony__year" aria-label={label(lot)} onPointerEnter={() => setActive(lot)} onFocus={() => setActive(lot)} onClick={() => setActive(lot)} onPointerLeave={() => setActive(null)} onBlur={() => setActive(null)}>{String(lot.year).slice(2)}</button>
        </li>)}
      </ol>
      <span className="colony__ground" aria-hidden="true" />
    </div>
    {newest && <div className="sprout-reading" id="sprout-reading" role="region" aria-labelledby="sprout-title" hidden={!open}>
      <p className="sprout-reading__kicker" id="sprout-title">{sprout.title}</p>
      <p className="sprout-reading__name"><a href={newest.url} target="_blank" rel="noopener noreferrer">{newest.nome}<span aria-hidden="true"> ↗</span></a></p>
      <p>{sprout.body}</p>
      <p className="sprout-reading__meta">{sprout.created} {dates.format(new Date(`${newest.criado}T00:00:00Z`))}{newest.linguagem ? ` · ${newest.linguagem}` : ""}</p>
    </div>}
  </figure>;
}
