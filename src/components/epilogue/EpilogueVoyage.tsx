"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import type { BeyondOrbitCopy } from "@/i18n/beyond-orbit";
import type { Locale } from "@/i18n/config";
import { mobileEggs } from "@/i18n/mobile-eggs";
import { MOBILE_HOTSPOTS } from "@/lib/mobile-eggs";
import { comlink } from "@/i18n/comlink";
import { emitEgg } from "@/lib/eggs";
import { useDiscoveries } from "@/lib/use-discoveries";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { gsap, ScrollTrigger, SplitText, useGSAP, WIDE_MOTION } from "@/lib/gsap";
import { play, uiSound } from "@/lib/sfx";
import { fill } from "@/lib/journey-constellation";
import { VOYAGE_WORLDS, paletteAt, worldReport } from "@/lib/voyage";
import { EpilogueCredits } from "./EpilogueCredits";
import { createVoyage } from "./voyage-engine";

const VOICE: Partial<Record<string, string>> = { home: "observatory", about: "niveora", projects: "mars", content: "lumina", services: "aurelia" };

// "A Viagem": revealed after the last light. Deep space keeps flying behind a letter from the crew, the atlas of
// worlds (planets whose moons are the secrets found there), the credits and the invitation to the next star.
// Static and readable without JS or with reduced motion; the scroll choreography only enhances it.
export function EpilogueVoyage({ copy, lang }: { copy: BeyondOrbitCopy; lang: Locale }) {
  const found = useDiscoveries();
  const revealed = found.includes("last-light");
  const enabled = useMotionEnabled();
  const overlay = useMediaQuery(WIDE_MOTION);
  const root = useRef<HTMLDivElement>(null);
  const eggs = comlink[lang].eggs;

  useGSAP(() => {
    const element = root.current;
    if (!element || !enabled || !revealed) return;
    const q = <T extends Element = HTMLElement>(selector: string) => element.querySelector<T>(selector)!;
    element.dataset.motion = "on";
    const cleanups: (() => void)[] = [() => { delete element.dataset.motion; }];

    // Deep space behind everything: progress, scroll velocity and the palette of the world in view.
    const sky = createVoyage(q<HTMLCanvasElement>(".beyond-orbit__voyage-sky"), { lite: !overlay });
    cleanups.push(observeMotionActivity(element, (active) => active ? sky.start() : sky.stop()), () => sky.destroy());
    ScrollTrigger.create({
      trigger: element, start: "top bottom", end: "bottom top",
      onUpdate: (self) => sky.set({ progress: self.progress, velocity: self.getVelocity(), palette: paletteAt((self.progress - .22) / .5) }),
    });

    // The letter: one sentence at a time on a sticky stage (CSS, so it fits any screen), crossfading like film
    // subtitles; inside the sentence in focus, the words light up as the visitor scrolls.
    const letter = q(".beyond-orbit__letter");
    const lines = gsap.utils.toArray<HTMLElement>("[data-line]", letter);
    const split = SplitText.create(lines.filter((line) => !line.classList.contains("beyond-orbit__signature")), { type: "words", wordsClass: "beyond-orbit__word" });
    const words = lines.map((line) => [...line.querySelectorAll<HTMLElement>(".beyond-orbit__word")]);
    const counter = letter.querySelector<HTMLElement>("[data-counter]");
    const bar = letter.querySelector<HTMLElement>(".beyond-orbit__letter-bar i");
    letter.dataset.cinema = "on";
    // The scroll picks the sentence; the change itself is a short timed crossfade, so whenever the visitor stops, one
    // sentence is on screen, whole and sharp. Inside it, the words light up with the scroll.
    const last = lines.length - 1;
    const reading = { position: 0 };
    let scrolled = 0;
    const show = () => {
      lines.forEach((line, index) => {
        const offset = reading.position - index; const distance = Math.abs(offset);
        gsap.set(line, { autoAlpha: Math.max(0, 1 - distance * 1.4), yPercent: -offset * 22, scale: 1 - Math.min(.14, distance * .07), filter: distance < .01 ? "none" : `blur(${Math.min(12, distance * 10).toFixed(1)}px)` });
        const lit = Math.min(1, Math.max(0, (scrolled - index + .5) / .75));
        words[index].forEach((word, at) => { word.style.opacity = at / words[index].length < lit ? "1" : ".28"; });
      });
      if (counter) counter.textContent = String(Math.round(reading.position) + 1).padStart(2, "0");
      if (bar) bar.style.transform = `scaleX(${scrolled / last})`;
    };
    show();
    let target = 0;
    ScrollTrigger.create({
      trigger: letter, start: "top top", end: "bottom bottom",
      onUpdate: (self) => {
        scrolled = self.progress * last;
        const next = Math.min(last, Math.round(scrolled));
        if (next !== target) { target = next; gsap.to(reading, { position: target, duration: .7, ease: "power2.inOut", overwrite: true, onUpdate: show }); }
        else show();
      },
    });
    cleanups.push(() => { gsap.killTweensOf(reading); split.revert(); gsap.set(lines, { clearProps: "all" }); delete letter.dataset.cinema; });

    // The atlas: a horizontal flight past the planets on wide screens; planets rising into view elsewhere.
    const atlas = q(".beyond-orbit__atlas");
    const track = q(".beyond-orbit__planets");
    const planets = gsap.utils.toArray<HTMLElement>(".beyond-orbit__world-stop", track);
    const arrive = (planet: HTMLElement) => {
      const voice = VOICE[planet.dataset.world ?? ""];
      play(voice ? uiSound(voice, "click") : "static", { gain: .8 });
    };
    if (overlay) {
      atlas.dataset.flight = "on";
      cleanups.push(() => { delete atlas.dataset.flight; });
      const distance = () => Math.max(0, track.scrollWidth - atlas.clientWidth);
      const flight = gsap.to(track, { x: () => -distance(), ease: "none", scrollTrigger: { trigger: atlas, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: .6, invalidateOnRefresh: true } });
      planets.forEach((planet) => {
        gsap.fromTo(planet.querySelector(".beyond-orbit__planet"), { scale: .55, rotate: -12 }, { scale: 1, rotate: 0, ease: "none", scrollTrigger: { trigger: planet, containerAnimation: flight, start: "left right", end: "center center", scrub: true } });
        ScrollTrigger.create({ trigger: planet, containerAnimation: flight, start: "center 60%", onEnter: () => arrive(planet), onEnterBack: () => arrive(planet) });
      });
    } else {
      planets.forEach((planet) => {
        gsap.from(planet, { y: 60, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: planet, start: "top 85%", once: true } });
        ScrollTrigger.create({ trigger: planet, start: "top 55%", once: true, onEnter: () => arrive(planet) });
      });
    }

    // End credits: the reel rolls up through a projector frame driven by the scroll; the credit crossing the middle of
    // the frame comes into focus. Then the post-credits transmission types itself in.
    const run = q(".beyond-orbit__credits-run");
    const stage = q(".beyond-orbit__credits-stage");
    const reel = q(".beyond-orbit__credit-reel");
    const items = gsap.utils.toArray<HTMLElement>(".beyond-orbit__credits-kicker, .beyond-orbit__credit-reel h2, .beyond-orbit__count, .beyond-orbit__credit-list > div, .beyond-orbit__thanks", reel);
    const measure = () => run.style.setProperty("--reel", `${reel.offsetHeight}px`);
    run.dataset.cinema = "on";
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(reel);
    const focus = () => {
      const frame = stage.getBoundingClientRect(); const middle = frame.top + frame.height / 2;
      items.forEach((item) => {
        const box = item.getBoundingClientRect();
        item.style.setProperty("--focus", Math.max(0, 1 - Math.abs(box.top + box.height / 2 - middle) / (frame.height * .5)).toFixed(3));
      });
    };
    gsap.fromTo(reel, { y: () => stage.clientHeight * .85 }, {
      y: () => stage.clientHeight * .5 - reel.offsetHeight, ease: "none", onUpdate: focus,
      scrollTrigger: { trigger: run, start: "top top", end: "bottom bottom", scrub: .5, invalidateOnRefresh: true },
    });
    focus();
    const post = q(".beyond-orbit__post");
    ScrollTrigger.create({
      trigger: post, start: "top 75%", once: true,
      onEnter: () => {
        play("transmission");
        post.querySelectorAll<HTMLElement>("h3, p:not(.beyond-orbit__post-bar), li").forEach((line, index) => {
          const text = line.textContent ?? "";
          gsap.fromTo(line, { autoAlpha: 0 }, { autoAlpha: 1, delay: index * .35, duration: .2 });
          gsap.to(line, { delay: index * .35, duration: 1.1, scrambleText: { text, chars: "█▓▒░<>/\\|=+*#01", speed: .6 } });
        });
      },
    });
    cleanups.push(() => { resize.disconnect(); delete run.dataset.cinema; run.style.removeProperty("--reel"); items.forEach((item) => item.style.removeProperty("--focus")); });
    const next = q(".beyond-orbit__next");
    gsap.fromTo(next.querySelector(".beyond-orbit__next-star"), { scale: .3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: next, start: "top 90%", end: "center 55%", scrub: .6 } });

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => cleanups.forEach((cleanup) => cleanup());
  }, { scope: root, dependencies: [enabled, overlay, revealed], revertOnUpdate: true });

  return <div ref={root} className="beyond-orbit__voyage" data-waiting={enabled && !revealed || undefined}>
    <canvas className="beyond-orbit__voyage-sky" aria-hidden="true" />
    <section className="beyond-orbit__letter" aria-labelledby="epilogue-letter" style={{ "--lines": copy.letter.length + 1 } as CSSProperties}>
      <div className="beyond-orbit__letter-inner">
        <header className="beyond-orbit__letter-head">
          <p className="beyond-orbit__voyage-eyebrow">{copy.voyage}</p>
          <h2 id="epilogue-letter">{copy.letterTitle}</h2>
        </header>
        <div className="beyond-orbit__letter-lines">
          {copy.letter.map((line) => <p key={line} data-line>{line}</p>)}
          <p className="beyond-orbit__signature" data-line>{copy.signature}<b className="beyond-orbit__paw" aria-hidden="true" /></p>
        </div>
        <p className="beyond-orbit__letter-progress" aria-hidden="true">
          <span data-counter>01</span><span className="beyond-orbit__letter-bar"><i /></span><span>{String(copy.letter.length + 1).padStart(2, "0")}</span>
        </p>
      </div>
    </section>

    <section className="beyond-orbit__atlas" aria-labelledby="epilogue-atlas">
      <header className="beyond-orbit__atlas-head">
        <h2 id="epilogue-atlas">{copy.atlasTitle}</h2>
        <p>{copy.atlasIntro}</p>
      </header>
      <ol className="beyond-orbit__planets">
        {VOYAGE_WORLDS.map((world) => {
          const report = worldReport(world.page, found);
          const name = copy.worlds[world.page];
          const style = { "--accent": world.palette.accent, "--glow": world.palette.glow, "--n": Math.max(1, report.total), ...(world.plate && { "--surface": `url(${world.plate})` }) } as CSSProperties;
          return <li key={world.page} className="beyond-orbit__world-stop" data-world={world.page} data-charted={report.charted || undefined}>
            <div className="beyond-orbit__planet" style={style} aria-hidden="true">
              <span className="beyond-orbit__surface" />
              <span className="beyond-orbit__moons">
                {[...report.found, ...report.missing].map((id, index) => <i key={id} data-found={report.found.includes(id) || undefined} style={{ "--i": index } as CSSProperties} />)}
              </span>
            </div>
            <div className="beyond-orbit__planet-card">
              <h3>{name}</h3>
              <p className="beyond-orbit__planet-count">{report.charted ? (report.missing.length ? fill(copy.found, { found: report.found.length, total: report.total }) : copy.allFound) : copy.faint}</p>
              {report.found.length > 0 && <>
                <p className="beyond-orbit__planet-label">{copy.moons}</p>
                <ul className="beyond-orbit__moon-list">{report.found.map((id) => <li key={id}>{eggs[id].name}</li>)}</ul>
              </>}
              {report.missing.length > 0 && <details className="beyond-orbit__hints">
                <summary>{copy.seeHint}<span className="beyond-orbit__missing-count"> · {copy.missing} ({report.missing.length})</span></summary>
                <ul className="beyond-orbit__desktop-hints">{report.missing.map((id) => <li key={id}>{eggs[id].hint}</li>)}</ul>
              </details>}
              <details className="beyond-orbit__mobile-hints">
                <summary>{copy.seeHint}</summary>
                <ul>{MOBILE_HOTSPOTS[world.page].map(({ id }) => <li key={id}>{mobileEggs[lang].hints[id]}</li>)}</ul>
              </details>
              {world.path !== null && report.charted && <Link className="beyond-orbit__revisit" href={`/${lang}${world.path}`}>{fill(copy.revisitWorld, { world: name })}</Link>}
            </div>
          </li>;
        })}
      </ol>
    </section>

    <EpilogueCredits copy={copy} />

    <section className="beyond-orbit__next" aria-labelledby="epilogue-next">
      <h2 id="epilogue-next">{copy.nextStar}</h2>
      <p>{copy.nextBody}</p>
      <button type="button" className="beyond-orbit__next-star" aria-label={copy.replay} onClick={() => emitEgg("last-light")}>
        <span aria-hidden="true">✦</span><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />
      </button>
      <p className="beyond-orbit__next-label" aria-hidden="true">{copy.replay}</p>
    </section>
  </div>;
}
