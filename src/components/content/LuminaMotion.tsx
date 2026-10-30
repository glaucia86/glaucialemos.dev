"use client";

import { MOBILE_EGG_QUERY } from "@/lib/mobile-eggs";
import { useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, heroScrollStart, HERO_OVERLAY } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { whenBootDone } from "@/lib/boot";
import { play } from "@/lib/sfx";
import { bringIntoView, buzz, discover, emitEgg, onEgg, type EggId } from "@/lib/eggs";
import type { LuminaCopy } from "@/i18n/lumina";
import type { Artigo } from "@/lib/types";
import { createPrism, type UV } from "./prism-engine";
import { createCrystalJump } from "./crystal-jump";
import { SPOTS, type GlauciaPose, type PrincePose } from "./LuminaScene";
import { articleAnchor, findArticle } from "./lumina-events";

type Reading = { kind: "whisper" | "first"; article: Artigo };

const HERO_EGGS: EggId[] = ["crystal-whisper", "first-page"];
// Full-bleed composition and scroll camera on every viewport.
const OVERLAY = HERO_OVERLAY;
const pct = (spot: { u: number; v: number }): UV => ({ u: spot.u / 100, v: spot.v / 100 });

type Props = {
  children: ReactNode; labelledBy: string; locale: string;
  copy: Pick<LuminaCopy, "status" | "readout" | "languages"> & { jump: string; touch: string; readouts: [string, string, string] };
  whispers: Artigo[]; first: Artigo;
};

