// Pixel-art weather for Nivéora. Two low-resolution canvases share the plate's coordinates (u, v in 0..1):
// "back" sits behind Glaucia and Prince (aurora glow, far snow, the prism beam) and "front" above them (near snow,
// wind drift, the blizzard, sparks and snow puffs). Everything is a true pixel, upscaled with `image-rendering: pixelated`.
export const PIXEL = 3;

const AURORA = [[85, 233, 232], [184, 157, 252], [243, 165, 216]] as const;
const PRISM = [[243, 165, 216], [85, 233, 232], [184, 157, 252], [255, 255, 255]] as const;
const SNOW = ["#ffffff", "#e9f6ff", "#cfe9fb"];
const SPARK = ["#ffffff", "#bff7f6", "#55e9e8", "#b89dfc", "#f3a5d8"];
const EMBER = ["#fff2c8", "#ffd27a", "#ff9f5a", "#ffffff"];

export type UV = { u: number; v: number };
type Flake = { u: number; v: number; speed: number; sway: number; phase: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; gravity: number };
type Streak = { x: number; y: number; length: number; speed: number; life: number; max: number };
type Beam = { from: UV; to: UV; life: number; max: number; grow: number };

// Seeded so the snow looks the same on every visit.
function random(seed: number) { let state = seed; return () => (state = (state * 16807) % 2147483647) / 2147483647; }

// Three planes of snow: far (1 px, slow), mid (1 px), near (2 px, fast). A blizzard reveals the spare flakes.
const PLANES = [
  { count: 150, spare: 260, size: 1, fall: .045, drift: .6 },
  { count: 80, spare: 220, size: 1, fall: .08, drift: 1 },
  { count: 26, spare: 110, size: 2, fall: .14, drift: 1.6 },
] as const;

