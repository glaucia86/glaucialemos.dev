// Pixel-art light for the epilogue. Two low-resolution canvases share the plate's coordinates (u, v in 0..1): "back"
// sits behind Glaucia and Prince (stars in three planes, the Veil's "threads of possibility", comets) and "front" above
// them (near dust, the cursor's stardust, sparks, the nova's shockwave). Everything is a true pixel, upscaled with
// `image-rendering: pixelated`. Nothing runs between start() and stop().
export const PIXEL = 2;

export type UV = { u: number; v: number };
const STARS = ["#fff0c9", "#ffffff", "#83efac", "#e9a966", "#c75b76", "#cfe6ff"];
const MOTES = ["#f07f77", "#83efac", "#e9a966", "#fff0c9"];
const THREADS = [["#fff0c9", "#e9a966", "#f07f77", "#c75b76"], ["#fff0c9", "#83efac", "#3fc7a0", "#226b59"], ["#ffffff", "#e9a966", "#83efac", "#226b59"]];
const SPARK = ["#ffffff", "#fff0c9", "#f07f77", "#83efac", "#e9a966"];

type Star = { u: number; v: number; plane: number; phase: number; speed: number; color: string; spike: boolean };
type Mote = { u: number; v: number; vu: number; vv: number; phase: number; size: number; color: string; alpha: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; drag: number; pull?: { x: number; y: number; force: number } };
type Point = { x: number; y: number; order: number };
type Thread = { points: Point[]; length: number; life: number; grow: number; fade: number; palette: string[]; strength: number };
type Comet = { x: number; y: number; vx: number; vy: number; life: number; max: number; trail: { x: number; y: number }[] };
type Ring = { x: number; y: number; life: number; max: number; reach: number; color: string; width: number };
type Pull = { x: number; y: number; life: number; max: number };

function random(seed: number) { let state = seed; return () => (state = (state * 16807) % 2147483647) / 2147483647; }

