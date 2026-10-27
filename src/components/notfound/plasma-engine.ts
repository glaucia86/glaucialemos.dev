// Maré Rubra over the video: embers rising from the deck, plasma motes drifting across the window, and short
// horizontal glitch bands when the signal stutters. The warp is a separate, finite effect used to leave the page.
export const PLASMA_PIXEL = 3;
const TAU = Math.PI * 2;
const EMBER = ['#ffbc78', '#f6a0a5', '#f07072', '#fff0d8'];

/** Signal stutter: on for a short band every few seconds (deterministic, so it can be tested). */
export const glitchAt = (time: number, period = 4.2, length = .18) => (time % period) < length;
/** The window area of the plate where plasma motes live (fractions of the 16:9 frame). */
export const WINDOW = { left: .36, right: .94, top: .06, bottom: .72 } as const;

export function createPlasma(canvas: HTMLCanvasElement, light = false) {
  const ctx = canvas.getContext('2d');
  let width = 1, height = 1, seed = 7;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const embers = Array.from({ length: light ? 36 : 70 }, () => ({ u: .3 + random() * .7, v: random(), speed: .02 + random() * .05, phase: random() * TAU, color: EMBER[Math.floor(random() * EMBER.length)] }));
  const motes = Array.from({ length: light ? 50 : 110 }, () => ({ u: random(), v: random(), speed: .004 + random() * .012, phase: random() * TAU }));
  const resize = () => {
    width = canvas.width = Math.max(1, Math.min(640, Math.round(canvas.clientWidth / PLASMA_PIXEL)));
    height = canvas.height = Math.max(1, Math.min(360, Math.round(canvas.clientHeight / PLASMA_PIXEL)));
    if (ctx) ctx.imageSmoothingEnabled = false;
  };
  const dot = (x: number, y: number, color: string, alpha: number, w = 1, h = 1) => {
    if (!ctx || alpha <= 0) return;
    ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  resize();
  return {
    resize,
    draw(time: number, alarm = 1) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const w = WINDOW;
      for (const mote of motes) {
        const u = w.left + ((mote.u + time * mote.speed) % 1) * (w.right - w.left);
        const v = w.top + (mote.v + Math.sin(time * .6 + mote.phase) * .02) * (w.bottom - w.top);
        dot(u * width, v * height, '#f6a0a5', .18 + Math.sin(time * 2 + mote.phase) ** 2 * .35);
      }
      for (const ember of embers) {
        const v = 1 - ((ember.v + time * ember.speed) % 1) * .55;
        const u = ember.u + Math.sin(time * 1.3 + ember.phase) * .01;
        dot(u * width, v * height, ember.color, (1 - (1 - v) / .55) * .8, 1, 1);
      }
      if (alarm > 0 && glitchAt(time)) {
        const y = Math.floor(((Math.floor(time / 4.2) * 0.37) % 1) * height);
        for (let k = 0; k < 3; k++) dot(0, y + k * 5, k % 2 ? '#00e5ff' : '#ff2e63', .16 * alarm, width, 1 + k);
      }
      ctx.globalAlpha = 1;
    },
    clear: () => ctx?.clearRect(0, 0, width, height),
  };
}

/** The jump home: coral streaks stretching from the portal outward, then a white-out. `progress` 0–1. */
export function drawWarp(canvas: HTMLCanvasElement, progress: number, origin: { x: number; y: number }) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width = Math.max(1, Math.round(innerWidth / PLASMA_PIXEL)), h = canvas.height = Math.max(1, Math.round(innerHeight / PLASMA_PIXEL));
  ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, w, h);
  const ox = origin.x / PLASMA_PIXEL, oy = origin.y / PLASMA_PIXEL, reach = Math.hypot(w, h);
  for (let k = 0; k < 160; k++) {
    const a = k * 2.399963, start = ((k * .618) % 1) * reach * .25 * progress, length = progress ** 2 * reach * (.3 + (k % 7) / 10);
    ctx.fillStyle = EMBER[k % EMBER.length]; ctx.globalAlpha = Math.min(1, progress * 1.4);
    for (let s = 0; s < length; s += 2) ctx.fillRect(Math.round(ox + Math.cos(a) * (start + s)), Math.round(oy + Math.sin(a) * (start + s)), 1, 1);
  }
  if (progress > .7) { ctx.globalAlpha = (progress - .7) / .3; ctx.fillStyle = '#fff0d8'; ctx.fillRect(0, 0, w, h); }
  ctx.globalAlpha = 1;
}
