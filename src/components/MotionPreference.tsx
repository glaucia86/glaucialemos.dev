"use client";

import { useMotionEnabled } from "@/lib/use-motion";

// SiteChrome owns the reduce-motion preference (system + manual toggle on <html>).
// Components from the events redesign read it through this bridge; it starts reduced,
// so server HTML and the first client render stay static.
export const useReducedMotion = () => !useMotionEnabled();
