// The beacon finale's night: stars come out, the beacon's beam climbs the sky and seven stars gather into a flower,
// the constellation of Aurélia. Drawn only when the scroll moves (no animation loop).
export const FINALE_PIXEL = 3;
export type FinaleState = { night: number; beam: number; gather: number; streak: number };
const TAU = Math.PI * 2;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Seven points of a flower around (u, v): a centre and six petals. Normalised to the canvas. */
export function flowerConstellation(u = .5, v = .3, radius = .12, aspect = 1.6) {
  return [{ u, v }, ...Array.from({ length: 6 }, (_, k) => ({ u: u + Math.cos(k / 6 * TAU - Math.PI / 2) * radius / aspect, v: v + Math.sin(k / 6 * TAU - Math.PI / 2) * radius }))];
}

export function createFinaleSky(canvas: HTMLCanvasElement, beacon: { u: number; v: number }) {
  const ctx = canvas.getContext('2d');
  let width = 1, height = 1, state: FinaleState = { night: 0, beam: 0, gather: 0, streak: 0 };
  let seed = 97;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const field = Array.from({ length: 140 }, () => ({ u: random(), v: random() * .55, phase: random() * TAU, big: random() > .9 }));
  const wanderers = Array.from({ length: 7 }, () => ({ u: .1 + random() * .8, v: .05 + random() * .5 }));
  const resize = () => {
    width = canvas.width = Math.max(1, Math.min(640, Math.round(canvas.clientWidth / FINALE_PIXEL)));
    height = canvas.height = Math.max(1, Math.min(420, Math.round(canvas.clientHeight / FINALE_PIXEL)));
    if (ctx) ctx.imageSmoothingEnabled = false;
    draw(state);
  };
  const dot = (x: number, y: number, color: string, alpha: number, w = 1, h = 1) => {
    if (!ctx || alpha <= 0) return;
    ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  function draw(next: FinaleState) {
    state = next;
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const { night, beam, gather, streak } = next;
    // The jump to light speed for an instant: every star stretches into a streak toward the beacon's beam.
    field.forEach(star => {
      const alpha = night * (.25 + Math.sin(star.phase + beam * 6) ** 2 * .55), long = 1 + Math.round(streak * (8 + star.phase * 3));
      dot(star.u * width, star.v * height - long + 1, star.big ? '#fff4dd' : '#d5fff0', alpha * (streak ? .8 : 1), star.big ? 2 : 1, Math.max(star.big ? 2 : 1, long));
    });
    // The beam: a pixel column that widens and flickers as it climbs from the beacon to the top of the sky.
    if (beam > 0) {
      const bx = beacon.u * width, by = beacon.v * height, top = by - by * clamp(beam);
      for (let y = by; y > top; y -= 1) {
        const t = (by - y) / Math.max(1, by), half = 1 + t * 5 * clamp(beam * 1.4);
        dot(bx - half, y, '#87e4c1', .12 + (1 - t) * .25, half * 2 + 1, 1);
        dot(bx - 1, y, '#fff4dd', .55 + (1 - t) * .4, 3, 1);
        if ((y + Math.round(beam * 40)) % 9 === 0) dot(bx + Math.sin(y * .3) * half * 1.6, y, '#ffa69e', .7);
      }
      dot(bx - 4, top - 2, '#fff4dd', clamp(beam * 3) * .9, 9, 3);
    }
    if (gather > 0) {
      const targets = flowerConstellation(.5, .3, .13, width / Math.max(1, height));
      const eased = 1 - (1 - clamp(gather)) ** 3;
      const points = targets.map((target, i) => ({
        x: (wanderers[i].u + (target.u - wanderers[i].u) * eased) * width, y: (wanderers[i].v + (target.v - wanderers[i].v) * eased) * height,
      }));
      if (gather > .7 && ctx) {
        const line = clamp((gather - .7) / .3);
        ctx.globalAlpha = .55 * line; ctx.fillStyle = '#87e4c1';
        for (let i = 1; i < points.length; i++) for (const [a, b] of [[0, i], [i, i === 6 ? 1 : i + 1]]) {
          const steps = Math.max(1, Math.hypot(points[b].x - points[a].x, points[b].y - points[a].y));
          for (let s = 0; s < steps * line; s += 2) ctx.fillRect(Math.round(points[a].x + (points[b].x - points[a].x) * s / steps), Math.round(points[a].y + (points[b].y - points[a].y) * s / steps), 1, 1);
        }
      }
      points.forEach((point, i) => { dot(point.x - 1, point.y - 1, i ? '#ffa69e' : '#fff4dd', .5 + eased * .5, 3, 3); dot(point.x - 3, point.y, '#fff4dd', eased * .5, 7, 1); dot(point.x, point.y - 3, '#fff4dd', eased * .5, 1, 7); });
    }
    ctx.globalAlpha = 1;
  }
  resize();
  return { draw, resize };
}
