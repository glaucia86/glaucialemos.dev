"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, useGSAP, DESKTOP } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { whenBootDone } from "@/lib/boot";
import { play } from "@/lib/sfx";
import { bringIntoView, buzz, discover, onEgg } from "@/lib/eggs";
import { isNear, isSceneClick } from "./hit";

const ERA_PARAM = "era";
const TEMP_FROM = 32;
const TEMP_DROP = 28;

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

// Echo Base choreography. Shared reveals come from HomeChoreography on the same page.
export function AboutChoreography() {
  const motion = useMotionEnabled();
  const desktop = useMediaQuery(DESKTOP);

  // Era filter, medals and the odds are plain UI: they work with or without motion.
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".about-page");
    const ops = page?.querySelector<HTMLElement>("[data-ops]");
    const filter = ops?.querySelector<HTMLElement>(".ops-filter");
    const odds = page?.querySelector<HTMLButtonElement>(".dossier-odds__toggle");
    if (!page || !ops || !filter) return;
    filter.hidden = false;
    odds?.setAttribute("aria-expanded", "false");
    const click = (event: MouseEvent) => {
      const target = event.target as Element;
      const era = target.closest<HTMLButtonElement>(".ops-filter button[data-era]");
      if (era) focusEra(ops, era.dataset.era!, true);
      const medal = target.closest<HTMLButtonElement>(".medal");
      if (medal) { medal.setAttribute("aria-pressed", String(medal.getAttribute("aria-pressed") !== "true")); play("blip"); }
      if (odds && target.closest(".dossier-odds__toggle")) odds.setAttribute("aria-expanded", String(odds.getAttribute("aria-expanded") !== "true"));
    };
    page.addEventListener("click", click);
    focusEra(ops, new URLSearchParams(location.search).get(ERA_PARAM) ?? "all", false);
    return () => { filter.hidden = true; odds?.removeAttribute("aria-expanded"); page.removeEventListener("click", click); };
  }, []);

  useGSAP(() => {
    const page = document.querySelector<HTMLElement>(".about-page");
    const hero = page?.querySelector<HTMLElement>("[data-echo-hero]");
    const ops = page?.querySelector<HTMLElement>("[data-ops]");
    if (!page || !hero || !ops) return;
    const cleanups: (() => void)[] = [];
    const roles = gsap.utils.toArray<HTMLElement>(".ops-role", ops);
    const lightAll = () => roles.forEach((role) => { role.dataset.lit = "true"; });
    if (!motion) { lightAll(); return () => roles.forEach((role) => delete role.dataset.lit); }

    // Hero entrance, after the transmission intro.
    const copy = hero.querySelectorAll(".echo-copy > *");
    const intro = gsap.timeline({ paused: true })
      .from(copy, { y: 28, autoAlpha: 0, duration: .9, stagger: .08, ease: "power3.out" })
      .from(hero.querySelectorAll(".echo-hud > *"), { autoAlpha: 0, duration: .01, stagger: .06 }, .2);
    cleanups.push(whenBootDone(() => intro.play()));

    // Temperature falls as you go deeper into the archive. Frost creeps in as the hero leaves.
    const temp = hero.querySelector<HTMLElement>("[data-temp]");
    const format = new Intl.NumberFormat(document.documentElement.lang, { maximumFractionDigits: 0 });
    // EchoEggs warms the base by a degree for every probe destroyed.
    let depth = 0;
    const writeTemp = () => { if (temp) temp.textContent = `−${format.format(TEMP_FROM + TEMP_DROP * depth - Number(hero.dataset.warmth ?? 0))} °C`; };
    ScrollTrigger.create({ trigger: page, start: "top top", end: "bottom bottom", onUpdate: ({ progress }) => { depth = progress; writeTemp(); } });
    hero.addEventListener("echo:warm", writeTemp);
    cleanups.push(() => hero.removeEventListener("echo:warm", writeTemp));
    ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", onUpdate: ({ progress }) => hero.style.setProperty("--frost", progress.toFixed(3)) });

    // The ion cannon. Its blast leaves the hero and returns as the trail of the operations map.
    const origin = hero.querySelector<HTMLElement>(".echo-ion");
    const beacon = hero.querySelector<HTMLElement>(".echo-beacon");
    const button = hero.querySelector<HTMLButtonElement>(".echo-ion-button");
    const status = hero.querySelector<HTMLElement>("[data-ion-status]");
    let volley: gsap.core.Timeline | null = null;
    const fire = () => {
      if (!origin || volley?.isActive()) return;
      discover("ion"); buzz([30, 40, 60]);
      volley = gsap.timeline({ onStart: () => { hero.dataset.ion = "firing"; play("ion"); }, onComplete: () => { hero.dataset.ion = "ready"; ops.dataset.armed = "true"; } });
      [0, .38].forEach((at, index) => {
        const bolt = document.createElement("span");
        bolt.className = "echo-ion-bolt";
        const ring = document.createElement("span");
        ring.className = "echo-ion-ring";
        origin.append(bolt, ring);
        volley!
          .fromTo(ring, { scale: .2, autoAlpha: 1 }, { scale: 3.2, autoAlpha: 0, duration: .5, ease: "power2.out" }, at)
          .fromTo(bolt, { scaleY: 0, yPercent: 0, autoAlpha: 1 }, { scaleY: 1, duration: .12, ease: "power4.out" }, at)
          .to(bolt, { yPercent: -110, duration: .55, ease: "power2.in" }, at + .1)
          .to(bolt, { autoAlpha: 0, duration: .15 }, at + .5)
          .fromTo(hero, { x: 0 }, { keyframes: { x: [-7, 6, -3, 0] }, duration: .32, ease: "none", immediateRender: false }, at)
          .call(() => { bolt.remove(); ring.remove(); }, undefined, at + .7);
        if (index === 0) volley!.call(() => { if (status) status.textContent = status.dataset.done ?? ""; }, undefined, at + .2);
      });
    };
    const fromHero = (event: MouseEvent) => { if (isSceneClick(event) && isNear(beacon, event, 5)) fire(); };
    if (button) { button.hidden = false; button.addEventListener("click", fire); }
    hero.addEventListener("click", fromHero);
    const stopIon = onEgg("ion", () => void bringIntoView(hero).then(fire));
    cleanups.push(stopIon);
    const leave = ScrollTrigger.create({ trigger: hero, start: "bottom 35%", once: true, onEnter: () => { if (ops.dataset.armed !== "true") fire(); } });
    cleanups.push(() => {
      if (button) { button.hidden = true; button.removeEventListener("click", fire); }
      hero.removeEventListener("click", fromHero); leave.kill(); volley?.kill();
      origin?.replaceChildren(); delete hero.dataset.ion; delete ops.dataset.armed; hero.style.removeProperty("--frost");
    });

    // Dossier: the portrait arrives frozen; the ice cracks and shatters the first time it is seen.
    const card = page.querySelector<HTMLElement>(".dossier-card");
    if (card) {
      const cracks = card.querySelector(".dossier-ice__cracks");
      card.dataset.frozen = "true";
      gsap.timeline({ scrollTrigger: { trigger: card, start: "top 62%", once: true }, onComplete: () => { card.dataset.frozen = "thawed"; } })
        .fromTo(cracks, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: .5, ease: "power2.in" })
        .to(card.querySelector(".dossier-card__frame"), { keyframes: { x: [-5, 5, -3, 0] }, duration: .25, ease: "none" }, ">-.1")
        .call(() => play("ice"))
        .to(card.querySelectorAll(".dossier-ice__shards polygon"), {
          x: () => gsap.utils.random(-140, 140), y: () => gsap.utils.random(40, 220), rotation: () => gsap.utils.random(-140, 140),
          autoAlpha: 0, transformOrigin: "50% 50%", duration: () => gsap.utils.random(.6, 1.1), ease: "power2.in", stagger: { each: .006, from: "center" },
        }, "<")
        .to(cracks, { autoAlpha: 0, duration: .15 }, "<");
      cleanups.push(() => { delete card.dataset.frozen; });
    }

    // Credits: the transport lifts off when the recruitment chapter comes into view.
    const credits = page.querySelector<HTMLElement>(".chapter--recruit");
    if (credits) {
      ScrollTrigger.create({ trigger: credits, start: "top 70%", once: true, onEnter: () => { credits.dataset.launch = "true"; play("levitate"); } });
      cleanups.push(() => { delete credits.dataset.launch; });
    }

    // Operations map: the beam crosses the timeline with the scroll and lights each mission it reaches.
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
