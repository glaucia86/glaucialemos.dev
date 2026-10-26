"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, HERO_OVERLAY } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { whenBootDone } from "@/lib/boot";
import { play } from "@/lib/sfx";
import { bringIntoView, buzz, discover, emitEgg, onEgg, type EggId } from "@/lib/eggs";
import type { MarteCopy } from "@/i18n/marte";
import { createDust, type UV } from "./dust-engine";
import { createDustJump } from "./dust-jump";
import { SPOTS, type GlauciaPose, type PrincePose } from "./MarsScene";
import { FIND_REPO_EVENT, repoAnchor } from "./repo-events";

export type ReadingRepo = { nome: string; url: string; estrelas: number; linguagem: string | null; criado: string };
type Reading = { kind: "scan" | "sample"; repo: ReadingRepo };

const HERO_EGGS: EggId[] = ["rover-scan", "sample-cache"];
// Same breakpoint as marte.css: the copy sits over the plate only on wide and tall screens; elsewhere it stacks.
const OVERLAY = HERO_OVERLAY;
const pct = (spot: { u: number; v: number }): UV => ({ u: spot.u / 100, v: spot.v / 100 });

type Props = {
  children: ReactNode; labelledBy: string; locale: string;
  copy: Pick<MarteCopy, "status" | "readout"> & { jump: string; touch: string; readouts: [string, string, string] };
  scans: ReadingRepo[]; oldest: ReadingRepo;
};

