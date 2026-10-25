// Pixel-art weather for Marte. Two low-resolution canvases share the plate's coordinates (u, v in 0..1):
// "back" sits behind Glaucia and Prince (far dust and the rover's scanning beam) and "front" above them (near dust,
// gust sheets along the ground, puffs, sparks and spores). Everything is a true pixel, upscaled with
// `image-rendering: pixelated`. Nothing runs between start() and stop().
export const PIXEL = 3;

const DUST = ["#f3ae62", "#d27a43", "#bd5632"];
const PUFF = ["#d27a43", "#bd5632", "#f3ae62", "#743a31"];
const SPARK = ["#ffffff", "#9ff3ff", "#42cfe0", "#f3ae62"];
const SPORE = ["#e9ffd0", "#b6ff7a", "#7fe05a", "#42cfe0"];
const BEAM = ["#42cfe0", "#9ff3ff", "#ffffff"];

export type UV = { u: number; v: number };
type Mote = { u: number; v: number; speed: number; bob: number; phase: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; gravity: number };
type Sheet = { x: number; y: number; length: number; speed: number; life: number; max: number; color: string };
type Scan = { from: UV; to: UV; life: number; max: number };

// Seeded so the dust looks the same on every visit.
function random(seed: number) { let state = seed; return () => (state = (state * 16807) % 2147483647) / 2147483647; }

// Three planes of dust drifting to the left: far (1 px, faint), mid (1 px) and near (2 px). Gusts speed them up.
const PLANES = [
  { count: 120, size: 1, drift: .012, alpha: .32 },
  { count: 60, size: 1, drift: .022, alpha: .5 },
  { count: 18, size: 2, drift: .04, alpha: .62 },
] as const;

