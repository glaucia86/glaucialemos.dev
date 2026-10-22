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

  return <div ref={ref} className={className} aria-hidden="true" data-motion={!reduced && visible && foreground ? "running" : "paused"}>{children}</div>;
}
