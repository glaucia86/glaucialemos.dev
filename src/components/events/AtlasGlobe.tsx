"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/components/MotionPreference";
import { anglesOf } from "@/lib/atlas-records";
import { bringIntoView, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import type { AtlasCopy } from "@/i18n/atlas";
import { eventAnchor, filterYear, findEvent } from "./atlas-events";

type Marker = { location: [number, number]; size: number };
type Entry = { id: string; nome: string; place: string; fonte: string };
export type Orbit = { year: number; cities: { lat: number; lon: number; count: number }[]; presencial: Entry[]; remoto: Entry[] };
type Props = {
  markers: Marker[]; orbits: Orbit[];
  labels: AtlasCopy["globe"]; readout: AtlasCopy["readout"];
  pedestal: { off: string; on: string };
  base: { cidade: string; lat: number; lon: number; count: number }; prince: string; princeCopy: AtlasCopy["prince"]; path: string;
};

const TAU = Math.PI * 2;
const SEGMENTS = 32;
const START: [number, number] = [5.5, .12];
const DIM: [number, number, number] = [.3, .42, .6];
const LIT: [number, number, number] = [1, .78, .35];

// Chapter 2: the real, draggable globe (cobe), standing on the Atlas's pedestal. Only in-person cities are markers.
// Turning it a whole revolution by hand (drag, arrow keys, touch) closes the orbit of a year: orbital-trail.
export default function AtlasGlobe({ markers, orbits, labels, readout, pedestal, base, prince, princeCopy, path }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const actions = useRef<{ reset: () => void; show: (orbit: Orbit | null) => void; whirl: () => void; focus: (lat: number, lon: number) => void } | null>(null);
  const [stamped, setStamped] = useState(false);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [turned, setTurned] = useState(0);
  const [orbitAt, setOrbitAt] = useState<number | null>(null);
  const nextOrbit = useRef(0);
  const motion = useRef({ reduced, paused });
  useEffect(() => { motion.current = { reduced, paused }; }, [reduced, paused]);
  const orbit = orbitAt === null ? null : orbits[orbitAt];

  const closeOrbit = useMemo(() => () => {
    const index = nextOrbit.current++ % orbits.length;
    setOrbitAt(index); setTurned(0);
    discover("orbital-trail"); play("orbit");
    actions.current?.show(orbits[index]);
  }, [orbits]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    void import("cobe").then(({ default: createGlobe }) => {
      if (disposed) return;
      let phi = START[0], theta = START[1], velocity = 0, frame = 0, previous = 0, travelled = 0;
      let tween: { from: [number, number]; to: [number, number]; start: number; ms: number } | null = null;
      let drag: { id: number; x: number; y: number } | null = null;
      let visible = true;
      let globe: ReturnType<typeof createGlobe>;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = element.getBoundingClientRect().width;
      try {
        globe = createGlobe(element, {
          devicePixelRatio: dpr, width: width * dpr, height: width * dpr, phi, theta,
          dark: 1, diffuse: 1.4, mapSamples: 20000, mapBrightness: 6, mapBaseBrightness: .04,
          baseColor: [.18, .45, .7], markerColor: LIT, glowColor: [.18, .55, .85],
          markers, markerElevation: .015, arcColor: LIT,
        });
      } catch { setUnavailable(true); return; }
      setReady(true);
      const draw = () => {
        globe.update({ phi, theta });
        // Expose rendered orientation for keyboard/drag regression checks.
        element.dataset.longitude = phi.toFixed(4);
        element.dataset.latitude = theta.toFixed(4);
      };
      // Only rotation made by hand counts toward the orbit.
      const travel = (delta: number) => {
        travelled += Math.abs(delta);
        if (travelled >= TAU) { travelled = 0; closeOrbit(); }
        setTurned(Math.min(SEGMENTS, Math.floor(travelled / TAU * SEGMENTS)));
      };
      const finish = (event: PointerEvent) => {
        if (drag?.id !== event.pointerId) return;
        drag = null;
        element.dataset.dragging = "false";
        if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
        if (motion.current.reduced) velocity = 0;
      };
      const down = (event: PointerEvent) => {
        if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
        velocity = 0; tween = null;
        element.setPointerCapture(event.pointerId);
        element.dataset.dragging = "true";
        element.focus({ preventScroll: true });
      };
      const move = (event: PointerEvent) => {
        if (!drag || drag.id !== event.pointerId) return;
        const scale = 5 / Math.max(element.clientWidth, 1);
        const dx = (event.clientX - drag.x) * scale;
        phi += dx; travel(dx);
        theta = Math.max(-1.1, Math.min(1.1, theta + (event.clientY - drag.y) * scale));
        velocity = Math.max(-.04, Math.min(.04, dx));
        drag.x = event.clientX; drag.y = event.clientY;
        draw();
      };
      const key = (event: KeyboardEvent) => {
        const deltas: Record<string, [number, number]> = { ArrowLeft: [-.15, 0], ArrowRight: [.15, 0], ArrowUp: [0, -.12], ArrowDown: [0, .12] };
        if (!deltas[event.key]) return;
        event.preventDefault();
        phi += deltas[event.key][0]; travel(deltas[event.key][0]);
        theta = Math.max(-1.1, Math.min(1.1, theta + deltas[event.key][1]));
        velocity = 0; tween = null; setPaused(true); draw();
      };
      const go = (to: [number, number], ms: number) => {
        if (motion.current.reduced) { phi = to[0]; theta = to[1]; draw(); return; }
        tween = { from: [phi, theta], to, start: performance.now(), ms };
      };
      actions.current = {
        reset: () => { phi = START[0]; theta = START[1]; velocity = 0; tween = null; draw(); },
        // A year's orbit: its cities glow gold and larger, the others dim; the globe turns toward the first one.
        show: (next) => {
          const lit = new Set(next?.cities.map((city) => `${city.lat},${city.lon}`));
          globe.update({ markers: next ? markers.map((marker) => lit.has(marker.location.join(",")) ? { ...marker, size: marker.size * 1.8, color: LIT } : { ...marker, size: marker.size * .7, color: DIM }) : markers });
          const first = next?.cities[0];
          if (first) { const [p, t] = anglesOf(first.lat, first.lon); go([phi + (((p - phi) % TAU + TAU * 1.5) % TAU - TAU / 2), Math.max(-1.1, Math.min(1.1, t))], 1200); }
        },
        whirl: () => go([phi + TAU, theta], 1400),
        focus: (lat, lon) => { const [p, t] = anglesOf(lat, lon); go([phi + (((p - phi) % TAU + TAU * 1.5) % TAU - TAU / 2), Math.max(-1.1, Math.min(1.1, t))], 1100); },
      };
      const tick = (now: number) => {
        const step = Math.min((now - previous) / 16.67 || 1, 3); previous = now;
        if (tween) {
          const t = Math.min(1, (now - tween.start) / tween.ms); const k = t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
          phi = tween.from[0] + (tween.to[0] - tween.from[0]) * k; theta = tween.from[1] + (tween.to[1] - tween.from[1]) * k;
          if (t >= 1) tween = null;
          draw();
        } else if (visible && !document.hidden && !drag && !motion.current.reduced && !motion.current.paused) {
          phi += (.0015 + velocity) * step;
          velocity *= Math.pow(.94, step);
          draw();
        }
        frame = requestAnimationFrame(tick);
      };
      const resize = new ResizeObserver(() => {
        const size = element.getBoundingClientRect().width * dpr;
        globe.update({ width: size, height: size }); draw();
      });
      resize.observe(element);
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; velocity = 0; });
      observer.observe(element);
      element.addEventListener("pointerdown", down);
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", finish);
      element.addEventListener("pointercancel", finish);
      element.addEventListener("lostpointercapture", finish);
      element.addEventListener("keydown", key);
      draw(); frame = requestAnimationFrame(tick);
      cleanup = () => {
        cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); actions.current = null;
        element.removeEventListener("pointerdown", down); element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerup", finish); element.removeEventListener("pointercancel", finish);
        element.removeEventListener("lostpointercapture", finish); element.removeEventListener("keydown", key);
        globe.destroy();
      };
    }).catch(() => { if (!disposed) setUnavailable(true); });
    return () => { disposed = true; cleanup(); };
  }, [markers, closeOrbit]);

  // From the radio, a typed phrase or the hero's hologram: bring the globe into view, whirl it once and close the orbit.
  useEffect(() => {
    return onEgg("orbital-trail", () => void bringIntoView(root.current).then(() => { actions.current?.whirl(); closeOrbit(); }));
  }, [closeOrbit]);

  const close = () => { setOrbitAt(null); actions.current?.show(null); };
  // paw-stamp: Prince turns the globe to the city with the most in-person gatherings and stamps his base on it.
  const stamp = useMemo(() => () => {
    setPaused(true); actions.current?.focus(base.lat, base.lon); discover("paw-stamp"); play("woof"); setStamped(false);
    setTimeout(() => { setStamped(true); play("catch"); }, reduced ? 0 : 1150);
  }, [base, reduced]);
  useEffect(() => onEgg("paw-stamp", () => void bringIntoView(root.current).then(stamp)), [stamp]);
  const percent = Math.round(turned / SEGMENTS * 100);

  return <div className="atlas-globe" ref={root} data-ready={ready || undefined} data-orbit={orbit ? "on" : undefined}>
    <div className="atlas-globe__stage">
      <div className="atlas-globe__odometer" role="img" aria-label={`${labels.odometerLabel}: ${labels.odometer.replace("{n}", String(percent))}`} hidden={!ready}>
        {Array.from({ length: SEGMENTS }, (_, index) => <i key={index} data-on={index < turned || undefined} style={{ "--a": `${index / SEGMENTS * 360}deg` } as CSSProperties} />)}
      </div>
      <span className="atlas-globe__orbit" aria-hidden="true"><i /></span>
      {unavailable ? <p className="globe-fallback">{labels.unavailable}</p>
        : <canvas ref={canvas} className="globe" tabIndex={0} role="group" aria-label={labels.label} aria-describedby="globe-hint" />}
      <span className="atlas-globe__paw" data-on={stamped || undefined} aria-hidden="true" />
      <button type="button" className="atlas-globe__prince" aria-label={princeCopy.base} title={princeCopy.base} onClick={stamp} style={{ backgroundImage: `url(${prince})` }} />
      <span className="atlas-pedestal" data-on={ready || undefined} aria-hidden="true">
        <i className="atlas-pedestal__off" style={{ backgroundImage: `url(${pedestal.off})` }} />
        <i className="atlas-pedestal__on" style={{ backgroundImage: `url(${pedestal.on})` }} />
      </span>
    </div>
    <div className="globe-toolbar" hidden={!ready && !unavailable}>
      <p id="globe-hint">{labels.hint}</p>
      <p className="atlas-globe__percent" aria-hidden="true">{labels.odometer.replace("{n}", String(percent))}</p>
      <div><button type="button" disabled={reduced || unavailable} onClick={() => setPaused(!paused)}>{paused || reduced ? labels.play : labels.pause}</button><button type="button" disabled={unavailable} onClick={() => actions.current?.reset()}>{labels.reset}</button></div>
    </div>
    {stamped && <div className="atlas-base-card" role="region" aria-labelledby="atlas-base-title">
      <p className="atlas-orbit-card__kicker" id="atlas-base-title">{princeCopy.baseTitle.replace("{city}", base.cidade)}</p>
      <p className="atlas-orbit-card__note">{princeCopy.baseCount.replace("{n}", String(base.count))}</p>
      <p className="atlas-orbit-card__actions"><a href={`${path}?q=${encodeURIComponent(base.cidade)}#diario`}>{princeCopy.baseLink}</a><button type="button" onClick={() => setStamped(false)}>{princeCopy.close}</button></p>
    </div>}
    <div className="atlas-orbit-card" hidden={!orbit} role="region" aria-labelledby="atlas-orbit-title">
      {orbit && <>
        <p className="atlas-orbit-card__kicker" id="atlas-orbit-title">{readout.orbit.replace("{year}", String(orbit.year))}</p>
        <p className="atlas-orbit-card__note">{orbit.presencial.length ? readout.orbitNote : readout.orbitOnlySignals}</p>
        {orbit.presencial.length > 0 && <ul className="atlas-orbit-card__list">{orbit.presencial.map((entry) => <li key={entry.id}>
          <a href={`#${eventAnchor(entry.id)}`} onClick={(event) => { if (findEvent(entry.id)) event.preventDefault(); }}>{entry.nome}</a><small>{entry.place}</small>
        </li>)}</ul>}
        {orbit.remoto.length > 0 && <details className="atlas-orbit-card__signals">
          <summary><span className="atlas-orbit-card__ring" aria-hidden="true" />{readout.orbitSignals.replace("{n}", String(orbit.remoto.length))}</summary>
          <ul className="atlas-orbit-card__list">{orbit.remoto.map((entry) => <li key={entry.id}><a href={`#${eventAnchor(entry.id)}`} onClick={(event) => { if (findEvent(entry.id)) event.preventDefault(); }}>{entry.nome}</a><small>{entry.place}</small></li>)}</ul>
        </details>}
        <p className="atlas-orbit-card__actions">
          <a href={`?ano=${orbit.year}#diario`} onClick={(event) => { event.preventDefault(); filterYear(orbit.year); }}>{readout.log}</a>
          <button type="button" onClick={closeOrbit}>{readout.nextOrbit}</button>
          <button type="button" onClick={close}>{readout.close}</button>
        </p>
      </>}
    </div>
  </div>;
}
