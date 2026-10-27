// The eclipse over Aurélia: a pixel sun with a turning corona, the ringed planet sliding across it, the diamond-ring
// flash at totality; and, once night falls, a field of fireflies that drift toward the pointer.
export const ECLIPSE_PIXEL = 3;
const TAU = Math.PI * 2;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
export type EclipseState = { cover: number; corona: number; time: number };

/** Where the planet's centre sits for a cover value: from the right, across the sun, to totality at 1. */
export const planetOffset = (cover: number) => (1 - clamp(cover)) * 1.35;
/** The diamond ring shows just before totality. */
export const diamondAt = (cover: number) => Math.max(0, 1 - Math.abs(clamp(cover) - .93) / .07);

export function createEclipse(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  let size = 1;
  const resize = () => {
    size = Math.max(1, Math.min(320, Math.round(canvas.clientWidth / ECLIPSE_PIXEL)));
    canvas.width = canvas.height = size;
    if (ctx) ctx.imageSmoothingEnabled = false;
  };
  const dot = (x: number, y: number, color: string, alpha: number, w = 1, h = 1) => {
    if (!ctx || alpha <= 0) return;
    ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const disc = (cx: number, cy: number, r: number, color: (x: number, y: number, d: number) => string | null) => {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = Math.hypot(x, y) / r;
      if (d > 1) continue;
      const fill = color(x, y, d);
      if (fill) dot(cx + x, cy + y, fill, 1);
    }
  };
  function draw({ cover, corona, time }: EclipseState) {
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    const c = size / 2, sun = Math.round(size * .2), glow = clamp(corona + cover * .4);
    // Corona: rays that turn slowly and grow as the light disappears.
    for (let k = 0; k < 48; k++) {
      const a = k / 48 * TAU + time * .05, length = sun * (1.15 + glow * (.5 + .45 * Math.sin(k * 3.7 + time)));
      for (let r = sun + 1; r < length; r += 1.5) dot(c + Math.cos(a) * r, c + Math.sin(a) * r, k % 3 ? '#ffd27a' : '#fff4dd', (1 - (r - sun) / (length - sun)) * (.25 + glow * .55));
    }
    disc(c, c, sun, (x, y, d) => d > .86 ? '#ffd27a' : (x + y) % 5 === 0 ? '#fff4dd' : '#ffe9b0');
    // The ringed planet slides in from the right and covers the sun.
    const px = c + planetOffset(cover) * sun * 2, planet = Math.round(sun * 1.04);
    disc(px, c, planet, (x, y, d) => d > .93 ? '#87e4c1' : Math.sin(y * .5 + x * .1) > .6 ? '#0d3a3c' : '#061a1e');
    for (let k = 0; k < 120; k++) {
      const a = k / 120 * TAU, x = Math.cos(a) * planet * 1.75, y = Math.sin(a) * planet * .32;
      if (Math.sin(a) < 0 && Math.hypot(x, y) < planet) continue;
      dot(px + x * Math.cos(-.35) - y * Math.sin(-.35), c + x * Math.sin(-.35) + y * Math.cos(-.35), '#87e4c1', .55);
    }
    const diamond = diamondAt(cover);
    if (diamond > 0) {
      const dx = c - sun * .72, dy = c - sun * .7;
      dot(dx - 2, dy - 2, '#ffffff', diamond, 5, 5);
      for (let r = 3; r < sun * 1.6; r++) { dot(dx - r, dy, '#fff4dd', diamond * (1 - r / (sun * 1.6)), 1, 1); dot(dx + r, dy, '#fff4dd', diamond * (1 - r / (sun * 1.6))); dot(dx, dy - r, '#fff4dd', diamond * (1 - r / (sun * 1.6))); dot(dx, dy + r, '#fff4dd', diamond * (1 - r / (sun * 1.6))); }
    }
    ctx.globalAlpha = 1;
  }
  resize();
  return { draw, resize };
}

/** Night-only fireflies over the whole page: a fixed canvas, a few dozen pixels that wander and lean toward the pointer. */
export function createFireflies(canvas: HTMLCanvasElement, count = 70) {
  const ctx = canvas.getContext('2d');
  let width = 1, height = 1, raf = 0, previous = 0, alpha = 0, target = 0, pointer: { x: number; y: number } | null = null;
  let seed = 13;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const flies = Array.from({ length: count }, () => ({ x: random(), y: random(), vx: 0, vy: 0, phase: random() * TAU, warm: random() > .7 }));
  const resize = () => {
    width = canvas.width = Math.max(1, Math.round(innerWidth / 2)); height = canvas.height = Math.max(1, Math.round(innerHeight / 2));
    if (ctx) ctx.imageSmoothingEnabled = false;
  };
  const step = (now: number) => {
    const dt = previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now;
    alpha += (target - alpha) * Math.min(1, dt * 2.5);
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    for (const fly of flies) {
      fly.phase += dt * 2;
      fly.vx += Math.cos(fly.phase * .7) * .002 * dt * 60; fly.vy += Math.sin(fly.phase * .9) * .002 * dt * 60;
      if (pointer) { const dx = pointer.x - fly.x, dy = pointer.y - fly.y, d = Math.hypot(dx, dy); if (d < .3) { fly.vx += dx * .02 * dt * 60; fly.vy += dy * .02 * dt * 60; } }
      fly.vx *= .94; fly.vy *= .94;
      fly.x = (fly.x + fly.vx * dt * 6 + 1) % 1; fly.y = (fly.y + fly.vy * dt * 6 + 1) % 1;
      const glow = (.45 + Math.sin(fly.phase * 3) * .45) * alpha;
      ctx.globalAlpha = glow * .35; ctx.fillStyle = fly.warm ? '#ffd27a' : '#87e4c1'; ctx.fillRect(Math.round(fly.x * width) - 1, Math.round(fly.y * height) - 1, 3, 3);
      ctx.globalAlpha = glow; ctx.fillStyle = '#f4fff8'; ctx.fillRect(Math.round(fly.x * width), Math.round(fly.y * height), 1, 1);
    }
    ctx.globalAlpha = 1;
    if (target === 0 && alpha < .01) { ctx.clearRect(0, 0, width, height); raf = 0; previous = 0; return; }
    raf = requestAnimationFrame(step);
  };
  const move = (event: PointerEvent) => { pointer = { x: event.clientX / innerWidth, y: event.clientY / innerHeight }; };
  const leave = () => { pointer = null; };
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; previous = 0; } else if (target || alpha > .01) raf ||= requestAnimationFrame(step); };
  resize();
  addEventListener('resize', resize); addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', visibility);
  return {
    show(on: boolean) { target = on ? 1 : 0; if (!raf && !document.hidden) raf = requestAnimationFrame(step); },
    destroy() {
      cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', visibility);
      ctx?.clearRect(0, 0, width, height);
    },
  };
}
