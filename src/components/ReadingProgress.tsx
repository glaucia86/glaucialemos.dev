"use client";

import { useEffect, useRef } from "react";
import { observeReadingProgress } from "@/lib/reading-progress";

export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const fill = element?.querySelector<HTMLElement>(".reading-progress__fill");
    if (!element || !fill) return;
    const stop = observeReadingProgress(fill);
    element.dataset.ready = "true";
    return () => { stop(); delete element.dataset.ready; };
  }, []);
  return <div ref={ref} className="reading-progress" aria-hidden="true">
    <div className="reading-progress__track"><span className="reading-progress__fill" /></div>
    <svg className="reading-progress__hilt" viewBox="0 0 16 24" focusable="false">
      <path className="reading-progress__metal" d="M1 0h14v4H1zM3 4h10v18H3zM2 22h12v2H2z" />
      <path className="reading-progress__grip" d="M5 5h6v14H5z" />
      <path className="reading-progress__ridges" d="M3 7h10v2H3zM3 12h10v2H3zM3 17h10v2H3z" />
    </svg>
  </div>;
}
