"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** The image and its effects move together, preserving image-space alignment. */
export function CinematicScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const world = ref.current;
    const hero = world?.closest<HTMLElement>(".page-hero");
    if (!world || !hero) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    let visible = false;
    let frame = 0;
    let bounds = hero.getBoundingClientRect();

    const reset = () => {
      cancelAnimationFrame(frame);
      world.style.removeProperty("--scene-x");
      world.style.removeProperty("--scene-y");
    };
    const sync = () => {
      const active = visible && !document.hidden && !motion.matches &&
        !document.documentElement.classList.contains("reduce-motion");
      world.dataset.active = String(active);
      if (!active || !pointer.matches) reset();
    };
    const enter = () => { bounds = hero.getBoundingClientRect(); };
    const move = (event: PointerEvent) => {
      if (world.dataset.active !== "true" || !pointer.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        world.style.setProperty("--scene-x", `${x * -8}px`);
        world.style.setProperty("--scene-y", `${y * -5}px`);
      });
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const preference = new MutationObserver(sync);
    visibility.observe(hero);
    preference.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    hero.addEventListener("pointerenter", enter);
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    pointer.addEventListener("change", sync);
    return () => {
      reset();
      visibility.disconnect();
      preference.disconnect();
      hero.removeEventListener("pointerenter", enter);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      pointer.removeEventListener("change", sync);
    };
  }, []);

  return <div ref={ref} className="scene-world" data-active="false">
    {children}
    <div className="scene-atmosphere" aria-hidden="true" />
    <div className="scene-texture" aria-hidden="true" />
  </div>;
}
