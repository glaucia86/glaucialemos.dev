"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, HERO_OVERLAY, FINE_POINTER } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { whenBootDone } from "@/lib/boot";
import { play } from "@/lib/sfx";
import { bringIntoView, buzz, discover, emitEgg, matchTail, normalizePhrase, onEgg, getFoundSnapshot, subscribeFound, RESET_EVENT, type EggId } from "@/lib/eggs";
import type { NiveoraCopy } from "@/i18n/niveora";
import { createSnow, type UV } from "./snow-engine";
import { createBlizzardJump } from "./blizzard-jump";
import { HOTSPOTS, SPOTS, niveoraScene } from "./NiveoraScene";
import { boxStyle, poseBox } from "@/lib/scenes";
import { ambientPoses, trailSample, greetingSample, capsuleKnown, WALK_START, STEP_MS, type GlauciaPose, type PrincePose } from "./niveora-acting";
import { CAPSULE_CLOSED, CAPSULE_OPEN } from "./MemoryCapsule";
import { FREEZE_EVENT, STORM_END_EVENT } from "./FrozenCards";

const ABOUT_EGGS: EggId[] = ["paw-tracks", "memory-capsule", "whiteout", "aurora-prism", "snowdrift"];
const HERO_EGGS: EggId[] = ["paw-tracks", "memory-capsule", "whiteout", "aurora-prism"];
// Same breakpoint as niveora.css: the copy sits over the plate only on wide and tall screens; elsewhere it stacks.
const OVERLAY = HERO_OVERLAY;
const PRISM_MS = 6500;
const WHITEOUT_MS = 8000;
const TRACKS_FADE_MS = 16000;
const TEMP = 32;
const TEMP_STORM = 47;
type Stage = "idle" | "tracks" | "greeting" | "capsule" | "prism";
type Capsule = "hidden" | "found" | "open";
export type NiveoraLabels = { jump: string; touch: string; calm: string; status: NiveoraCopy["status"] };

const pct = (spot: { u: number; v: number }): UV => ({ u: spot.u / 100, v: spot.v / 100 });

