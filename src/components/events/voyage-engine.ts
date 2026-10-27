// The camera voyage's pixel layer (AtlasVoyage). Every frame is a pure function of the scroll progress, so scrolling back
// replays it exactly: glass shards in act 2, the remote signals riding an orbit around the 3D globe in act 3, the warp of
// satellite trails in act 4. Nothing is drawn while the progress is unchanged.
import { CYAN, GOLD, ICE, TEAL } from "./orbit-engine";

export const PIXEL = 2;
// Acts on the 0..1 progress of the sticky section.
export const ACTS = { approach: [0, .2], glass: [.16, .32], globe: [.28, .82], warp: [.8, .95], land: [.94, 1] } as const;
export const span = (value: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (value - a) / (b - a)));

// Where the 3D globe looks at each moment of act 3: Brazil → North America → the Caribbean → Athens → Rio.
export const WAYPOINTS = [
  { at: 0, lat: -15, lon: -50 }, { at: .36, lat: 32, lon: -85 }, { at: .56, lat: 19, lon: -70 }, { at: .78, lat: 38, lon: 24 }, { at: 1, lat: -23, lon: -43 },
] as const;
export function viewAt(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  const index = Math.max(0, WAYPOINTS.findIndex((point) => point.at >= clamped) - 1);
  const a = WAYPOINTS[index]; const b = WAYPOINTS[Math.min(WAYPOINTS.length - 1, index + 1)];
  const k = b.at === a.at ? 0 : (clamped - a.at) / (b.at - a.at);
  const smooth = k * k * (3 - 2 * k);
  return { lat: a.lat + (b.lat - a.lat) * smooth, lon: a.lon + (b.lon - a.lon) * smooth };
}
// The year lighting up during act 3.
export const yearAt = (t: number, first: number, last: number) => Math.min(last, first + Math.floor(Math.min(1, Math.max(0, t)) * (last - first + 1)));

function random(seed: number) { let state = seed; return () => (state = (state * 16807) % 2147483647) / 2147483647; }

export function createVoyagePixels(canvas: HTMLCanvasElement, { light = false } = {}) {
  const context = canvas.getContext("2d");
  const next = random(2026);
  const shards = Array.from({ length: light ? 36 : 80 }, () => ({ x: .52 + next() * .44, y: .08 + next() * .5, vx: (next() - .3) * .9, vy: -.2 - next() * .5, spin: next() * 6, size: 1 + Math.floor(next() * 3), color: next() > .6 ? ICE : CYAN }));
  const stars = Array.from({ length: light ? 90 : 180 }, () => ({ a: next() * Math.PI * 2, r: .05 + next() * .95, tone: next() > .8 ? GOLD : ICE }));
  let width = 0; let height = 0; let progress = -1; let remote = 0;

  const dot = (x: number, y: number, color: string, alpha: number, size = 1) => {
    if (!context || alpha <= 0) return;
    context.globalAlpha = Math.min(1, alpha); context.fillStyle = color; context.fillRect(Math.round(x), Math.round(y), size, size);
  };
  const render = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    const cx = width / 2; const cy = height / 2; const reach = Math.hypot(cx, cy);
    // Deep space behind the globe, with a slow twinkle that becomes streaks in the warp.
    const space = span(progress, [.26, .32]) * (1 - span(progress, ACTS.land));
    const warp = span(progress, ACTS.warp);
    for (const star of stars) {
      const x = cx + Math.cos(star.a) * star.r * reach; const y = cy + Math.sin(star.a) * star.r * reach;
      if (warp > 0) {
        const length = warp * warp * reach * .5 * star.r;
        for (let s = 0; s < length; s += 1) dot(x + Math.cos(star.a) * s, y + Math.sin(star.a) * s, star.tone, (1 - s / Math.max(1, length)) * .8);
      } else dot(x, y, star.tone, space * (.3 + .5 * ((star.a * 97) % 1)));
    }
    // Act 2: the window gives way, shards fly out and fall.
    const glass = span(progress, ACTS.glass);
    if (glass > .35 && glass < 1) {
      const t = (glass - .35) / .65;
      for (const shard of shards) {
        const x = (shard.x + shard.vx * t * .5) * width; const y = (shard.y + shard.vy * t * .3 + t * t * .5) * height;
        const blink = Math.abs(Math.sin(shard.spin + t * 8));
        dot(x, y, shard.color, (1 - t) * (.5 + blink * .5), shard.size);
        if (shard.size > 1) dot(x + shard.size, y - 1, ICE, (1 - t) * blink * .6);
      }
    }
    // Act 3: remote participations ride a tilted orbit ring around the globe, never on the ground.
    const globe = span(progress, ACTS.globe) * (1 - warp);
    if (globe > 0 && remote > 0) {
      const radius = Math.min(width, height) * .46;
      for (let i = 0; i < remote; i++) {
        const a = i / remote * Math.PI * 2 + progress * 3;
        const x = cx + Math.cos(a) * radius; const y = cy + Math.sin(a) * radius * .28 - radius * .05;
        const behind = Math.sin(a) < -.15;
        dot(x, y, i % 3 ? CYAN : TEAL, (behind ? .35 : .95) * Math.min(1, globe * 4), behind ? 1 : 2);
      }
    }
    context.globalAlpha = 1;
  };
  const resize = () => {
    width = Math.max(1, Math.round(canvas.clientWidth / PIXEL)); height = Math.max(1, Math.round(canvas.clientHeight / PIXEL));
    canvas.width = width; canvas.height = height;
    if (context) context.imageSmoothingEnabled = false;
    render();
  };
  resize();
  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
  observer?.observe(canvas);
  return {
    // `signals`: remote participations lit so far (they join the orbit as the years go by).
    set(value: number, signals: number) {
      const clamped = Math.min(1, Math.max(0, value));
      if (clamped === progress && signals === remote) return;
      progress = clamped; remote = signals; render();
    },
    destroy() { observer?.disconnect(); },
  };
}
