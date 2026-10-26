"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { discover, emitEgg, getFoundSnapshot, onEgg, subscribeReset } from "@/lib/eggs";
import { journey } from "@/lib/journey-constellation";
import { useDiscoveries } from "@/lib/use-discoveries";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { gsap, ScrollTrigger, useGSAP, HERO_OVERLAY, FINE_POINTER } from "@/lib/gsap";
import { play } from "@/lib/sfx";
import { BEATS, CORE, CUES, DEPTH, STAR, cablePath, floatingFrame, poseStyle, starDelays, starNote, STATIC_FRAME, type DepthLayer, type OrbitActor, type OrbitPose } from "@/lib/beyond-orbit";
import { createVeil, type Veil } from "./veil-engine";
import { createVeilJump } from "./veil-jump";
import { createStardust } from "./stardust-text";

const COORDINATE_CHARS = "0123456789°′″+-.";
const ACTOR_IDS = ["glaucia", "prince"] as const;

// Server content is visible until motion is enabled after hydration. The same discovery snapshot handles revisits,
// local resets and cross-tab updates. With motion, the last star plays "A Última Luz", a ~28 s sequence that the
// visitor can skip at any time (button, Esc, wheel or touch); it always lands on the same static final state.
export function BeyondOrbitMotion({ children, finale: ending, ambient, overlays, skip, hint }: { children: ReactNode; finale: ReactNode; ambient: ReactNode; overlays: ReactNode; skip: string; hint: string }) {
  const enabled = useMotionEnabled();
  const overlay = useMediaQuery(HERO_OVERLAY);
  const fine = useMediaQuery(FINE_POINTER);
  const revealed = useDiscoveries().includes("last-light");
  const root = useRef<HTMLDivElement>(null);
  const finale = useRef<HTMLDivElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);
  const veil = useRef<Veil | null>(null);
  const pin = useRef<ScrollTrigger | null>(null);

  // The wide-screen frame fills the screen below the menu: keep its real height in --bo-header.
  useEffect(() => {
    const page = root.current?.closest<HTMLElement>(".beyond-orbit");
    const menu = document.querySelector<HTMLElement>(".site-header");
    if (!page || !menu) return;
    const sync = () => page.style.setProperty("--bo-header", `${menu.offsetHeight}px`);
    const observer = new ResizeObserver(sync);
    observer.observe(menu);
    sync();
    return () => observer.disconnect();
  }, []);

  // Zero-gravity drift of Glaucia and Prince, with the hoses following the backpack pivots.
  useGSAP(() => {
    const element = root.current;
    const plane = element?.querySelector<HTMLElement>(".beyond-orbit__scene");
    if (!element || !plane || !enabled) return;
    const actors = ACTOR_IDS.map(actor => ({
      actor,
      node: element.querySelector<HTMLElement>(`[data-orbit-actor="${actor}"]`)!,
      cables: element.querySelectorAll<SVGPathElement>(`[data-cable="${actor}"]`),
    }));
    let width = plane.clientWidth;
    let height = plane.clientHeight;
    let visible = false;
    const clock = { seconds: 0 };
    const paint = (frame = floatingFrame(clock.seconds)) => {
      for (const { actor, node, cables } of actors) {
        const drift = frame[actor];
        node.style.transform = `translate(${drift.x / 100 * width}px, ${drift.y / 100 * height}px) rotate(${drift.angle}deg)`;
        const path = cablePath(actor, drift);
        cables.forEach(cable => cable.setAttribute("d", path));
      }
    };
    const float = gsap.to(clock, { seconds: 120, duration: 120, repeat: -1, ease: "none", paused: true, onUpdate: paint });
    const sync = () => {
      const running = visible && !document.hidden;
      float.paused(!running);
      element.dataset.floating = running ? "running" : "paused";
    };
    const view = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .05 });
    const size = new ResizeObserver(() => { width = plane.clientWidth; height = plane.clientHeight; paint(); });
    view.observe(plane); size.observe(plane);
    document.addEventListener("visibilitychange", sync);
    return () => {
      view.disconnect(); size.disconnect(); document.removeEventListener("visibilitychange", sync);
      float.kill(); paint(STATIC_FRAME);
      delete element.dataset.floating;
      actors.forEach(({ node }) => node.style.removeProperty("transform"));
    };
  }, { scope: root, dependencies: [enabled], revertOnUpdate: true });

  // Ambient life: pixel sky, pointer camera, stardust under the cursor, a rare change of pose, decoding coordinates.
  useEffect(() => {
    const element = root.current;
    const scene = element?.querySelector<HTMLElement>(".beyond-orbit__scene");
    if (!element || !scene || !enabled) return;
    element.dataset.motion = "on";
    const engine = createVeil({
      back: scene.querySelector<HTMLCanvasElement>('[data-canvas="back"]')!, front: scene.querySelector<HTMLCanvasElement>('[data-canvas="front"]')!,
      core: CORE, lite: !fine || innerWidth < 760,
    });
    veil.current = engine;
    const stopActivity = observeMotionActivity(scene, active => active ? engine.start() : engine.stop());
    const cleanups: (() => void)[] = [stopActivity];

    const layers = [...element.querySelectorAll<HTMLElement>("[data-depth]")].map(layer => {
      const depth = DEPTH[layer.dataset.depth as DepthLayer] ?? 0;
      return { depth, x: gsap.quickTo(layer, "x", { duration: 1.4, ease: "power3" }), y: gsap.quickTo(layer, "y", { duration: 1.4, ease: "power3" }) };
    });
    const aim = (u: number, v: number) => layers.forEach(layer => { layer.x((.5 - u) * layer.depth * 18); layer.y((.5 - v) * layer.depth * 12); });
    if (fine) {
      const uv = (event: PointerEvent) => { const box = scene.getBoundingClientRect(); return { u: (event.clientX - box.left) / box.width, v: (event.clientY - box.top) / box.height }; };
      const move = (event: PointerEvent) => { const point = uv(event); aim(point.u, point.v); engine.pointer(point); };
      const leave = () => { aim(.5, .5); engine.pointer(null); };
      scene.addEventListener("pointermove", move); scene.addEventListener("pointerleave", leave);
      cleanups.push(() => { scene.removeEventListener("pointermove", move); scene.removeEventListener("pointerleave", leave); });
    } else {
      // Touch screens: the camera drifts on its own, slowly, like a ship holding station.
      const drift = { t: 0 };
      const tween = gsap.to(drift, { t: Math.PI * 2, duration: 40, repeat: -1, ease: "none", onUpdate: () => aim(.5 + Math.sin(drift.t) * .35, .5 + Math.sin(drift.t * 2) * .25) });
      cleanups.push(() => tween.kill());
    }
    // Touching the Veil away from the star leaves a small burst of possibility.
    const spark = (event: PointerEvent) => {
      if ((event.target as Element).closest("button, a") || element.dataset.theater) return;
      const box = scene.getBoundingClientRect();
      engine.sparks({ u: (event.clientX - box.left) / box.width, v: (event.clientY - box.top) / box.height }, 18, 34);
      play("star-ping", { detune: starNote(Math.floor(Math.random() * 10)), gain: .6 });
    };
    scene.addEventListener("pointerdown", spark);
    cleanups.push(() => scene.removeEventListener("pointerdown", spark));

    // Now and then one of them shifts in the suit (reserve poses of the approved sheets), then settles.
    let poseTimer = 0; let settleTimer = 0;
    const fidget = () => {
      poseTimer = window.setTimeout(() => {
        if (!element.dataset.theater && !document.hidden) {
          const actor = Math.random() > .5 ? "glaucia" : "prince";
          setPose(element, actor, "float-b");
          settleTimer = window.setTimeout(() => { if (!element.dataset.theater) setPose(element, actor, "float-idle"); }, 1600);
        }
        fidget();
      }, 9000 + Math.random() * 6000);
    };
    fidget();
    cleanups.push(() => { window.clearTimeout(poseTimer); window.clearTimeout(settleTimer); ACTOR_IDS.forEach(actor => setPose(element, actor, "float-idle")); });

    const hero = element.closest(".beyond-orbit__hero");
    const eyebrow = hero?.querySelector<HTMLElement>(".beyond-orbit__eyebrow");
    const coordinates = hero?.querySelector<HTMLElement>(".beyond-orbit__coords");
    if (eyebrow) gsap.to(eyebrow, { duration: 1.6, delay: .5, scrambleText: { text: "{original}", chars: COORDINATE_CHARS, speed: .5, revealDelay: .4 } });
    let tick = 0;
    if (coordinates) {
      const original = coordinates.textContent ?? "";
      const scan = () => {
        const seconds = () => String(Math.floor(Math.random() * 60)).padStart(2, "0");
        const text = original.replace(/\d\d(?=s)/, seconds()).replace(/\d\d(?=″)/, seconds());
        gsap.to(coordinates, { duration: .9, scrambleText: { text, chars: COORDINATE_CHARS, speed: .8 } });
      };
      tick = window.setInterval(() => { if (!document.hidden) scan(); }, 4200);
      cleanups.push(() => { window.clearInterval(tick); gsap.killTweensOf(coordinates); coordinates.textContent = original; });
    }
    if (eyebrow) cleanups.push(() => { gsap.killTweensOf(eyebrow); });

    return () => {
      cleanups.forEach(cleanup => cleanup());
      layers.forEach(layer => { layer.x(0); layer.y(0); });
      gsap.set(element.querySelectorAll("[data-depth]"), { clearProps: "x,y" });
      engine.destroy(); veil.current = null;
      delete element.dataset.motion;
    };
  }, [enabled, fine]);

  // Wide screens: the hero pins and the camera dives into the Veil between the two of them, then pulls back out.
  useGSAP(() => {
    const element = root.current;
    const hero = element?.closest<HTMLElement>(".beyond-orbit__hero");
    if (!element || !hero || !enabled || !overlay) return;
    const jump = createVeilJump(element.querySelector<HTMLCanvasElement>('[data-canvas="jump"]')!, CORE);
    const layer = (depth: DepthLayer) => element.querySelector<HTMLElement>(`[data-depth="${depth}"]`);
    let dove = false;
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        // Pinned right below the sticky menu, so the frame (100svh minus the menu) is seen whole.
        trigger: hero, start: () => `top top+=${headerHeight()}`, end: "+=200%", pin: true, scrub: .8, anticipatePin: 1, refreshPriority: 1, invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          jump.set(progress);
          if (progress > .6 && !dove) { dove = true; play("dive"); }
          if (progress < .4) dove = false;
        },
      },
    });
    pin.current = timeline.scrollTrigger ?? null;
    const origin = `${CORE.u * 100}% ${CORE.v * 100}%`;
    timeline
      .to(hero.querySelector(".beyond-orbit__copy"), { xPercent: -25, autoAlpha: 0, filter: "blur(6px)", duration: .22 }, 0)
      .to(element, { "--dive-bars": "12%", duration: .3 }, 0)
      .to(layer("plate"), { scale: 1.55, transformOrigin: origin, duration: .62, ease: "power2.in" }, 0)
      .to(layer("back"), { scale: 1.8, transformOrigin: origin, duration: .62, ease: "power2.in" }, 0)
      .to(layer("crew"), { scale: 2.8, transformOrigin: "72% 62%", autoAlpha: 0, duration: .48, ease: "power2.in" }, 0)
      .to(layer("front"), { scale: 3.2, transformOrigin: "50% 50%", autoAlpha: 0, duration: .42, ease: "power2.in" }, 0)
      .to([layer("plate"), layer("back")], { scale: 1, duration: .3, ease: "power2.out" }, .7)
      .to([layer("crew"), layer("front")], { scale: 1, autoAlpha: 1, duration: .3, ease: "power2.out" }, .7)
      .to(element, { "--dive-bars": "0%", "--charge": 1, duration: .3 }, .7)
      .to(hero.querySelector(".beyond-orbit__copy"), { xPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: .2 }, .8);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => { jump.destroy(); pin.current = null; };
  }, { dependencies: [enabled, overlay], revertOnUpdate: true });

  // "A Última Luz".
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const scene = element.querySelector<HTMLElement>(".beyond-orbit__frame")!;
    const star = element.querySelector<HTMLButtonElement>(".beyond-orbit__star")!;
    const stardust = dust.current ? createStardust(dust.current) : null;
    let timeline: gsap.core.Timeline | null = null;
    let animations: Animation[] = [];
    const touched: Element[] = [];

    const finish = () => {
      timeline?.kill(); timeline = null;
      animations.forEach(animation => animation.cancel()); animations = [];
      stardust?.clear();
      veil.current?.release(); veil.current?.dim(1);
      // Only what the director animated: the flare keeps its server-rendered position.
      if (touched.length) gsap.set(touched, { clearProps: "transform,opacity,filter,visibility,stroke-dasharray,stroke-dashoffset" });
      gsap.set(element.querySelectorAll(".beyond-orbit__sprite"), { "--tilt": "0deg" });
      ACTOR_IDS.forEach(actor => setPose(element, actor, "float-idle"));
      element.querySelectorAll("[data-on]").forEach(node => node.removeAttribute("data-on"));
      element.querySelector(".beyond-orbit__roll-track")?.replaceChildren();
      for (const key of ["theater", "beat", "react"]) delete element.dataset[key];
      removeListeners();
    };
    const skipOnInput = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      finish();
    };
    const listen = () => {
      window.addEventListener("keydown", skipOnInput);
      window.addEventListener("wheel", skipOnInput, { passive: true });
      window.addEventListener("touchmove", skipOnInput, { passive: true });
    };
    const removeListeners = () => {
      window.removeEventListener("keydown", skipOnInput);
      window.removeEventListener("wheel", skipOnInput);
      window.removeEventListener("touchmove", skipOnInput);
    };

    const direct = () => {
      finish();
      const q = <T extends Element = HTMLElement>(selector: string) => element.querySelector<T>(selector)!;
      const camera = q(".beyond-orbit__camera"); const art = q(".beyond-orbit__art"); const flash = q(".beyond-orbit__flash");
      const flare = q(".beyond-orbit__flare"); const rays = q(".beyond-orbit__rays"); const breath = q(".beyond-orbit__breath");
      const red = q('[data-channel="red"]'); const cyan = q('[data-channel="cyan"]');
      const track = q(".beyond-orbit__roll-track"); const continued = q(".beyond-orbit__continued"); const postscript = q(".beyond-orbit__postscript");
      const journeyPath = element.querySelector<SVGPathElement>(".beyond-orbit__journey");
      // Stars light in the order the secrets were found, including the last light itself.
      const lit = journey(getFoundSnapshot().split(",")).path
        .map(point => element.querySelector<SVGRectElement>(`[data-node="${point.id}"]`)).filter((node): node is SVGRectElement => Boolean(node));
      const sprites = [...element.querySelectorAll<HTMLElement>(".beyond-orbit__sprite")];
      touched.splice(0, touched.length, camera, art, flash, flare, rays, breath, red, cyan, track, ...(journeyPath ? [journeyPath] : []));
      const engine = () => veil.current;
      // The credits live in the voyage below the hero; the roll shows a copy without the voyage's scroll styles.
      const page = element.closest("main") ?? document;
      const at = (time: number, action: () => void) => timeline!.call(action, [], time);
      const beat = (name: string) => () => { element.dataset.beat = name; };

      // Bring the scene to the centre of the screen; on wide screens, back to the start of the pinned dive.
      if (pin.current) window.scrollTo({ top: pin.current.start, behavior: "smooth" });
      else scene.scrollIntoView({ behavior: "smooth", block: "center" });
      element.dataset.theater = "on";
      listen();
      engine()?.start();

      // The finale stays transparent until the title lands (this is also the animation the browser tests watch).
      const fade = finale.current?.animate([{ opacity: 0 }, { opacity: 0, offset: .97 }, { opacity: 1 }], { duration: (BEATS.slam + .1) * 1000, easing: "linear" });
      if (fade) animations.push(fade);

      timeline = gsap.timeline({ onComplete: finish });
      for (const cue of CUES) at(cue.at, () => play(cue.sound, { gain: cue.gain, detune: cue.detune }));
      // 1. Implosion: light falls into the star while the camera leans in.
      at(BEATS.implode, () => { beat("implode")(); engine()?.implode(STAR, BEATS.nova - BEATS.implode); engine()?.dim(.45); });
      timeline.fromTo(camera, { scale: 1 }, { scale: 1.07, transformOrigin: `${STAR.u * 100}% ${STAR.v * 100}%`, duration: BEATS.nova, ease: "power2.in" }, 0);
      at(BEATS.hush, beat("hush"));
      // 2. Supernova: flash, shockwave, shake, chromatic split, anamorphic flare, rays.
      at(BEATS.nova, () => {
        beat("nova")();
        const engineNow = engine();
        engineNow?.release(); engineNow?.dim(1); engineNow?.shockwave(STAR); engineNow?.sparks(STAR, 110, 120);
      });
      timeline
        .fromTo(flash, { opacity: 0 }, { opacity: 1, duration: .05 }, BEATS.nova)
        .to(flash, { opacity: 0, duration: 1.2, ease: "power2.out" }, BEATS.nova + .08)
        .to(camera, { scale: 1, duration: 1.6, ease: "expo.out" }, BEATS.nova)
        .fromTo(camera, { x: 0, y: 0 }, { keyframes: shake(14, 10), duration: .9, ease: "none" }, BEATS.nova)
        .fromTo(red, { opacity: 0, x: 0 }, { opacity: .9, x: 12, duration: .06 }, BEATS.nova)
        .to(red, { opacity: 0, x: 0, duration: .7, ease: "power2.out" }, BEATS.nova + .1)
        .fromTo(cyan, { opacity: 0, x: 0 }, { opacity: .9, x: -12, duration: .06 }, BEATS.nova)
        .to(cyan, { opacity: 0, x: 0, duration: .7, ease: "power2.out" }, BEATS.nova + .1)
        .fromTo(flare, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: .3, ease: "expo.out" }, BEATS.nova)
        .to(flare, { scaleX: 1.5, opacity: 0, duration: 2, ease: "power2.out" }, BEATS.nova + .4)
        .fromTo(rays, { scale: 1, opacity: .12 }, { scale: 1.8, opacity: .55, duration: .4, ease: "expo.out" }, BEATS.nova)
        .to(rays, { scale: 1.1, opacity: .2, duration: 3, ease: "power2.out" }, BEATS.nova + .4);
      // 3. The Veil opens: one breath of light travels out of the core and threads branch to the edges.
      at(BEATS.bloom, () => { beat("bloom")(); engine()?.threads(18, 1); });
      timeline
        .fromTo(breath, { "--r": "0%", opacity: 1 }, { "--r": "150%", duration: 2.4, ease: "power1.out" }, BEATS.bloom)
        .to(breath, { opacity: 0, duration: 1.2 }, BEATS.bloom + 1.8);
      // 4. Glaucia and Prince answer the light: rim light, a turn toward each other, a heart over Prince.
      at(BEATS.react, () => { element.dataset.react = "on"; setPose(element, "glaucia", "float-b"); setPose(element, "prince", "float-b"); });
      at(BEATS.react + .9, () => { setPose(element, "glaucia", "float-c"); setPose(element, "prince", "float-d"); });
      at(BEATS.react + 1.9, () => ACTOR_IDS.forEach(actor => setPose(element, actor, "float-idle")));
      timeline.to(sprites, { "--tilt": "5deg", duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, BEATS.react);
      // 5. The journey's constellation: each discovery lights with a note of the arpeggio and the path is drawn.
      at(BEATS.constellation, beat("constellation"));
      const delays = starDelays(lit.length);
      lit.forEach((node, index) => at(BEATS.constellation + .3 + delays[index], () => {
        node.setAttribute("data-on", "");
        play("star-ping", { detune: starNote(index) });
      }));
      if (journeyPath && lit.length > 1) timeline.fromTo(journeyPath, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: Math.max(.4, delays.at(-1) ?? 0), ease: "none" }, BEATS.constellation + .3);
      // 6. "To be continued…": stardust flies from the star into the letters, the text crashes in from the camera
      // (zoom in), lands with a jolt while the Veil dolly-zooms behind it, then keeps breathing in and out.
      at(BEATS.title, () => {
        beat("title")();
        const box = star.getBoundingClientRect();
        stardust?.form({ x: box.left + box.width / 2, y: box.top + box.height / 2 }, continued, BEATS.slam - BEATS.title);
      });
      at(BEATS.slam, () => {
        beat("slam")();
        animations.push(continued.animate([
          { transform: "scale(7)", filter: "blur(14px)", opacity: 0, letterSpacing: ".5em" },
          { transform: "scale(.92)", filter: "blur(0)", opacity: 1, letterSpacing: ".02em", offset: .55 },
          { transform: "scale(1.06)", offset: .78 },
          { transform: "scale(1)", letterSpacing: ".02em" },
        ], { duration: 1500, easing: "cubic-bezier(.2,.9,.2,1)" }));
        animations.push(continued.animate([{ transform: "scale(1)" }, { transform: "scale(1.045)" }], { duration: 2600, delay: 1500, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }));
      });
      timeline
        .fromTo(flash, { opacity: 0 }, { opacity: .35, duration: .05 }, BEATS.slam + .75)
        .to(flash, { opacity: 0, duration: .6 }, BEATS.slam + .8)
        .fromTo(camera, { x: 0, y: 0 }, { keyframes: shake(6, 6), duration: .5, ease: "none" }, BEATS.slam + .75)
        .fromTo(art, { scale: 1 }, { scale: 1.14, transformOrigin: `${CORE.u * 100}% ${CORE.v * 100}%`, duration: 4, ease: "sine.inOut" }, BEATS.slam + .75);
      at(BEATS.postscript, () => {
        beat("postscript")();
        animations.push(postscript.animate([{ opacity: 0, filter: "blur(8px)", transform: "translateY(10px)" }, { opacity: 1, filter: "blur(0)", transform: "none" }], { duration: 1400, easing: "ease-out", fill: "backwards" }));
      });
      // 7. Credits roll inside the letterbox: an aria-hidden copy of the real list below.
      at(BEATS.credits, () => {
        beat("credits")();
        const reel = page.querySelector(".beyond-orbit__credit-reel");
        if (reel) track.replaceChildren(clean(reel));
        animations.push(continued.animate([{ transform: "scale(1)" }, { transform: "scale(.55)", opacity: .2 }], { duration: 1600, easing: "ease-in", fill: "forwards" }));
      });
      timeline.fromTo(track, { yPercent: 0, y: () => scene.clientHeight }, { yPercent: -100, y: 0, duration: BEATS.post - BEATS.credits - .4, ease: "none" }, BEATS.credits);
      // 8. Post-credits: black, then an intercepted transmission with the next coordinates.
      at(BEATS.post, () => {
        beat("post")();
        const post = page.querySelector(".beyond-orbit__post");
        if (!post) return;
        const copy = clean(post);
        track.replaceChildren(copy);
        gsap.set(track, { yPercent: 0, y: 0 });
        copy.querySelectorAll<HTMLElement>("h3, p, li").forEach((line, index) => {
          const text = line.textContent ?? "";
          line.textContent = "";
          gsap.to(line, { delay: .6 + index * .5, duration: 1, scrambleText: { text, chars: "█▓▒░<>/\\|=+*#01", speed: .6 } });
        });
      });
      at(BEATS.end, () => undefined);
    };

    const startStar = () => emitEgg("last-light");
    star.addEventListener("click", startStar);
    const stop = onEgg("last-light", () => {
      discover("last-light");
      if (enabled) direct();
    });
    const stopReset = subscribeReset(finish);
    const skipButton = element.querySelector<HTMLButtonElement>(".beyond-orbit__skip");
    skipButton?.addEventListener("click", finish);
    return () => {
      star.removeEventListener("click", startStar); skipButton?.removeEventListener("click", finish);
      stop(); stopReset(); finish(); stardust?.destroy();
    };
  }, [enabled]);

  return <div ref={root} className="beyond-orbit__experience" data-revealed={revealed || undefined}>
    {ambient}
    <span className="beyond-orbit__curtain" aria-hidden="true" />
    <div className="beyond-orbit__frame">
      <div className="beyond-orbit__scene">{children}</div>
      {overlays}
      {!revealed && <p className="beyond-orbit__hint"><b aria-hidden="true" />{hint}</p>}
      <button type="button" className="beyond-orbit__skip">{skip}</button>
    </div>
    <div ref={finale} id="epilogue-finale" className="beyond-orbit__finale" data-waiting={enabled && !revealed || undefined} aria-live="polite">
      {ending}
    </div>
    <canvas ref={dust} className="beyond-orbit__dust" aria-hidden="true" />
  </div>;
}

const headerHeight = () => document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;

// Swap to one of the approved poses; every pose keeps the backpack pivot, so the hose stays attached.
function setPose(element: HTMLElement, actor: OrbitActor, pose: OrbitPose) {
  const sprite = element.querySelector<HTMLElement>(`[data-orbit-actor="${actor}"] .beyond-orbit__sprite`);
  if (!sprite) return;
  const box = poseStyle(actor, pose);
  Object.assign(sprite.style, { left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%`, backgroundImage: `url(${box.src})` });
  sprite.style.setProperty("--sprite", `url(${box.src})`);
}

function clean(node: Element) {
  const copy = node.cloneNode(true) as HTMLElement;
  copy.removeAttribute("style");
  copy.querySelectorAll("[style]").forEach((child) => child.removeAttribute("style"));
  copy.querySelectorAll("[id]").forEach((child) => child.removeAttribute("id"));
  return copy;
}

// Decaying camera shake as GSAP keyframes.
function shake(x: number, y: number, steps = 10) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const decay = 1 - index / steps;
    return { x: index === steps ? 0 : (Math.random() - .5) * 2 * x * decay, y: index === steps ? 0 : (Math.random() - .5) * 2 * y * decay };
  });
}
