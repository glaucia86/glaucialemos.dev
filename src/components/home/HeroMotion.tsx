"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, DESKTOP, FINE_POINTER, SCRAMBLE_CHARS } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { whenBootDone } from "@/lib/boot";
import { play } from "@/lib/sfx";
import { bringIntoView, discover, onEgg } from "@/lib/eggs";
import { createForceParticles } from "./force-particles";
import { createHyperspace } from "./hyperspace";

const INTERACTIVE = "a, button, input, select, textarea, label";
const DEPTH_PARALLAX = [0, 8, 14, 22];
const HOLD_MS = 450;
const XWING_MS = 2000;
const FLASH = "brightness(6) saturate(0)";
type ForceStage = "idle" | "charging" | "force" | "xwing";

// Server markup arrives as children; this island only adds the Force, the intro and the jump.
export function HeroMotion({ children, jumpLabel, forceLabel, touchLabel, labelledBy }: { children: ReactNode; jumpLabel: string; forceLabel: string; touchLabel: string; labelledBy: string }) {
  const hero = useRef<HTMLElement>(null);
  const particleCanvas = useRef<HTMLCanvasElement>(null);
  const jumpCanvas = useRef<HTMLCanvasElement>(null);
  const motion = useMotionEnabled();
  const desktop = useMediaQuery(DESKTOP);
  const fine = useMediaQuery(FINE_POINTER);

  useGSAP(() => {
    const section = hero.current;
    if (!section || !motion) return;
    const layer = section.querySelector<HTMLElement>(".hero-scene-layer")!;
    const rocks = gsap.utils.toArray<HTMLElement>(".force-rock", section).filter((rock) => rock.offsetParent !== null);
    const pushes = rocks.map((rock) => rock.querySelector<HTMLElement>(".force-rock__push")!);
    const glow = section.querySelector<HTMLElement>(".force-glow");
    const glowPalm = () => { const box = glow?.getBoundingClientRect(); return box ? [{ x: box.right, y: box.top + box.height * .75 }] : []; };
    let palmsOf = glowPalm;

    const particles = createForceParticles(particleCanvas.current!, {
      palms: () => palmsOf(),
      targets: () => rocks.map((rock) => { const box = rock.getBoundingClientRect(); return { x: box.left + box.width / 2, y: box.top + box.height / 2 }; }),
    });
    const stopActivity = observeMotionActivity(layer, (active) => {
      layer.dataset.paused = String(!active);
      if (active) particles.start(); else particles.stop();
    });

    // Signal acquired: the name decodes once the boot overlay has gone.
    const lines = gsap.utils.toArray<HTMLElement>(".hero-name__line", section);
    const intro = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
      .from(".hero-copy .chapter-tag", { autoAlpha: 0, x: -24, duration: .5 })
      .to(lines, { duration: 1.1, stagger: .18, scrambleText: { text: "{original}", chars: SCRAMBLE_CHARS, speed: .7, revealDelay: .25 } }, "<.05")
      .from(lines, { autoAlpha: 0, duration: .2, stagger: .18 }, "<")
      .from(".hero-copy :is(.hero-role, .page-hero__subtitle, .actions)", { autoAlpha: 0, y: 24, duration: .7, stagger: .1 }, "-=.7")
      .from(".hero-hud > *", { autoAlpha: 0, duration: .4, stagger: { each: .06, from: "random" }, ease: "steps(3)" }, "<")
      .from(rocks, { y: 60, autoAlpha: 0, duration: 1.2, stagger: .05, ease: "back.out(1.6)" }, "<");
    const cancelIntro = whenBootDone(() => intro.play());

    // The Force: rocks drift with depth parallax and part around the pointer.
    const toX = rocks.map((rock) => gsap.quickTo(rock, "x", { duration: .9, ease: "power3" }));
    const toY = rocks.map((rock) => gsap.quickTo(rock, "y", { duration: .9, ease: "power3" }));
    const move = (event: PointerEvent) => {
      if (!fine) return;
      const box = section.getBoundingClientRect();
      const nx = (event.clientX - box.left) / box.width - .5;
      const ny = (event.clientY - box.top) / box.height - .5;
      section.style.setProperty("--pointer-x", `${nx * 12}px`);
      section.style.setProperty("--pointer-y", `${ny * 8}px`);
      rocks.forEach((rock, index) => {
        const depth = DEPTH_PARALLAX[Number(rock.dataset.depth) || 1];
        const rect = rock.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - (gsap.getProperty(rock, "x") as number);
        const cy = rect.top + rect.height / 2 - (gsap.getProperty(rock, "y") as number);
        const dx = cx - event.clientX; const dy = cy - event.clientY;
        const distance = Math.hypot(dx, dy) || 1;
        const force = Math.max(0, 1 - distance / 170) ** 2 * 70;
        toX[index](nx * depth + dx / distance * force);
        toY[index](ny * depth + dy / distance * force);
      });
    };
    const leave = () => { section.style.setProperty("--pointer-x", "0px"); section.style.setProperty("--pointer-y", "0px"); toX.forEach((to) => to(0)); toY.forEach((to) => to(0)); };

    // Force push: a pixel shockwave, a burst of particles and every rock thrown back.
    const push = (event: { clientX: number; clientY: number }) => {
      discover("force-push");
      const box = section.getBoundingClientRect();
      const wave = document.createElement("span");
      wave.className = "force-wave";
      wave.style.left = `${event.clientX - box.left}px`; wave.style.top = `${event.clientY - box.top}px`;
      section.appendChild(wave);
      gsap.fromTo(wave, { scale: .1, autoAlpha: 1 }, { scale: 7, autoAlpha: 0, duration: .9, ease: "power2.out", onComplete: () => wave.remove() });
      gsap.to(layer, { keyframes: { x: [-7, 6, -4, 3, -1, 0] }, duration: .4, ease: "none", overwrite: "auto" });
      particles.burst({ x: event.clientX, y: event.clientY });
      play("push");
      pushes.forEach((element, index) => {
        const rect = rocks[index].getBoundingClientRect();
        const dx = rect.left + rect.width / 2 - event.clientX; const dy = rect.top + rect.height / 2 - event.clientY;
        const distance = Math.hypot(dx, dy) || 1;
        const strength = Math.max(.25, 1 - distance / 700) * 160;
        gsap.timeline({ overwrite: true })
          .to(element, { x: dx / distance * strength, y: dy / distance * strength - 40, rotation: gsap.utils.random(-90, 90), duration: .35, ease: "power3.out" })
          .to(element, { x: 0, y: 0, rotation: 0, duration: 1.8, ease: "elastic.out(1, .35)" });
      });
    };
    // The Force, held: charging → Yoda powers up → an X-wing rises from the swamp.
    const pose = section.querySelector<HTMLElement>(".yoda-force")!;
    const aura = pose.querySelector(".yoda-force__aura");
    const robe = pose.querySelector(".yoda-force__robe");
    const earLeft = pose.querySelector(".yoda-force__ear--left");
    const earRight = pose.querySelector(".yoda-force__ear--right");
    const posePalms = gsap.utils.toArray<HTMLElement>(".force-palm--pose", section);
    const ship = section.querySelector<SVGSVGElement>(".swamp-xwing")!;
    const ripples = section.querySelector<HTMLElement>(".swamp-ripples")!;
    const rings = gsap.utils.toArray<HTMLElement>("i", ripples);
    const meter = section.querySelector<HTMLElement>(".force-meter__bar i");
    let stage: ForceStage = "idle";
    let press: { x: number; y: number } | null = null;
    let timers: number[] = [];
    let loops: gsap.core.Animation[] = [];
    const setStage = (next: ForceStage) => { stage = next; section.dataset.forceStage = next; };
    const later = (callback: () => void, ms: number) => timers.push(window.setTimeout(callback, ms));
    const clearTimers = () => { timers.forEach((timer) => { clearTimeout(timer); clearInterval(timer); }); timers = []; };
    const stopLoops = () => { loops.forEach((loop) => loop.kill()); loops = []; };
    const centre = (element: Element) => { const box = element.getBoundingClientRect(); return { x: box.left + box.width / 2, y: box.top + box.height / 2 }; };
    palmsOf = () => posePalms.map(centre);
    const ring = (point: { x: number; y: number }, scale: number) => {
      const box = section.getBoundingClientRect();
      const wave = document.createElement("span");
      wave.className = "force-wave";
      wave.style.left = `${point.x - box.left}px`; wave.style.top = `${point.y - box.top}px`;
      section.appendChild(wave);
      gsap.fromTo(wave, { scale: .1, autoAlpha: 1 }, { scale, autoAlpha: 0, duration: .9, ease: "power2.out", onComplete: () => wave.remove() });
    };
    const charge = (on: boolean) => gsap.to(posePalms, { opacity: on ? 1 : .4, scale: on ? 1.6 : 1, duration: on ? .25 : .5, ease: on ? "power2.out" : "power2.in", overwrite: true });

    const raiseXwing = () => {
      setStage("xwing");
      play("rumble");
      particles.splash(centre(ripples), 50);
      loops.push(gsap.fromTo(rings, { scale: .2, autoAlpha: .9 }, { scale: 2.4, autoAlpha: 0, duration: 1.4, stagger: .35, repeat: -1, ease: "power1.out" }));
      gsap.fromTo(ship, { yPercent: 115, y: 0, rotation: 7 }, { yPercent: -190, rotation: -2, duration: 1.9, ease: "power2.out", overwrite: true });
      loops.push(gsap.to(ship, { y: -8, rotation: 2, duration: 1.1, delay: 1.9, repeat: -1, yoyo: true, ease: "sine.inOut" }));
      timers.push(window.setInterval(() => {
        const box = ship.getBoundingClientRect();
        particles.drip({ x: box.left + box.width * (.15 + Math.random() * .7), y: box.top + box.height * (.55 + Math.random() * .35) });
      }, 70));
      loops.filter((loop) => loop.data === "orbit").forEach((loop) => loop.timeScale(2.2));
    };

    const enterForce = () => {
      press = null;
      discover("force-hold");
      setStage("force");
      layer.dataset.levitating = "true";
      play("levitate");
      particles.intensify(true);
      charge(false);
      gsap.timeline()
        .fromTo(pose, { filter: FLASH }, { filter: "brightness(1.15) saturate(1.2)", duration: .36, ease: "steps(4)" })
        .to(pose, { y: -5, duration: .35, ease: "back.out(3)" }, 0);
      ring(centre(pose), 5);
      gsap.to(layer, { keyframes: { x: [-6, 5, -3, 2, 0] }, duration: .35, ease: "none", overwrite: "auto" });
      loops.push(
        gsap.fromTo(aura, { opacity: .35, scale: .95 }, { opacity: .95, scale: 1.07, duration: .7, repeat: -1, yoyo: true, ease: "sine.inOut" }),
        gsap.fromTo(posePalms, { opacity: .5, scale: .8 }, { opacity: 1, scale: 1.9, duration: .45, repeat: -1, yoyo: true, ease: "sine.inOut" }),
        gsap.timeline({ repeat: -1, defaults: { ease: "steps(2)" } }).to(earRight, { rotation: -12, duration: .14 }).to(earRight, { rotation: 3, duration: .4 }).to(earRight, { rotation: -5, duration: .5 }),
        gsap.timeline({ repeat: -1, delay: .1, defaults: { ease: "steps(2)" } }).to(earLeft, { rotation: 10, duration: .14 }).to(earLeft, { rotation: -2, duration: .45 }).to(earLeft, { rotation: 4, duration: .5 }),
        gsap.fromTo(robe, { skewX: -1.3 }, { skewX: 1.3, duration: .55, repeat: -1, yoyo: true, ease: "steps(3)" }),
      );
      gsap.to(meter, { scaleX: 1, duration: (XWING_MS - HOLD_MS) / 1000, ease: "none", overwrite: true });
      pushes.forEach((element, index) => {
        const lift = -gsap.utils.random(60, 120);
        gsap.to(element, { x: gsap.utils.random(-18, 18), y: lift, rotation: gsap.utils.random(-30, 30), duration: .9, ease: "power2.out", overwrite: true });
        loops.push(gsap.to(element, { y: lift - 12, duration: gsap.utils.random(.8, 1.3), delay: .9, repeat: -1, yoyo: true, ease: "sine.inOut" }));
        const orbit = gsap.to(element, { x: `+=${index % 2 ? 16 : -16}`, rotation: `+=${index % 2 ? 40 : -40}`, duration: gsap.utils.random(1.4, 2.2), delay: .9, repeat: -1, yoyo: true, ease: "sine.inOut" });
        orbit.data = "orbit";
        loops.push(orbit);
      });
      later(raiseXwing, XWING_MS - HOLD_MS);
    };

    const reset = () => {
      clearTimers(); stopLoops();
      gsap.set([earLeft, earRight, robe], { rotation: 0, skewX: 0 });
      gsap.to(posePalms, { opacity: .4, scale: 1, duration: .3, overwrite: true });
      gsap.to(aura, { opacity: 0, scale: 1, duration: .5, overwrite: true });
      gsap.to(meter, { scaleX: 0, duration: .3, overwrite: true });
      particles.intensify(false);
    };

    const release = () => {
      if (stage !== "force" && stage !== "xwing") return;
      const raised = stage === "xwing";
      reset();
      setStage("idle");
      layer.dataset.levitating = "false";
      play("push");
      posePalms.forEach((palm) => ring(centre(palm), 6));
      gsap.timeline()
        .to(pose, { x: -10, duration: .12, ease: "power2.out" })
        .to(pose, { x: 0, y: 0, duration: .25, ease: "power2.in" })
        .to(pose, { filter: FLASH, duration: .1, ease: "steps(2)" }, "+=.1")
        .to(pose, { filter: "brightness(1) saturate(1)", duration: .3, ease: "steps(3)" });
      gsap.to(layer, { keyframes: { y: [0, 4, -2, 1, 0] }, duration: .45, delay: .35, ease: "none", overwrite: "auto" });
      pushes.forEach((element, index) => gsap.timeline({ delay: index * .03 })
        .to(element, { x: `-=${gsap.utils.random(30, 70)}`, y: "-=30", duration: .2, ease: "power3.out", overwrite: true })
        .to(element, { x: 0, y: 0, rotation: 0, duration: 1.2, ease: "bounce.out" }));
      if (raised) gsap.to(ship, { yPercent: 115, y: 0, rotation: 9, duration: .6, ease: "power3.in", overwrite: true, onComplete: () => {
        play("splash");
        particles.splash(centre(ripples), 90);
        gsap.fromTo(rings, { scale: .2, autoAlpha: 1 }, { scale: 3.2, autoAlpha: 0, duration: 1, stagger: .12, ease: "power2.out" });
      } });
    };

    const cancelPress = () => {
      if (!press) return;
      press = null; clearTimers(); charge(false);
      gsap.to(meter, { scaleX: 0, duration: .2, overwrite: true });
      setStage("idle");
    };
    const down = (event: PointerEvent) => {
      if ((event.target as Element).closest(INTERACTIVE) || event.button !== 0) return;
      cancelPress();
      press = { x: event.clientX, y: event.clientY };
      setStage("charging");
      charge(true);
      gsap.fromTo(meter, { scaleX: 0 }, { scaleX: HOLD_MS / XWING_MS, duration: HOLD_MS / 1000, ease: "none", overwrite: true });
      later(enterForce, HOLD_MS);
    };
    const drag = (event: PointerEvent) => { if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) cancelPress(); };
    const up = (event: PointerEvent) => {
      if (press) { cancelPress(); push(event); return; }
      release();
    };
    const abort = () => { cancelPress(); release(); };
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointermove", drag, { passive: true });
    section.addEventListener("pointerleave", leave);
    section.addEventListener("pointerleave", abort);
    section.addEventListener("pointercancel", abort);
    section.addEventListener("pointerdown", down);
    section.addEventListener("pointerup", up);
    // A long press on touch screens must summon the Force, not the system menu.
    const noMenu = (event: Event) => { if (stage !== "idle") event.preventDefault(); };
    section.addEventListener("contextmenu", noMenu);
    // Replays from the Comlink.
    let replay: number | undefined;
    const stopEggs = onEgg(["force-push", "force-hold"], (id) => void bringIntoView(section).then(() => {
      if (id === "force-push") { const { x, y } = centre(pose); push({ clientX: x - 120, clientY: y }); return; }
      if (stage !== "idle") return;
      enterForce();
      clearTimeout(replay); replay = window.setTimeout(release, 3800);
    }));

    // Desktop camera: push into Dagobah, then jump to hyperspace while pinned.
    let jump: ReturnType<typeof createHyperspace> | null = null;
    if (desktop) {
      jump = createHyperspace(jumpCanvas.current!);
      const state = { progress: 0 };
      const zoom = [section.querySelector(".page-hero__image"), layer, particleCanvas.current];
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "+=120%", pin: true, scrub: .8, anticipatePin: 1, refreshPriority: 1 },
      })
        .to(zoom, { scale: 1.32, transformOrigin: "64% 56%", duration: .6 }, 0)
        .fromTo(".hero-copy", { yPercent: 0, autoAlpha: 1 }, { yPercent: -18, autoAlpha: 0, duration: .32 }, 0)
        .fromTo(".hero-hud", { autoAlpha: 1 }, { autoAlpha: 0, duration: .2 }, 0)
        .to(".page-hero__shade", { autoAlpha: .2, duration: .4 }, 0)
        .to(".dagobah-mist", { opacity: 1, scale: 1.4, duration: .5 }, 0)
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
      cancelIntro(); stopActivity(); particles.destroy(); jump?.destroy();
      clearTimers(); stopLoops();
      gsap.killTweensOf([pose, ship, meter, rings, posePalms, earLeft, earRight, robe, aura]);
      gsap.set([pose, ship, meter, earLeft, earRight, robe, aura, ...rings, ...posePalms], { clearProps: "transform,filter,opacity,visibility" });
      delete layer.dataset.levitating; delete section.dataset.forceStage;
      section.removeEventListener("pointermove", move); section.removeEventListener("pointermove", drag); section.removeEventListener("pointerleave", leave); section.removeEventListener("pointerleave", abort);
      section.removeEventListener("pointercancel", abort); section.removeEventListener("pointerdown", down); section.removeEventListener("pointerup", up);
      section.removeEventListener("contextmenu", noMenu); stopEggs(); clearTimeout(replay);
      section.querySelectorAll(".force-wave").forEach((wave) => wave.remove());
      leave();
    };
  }, { scope: hero, dependencies: [motion, desktop, fine], revertOnUpdate: true });

  return <section ref={hero} className="page-hero home-hero-v2" aria-labelledby={labelledBy} data-motion={motion}>
    {children}
    <canvas ref={particleCanvas} className="force-particles" aria-hidden="true" />
    <span className="force-vignette" aria-hidden="true" />
    <p className="force-meter" aria-hidden="true">{forceLabel}<span className="force-meter__bar"><i /></span></p>
    <p className="force-touch-hint" aria-hidden="true"><span />{touchLabel}</p>
    <div className="hero-jump" aria-hidden="true">
      <canvas ref={jumpCanvas} className="hero-jump__canvas" />
      <p className="hero-jump__label">{jumpLabel}</p>
      <span className="hero-jump__flash" />
    </div>
  </section>;
}
