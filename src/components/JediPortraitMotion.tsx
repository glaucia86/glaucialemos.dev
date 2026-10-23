"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { shouldReduceMotion } from "@/lib/motion";

// Image, SVG, caption and copy are supplied by the server; only lifecycle hydrates.
export function JediPortraitMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const consumed = useRef(false);
  useEffect(() => {
    const element = ref.current;
    const portrait = element?.querySelector(".portrait-frame");
    if (!element || !portrait) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let halfVisible = false;
    const update = () => {
      const enabled = !shouldReduceMotion(reduced.matches, document.documentElement.classList.contains("reduce-motion"));
      element.dataset.motionReady = String(enabled);
      if (!enabled || document.hidden) {
        element.dataset.pulse = "idle";
      } else if (!fine.matches && halfVisible && !consumed.current) {
        consumed.current = true;
        element.dataset.pulse = "active";
        intersection.disconnect();
      }
    };
    const intersection = new IntersectionObserver(([entry]) => {
      halfVisible = entry.isIntersecting && entry.intersectionRatio >= .5;
      update();
    }, { threshold: .5 });
    const preference = new MutationObserver(update);
    preference.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    intersection.observe(portrait);
    reduced.addEventListener("change", update);
    fine.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      intersection.disconnect(); preference.disconnect();
      reduced.removeEventListener("change", update); fine.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      element.dataset.motionReady = "false";
      element.dataset.pulse = "idle";
    };
  }, []);
  return <div ref={ref} className="jedi-portrait" data-motion-ready="false" data-pulse="idle" onAnimationEnd={(event) => {
    if (event.animationName === "jedi-pulse" && ref.current) ref.current.dataset.pulse = "idle";
  }}>{children}</div>;
}
