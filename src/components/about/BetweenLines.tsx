"use client";
import { useEffect, useRef, useState } from "react";
import type { NiveoraStoriesCopy } from "@/i18n/niveora-stories";
import { discover, subscribeReset } from "@/lib/eggs";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { useStoryTrigger } from "./use-story-trigger";

export function BetweenLines({ copy, sources }: { copy: NiveoraStoriesCopy; sources: string[] }) {
  const root = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const motion = useMotionEnabled();
  const show = () => {
    if (!root.current) return;
    root.current.open = true;
    root.current.scrollIntoView({ block: "center", behavior: "instant" });
    root.current.querySelector("summary")?.focus({ preventScroll: true });
  };
  useStoryTrigger("between-lines", show);
  const close = () => { if (root.current) { root.current.open = false; root.current.querySelector("summary")?.focus({ preventScroll: true }); } };
  useEffect(() => {
    setReady(true);
    const reset = () => { if (root.current) root.current.open = false; setOpen(false); };
    return subscribeReset(reset);
  }, []);
  useGSAP(() => {
    if (!open || !motion || !root.current) return;
    const tween = gsap.fromTo(".story-thread path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: "steps(18)", paused: true });
    return observeMotionActivity(root.current, active => { if (active) tween.play(); else tween.pause(); });
  }, { scope: root, dependencies: [open, motion], revertOnUpdate: true });
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [open]);
  return <details ref={root} className="between-lines" onToggle={event => {
    const expanded = event.currentTarget.open; setOpen(expanded); if (expanded) discover("between-lines");
  }}>
    <summary><svg className="story-thread" viewBox="0 0 180 20" aria-hidden="true" shapeRendering="crispEdges"><path d="M0 15H30V9H58V15H80V3H108V9H140V3H180" pathLength="1" /></svg><span>{copy.between}</span></summary>
    <div className="between-lines__note">
      <h3>{copy.title}</h3><p>{copy.intro}</p>
      <ol>{copy.records.map((record, index) => <li key={record.title}><h4>{record.title}</h4><p>{record.text}</p><a href={sources[index]} target="_blank" rel="noopener noreferrer">{copy.source} <span aria-hidden="true">↗</span></a></li>)}</ol>
      {ready && <button type="button" className="story-close" onClick={close}>{copy.close}</button>}
    </div>
  </details>;
}
