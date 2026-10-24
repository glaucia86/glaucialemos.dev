"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { play } from "@/lib/sfx";
import { useMotionEnabled } from "@/lib/use-motion";
import { leia, leiaArt, LEIA_LAYERS, restPose } from "./leia";

const BLINK_MIN = 3000;
const BLINK_SPREAD = 3000;
const BLINK_MS = 140;
const blizzard = (hero: HTMLElement) => hero.closest<HTMLElement>(".about-page")?.dataset.blizzard === "true";

// Leia draws, the probe dives into her line of fire and one red bolt takes it down; `hit` runs when the bolt lands.
// Without the live layers (no motion, or not loaded yet) the probe simply blows up. Returns a cancel function.
export function leiaShoot(hero: HTMLElement, probe: HTMLElement, hit: () => void) {
  const plane = hero.querySelector<HTMLElement>(".echo-actor");
  if (!plane || !hero.dataset.leia) { hit(); return () => {}; }
  const home = { left: probe.style.left, top: probe.style.top };
  const effects = new Set<Element>();
  let alive = true;
  const spawn = (className: string, x: number, y: number) => {
    const node = Object.assign(document.createElement("span"), { className });
    node.style.cssText = `left:${x}px;top:${y}px`;
    hero.append(node); effects.add(node);
    return node;
  };
  const fire = () => {
    const origin = hero.getBoundingClientRect(); const area = plane.getBoundingClientRect(); const target = probe.getBoundingClientRect();
    const from = { x: area.left - origin.left + leia.muzzle.x / 100 * area.width, y: area.top - origin.top + leia.muzzle.y / 100 * area.height };
    const dx = target.left + target.width / 2 - origin.left - from.x; const dy = target.top + target.height / 2 - origin.top - from.y;
    const length = Math.max(18, area.width * .022);
    const flash = spawn("echo-muzzle", from.x, from.y);
    const bolt = spawn("echo-laser", from.x, from.y);
    bolt.style.width = `${length}px`;
    play("blaster");
    const angle = Math.atan2(dy, dx);
    gsap.fromTo(flash, { scale: .3, autoAlpha: 1 }, { scale: 1.8, autoAlpha: 0, duration: .2, ease: "power2.out", onComplete: () => flash.remove() });
    gsap.set(bolt, { rotation: angle * 180 / Math.PI, transformOrigin: "0% 50%" });
    gsap.fromTo(bolt, { x: 0, y: 0 }, {
      x: dx - Math.cos(angle) * length, y: dy - Math.sin(angle) * length, duration: Math.max(.08, Math.hypot(dx, dy) / 1800), ease: "none",
      onComplete: () => { bolt.remove(); if (alive) hit(); },
    });
    gsap.fromTo(hero.querySelector(".echo-actor__body"), { x: 3 }, { x: 0, duration: .18, ease: "power2.out" });
  };
  const restore = () => {
    probe.style.left = home.left; probe.style.top = home.top; probe.style.animationPlayState = "";
    delete probe.dataset.targeted;
  };

  probe.dataset.targeted = "true"; probe.style.animationPlayState = "paused";
  hero.dataset.leia = "blaster"; delete hero.dataset.blink;
  const scene = gsap.timeline()
    .to(probe, { left: `${leia.muzzle.x - 13}%`, top: `${leia.muzzle.y - 1.5}%`, duration: .45, ease: "power2.inOut" })
    .call(fire, undefined, .5)
    .call(restore, undefined, 1.1)
    .call(() => { hero.dataset.leia = restPose(blizzard(hero)); }, undefined, 1.25);
  return () => {
    if (!scene.isActive()) return;
    alive = false; scene.kill(); gsap.killTweensOf(probe); restore(); effects.forEach((node) => node.remove());
    if (hero.dataset.leia === "blaster") hero.dataset.leia = restPose(blizzard(hero));
  };
}

// Brings Leia to life once the hero is in view: the plate patch hides the painted Leia and the layers take over.
// She breathes, blinks every few seconds, leans into the gusts and shivers through the blizzard (CSS does the motion).
export function LeiaActor() {
  const motion = useMotionEnabled();

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".about-page");
    const hero = page?.querySelector<HTMLElement>("[data-echo-hero]");
    if (!motion || !page || !hero?.querySelector(".echo-actor")) return;
    let cancelled = false;
    let blink: ReturnType<typeof setTimeout> | undefined;
    const nextBlink = () => {
      blink = setTimeout(() => {
        if (hero.dataset.leia === "idle") hero.dataset.blink = "true";
        blink = setTimeout(() => { delete hero.dataset.blink; nextBlink(); }, BLINK_MS);
      }, BLINK_MIN + Math.random() * BLINK_SPREAD);
    };
    const wake = async () => {
      await Promise.all(LEIA_LAYERS.map((name) => { const image = new Image(); image.src = leiaArt(name); return image.decode(); }));
      if (cancelled) return;
      hero.dataset.leia = restPose(blizzard(hero));
      nextBlink();
    };
    const seen = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      seen.disconnect();
      wake().catch(() => {}); // the painted Leia stays if a layer fails to load
    }, { rootMargin: "200px" });
    seen.observe(hero);
    const weather = new MutationObserver(() => { if (hero.dataset.leia && hero.dataset.leia !== "blaster") hero.dataset.leia = restPose(blizzard(hero)); });
    weather.observe(page, { attributes: true, attributeFilter: ["data-blizzard"] });
    return () => {
      cancelled = true; seen.disconnect(); weather.disconnect(); clearTimeout(blink);
      delete hero.dataset.leia; delete hero.dataset.blink;
    };
  }, [motion]);

  return null;
}