// Server markup arrives as children; this island brings the light, the crystal and the hero's two secrets to life.
export function LuminaMotion({ children, labelledBy, locale, copy, whispers, first }: Props) {
  const hero = useRef<HTMLElement>(null);
  const jumpCanvas = useRef<HTMLCanvasElement>(null);
  const readoutTitle = useRef<HTMLParagraphElement>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const motion = useMotionEnabled();
  const overlay = useMediaQuery(OVERLAY);
  const dates = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  useGSAP(() => {
    const section = hero.current;
    if (!section) return;
    let disposed = false;
    const q = <T extends Element = HTMLElement>(selector: string) => section.querySelector<T>(selector)!;
    const layer = q(".hero-scene-layer");
    const crew = q(".lumina-crew");
    const prince = q(".lumina-prince");
    const crystal = q(".lumina-crystal");
    const books = q(".lumina-books");
    const status = q(".lumina-status");
    const hotspots = gsap.utils.toArray<HTMLButtonElement>(".lumina-hot", section);
    const crewPoses = gsap.utils.toArray<HTMLElement>(".lumina-crew [data-actor-pose]", section);
    const princePoses = gsap.utils.toArray<HTMLElement>(".lumina-prince [data-actor-pose]", section);
    let whisperIndex = 0;
    let stage: "idle" | "whisper" | "first" = "idle";
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
      if (!motion) {
        status.style.opacity = "1"; status.style.visibility = "visible";
        if (matchMedia(MOBILE_EGG_QUERY).matches) statusTimer = window.setTimeout(() => { status.textContent = ""; }, ms);
        return;
      }
      gsap.fromTo(status, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .3, ease: "steps(3)", overwrite: true });
      statusTimer = window.setTimeout(() => gsap.to(status, { autoAlpha: 0, duration: .3, ease: "steps(3)", onComplete: () => { status.textContent = ""; } }), ms);
    };
    const nextWhisper = () => whispers[whisperIndex++ % whispers.length];
    // Keyboard users follow the reading: it takes focus only when a focused hotspot (or the radio) started it.
    let keyboard = false;
    const fromKeyboard = () => { keyboard = !!document.activeElement?.matches(".lumina-hot:focus-visible, .comlink *"); };
    const show = (next: Reading) => { setReading(next); if (keyboard) requestAnimationFrame(() => readoutTitle.current?.focus({ preventScroll: true })); };
    setPose("idle"); setPrince("stand"); setStage("idle");
    hotspots.forEach((button) => { button.hidden = false; });
    const ids: Record<string, EggId> = { glaucia: "crystal-whisper", crystal: "crystal-whisper", prince: "first-page", books: "first-page" };

    // Reduced motion: the same secrets, with the final state at once and no acting or particles.
    if (!motion) {
      const run = (id: EggId) => {
        discover(id); fromKeyboard();
        if (id === "crystal-whisper") { show({ kind: "whisper", article: nextWhisper() }); say(copy.status.whispered); }
        else { books.dataset.books = "open"; show({ kind: "first", article: first }); say(copy.status.found); }
      };
      const click = (event: Event) => { if (!matchMedia(MOBILE_EGG_QUERY).matches) run(ids[(event.currentTarget as HTMLElement).dataset.hot!]); };
      hotspots.forEach((button) => button.addEventListener("click", click));
      const stop = onEgg(HERO_EGGS, (id) => void bringIntoView(section).then(() => { if (!disposed) run(id); }));
      return () => {
        disposed = true; stop(); clearTimeout(statusTimer);
        hotspots.forEach((button) => { button.hidden = true; button.removeEventListener("click", click); });
        for (const key of ["stage", "pose", "prince"]) delete section.dataset[key];
        delete crew.dataset.acting; delete prince.dataset.acting;
        books.dataset.books = "closed"; crystal.dataset.crystal = "rest";
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
    const prism = createPrism({ back: q(".lumina-sky--back"), front: q(".lumina-sky--front") });
    const stopActivity = observeMotionActivity(layer, (on) => {
      active = on; layer.dataset.paused = String(!on);
      cancelAnimationFrame(raf); previous = 0;
      if (on) { prism.start(); raf = requestAnimationFrame(tick); } else prism.stop();
    });
    const settle = () => { timers = []; setPose("idle"); setPrince("stand"); crystal.dataset.crystal = "rest"; setStage("idle"); };

    const intro = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
      .from(".lumina-copy > *", { autoAlpha: 0, y: 24, duration: .8, stagger: .08 })
      .from(".hero-hud > *", { autoAlpha: 0, duration: .4, stagger: { each: .06, from: "random" }, ease: "steps(3)" }, "<")
      .fromTo([crew, prince, crystal], { filter: "brightness(3) saturate(0)" }, { filter: "brightness(1) saturate(1)", duration: .9, ease: "steps(6)", clearProps: "filter" }, "<");
    const cancelIntro = whenBootDone(() => intro.play());

    // ——— Glaucia touches the crystal: it rises to her finger, hums, and whispers an article of one year ———
    const crystalWhisper = () => {
      if (stage !== "idle") return;
      fromKeyboard(); setStage("whisper"); discover("crystal-whisper");
      setPose("touch"); play("chime"); buzz([15, 30, 15]);
      say(copy.status.touching);
      later(() => { crystal.dataset.crystal = "awake"; prism.rise(pct(SPOTS.crystalBase), 10); }, 200);
      later(() => { prism.ripple(pct(SPOTS.finger), 3); prism.sparks(pct(SPOTS.finger), 10); }, 750);
      later(() => { setPose("listen"); prism.rise(pct(SPOTS.finger), 14); }, 1100);
      later(() => { show({ kind: "whisper", article: nextWhisper() }); say(copy.status.whispered); prism.ripple(pct(SPOTS.finger), 2, 22); play("echo"); }, 1800);
      later(() => { setPose("cheer"); crystal.dataset.crystal = "rest"; }, 2900);
      later(settle, 3900);
    };

    // ——— Prince sniffs the stack of books, his scanner lights up and the stack opens on the first page ———
    const firstPage = () => {
      if (stage !== "idle") return;
      fromKeyboard(); setStage("first"); discover("first-page");
      setPrince("sniff-a"); play("woof"); buzz([20, 30, 20]);
      say(copy.status.sniffing);
      later(() => setPrince("sniff-b"), 420);
      later(() => setPrince("sniff-a"), 840);
      later(() => { setPrince("sniff-b"); prism.rise(pct(SPOTS.nose), 6); }, 1260);
      later(() => { setPrince("scan"); play("scanner"); prism.scan(pct(SPOTS.backpack), pct(SPOTS.books), 1.4); }, 1700);
      later(() => { books.dataset.books = "open"; play("page"); prism.sparks(pct(SPOTS.page), 22); prism.rise(pct(SPOTS.page), 12); }, 2700);
      later(() => { show({ kind: "first", article: first }); say(copy.status.found); setPrince("wag-b"); }, 3100);
      later(settle, 4800);
    };

    const actions: Record<string, () => void> = { glaucia: crystalWhisper, crystal: crystalWhisper, prince: firstPage, books: firstPage };
    const replays: Record<string, () => void> = { "crystal-whisper": crystalWhisper, "first-page": firstPage };
    const onHot = (event: Event) => { if (!matchMedia(MOBILE_EGG_QUERY).matches) actions[(event.currentTarget as HTMLElement).dataset.hot!]?.(); };
    hotspots.forEach((button) => button.addEventListener("click", onHot));
    // Hovering or focusing Prince at rest makes him wag; nothing plays on its own.
    const princeHot = hotspots.find((button) => button.dataset.hot === "prince");
    const wag = () => { if (stage === "idle") setPrince("wag-b"); };
    const unwag = () => { if (stage === "idle") setPrince("stand"); };
    princeHot?.addEventListener("pointerenter", wag); princeHot?.addEventListener("focus", wag);
    princeHot?.addEventListener("pointerleave", unwag); princeHot?.addEventListener("blur", unwag);
    const stopEggs = onEgg(HERO_EGGS, (id) => void bringIntoView(section).then(() => { if (!disposed) replays[id]?.(); }));

    // Wide screens: push into the terrace, then a crystal tunnel that opens on the next chapter.
    let jump: ReturnType<typeof createCrystalJump> | null = null;
    if (overlay) {
      jump = createCrystalJump(jumpCanvas.current!);
      let jumpPhase = 0;
      const state = { progress: 0 };
      const zoom = [q(".page-hero__image"), layer, q(".lumina-layer")];
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: () => heroScrollStart(section), end: "+=120%", pin: true, scrub: .8, anticipatePin: 1, refreshPriority: 1 },
      })
        .to(zoom, { scale: 1.25, transformOrigin: "80% 70%", duration: .6 }, 0)
        .fromTo(".lumina-copy", { xPercent: 0, autoAlpha: 1 }, { xPercent: -12, autoAlpha: 0, duration: .32 }, 0)
        .fromTo([".hero-hud", ".lumina-readout"], { autoAlpha: 1 }, { autoAlpha: 0, duration: .2 }, 0)
        .to(".page-hero__shade", { autoAlpha: .2, duration: .4 }, 0)
        .to(jumpCanvas.current, { autoAlpha: 1, duration: .1 }, .4)
        .to(state, { progress: 1, duration: .52, onUpdate: () => {
          jump?.set(state.progress);
          // The light splits and the facets flash once per pass, in either direction.
          const phase = state.progress < .3 ? 0 : state.progress < .8 ? 1 : 2;
          if (phase > jumpPhase) play(phase === 1 ? "refract" : "facet");
          jumpPhase = phase;
        } }, .4)
        .fromTo(".hero-jump__readouts > span", { autoAlpha: 0 }, { autoAlpha: 1, duration: .04, stagger: .07, ease: "steps(2)" }, .6)
        .to(".hero-jump__label", { autoAlpha: 1, letterSpacing: ".6em", duration: .2 }, .78)
        .to(".hero-jump__flash", { autoAlpha: 1, duration: .06 }, .9)
        .to(".hero-jump__flash", { autoAlpha: 0, duration: .04 }, .96);
    }
    // Tall copy stays readable before the camera starts (heroScrollStart).
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      disposed = true; active = false; cancelAnimationFrame(raf); timers = [];
      cancelIntro(); stopActivity(); prism.destroy(); jump?.destroy(); stopEggs(); clearTimeout(statusTimer);
      princeHot?.removeEventListener("pointerenter", wag); princeHot?.removeEventListener("focus", wag);
      princeHot?.removeEventListener("pointerleave", unwag); princeHot?.removeEventListener("blur", unwag);
      gsap.killTweensOf([status, crew, prince, crystal]);
      gsap.set([status, crew, prince], { clearProps: "all" });
      // The crystal keeps its server box (left/top/size) inline: only what GSAP touched is cleared.
      gsap.set(crystal, { clearProps: "filter,opacity,visibility" });
      status.textContent = "";
      for (const key of ["stage", "pose", "prince"]) delete section.dataset[key];
      delete crew.dataset.acting; delete prince.dataset.acting;
      [...crewPoses, ...princePoses].forEach((element) => { delete element.dataset.active; });
      books.dataset.books = "closed"; crystal.dataset.crystal = "rest";
      hotspots.forEach((button) => { button.hidden = true; button.removeEventListener("click", onHot); });
    };
  }, { scope: hero, dependencies: [motion, overlay], revertOnUpdate: true });

  const close = () => {
    const kind = reading?.kind;
    setReading(null);
    const section = hero.current;
    if (!section) return;
    section.querySelector<HTMLElement>(".lumina-books")!.dataset.books = "closed";
    section.querySelector<HTMLButtonElement>(`.lumina-hot--${kind === "first" ? "prince" : "glaucia"}`)?.focus({ preventScroll: true });
  };
  const again = () => { setReading(null); emitEgg("crystal-whisper"); };
  const article = reading?.article;

  return <section ref={hero} className="page-hero home-hero-v2 lumina-hero" aria-labelledby={labelledBy} data-motion={motion}>
    {children}
    <span className="sky-vignette" aria-hidden="true" />
    <p className="lumina-status" role="status" aria-live="polite" />
    <p className="sky-touch-hint" aria-hidden="true"><span />{copy.touch}</p>
    <div className="lumina-readout" data-kind={reading?.kind} hidden={!article} role="region" aria-labelledby="lumina-readout-title">
      {article && <>
        <p className="lumina-readout__kicker">{reading.kind === "whisper" ? copy.readout.whisper.replace("{year}", article.data.slice(0, 4)) : copy.readout.first}</p>
        <p className="lumina-readout__title" id="lumina-readout-title" ref={readoutTitle} tabIndex={-1}><a href={article.url} target="_blank" rel="noopener noreferrer">{article.titulo}<span aria-hidden="true"> ↗</span></a></p>
        <p className="lumina-readout__note">{reading.kind === "whisper" ? copy.readout.whisperNote : copy.readout.firstNote}</p>
        <dl className="lumina-readout__data">
          <div><dt>{copy.readout.published}</dt><dd>{dates.format(new Date(`${article.data}T00:00:00Z`))}</dd></div>
          <div><dt>{copy.readout.platform}</dt><dd>{article.plataforma}</dd></div>
          <div><dt>{copy.readout.language}</dt><dd>{copy.languages[article.idioma]}</dd></div>
        </dl>
        <p className="lumina-readout__actions">
          <a href={`#${articleAnchor(article.url)}`} onClick={(event) => { if (findArticle(article.url)) event.preventDefault(); }}>{copy.readout.shelf}</a>
          {reading.kind === "whisper" && <button type="button" onClick={again}>{copy.readout.again}</button>}
          <button type="button" onClick={close}>{copy.readout.close}</button>
        </p>
      </>}
    </div>
    <div className="hero-jump hero-jump--lumina" aria-hidden="true">
      <canvas ref={jumpCanvas} className="hero-jump__canvas" />
      <p className="hero-jump__readouts">{copy.readouts.map((line) => <span key={line}>{line}</span>)}</p>
      <p className="hero-jump__label">{copy.jump}</p>
      <span className="hero-jump__flash" />
    </div>
  </section>;
}