// Server markup arrives as children; this island brings the snow, the aurora and the expedition's secrets to life.
export function NiveoraMotion({ children, labels, labelledBy }: { children: ReactNode; labels: NiveoraLabels; labelledBy: string }) {
  const hero = useRef<HTMLElement>(null);
  const jumpCanvas = useRef<HTMLCanvasElement>(null);
  const calmButton = useRef<HTMLButtonElement>(null);
  const capsuleFound = useRef(false);
  const motion = useMotionEnabled();
  const overlay = useMediaQuery(OVERLAY);
  const fine = useMediaQuery(FINE_POINTER);

  useGSAP(() => {
    const section = hero.current;
    const page = section?.closest<HTMLElement>(".about-page");
    if (!section || !page) return;
    let disposed = false;
    const q = <T extends Element = HTMLElement>(selector: string) => section.querySelector<T>(selector)!;
    const layer = q(".hero-scene-layer");
    const sceneLayers = [layer, q(".niveora-layer")];
    const plane = q(".hero-scene-layer .niveora-plane");
    const crew = q(".niveora-crew");
    const prince = q(".niveora-prince");
    const capsule = q(".niveora-capsule");
    const crystal = q(".niveora-crystal");
    const station = q(".niveora-station");
    const tracks = gsap.utils.toArray<HTMLElement>(".niveora-track", section);
    const status = q(".niveora-status");
    const temp = q("[data-temp]");
    const readout = q(".niveora-readout");
    const hotspots = gsap.utils.toArray<HTMLButtonElement>(".niveora-hot", section);
    const capsuleButton = hotspots.find((button) => button.dataset.hot === "capsule");
    const princeButton = hotspots.find((button) => button.dataset.hot === "prince")!;
    const calm = calmButton.current!;

    capsuleFound.current = capsuleKnown(getFoundSnapshot());

    // Reduced motion still exposes every hero secret, with immediate results and no acting/particles.
    if (!motion) {
      let pendingReset = false;
      const reveal = () => {
        capsuleFound.current = true; capsule.dataset.capsule = "found";
        if (capsuleButton) capsuleButton.hidden = false;
      };
      const run = (id: EggId) => {
        discover(id);
        if (id === "paw-tracks") { reveal(); status.textContent = labels.status.found; }
        if (id === "memory-capsule") { reveal(); dispatchEvent(new Event(CAPSULE_OPEN)); }
        if (id === "whiteout") status.textContent = labels.status.calm;
        if (id === "aurora-prism") status.textContent = labels.status.prism;
        status.style.opacity = "1"; status.style.visibility = "visible";
      };
      const ids: Record<string, EggId> = { prince: "paw-tracks", glaucia: "memory-capsule", capsule: "memory-capsule", station: "whiteout", crystal: "aurora-prism" };
      const click = (event: Event) => run(ids[(event.currentTarget as HTMLElement).dataset.hot!]);
      let buffer = "";
      const typed = (event: KeyboardEvent) => {
        if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1 || (event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true'], dialog")) return;
        buffer = (buffer + normalizePhrase(event.key)).slice(-24);
        const id = matchTail(buffer, HERO_EGGS); if (id) { buffer = ""; run(id); }
      };
      section.dataset.stage = "idle";
      hotspots.forEach((button) => { button.hidden = button === capsuleButton && !capsuleFound.current; button.addEventListener("click", click); });
      if (capsuleFound.current) reveal();
      const syncMemory = () => {
        if (!capsuleKnown(getFoundSnapshot()) && document.querySelector("dialog.capsule[open]")) { pendingReset = true; return; }
        capsuleFound.current = capsuleKnown(getFoundSnapshot());
        capsule.dataset.capsule = capsuleFound.current ? "found" : "hidden";
        if (capsuleButton) capsuleButton.hidden = !capsuleFound.current;
      };
      const afterClose = () => { if (pendingReset) { pendingReset = false; syncMemory(); } };
      addEventListener(CAPSULE_CLOSED, afterClose);
      const stopMemory = subscribeFound(syncMemory);
      const stop = onEgg(HERO_EGGS, run); addEventListener("keydown", typed);
      return () => {
        disposed = true; stop(); stopMemory(); removeEventListener(CAPSULE_CLOSED, afterClose); removeEventListener("keydown", typed);
        hotspots.forEach((button) => { button.hidden = true; button.removeEventListener("click", click); });
        tracks.forEach((track) => { delete track.dataset.on; });
        delete section.dataset.stage; delete capsule.dataset.capsule;
        status.textContent = ""; status.style.removeProperty("opacity"); status.style.removeProperty("visibility");
      };
    }

    let actorTime = 0;
    let gustActive = false;
    let greetingStarted: number | null = null;
    let resetPending = false;
    let actorRaf = 0;
    let previousFrame = 0;
    let active = false;
    let hovered = false;
    let focused = false;
    let trailStarted: number | null = null;
    let stamped = 0;
    let revealed = false;
    let shakePending = false;
    let shakeStarted: number | null = null;
    const onGust = (on: boolean) => { gustActive = on; };
    const snow = createSnow({ back: q(".niveora-sky--back"), front: q(".niveora-sky--front"), onGust });

    let stage: Stage = "idle";
    let timers: { due: number; run: () => void }[] = [];
    let statusTimer: number | undefined;
    let fadeTracks: number | undefined;
    let stormTimers: number[] = [];
    let storm = false;
    const stormLater = (callback: () => void, ms: number) => stormTimers.push(window.setTimeout(callback, ms));
    const clearStorm = () => { stormTimers.forEach((timer) => clearTimeout(timer)); stormTimers = []; };
    const degrees = { value: TEMP };
    const format = new Intl.NumberFormat(document.documentElement.lang, { maximumFractionDigits: 0 });
    const writeTemp = () => { temp.textContent = `−${format.format(degrees.value)} °C`; };
    const setStage = (next: Stage) => { stage = next; section.dataset.stage = next; };
    const crewPoses = gsap.utils.toArray<HTMLElement>(".niveora-crew [data-actor-pose]", section);
    const princePoses = gsap.utils.toArray<HTMLElement>(".niveora-prince [data-actor-pose]", section);
    const showPose = (container: HTMLElement, elements: HTMLElement[], pose: string) => {
      container.dataset.acting = "true";
      elements.forEach((element) => { if (element.dataset.actorPose === pose) element.dataset.active = "true"; else delete element.dataset.active; });
    };
    const setPose = (pose: GlauciaPose) => {
      if (section.dataset.pose === pose) return;
      section.dataset.pose = pose; showPose(crew, crewPoses, pose);
      Object.assign(q(".niveora-snowcap--glaucia").style, boxStyle(poseBox(niveoraScene, "glaucia", pose)));
    };
    const setPrince = (pose: PrincePose) => {
      if (section.dataset.prince === pose) return;
      section.dataset.prince = pose; showPose(prince, princePoses, pose);
      Object.assign(q(".niveora-snowcap--prince").style, boxStyle(poseBox(niveoraScene, "prince", pose)));
    };
    const placePrince = (x = niveoraScene.stages.prince.x, facing: "left" | "right" = "left") => {
      const shift = x - niveoraScene.stages.prince.x;
      prince.style.setProperty("--prince-shift", `${shift}%`);
      prince.dataset.facing = facing;
      if (trailStarted === null) { Object.assign(princeButton.style, boxStyle(HOTSPOTS.prince)); return; }
      const box = poseBox(niveoraScene, "prince", section.dataset.prince ?? "stand");
      const left = facing === "right" ? 2 * niveoraScene.stages.prince.x - box.left - box.width : box.left;
      Object.assign(princeButton.style, boxStyle({ ...box, left: left + shift }));
    };
    const setCapsule = (state: Capsule) => { capsule.dataset.capsule = state; if (capsuleButton) capsuleButton.hidden = state === "hidden"; };
    const busy = () => stage !== "idle";
    const later = (run: () => void, ms: number) => timers.push({ due: actorTime + ms, run });
    const clearTimers = () => { timers = []; };
    const toUV = (x: number, y: number): UV => { const box = plane.getBoundingClientRect(); return { u: (x - box.left) / box.width, v: (y - box.top) / box.height }; };
    const say = (text: string, ms = 2800) => {
      clearTimeout(statusTimer);
      status.textContent = text;
      gsap.fromTo(status, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .3, ease: "steps(3)", overwrite: true });
      statusTimer = window.setTimeout(() => gsap.to(status, { autoAlpha: 0, duration: .3, ease: "steps(3)", onComplete: () => { status.textContent = ""; } }), ms);
    };
    const settle = () => {
      clearTimers();
      greetingStarted = null;
      snow.prism(false);
      delete section.dataset.aurora; delete crystal.dataset.on;
      trailStarted = null; placePrince(); setStage("idle");
      const rest = ambientPoses(actorTime, { storm, gust: gustActive });
      setPose(rest.glaucia); setPrince(rest.prince); placePrince();
      if (resetPending) { resetPending = false; capsuleFound.current = false; setCapsule("hidden"); hideTracks(); }
    };
    const start = (next: Stage) => { if (busy()) return false; setStage(next); return true; };
    const hideTracks = () => { clearTimeout(fadeTracks); tracks.forEach((element) => { delete element.dataset.on; }); };

    const resetMemory = () => {
      if (busy()) { resetPending = true; return; }
      capsuleFound.current = false; setCapsule("hidden"); hideTracks();
    };
    addEventListener(RESET_EVENT, resetMemory);
    const stopMemory = subscribeFound(() => {
      const known = capsuleKnown(getFoundSnapshot());
      if (!known) { if (capsuleFound.current) resetMemory(); return; }
      capsuleFound.current = known;
      if (stage !== "capsule") setCapsule(known ? "found" : "hidden");
    });

    // Intro: the copy rises once the boot overlay has gone, and the explorers materialise in the snow.
    setPose("idle"); setPrince("stand"); setStage("idle"); setCapsule(capsuleFound.current ? "found" : "hidden"); writeTemp();
    hotspots.forEach((button) => { button.hidden = button.dataset.hot === "capsule" && !capsuleFound.current; });
    const intro = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
      .from(".niveora-copy > *", { autoAlpha: 0, y: 24, duration: .8, stagger: .08 })
      .from(".hero-hud > *", { autoAlpha: 0, duration: .4, stagger: { each: .06, from: "random" }, ease: "steps(3)" }, "<")
      .fromTo([crew, prince], { filter: "brightness(3) saturate(0)" }, { filter: "brightness(1) saturate(1)", duration: .9, ease: "steps(6)", clearProps: "filter" }, "<");
    const cancelIntro = whenBootDone(() => intro.play());

    // ——— Prince: sniffs, leaves a trail of paw prints and digs out the memory capsule ———
    const pawTracks = () => {
      if (busy()) return;
      if (capsuleFound.current) {
        discover("paw-tracks");
        setStage("greeting"); greetingStarted = actorTime; shakeStarted = null;
        play("woof"); say(labels.status.found); return;
      }
      if (!start("tracks")) return;
      hideTracks();
      trailStarted = actorTime; stamped = 0; revealed = false; shakeStarted = null;
      setPrince("sniff-down-a"); placePrince(); play("woof"); buzz([20, 30, 20]);
      say(labels.status.tracks);
      snow.puff(pct(SPOTS.princeFeet), 10);
    };

    // ——— Glaucia: kneels by the capsule, which opens and hands her the career records ———
    const memoryCapsule = () => {
      if (!start("capsule")) return;
      discover("memory-capsule");
      capsuleFound.current = true;
      const reveal = capsule.dataset.capsule === "hidden";
      if (reveal) { setCapsule("found"); snow.puff(pct(SPOTS.capsuleTop), 18); }
      later(() => { setPose("capsule"); snow.puff(pct(SPOTS.hands), 8); }, reveal ? 450 : 150);
      later(() => {
        setCapsule("open"); play("capsule"); buzz([30, 40, 60]);
        snow.embers(pct(SPOTS.capsuleMouth), 28); snow.beam(pct(SPOTS.capsuleMouth), pct(SPOTS.hands), 1.6);
        say(labels.status.capsule);
      }, reveal ? 900 : 600);
      later(() => { if (document.querySelector("dialog.capsule")) dispatchEvent(new Event(CAPSULE_OPEN)); else closed(); }, reveal ? 2000 : 1700);
    };
    const closed = () => {
      if (stage !== "capsule") return;
      clearTimers();
      setPose("cheer"); play("success");
      snow.burst(pct(SPOTS.hands), 24);
      later(() => { setCapsule("found"); settle(); }, 1800);
    };

    // ——— The crystal: refracts a beam into the sky and the aurora flares in every colour ———
    const auroraPrism = () => {
      if (!start("prism")) return;
      discover("aurora-prism");
      section.dataset.aurora = "prism"; crystal.dataset.on = "true"; play("aurora"); buzz([20, 40, 20]);
      snow.burst(pct(SPOTS.crystalTip), 30);
      snow.beam(pct(SPOTS.crystalTip), pct(SPOTS.sky), 3.2);
      later(() => snow.prism(true, pct(SPOTS.crystalTip)), 400);
      say(labels.status.prism, 3200);
      later(settle, PRISM_MS);
    };

    // ——— The weather station: a whiteout over the whole page, with a button (and Esc) to calm the wind ———
    const tempTo = (value: number, duration: number) => gsap.to(degrees, { value, duration, ease: "steps(12)", onUpdate: writeTemp, overwrite: true });
    const calmDown = () => {
      if (!storm) return;
      storm = false; clearStorm();
      shakePending = true;
      snow.blizzard(false); tempTo(TEMP, 2.4);
      page.dataset.whiteout = "ending";
      calm.hidden = true;
      stormLater(() => { if (page.dataset.whiteout === "ending") delete page.dataset.whiteout; }, 1400);
      dispatchEvent(new Event(STORM_END_EVENT));
      say(labels.status.calm);
    };
    const whiteout = () => {
      if (storm) return;
      storm = true; discover("whiteout");
      shakePending = false; shakeStarted = null;
      page.dataset.whiteout = "true"; station.dataset.on = "true";
      snow.blizzard(true); snow.gust(); tempTo(TEMP_STORM, 3);
      [0, 900, 2000, 3400, 5000].forEach((delay) => stormLater(() => play("gust"), delay));
      buzz([60, 80, 60]);
      calm.hidden = false;
      say(labels.status.whiteout);
      stormLater(() => { delete station.dataset.on; }, 1600);
      stormLater(() => dispatchEvent(new Event(FREEZE_EVENT)), 2500);
      stormLater(calmDown, WHITEOUT_MS);
    };

    // One active clock for all new acting. No pose loops, movement or delayed shake advance offscreen.
    const act = (now: number) => {
      if (!active || disposed) return;
      actorTime += previousFrame ? Math.min(100, now - previousFrame) : 0;
      previousFrame = now;
      for (const timer of [...timers]) {
        if (timer.due > actorTime || !timers.includes(timer)) continue;
        timers.splice(timers.indexOf(timer), 1); timer.run();
      }
      const rest = ambientPoses(actorTime, { storm, gust: gustActive, wag: !busy() && (hovered || focused) });
      if (stage !== "capsule") setPose(rest.glaucia);
      if (trailStarted !== null) {
        const frame = trailSample(actorTime - trailStarted);
        const changedPose = section.dataset.prince !== frame.pose;
        setPrince(frame.pose); placePrince(frame.x, frame.facing);
        section.dataset.trail = frame.phase;
        while (stamped < frame.tracks) {
          // Place the print underneath the leading paw at its contact frame, in plate coordinates.
          const contact = trailSample(WALK_START + (stamped + 1) * STEP_MS - 1);
          const box = poseBox(niveoraScene, "prince", contact.pose);
          const u = box.left + contact.x - niveoraScene.stages.prince.x + box.width * .2;
          const v = contact.y - .4;
          const element = tracks[stamped++];
          element.style.left = `calc(${u}% - ${element.style.width} / 2)`;
          element.style.top = `calc(${v}% - ${element.style.height})`;
          element.dataset.on = "true"; snow.puff(pct({ u, v }), 7); play("pawstep");
        }
        if (frame.phase === "dig" && changedPose) snow.puff(pct(SPOTS.capsuleTop), 3);
        if (frame.revealed && !revealed) {
          revealed = true; capsuleFound.current = true;
          if (!resetPending) discover("paw-tracks");
          setCapsule("found"); play("beacon"); buzz(40);
          snow.puff(pct(SPOTS.capsuleTop), 18); snow.burst(pct(SPOTS.capsuleTop), 26); say(labels.status.found);
        }
        if (frame.phase === "done") {
          delete section.dataset.trail; settle();
          fadeTracks = window.setTimeout(hideTracks, TRACKS_FADE_MS);
        }
      } else if (greetingStarted !== null) {
        const frame = greetingSample(actorTime - greetingStarted);
        setPrince(storm ? rest.prince : frame.pose); placePrince();
        if (frame.done) settle();
      } else {
        if (shakePending && !busy() && !storm) { shakePending = false; shakeStarted = actorTime; }
        if (shakeStarted !== null && !storm) {
          const age = actorTime - shakeStarted;
          const pose = Math.floor(age / 140) % 2 ? "shake-b" : "shake-a";
          if (section.dataset.prince !== pose) snow.puff(pct({ u: niveoraScene.stages.prince.x, v: niveoraScene.stages.prince.y - 9 }), 9);
          setPrince(pose);
          if (age >= 840) { shakeStarted = null; setPrince(rest.prince); }
        } else setPrince(rest.prince);
        placePrince();
      }
      actorRaf = requestAnimationFrame(act);
    };
    const stopActivity = observeMotionActivity(layer, (on) => {
      active = on; layer.dataset.paused = String(!on);
      cancelAnimationFrame(actorRaf); previousFrame = 0;
      if (on) { snow.start(); actorRaf = requestAnimationFrame(act); } else snow.stop();
    });

    // Breath in the cold: a little cloud every few seconds, quicker in the blizzard (only while she stands still).
    let breathIn = 3;
    const breathing = window.setInterval(() => {
      if (layer.dataset.paused === "true" || section.dataset.pose !== "idle") return;
      breathIn -= .4;
      if (breathIn > 0) return;
      breathIn = storm ? 1.6 : 4 + Math.random();
      snow.breath(pct(SPOTS.mouth));
    }, 400);

    // Pointer: the aurora leans towards it.
    const move = (event: PointerEvent) => { if (fine) snow.pointer(toUV(event.clientX, event.clientY)); };
    const leave = () => snow.pointer(null);

    // Three taps on the thermometer call the storm too (touch screens).
    let taps: number[] = [];
    const tapReadout = () => {
      const now = performance.now();
      taps = [...taps.filter((time) => now - time < 1400), now];
      if (taps.length >= 3) { taps = []; emitEgg("whiteout"); }
    };

    // Replays from the star radio, and the same phrases typed straight onto the page.
    const replays: Record<string, () => void> = { "paw-tracks": pawTracks, "memory-capsule": memoryCapsule, whiteout, "aurora-prism": auroraPrism };
    let buffer = "";
    const typed = (event: KeyboardEvent) => {
      if (event.key === "Escape") { calmDown(); return; }
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1 || (event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true'], dialog")) return;
      buffer = (buffer + normalizePhrase(event.key)).slice(-24);
      const id = matchTail(buffer, ABOUT_EGGS);
      if (id) { buffer = ""; emitEgg(id); }
    };

    const actions: Record<string, () => void> = { glaucia: memoryCapsule, capsule: memoryCapsule, prince: pawTracks, crystal: auroraPrism, station: whiteout };
    const onHot = (event: Event) => actions[(event.currentTarget as HTMLElement).dataset.hot!]?.();
    const enterPrince = (event: PointerEvent) => { if (event.pointerType !== "touch") hovered = true; };
    const leavePrince = () => { hovered = false; };
    const focusPrince = () => { focused = princeButton.matches(":focus-visible"); };
    const blurPrince = () => { focused = false; };
    princeButton.addEventListener("pointerenter", enterPrince);
    princeButton.addEventListener("pointerleave", leavePrince);
    princeButton.addEventListener("focus", focusPrince);
    princeButton.addEventListener("blur", blurPrince);
    hotspots.forEach((button) => button.addEventListener("click", onHot));
    readout.addEventListener("click", tapReadout);
    calm.addEventListener("click", calmDown);
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerleave", leave);
    addEventListener(CAPSULE_CLOSED, closed);
    addEventListener("keydown", typed);
    const stopEggs = onEgg(HERO_EGGS, (id) => void (id === "whiteout" ? Promise.resolve() : bringIntoView(section)).then(() => { if (!disposed) replays[id]?.(); }));

    // Wide screens: push into the snowfield, then a blizzard of snow and aurora into the next chapter while pinned.
    let jump: ReturnType<typeof createBlizzardJump> | null = null;
    if (overlay) {
      jump = createBlizzardJump(jumpCanvas.current!);
      const state = { progress: 0 };
      const zoom = [q(".page-hero__image"), ...sceneLayers];
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "+=120%", pin: true, scrub: .8, anticipatePin: 1, refreshPriority: 1 },
      })
        .to(zoom, { scale: 1.28, transformOrigin: "80% 66%", duration: .6 }, 0)
        .fromTo(".niveora-copy", { yPercent: 0, autoAlpha: 1 }, { yPercent: -18, autoAlpha: 0, duration: .32 }, 0)
        .fromTo(".hero-hud", { autoAlpha: 1 }, { autoAlpha: 0, duration: .2 }, 0)
        .to(".page-hero__shade", { autoAlpha: .2, duration: .4 }, 0)
        .to(jumpCanvas.current, { autoAlpha: 1, duration: .1 }, .42)
        .to(state, { progress: 1, duration: .5, onUpdate: () => jump?.set(state.progress) }, .42)
        .to(".hero-jump__label", { autoAlpha: 1, letterSpacing: ".6em", duration: .2 }, .55)
        .to(".hero-jump__flash", { autoAlpha: 1, duration: .06 }, .9)
        .to(".hero-jump__flash", { autoAlpha: 0, duration: .04 }, .96);
    } else {
      gsap.fromTo(".niveora-copy", { yPercent: 0, autoAlpha: 1 }, { yPercent: -10, autoAlpha: .2, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });
    }
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      disposed = true; active = false; cancelAnimationFrame(actorRaf);
      cancelIntro(); stopActivity(); snow.destroy(); jump?.destroy();
      clearTimers(); stopEggs(); stopMemory(); removeEventListener(RESET_EVENT, resetMemory); clearTimeout(statusTimer); clearTimeout(fadeTracks); clearStorm(); storm = false;
      clearInterval(breathing);
      const animated = [status, crew, prince, degrees];
      gsap.killTweensOf(animated);
      gsap.set([status, crew, prince], { clearProps: "all" });
      status.textContent = ""; degrees.value = TEMP; writeTemp();
      hideTracks();
      for (const key of ["stage", "pose", "prince", "aurora", "trail"]) delete section.dataset[key];
      delete crew.dataset.acting; delete prince.dataset.acting; delete prince.dataset.facing;
      prince.style.removeProperty("--prince-shift");
      [...crewPoses, ...princePoses].forEach((element) => { delete element.dataset.active; });
      Object.assign(princeButton.style, boxStyle(HOTSPOTS.prince));
      princeButton.removeEventListener("pointerenter", enterPrince);
      princeButton.removeEventListener("pointerleave", leavePrince);
      princeButton.removeEventListener("focus", focusPrince);
      princeButton.removeEventListener("blur", blurPrince);
      delete capsule.dataset.capsule; delete station.dataset.on; delete page.dataset.whiteout;
      delete crystal.dataset.on;
      calm.hidden = true;
      hotspots.forEach((button) => { button.hidden = true; button.removeEventListener("click", onHot); });
      readout.removeEventListener("click", tapReadout);
      calm.removeEventListener("click", calmDown);
      section.removeEventListener("pointermove", move); section.removeEventListener("pointerleave", leave);
      removeEventListener(CAPSULE_CLOSED, closed); removeEventListener("keydown", typed);
      leave();
    };
  }, { scope: hero, dependencies: [motion, overlay, fine], revertOnUpdate: true });

  return <>
    <section ref={hero} className="page-hero home-hero-v2 niveora-hero" aria-labelledby={labelledBy} data-motion={motion}>
      {children}
      <span className="sky-vignette" aria-hidden="true" />
      <p className="niveora-status" role="status" aria-live="polite" />
      <p className="sky-touch-hint" aria-hidden="true"><span />{labels.touch}</p>
      <div className="hero-jump hero-jump--niveora" aria-hidden="true">
        <canvas ref={jumpCanvas} className="hero-jump__canvas" />
        <p className="hero-jump__label">{labels.jump}</p>
        <span className="hero-jump__flash" />
      </div>
    </section>
    {/* Outside the pinned hero, so the storm covers the whole viewport. */}
    <div className="niveora-whiteout" aria-hidden="true">
      <span className="niveora-whiteout__fog" />
      <span className="niveora-whiteout__streaks" />
      <span className="niveora-whiteout__snow niveora-whiteout__snow--far" />
      <span className="niveora-whiteout__snow niveora-whiteout__snow--mid" />
      <span className="niveora-whiteout__snow niveora-whiteout__snow--near" />
      <span className="niveora-whiteout__frost" />
    </div>
    <button ref={calmButton} type="button" className="niveora-calm" hidden><span aria-hidden="true" />{labels.calm}</button>
  </>;
}
