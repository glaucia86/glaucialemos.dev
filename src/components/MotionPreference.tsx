"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { shouldReduceMotion } from "@/lib/motion";

// Conservative before hydration: the original illustration is always available.
export const ReducedMotionContext = createContext(true);
export const useReducedMotion = () => useContext(ReducedMotionContext);

export function useMotionPreference() {
  const [ready, setReady] = useState(false);
  const [system, setSystem] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const updateSystem = () => setSystem(media.matches);
    const readManual = () => {
      try { setManual(localStorage.getItem("reduce-motion") === "true"); }
      catch { /* Storage can be unavailable in private/embedded contexts. */ }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "reduce-motion" || event.key === null) readManual();
    };
    updateSystem();
    readManual();
    setReady(true);
    media.addEventListener("change", updateSystem);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", updateSystem);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const reduced = !ready || shouldReduceMotion(system, manual);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduced);
    return () => document.documentElement.classList.remove("reduce-motion");
  }, [reduced]);

  const toggle = () => {
    if (!ready || system) return;
    const next = !manual;
    setManual(next);
    try { localStorage.setItem("reduce-motion", String(next)); }
    catch { /* The in-memory preference remains usable. */ }
  };

  return { reduced, system, ready, toggle };
}
