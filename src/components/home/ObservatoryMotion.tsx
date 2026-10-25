"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, DESKTOP, FINE_POINTER, SCRAMBLE_CHARS } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { whenBootDone } from "@/lib/boot";
import { play } from "@/lib/sfx";
import { bringIntoView, buzz, discover, matchTail, normalizePhrase, onEgg, type EggId } from "@/lib/eggs";
import { createSky, type UV } from "./sky-engine";
import { createHyperspace } from "./hyperspace";
import { LANTERNS, SPOTS, observatory } from "./ObservatoryScene";
import { TELESCOPE_CLOSED, TELESCOPE_OPEN } from "./CareerTelescope";

const INTERACTIVE = "a, button, input, select, textarea, label";
const HOLD_MS = 450;
const COUNT_MS = 560;
const WISHES = 3;
const RELIGHT_MS = 20000;
const HOME_EGGS: EggId[] = ["focus-lens", "launch-charge", "dog-signal", "hangar-check", "dark-sky", "wish"];
type Stage = "idle" | "telescope" | "signal" | "hangar" | "charging" | "countdown" | "launch" | "wish";
type Face = "idle" | "happy" | "joy" | "curious" | "wink";
export type ObservatoryLabels = { jump: string; ignition: string; touch: string; coordinates: string; countdown: [string, string, string, string]; wish: string; lights: string };

const pct = (spot: { u: number; v: number }): UV => ({ u: spot.u / 100, v: spot.v / 100 });
// Lift-off: out of the hangar, down over the terrace (closest to the camera), then a wide climb to the far horizon.
const FLIGHT = [pct(SPOTS.hangarMouth), { u: .88, v: .5 }, { u: .78, v: .58 }, { u: .64, v: .48 }, { u: .52, v: .33 }, { u: .43, v: .23 }];
const flightScale = (t: number) => t < .42 ? .5 + t / .42 * 1.8 : 2.3 - (t - .42) / .58 * 2.15;
// Prince's constellation for a granted wish (plate coordinates).
const PRINCE_STARS = [[-42, -88], [-50, -40], [-20, -62], [20, -62], [42, -88], [50, -40], [0, -14], [-46, 30], [-30, 88], [30, 88], [46, 30], [88, 20], [70, -12]].map(([x, y]) => ({ u: (1030 + x) / 1672, v: (150 + y) / 941 }));
const PRINCE_LINES: [number, number][] = [[0, 1], [0, 2], [2, 3], [3, 4], [4, 5], [1, 6], [5, 6], [1, 7], [7, 8], [8, 9], [9, 10], [10, 5], [10, 11], [11, 12]];

// Distance in screen-like units (the plate is 16:9) and a point along a polyline.
const span = (a: UV, b: UV) => Math.hypot((b.u - a.u) * 16, (b.v - a.v) * 9);
function along(points: UV[], t: number) {
  const total = points.slice(1).reduce((sum, point, index) => sum + span(points[index], point), 0);
  let left = t * total;
  for (let index = 1; index < points.length; index++) {
    const a = points[index - 1]; const b = points[index]; const length = span(a, b);
    if (left <= length || index === points.length - 1) {
      const k = length ? Math.min(1, left / length) : 1;
      return { u: a.u + (b.u - a.u) * k, v: a.v + (b.v - a.v) * k, angle: Math.atan2((b.v - a.v) * 9, (b.u - a.u) * 16) * 180 / Math.PI };
    }
    left -= length;
  }
  return { ...points[0], angle: 0 };
}

