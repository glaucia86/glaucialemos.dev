// Petals and light for the contact portal and the message launch. Logical pixels on a bounded backing store.
export const PORTAL_PIXEL = 3;
export const PORTAL_PETALS = 140;
const PETAL = '#ffa69e', MINT = '#87e4c1', CREAM = '#f9d3ba', DEW = '#d5fff0', GOLD = '#fff4dd';
const TAU = Math.PI * 2;

/** Radius that covers the whole viewport from the CTA's point, for the iris that opens the portal. */
export function portalRadius(x: number, y: number, width: number, height: number) {
  return Math.ceil(Math.hypot(Math.max(x, width - x), Math.max(y, height - y)));
}

function surface(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  let width = 1, height = 1;
  const resize = () => {
    const w = Math.max(1, Math.min(640, Math.round(canvas.clientWidth / PORTAL_PIXEL)));
    const h = Math.max(1, Math.min(480, Math.round(canvas.clientHeight / PORTAL_PIXEL)));
    if (w !== canvas.width || h !== canvas.height) { canvas.width = width = w; canvas.height = height = h; }
    else { width = w; height = h; }
    if (ctx) ctx.imageSmoothingEnabled = false;
  };
  const clear = () => ctx?.clearRect(0, 0, width, height);
  const dot = (x: number, y: number, color: string, alpha: number, w = 1, h = 1) => {
    if (!ctx || alpha <= 0) return;
    ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  return { ctx, resize, clear, dot, size: () => ({ width, height }) };
}

function seeded(start: number) {
  let seed = start;
  return () => (seed = seed * 16807 % 2147483647) / 2147483647;
}

/** A slow galaxy of petals around the form. `open(p)` spirals them in; `tick(dt)` lets them orbit while the portal is open. */
export function createPortalSky(canvas: HTMLCanvasElement) {
  const s = surface(canvas), random = seeded(23);
  let time = 0, opening = 0;
  const petals = Array.from({ length: PORTAL_PETALS }, (_, i) => ({
    angle: random() * TAU, ring: .18 + random() * .82, speed: .25 + random() * .6, big: i % 5 === 0,
    color: [PETAL, MINT, CREAM, DEW][i % 4], phase: random() * TAU,
  }));
  const draw = () => {
    s.clear();
    const { width, height } = s.size(), o = Math.max(0, Math.min(1, opening));
    const reach = Math.max(width, height) * .5;
    petals.forEach((p, i) => {
      const spin = p.angle + (1 - o) * 5 + time * p.speed * .18;
      const radius = (p.ring * .7 + (1 - o) ** 2 * 1.1) * reach;
      const x = width / 2 + Math.cos(spin) * radius * 1.2;
      const y = height * .55 + Math.sin(spin) * radius * .62 - Math.sin(time * .5 + p.phase) * 2;
      const alpha = o * (.22 + Math.sin(time * 1.2 + p.phase + i) ** 2 * .5);
      s.dot(x, y, p.color, alpha, p.big ? 3 : 1, p.big ? 2 : 1);
      if (p.big) s.dot(x + (Math.sin(time * 3 + p.phase) > 0 ? 2 : -1), y - 1, CREAM, alpha * .8, 2, 1);
    });
    if (s.ctx) s.ctx.globalAlpha = 1;
  };
  return {
    resize: () => { s.resize(); draw(); },
    open(progress: number) { opening = progress; draw(); },
    tick(dt: number) { time += Math.min(.05, Math.max(0, dt)); draw(); },
    clear: s.clear,
  };
}

export type LaunchState = { rise: number; burst: number; fall: number };

/** The message as a signal: it climbs from the garden to the stars, blooms into a constellation, or falters and falls. */
export function createSignalSky(canvas: HTMLCanvasElement) {
  const s = surface(canvas), random = seeded(71);
  const stars = Array.from({ length: 90 }, () => ({ u: random(), v: random() * .7, phase: random() * TAU, big: random() > .85 }));
  const sparks = Array.from({ length: 36 }, () => ({ dx: random() - .5, dy: .3 + random() * .9, color: random() > .5 ? PETAL : CREAM }));
  return {
    resize: s.resize,
    clear: s.clear,
    draw({ rise, burst, fall }: LaunchState) {
      s.clear();
      const { width, height } = s.size();
      const cx = width / 2, ground = height * .94, sky = height * .12;
      const peak = ground - (ground - sky) * Math.max(0, Math.min(1, rise));
      const y = peak + (ground - peak) * fall ** 1.6;
      for (let x = 0; x < width; x += 2) s.dot(x, ground + Math.sin(x * .3) * 1.5, MINT, .12 + .2 * (1 - Math.abs(x - cx) / cx) * (1 - fall * .6));
      for (let i = 0; i < 64; i++) {
        const t = i / 64, ty = y + (ground - y) * t;
        const sway = Math.sin(ty * .14 + rise * 18) * (1 + t * 4) * (1 + fall * 2);
        s.dot(cx + sway, ty, t < .08 ? GOLD : MINT, (1 - t) * .85 * (1 - fall * .75) * Math.min(1, rise * 6));
        if (i % 9 === 4) s.dot(cx + sway * 2.4 + (i % 2 ? 4 : -4) * t, ty, PETAL, (1 - t) * .6 * (1 - fall), 2, 1);
      }
      if (rise > 0) {
        const glow = 1 - fall * .8;
        s.dot(cx - 1, y - 1, GOLD, glow, 3, 3); s.dot(cx - 2, y, DEW, glow * .45, 5, 1); s.dot(cx, y - 2, DEW, glow * .45, 1, 5);
      }
      if (fall > 0) sparks.forEach(p => s.dot(cx + p.dx * fall * width * .3, peak + fall ** 2 * height * .45 * p.dy, p.color, (1 - fall) * .9));
      if (burst > 0) {
        for (let k = 0; k < 48; k++) {
          const a = k / 48 * TAU, r = burst * Math.min(width, height) * .38;
          s.dot(cx + Math.cos(a) * r, sky + Math.sin(a) * r * .55, k % 3 ? GOLD : PETAL, (1 - burst) * .9, k % 4 ? 1 : 2, 1);
        }
        stars.forEach(star => s.dot(star.u * width, star.v * height, star.big ? GOLD : DEW, Math.min(1, burst * 1.6) * (.35 + Math.sin(burst * 12 + star.phase) ** 2 * .6), star.big ? 2 : 1, star.big ? 2 : 1));
      }
      if (s.ctx) s.ctx.globalAlpha = 1;
    },
  };
}
