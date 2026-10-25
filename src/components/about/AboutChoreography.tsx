"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMotionEnabled } from "@/lib/use-motion";
import { play } from "@/lib/sfx";

// Nivéora chapters below the hero. Shared reveals come from HomeChoreography on the same page.
export function AboutChoreography() {
  const motion = useMotionEnabled();
  useGSAP(() => {
    const page = document.querySelector<HTMLElement>(".about-page");
    if (!page || !motion) return;
    const cleanups: (() => void)[] = [];
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
      const aurora = page.querySelector<HTMLElement>(".chapter--aurora");
      const courier = aurora?.querySelector<HTMLElement>(".aurora-courier");
      const ship = credits.querySelector<HTMLElement>(".expedition-ship");
      if (aurora && courier && ship) {
        // Coordinates are measured again on refresh, before the ship takes off.
        const destination = () => {
          const source = aurora.getBoundingClientRect();
          const target = credits.getBoundingClientRect();
          return { x: target.width * .1 + ship.offsetWidth / 2 - source.width / 2,
            y: target.top - source.top + target.height * .87 - ship.offsetHeight / 2 - aurora.offsetHeight * .8 };
        };
        gsap.fromTo(courier, { x: 0, y: 0, autoAlpha: 0 }, {
          x: () => destination().x, y: () => destination().y, autoAlpha: 1, ease: "none",
          scrollTrigger: { trigger: aurora, start: "top 45%", endTrigger: credits, end: "top 70%", scrub: .3, invalidateOnRefresh: true,
            onUpdate: ({ progress }) => { credits.dataset.powered = String(progress > .95); } },
        });
        cleanups.push(() => { delete credits.dataset.powered; });
      }
      ScrollTrigger.create({ trigger: credits, start: "top 70%", once: true, onEnter: () => { credits.dataset.launch = "true"; play("launch"); } });
      cleanups.push(() => { delete credits.dataset.launch; });
    }

    let frame = 0;
    const refresh = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => ScrollTrigger.refresh()); };
    const resize = new ResizeObserver(refresh);
    resize.observe(page);
    refresh();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); cleanups.forEach((cleanup) => cleanup()); };
  }, { dependencies: [motion], revertOnUpdate: true });

  return null;
}
