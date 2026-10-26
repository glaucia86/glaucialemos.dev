// Pixel-art light for Lúmina. Two low-resolution canvases share the plate's coordinates (u, v in 0..1): "back" sits
// behind Glaucia and Prince (glowing spores over the water, the glints of the plate's crystals, the scanner's beam) and
// "front" above them (near spores, ripples and sparks). Everything is a true pixel, upscaled with
// `image-rendering: pixelated`. Nothing runs between start() and stop().
export const PIXEL = 3;

export const SPORES = ["#53e0e8", "#aa78f4", "#e474c7", "#f7e6ff"];
const SPARK = ["#ffffff", "#f7e6ff", "#53e0e8", "#e474c7"];
const BEAM = ["#53e0e8", "#bff7fb", "#ffffff"];

export type UV = { u: number; v: number };
type Spore = { u: number; v: number; speed: number; sway: number; phase: number; color: string };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; gravity: number };
type Ripple = { x: number; y: number; life: number; max: number; reach: number };
type Scan = { from: UV; to: UV; life: number; max: number };

// Crystal tips of the plate that catch the light now and then (plate fractions), and the water that reflects it.
export const GLINTS: UV[] = [
  { u: .715, v: .655 }, { u: .7, v: .735 }, { u: .603, v: .53 }, { u: .842, v: .575 }, { u: .93, v: .44 },
  { u: .965, v: .62 }, { u: .52, v: .36 }, { u: .79, v: .22 }, { u: .66, v: .3 }, { u: .985, v: .81 },
];
const WATER = [{ u0: .69, u1: .8, v0: .625, v1: .665 }, { u0: .43, u1: .56, v0: .7, v1: .76 }];

function random(seed: number) { let state = seed; return () => (state = (state * 16807) % 2147483647) / 2147483647; }

// Three planes of spores rising slowly: far (1 px, faint), mid (1 px) and near (2 px). Kept to the right of the copy.
const PLANES = [
  { count: 70, size: 1, rise: .008, alpha: .45 },
  { count: 34, size: 1, rise: .014, alpha: .65 },
  { count: 10, size: 2, rise: .022, alpha: .8 },
] as const;

