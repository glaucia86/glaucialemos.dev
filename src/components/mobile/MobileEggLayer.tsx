"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import { defaultLocale, isLocale } from "@/i18n/config";
import { mobileEggs } from "@/i18n/mobile-eggs";
import { emitEgg, getFoundSnapshot, remainingDiscoveries, type EggId } from "@/lib/eggs";
import {
  ARM_WINDOW_MS, HOLD_MS, INITIAL_MOBILE_EGG_STATE, MIN_HOTSPOT_PX,
  MOBILE_EGG_QUERY, MOBILE_HOTSPOTS, edgeCues, mobileEggReducer, nextGlowId,
  panStep, scanState, sceneXToReveal, type MobileEggEvent, type MobileWorld,
} from "@/lib/mobile-eggs";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";

// Custom projections supply --mobile-plane-{width,height,left,top,transform} and
// --mobile-frame-height on a [data-mobile-egg-host]. --scene-x remains the pan input.
// This keeps the interaction independent of the next pass's special scene framing.
export type MobileEggProjection = "cover" | "custom";
type Props = { world: MobileWorld; projection?: MobileEggProjection };
type Hint = { id: EggId; locked: boolean } | null;

export function MobileEggLayer({ world, projection = "cover" }: Props) {
  const mobile = useMediaQuery(MOBILE_EGG_QUERY);
  // useMediaQuery starts false on both the server and the first client render.
  return mobile ? <MountedLayer key={world} world={world} projection={projection} /> : null;
}