export function createDust({ back, front, onGust }: { back: HTMLCanvasElement; front: HTMLCanvasElement; onGust?: (active: boolean) => void }) {
  const b = back.getContext("2d"); const f = front.getContext("2d");
  const next = random(1977);
  const planes: Mote[][] = PLANES.map((plane) => Array.from({ length: plane.count }, () => ({ u: next(), v: .08 + next() * .9, speed: .6 + next() * .8, bob: .002 + next() * .006, phase: next() * Math.PI * 2 })));
  let width = 0; let height = 0; let frame = 0; let running = false; let last = 0; let time = 0;
  let particles: Particle[] = []; let sheets: Sheet[] = []; let scans: Scan[] = [];
  let gustIn = 7; let gustLeft = 0; let gustActive = false;
  const level = { gust: 0 }; const target = { gust: 0 };
  const beginGust = () => { if (!gustActive) { gustActive = true; onGust?.(true); } };

  const resize = () => {
    width = Math.max(1, Math.round(back.clientWidth / PIXEL)); height = Math.max(1, Math.round(back.clientHeight / PIXEL));
    for (const canvas of [back, front]) { canvas.width = width; canvas.height = height; }
  };
  const px = (uv: UV) => ({ x: uv.u * width, y: uv.v * height });
  const pick = <T,>(palette: readonly T[]) => palette[Math.floor(Math.random() * palette.length)];
  const emit = (uv: UV, count: number, make: (x: number, y: number, index: number) => Particle) => { const { x, y } = px(uv); for (let index = 0; index < count; index++) particles.push(make(x, y, index)); };

  function drawMotes(context: CanvasRenderingContext2D, plane: number, delta: number) {
    const config = PLANES[plane];
    const push = config.drift * (1 + level.gust * 5);
    for (const [index, mote] of planes[plane].entries()) {
      mote.u -= push * mote.speed * delta;
      if (mote.u < -.02) { mote.u += 1.04; mote.v = .08 + Math.random() * .9; }
      context.globalAlpha = config.alpha;
      context.fillStyle = DUST[index % DUST.length];
      const x = Math.round(mote.u * width); const y = Math.round((mote.v + Math.sin(time * .9 + mote.phase) * mote.bob) * height);
      context.fillRect(x, y, config.size, config.size);
      // A gust stretches the near grains into short dashes.
      if (plane === 2 && level.gust > .3) { context.globalAlpha *= .5; context.fillRect(x + config.size, y, Math.round(level.gust * 5), 1); }
    }
  }

  function drawBack(delta: number) {
    if (!b) return;
    b.clearRect(0, 0, width, height);
    drawMotes(b, 0, delta);
    // The rover's scan: a cyan cone from the arm's sensor to the rock, with a line sweeping up and down inside it.
    scans = scans.filter((scan) => {
      scan.life += delta;
      if (scan.life >= scan.max) return false;
      const a = px(scan.from); const z = px(scan.to);
      const fade = Math.min(1, scan.life / .25, (scan.max - scan.life) / .35);
      const spread = Math.max(3, Math.abs(z.x - a.x) * .45);
      const sweep = (Math.sin(scan.life * 5) + 1) / 2;
      const length = Math.max(1, Math.round(Math.hypot(z.x - a.x, z.y - a.y)));
      for (let step = 0; step <= length; step++) {
        const t = step / length;
        const x = a.x + (z.x - a.x) * t; const y = a.y + (z.y - a.y) * t;
        b.globalAlpha = .16 * fade; b.fillStyle = BEAM[0];
        b.fillRect(Math.round(x - spread * t / 2), Math.round(y), Math.max(1, Math.round(spread * t)), 1);
        if (step % 3 === 0) { b.globalAlpha = .7 * fade; b.fillStyle = BEAM[step % BEAM.length]; b.fillRect(Math.round(x), Math.round(y), 1, 1); }
      }
      const line = { x: a.x + (z.x - a.x) * sweep, y: a.y + (z.y - a.y) * sweep };
      b.globalAlpha = .9 * fade; b.fillStyle = "#9ff3ff";
      b.fillRect(Math.round(line.x - spread * sweep / 2), Math.round(line.y), Math.max(1, Math.round(spread * sweep)), 1);
      return true;
    });
    b.globalAlpha = 1;
  }

  function drawFront(delta: number) {
    if (!f) return;
    f.clearRect(0, 0, width, height);
    drawMotes(f, 1, delta);
    drawMotes(f, 2, delta);
    // Gust: thin sheets of dust race low across the ground, right to left.
    if (level.gust > .05 && Math.random() < delta * 26 * level.gust) {
      sheets.push({ x: width * (1 + Math.random() * .1), y: height * (.72 + Math.random() * .26), length: 6 + Math.random() * 18, speed: width * (.35 + Math.random() * .45), life: 0, max: 1.8, color: pick(DUST) });
    }
    sheets = sheets.filter((sheet) => {
      sheet.life += delta; sheet.x -= sheet.speed * delta;
      if (sheet.life >= sheet.max || sheet.x + sheet.length < 0) return false;
      f.globalAlpha = .5 * Math.sin(Math.PI * sheet.life / sheet.max); f.fillStyle = sheet.color;
      f.fillRect(Math.round(sheet.x), Math.round(sheet.y), Math.round(sheet.length), 1);
      return true;
    });
    particles = particles.filter((particle) => {
      particle.life += delta;
      const t = particle.life / particle.max;
      if (t >= 1) return false;
      particle.vx *= .98; particle.vy = particle.vy * .98 + particle.gravity * delta;
      particle.x += particle.vx * delta; particle.y += particle.vy * delta;
      f.globalAlpha = Math.sin(Math.PI * t) * .95; f.fillStyle = particle.color;
      f.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
      return true;
    });
    f.globalAlpha = 1;
  }

  const draw = (now: number) => {
    if (!running) return;
    const delta = Math.min(.05, (now - (last || now)) / 1000); last = now; time += delta;
    gustIn -= delta;
    if (gustIn <= 0 && !target.gust) { target.gust = 1; gustLeft = 2.4 + Math.random() * 1.4; beginGust(); }
    if (target.gust) { gustLeft -= delta; if (gustLeft <= 0) { target.gust = 0; gustIn = 9 + Math.random() * 6; } }
    level.gust += (target.gust - level.gust) * Math.min(1, delta * 1.2);
    if (gustActive && !target.gust && level.gust < .12) { gustActive = false; onGust?.(false); }
    drawBack(delta); drawFront(delta);
    frame = requestAnimationFrame(draw);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(back);
  return {
    start() { if (running) return; running = true; last = 0; frame = requestAnimationFrame(draw); },
    stop() { running = false; cancelAnimationFrame(frame); b?.clearRect(0, 0, width, height); f?.clearRect(0, 0, width, height); particles = []; sheets = []; scans = []; },
    destroy() { this.stop(); observer.disconnect(); },
    gust() { target.gust = 1; gustLeft = 2.6; beginGust(); },
    // The rover's sensor reading a rock: a cone of cyan light for `duration` seconds.
    scan(from: UV, to: UV, duration = 2.4) { scans.push({ from, to, life: 0, max: duration }); },
    // Dust kicked up by wheels, paws or boots.
    puff(uv: UV, count = 10) { emit(uv, count, (x, y) => ({ x: x + (Math.random() - .5) * 8, y, vx: (Math.random() - .5) * 26 - 6, vy: -6 - Math.random() * 14, life: 0, max: .7 + Math.random() * .7, color: pick(PUFF), size: Math.random() > .5 ? 2 : 1, gravity: 30 })); },
    // A data spark: cyan pixels bursting out of the console or a finding.
    sparks(uv: UV, count = 24) { emit(uv, count, (x, y, index) => { const angle = Math.random() * Math.PI * 2; const speed = 12 + Math.random() * 44; return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: .5 + Math.random() * .7, color: index % 5 ? pick(SPARK) : "#ffffff", size: Math.random() > .7 ? 2 : 1, gravity: 0 }; }); },
    // Glowing spores rising from the sprout Prince found.
    spores(uv: UV, count = 14) { emit(uv, count, (x, y) => ({ x: x + (Math.random() - .5) * 10, y, vx: (Math.random() - .5) * 8, vy: -6 - Math.random() * 12, life: 0, max: 1.2 + Math.random() * 1.2, color: pick(SPORE), size: 1, gravity: -2 })); },
    // Current targets of the weather, for tests and debugging.
    weather() { return { ...target }; },
  };
}
