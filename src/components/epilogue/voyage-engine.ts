// The voyage's deep space, behind the letter, the atlas and the credits. One low-resolution canvas (sticky, full
// viewport): stars in three planes that drift with the scroll and stretch into warp streaks when the visitor scrolls
// fast, clouds of gas tinted with the palette of the world being crossed, and, at the very end, every star converging
// into the next one. Nothing runs between start() and stop().
import type { Palette } from "@/lib/voyage";

const PIXEL = 3;
type Star = { x: number; y: number; plane: number; phase: number; color: number };
type Cloud = { x: number; y: number; r: number; speed: number; phase: number; tint: "accent" | "glow" };

function random(seed: number) { let state = seed; return () => (state = (state * 16807) % 2147483647) / 2147483647; }

export function createVoyage(canvas: HTMLCanvasElement, { lite = false } = {}) {
  const context = canvas.getContext("2d");
  const next = random(1977);
  const stars: Star[] = Array.from({ length: lite ? 140 : 240 }, (_, index) => ({ x: next(), y: next(), plane: index % 7 === 0 ? 2 : index % 3 === 0 ? 1 : 0, phase: next() * 6.3, color: Math.floor(next() * 3) }));
  const clouds: Cloud[] = Array.from({ length: 6 }, (_, index) => ({ x: next(), y: next(), r: .18 + next() * .22, speed: .2 + next() * .5, phase: next() * 6.3, tint: index % 2 ? "glow" : "accent" }));
  let width = 0; let height = 0; let frame = 0; let running = false; let last = 0; let time = 0;
  let progress = 0; let velocity = 0; let warp = 0;
  let palette: Palette = { base: "#060a18", accent: "#83efac", glow: "#f07f77" };

  const resize = () => {
    width = Math.max(1, Math.round(canvas.clientWidth / PIXEL)); height = Math.max(1, Math.round(canvas.clientHeight / PIXEL));
    canvas.width = width; canvas.height = height;
  };

  // A soft cloud: a flattened radial gradient on the low-resolution canvas (grainy, never banded).
  const cloud = (cx: number, cy: number, radius: number, color: string, alpha = .16) => {
    if (!context || radius < 1) return;
    context.save();
    context.translate(cx, cy); context.scale(1, .6);
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, color); gradient.addColorStop(1, "transparent");
    context.globalAlpha = alpha; context.fillStyle = gradient;
    context.fillRect(-radius, -radius, radius * 2, radius * 2);
    context.restore();
  };

  const draw = (now: number) => {
    if (!running || !context) return;
    const delta = Math.min(.05, (now - (last || now)) / 1000); last = now; time += delta;
    // Warp eases toward the scroll speed and relaxes when the visitor stops.
    warp += (Math.min(1, Math.abs(velocity) / 2600) - warp) * Math.min(1, delta * 6);
    velocity *= Math.max(0, 1 - delta * 3);
    const direction = Math.sign(velocity) || 1;
    context.globalAlpha = 1; context.fillStyle = palette.base; context.fillRect(0, 0, width, height);
    context.globalAlpha = .55; context.fillStyle = "#03050c"; context.fillRect(0, 0, width, height);
    for (const item of clouds) {
      const x = ((item.x + Math.sin(time * .03 * item.speed + item.phase) * .05) % 1) * width;
      const y = (((item.y - progress * item.speed * 1.5) % 1 + 1) % 1) * height * 1.3 - height * .15;
      cloud(x, y, item.r * Math.max(width, height), palette[item.tint]);
    }
    // Only the last stretch (the invitation to the next star) pulls the sky together.
    const converge = Math.max(0, (progress - .95) / .05);
    const cx = width / 2; const cy = height / 2;
    const colors = ["#fff0c9", palette.accent, palette.glow];
    for (const star of stars) {
      const depth = [.25, .55, 1][star.plane];
      let x = star.x * width;
      let y = (((star.y - progress * depth * 2.2) % 1 + 1) % 1) * height;
      if (converge) { const k = converge ** 2 * (.6 + depth * .4); x += (cx - x) * k; y += (cy - y) * k; }
      const twinkle = .6 + .4 * Math.sin(time * (1 + depth * 2) + star.phase);
      const alpha = [.45, .7, .95][star.plane] * twinkle;
      context.fillStyle = star.plane === 2 ? colors[star.color] : "#fff0c9";
      const streak = Math.round(warp * 34 * depth);
      for (let step = 0; step <= streak; step++) {
        context.globalAlpha = alpha * (1 - step / (streak + 1));
        context.fillRect(Math.round(x), Math.round(y + step * direction), 1, 1);
      }
    }
    if (converge) {
      // The next star: a pulsing core that grows as the voyage arrives.
      const radius = 2 + converge * 10 + Math.sin(time * 3) * converge;
      cloud(cx, cy, radius * 4, palette.glow, .5 * converge);
      context.globalAlpha = converge; context.fillStyle = "#ffffff";
      context.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 3, 3);
      context.globalAlpha = converge * .35;
      context.fillRect(Math.round(cx) - 2, Math.round(cy), 5, 1); context.fillRect(Math.round(cx), Math.round(cy) - 2, 1, 5);
    }
    context.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  return {
    start() { if (running) return; running = true; last = 0; frame = requestAnimationFrame(draw); },
    stop() { running = false; cancelAnimationFrame(frame); },
    destroy() { this.stop(); observer.disconnect(); },
    // Scroll progress through the voyage (0..1), the scroll velocity (px/s) and the palette of the world in view.
    set(state: { progress?: number; velocity?: number; palette?: Palette }) {
      if (state.progress !== undefined) progress = state.progress;
      if (state.velocity !== undefined) velocity = state.velocity;
      if (state.palette) palette = state.palette;
    },
  };
}
