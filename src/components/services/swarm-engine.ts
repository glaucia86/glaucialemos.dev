// Prince's firefly swarm: a flock of pixels (seek the target, keep apart, wander) that pollinates a garden bed by
// hovering over it. Canvas coordinates are CSS pixels / SWARM_PIXEL; the caller owns the animation loop.
export const SWARM_PIXEL = 2;
export const DWELL_SECONDS = .8;
const TAU = Math.PI * 2;
type Fly = { x: number; y: number; vx: number; vy: number; phase: number; warm: boolean };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
export type Rect = { x: number; y: number; w: number; h: number };

/** Index of the rect that contains a point, or -1. */
export const rectAt = (rects: readonly Rect[], x: number, y: number) => rects.findIndex(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
/** Dwell bookkeeping: time over a bed accumulates, leaving it decays; a bed reaching DWELL_SECONDS is pollinated once. */
export function dwellStep(dwell: number[], inside: number, dt: number, done: readonly boolean[]) {
  let reached = -1;
  dwell.forEach((value, i) => {
    if (done[i]) return;
    dwell[i] = i === inside ? value + dt : Math.max(0, value - dt * 2);
    if (dwell[i] >= DWELL_SECONDS && reached < 0) reached = i;
  });
  return reached;
}

export function createSwarm(canvas: HTMLCanvasElement, count = 60) {
  const ctx = canvas.getContext('2d');
  let width = 1, height = 1, seed = 29;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  let flies: Fly[] = [];
  const sparks: Spark[] = [];
  const resize = () => {
    width = canvas.width = Math.max(1, Math.round(canvas.clientWidth / SWARM_PIXEL));
    height = canvas.height = Math.max(1, Math.round(canvas.clientHeight / SWARM_PIXEL));
    if (ctx) ctx.imageSmoothingEnabled = false;
  };
  const dot = (x: number, y: number, color: string, alpha: number, w = 1, h = 1) => {
    if (!ctx || alpha <= 0) return;
    ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  resize();
  return {
    resize, size: () => ({ width, height }),
    spawn(x: number, y: number) {
      flies = Array.from({ length: count }, () => ({ x: x + (random() - .5) * 8, y: y + (random() - .5) * 8, vx: (random() - .5) * 60, vy: -random() * 60, phase: random() * TAU, warm: random() > .65 }));
    },
    burst(x: number, y: number, amount = 36) {
      for (let i = 0; i < amount; i++) { const a = random() * TAU, speed = 20 + random() * 60; sparks.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 20, life: 1, color: ['#ffa69e', '#ffd27a', '#87e4c1', '#fff4dd'][i % 4] }); }
    },
    /** One simulation step toward (tx, ty); returns the swarm's centre. */
    step(dt: number, tx: number, ty: number) {
      let cx = 0, cy = 0;
      for (const fly of flies) {
        fly.phase += dt * 3;
        const dx = tx - fly.x, dy = ty - fly.y, d = Math.max(1, Math.hypot(dx, dy));
        const pull = Math.min(1, d / 30) * 160;
        fly.vx += (dx / d * pull + Math.cos(fly.phase) * 40) * dt;
        fly.vy += (dy / d * pull + Math.sin(fly.phase * 1.3) * 40) * dt;
        fly.vx *= Math.pow(.15, dt); fly.vy *= Math.pow(.15, dt);
        fly.x += fly.vx * dt; fly.y += fly.vy * dt;
        cx += fly.x; cy += fly.y;
      }
      // Keep apart: a cheap pass against a neighbour, enough to keep a loose cloud.
      for (let i = 0; i < flies.length; i++) {
        const a = flies[i], b = flies[(i + 7) % flies.length], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d > 0 && d < 4) { a.vx += dx / d * 12; a.vy += dy / d * 12; }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.life -= dt * .9; s.vy += 40 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.life <= 0) sparks.splice(i, 1);
      }
      const n = Math.max(1, flies.length);
      return { x: cx / n, y: cy / n };
    },
    draw(threads: { x: number; y: number }[] = [], threadAlpha = 0, time = 0) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      // Light threads between the pollinated beds, with pollen running along them.
      if (threadAlpha > 0) for (let i = 0; i < threads.length - 1; i++) {
        const a = threads[i], b = threads[i + 1], steps = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
        for (let s = 0; s < steps; s += 2) dot(a.x + (b.x - a.x) * s / steps, a.y + (b.y - a.y) * s / steps + Math.sin(s * .08 + time * 3) * 2, '#87e4c1', threadAlpha * .55);
        for (let k = 0; k < 4; k++) { const t = (time * .35 + k / 4) % 1; dot(a.x + (b.x - a.x) * t - 1, a.y + (b.y - a.y) * t - 1, '#fff4dd', threadAlpha, 3, 3); }
      }
      for (const fly of flies) {
        const glow = .55 + Math.sin(fly.phase * 2) * .45;
        dot(fly.x - 1, fly.y - 1, fly.warm ? '#ffd27a' : '#87e4c1', glow * .35, 3, 3);
        dot(fly.x, fly.y, '#f4fff8', glow);
      }
      for (const s of sparks) dot(s.x, s.y, s.color, s.life);
      ctx.globalAlpha = 1;
    },
    count: () => flies.length,
    clear() { flies = []; sparks.length = 0; ctx?.clearRect(0, 0, width, height); },
  };
}
