// Aurélia's orbital gyroscope: a pixel planet and three particle rings in a small software 3D projection.
// The rings' markers sit on a quarter-turn dial (same model as aurelia-controls); turn 0 puts every marker at the top.
export const GYRO_PIXEL = 2;
const TAU = Math.PI * 2;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
export type RingSpec = { radius: number; tilt: number; roll: number; color: string; count: number };
export const RINGS: readonly RingSpec[] = [
  { radius: .5, tilt: 1.2, roll: .42, color: '#87e4c1', count: 150 },
  { radius: .64, tilt: 1.02, roll: -.36, color: '#ffa69e', count: 190 },
  { radius: .78, tilt: 1.32, roll: .2, color: '#ffd27a', count: 230 },
];
export type GyroFrame = {
  time: number; approach: number; active: number; collapse: number;
  turns: number[]; locks: number[]; flash: number;
};

/** Marker angle on its ring for a (possibly fractional) quarter-turn value: 0 → top. */
export const markerAngle = (turn: number) => -Math.PI / 2 + turn * Math.PI / 2;
/** Nearest whole quarter turn, kept in 0–3. */
export const snapTurn = (value: number) => ((Math.round(value) % 4) + 4) % 4;
/** A point of a ring in camera space. Locked rings lose their roll so every marker meets the same vertical. */
export function ringPoint(ring: RingSpec, angle: number, lock = 0, scale = 1) {
  const r = ring.radius * scale, roll = ring.roll * (1 - lock);
  const x = Math.cos(angle) * r, y0 = Math.sin(angle) * r * Math.cos(ring.tilt), z = Math.sin(angle) * r * Math.sin(ring.tilt);
  return { x: x * Math.cos(roll) - y0 * Math.sin(roll), y: x * Math.sin(roll) + y0 * Math.cos(roll), z };
}
/** Perspective projection to the canvas (unit space → pixels). Larger depth = farther. */
export function project(point: { x: number; y: number; z: number }, size: number, distance: number) {
  const f = distance / (distance + point.z);
  return { x: size / 2 + point.x * f * size * .5, y: size / 2 + point.y * f * size * .5, depth: point.z };
}
/** Which ring a pointer is on: the closest projected sample within `reach` pixels, or -1. */
export function ringAt(px: number, py: number, size: number, distance: number, frame: Pick<GyroFrame, 'turns' | 'locks'>, scale: number, reach = 14) {
  let best = -1, bestDistance = reach;
  RINGS.forEach((ring, i) => {
    for (let k = 0; k < 72; k++) {
      const p = project(ringPoint(ring, k / 72 * TAU, frame.locks[i], scale), size, distance);
      const d = Math.hypot(p.x - px, p.y - py);
      if (d < bestDistance) { bestDistance = d; best = i; }
    }
  });
  return best;
}

function planetSprite(radius: number) {
  const size = Math.max(2, Math.round(radius * 2));
  const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(size, size) : Object.assign(document.createElement('canvas'), { width: size, height: size });
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) return canvas;
  const bands = ['#0b2a2e', '#1e4d50', '#285b62', '#387b78', '#5fb79a', '#87e4c1', '#d5fff0'];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const nx = (x + .5) / radius - 1, ny = (y + .5) / radius - 1, d = nx * nx + ny * ny;
    if (d > 1) continue;
    const nz = Math.sqrt(1 - d), light = Math.max(0, -nx * .55 - ny * .45 + nz * .7);
    const stripe = Math.sin(ny * 9 + Math.sin(nx * 3) * .8) * .18;
    const dither = ((x + y) % 2) * .06;
    ctx.fillStyle = bands[Math.max(0, Math.min(bands.length - 1, Math.floor((light + stripe + dither) * bands.length)))];
    ctx.fillRect(x, y, 1, 1);
  }
  return canvas;
}

