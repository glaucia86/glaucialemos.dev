"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionEnabled } from "@/lib/use-motion";
import { play } from "@/lib/sfx";
import type { LuminaCopy } from "@/i18n/lumina";
import { FILTER_YEAR_EVENT } from "./lumina-events";
import { platformColor } from "./platforms";

// Each ring rings once per visit; scrolling back does not replay it.
const rung = new Set<number>();

type Props = { years: { year: number; count: number }[]; platforms: { name: string; count: number }[]; copy: LuminaCopy["rings"]; locale: string };

// The library's rings: one crystal column per year, grown by scroll (already grown with reduced motion or without
// JavaScript). A column opens the shelves on its year.
export function CrystalRings({ years, platforms, copy, locale }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const motion = useMotionEnabled();
  const format = new Intl.NumberFormat(locale);
  const max = Math.max(...years.map((item) => item.count), 1);
  const total = platforms.reduce((sum, item) => sum + item.count, 0) || 1;

  useGSAP(() => {
    const element = root.current;
    if (!element || !motion) return;
    const columns = gsap.utils.toArray<HTMLElement>(".ring__crystal", element);
    const timeline = gsap.timeline({ scrollTrigger: { trigger: element, start: "top 85%", end: "bottom 60%", scrub: .6 } });
    columns.forEach((column, index) => {
      timeline.from(column, { scaleY: 0, duration: .3, ease: "steps(6)" }, index * .16);
      timeline.call(() => { if (!rung.has(index)) { rung.add(index); play("link", { detune: index * 90 }); } }, undefined, index * .16 + .25);
    });
  }, { scope: root, dependencies: [motion], revertOnUpdate: true });

  const open = (year: number) => dispatchEvent(new CustomEvent(FILTER_YEAR_EVENT, { detail: year }));

  return <div ref={root} className="rings">
    <figure className="rings__years">
      <figcaption>{copy.yearsLabel}</figcaption>
      <ol className="rings__columns" style={{ "--years": years.length } as CSSProperties}>
        {years.map((item) => <li key={item.year} className="ring">
          <a className="ring__button" href="#artigos" aria-label={copy.year.replace("{year}", String(item.year)).replace("{n}", format.format(item.count))}
            onClick={(event) => { event.preventDefault(); open(item.year); }}>
            <span className="ring__count" aria-hidden="true">{format.format(item.count)}</span>
            <span className="ring__crystal" aria-hidden="true" style={{ "--h": item.count / max } as CSSProperties} />
            <span className="ring__year" aria-hidden="true">{String(item.year).slice(2)}</span>
          </a>
        </li>)}
      </ol>
    </figure>
    <figure className="rings__veins">
      <figcaption>{copy.veins}</figcaption>
      <div className="veins__bar" aria-hidden="true">{platforms.map((item) => <i key={item.name} style={{ flexGrow: item.count, background: platformColor(item.name) }} />)}</div>
      <ul className="veins__list">{platforms.map((item) => <li key={item.name} style={{ "--gem": platformColor(item.name) } as CSSProperties}>
        <span className="gem" aria-hidden="true" />{item.name}<b>{format.format(item.count)}</b><span className="sr-only"> ({Math.round(item.count / total * 100)}%)</span>
      </li>)}</ul>
    </figure>
  </div>;
}
