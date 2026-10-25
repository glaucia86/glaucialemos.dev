// Pixel-art sky for the observatory. Two low-resolution canvases share the plate's coordinates (u, v in 0..1):
// "back" sits behind the crew (stars, aurora, Milky Way, meteors) and "front" above it (trails, sparks, hearts,
// smoke, constellations). Everything is a true pixel, upscaled with `image-rendering: pixelated`.
export const PIXEL = 3;

const AURORA = [[111, 242, 208], [255, 143, 216], [180, 155, 255]] as const;
const SPARK = ["#ffffff", "#b8fff0", "#6ff2d0", "#ff8fd8", "#ffd98a"];
const FLAME = ["#fff4c2", "#ffd166", "#ff9f5a", "#ff6fa8"];
const SMOKE = ["#c9bfe0", "#a99cc7", "#8a7fb0", "#efe7ff"];
const HEART = ["..##.##..", ".#######.", ".#######.", "..#####..", "...###...", "....#...."];

export type UV = { u: number; v: number };
type Star = UV & { depth: number; phase: number; speed: number; color: string; faint: boolean };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number; length: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; gravity: number; heart?: boolean };
type Trail = { x: number; y: number; life: number; max: number; color: string };
type Line = { from: UV; to: UV; life: number; max: number; grow: number };
type Constellation = { stars: UV[]; lines: [number, number][]; life: number; max: number };

// Seeded so the sky looks the same on every visit.
function random(seed: number) { let state = seed; return () => (state = (state * 16807) % 2147483647) / 2147483647; }

