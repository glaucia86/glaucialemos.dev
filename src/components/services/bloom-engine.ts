// Aurélia's garden blooming with the scroll: one pixel flower per real service, grown seed → stem → leaves → bud → petals.
// No animation loop: draw(progress) is called by the scroll timeline only.
export const BLOOM_PIXEL = 3;
export type FlowerKind = 'coral' | 'mint' | 'gold';
type Palette = { petal: string; inner: string; center: string; petals: number; width: number };
const PALETTES: Record<FlowerKind, Palette> = {
  coral: { petal: '#ffa69e', inner: '#f07f77', center: '#fff4dd', petals: 6, width: .34 },
  mint: { petal: '#87e4c1', inner: '#3fb79a', center: '#f9d3ba', petals: 8, width: .22 },
  gold: { petal: '#ffd27a', inner: '#f9d3ba', center: '#f07f77', petals: 12, width: .16 },
};
const STEM = '#3fb79a', LEAF = '#87e4c1', SOIL = '#3a2a2a', MOSS = '#285b62', DEW = '#d5fff0';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => 1 - (1 - clamp(value)) ** 3;

/** Which service is growing and how far along it is. Each takes an equal slice of the scroll. */
export function bloomPhase(progress: number, count: number) {
  const scaled = clamp(progress) * count;
  const index = Math.min(count - 1, Math.floor(scaled));
  return { index, local: clamp(scaled - index) };
}
/** The flower's anatomy at a local time t (0–1): fully open at 0.8, glowing after. */
export function flowerState(t: number) {
  return { stem: ease(t / .35), leaves: ease((t - .2) / .25), bud: ease((t - .3) / .15), open: ease((t - .45) / .35), glow: clamp((t - .8) / .2) };
}

export function createBloomGarden(canvas: HTMLCanvasElement, kinds: FlowerKind[]) {
  const ctx = canvas.getContext('2d');
  let width = 1, height = 1, last = 0;
  const resize = () => {
    width = canvas.width = Math.max(1, Math.min(640, Math.round(canvas.clientWidth / BLOOM_PIXEL)));
    height = canvas.height = Math.max(1, Math.min(420, Math.round(canvas.clientHeight / BLOOM_PIXEL)));
    if (ctx) ctx.imageSmoothingEnabled = false;
  };
  const dot = (x: number, y: number, color: string, alpha = 1, w = 1, h = 1) => {
    if (!ctx || alpha <= 0) return;
    ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const bed = (ground: number) => {
    const left = Math.round(width * .06), right = Math.round(width * .94);
    for (let x = left; x < right; x++) {
      const edge = Math.min(x - left, right - x);
      const depth = Math.min(10, 2 + edge * .35) + Math.sin(x * .7) * 1.5;
      dot(x, ground, MOSS); dot(x, ground - 1, LEAF, x % 3 ? .35 : .7);
      for (let y = 1; y < depth; y++) dot(x, ground + y, SOIL, 1 - y / depth * .5);
      if (x % 11 === 0) for (let y = 0; y < 6 + (x % 5); y++) dot(x + Math.sin(y) * .6, ground + depth + y, STEM, .5 - y * .06);
    }
  };
  const flower = (kind: FlowerKind, cx: number, ground: number, t: number, scale: number) => {
    const p = PALETTES[kind], s = flowerState(t), tall = height * .5 * scale;
    if (t <= 0) { dot(cx - 2, ground - 2, SOIL, 1, 5, 2); dot(cx, ground - 3, '#f9d3ba', .8, 2, 1); return; }
    const top = ground - tall * s.stem;
    const sway = (y: number) => Math.sin((ground - y) * .05) * 2 * s.stem;
    for (let y = ground; y > top; y--) { dot(cx + sway(y), y, STEM, 1, 2, 1); if (y % 4 === 0) dot(cx + sway(y) + 1, y, LEAF, .5); }
    for (const [at, side] of [[.32, -1], [.55, 1], [.72, -1]] as const) {
      const y0 = ground - tall * s.stem * at, length = 12 * scale * s.leaves;
      for (let d = 0; d < length; d++) {
        const x = cx + sway(y0) + side * (d + 1), y = y0 - d * .55 + (d / Math.max(1, length)) ** 2 * 3;
        const thick = Math.sin(Math.PI * d / Math.max(1, length)) * 2.4;
        for (let o = -thick; o <= thick; o++) dot(x, y + o, o < 0 ? LEAF : STEM);
      }
    }
    const hx = cx + sway(top), radius = Math.min(width * .09, height * .16) * scale;
    if (s.bud > 0 && s.open < .12) for (let o = -3; o <= 3; o++) dot(hx - 2 + Math.abs(o) * .3, top - 3 * s.bud + o * s.bud, p.inner, 1, 4 - Math.abs(o) * .5, 1);
    if (s.open > 0) {
      const length = radius * (.25 + .75 * s.open), turn = (1 - s.open) * .9;
      for (let k = 0; k < p.petals; k++) {
        const a = turn + k / p.petals * Math.PI * 2;
        const cos = Math.cos(a), sin = Math.sin(a);
        for (let d = 1; d < length; d++) {
          const half = Math.sin(Math.PI * d / length) * length * p.width;
          for (let o = -half; o <= half; o += 1) dot(hx + cos * d - sin * o, top + sin * d * .82 + cos * o * .82, d < length * .45 ? p.inner : p.petal);
        }
      }
      const core = Math.max(1, radius * .24 * s.open);
      for (let y = -core; y <= core; y++) for (let x = -core; x <= core; x++) if (x * x + y * y <= core * core) dot(hx + x, top + y * .85, p.center);
      dot(hx - core * .4, top - core * .4, '#ffffff', .8);
    }
    if (s.glow > 0) {
      for (let k = 0; k < 16; k++) {
        const a = k / 16 * Math.PI * 2 + s.glow, r = radius * (1.15 + .25 * Math.sin(k * 3));
        dot(hx + Math.cos(a) * r, top + Math.sin(a) * r * .8, k % 2 ? DEW : p.petal, s.glow * .7);
      }
      for (let k = 0; k < 10; k++) dot(hx + Math.sin(k * 7.3) * radius, top - s.glow * (8 + k * 3) - k, '#fff4dd', s.glow * (1 - k / 12));
    }
  };
  const draw = (progress: number) => {
    if (!ctx) return;
    last = progress;
    ctx.clearRect(0, 0, width, height);
    const ground = Math.round(height * .84), { index, local } = bloomPhase(progress, kinds.length);
    bed(ground);
    kinds.forEach((kind, i) => {
      const t = i < index ? 1 : i > index ? 0 : local;
      // The flower growing now stands taller in the middle of the bed; the others make room.
      const focus = i === index ? 1 : .62;
      flower(kind, width * (i + 1) / (kinds.length + 1), ground, t, focus);
    });
    ctx.globalAlpha = 1;
  };
  resize();
  return { draw, resize: () => { resize(); draw(last); } };
}
