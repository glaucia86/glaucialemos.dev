"use client";
import { useEffect, useRef, useState } from "react";
import type { NiveoraStoriesCopy } from "@/i18n/niveora-stories";
import { discover, getFoundSnapshot, subscribeReset, subscribeFound } from "@/lib/eggs";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { observeMotionActivity } from "@/lib/motion";
import { useMotionEnabled } from "@/lib/use-motion";
import { play } from "@/lib/sfx";
import { useStoryTrigger } from "./use-story-trigger";
import art from "@/data/galaxia/niveora.json";

const STAR_AVAILABLE = "niveora:borrowed-star-available";
const hasStar = () => getFoundSnapshot().split(",").includes("borrowed-star");
const poses = ["walk-1", "walk-2", "walk-3", "walk-4"] as const;

export function StoryStar({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 15 15" aria-hidden="true" shapeRendering="crispEdges"><path d="M6 0h3v4h2v2h4v3h-4v2H9v4H6v-4H4V9H0V6h4V4h2Z" fill="#ffd27a" /><path d="M6 5h3v1h1v3H9v1H6V9H5V6h1Z" fill="#fff2c8" /></svg>;
}

export function PrinceFootprint({ copy }: { copy: NiveoraStoriesCopy }) {
  const root = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [ready, setReady] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [walking, setWalking] = useState(false);
  const [started, setStarted] = useState(false);
  const motion = useMotionEnabled();
  useEffect(() => {
    setReady(true);
    const reset = () => { busy.current = false; setWalking(false); setStarted(false); setPulse(0); };
    return subscribeReset(reset);
  }, []);
  useEffect(() => { if (!motion) { busy.current = false; setWalking(false); setPulse(0); } }, [motion]);
  useGSAP(() => {
    const stage = root.current;
    if (!stage || !motion || pulse === 0) return;
    busy.current = true;
    const frames = [...stage.querySelectorAll<HTMLElement>(".prince-trail__pose")];
    const time = { value: 0 };
    const timeline = gsap.timeline({ paused: true, onComplete: () => { busy.current = false; setWalking(false); } })
      .fromTo(".prince-trail__traveler", { x: -120 }, { x: () => stage.clientWidth + 120, duration: 2.4, ease: "none" }, 0)
      .to(time, { value: 2400, duration: 2.4, ease: "none", onUpdate: () => {
        const pose = Math.floor(time.value / 120) % frames.length;
        frames.forEach((frame, index) => { frame.hidden = index !== pose; });
      } }, 0);
    const stop = observeMotionActivity(stage, active => { stage.dataset.paused = String(!active); if (active) timeline.play(); else timeline.pause(); });
    return () => { stop(); busy.current = false; };
  }, { scope: root, dependencies: [pulse, motion], revertOnUpdate: true });
  const begin = () => {
    if (busy.current) return;
    setStarted(true); dispatchEvent(new Event(STAR_AVAILABLE));
    // Little paws on the snow while Prince fetches the star.
    play("woof"); [200, 520, 840, 1160, 1480].forEach((delay, index) => window.setTimeout(() => play("pawstep", { detune: index % 2 ? 120 : -80 }), motion ? delay : 0));
    if (motion) { busy.current = true; setWalking(true); setPulse(value => value + 1); }
  };
  return <div ref={root} className="prince-trail" hidden={!ready} data-walking={walking}>
    <button type="button" className="prince-trail__call" onClick={begin} aria-controls="borrowed-star">
      <svg viewBox="0 0 20 20" aria-hidden="true" shapeRendering="crispEdges"><path fill="currentColor" d="M2 6h3v4H2zM6 2h3v5H6zM11 2h3v5h-3zM15 6h3v4h-3zM7 10h6v2h2v5H5v-5h2z" /></svg>{copy.footprint}
    </button>
    <p className="prince-trail__hint" role="status">{started ? copy.hint : ""}</p>
    <div className="prince-trail__stage" aria-hidden="true" hidden={!walking}>
      <span className="prince-trail__traveler"><span className="prince-trail__actor">
        {poses.map(pose => {
          const frame = art.actors.prince[pose]; const scale = 72 / art.actors.prince.stand.h;
          return <i key={pose} className="prince-trail__pose" hidden={pose !== "walk-1"} style={{ width: frame.w * scale, height: frame.h * scale, left: 60 - frame.feetX * scale, backgroundImage: `url(${frame.src})` }} />;
        })}
        <StoryStar className="prince-trail__cargo" />
      </span></span>
    </div>
  </div>;
}

export function BorrowedStar({ copy }: { copy: NiveoraStoriesCopy }) {
  const root = useRef<HTMLDivElement>(null);
  const detail = useRef<HTMLDetailsElement>(null);
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [opened, setOpened] = useState(false);
  const [request, setRequest] = useState(0);
  const destinationRequested = useRef(false);
  useEffect(() => {
    setReady(true); setAvailable(hasStar());
    const reveal = () => setAvailable(true);
    const reset = () => { destinationRequested.current = false; setAvailable(false); setOpened(false); if (detail.current) detail.current.open = false; };
    const stop = subscribeFound(() => { if (hasStar()) setAvailable(true); });
    const stopReset = subscribeReset(reset);
    addEventListener(STAR_AVAILABLE, reveal);
    return () => { stop(); stopReset(); removeEventListener(STAR_AVAILABLE, reveal); };
  }, []);
  useStoryTrigger("borrowed-star", () => {
    destinationRequested.current = true; setAvailable(true); setRequest(value => value + 1);
  });
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (destinationRequested.current && available && detail.current) {
        destinationRequested.current = false; detail.current.open = true;
        root.current?.scrollIntoView({ block: "center", behavior: "instant" });
        detail.current.querySelector("summary")?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [available, opened, request]);
  return <div id="borrowed-star" ref={root} className="borrowed-star" hidden={ready && !available}>
    <span className="borrowed-star__tracks" aria-hidden="true">· ∴ · ∴ ·</span>
    <details ref={detail} onToggle={event => { setOpened(event.currentTarget.open); if (event.currentTarget.open) { discover("borrowed-star"); play("twinkle"); } }}>
      <summary><StoryStar />{copy.star}</summary>
      <div className="borrowed-star__note"><h3>{copy.noteTitle}</h3><p>{copy.note}</p><p>{copy.signature}</p>
        {ready && <button type="button" className="story-close" onClick={() => { if (detail.current) { detail.current.open = false; detail.current.querySelector("summary")?.focus(); } }}>{copy.returnStar}</button>}
      </div>
    </details>
  </div>;
}
