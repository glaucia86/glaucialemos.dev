"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotionEnabled } from "@/lib/use-motion";

declare global { interface Window { __lenis?: Lenis } }

// Inertial scroll shares GSAP's ticker so pinned scenes and scrubs never drift.
export function SmoothScroll() {
  const motion = useMotionEnabled();
  const pathname = usePathname();
  useEffect(() => {
    if (!motion) return;
    // Open dialogs (the star radio, the letter, the telescope) and marked panels scroll natively, never the page behind them.
    const lenis = new Lenis({ lerp: .11, wheelMultiplier: .9, anchors: { offset: -80 }, autoRaf: false, prevent: (node) => !!node.closest("dialog, [data-lenis-prevent]") });
    window.__lenis = lenis;
    if (document.documentElement.dataset.boot === "pending") lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); delete window.__lenis; };
  }, [motion]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
}