export function createVeil({ back, front, core, lite = false }: { back: HTMLCanvasElement; front: HTMLCanvasElement; core: UV; lite?: boolean }) {
  const b = back.getContext("2d"); const f = front.getContext("2d");
  const next = random(808);
  const pick = <T,>(palette: readonly T[]) => palette[Math.floor(Math.random() * palette.length)];
  // Stars favour the calm left sky; a few sit between the filaments.
  const stars: Star[] = Array.from({ length: lite ? 150 : 260 }, (_, index) => {
    const plane = index % 9 === 0 ? 2 : index % 3 === 0 ? 1 : 0;
    return { u: next() ** 1.5, v: next(), plane, phase: next() * Math.PI * 2, speed: .6 + next() * 2.2, color: STARS[Math.floor(next() * STARS.length)], spike: plane === 2 && next() > .7 };
  });
  const motes: Mote[] = Array.from({ length: lite ? 22 : 46 }, () => ({
    u: next(), v: next(), vu: .002 + next() * .006, vv: -.001 - next() * .004, phase: next() * Math.PI * 2,
    size: next() > .7 ? 2 : 1, color: MOTES[Math.floor(next() * MOTES.length)], alpha: .25 + next() * .45,
  }));
  let width = 0; let height = 0; let frame = 0; let running = false; let last = 0; let time = 0;
  let dimming = 1; let particles: Particle[] = []; let threads: Thread[] = []; let comets: Comet[] = []; let rings: Ring[] = [];
  let pull: Pull | null = null; let nextThread = 2.5; let nextComet = 6; let pointer: UV | null = null; let lastDust = 0;

  const resize = () => {
    width = Math.max(1, Math.round(back.clientWidth / PIXEL)); height = Math.max(1, Math.round(back.clientHeight / PIXEL));
    for (const canvas of [back, front]) { canvas.width = width; canvas.height = height; }
  };
  const px = (uv: UV) => ({ x: uv.u * width, y: uv.v * height });

  // A branching filament grown by a random walk from the core of the Veil outward.
  function grow(strength: number, angle = Math.random() * Math.PI * 2) {
    const start = px(core);
    const points: Point[] = [];
    const walk = (x: number, y: number, heading: number, steps: number, order: number, depth: number) => {
      for (let step = 0; step < steps; step++) {
        heading += (Math.random() - .5) * .5;
        x += Math.cos(heading); y += Math.sin(heading) * .8;
        if (x < 0 || y < 0 || x > width || y > height) return;
        points.push({ x: Math.round(x), y: Math.round(y), order: order + step });
        if (depth < 2 && Math.random() < .02) walk(x, y, heading + (Math.random() > .5 ? 1 : -1) * (.4 + Math.random() * .5), Math.round(steps * .45), order + step, depth + 1);
      }
    };
    walk(start.x + (Math.random() - .5) * 8, start.y + (Math.random() - .5) * 6, angle, Math.round((80 + Math.random() * 170) * (height / 300)), 0, 0);
    const length = points.reduce((max, point) => Math.max(max, point.order), 1);
    threads.push({ points, length, life: 0, grow: .7 + Math.random() * .6, fade: 1.2 + Math.random() * 1.2, palette: pick(THREADS), strength });
  }

  function drawStars(context: CanvasRenderingContext2D) {
    const target = pull && px({ u: pull.x, v: pull.y });
    const k = pull ? Math.min(1, pull.life / pull.max) ** 2.2 : 0;
    for (const star of stars) {
      const twinkle = .55 + .45 * Math.sin(time * star.speed + star.phase);
      let x = star.u * width; let y = star.v * height;
      const alpha = [.45, .7, .95][star.plane] * twinkle * dimming;
      context.fillStyle = star.color;
      if (target) {
        // Gravitational pull toward the last star: the nearer the plane, the stronger; a streak shows the fall.
        const strength = k * (.25 + star.plane * .22);
        const tx = x + (target.x - x) * strength; const ty = y + (target.y - y) * strength;
        const steps = Math.min(14, Math.round(Math.hypot(tx - x, ty - y) * .35));
        for (let step = 0; step <= steps; step++) {
          context.globalAlpha = alpha * (step / Math.max(1, steps)) * .8;
          context.fillRect(Math.round(x + (tx - x) * (step / Math.max(1, steps))), Math.round(y + (ty - y) * (step / Math.max(1, steps))), 1, 1);
        }
        x = tx; y = ty;
      }
      context.globalAlpha = alpha;
      context.fillRect(Math.round(x), Math.round(y), 1, 1);
      // Only the brightest stars flare, briefly, with a one-pixel glint (a longer cross reads as a UI crosshair).
      if (star.spike && twinkle > .93) {
        context.globalAlpha = alpha * .35 * (twinkle - .93) / .07;
        context.fillRect(Math.round(x) - 1, Math.round(y), 1, 1); context.fillRect(Math.round(x) + 1, Math.round(y), 1, 1);
        context.fillRect(Math.round(x), Math.round(y) - 1, 1, 1); context.fillRect(Math.round(x), Math.round(y) + 1, 1, 1);
      }
    }
  }

  function drawThreads(context: CanvasRenderingContext2D, delta: number) {
    threads = threads.filter((thread) => {
      thread.life += delta;
      const head = thread.life / thread.grow * thread.length;
      if (thread.life > thread.grow + thread.fade) return false;
      for (const point of thread.points) {
        if (point.order > head) continue;
        const born = point.order / thread.length * thread.grow;
        const age = Math.max(0, thread.life - born);
        const alpha = thread.strength * Math.max(0, 1 - age / (thread.fade + .4)) * dimming;
        if (alpha <= .02) continue;
        const near = head - point.order < 3;
        const color = near ? "#ffffff" : thread.palette[Math.min(3, Math.floor(point.order / thread.length * 4))];
        // A continuous 1 px filament with a faint 1 px halo, so it reads as light, not as a dotted line.
        context.fillStyle = color;
        context.globalAlpha = alpha * .07;
        context.fillRect(point.x - 1, point.y - 1, 3, 3);
        context.globalAlpha = near ? Math.min(1, alpha * 1.4) : alpha * .75;
        context.fillRect(point.x, point.y, 1, 1);
      }
      return true;
    });
  }

  function drawComets(context: CanvasRenderingContext2D, delta: number) {
    comets = comets.filter((comet) => {
      comet.life += delta;
      if (comet.life >= comet.max) return false;
      comet.x += comet.vx * delta; comet.y += comet.vy * delta;
      comet.trail.unshift({ x: comet.x, y: comet.y }); comet.trail.length = Math.min(comet.trail.length, 22);
      const fade = Math.sin(Math.PI * comet.life / comet.max);
      comet.trail.forEach((point, index) => {
        context.globalAlpha = fade * (1 - index / 22) * .9 * dimming;
        context.fillStyle = index < 2 ? "#ffffff" : index < 8 ? "#fff0c9" : "#83efac";
        context.fillRect(Math.round(point.x), Math.round(point.y), 1, 1);
      });
      return true;
    });
  }

  function drawMotes(context: CanvasRenderingContext2D, delta: number) {
    for (const mote of motes) {
      mote.u += mote.vu * delta; mote.v += mote.vv * delta;
      if (mote.u > 1.02) mote.u = -.02;
      if (mote.v < -.02) mote.v = 1.02;
      context.globalAlpha = mote.alpha * (.6 + .4 * Math.sin(time * 1.3 + mote.phase)) * dimming;
      context.fillStyle = mote.color;
      context.fillRect(Math.round((mote.u + Math.sin(time * .5 + mote.phase) * .004) * width), Math.round(mote.v * height), mote.size, mote.size);
    }
  }

  function drawParticles(context: CanvasRenderingContext2D, delta: number) {
    particles = particles.filter((particle) => {
      particle.life += delta;
      const t = particle.life / particle.max;
      if (t >= 1) return false;
      if (t < 0) return true;
      if (particle.pull) {
        const dx = particle.pull.x - particle.x; const dy = particle.pull.y - particle.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        if (distance < 2) return false;
        particle.vx += dx / distance * particle.pull.force * delta; particle.vy += dy / distance * particle.pull.force * delta;
      }
      particle.vx *= particle.drag; particle.vy *= particle.drag;
      const ox = particle.x; const oy = particle.y;
      particle.x += particle.vx * delta; particle.y += particle.vy * delta;
      context.fillStyle = particle.color;
      if (particle.pull) { context.globalAlpha = .35 * Math.min(1, t * 4); context.fillRect(Math.round(ox), Math.round(oy), 1, 1); }
      context.globalAlpha = Math.sin(Math.PI * Math.min(1, t * 1.2 + .05)) * .95;
      context.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
      return true;
    });
  }

  function drawRings(context: CanvasRenderingContext2D, delta: number) {
    rings = rings.filter((ring) => {
      ring.life += delta;
      const t = ring.life / ring.max;
      if (t >= 1) return false;
      if (t < 0) return true;
      const radius = (1 - (1 - t) ** 3) * ring.reach;
      const steps = Math.max(24, Math.round(radius * 4));
      context.fillStyle = ring.color;
      for (let step = 0; step < steps; step++) {
        const angle = step / steps * Math.PI * 2;
        context.globalAlpha = (1 - t) * (.6 + .4 * Math.sin(angle * 7 + time * 8));
        context.fillRect(Math.round(ring.x + Math.cos(angle) * radius), Math.round(ring.y + Math.sin(angle) * radius * .82), ring.width, ring.width);
      }
      return true;
    });
  }

  const draw = (now: number) => {
    if (!running) return;
    const delta = Math.min(.05, (now - (last || now)) / 1000); last = now; time += delta;
    if (pull) pull.life = Math.min(pull.max, pull.life + delta);
    nextThread -= delta; nextComet -= delta;
    if (nextThread <= 0) { grow(.35); nextThread = 5 + Math.random() * 6; }
    if (nextComet <= 0) {
      const direction = Math.random() > .5 ? 1 : -1;
      comets.push({ x: (.05 + Math.random() * .35) * width, y: (.04 + Math.random() * .4) * height, vx: direction * (60 + Math.random() * 50), vy: 22 + Math.random() * 30, life: 0, max: 1 + Math.random() * .8, trail: [] });
      nextComet = 8 + Math.random() * 9;
    }
    if (pointer && time - lastDust > .03) {
      lastDust = time;
      const { x, y } = px(pointer);
      particles.push({ x, y, vx: (Math.random() - .5) * 12, vy: (Math.random() - .5) * 12 - 4, life: 0, max: .6 + Math.random() * .6, color: pick(SPARK), size: 1, drag: .96 });
    }
    if (b) { b.clearRect(0, 0, width, height); drawStars(b); drawThreads(b, delta); drawComets(b, delta); b.globalAlpha = 1; }
    if (f) { f.clearRect(0, 0, width, height); drawMotes(f, delta); drawParticles(f, delta); drawRings(f, delta); f.globalAlpha = 1; }
    frame = requestAnimationFrame(draw);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(back);
  return {
    start() { if (running) return; running = true; last = 0; frame = requestAnimationFrame(draw); },
    stop() { running = false; cancelAnimationFrame(frame); b?.clearRect(0, 0, width, height); f?.clearRect(0, 0, width, height); particles = []; threads = []; comets = []; rings = []; pull = null; dimming = 1; },
    destroy() { this.stop(); observer.disconnect(); },
    // Stardust follows the cursor over the scene (fine pointers only); null stops it.
    pointer(uv: UV | null) { pointer = uv; },
    // Overall brightness of stars, threads and dust (the implosion darkens the sky).
    dim(value: number) { dimming = Math.max(0, Math.min(1, value)); },
    // Threads of possibility branching out of the core.
    threads(count = 1, strength = 1) { for (let index = 0; index < count; index++) grow(strength, index / count * Math.PI * 2 + Math.random() * .4); },
    sparks(uv: UV, count = 24, speed = 40) {
      const { x, y } = px(uv);
      for (let index = 0; index < count; index++) {
        const angle = Math.random() * Math.PI * 2; const velocity = speed * (.3 + Math.random());
        particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity * .82, life: 0, max: .5 + Math.random() * .9, color: pick(SPARK), size: Math.random() > .75 ? 2 : 1, drag: .95 });
      }
    },
    // Light falls into the star: stars bend toward it and dust spirals in for `duration` seconds.
    implode(uv: UV, duration = 1.2) {
      pull = { x: uv.u, y: uv.v, life: 0, max: duration };
      const target = px(uv);
      for (let index = 0; index < (lite ? 90 : 180); index++) {
        const angle = Math.random() * Math.PI * 2; const distance = (.25 + Math.random() * .75) * Math.hypot(width, height) * .55;
        const x = target.x + Math.cos(angle) * distance; const y = target.y + Math.sin(angle) * distance * .8;
        particles.push({ x, y, vx: -Math.sin(angle) * 30, vy: Math.cos(angle) * 30, life: -Math.random() * duration * .5, max: duration * 1.4, color: pick(SPARK), size: 1, drag: .985, pull: { ...target, force: 240 + Math.random() * 200 } });
      }
    },
    release() { pull = null; },
    // The nova's shockwave: rings racing out to the corners of the frame.
    shockwave(uv: UV) {
      const { x, y } = px(uv); const reach = Math.hypot(width, height);
      rings.push({ x, y, life: 0, max: 1.1, reach, color: "#fff0c9", width: 2 }, { x, y, life: -.08, max: 1.3, reach: reach * .9, color: "#f07f77", width: 1 }, { x, y, life: -.18, max: 1.5, reach: reach * .8, color: "#83efac", width: 1 });
    },
    load() { return { particles: particles.length, threads: threads.length, comets: comets.length, rings: rings.length }; },
  };
}
export type Veil = ReturnType<typeof createVeil>;