export function createSky({ back, front }: { back: HTMLCanvasElement; front: HTMLCanvasElement }) {
  const b = back.getContext("2d"); const f = front.getContext("2d");
  const next = random(1986);
  const stars: Star[] = Array.from({ length: 260 }, (_, index) => ({
    u: next(), v: next() * .5 * (index % 3 ? 1 : .7), depth: index % 3, phase: next() * Math.PI * 2, speed: .6 + next() * 1.8,
    color: next() > .85 ? "#ffd98a" : next() > .7 ? "#b8fff0" : "#ffffff", faint: index > 110,
  }));
  // The Milky Way: a dense diagonal band of dust, only visible with the lanterns off.
  const dust: (UV & { a: number; c: string })[] = Array.from({ length: 900 }, () => {
    const t = next(); const spread = (next() + next() + next() - 1.5) * .09;
    return { u: .02 + t * .8 + spread * .6, v: .46 - t * .48 + spread, a: .25 + next() * .75, c: next() > .8 ? "#ffd98a" : next() > .5 ? "#e8dcff" : "#ffffff" };
  });
  let width = 0; let height = 0; let frame = 0; let running = false; let last = 0; let time = 0;
  let meteors: Meteor[] = []; let particles: Particle[] = []; let trails: Trail[] = []; let lines: Line[] = []; let constellations: Constellation[] = [];
  let pointer: UV | null = null; let nextMeteor = 3;
  const level = { aurora: 1, dark: 0 }; const target = { aurora: 1, dark: 0 };

  const resize = () => {
    width = Math.max(1, Math.round(back.clientWidth / PIXEL)); height = Math.max(1, Math.round(back.clientHeight / PIXEL));
    for (const canvas of [back, front]) { canvas.width = width; canvas.height = height; }
  };
  const px = (uv: UV) => ({ x: uv.u * width, y: uv.v * height });

  const spawnMeteor = (from?: UV) => {
    const start = from ? px(from) : { x: width * (.35 + Math.random() * .6), y: height * (.02 + Math.random() * .18) };
    // Slow and bright enough to be caught: ~120–180 screen px/s, on screen for 2.2–3 s.
    const speed = 40 + Math.random() * 20;
    meteors.push({ x: start.x, y: start.y, vx: -speed, vy: speed * (.34 + Math.random() * .2), life: 0, max: 2.2 + Math.random() * .8, length: 16 + Math.random() * 8 });
  };
  const emit = (uv: UV, count: number, make: (x: number, y: number, index: number) => Particle) => { const { x, y } = px(uv); for (let index = 0; index < count; index++) particles.push(make(x, y, index)); };
  const pick = (palette: readonly string[]) => palette[Math.floor(Math.random() * palette.length)];

  function drawBack(delta: number) {
    if (!b) return;
    b.clearRect(0, 0, width, height);
    const shift = pointer ? { x: (pointer.u - .5) * 6, y: (pointer.v - .5) * 4 } : { x: 0, y: 0 };
    // Milky Way.
    if (level.dark > .01) {
      for (const point of dust) {
        b.globalAlpha = point.a * level.dark * .85; b.fillStyle = point.c;
        b.fillRect(Math.round(point.u * width + shift.x * .3), Math.round(point.v * height + shift.y * .3), 1, 1);
      }
    }
    // Stars in three depths: the far ones barely move with the pointer, the near ones twinkle harder.
    for (const star of stars) {
      const reveal = star.faint ? level.dark : 1;
      if (reveal < .02) continue;
      const twinkle = .45 + .55 * Math.sin(time * star.speed + star.phase);
      b.globalAlpha = Math.max(0, twinkle) * reveal * (star.depth === 2 ? 1 : .75);
      b.fillStyle = star.color;
      const x = Math.round(star.u * width + shift.x * (star.depth + 1) * .5); const y = Math.round(star.v * height + shift.y * (star.depth + 1) * .5);
      b.fillRect(x, y, 1, 1);
      if (star.depth === 2 && twinkle > .92) { b.globalAlpha *= .6; b.fillRect(x - 1, y, 3, 1); b.fillRect(x, y - 1, 1, 3); }
    }
    // Aurora: stepped curtains that ripple and glow brighter under the pointer.
    const strength = level.aurora;
    if (strength > .02) {
      b.globalCompositeOperation = "lighter";
      for (let curtain = 0; curtain < 2; curtain++) {
        for (let x = 0; x < width; x++) {
          const u = x / width;
          const near = pointer ? Math.exp(-(((u - pointer.u) * 6) ** 2)) : 0;
          const wave = Math.sin(u * 9 + time * (.5 + curtain * .2) + curtain * 2) + Math.sin(u * 23 - time * .9) * .35;
          const top = height * (.04 + curtain * .07 + wave * .025);
          const length = height * (.16 + .08 * Math.sin(u * 5 + time * .3 + curtain) + near * .06);
          const fade = Math.sin(Math.PI * Math.min(1, Math.max(0, (u - .12) / .8)));
          const [r, g, bl] = AURORA[(Math.floor(u * 3 + curtain + time * .05) % 3 + 3) % 3];
          const alpha = (.05 + near * .1) * fade * strength;
          for (let band = 0; band < 3; band++) {
            b.globalAlpha = alpha * (1 - band * .3);
            b.fillStyle = `rgb(${r},${g},${bl})`;
            b.fillRect(x, Math.round(top + length * band / 3), 1, Math.ceil(length / 3));
          }
        }
      }
      b.globalCompositeOperation = "source-over";
    }
    // Meteors: a bright head and a tail of fading pixels.
    meteors = meteors.filter((meteor) => {
      meteor.life += delta;
      if (meteor.life >= meteor.max) return false;
      meteor.x += meteor.vx * delta; meteor.y += meteor.vy * delta;
      const fade = Math.sin(Math.PI * meteor.life / meteor.max);
      const speed = Math.hypot(meteor.vx, meteor.vy); const dx = -meteor.vx / speed; const dy = -meteor.vy / speed;
      b.globalAlpha = fade * .35; b.fillStyle = "#b8fff0"; b.fillRect(Math.round(meteor.x) - 2, Math.round(meteor.y) - 2, 5, 5);
      for (let step = 0; step < meteor.length; step++) {
        b.globalAlpha = fade * (1 - step / meteor.length); b.fillStyle = step < 3 ? "#ffffff" : step < 7 ? "#b8fff0" : "#6ff2d0";
        const size = step < 2 ? 3 : step < 6 ? 2 : 1;
        b.fillRect(Math.round(meteor.x + dx * step) - (size >> 1), Math.round(meteor.y + dy * step) - (size >> 1), size, size);
      }
      return true;
    });
    b.globalAlpha = 1;
  }

  function drawFront(delta: number) {
    if (!f) return;
    f.clearRect(0, 0, width, height);
    trails = trails.filter((trail) => {
      trail.life += delta;
      if (trail.life >= trail.max) return false;
      f.globalAlpha = (1 - trail.life / trail.max) * (.65 + .35 * Math.sin(time * 9 + trail.x));
      f.fillStyle = trail.color; f.fillRect(Math.round(trail.x), Math.round(trail.y), 1, 1);
      return true;
    });
    // Beams: a line of light that grows from one point to the other, then fades.
    lines = lines.filter((line) => {
      line.life += delta;
      if (line.life >= line.max) return false;
      const a = px(line.from); const z = px(line.to);
      const grown = Math.min(1, line.life / line.grow);
      const steps = Math.ceil(Math.hypot(z.x - a.x, z.y - a.y) * grown);
      f.globalAlpha = 1 - Math.max(0, (line.life - line.grow) / (line.max - line.grow));
      for (let step = 0; step <= steps; step++) {
        const t = step / Math.max(1, Math.hypot(z.x - a.x, z.y - a.y));
        f.fillStyle = step % 3 ? "#6ff2d0" : "#ffffff";
        f.fillRect(Math.round(a.x + (z.x - a.x) * t), Math.round(a.y + (z.y - a.y) * t), 1, 1);
      }
      return true;
    });
    // Constellations: stars pop in one by one, the lines draw, everything holds and fades out.
    constellations = constellations.filter((sky) => {
      sky.life += delta;
      if (sky.life >= sky.max) return false;
      const fade = Math.min(1, (sky.max - sky.life) / .8);
      const shown = Math.min(sky.stars.length, Math.floor(sky.life / .12) + 1);
      const drawn = Math.max(0, (sky.life - sky.stars.length * .12) / 1.2) * sky.lines.length;
      sky.lines.forEach(([from, to], index) => {
        const amount = Math.min(1, drawn - index);
        if (amount <= 0) return;
        const a = px(sky.stars[from]); const z = px(sky.stars[to]); const length = Math.hypot(z.x - a.x, z.y - a.y);
        f.globalAlpha = .7 * fade; f.fillStyle = "#b8fff0";
        for (let step = 0; step <= length * amount; step++) f.fillRect(Math.round(a.x + (z.x - a.x) * step / length), Math.round(a.y + (z.y - a.y) * step / length), 1, 1);
      });
      sky.stars.slice(0, shown).forEach((star, index) => {
        const { x, y } = px(star); const pulse = .7 + .3 * Math.sin(time * 6 + index);
        f.globalAlpha = fade * pulse; f.fillStyle = index % 4 ? "#ffffff" : "#ffd98a";
        f.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); f.fillRect(Math.round(x), Math.round(y) - 1, 1, 3);
      });
      return true;
    });
    particles = particles.filter((particle) => {
      particle.life += delta;
      const t = particle.life / particle.max;
      if (t >= 1) return false;
      particle.vx *= .985; particle.vy = particle.vy * .985 + particle.gravity * delta;
      particle.x += particle.vx * delta; particle.y += particle.vy * delta;
      f.globalAlpha = Math.sin(Math.PI * t) * .95; f.fillStyle = particle.color;
      if (particle.heart) HEART.forEach((row, y) => [...row].forEach((pixel, x) => { if (pixel === "#") f.fillRect(Math.round(particle.x) + x - 4, Math.round(particle.y) + y - 3, 1, 1); }));
      else f.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
      return true;
    });
    // Ambient: aurora dust drifting up from the terrace.
    if (particles.length < 70 && Math.random() < delta * 8) particles.push({ x: width * (.5 + Math.random() * .5), y: height * (.75 + Math.random() * .2), vx: (Math.random() - .5) * 3, vy: -3 - Math.random() * 5, life: 0, max: 3 + Math.random() * 3, color: pick(SPARK), size: 1, gravity: 0 });
    f.globalAlpha = 1;
  }

  const draw = (now: number) => {
    if (!running) return;
    const delta = Math.min(.05, (now - (last || now)) / 1000); last = now; time += delta;
    for (const key of ["aurora", "dark"] as const) level[key] += (target[key] - level[key]) * Math.min(1, delta * 1.6);
    nextMeteor -= delta;
    if (nextMeteor <= 0) { spawnMeteor(); nextMeteor = level.dark > .5 ? 1.2 + Math.random() * 1.2 : 3 + Math.random() * 2; }
    drawBack(delta); drawFront(delta);
    frame = requestAnimationFrame(draw);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(back);
  return {
    start() { if (running) return; running = true; last = 0; frame = requestAnimationFrame(draw); },
    stop() { running = false; cancelAnimationFrame(frame); b?.clearRect(0, 0, width, height); f?.clearRect(0, 0, width, height); particles = []; trails = []; meteors = []; },
    destroy() { this.stop(); observer.disconnect(); },
    pointer(uv: UV | null) { pointer = uv; },
    aurora(value: number) { target.aurora = value; },
    dark(on: boolean) { target.dark = on ? 1 : 0; target.aurora = on ? 2.2 : 1; },
    meteor(from?: UV) { spawnMeteor(from); },
    shower(count = 14) { for (let index = 0; index < count; index++) setTimeout(() => spawnMeteor(), index * 140); },
    // Catches the meteor whose head is closest to the pointer, within a generous radius in screen pixels.
    catchAt(uv: UV, radius = 48) {
      const { x, y } = px(uv); const reach = radius / PIXEL;
      // The head or the first part of the tail counts.
      const index = meteors.findIndex((meteor) => {
        const speed = Math.hypot(meteor.vx, meteor.vy);
        for (let step = 0; step <= 8; step += 2) if (Math.hypot(meteor.x - meteor.vx / speed * step - x, meteor.y - meteor.vy / speed * step - y) < reach) return true;
        return false;
      });
      if (index < 0) return null;
      const [meteor] = meteors.splice(index, 1);
      const caught = { u: meteor.x / width, v: meteor.y / height };
      this.burst(caught, 40);
      return caught;
    },
    burst(uv: UV, count = 36) { emit(uv, count, (x, y, index) => { const angle = Math.random() * Math.PI * 2; const speed = 14 + Math.random() * 55; return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: .5 + Math.random() * .8, color: index % 5 ? pick(SPARK) : "#ffffff", size: Math.random() > .7 ? 2 : 1, gravity: 0 }; }); },
    hearts(uv: UV, count = 3) { emit(uv, count, (x, y) => ({ x: x + (Math.random() - .5) * 10, y, vx: (Math.random() - .5) * 14, vy: -14 - Math.random() * 10, life: 0, max: 1.4 + Math.random() * .6, color: Math.random() > .5 ? "#ff8fd8" : "#ff6fa8", size: 1, gravity: -2, heart: true })); },
    smoke(uv: UV, count = 3) { emit(uv, count, (x, y) => ({ x: x + (Math.random() - .5) * 6, y, vx: (Math.random() - .5) * 18, vy: -4 - Math.random() * 10, life: 0, max: 1 + Math.random() * 1.2, color: pick(SMOKE), size: Math.random() > .4 ? 2 : 1, gravity: -3 })); },
    exhaust(uv: UV, count = 4) { emit(uv, count, (x, y) => ({ x: x + (Math.random() - .5) * 3, y: y + (Math.random() - .5) * 3, vx: (Math.random() - .5) * 16, vy: (Math.random() - .5) * 16, life: 0, max: .35 + Math.random() * .45, color: pick(FLAME), size: Math.random() > .5 ? 2 : 1, gravity: 30 })); },
    trail(uv: UV, color = "#b8fff0", max = 5) { const { x, y } = px(uv); trails.push({ x, y, life: 0, max, color }, { x: x + (Math.random() - .5) * 2, y: y + 1, life: 0, max: max * .7, color: "#ff8fd8" }); },
    beam(from: UV, to: UV, duration = 2.4) { lines.push({ from, to, life: 0, max: duration, grow: .6 }); },
    constellation(stars: UV[], links: [number, number][], hold = 5) { constellations.push({ stars, lines: links, life: 0, max: stars.length * .12 + 1.2 + hold }); },
  };
}

export type Sky = ReturnType<typeof createSky>;
