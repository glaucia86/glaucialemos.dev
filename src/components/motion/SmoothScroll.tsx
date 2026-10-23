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
    const lenis = new Lenis({ lerp: .11, wheelMultiplier: .9, anchors: { offset: -80 }, autoRaf: false });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); delete window.__lenis; };
  }, [motion]);
  useEffect(() => { window.__lenis?.scrollTo(0, { immediate: true }); requestAnimationFrame(() => ScrollTrigger.refresh()); }, [pathname]);
  return null;
}
