"use client";

import { useEffect, useState } from "react";
import { shouldReduceMotion } from "./motion";

export function motionAllowed() {
  return !shouldReduceMotion(matchMedia("(prefers-reduced-motion: reduce)").matches, document.documentElement.classList.contains("reduce-motion"));
}

// Starts false so server HTML and the first client render stay static; GSAP contexts
// listing this value as a dependency revert and rebuild when the preference changes.
export function useMotionEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const system = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(motionAllowed());
    const preference = new MutationObserver(update);
    preference.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    system.addEventListener("change", update);
    update();
    return () => { preference.disconnect(); system.removeEventListener("change", update); };
  }, []);
  return enabled;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}
