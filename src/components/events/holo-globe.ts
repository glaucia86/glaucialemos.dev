// The hologram over the hero's pedestal: the real globe (cobe) rendered at a fraction of its size and scaled up with
// `image-rendering: pixelated`, so it reads as pixel art in cyan. Only in-person cities are markers. It never steals the
// big globe's controls: it spins on its own, whirls a full turn on request and turns to face a coordinate.
import createGlobe from "cobe";
import { anglesOf } from "@/lib/atlas-records";

export type HoloMarker = { location: [number, number]; size: number };
const PIXEL = 2;
const TAU = Math.PI * 2;
const ease = (t: number) => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export function createHolo(canvas: HTMLCanvasElement, markers: HoloMarker[], { reduced = false } = {}) {
  let phi = 4.4; let theta = .3;
  let frame = 0; let running = false; let last = 0;
  let tween: { from: [number, number]; to: [number, number]; start: number; ms: number; done?: () => void } | null = null;
  const size = () => Math.max(48, Math.round(canvas.clientWidth / PIXEL));
  let globe: ReturnType<typeof createGlobe> | null = null;
  try {
    const s = size();
    globe = createGlobe(canvas, {
      devicePixelRatio: 1, width: s, height: s, phi, theta,
      dark: 1, diffuse: 2.2, mapSamples: 14000, mapBrightness: 10, mapBaseBrightness: .08,
      baseColor: [.2, .7, .88], markerColor: [.97, .76, .42], glowColor: [.29, .87, 1],
      markers: markers.map((marker) => ({ ...marker, size: marker.size * 1.6 })), markerElevation: .03, opacity: .9,
    });
  } catch { globe = null; }
  const draw = () => globe?.update({ phi, theta });

  const tick = (now: number) => {
    if (!running) return;
    const delta = last ? Math.min(3, (now - last) / 16.67) : 1; last = now;
    if (tween) {
      const t = Math.min(1, (now - tween.start) / tween.ms);
      const k = ease(t);
      phi = tween.from[0] + (tween.to[0] - tween.from[0]) * k;
      theta = tween.from[1] + (tween.to[1] - tween.from[1]) * k;
      if (t >= 1) { const done = tween.done; tween = null; done?.(); }
    } else phi += .006 * delta;
    draw();
    frame = requestAnimationFrame(tick);
  };
  const go = (to: [number, number], ms: number, done?: () => void) => {
    if (reduced || !running) { phi = to[0]; theta = to[1]; draw(); done?.(); return; }
    tween = { from: [phi, theta], to, start: performance.now(), ms, done };
  };
  const resize = new ResizeObserver(() => { const s = size(); globe?.update({ width: s, height: s }); draw(); });
  resize.observe(canvas);
  draw();

  return {
    available: () => globe !== null,
    start() { if (running || reduced || !globe) return; running = true; last = 0; frame = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(frame); },
    // A whole revolution (the orbit), ending where it started plus one turn.
    whirl(done?: () => void) { go([phi + TAU, theta], 1400, done); },
    // Turn the shortest way to face a city.
    focus(lat: number, lon: number, done?: () => void) {
      const [target, tilt] = anglesOf(lat, lon);
      const turn = ((target - phi) % TAU + TAU * 1.5) % TAU - TAU / 2;
      go([phi + turn, Math.max(-1, Math.min(1, tilt))], 1100, done);
    },
    rest(done?: () => void) { go([phi, .3], 700, done); },
    // The tablet's joystick: turn by hand (radians), the tilt clamped so the poles never flip.
    nudge(dphi: number, dtheta = 0) { tween = null; phi += dphi; theta = Math.max(-1, Math.min(1, theta + dtheta)); draw(); },
    // Light only one year's cities (or all of them again).
    show(next: HoloMarker[] | null) { globe?.update({ markers: (next ?? markers).map((marker) => ({ ...marker, size: marker.size * 1.6 })) }); draw(); },
    destroy() { running = false; cancelAnimationFrame(frame); resize.disconnect(); globe?.destroy(); globe = null; },
  };
}
export type Holo = ReturnType<typeof createHolo>;
