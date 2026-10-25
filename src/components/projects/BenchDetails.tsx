"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { bringIntoView, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";

// "The project before it was pretty": a workbench's casing is a native <details>, so it opens without JavaScript too.
// The first casing on the page answers the star radio's replay.
export function BenchDetails({ summary, children, primary = false }: { summary: string; children: ReactNode; primary?: boolean }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (!primary) return;
    return onEgg("before-pretty", () => void bringIntoView(ref.current).then(() => { if (ref.current) ref.current.open = true; }));
  }, [primary]);
  const toggle = () => { if (ref.current?.open) { discover("before-pretty"); play("switch"); } };
  return <details ref={ref} className="bench" onToggle={toggle}>
    <summary className="bench__summary"><span className="bench__screw" aria-hidden="true" />{summary}</summary>
    <div className="bench__inside">{children}</div>
  </details>;
}