function Ring({ className }: { className?: string }) {
  return <svg className={`mobile-eggs__ring ${className ?? ""}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <circle cx="32" cy="32" r="27" pathLength="1" />
  </svg>;
}

function MountedLayer({ world, projection }: Required<Props>) {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang && isLocale(params.lang) ? params.lang : defaultLocale;
  const copy = mobileEggs[lang];
  const root = useRef<HTMLDivElement>(null);
  const motion = useMotionEnabled();
  const tipId = useId();
  const [hint, setHint] = useState<Hint>(null);
  const [holding, setHolding] = useState<EggId | null>(null);
  const [glow, setGlow] = useState<EggId | null>(null);
  const [scan, setScan] = useState(() => scanState(0, null));
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const frame = root.current;
    const hero = frame?.closest<HTMLElement>(".page-hero, [data-mobile-egg-host]");
    if (!frame || !hero) return;
    let state = { ...INITIAL_MOBILE_EGG_STATE };
    let armTimer = 0, holdTimer = 0, glowTimer = 0, glowEnd = 0, inertia = 0, scanTimer = 0;
    let lastScan: number | null = null;
    let scanCancelled = false, consumedHold = false;
    setScan(scanState(0, null));
    let previousGlow: EggId | null = null;
    let suppressUntil = 0;
    let visible = true;
    let press: { id: number; x: number; y: number; sx: number; lastX: number; lastAt: number; velocity: number; dragged: boolean } | null = null;
    const originalX = hero.style.getPropertyValue("--scene-x");
    const readX = () => parseFloat(getComputedStyle(hero).getPropertyValue("--scene-x")) || 0;
    const updateEdges = () => setEdges(edgeCues(readX(), frame.clientWidth, frame.clientHeight));
    const pan = (x: number) => { hero.style.setProperty("--scene-x", `${x}%`); updateEdges(); };
    const clearHold = () => { clearTimeout(holdTimer); setHolding(null); };
    const clear = () => {
      clearTimeout(armTimer); clearHold();
      state = mobileEggReducer(state, { type: "clear" }).state;
      setHint(null);
    };
    const apply = (event: MobileEggEvent) => {
      const id = "id" in event ? event.id : state.armed;
      const result = mobileEggReducer(state, event, egg => remainingDiscoveries(egg, getFoundSnapshot().split(",")) > 0);
      state = result.state;
      if (result.effect === "hint" && id) {
        setHint({ id, locked: false });
        clearTimeout(armTimer); armTimer = window.setTimeout(clear, ARM_WINDOW_MS + 1);
      } else if (result.effect === "trigger" && id) {
        clear(); setGlow(null); clearTimeout(glowEnd);
        // End an active scan too: activation must leave no feedback attached to the egg.
        scanCancelled = true;
        setScan(current => ({ ...current, highlighted: false }));
        emitEgg(id);
      } else if (result.effect === "locked" && id) {
        clear(); setHint({ id, locked: true });
        armTimer = window.setTimeout(clear, ARM_WINDOW_MS);
      }
    };
    const hotspot = (target: EventTarget | null) => target instanceof Element ? target.closest<HTMLButtonElement>(".mobile-eggs__hot") : null;
    const startHold = (button: HTMLButtonElement) => {
      const id = button.dataset.egg as EggId;
      if (button.dataset.kind !== "hold" || state.armed !== id) return;
      apply({ type: "holdStart", id, now: performance.now() });
      if (state.holdStartedAt === null) { clear(); return; }
      clearTimeout(armTimer); setHolding(id); consumedHold = false;
      holdTimer = window.setTimeout(() => {
        apply({ type: "holdEnd", now: performance.now() });
        consumedHold = true; suppressUntil = performance.now() + 800;
      }, HOLD_MS + 1);
    };
    const endHold = () => {
      if (state.holdStartedAt !== null) {
        apply({ type: "holdEnd", now: performance.now() });
        clearTimeout(armTimer);
        if (state.armed) armTimer = window.setTimeout(clear, Math.max(0, ARM_WINDOW_MS - (performance.now() - state.armedAt)));
      }
      clearHold();
    };
    const down = (event: PointerEvent) => {
      cancelAnimationFrame(inertia);
      if (!event.isPrimary || event.button !== 0) { clear(); press = null; return; }
      const bounds = frame.getBoundingClientRect();
      const target = event.target as Element;
      if (event.clientY < bounds.top || event.clientY > bounds.bottom || target.closest("a, input, select, textarea, dialog, [popover], button:not(.mobile-eggs__hot)")) return;
      press = { id: event.pointerId, x: event.clientX, y: event.clientY, sx: readX(), lastX: event.clientX, lastAt: performance.now(), velocity: 0, dragged: false };
      const button = hotspot(target);
      if (button) startHold(button);
    };
    const move = (event: PointerEvent) => {
      if (!press || press.id !== event.pointerId) return;
      const dx = event.clientX - press.x, dy = event.clientY - press.y;
      if (!press.dragged && Math.hypot(dx, dy) > 8) {
        clear();
        if (Math.abs(dy) > Math.abs(dx)) { press = null; return; }
        press.dragged = true;
        hero.setPointerCapture(event.pointerId);
      }
      if (!press.dragged) return;
      event.preventDefault();
      const now = performance.now();
      press.velocity = (event.clientX - press.lastX) / Math.max(1, now - press.lastAt);
      press.lastX = event.clientX; press.lastAt = now;
      pan(panStep(press.sx, dx, frame.clientWidth, frame.clientHeight));
    };
    const up = (event: PointerEvent) => {
      if (press && press.id !== event.pointerId) return;
      endHold();
      if (consumedHold) { suppressUntil = performance.now() + 800; consumedHold = false; }
      const released = press; press = null;
      if (hero.hasPointerCapture(event.pointerId)) hero.releasePointerCapture(event.pointerId);
      if (!released?.dragged) return;
      suppressUntil = performance.now() + 800;
      if (!motion || performance.now() - released.lastAt > 100) return;
      let velocity = Math.max(-2, Math.min(2, released.velocity)), last = performance.now();
      const coast = (now: number) => {
        const dt = Math.min(32, now - last); last = now;
        const before = readX();
        const next = panStep(before, velocity * dt, frame.clientWidth, frame.clientHeight);
        pan(next); velocity *= Math.exp(-dt / 150);
        if (Math.abs(velocity) > .02 && Math.abs(next - before) > .001) inertia = requestAnimationFrame(coast);
      };
      inertia = requestAnimationFrame(coast);
    };
    const cancel = () => { press = null; clear(); cancelAnimationFrame(inertia); };
    const outside = (event: PointerEvent) => { if (!hotspot(event.target) || !frame.contains(event.target as Node)) clear(); };
    const click = (event: MouseEvent) => {
      if (performance.now() < suppressUntil) { event.preventDefault(); event.stopImmediatePropagation(); return; }
      const button = hotspot(event.target);
      if (button) { apply({ type: "tap", id: button.dataset.egg as EggId, now: performance.now() }); return; }
      const target = event.target as Element;
      if (target.closest(".mobile-eggs__scan")) {
        const now = performance.now();
        if (!scanState(now, lastScan).ready) return;
        clear(); setGlow(null); clearTimeout(glowEnd); lastScan = now; scanCancelled = false;
        const update = () => {
          const next = scanState(performance.now(), lastScan); setScan({ ...next, highlighted: next.highlighted && !scanCancelled });
          if (next.ready) clearInterval(scanTimer);
        };
        update(); scanTimer = window.setInterval(update, 80);
      } else if (target.closest(".mobile-eggs__comlink")) {
        clear(); window.dispatchEvent(new Event("comlink:open"));
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { clear(); return; }
      const button = hotspot(event.target);
      if (!button || button.dataset.kind !== "hold" || ![" ", "Enter"].includes(event.key) || state.armed !== button.dataset.egg) return;
      event.preventDefault(); if (!event.repeat) startHold(button);
    };
    const keyup = (event: KeyboardEvent) => {
      if (hotspot(event.target) && [" ", "Enter"].includes(event.key) && (state.holdStartedAt !== null || consumedHold)) {
        event.preventDefault(); endHold(); suppressUntil = performance.now() + 800; consumedHold = false;
      }
    };
    const focus = (event: FocusEvent) => {
      const button = hotspot(event.target);
      if (!button || !button.matches(":focus-visible")) return;
      const h = MOBILE_HOTSPOTS[world].find(h => h.id === button.dataset.egg);
      if (h) { cancelAnimationFrame(inertia); pan(sceneXToReveal(h, frame.clientWidth, frame.clientHeight, MIN_HOTSPOT_PX / 2)); }
    };
    const blur = () => { endHold(); };
    const scheduleGlow = () => {
      clearTimeout(glowTimer); clearTimeout(glowEnd); setGlow(null);
      if (!motion || document.hidden || !visible) return;
      glowTimer = window.setTimeout(() => {
        if (!scanState(performance.now(), lastScan).highlighted && !state.armed) {
          previousGlow = nextGlowId(world, previousGlow, Math.random); setGlow(previousGlow);
        }
        glowEnd = window.setTimeout(() => setGlow(null), 2400);
        glowTimer = window.setTimeout(scheduleGlow, 2400);
      }, 3600 + Math.random() * 3000);
    };
    const visibility = () => { cancel(); scheduleGlow(); };
    const observer = new ResizeObserver(() => { cancel(); updateEdges(); }); observer.observe(frame);
    const activity = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; scheduleGlow(); if (!visible) cancel(); }); activity.observe(frame);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("pointerdown", outside, true);
    hero.addEventListener("pointerdown", down);
    hero.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up); window.addEventListener("pointercancel", cancel);
    hero.addEventListener("click", click, true);
    frame.addEventListener("keydown", keydown); frame.addEventListener("keyup", keyup);
    frame.addEventListener("focusin", focus); frame.addEventListener("focusout", blur);
    const noMenu = (event: Event) => { if (hotspot(event.target)) event.preventDefault(); };
    frame.addEventListener("contextmenu", noMenu);
    updateEdges(); scheduleGlow();
    return () => {
      cancel(); clearTimeout(glowTimer); clearTimeout(glowEnd); clearInterval(scanTimer);
      observer.disconnect(); activity.disconnect();
      document.removeEventListener("visibilitychange", visibility); document.removeEventListener("pointerdown", outside, true);
      hero.removeEventListener("pointerdown", down); hero.removeEventListener("pointermove", move); hero.removeEventListener("click", click, true);
      window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", cancel);
      frame.removeEventListener("keydown", keydown); frame.removeEventListener("keyup", keyup); frame.removeEventListener("focusin", focus); frame.removeEventListener("focusout", blur); frame.removeEventListener("contextmenu", noMenu);
      if (originalX) hero.style.setProperty("--scene-x", originalX); else hero.style.removeProperty("--scene-x");
    };
  }, [world, motion, projection]);

  const text = hint ? hint.locked ? copy.ui.lockedHint : copy.hints[hint.id] : "";
  const cue = hint && !hint.locked ? MOBILE_HOTSPOTS[world].find(h => h.id === hint.id)?.kind === "hold" ? copy.ui.holdHint : copy.ui.armHint : "";
  return <div ref={root} className="mobile-eggs" data-projection={projection} data-motion={motion} data-scan={scan.highlighted || undefined}>
    <div className="mobile-eggs__plane" role="group" aria-label={copy.ui.panoramaAria}>
      {MOBILE_HOTSPOTS[world].map(h => <button key={h.id} type="button" className="mobile-eggs__hot" data-egg={h.id} data-kind={h.kind}
        data-glow={glow === h.id || undefined} data-holding={holding === h.id || undefined}
        aria-label={copy.ui.hotspotAria} aria-describedby={hint?.id === h.id ? tipId : undefined}
        style={{ left: `${h.x}%`, top: `${h.y}%`, width: `max(${h.size}%, ${MIN_HOTSPOT_PX}px)`, "--hold-duration": `${HOLD_MS}ms` } as CSSProperties}>
        {holding === h.id && <Ring className="mobile-eggs__hold" />}
      </button>)}
    </div>
    {edges.left && <span className="mobile-eggs__edge mobile-eggs__edge--left" aria-hidden="true">‹</span>}
    {edges.right && <span className="mobile-eggs__edge mobile-eggs__edge--right" aria-hidden="true">›</span>}
    <div id={tipId} className="mobile-eggs__tooltip" role="status" aria-live="polite" aria-atomic="true" data-visible={!!hint || undefined}>
      {text}{cue && <span>{cue}</span>}
    </div>
    <div className="mobile-eggs__dock">
      <button type="button" className="mobile-eggs__scan" disabled={!scan.ready} aria-label={copy.ui.scanAria}
        style={{ "--scan-progress": motion ? scan.cooldownProgress : 1 } as CSSProperties}>
        <Ring /><span>{copy.ui.scanLabel}</span>
      </button>
      <button type="button" className="mobile-eggs__comlink" aria-haspopup="dialog"><span aria-hidden="true">⌁</span>{copy.ui.sheetTitle}</button>
    </div>
  </div>;
}
