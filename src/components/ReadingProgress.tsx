"use client";

import { useEffect, useRef } from "react";
import { observeReadingProgress } from "@/lib/reading-progress";

export function ReadingProgress({ variant = "default" }: { variant?: "default" | "niveora" }) {
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
    {variant === "niveora" ? <svg className="reading-progress__crystal" viewBox="0 0 16 16" focusable="false" shapeRendering="crispEdges"><path fill="#88cbe9" d="M6 0h4v2h2v3h2v6h-2v3h-2v2H6v-2H4v-3H2V5h2V2h2z" /><path fill="#d9fbff" d="M6 2h2v10H6z" /></svg> : <svg className="reading-progress__hilt" viewBox="0 0 16 24" focusable="false">
      <path className="reading-progress__metal" d="M1 0h14v4H1zM3 4h10v18H3zM2 22h12v2H2z" />
      <path className="reading-progress__grip" d="M5 5h6v14H5z" />
      <path className="reading-progress__ridges" d="M3 7h10v2H3zM3 12h10v2H3zM3 17h10v2H3z" />
    </svg>}
  </div>;
}
