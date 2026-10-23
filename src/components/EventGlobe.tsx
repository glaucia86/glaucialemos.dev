"use client";
import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./MotionPreference";

type Labels = { hint: string; label: string; pause: string; play: string; reset: string; unavailable: string };
export type EventGlobeProps = { markers: { location: [number, number]; size: number }[]; labels: Labels };

export default function EventGlobe({ markers, labels }: EventGlobeProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const actions = useRef<{ reset: () => void } | null>(null);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const motion = useRef({ reduced, paused });
  useEffect(() => { motion.current = { reduced, paused }; }, [reduced, paused]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let phi = 5.5, theta = .12, velocity = 0, frame = 0, previous = 0;
    let drag: { id: number; x: number; y: number } | null = null;
    let visible = true;
    let globe: ReturnType<typeof createGlobe>;
    const width = element.getBoundingClientRect().width;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    try {
      globe = createGlobe(element, {
        devicePixelRatio: dpr, width: width * dpr, height: width * dpr, phi, theta,
        dark: 0, diffuse: 1.5, mapSamples: 20000, mapBrightness: 6,
        baseColor: [.76, .67, .85], markerColor: [1, .60, .27], glowColor: [.11, .07, .16],
        markers, markerElevation: .015,
      });
    } catch { setUnavailable(true); return; }
    const draw = () => {
      globe.update({ phi, theta });
      // Expose rendered orientation for keyboard/drag regression checks.
      element.dataset.longitude = phi.toFixed(4);
      element.dataset.latitude = theta.toFixed(4);
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
      velocity = 0;
      element.setPointerCapture(event.pointerId);
      element.dataset.dragging = "true";
      element.focus({ preventScroll: true });
    };
    const move = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      const scale = 5 / Math.max(element.clientWidth, 1);
      const dx = (event.clientX - drag.x) * scale;
      phi += dx;
      theta = Math.max(-1.1, Math.min(1.1, theta + (event.clientY - drag.y) * scale));
      velocity = Math.max(-.04, Math.min(.04, dx));
      drag.x = event.clientX; drag.y = event.clientY;
      draw();
    };
    const key = (event: KeyboardEvent) => {
      const deltas: Record<string, [number, number]> = { ArrowLeft: [-.15, 0], ArrowRight: [.15, 0], ArrowUp: [0, -.12], ArrowDown: [0, .12] };
      if (!deltas[event.key]) return;
      event.preventDefault();
      phi += deltas[event.key][0];
      theta = Math.max(-1.1, Math.min(1.1, theta + deltas[event.key][1]));
      velocity = 0; setPaused(true); draw();
    };
    actions.current = { reset: () => { phi = 5.5; theta = .12; velocity = 0; draw(); } };
    const tick = (now: number) => {
      const step = Math.min((now - previous) / 16.67 || 1, 3); previous = now;
      if (visible && !document.hidden && !drag && !motion.current.reduced && !motion.current.paused) {
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
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); actions.current = null;
      element.removeEventListener("pointerdown", down); element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", finish); element.removeEventListener("pointercancel", finish);
      element.removeEventListener("lostpointercapture", finish); element.removeEventListener("keydown", key);
      globe.destroy();
    };
  }, [markers]);

  return <div className="globe-experience">
    {unavailable ? <p className="globe-fallback">{labels.unavailable}</p> : <canvas ref={canvas} className="globe" tabIndex={0} role="group" aria-label={labels.label} aria-describedby="globe-hint" />}
    <div className="globe-toolbar">
      <p id="globe-hint">{labels.hint}</p>
      <div><button type="button" disabled={reduced || unavailable} onClick={() => setPaused(!paused)}>{paused || reduced ? labels.play : labels.pause}</button><button type="button" disabled={unavailable} onClick={() => actions.current?.reset()}>{labels.reset}</button></div>
    </div>
  </div>;
}