export function createGyroscope(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  let size = 1, planet: ReturnType<typeof planetSprite> | null = null, planetRadius = 0;
  let seed = 41;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const stars = Array.from({ length: 170 }, () => ({ u: random() * 2 - 1, v: random() * 2 - 1, depth: .3 + random() * .7, phase: random() * TAU }));
  const resize = () => {
    size = Math.max(1, Math.min(560, Math.round(Math.min(canvas.clientWidth, canvas.clientHeight || canvas.clientWidth) / GYRO_PIXEL)));
    canvas.width = canvas.height = size;
    if (ctx) ctx.imageSmoothingEnabled = false;
    planet = null;
  };
  const dot = (x: number, y: number, color: string, alpha: number, w = 1, h = 1) => {
    if (!ctx || alpha <= 0) return;
    ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const scaleOf = (frame: Pick<GyroFrame, 'approach' | 'collapse'>) => (.55 + .45 * (1 - (1 - clamp(frame.approach)) ** 3)) * (1 - clamp(frame.collapse) * .9);
  const distance = 2.4;
  function draw(frame: GyroFrame) {
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    const { time, approach, active, collapse, turns, locks, flash } = frame;
    const scale = scaleOf(frame), warp = clamp(collapse * 1.4);
    // Stars: parallax with the approach, streaks during the collapse.
    stars.forEach(star => {
      const push = 1 + approach * .25 * star.depth;
      const x = size / 2 + star.u * size * .5 * push, y = size / 2 + star.v * size * .5 * push;
      const long = 1 + Math.round(warp * 10 * star.depth);
      dot(x, y - long + 1, star.depth > .85 ? '#fff4dd' : '#d5fff0', (.25 + Math.sin(time * 1.3 + star.phase) ** 2 * .5) * (.4 + star.depth * .6), 1, long);
    });
    const center = size / 2;
    // The lock line: a dashed vertical that marks the top window every marker must reach.
    for (let y = 2; y < center - planetRadius; y += 4) dot(center, y, '#fff4dd', .15 + .35 * locks.filter(Boolean).length / 3, 1, 2);
    const ringPass = (front: boolean) => RINGS.forEach((ring, i) => {
      const lock = locks[i], focus = i === active ? 1 : 0;
      const spin = time * (.25 + i * .07) * (i % 2 ? -1 : 1);
      for (let k = 0; k < ring.count; k++) {
        const angle = k / ring.count * TAU + spin;
        const p = ringPoint(ring, angle, lock, scale);
        if ((p.z < 0) !== front) continue;
        const s = project(p, size, distance);
        const alpha = (.28 + .5 * focus + .3 * lock) * (front ? 1 : .55) * (k % 3 === 0 ? 1 : .7);
        dot(s.x, s.y, lock > .5 ? '#ffd27a' : ring.color, alpha, k % 7 === 0 ? 2 : 1, 1);
      }
      const m = ringPoint(ring, markerAngle(turns[i]), lock, scale);
      if ((m.z < 0) !== front) return;
      const s = project(m, size, distance), glow = .6 + .4 * Math.sin(time * 6 + i);
      dot(s.x - 2, s.y - 2, lock > .5 ? '#fff4dd' : '#ffa69e', 1, 5, 5);
      dot(s.x - 4, s.y, '#fff4dd', glow * (.4 + lock * .6), 9, 1); dot(s.x, s.y - 4, '#fff4dd', glow * (.4 + lock * .6), 1, 9);
    });
    ringPass(false);
    const radius = Math.max(4, Math.round(size * .19 * scale));
    if (!planet || radius !== planetRadius) { planet = planetSprite(radius); planetRadius = radius; }
    ctx.globalAlpha = 1;
    ctx.drawImage(planet as CanvasImageSource, Math.round(center - radius), Math.round(center - radius));
    ringPass(true);
    // The collapse: rings fold into a beam and a shockwave ring runs out of the planet.
    if (collapse > 0) {
      const beamHalf = Math.max(1, Math.round((1 - Math.abs(collapse - .5) * 2) * 6));
      for (let y = 0; y < size; y++) dot(center - beamHalf, y, '#fff4dd', (1 - Math.abs(collapse - .5) * 2) * .8, beamHalf * 2, 1);
      const r = collapse * size * .7;
      for (let k = 0; k < 96; k++) { const a = k / 96 * TAU; dot(center + Math.cos(a) * r, center + Math.sin(a) * r * .45, k % 2 ? '#87e4c1' : '#ffa69e', (1 - collapse) * .9, 2, 1); }
    }
    if (flash > 0) { ctx.globalAlpha = flash * .35; ctx.fillStyle = '#fff4dd'; ctx.fillRect(0, 0, size, size); }
    ctx.globalAlpha = 1;
  }
  resize();
  return {
    draw, resize,
    /** Canvas pixels from a client point (for hit tests and drags). */
    toCanvas(clientX: number, clientY: number) {
      const box = canvas.getBoundingClientRect();
      return { x: (clientX - box.left) / Math.max(1, box.width) * size, y: (clientY - box.top) / Math.max(1, box.height) * size };
    },
    hit(clientX: number, clientY: number, frame: GyroFrame) {
      const p = this.toCanvas(clientX, clientY);
      return ringAt(p.x, p.y, size, distance, frame, scaleOf(frame), Math.max(10, size * .04));
    },
    center: () => ({ x: size / 2, y: size / 2 }),
  };
}
