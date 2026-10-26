"use client";

import { useEffect, useRef } from "react";
import { observeReadingProgress } from "@/lib/reading-progress";

// The rover that rides Marte's progress track, 16 × 16 pixels.
const Rover = () => <svg className="reading-progress__rover" viewBox="0 0 16 16" focusable="false" shapeRendering="crispEdges">
  <path fill="#d27a43" d="M2 6h12v4H2zM11 2h2v4h-2z" /><path fill="#42cfe0" d="M11 2h2v1h-2zM4 7h2v1H4z" /><path fill="#3a1a12" d="M2 11h3v3H2zM6.5 11h3v3h-3zM11 11h3v3h-3z" />
</svg>;

// The prism that rides Lúmina's thread of light, 16 × 16 pixels.
const Prism = () => <svg className="reading-progress__prism" viewBox="0 0 16 16" focusable="false" shapeRendering="crispEdges">
  <path fill="#aa78f4" d="M7 1h2v2h1v3h1v3h1v3h1v2H3v-2h1V9h1V6h1V3h1z" /><path fill="#f7e6ff" d="M7 3h1v9H7zM6 6h1v3H6z" /><path fill="#e474c7" d="M9 6h1v3h1v3H9z" /><path fill="#53e0e8" d="M3 14h10v1H3z" />
</svg>;

export function ReadingProgress({ variant = "default" }: { variant?: "default" | "niveora" | "mars" | "lumina" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const fill = element?.querySelector<HTMLElement>(".reading-progress__fill");
    if (!element || !fill) return;
    const stop = observeReadingProgress(fill);
    element.dataset.ready = "true";
    return () => { stop(); delete element.dataset.ready; };
  }, []);
  return <div ref={ref} className={`reading-progress reading-progress--${variant}`} aria-hidden="true">
    <div className="reading-progress__track"><span className="reading-progress__fill" /></div>
    {variant === "mars" ? <Rover /> : variant === "lumina" ? <Prism /> : variant === "niveora" ? <svg className="reading-progress__crystal" viewBox="0 0 16 16" focusable="false" shapeRendering="crispEdges"><path fill="#88cbe9" d="M6 0h4v2h2v3h2v6h-2v3h-2v2H6v-2H4v-3H2V5h2V2h2z" /><path fill="#d9fbff" d="M6 2h2v10H6z" /></svg> : <svg className="reading-progress__hilt" viewBox="0 0 16 24" focusable="false">
      <path className="reading-progress__metal" d="M1 0h14v4H1zM3 4h10v18H3zM2 22h12v2H2z" />
      <path className="reading-progress__grip" d="M5 5h6v14H5z" />
      <path className="reading-progress__ridges" d="M3 7h10v2H3zM3 12h10v2H3zM3 17h10v2H3z" />
    </svg>}
  </div>;
}
