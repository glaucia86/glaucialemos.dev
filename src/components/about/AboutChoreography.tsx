"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, useGSAP, DESKTOP } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { play } from "@/lib/sfx";

const ERA_PARAM = "era";

function focusEra(ops: HTMLElement, era: string, updateUrl: boolean) {
  const section = era === "all" ? null : ops.querySelector<HTMLElement>(`.ops-era[data-era="${era}"]`);
  const target = section ? era : "all";
  ops.dataset.focus = target;
  ops.querySelectorAll<HTMLButtonElement>(".ops-filter button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.era === target)));
  const x = section ? Number(section.style.getPropertyValue("--x")) : 0;
  const w = section ? Number(section.style.getPropertyValue("--w")) : 1;
  const pad = section ? w * .06 : 0;
  ops.style.setProperty("--zf", String(Math.max(0, x - pad)));
  ops.style.setProperty("--zs", String(Math.min(1, w + pad * 2)));
  ops.dispatchEvent(new Event("ops:focus"));
  if (!updateUrl) return;
  const url = new URL(location.href);
  if (target === "all") url.searchParams.delete(ERA_PARAM); else url.searchParams.set(ERA_PARAM, target);
  history.replaceState(history.state, "", url);
}

// Nivéora chapters below the hero. Shared reveals come from HomeChoreography on the same page.
export function AboutChoreography() {
  const motion = useMotionEnabled();
  const desktop = useMediaQuery(DESKTOP);

  // Stage filter and crystal badges are plain UI: they work with or without motion.
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".about-page");
    const ops = page?.querySelector<HTMLElement>("[data-ops]");
    const filter = ops?.querySelector<HTMLElement>(".ops-filter");
    if (!page || !ops || !filter) return;
    filter.hidden = false;
    const click = (event: MouseEvent) => {
      const target = event.target as Element;
      const era = target.closest<HTMLButtonElement>(".ops-filter button[data-era]");
      if (era) focusEra(ops, era.dataset.era!, true);
      const badge = target.closest<HTMLButtonElement>(".badge");
      if (badge) { badge.setAttribute("aria-pressed", String(badge.getAttribute("aria-pressed") !== "true")); play("blip"); }
    };
    page.addEventListener("click", click);
    focusEra(ops, new URLSearchParams(location.search).get(ERA_PARAM) ?? "all", false);
    return () => { filter.hidden = true; page.removeEventListener("click", click); };
  }, []);

  useGSAP(() => {
    const page = document.querySelector<HTMLElement>(".about-page");
    const ops = page?.querySelector<HTMLElement>("[data-ops]");
    if (!page || !ops) return;
    const cleanups: (() => void)[] = [];
    const roles = gsap.utils.toArray<HTMLElement>(".ops-role", ops);
    const lightAll = () => roles.forEach((role) => { role.dataset.lit = "true"; });
    if (!motion) { lightAll(); return () => roles.forEach((role) => delete role.dataset.lit); }

    // Expedition log: the portrait arrives frozen; the ice cracks and shatters the first time it is seen.
    const card = page.querySelector<HTMLElement>(".log-card");
    if (card) {
      const cracks = card.querySelector(".log-ice__cracks");
      card.dataset.frozen = "true";
      gsap.timeline({ scrollTrigger: { trigger: card, start: "top 62%", once: true }, onComplete: () => { card.dataset.frozen = "thawed"; } })
        .fromTo(cracks, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: .5, ease: "power2.in" })
        .to(card.querySelector(".log-card__frame"), { keyframes: { x: [-5, 5, -3, 0] }, duration: .25, ease: "none" }, ">-.1")
        .call(() => play("ice"))
        .to(card.querySelectorAll(".log-ice__shards polygon"), {
          x: () => gsap.utils.random(-140, 140), y: () => gsap.utils.random(40, 220), rotation: () => gsap.utils.random(-140, 140),
          autoAlpha: 0, transformOrigin: "50% 50%", duration: () => gsap.utils.random(.6, 1.1), ease: "power2.in", stagger: { each: .006, from: "center" },
        }, "<")
        .to(cracks, { autoAlpha: 0, duration: .15 }, "<");
      cleanups.push(() => { delete card.dataset.frozen; });
    }

    // Expedition call: the ship lifts off the polar station when the last chapter comes into view.
    const credits = page.querySelector<HTMLElement>(".chapter--expedition");
    if (credits) {
      ScrollTrigger.create({ trigger: credits, start: "top 70%", once: true, onEnter: () => { credits.dataset.launch = "true"; play("launch"); } });
      cleanups.push(() => { delete credits.dataset.launch; });
    }

    // Crossing map: the ship crosses the timeline with the scroll and lights each stretch it reaches.
    if (desktop) {
      const ship = ops.querySelector<HTMLElement>(".ops-ship");
      const year = ops.querySelector<HTMLElement>(".ops-ship__year");
      const min = Number(ops.dataset.min); const span = Number(ops.dataset.span);
      let last = 0;
      const update = (progress: number) => {
        last = progress;
        const zf = Number(ops.style.getPropertyValue("--zf")) || 0; const zs = Number(ops.style.getPropertyValue("--zs")) || 1;
        ops.style.setProperty("--progress", progress.toFixed(4));
        if (year) year.textContent = String(Math.floor((min + (zf + progress * zs) * span - 1e-6) / 12));
        roles.forEach((role) => { role.dataset.lit = String(progress + .005 >= (Number(role.style.getPropertyValue("--x")) - zf) / zs); });
      };
      gsap.set(ship, { autoAlpha: 1 });
      const beam = { progress: 0 };
      update(0);
      gsap.to(beam, { progress: 1, ease: "none", onUpdate: () => update(beam.progress), scrollTrigger: { trigger: ops.querySelector(".ops-chart"), start: "top 72%", end: "bottom 62%", scrub: .5 } });
      const refocus = () => update(last);
      ops.addEventListener("ops:focus", refocus);
      cleanups.push(() => ops.removeEventListener("ops:focus", refocus));
      // Positioned children: animate the bars and labels, never the static era wrappers.
      gsap.from(ops.querySelectorAll(".ops-role__bar"), { scaleX: 0, transformOrigin: "0 50%", stagger: .05, duration: .6, ease: "power3.out", scrollTrigger: { trigger: ops, start: "top 80%", once: true } });
      gsap.from(ops.querySelectorAll(".ops-tick"), { autoAlpha: 0, y: 10, stagger: .04, duration: .5, ease: "power2.out", scrollTrigger: { trigger: ops, start: "top 85%", once: true } });
      cleanups.push(() => { ops.style.removeProperty("--progress"); gsap.set(ship, { clearProps: "all" }); });
    } else {
      lightAll();
      gsap.from(gsap.utils.toArray(".ops-era", ops), { y: 40, autoAlpha: 0, stagger: .12, duration: .8, ease: "power3.out", scrollTrigger: { trigger: ops, start: "top 80%", once: true } });
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { cleanups.forEach((cleanup) => cleanup()); roles.forEach((role) => delete role.dataset.lit); };
  }, { dependencies: [motion, desktop], revertOnUpdate: true });

  return null;
}
