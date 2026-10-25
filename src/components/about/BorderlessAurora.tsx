"use client";

import { useEffect, useRef, useState } from "react";
import { locales, type Locale } from "@/i18n/config";
import { auroraCopy } from "@/i18n/aurora";
import type { AuroraRecords } from "@/lib/aurora";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { play } from "@/lib/sfx";

// One aurora chord per language: the same voice, shifted (cents), so each choice sounds different.
const CHORD: Record<Locale, number> = { pt: 0, en: 500, es: -300 };

const signals = { pt: { name: "Português", symbol: "◇", x: 77 }, en: { name: "English", symbol: "✦", x: 160 }, es: { name: "Español", symbol: "≋", x: 243 } };
const ribbons = Array.from({ length: 72 }, (_, i) => ({
  x: 16 + i * 4, y: 22 + Math.round(Math.sin(i / 11) * 13 + Math.cos(i / 7) * 7),
  height: 12 + Math.round((Math.sin(i / 9) + 1) * 17),
}));

export function BorderlessAurora({ locale, records }: { locale: Locale; records: AuroraRecords }) {
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(locale);
  const [pulse, setPulse] = useState(0);
  const motion = useMotionEnabled();
  const copy = auroraCopy[locale];
  useEffect(() => { setReady(true); }, []);
  useGSAP(() => {
    const section = root.current;
    if (!section || !motion || pulse === 0) return;
    const wave = section.querySelector(".aurora-wave");
    const spark = section.querySelector(".aurora-spark");
    const glow = section.querySelectorAll(".aurora-ribbons");
    const timeline = gsap.timeline({ paused: true })
      .fromTo(wave, { scale: 0, opacity: 1, svgOrigin: `${signals[selected].x} 136` }, { scale: 8, opacity: 0, duration: .8, ease: "steps(12)" })
      .fromTo(spark, { y: 0, opacity: 1 }, { y: -100, duration: .9, ease: "steps(18)" }, .3)
      .to(spark, { opacity: 0, duration: .2 }, 1.2)
      .fromTo(glow, { opacity: .4 }, { opacity: 1, duration: .4, yoyo: true, repeat: 1 }, .8);
    return observeMotionActivity(section, on => { if (on) timeline.play(); else timeline.pause(); });
  }, { scope: root, dependencies: [selected, pulse, motion], revertOnUpdate: true });
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [selected, ready]);

  return <section ref={root} className="chapter chapter--aurora" aria-labelledby="aurora-title" data-signal={selected} data-motion={motion}>
    <div className="chapter__inner">
      <div className="aurora-heading"><p className="aurora-kicker">PT · EN · ES</p><h2 id="aurora-title">{copy.title}</h2><p>{copy.intro}</p></div>
      <div className="aurora-crossing">
        <div className="aurora-lake">
          <svg viewBox="0 0 320 180" aria-hidden="true" shapeRendering="crispEdges">
            <rect width="320" height="180" fill="#081626" />
            {Array.from({ length: 36 }, (_, i) => <rect key={i} x={(i * 83 + 11) % 318} y={(i * 29 + 7) % 82} width={i % 5 ? 1 : 2} height="1" fill={i % 3 ? "#86b8ce" : "#e9f6ff"} />)}
            <g className="aurora-ribbons">{ribbons.map((r, i) => <rect key={i} x={r.x} y={r.y} width="3" height={r.height} fill={i < 24 ? "#55e9e8" : i < 48 ? "#b89dfc" : "#f3a5d8"} opacity={.25 + (i % 5) * .12} />)}</g>
            <path d="M0 102H16V96H32V88H48V82H56V92H76V99H99V95H114V87H130V79H138V89H154V97H176V91H190V83H204V91H220V96H238V84H252V76H260V86H277V94H296V99H320V180H0Z" fill="#233951" />
            <path d="M0 110H30V108H70V112H112V108H150V111H193V106H236V110H280V106H320V180H0Z" fill="#142d44" />
            <g className="aurora-ribbons" opacity=".4">{ribbons.map((r, i) => <rect key={i} x={r.x} y={115 + Math.round(r.height / 4)} width={i % 3 ? 3 : 5} height={Math.round(r.height / 2)} fill={i < 24 ? "#55e9e8" : i < 48 ? "#b89dfc" : "#f3a5d8"} opacity=".4" />)}</g>
            <path d="M0 123H48V125H80M101 114H143V117H168M211 127H255V125H320M0 154H66V151H108M163 161H214V158H290M24 174H143M248 171H320" fill="none" stroke="#5c8aa4" />
            <path d="M0 169H14V173H38V176H90V179H225V175H270V171H302V165H320V180H0Z" fill="#b5d5e7" />
            <path className="aurora-wave" d={`M${signals[selected].x - 5} 136h10v2h-10z`} fill="none" stroke="currentColor" />
            <rect className="aurora-spark" x={signals[selected].x - 1} y="134" width="2" height="3" fill="#fff" />
          </svg>
          <div className="aurora-signals" role="group" aria-label={copy.controls} hidden={!ready}>
            {locales.map(lang => <button type="button" key={lang} lang={lang} aria-pressed={selected === lang} aria-controls={`aurora-record-${lang}`} onClick={() => { setSelected(lang); setPulse(value => value + 1); play("aurora", { detune: CHORD[lang] }); }}><span aria-hidden="true">{signals[lang].symbol}</span>{signals[lang].name}</button>)}
          </div>
        </div>
        <div className="aurora-records" aria-live={ready ? "polite" : "off"} aria-atomic="true">
          {locales.map(lang => <article id={`aurora-record-${lang}`} key={lang} hidden={ready && selected !== lang} lang={lang}>
            <p className="aurora-kicker">{signals[lang].name} / {auroraCopy[lang].record}</p>
            <p className="aurora-message">{auroraCopy[lang].message}</p>
            <h3>{records[lang].titulo}</h3>
            <p className="aurora-meta">{records[lang].plataforma} · <time dateTime={records[lang].data}>{new Intl.DateTimeFormat(lang, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${records[lang].data}T00:00:00Z`))}</time></p>
            <a href={records[lang].url} target="_blank" rel="noopener noreferrer">{auroraCopy[lang].read} <span aria-hidden="true">↗</span></a>
          </article>)}
        </div>
      </div>
      <p className="aurora-onward">{copy.onward}<span aria-hidden="true"> ↓</span></p>
    </div>
    <span className="aurora-courier" aria-hidden="true" />
  </section>;
}
