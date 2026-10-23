"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, DESKTOP, FINE_POINTER, SCRAMBLE_CHARS } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { whenBootDone } from "@/lib/boot";
import { play } from "@/lib/sfx";
import { createForceParticles } from "./force-particles";
import { createHyperspace } from "./hyperspace";

const INTERACTIVE = "a, button, input, select, textarea, label";
const DEPTH_PARALLAX = [0, 8, 14, 22];

// Server markup arrives as children; this island only adds the Force, the intro and the jump.
export function HeroMotion({ children, jumpLabel, labelledBy }: { children: ReactNode; jumpLabel: string; labelledBy: string }) {
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

    const particles = createForceParticles(particleCanvas.current!, {
      palm: () => { const box = glow?.getBoundingClientRect(); return box ? { x: box.right, y: box.top + box.height * .75 } : null; },
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
    const push = (event: PointerEvent) => {
      if ((event.target as Element).closest(INTERACTIVE) || event.button !== 0) return;
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
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerleave", leave);
    section.addEventListener("pointerdown", push);

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
      section.removeEventListener("pointermove", move); section.removeEventListener("pointerleave", leave); section.removeEventListener("pointerdown", push);
      section.querySelectorAll(".force-wave").forEach((wave) => wave.remove());
      leave();
    };
  }, { scope: hero, dependencies: [motion, desktop, fine], revertOnUpdate: true });

  return <section ref={hero} className="page-hero home-hero-v2" aria-labelledby={labelledBy} data-motion={motion}>
    {children}
    <canvas ref={particleCanvas} className="force-particles" aria-hidden="true" />
    <div className="hero-jump" aria-hidden="true">
      <canvas ref={jumpCanvas} className="hero-jump__canvas" />
      <p className="hero-jump__label">{jumpLabel}</p>
      <span className="hero-jump__flash" />
    </div>
  </section>;
}
