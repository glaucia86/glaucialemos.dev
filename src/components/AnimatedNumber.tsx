"use client";

import { useEffect, useRef } from "react";
import { observeMotion } from "@/lib/motion";

export function AnimatedNumber({ value, locale = "pt-BR" }: { value: number; locale?: string }) {
  const visual = useRef<HTMLSpanElement>(null);
  const formatted = value.toLocaleString(locale);

  useEffect(() => {
    const node = visual.current;
    if (!node) return;
    const formatter = new Intl.NumberFormat(locale);
    let frame = 0;
    let elapsed = 0;
    let previous = 0;
    let complete = false;
    const tick = (now: number) => {
      elapsed += previous ? now - previous : 0;
      previous = now;
      const progress = Math.min(1, elapsed / 900);
      node.textContent = formatter.format(Math.round(value * (1 - (1 - progress) ** 3)));
      complete = progress === 1;
      if (!complete) frame = requestAnimationFrame(tick);
    };
    const disconnect = observeMotion(node, ({ active, reduced }) => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (reduced) {
        complete = true;
        node.textContent = formatter.format(value);
      } else if (active && !complete) {
        frame = requestAnimationFrame(tick);
      }
    });
    return () => { disconnect(); cancelAnimationFrame(frame); };
  }, [value, locale]);

  return <><span className="sr-only">{formatted}</span><span ref={visual} aria-hidden="true">{formatted}</span></>;
}