export function createPrism({ back, front }: { back: HTMLCanvasElement; front: HTMLCanvasElement }) {
  const b = back.getContext("2d"); const f = front.getContext("2d");
  const next = random(2019);
  const spawn = (): Omit<Spore, "color"> => ({ u: .42 + next() * .58, v: .2 + next() * .8, speed: .5 + next(), sway: .002 + next() * .005, phase: next() * Math.PI * 2 });
  const planes: Spore[][] = PLANES.map((plane) => Array.from({ length: plane.count }, (_, index) => ({ ...spawn(), color: SPORES[index % SPORES.length] })));
  const glints = GLINTS.map((glint, index) => ({ ...glint, period: 3.2 + (index % 4) * 1.1, offset: index * .9 }));
  let width = 0; let height = 0; let frame = 0; let running = false; let last = 0; let time = 0;
  let particles: Particle[] = []; let ripples: Ripple[] = []; let scans: Scan[] = [];

  const resize = () => {
    width = Math.max(1, Math.round(back.clientWidth / PIXEL)); height = Math.max(1, Math.round(back.clientHeight / PIXEL));
    for (const canvas of [back, front]) { canvas.width = width; canvas.height = height; }
  };
  const px = (uv: UV) => ({ x: uv.u * width, y: uv.v * height });
  const pick = <T,>(palette: readonly T[]) => palette[Math.floor(Math.random() * palette.length)];
  const emit = (uv: UV, count: number, make: (x: number, y: number, index: number) => Particle) => { const { x, y } = px(uv); for (let index = 0; index < count; index++) particles.push(make(x, y, index)); };

  function drawSpores(context: CanvasRenderingContext2D, plane: number, delta: number) {
    const config = PLANES[plane];
    for (const spore of planes[plane]) {
      spore.v -= config.rise * spore.speed * delta;
      if (spore.v < .05) Object.assign(spore, spawn(), { v: .95 + Math.random() * .05 });
      const twinkle = .55 + .45 * Math.sin(time * 1.6 + spore.phase);
      context.globalAlpha = config.alpha * twinkle;
      context.fillStyle = spore.color;
      context.fillRect(Math.round((spore.u + Math.sin(time * .7 + spore.phase) * spore.sway) * width), Math.round(spore.v * height), config.size, config.size);
    }
  }

  // A four-point star of light on a crystal tip: centre pixel, then arms that grow and fade.
  function drawGlints(context: CanvasRenderingContext2D) {
    for (const glint of glints) {
      const t = ((time + glint.offset) % glint.period) / glint.period;
      if (t > .16) continue;
      const strength = Math.sin(Math.PI * t / .16);
      const x = Math.round(glint.u * width); const y = Math.round(glint.v * height);
      const arm = Math.round(strength * 3);
      context.globalAlpha = .9 * strength; context.fillStyle = "#ffffff"; context.fillRect(x, y, 1, 1);
      context.globalAlpha = .6 * strength; context.fillStyle = "#bff7fb";
      for (let step = 1; step <= arm; step++) { context.fillRect(x - step, y, 1, 1); context.fillRect(x + step, y, 1, 1); context.fillRect(x, y - step, 1, 1); context.fillRect(x, y + step, 1, 1); }
    }
  }

  // Reflections on the water: short horizontal pixel lines that shimmer in place.
  function drawWater(context: CanvasRenderingContext2D) {
    for (const [index, water] of WATER.entries()) {
      for (let line = 0; line < 9; line++) {
        const seed = (index * 31 + line * 17) % 97 / 97;
        const v = water.v0 + (water.v1 - water.v0) * ((line + .5) / 9);
        const shift = Math.sin(time * 1.3 + line * 1.7) * .012;
        const u = water.u0 + (water.u1 - water.u0) * ((seed + shift + 1) % 1);
        context.globalAlpha = .25 + .25 * Math.sin(time * 2 + line);
        context.fillStyle = line % 3 ? "#53e0e8" : "#f7e6ff";
        context.fillRect(Math.round(u * width), Math.round(v * height), 2 + (line % 3), 1);
      }
    }
  }

  function drawBack(delta: number) {
    if (!b) return;
    b.clearRect(0, 0, width, height);
    drawWater(b); drawSpores(b, 0, delta); drawGlints(b);
    // Prince's scanner: a cyan fan from the backpack crystal to the books, with a line sweeping inside it.
    scans = scans.filter((scan) => {
      scan.life += delta;
      if (scan.life >= scan.max) return false;
      const a = px(scan.from); const z = px(scan.to);
      const fade = Math.min(1, scan.life / .2, (scan.max - scan.life) / .3);
      const spread = Math.max(3, Math.abs(z.y - a.y) * .5);
      const sweep = (Math.sin(scan.life * 6) + 1) / 2;
      const length = Math.max(1, Math.round(Math.hypot(z.x - a.x, z.y - a.y)));
      for (let step = 0; step <= length; step++) {
        const t = step / length;
        const x = a.x + (z.x - a.x) * t; const y = a.y + (z.y - a.y) * t;
        b.globalAlpha = .14 * fade; b.fillStyle = BEAM[0];
        b.fillRect(Math.round(x), Math.round(y - spread * t / 2), 1, Math.max(1, Math.round(spread * t)));
        if (step % 3 === 0) { b.globalAlpha = .7 * fade; b.fillStyle = BEAM[step % BEAM.length]; b.fillRect(Math.round(x), Math.round(y), 1, 1); }
      }
      const line = { x: a.x + (z.x - a.x) * sweep, y: a.y + (z.y - a.y) * sweep };
      b.globalAlpha = .9 * fade; b.fillStyle = "#bff7fb";
      b.fillRect(Math.round(line.x), Math.round(line.y - spread * sweep / 2), 1, Math.max(1, Math.round(spread * sweep)));
      return true;
    });
    b.globalAlpha = 1;
  }

  function drawFront(delta: number) {
    if (!f) return;
    f.clearRect(0, 0, width, height);
    drawSpores(f, 1, delta); drawSpores(f, 2, delta);
    // A crystal's hum: diamond outlines growing out of it, violet → pink → cyan.
    ripples = ripples.filter((ripple) => {
      ripple.life += delta;
      const t = ripple.life / ripple.max;
      if (t >= 1) return false;
      const radius = Math.round(2 + t * ripple.reach);
      f.globalAlpha = (1 - t) * .9; f.fillStyle = SPORES[Math.min(2, Math.floor(t * 3))];
      for (let step = 0; step <= radius; step++) {
        const dx = step; const dy = radius - step;
        for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) f.fillRect(Math.round(ripple.x + dx * sx), Math.round(ripple.y + dy * sy * .7), 1, 1);
      }
      return true;
    });
    particles = particles.filter((particle) => {
      particle.life += delta;
      const t = particle.life / particle.max;
      if (t >= 1) return false;
      particle.vx *= .97; particle.vy = particle.vy * .97 + particle.gravity * delta;
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
    drawBack(delta); drawFront(delta);
    frame = requestAnimationFrame(draw);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(back);
  return {
    start() { if (running) return; running = true; last = 0; frame = requestAnimationFrame(draw); },
    stop() { running = false; cancelAnimationFrame(frame); b?.clearRect(0, 0, width, height); f?.clearRect(0, 0, width, height); particles = []; ripples = []; scans = []; },
    destroy() { this.stop(); observer.disconnect(); },
    // The crystal hums: `rings` diamonds a few frames apart.
    ripple(uv: UV, rings = 3, reach = 16) { const { x, y } = px(uv); for (let index = 0; index < rings; index++) ripples.push({ x, y, life: -index * .22, max: .9, reach }); },
    // Light bursting out of a crystal or a page.
    sparks(uv: UV, count = 20) { emit(uv, count, (x, y, index) => { const angle = Math.random() * Math.PI * 2; const speed = 10 + Math.random() * 38; return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: .5 + Math.random() * .7, color: index % 5 ? pick(SPARK) : "#ffffff", size: Math.random() > .75 ? 2 : 1, gravity: 0 }; }); },
    // Glowing spores lifting off a book or the crystal.
    rise(uv: UV, count = 14) { emit(uv, count, (x, y) => ({ x: x + (Math.random() - .5) * 10, y, vx: (Math.random() - .5) * 8, vy: -5 - Math.random() * 12, life: 0, max: 1.2 + Math.random() * 1.2, color: pick(SPORES), size: 1, gravity: -2 })); },
    // The scanner's fan of light for `duration` seconds.
    scan(from: UV, to: UV, duration = 1.6) { scans.push({ from, to, life: 0, max: duration }); },
    // Live effect counts, for tests and debugging.
    load() { return { particles: particles.length, ripples: ripples.length, scans: scans.length }; },
  };
}
