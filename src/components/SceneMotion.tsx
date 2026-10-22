"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "./MotionPreference";

// Own only animation lifecycle. The scene geometry/markup stays server-rendered.
export function SceneMotion({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const updateVisibility = () => setForeground(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    // Unsupported observers deliberately keep a static scene.
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting), { threshold: 0 },
    );
    observer?.observe(element);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const scene = ref.current;
    const hero = scene?.closest<HTMLElement>(".page-hero");
    if (!scene || !hero || !className.includes("--dagobah") || reduced || !visible || !foreground) return;
    const reset = () => {
      scene.style.removeProperty("--look-x");
      scene.style.removeProperty("--look-y");
      scene.removeAttribute("data-focused");
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = hero.getBoundingClientRect();
      scene.style.setProperty("--look-x", `${((event.clientX - bounds.left) / bounds.width - .5) * 14}px`);
      scene.style.setProperty("--look-y", `${((event.clientY - bounds.top) / bounds.height - .5) * 10}px`);
      scene.dataset.focused = "true";
    };
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", reset);
    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [className, reduced, visible, foreground]);

  return <div ref={ref} className={className} aria-hidden="true" data-motion={!reduced && visible && foreground ? "running" : "paused"}>{children}</div>;
}
