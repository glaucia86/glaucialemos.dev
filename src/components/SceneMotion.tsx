"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The illustration stays server-rendered. Only lifecycle and pointer input hydrate.
export function SceneMotion({ scene, children }: { scene: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const layer = ref.current;
    const hero = layer?.closest<HTMLElement>(".page-hero");
    if (!layer || !hero) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let visible = false;
    let active = false;
    const reset = () => {
      layer.style.setProperty("--pointer-x", "0px");
      layer.style.setProperty("--pointer-y", "0px");
    };
    const update = () => {
      active = visible && !document.hidden && !reduced.matches && !document.documentElement.classList.contains("reduce-motion");
      layer.dataset.paused = String(!active);
      if (!active) reset();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(layer);
    const preference = new MutationObserver(update);
    preference.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const move = (event: PointerEvent) => {
      if (!active || !fine.matches || innerWidth <= 900) return;
      const box = hero.getBoundingClientRect();
      layer.style.setProperty("--pointer-x", `${((event.clientX - box.left) / box.width - .5) * 12}px`);
      layer.style.setProperty("--pointer-y", `${((event.clientY - box.top) / box.height - .5) * 8}px`);
    };
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    fine.addEventListener("change", reset);
    return () => {
      observer.disconnect(); preference.disconnect();
      hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update); fine.removeEventListener("change", reset);
    };
  }, []);
  return <div ref={ref} className={`hero-scene-layer hero-scene-layer--${scene}`} data-paused="true" aria-hidden="true">{children}</div>;
}
