"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { NiveoraCopy } from "@/i18n/niveora";
import { groupEras, normalizeEra, yearOf, type CareerRole, type Era } from "@/lib/career";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { formatExperiencePeriod } from "@/lib/home-curation";
import { play } from "@/lib/sfx";

const vars = (values: Record<string, string | number>) => values as CSSProperties;

// One markup, two layouts: parallel trails on desktop, an era-grouped list on mobile and without CSS.
export function CareerMap({ roles, copy, locale, source, ship }: { roles: CareerRole[]; copy: NiveoraCopy["map"]; ship: string; locale: string; source: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [era, setEra] = useState<Era | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const desktop = useMediaQuery("(min-width: 901px)");
  const motion = useMotionEnabled();
  const map = ready && desktop;
  useEffect(() => {
    const sync = () => setEra(normalizeEra(new URLSearchParams(location.search).get("era")));
    sync(); setReady(true); addEventListener("popstate", sync);
    return () => removeEventListener("popstate", sync);
  }, []);
  const filter = (next: Era | "all") => {
    if (next !== era) play("click-niveora", { detune: next === "all" ? 0 : 300 });
    setEra(next); setExpanded(null);
    const url = new URL(location.href);
    if (next === "all") url.searchParams.delete("era"); else url.searchParams.set("era", next);
    history.replaceState(history.state, "", url);
  };
  const min = Math.min(...roles.map(role => role.start));
  const max = Math.max(...roles.map(role => role.end)) + 1;
  const span = max - min;
  const lanes = Math.max(...roles.map(role => role.lane)) + 1;
  const eras = groupEras(roles);
  const years = Array.from({ length: yearOf(max - 1) - yearOf(min) }, (_, index) => yearOf(min) + index + 1);
  const ratio = (month: number) => ((month - min) / span).toFixed(5);

  const selected = eras.find(item => item.era === era);
  const width = selected ? (selected.to + 1 - selected.from) / span : 1;
  const zf = selected ? Math.max(0, (selected.from - min) / span - width * .06) : 0;
  const zs = selected ? Math.min(1, width * 1.12) : 1;
  useGSAP(() => {
    const element = root.current;
    if (!element || !map || !motion) return;
    const beam = { progress: 0 };
    const year = element.querySelector(".ops-ship__year");
    gsap.set(".ops-ship", { autoAlpha: 1 });
    gsap.to(beam, { progress: 1, ease: "none", onUpdate: () => {
      element.style.setProperty("--progress", String(beam.progress));
      if (year) year.textContent = String(yearOf(min + (zf + beam.progress * zs) * (span - 1)));
    }, scrollTrigger: { trigger: element.querySelector(".ops-chart"), start: "top 72%", end: "bottom 62%", scrub: .5 } });
    return () => { element.style.removeProperty("--progress"); };
  }, { scope: root, dependencies: [map, motion, era], revertOnUpdate: true });
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [map, era]);

  return <div ref={root} className="ops" data-ops data-view={map ? "map" : "list"} data-focus={era} data-min={min} data-span={span} style={vars({ "--lanes": lanes, "--zf": zf, "--zs": zs })}>
    <div className="ops-filter" role="group" aria-label={copy.filter} hidden={!ready}>
      <button type="button" aria-pressed={era === "all"} data-era="all" onClick={() => filter("all")}>{copy.all}</button>
      {[...eras].reverse().map(({ era: item }) => <button type="button" aria-pressed={era === item} data-era={item} key={item} onClick={() => filter(item)}>{copy.eras[item].name}</button>)}
    </div>
    <div className="ops-chart">
      <span className="snowcap" aria-hidden="true" />
      <div className="ops-axis" aria-hidden="true">
        {years.map(year => <span className="ops-tick" key={year} style={vars({ "--x": ratio(year * 12) })}>{year}</span>)}
        <span className="ops-tick ops-tick--now" style={vars({ "--x": 1 })}>{copy.now}</span>
      </div>
      <span className="ops-trail" aria-hidden="true"><span className="ops-trail__beam" /></span>
      <span className="ops-ship" aria-hidden="true">
        <i className="ops-ship__art" style={{ backgroundImage: `url(${ship})` }} />
        <b className="ops-ship__year">{yearOf(min)}</b>
      </span>
      {eras.map(({ era, roles: items, from, to }) => <section className="ops-era" data-era={era} key={era} hidden={selected !== undefined && selected.era !== era} aria-labelledby={`era-${era}`} style={vars({ "--x": ratio(from), "--w": ((to + 1 - from) / span).toFixed(5) })}>
        <span className="ops-era__band" aria-hidden="true" />
        <h3 className="ops-era__title" id={`era-${era}`}>{copy.eras[era].name} <small>{yearOf(from)}–{yearOf(to)} · {items.length} {copy.roles}</small></h3>
        <p className="ops-era__summary">{copy.eras[era].summary}</p>
        <ol className="ops-roles">{items.map(role => <li className="ops-role" key={`${role.empresa}-${role.periodo}`} data-current={role.current || undefined} data-side={((role.start - min) / span - zf) / zs > .55 ? "end" : "start"} data-open={role.lane >= lanes - 2 && lanes > 2 ? "up" : "down"}
          style={vars({ "--x": ratio(role.start), "--w": ((role.end + 1 - role.start) / span).toFixed(5), "--lane": role.lane })}>
          <button type="button" className="ops-role__bar" aria-label={`${role.empresa}: ${role.cargo}`} aria-expanded={expanded === `${role.empresa}-${role.periodo}`} onClick={() => setExpanded(expanded === `${role.empresa}-${role.periodo}` ? null : `${role.empresa}-${role.periodo}`)}><span className="ops-role__label">{role.empresa}</span></button>
          <div className="ops-role__brief">
            <p className="ops-role__period">{formatExperiencePeriod(role.periodo, locale)}{role.current && <b> · {copy.current}</b>}</p>
            <h4>{role.cargo}</h4>
            <p className="ops-role__company">{role.empresa}</p>
            <a href={role.fonte} target="_blank" rel="noopener noreferrer">{source}<span aria-hidden="true"> ↗</span></a>
          </div>
        </li>)}</ol>
      </section>)}
    </div>
  </div>;
}