// Server markup arrives as children; this island brings the dust, the rover and the hero's two secrets to life.
export function MarsMotion({ children, labelledBy, locale, copy, scans, oldest }: Props) {
  const hero = useRef<HTMLElement>(null);
  const jumpCanvas = useRef<HTMLCanvasElement>(null);
  const readoutTitle = useRef<HTMLParagraphElement>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const motion = useMotionEnabled();
  const overlay = useMediaQuery(OVERLAY);
  const format = new Intl.NumberFormat(locale);
  const dates = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" });

  useGSAP(() => {
    const section = hero.current;
    if (!section) return;
    let disposed = false;
    const q = <T extends Element = HTMLElement>(selector: string) => section.querySelector<T>(selector)!;
    const layer = q(".hero-scene-layer");
    const crew = q(".mars-crew");
    const prince = q(".mars-prince");
    const rover = q(".mars-rover");
    const consoleArt = q(".mars-console");
    const sampleCase = q(".mars-case");
    const status = q(".mars-status");
    const hotspots = gsap.utils.toArray<HTMLButtonElement>(".mars-hot", section);
    const crewPoses = gsap.utils.toArray<HTMLElement>(".mars-crew [data-actor-pose]", section);
    const princePoses = gsap.utils.toArray<HTMLElement>(".mars-prince [data-actor-pose]", section);
    let scanIndex = 0;
    let stage: "idle" | "scan" | "sample" = "idle";
    let statusTimer: number | undefined;

    const showPose = (container: HTMLElement, elements: HTMLElement[], pose: string) => {
      container.dataset.acting = "true";
      elements.forEach((element) => { if (element.dataset.actorPose === pose) element.dataset.active = "true"; else delete element.dataset.active; });
    };
    const setPose = (pose: GlauciaPose) => { section.dataset.pose = pose; showPose(crew, crewPoses, pose); };
    const setPrince = (pose: PrincePose) => { section.dataset.prince = pose; showPose(prince, princePoses, pose); };
    const setStage = (next: typeof stage) => { stage = next; section.dataset.stage = next; };
    const say = (text: string, ms = 2800) => {
      clearTimeout(statusTimer);
      status.textContent = text;
      if (!motion) { status.style.opacity = "1"; status.style.visibility = "visible"; return; }
      gsap.fromTo(status, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .3, ease: "steps(3)", overwrite: true });
      statusTimer = window.setTimeout(() => gsap.to(status, { autoAlpha: 0, duration: .3, ease: "steps(3)", onComplete: () => { status.textContent = ""; } }), ms);
    };
    const nextScan = () => scans[scanIndex++ % scans.length];
    // Keyboard users follow the reading: it takes focus only when a focused hotspot (or the radio) started it.
    let keyboard = false;
    const fromKeyboard = () => { keyboard = !!document.activeElement?.matches(".mars-hot:focus-visible, .comlink *"); };
    const show = (next: Reading) => { setReading(next); if (keyboard) requestAnimationFrame(() => readoutTitle.current?.focus({ preventScroll: true })); };
    setPose("idle"); setPrince("stand"); setStage("idle");
    hotspots.forEach((button) => { button.hidden = false; });

    // Reduced motion: the same secrets, with the final state at once and no acting or particles.
    if (!motion) {
      const run = (id: EggId) => {
        discover(id);
        fromKeyboard();
        if (id === "rover-scan") { rover.dataset.rover = "idle"; consoleArt.dataset.console = "on"; show({ kind: "scan", repo: nextScan() }); say(copy.status.scanned); }
        else { sampleCase.dataset.case = "open"; show({ kind: "sample", repo: oldest }); say(copy.status.sample); }
      };
      const ids: Record<string, EggId> = { glaucia: "rover-scan", rover: "rover-scan", console: "rover-scan", prince: "sample-cache" };
      const click = (event: Event) => run(ids[(event.currentTarget as HTMLElement).dataset.hot!]);
      hotspots.forEach((button) => button.addEventListener("click", click));
      const stop = onEgg(HERO_EGGS, (id) => void bringIntoView(section).then(() => { if (!disposed) run(id); }));
      return () => {
        disposed = true; stop(); clearTimeout(statusTimer);
        hotspots.forEach((button) => { button.hidden = true; button.removeEventListener("click", click); });
        for (const key of ["stage", "pose", "prince"]) delete section.dataset[key];
        delete crew.dataset.acting; delete prince.dataset.acting;
        rover.dataset.rover = "idle"; consoleArt.dataset.console = "idle"; sampleCase.dataset.case = "sealed";
        status.textContent = ""; status.style.removeProperty("opacity"); status.style.removeProperty("visibility");
      };
    }

    // One active clock: timers only advance while the scene is on screen and the tab is visible.
    let clock = 0; let previous = 0; let raf = 0; let active = false;
    let timers: { due: number; run: () => void }[] = [];
    const later = (run: () => void, ms: number) => timers.push({ due: clock + ms, run });
    const tick = (now: number) => {
      if (!active || disposed) return;
      clock += previous ? Math.min(100, now - previous) : 0; previous = now;
      for (const timer of [...timers]) if (timer.due <= clock && timers.includes(timer)) { timers.splice(timers.indexOf(timer), 1); timer.run(); }
      raf = requestAnimationFrame(tick);
    };
    const dust = createDust({ back: q(".mars-sky--back"), front: q(".mars-sky--front"), onGust: (on) => { if (on) { section.dataset.gust = "true"; if (active) play("gust-dust"); } else delete section.dataset.gust; } });
    const stopActivity = observeMotionActivity(layer, (on) => {
      active = on; layer.dataset.paused = String(!on);
      cancelAnimationFrame(raf); previous = 0;
      if (on) { dust.start(); raf = requestAnimationFrame(tick); } else dust.stop();
    });
    const settle = () => { timers = []; setPose("idle"); setPrince("stand"); rover.dataset.rover = "idle"; setStage("idle"); };

    const intro = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
      .from(".mars-copy > *", { autoAlpha: 0, y: 24, duration: .8, stagger: .08 })
      .from(".hero-hud > *", { autoAlpha: 0, duration: .4, stagger: { each: .06, from: "random" }, ease: "steps(3)" }, "<")
      .fromTo([crew, prince, rover], { filter: "brightness(3) saturate(0)" }, { filter: "brightness(1) saturate(1)", duration: .9, ease: "steps(6)", clearProps: "filter" }, "<");
    const cancelIntro = whenBootDone(() => intro.play());

    // ——— Glaucia directs the rover: it scans a rock, the console lights up and reads a real repository ———
    const roverScan = () => {
      if (stage !== "idle") return;
      fromKeyboard(); setStage("scan"); discover("rover-scan");
      setPose("point"); play("scan"); buzz([20, 30, 20]);
      say(copy.status.scanning);
      dust.puff(pct(SPOTS.hand), 4);
      later(() => { rover.dataset.rover = "scanning"; dust.puff(pct(SPOTS.wheels), 14); dust.puff(pct(SPOTS.rock), 10); }, 250);
      later(() => dust.scan(pct(SPOTS.sensor), pct(SPOTS.rock), 2.2), 450);
      later(() => { consoleArt.dataset.console = "on"; dust.sparks(pct(SPOTS.screen), 22); play("beacon"); }, 1500);
      later(() => { show({ kind: "scan", repo: nextScan() }); say(copy.status.scanned); setPose("cheer"); play("success"); }, 1900);
      later(() => { rover.dataset.rover = "idle"; dust.puff(pct(SPOTS.wheels), 6); }, 2900);
      later(settle, 3900);
    };

    // ——— Prince sniffs the sprout by the sample case, which opens on the oldest rock of the archive ———
    const sampleCache = () => {
      if (stage !== "idle") return;
      fromKeyboard(); setStage("sample"); discover("sample-cache");
      setPrince("sniff"); play("woof"); buzz([20, 30, 20]);
      say(copy.status.sniffing);
      dust.spores(pct(SPOTS.nose), 12);
      later(() => dust.spores(pct(SPOTS.nose), 10), 600);
      later(() => { sampleCase.dataset.case = "open"; dust.sparks(pct(SPOTS.caseTop), 20); dust.puff(pct(SPOTS.caseTop), 8); play("capsule"); }, 1200);
      later(() => { setPrince("gaze"); show({ kind: "sample", repo: oldest }); say(copy.status.sample); }, 1700);
      later(settle, 3600);
    };

    const actions: Record<string, () => void> = { glaucia: roverScan, rover: roverScan, console: roverScan, prince: sampleCache };
    const replays: Record<string, () => void> = { "rover-scan": roverScan, "sample-cache": sampleCache };
    const onHot = (event: Event) => actions[(event.currentTarget as HTMLElement).dataset.hot!]?.();
    hotspots.forEach((button) => button.addEventListener("click", onHot));
    const stopEggs = onEgg(HERO_EGGS, (id) => void bringIntoView(section).then(() => { if (!disposed) replays[id]?.(); }));

    // Wide screens: push into the landing pad, then a dust storm read by the scan line into the next chapter.
    let jump: ReturnType<typeof createDustJump> | null = null;
    if (overlay) {
      jump = createDustJump(jumpCanvas.current!);
      let jumpPhase = 0;
      const state = { progress: 0 };
      const zoom = [q(".page-hero__image"), layer, q(".mars-layer")];
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "+=120%", pin: true, scrub: .8, anticipatePin: 1, refreshPriority: 1 },
      })
        .to(zoom, { scale: 1.25, transformOrigin: "78% 64%", duration: .6 }, 0)
        .fromTo(".mars-copy", { xPercent: 0, autoAlpha: 1 }, { xPercent: -12, autoAlpha: 0, duration: .32 }, 0)
        .fromTo([".hero-hud", ".mars-readout"], { autoAlpha: 1 }, { autoAlpha: 0, duration: .2 }, 0)
        .to(".page-hero__shade", { autoAlpha: .2, duration: .4 }, 0)
        .to(jumpCanvas.current, { autoAlpha: 1, duration: .1 }, .4)
        .to(state, { progress: 1, duration: .52, onUpdate: () => {
          jump?.set(state.progress);
          // The scan line starts and the static bursts once per pass, in either direction.
          const phase = state.progress < .3 ? 0 : state.progress < .85 ? 1 : 2;
          if (phase > jumpPhase) play(phase === 1 ? "scan-sweep" : "static");
          jumpPhase = phase;
        } }, .4)
        .fromTo(".hero-jump__readouts > span", { autoAlpha: 0 }, { autoAlpha: 1, duration: .04, stagger: .07, ease: "steps(2)" }, .6)
        .to(".hero-jump__label", { autoAlpha: 1, letterSpacing: ".6em", duration: .2 }, .78)
        .to(".hero-jump__flash", { autoAlpha: 1, duration: .06 }, .9)
        .to(".hero-jump__flash", { autoAlpha: 0, duration: .04 }, .96);
    } else {
      gsap.fromTo(".mars-copy", { yPercent: 0, autoAlpha: 1 }, { yPercent: -10, autoAlpha: .2, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });
    }
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      disposed = true; active = false; cancelAnimationFrame(raf); timers = [];
      cancelIntro(); stopActivity(); dust.destroy(); jump?.destroy(); stopEggs(); clearTimeout(statusTimer);
      gsap.killTweensOf([status, crew, prince, rover]);
      gsap.set([status, crew, prince, rover], { clearProps: "all" });
      status.textContent = "";
      for (const key of ["stage", "pose", "prince", "gust"]) delete section.dataset[key];
      delete crew.dataset.acting; delete prince.dataset.acting;
      [...crewPoses, ...princePoses].forEach((element) => { delete element.dataset.active; });
      rover.dataset.rover = "idle"; consoleArt.dataset.console = "idle"; sampleCase.dataset.case = "sealed";
      hotspots.forEach((button) => { button.hidden = true; button.removeEventListener("click", onHot); });
    };
  }, { scope: hero, dependencies: [motion, overlay], revertOnUpdate: true });

  const close = () => {
    setReading(null);
    const section = hero.current;
    if (!section) return;
    section.querySelector<HTMLElement>(".mars-console")!.dataset.console = "idle";
    section.querySelector<HTMLElement>(".mars-case")!.dataset.case = "sealed";
    section.querySelector<HTMLButtonElement>(`.mars-hot--${reading?.kind === "sample" ? "prince" : "glaucia"}`)?.focus({ preventScroll: true });
  };
  const again = () => { setReading(null); emitEgg("rover-scan"); };
  const repo = reading?.repo;

  return <section ref={hero} className="page-hero home-hero-v2 mars-hero" aria-labelledby={labelledBy} data-motion={motion}>
    {children}
    <span className="sky-vignette" aria-hidden="true" />
    <p className="mars-status" role="status" aria-live="polite" />
    <p className="sky-touch-hint" aria-hidden="true"><span />{copy.touch}</p>
    <div className="mars-readout" data-kind={reading?.kind} hidden={!repo} role="region" aria-labelledby="mars-readout-title">
      {repo && <>
        <p className="mars-readout__kicker">{reading.kind === "scan" ? copy.readout.scan : copy.readout.sample}</p>
        <p className="mars-readout__title" id="mars-readout-title" ref={readoutTitle} tabIndex={-1}><a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.nome}<span aria-hidden="true"> ↗</span></a></p>
        {reading.kind === "sample" && <p className="mars-readout__note">{copy.readout.sampleNote}</p>}
        <dl className="mars-readout__data">
          <div><dt>{copy.readout.created}</dt><dd>{dates.format(new Date(`${repo.criado}T00:00:00Z`))}</dd></div>
          <div><dt>{copy.readout.stars}</dt><dd>★ {format.format(repo.estrelas)}</dd></div>
          <div><dt>{copy.readout.language}</dt><dd>{repo.linguagem ?? "—"}</dd></div>
        </dl>
        <p className="mars-readout__actions">
          <a href={`#${repoAnchor(repo.nome)}`} onClick={(event) => { if (!dispatchEvent(new CustomEvent(FIND_REPO_EVENT, { detail: repo.nome, cancelable: true }))) event.preventDefault(); }}>{copy.readout.archive}</a>
          {reading.kind === "scan" && <button type="button" onClick={again}>{copy.readout.again}</button>}
          <button type="button" onClick={close}>{copy.readout.close}</button>
        </p>
      </>}
    </div>
    <div className="hero-jump hero-jump--mars" aria-hidden="true">
      <canvas ref={jumpCanvas} className="hero-jump__canvas" />
      <p className="hero-jump__readouts">{copy.readouts.map((line) => <span key={line}>{line}</span>)}</p>
      <p className="hero-jump__label">{copy.jump}</p>
      <span className="hero-jump__flash" />
    </div>
  </section>;
}