// Server markup arrives as children; this island brings the sky and the crew's secrets to life.
export function ObservatoryMotion({ children, labels, labelledBy }: { children: ReactNode; labels: ObservatoryLabels; labelledBy: string }) {
  const hero = useRef<HTMLElement>(null);
  const jumpCanvas = useRef<HTMLCanvasElement>(null);
  const motion = useMotionEnabled();
  const desktop = useMediaQuery(DESKTOP);
  const fine = useMediaQuery(FINE_POINTER);

  useGSAP(() => {
    const section = hero.current;
    if (!section || !motion) return;
    const q = <T extends Element = HTMLElement>(selector: string) => section.querySelector<T>(selector)!;
    const layer = q(".hero-scene-layer");
    const sceneLayers = [layer, q(".observatory-layer")];
    const plane = q(".hero-scene-layer .observatory-plane");
    const crew = q(".observatory-crew");
    const signalStar = q(".observatory-signal-star");
    const signalLabel = q("[data-signal-label]");
    const bubble = q(".observatory-bubble");
    const bubbleFace = q(".observatory-bubble__face");
    const rings = gsap.utils.toArray<HTMLElement>(".observatory-receiver__ring", section);
    const hangar = q(".observatory-hangar");
    const hangarLights = gsap.utils.toArray<HTMLElement>(".observatory-hangar i", section);
    const consoleArt = q(".observatory-console");
    const ship = q(".observatory-ship");
    const countdown = q("[data-countdown]");
    const flash = q(".observatory-flash");
    const meter = q(".ignition-meter__bar i");
    const wishCounter = q(".sky-counter--wish");
    const lightCounter = q(".sky-counter--lights");
    const lanterns = gsap.utils.toArray<HTMLElement>(".observatory-lantern", section);
    const hotspots = gsap.utils.toArray<HTMLButtonElement>(".observatory-hot", section);

    const sky = createSky({ back: q(".observatory-sky--back"), front: q(".observatory-sky--front") });
    const stopActivity = observeMotionActivity(layer, (on) => {
      layer.dataset.paused = String(!on);
      if (on) sky.start(); else sky.stop();
    });

    let stage: Stage = "idle";
    let press: { x: number; y: number } | null = null;
    let timers: number[] = [];
    let loops: gsap.core.Animation[] = [];
    let catches = 0;
    const off = new Set<number>();
    let relight: number | undefined;
    const setStage = (next: Stage) => { stage = next; section.dataset.stage = next; };
    const setPose = (pose: "idle" | "telescope") => { section.dataset.pose = pose; };
    const busy = () => stage !== "idle";
    const later = (callback: () => void, ms: number) => timers.push(window.setTimeout(callback, ms));
    const every = (callback: () => void, ms: number) => timers.push(window.setInterval(callback, ms));
    const clearTimers = () => { timers.forEach((timer) => { clearTimeout(timer); clearInterval(timer); }); timers = []; };
    const stopLoops = () => { loops.forEach((loop) => loop.kill()); loops = []; };
    const toUV = (x: number, y: number): UV => { const box = plane.getBoundingClientRect(); return { u: (x - box.left) / box.width, v: (y - box.top) / box.height }; };
    const face = (name: Face) => { bubbleFace.style.backgroundImage = `url(${observatory.assets.actors.prince[`face-${name}`].src})`; };
    const pop = (element: Element) => gsap.fromTo(element, { autoAlpha: 0, scale: .2 }, { autoAlpha: 1, scale: 1, duration: .45, ease: "back.out(2.4)", overwrite: true });
    const hide = (elements: Element[]) => gsap.to(elements, { autoAlpha: 0, scale: .6, duration: .3, ease: "steps(3)", overwrite: true });
    const say = (name: Face, ms = 2200) => { face(name); pop(bubble); later(() => hide([bubble]), ms); };
    const count = (element: HTMLElement, text: string) => { element.textContent = text; gsap.fromTo(element, { scale: 1.4 }, { scale: 1, duration: .3, ease: "steps(3)" }); };
    const settle = () => {
      clearTimers(); stopLoops();
      hide([signalStar, bubble, countdown]);
      gsap.set(ship, { autoAlpha: 0, overwrite: true });
      gsap.to(meter, { scaleX: 0, duration: .3, overwrite: true });
      gsap.to([hangar, ...hangarLights], { opacity: 0, duration: .4, ease: "steps(3)", overwrite: true });
      delete consoleArt.dataset.on;
      setPose("idle"); setStage("idle");
    };
    const start = (next: Stage) => { if (busy()) return false; setStage(next); return true; };

    // Intro: the name decodes once the boot overlay has gone, and the crew materialises on the terrace.
    setPose("idle"); setStage("idle"); face("idle");
    hotspots.forEach((button) => { button.hidden = false; });
    const lines = gsap.utils.toArray<HTMLElement>(".hero-name__line", section);
    const intro = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
      .from(".hero-copy .chapter-tag", { autoAlpha: 0, x: -24, duration: .5 })
      .to(lines, { duration: 1.1, stagger: .18, scrambleText: { text: "{original}", chars: SCRAMBLE_CHARS, speed: .7, revealDelay: .25 } }, "<.05")
      .from(lines, { autoAlpha: 0, duration: .2, stagger: .18 }, "<")
      .from(".hero-copy :is(.hero-role, .page-hero__subtitle, .actions)", { autoAlpha: 0, y: 24, duration: .7, stagger: .1 }, "-=.7")
      .from(".hero-hud > *", { autoAlpha: 0, duration: .4, stagger: { each: .06, from: "random" }, ease: "steps(3)" }, "<")
      .fromTo(crew, { filter: "brightness(3) saturate(0)" }, { filter: "brightness(1) saturate(1)", duration: .9, ease: "steps(6)", clearProps: "filter" }, "<");
    const cancelIntro = whenBootDone(() => intro.play());

    // ——— Shooting stars: catch three (touch them with the cursor, click or tap) and make a wish ———
    const makeWish = () => {
      catches = 0;
      if (busy()) settle();
      setStage("wish");
      discover("wish");
      play("wish"); buzz([20, 30, 20, 30, 60]);
      sky.constellation(PRINCE_STARS, PRINCE_LINES, 4.5);
      later(() => { say("joy", 3000); play("woof"); sky.hearts(pct(SPOTS.princeHead), 5); }, 900);
      later(() => sky.shower(18), 1600);
      later(() => { wishCounter.textContent = ""; }, 3000);
      later(settle, 7000);
    };
    const caught = () => {
      catches++;
      play("catch");
      count(wishCounter, `${labels.wish} ✦ ${catches}/${WISHES}`);
      if (catches >= WISHES) makeWish();
    };

    // Pointer: the aurora leans towards it, and on a mouse, touching a meteor catches it.
    const move = (event: PointerEvent) => {
      if (!fine) return;
      const uv = toUV(event.clientX, event.clientY);
      sky.pointer(uv);
      if (sky.catchAt(uv, 36)) caught();
    };
    const leave = () => sky.pointer(null);

    // ——— Glaucia: the career telescope ———
    const focusLens = () => {
      if (!start("telescope")) return;
      discover("focus-lens");
      setPose("telescope"); play("lens");
      sky.burst({ u: .69, v: .47 }, 24);
      later(() => { if (document.querySelector("dialog.telescope")) dispatchEvent(new Event(TELESCOPE_OPEN)); else settle(); }, 800);
    };
    const telescopeClosed = () => { if (stage === "telescope") settle(); };

    // ——— Prince: hearts on hover, a signal on click ———
    let petted = 0;
    const pet = () => { const now = performance.now(); if (now - petted < 700 || busy()) return; petted = now; sky.hearts(pct(SPOTS.princeHead), 2); };
    const dogSignal = () => {
      if (!start("signal")) return;
      discover("dog-signal");
      play("woof"); buzz([30, 40, 30]);
      sky.hearts(pct(SPOTS.princeHead), 4);
      say("wink", 3400);
      later(() => {
        play("beacon");
        loops.push(gsap.fromTo(rings, { scale: .3, autoAlpha: .9 }, { scale: 2.6, autoAlpha: 0, duration: 1.1, stagger: .35, repeat: -1, ease: "power1.out" }));
        sky.beam(pct(SPOTS.receiver), pct(SPOTS.signal), 3);
        later(() => {
          pop(signalStar); sky.burst(pct(SPOTS.signal), 30);
          loops.push(gsap.to(signalStar, { scale: 1.25, duration: .5, repeat: -1, yoyo: true, ease: "steps(3)", delay: .45 }));
          gsap.fromTo(signalLabel, { scrambleText: { text: "" } }, { duration: .8, scrambleText: { text: labels.coordinates, chars: SCRAMBLE_CHARS, speed: .8 } });
        }, 600);
      }, 550);
      later(settle, 4200);
    };

    // ——— The hangar: a light check and a peek at the docked ship ———
    const hangarCheck = () => {
      if (!start("hangar")) return;
      discover("hangar-check");
      consoleArt.dataset.on = "true"; play("hangar");
      gsap.timeline()
        .fromTo(hangar, { opacity: 0 }, { keyframes: { opacity: [0, 1, .2, 1, .5, 1] }, duration: 1.1, ease: "steps(6)" })
        .fromTo(hangarLights, { opacity: 0 }, { opacity: 1, duration: .1, stagger: .18, ease: "steps(1)" }, 0)
        .set(ship, { autoAlpha: 1, left: `${SPOTS.hangarMouth.u + 2}%`, top: `${SPOTS.hangarMouth.v}%`, scale: .8, rotation: 0 }, .3)
        .to(ship, { left: `${SPOTS.hangarMouth.u - 1.5}%`, duration: .7, ease: "steps(7)" }, .3)
        .to(ship, { y: -3, duration: .25, repeat: 3, yoyo: true, ease: "steps(2)" })
        .to(ship, { left: `${SPOTS.hangarMouth.u + 2}%`, autoAlpha: 0, duration: .6, ease: "steps(6)" }, "+=.2");
      later(settle, 3000);
    };

    // ——— The lanterns: each one really goes dark; with all four off the Milky Way appears ———
    const showLights = () => { lightCounter.textContent = off.size && off.size < LANTERNS.length ? `${labels.lights} ${off.size}/${LANTERNS.length}` : ""; };
    const darkness = (on: boolean) => {
      if (on) {
        section.dataset.sky = "dark"; sky.dark(true); discover("dark-sky"); play("hush");
        clearTimeout(relight);
        relight = window.setTimeout(() => [...off].forEach((index, order) => setTimeout(() => lantern(index, true), order * 500)), RELIGHT_MS);
      } else if (section.dataset.sky) { delete section.dataset.sky; sky.dark(false); clearTimeout(relight); }
    };
    const lantern = (index: number, quiet = false) => {
      if (off.has(index)) off.delete(index); else off.add(index);
      const dark = off.has(index);
      lanterns[index].dataset.off = String(dark);
      if (!quiet) play("switch");
      const flame = pct(LANTERNS[index]);
      if (dark) sky.smoke({ u: flame.u, v: flame.v - .015 }, 6); else sky.burst(flame, 14);
      showLights();
      if (!quiet) gsap.fromTo(lightCounter, { scale: 1.4 }, { scale: 1, duration: .3, ease: "steps(3)" });
      darkness(off.size === LANTERNS.length);
    };
    const switchAllOff = () => LANTERNS.forEach((_, index) => setTimeout(() => { if (!off.has(index)) lantern(index); }, index * 300));

    // ——— Lift-off: countdown and smoke, a pass over the terrace, then a climb to the far horizon ———
    const launch = () => {
      setStage("launch");
      play("launch"); buzz(120);
      countdown.textContent = labels.countdown[3];
      gsap.to(countdown, { autoAlpha: 0, duration: .5, delay: .5, ease: "steps(3)" });
      gsap.to(sceneLayers, { keyframes: { x: [-6, 6, -4, 4, -2, 0] }, duration: .5, ease: "none", overwrite: "auto" });
      const proxy = { t: 0 };
      let last = FLIGHT[0];
      const fly = () => {
        const point = along(FLIGHT, proxy.t); const scale = flightScale(proxy.t);
        gsap.set(ship, { left: `${point.u * 100}%`, top: `${point.v * 100}%`, rotation: point.angle - 180, scale });
        const back = { u: point.u - Math.cos(point.angle * Math.PI / 180) * .012 * scale, v: point.v - Math.sin(point.angle * Math.PI / 180) * .02 * scale };
        sky.exhaust(back, Math.ceil(2 + scale * 2));
        const steps = Math.ceil(span(last, point) * 50);
        for (let step = 1; step <= steps; step++) sky.trail({ u: last.u + (point.u - last.u) * step / steps, v: last.v + (point.v - last.v) * step / steps }, "#b8fff0", 1.1);
        last = point;
      };
      const end = FLIGHT[FLIGHT.length - 1];
      const flight = gsap.timeline({ onComplete: () => later(settle, 1400) })
        .set(ship, { autoAlpha: 1, scale: .5, y: 0 })
        .to(proxy, { t: 1, duration: 3.2, ease: "sine.inOut", onUpdate: fly })
        .call(() => { play("warp"); sky.burst(end, 40); flash.style.setProperty("--flash-x", `${end.u * 100}%`); flash.style.setProperty("--flash-y", `${end.v * 100}%`); })
        .to(ship, { autoAlpha: 0, scale: .05, duration: .25, ease: "steps(3)" })
        .fromTo(flash, { opacity: .9 }, { opacity: 0, duration: .7, ease: "steps(7)" }, "<");
      loops.push(flight);
    };
    const ignite = () => {
      press = null;
      discover("launch-charge");
      setStage("countdown");
      consoleArt.dataset.on = "true"; play("ignite");
      gsap.fromTo(hangar, { opacity: 0 }, { keyframes: { opacity: [0, 1, .3, 1] }, duration: .6, ease: "steps(4)" });
      gsap.to(hangarLights, { opacity: 1, duration: .1, stagger: .15, ease: "steps(1)" });
      gsap.to(meter, { scaleX: 1, duration: COUNT_MS * 3 / 1000, ease: "none", overwrite: true });
      every(() => sky.smoke(pct(SPOTS.hangarMouth), 3), 70);
      labels.countdown.slice(0, 3).forEach((value, index) => later(() => {
        countdown.textContent = value;
        gsap.fromTo(countdown, { autoAlpha: 1, scale: 1.7 }, { scale: 1, duration: .3, ease: "steps(3)", overwrite: true });
        gsap.to(sceneLayers, { keyframes: { x: [-(index + 1) * 1.5, (index + 1) * 1.5, 0] }, duration: .25, ease: "none", overwrite: "auto" });
        play("blip");
      }, index * COUNT_MS));
      later(() => { clearTimers(); launch(); }, COUNT_MS * 3);
    };

    // ——— Pointer on the sky: catch a meteor, tap for stardust, or hold for lift-off ———
    const cancelPress = () => {
      if (!press) return;
      press = null; clearTimers();
      gsap.to(meter, { scaleX: 0, duration: .2, overwrite: true });
      setStage("idle");
    };
    const down = (event: PointerEvent) => {
      if ((event.target as Element).closest(INTERACTIVE) || event.button !== 0) return;
      if (sky.catchAt(toUV(event.clientX, event.clientY), 48)) { caught(); return; }
      if (busy()) return;
      press = { x: event.clientX, y: event.clientY };
      setStage("charging");
      gsap.fromTo(meter, { scaleX: 0 }, { scaleX: .25, duration: HOLD_MS / 1000, ease: "none", overwrite: true });
      later(ignite, HOLD_MS);
    };
    const drag = (event: PointerEvent) => { if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) cancelPress(); };
    const up = (event: PointerEvent) => {
      if (press) { cancelPress(); sky.burst(toUV(event.clientX, event.clientY), 18); play("twinkle"); return; }
      if (stage === "countdown") { play("error"); settle(); }
    };
    const abort = () => { cancelPress(); if (stage === "countdown") settle(); };
    const noMenu = (event: Event) => { if (stage === "charging" || stage === "countdown") event.preventDefault(); };

    // Replays from the star radio, and the same phrases typed straight onto the page.
    const replays: Record<string, () => void> = {
      "focus-lens": focusLens, "dog-signal": dogSignal, "hangar-check": hangarCheck,
      "launch-charge": () => { if (start("charging")) ignite(); },
      "dark-sky": () => { if (off.size < LANTERNS.length) switchAllOff(); },
      wish: () => { catches = WISHES - 1; caught(); },
    };
    let buffer = "";
    const typed = (event: KeyboardEvent) => {
      if (event.key.length !== 1 || (event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true'], dialog")) return;
      buffer = (buffer + normalizePhrase(event.key)).slice(-24);
      const id = matchTail(buffer, HOME_EGGS);
      if (id) { buffer = ""; replays[id](); }
    };

    const actions: Record<string, () => void> = { glaucia: focusLens, prince: dogSignal, hangar: hangarCheck, console: hangarCheck };
    const onHot = (event: Event) => {
      const key = (event.currentTarget as HTMLElement).dataset.hot!;
      if (key.startsWith("lantern-")) lantern(Number(key.slice(8))); else actions[key]?.();
    };
    const princeButton = hotspots.find((button) => button.dataset.hot === "prince");
    hotspots.forEach((button) => button.addEventListener("click", onHot));
    princeButton?.addEventListener("pointerenter", pet);
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointermove", drag, { passive: true });
    section.addEventListener("pointerleave", leave);
    section.addEventListener("pointerleave", abort);
    section.addEventListener("pointercancel", abort);
    section.addEventListener("pointerdown", down);
    section.addEventListener("pointerup", up);
    section.addEventListener("contextmenu", noMenu);
    addEventListener(TELESCOPE_CLOSED, telescopeClosed);
    addEventListener("keydown", typed);
    const stopEggs = onEgg(HOME_EGGS, (id) => void bringIntoView(section).then(() => replays[id]?.()));

    // Desktop camera: push into the terrace, then streak into the next chapter while pinned.
    let jump: ReturnType<typeof createHyperspace> | null = null;
    if (desktop) {
      jump = createHyperspace(jumpCanvas.current!);
      const state = { progress: 0 };
      const zoom = [q(".page-hero__image"), ...sceneLayers];
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "+=120%", pin: true, scrub: .8, anticipatePin: 1, refreshPriority: 1 },
      })
        .to(zoom, { scale: 1.3, transformOrigin: "78% 62%", duration: .6 }, 0)
        .fromTo(".hero-copy", { yPercent: 0, autoAlpha: 1 }, { yPercent: -18, autoAlpha: 0, duration: .32 }, 0)
        .fromTo(".hero-hud", { autoAlpha: 1 }, { autoAlpha: 0, duration: .2 }, 0)
        .to(".page-hero__shade", { autoAlpha: .2, duration: .4 }, 0)
        .to(jumpCanvas.current, { autoAlpha: 1, duration: .1 }, .42)
        .to(state, { progress: 1, duration: .5, onUpdate: () => jump?.set(state.progress) }, .42)
        .to(".hero-jump__label", { autoAlpha: 1, letterSpacing: ".6em", duration: .2 }, .55)
        .to(".hero-jump__flash", { autoAlpha: 1, duration: .06 }, .9)
        .to(".hero-jump__flash", { autoAlpha: 0, duration: .04 }, .96);
    } else {
      gsap.fromTo(".hero-copy", { yPercent: 0, autoAlpha: 1 }, { yPercent: -10, autoAlpha: .2, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });
    }
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      cancelIntro(); stopActivity(); sky.destroy(); jump?.destroy();
      clearTimers(); stopLoops(); stopEggs(); clearTimeout(relight);
      const animated = [signalStar, signalLabel, bubble, hangar, ...hangarLights, ship, countdown, flash, meter, wishCounter, lightCounter, crew, ...rings];
      gsap.killTweensOf(animated);
      gsap.set(animated, { clearProps: "all" });
      lanterns.forEach((element) => { delete element.dataset.off; });
      wishCounter.textContent = ""; lightCounter.textContent = "";
      for (const key of ["stage", "pose", "sky"]) delete section.dataset[key];
      delete consoleArt.dataset.on;
      hotspots.forEach((button) => { button.hidden = true; button.removeEventListener("click", onHot); });
      princeButton?.removeEventListener("pointerenter", pet);
      section.removeEventListener("pointermove", move); section.removeEventListener("pointermove", drag); section.removeEventListener("pointerleave", leave); section.removeEventListener("pointerleave", abort);
      section.removeEventListener("pointercancel", abort); section.removeEventListener("pointerdown", down); section.removeEventListener("pointerup", up);
      section.removeEventListener("contextmenu", noMenu);
      removeEventListener(TELESCOPE_CLOSED, telescopeClosed); removeEventListener("keydown", typed);
      leave();
    };
  }, { scope: hero, dependencies: [motion, desktop, fine], revertOnUpdate: true });

  return <section ref={hero} className="page-hero home-hero-v2 observatory-hero" aria-labelledby={labelledBy} data-motion={motion}>
    {children}
    <span className="sky-vignette" aria-hidden="true" />
    <div className="sky-counters" aria-live="polite"><p className="sky-counter sky-counter--wish" /><p className="sky-counter sky-counter--lights" /></div>
    <p className="ignition-meter" aria-hidden="true">{labels.ignition}<span className="ignition-meter__bar"><i /></span></p>
    <p className="sky-touch-hint" aria-hidden="true"><span />{labels.touch}</p>
    <div className="hero-jump" aria-hidden="true">
      <canvas ref={jumpCanvas} className="hero-jump__canvas" />
      <p className="hero-jump__label">{labels.jump}</p>
      <span className="hero-jump__flash" />
    </div>
  </section>;
}