export function createSnow({ back, front, onGust }: { back: HTMLCanvasElement; front: HTMLCanvasElement; onGust?: () => void }) {
  const b = back.getContext("2d"); const f = front.getContext("2d");
  const next = random(2042);
  const planes: Flake[][] = PLANES.map((plane) => Array.from({ length: plane.count + plane.spare }, () => ({ u: next(), v: next(), speed: .7 + next() * .6, sway: .002 + next() * .006, phase: next() * Math.PI * 2 })));
  // Glints on the ice that blink pink while the prism shines.
  const glints: (UV & { phase: number })[] = Array.from({ length: 70 }, () => ({ u: .5 + next() * .5, v: .52 + next() * .26, phase: next() * Math.PI * 2 }));
  let width = 0; let height = 0; let frame = 0; let running = false; let last = 0; let time = 0;
  let particles: Particle[] = []; let streaks: Streak[] = []; let beams: Beam[] = [];
  let pointer: UV | null = null; let gustIn = 6; let gustLeft = 0;
  let prismFrom: UV | null = null;
  const level = { blizzard: 0, prism: 0, gust: 0 }; const target = { blizzard: 0, prism: 0, gust: 0 };

  const resize = () => {
    width = Math.max(1, Math.round(back.clientWidth / PIXEL)); height = Math.max(1, Math.round(back.clientHeight / PIXEL));
    for (const canvas of [back, front]) { canvas.width = width; canvas.height = height; }
  };
  const px = (uv: UV) => ({ x: uv.u * width, y: uv.v * height });
  const pick = <T,>(palette: readonly T[]) => palette[Math.floor(Math.random() * palette.length)];
  const emit = (uv: UV, count: number, make: (x: number, y: number, index: number) => Particle) => { const { x, y } = px(uv); for (let index = 0; index < count; index++) particles.push(make(x, y, index)); };
  const wind = () => .006 + level.gust * .05 + level.blizzard * .16;

  function drawSnow(context: CanvasRenderingContext2D, plane: number, delta: number) {
    const config = PLANES[plane];
    const shown = Math.round(config.count + config.spare * level.blizzard);
    const push = wind() * config.drift;
    context.fillStyle = plane === 0 ? "#cfe9fb" : "#ffffff";
    for (let index = 0; index < shown; index++) {
      const flake = planes[plane][index];
      flake.v += config.fall * flake.speed * (1 + level.blizzard * 1.5) * delta;
      flake.u -= (push + Math.sin(time * 1.3 + flake.phase) * flake.sway) * delta;
      if (flake.v > 1.02) { flake.v -= 1.04; flake.u = Math.random(); }
      if (flake.u < -.02) flake.u += 1.04; else if (flake.u > 1.02) flake.u -= 1.04;
      context.globalAlpha = plane === 0 ? .55 : plane === 1 ? .8 : .95;
      const x = Math.round(flake.u * width); const y = Math.round(flake.v * height);
      context.fillRect(x, y, config.size, config.size);
      // Fast wind stretches the near flakes into short dashes.
      if (plane === 2 && push > .05) { context.globalAlpha *= .5; context.fillRect(x + config.size, y, Math.min(6, Math.round(push * 30)), 1); }
    }
  }

  function drawBack(delta: number) {
    if (!b) return;
    b.clearRect(0, 0, width, height);
    // Aurora glow over the painted aurora: stepped curtains that ripple, lean to the pointer and flare with the prism.
    const strength = (1 + level.prism * 1.8) * (1 - level.blizzard * .7);
    if (strength > .02) {
      b.globalCompositeOperation = "lighter";
      for (let curtain = 0; curtain < 2; curtain++) {
        for (let x = 0; x < width; x++) {
          const u = x / width;
          const near = pointer ? Math.exp(-(((u - pointer.u) * 6) ** 2)) : 0;
          const wave = Math.sin(u * 8 + time * (.45 + curtain * .18) + curtain * 2.3) + Math.sin(u * 21 - time * .8) * .3;
          const top = height * (.02 + curtain * .06 + wave * .03);
          const length = height * (.18 + .07 * Math.sin(u * 5 + time * .3 + curtain) + near * .06 + level.prism * .08);
          const fade = Math.sin(Math.PI * Math.min(1, Math.max(0, (u - .28) / .72)));
          const palette = level.prism > .05 ? PRISM : AURORA;
          const [r, g, bl] = palette[(Math.floor(u * 3 + curtain + time * (.05 + level.prism * .6)) % palette.length + palette.length) % palette.length];
          const alpha = (.045 + near * .09) * fade * strength;
          for (let band = 0; band < 3; band++) {
            b.globalAlpha = alpha * (1 - band * .3);
            b.fillStyle = `rgb(${r},${g},${bl})`;
            b.fillRect(x, Math.round(top + length * band / 3), 1, Math.ceil(length / 3));
          }
        }
      }
      b.globalCompositeOperation = "source-over";
    }
    // Pink glints on the ice while the prism shines.
    if (level.prism > .02) {
      for (const glint of glints) {
        const on = Math.sin(time * 5 + glint.phase);
        if (on < .4) continue;
        b.globalAlpha = level.prism * (on - .4) * 1.4; b.fillStyle = on > .9 ? "#ffffff" : "#f3a5d8";
        b.fillRect(Math.round(glint.u * width), Math.round(glint.v * height), 1, 1);
      }
    }
    drawSnow(b, 0, delta);
    // Beams: a line of light that grows from one point to the other, with sparks running along it.
    beams = beams.filter((beam) => {
      beam.life += delta;
      if (beam.life >= beam.max) return false;
      const a = px(beam.from); const z = px(beam.to);
      const length = Math.hypot(z.x - a.x, z.y - a.y);
      const grown = Math.min(1, beam.life / beam.grow);
      b.globalAlpha = 1 - Math.max(0, (beam.life - beam.max + .6) / .6);
      for (let step = 0; step <= length * grown; step++) {
        const t = step / Math.max(1, length);
        const [r, g, bl] = PRISM[Math.floor(step / 4 + time * 12) % PRISM.length];
        b.fillStyle = `rgb(${r},${g},${bl})`;
        b.fillRect(Math.round(a.x + (z.x - a.x) * t), Math.round(a.y + (z.y - a.y) * t), step % 5 ? 1 : 2, 1);
      }
      return true;
    });
    b.globalAlpha = 1;
  }

  function drawFront(delta: number) {
    if (!f) return;
    f.clearRect(0, 0, width, height);
    drawSnow(f, 1, delta);
    drawSnow(f, 2, delta);
    // Ground drift: during a gust (or the blizzard), snow races low across the snowfield.
    const drift = Math.max(level.gust, level.blizzard);
    if (drift > .05 && Math.random() < delta * (20 + level.blizzard * 80)) {
      const ground = level.blizzard > .3 ? Math.random() : .82 + Math.random() * .16;
      streaks.push({ x: width * (1 + Math.random() * .1), y: height * ground, length: 4 + Math.random() * (10 + level.blizzard * 14), speed: width * (.5 + Math.random() * .5 + level.blizzard * .6), life: 0, max: 1.6 });
    }
    streaks = streaks.filter((streak) => {
      streak.life += delta; streak.x -= streak.speed * delta;
      if (streak.life >= streak.max || streak.x + streak.length < 0) return false;
      f.globalAlpha = .55 * Math.sin(Math.PI * streak.life / streak.max); f.fillStyle = "#ffffff";
      f.fillRect(Math.round(streak.x), Math.round(streak.y), Math.round(streak.length), 1);
      return true;
    });
    // Whiteout: the world fades behind a bright, slowly breathing veil.
    if (level.blizzard > .01) {
      f.globalAlpha = level.blizzard * (.32 + .06 * Math.sin(time * 2.2)); f.fillStyle = "#e6f3ff";
      f.fillRect(0, 0, width, height);
    }
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
    // Ambient: frost sparkles drifting off the snowfield.
    if (particles.length < 50 && Math.random() < delta * 5) particles.push({ x: width * (.55 + Math.random() * .45), y: height * (.78 + Math.random() * .2), vx: -2 - Math.random() * 4, vy: -2 - Math.random() * 4, life: 0, max: 2.5 + Math.random() * 2.5, color: pick(SPARK), size: 1, gravity: 0 });
    // The prism keeps spraying sparks from the crystal.
    if (prismFrom && level.prism > .3 && Math.random() < delta * 30) emit(prismFrom, 1, (x, y) => ({ x: x + (Math.random() - .5) * 4, y, vx: (Math.random() - .5) * 20, vy: -10 - Math.random() * 25, life: 0, max: .8 + Math.random() * .8, color: pick(SPARK), size: 1, gravity: 6 }));
    f.globalAlpha = 1;
  }

  const draw = (now: number) => {
    if (!running) return;
    const delta = Math.min(.05, (now - (last || now)) / 1000); last = now; time += delta;
    gustIn -= delta;
    if (gustIn <= 0 && !target.gust) { target.gust = 1; gustLeft = 2.2 + Math.random() * 1.2; onGust?.(); }
    if (target.gust) { gustLeft -= delta; if (gustLeft <= 0) { target.gust = 0; gustIn = 7 + Math.random() * 6; } }
    for (const key of ["blizzard", "prism", "gust"] as const) level[key] += (target[key] - level[key]) * Math.min(1, delta * (key === "gust" ? 1.2 : 1.8));
    drawBack(delta); drawFront(delta);
    frame = requestAnimationFrame(draw);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(back);
  return {
    start() { if (running) return; running = true; last = 0; frame = requestAnimationFrame(draw); },
    stop() { running = false; cancelAnimationFrame(frame); b?.clearRect(0, 0, width, height); f?.clearRect(0, 0, width, height); particles = []; streaks = []; beams = []; },
    destroy() { this.stop(); observer.disconnect(); },
    pointer(uv: UV | null) { pointer = uv; },
    blizzard(on: boolean) { target.blizzard = on ? 1 : 0; },
    prism(on: boolean, from?: UV) { target.prism = on ? 1 : 0; prismFrom = on ? from ?? prismFrom : null; },
    gust() { target.gust = 1; gustLeft = 2.4; onGust?.(); },
    // A small cloud of breath in the cold air, drifting off with the wind.
    breath(uv: UV) { emit(uv, 5, (x, y, index) => ({ x: x - index * .6, y: y + (Math.random() - .5) * 2, vx: -6 - Math.random() * 8 - wind() * 200, vy: -2 - Math.random() * 3, life: 0, max: 1 + Math.random() * .6, color: index % 2 ? "#e9f6ff" : "#ffffff", size: Math.random() > .5 ? 2 : 1, gravity: -1 })); },
    beam(from: UV, to: UV, duration = 2.4) { beams.push({ from, to, life: 0, max: duration, grow: .5 }); },
    burst(uv: UV, count = 30) { emit(uv, count, (x, y, index) => { const angle = Math.random() * Math.PI * 2; const speed = 14 + Math.random() * 50; return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: .5 + Math.random() * .8, color: index % 5 ? pick(SPARK) : "#ffffff", size: Math.random() > .7 ? 2 : 1, gravity: 0 }; }); },
    // Snow kicked up by a paw or a boot.
    puff(uv: UV, count = 8) { emit(uv, count, (x, y) => ({ x: x + (Math.random() - .5) * 6, y, vx: (Math.random() - .5) * 26, vy: -8 - Math.random() * 16, life: 0, max: .6 + Math.random() * .6, color: pick(SNOW), size: Math.random() > .5 ? 2 : 1, gravity: 40 })); },
    // Warm light spilling out of the opened capsule.
    embers(uv: UV, count = 16) { emit(uv, count, (x, y) => ({ x: x + (Math.random() - .5) * 8, y, vx: (Math.random() - .5) * 18, vy: -14 - Math.random() * 22, life: 0, max: 1 + Math.random() * 1.2, color: pick(EMBER), size: Math.random() > .6 ? 2 : 1, gravity: -2 })); },
    // Current targets of the weather, for tests and debugging.
    weather() { return { ...target }; },
  };
}
