"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, WIDE_MOTION } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { play } from "@/lib/sfx";
import { createHyperspace } from "./hyperspace";

// Desktop with motion: pins the stage and lets the scroll fly the camera through the 7 portals (each grows from the
// vanishing point, passes the camera and fades), with hyperspace streaks speeding up, a white flash at the end and a
// single pulse on the final proposal button. Anywhere else the static row stays as rendered by the server.
export function WorldsWarpMotion() {
  const anchor = useRef<HTMLElement>(null);
  const motion = useMotionEnabled();
  const overlay = useMediaQuery(WIDE_MOTION);
  useEffect(() => {
    const section = anchor.current?.closest<HTMLElement>(".worlds-warp");
    if (!section || !motion || !overlay) return;
    const stage = section.querySelector<HTMLElement>(".worlds-warp__stage")!;
    const canvas = section.querySelector<HTMLCanvasElement>(".worlds-warp__sky")!;
    const worlds = [...section.querySelectorAll<HTMLElement>(".worlds-warp__world")];
    const heading = section.querySelector<HTMLElement>(".worlds-warp__heading")!;
    const next = section.querySelector<HTMLElement>(".worlds-warp__next")!;
    const flash = section.querySelector<HTMLElement>(".worlds-warp__flash")!;
    section.dataset.warp = "on";
    const sky = createHyperspace(canvas, 320);
    let last = -1;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section, start: "top top", end: () => `+=${innerHeight * 4.2}`, pin: stage, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: self => {
            sky.set(Math.min(1, self.progress * 1.25));
            const current = Math.floor(self.progress * (worlds.length + 1)) - 1;
            if (current !== last && current >= 0 && current < worlds.length && self.direction > 0) play(current === 0 ? "warp" : "twinkle", { gain: .6 });
            last = current;
          },
          onLeave: () => document.querySelector(".chapter--credits .button.primary")?.animate(
            [{ boxShadow: "0 0 0 0 rgba(131,239,172,0)" }, { boxShadow: "0 0 0 14px rgba(131,239,172,.35)" }, { boxShadow: "0 0 0 0 rgba(131,239,172,0)" }],
            { duration: 1400, easing: "ease-out" }),
        },
      });
      timeline.to(heading, { autoAlpha: 0, scale: .85, duration: .6 }, 0);
      worlds.forEach((world, index) => {
        const at = .4 + index * .8;
        timeline.fromTo(world, { autoAlpha: 0, scale: .08, z: 0 }, { autoAlpha: 1, scale: 1, duration: .7, ease: "power2.in" }, at)
          .to(world, { autoAlpha: 0, scale: 3.4, duration: .5, ease: "power2.in" }, at + .7);
      });
      // The closing line only rises once the last portal has fully passed the camera, so they never overlap.
      const lastOut = .4 + (worlds.length - 1) * .8 + 1.2;
      timeline.fromTo(next, { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .6 }, lastOut + .1)
        .fromTo(flash, { autoAlpha: 0 }, { autoAlpha: .9, duration: .25 }, lastOut + 1)
        .to(flash, { autoAlpha: 0, duration: .4 }, lastOut + 1.25);
    }, section);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { context.revert(); sky.destroy(); delete section.dataset.warp; };
  }, [motion, overlay]);
  return <i ref={anchor} hidden />;
}
