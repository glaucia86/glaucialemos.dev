// Pixel-art life for the Atlas's navigation room. Two low-resolution canvases share the plate's coordinates (u, v in
// 0..1): "back" sits behind Glaucia and Prince (stars in the window, satellites riding the Earth's curve, the aurora on
// the limb, city glints on the plate's night side) and "front" above them (signal rings, the visor's beam, sparks and
// the constellation drawn on the hologram's flat projection). True pixels, upscaled with `image-rendering: pixelated`.
// Nothing runs between start() and stop().
export const PIXEL = 3;
export type UV = { u: number; v: number };

export const CYAN = "#4bdfff"; export const GOLD = "#f7c36c"; export const TEAL = "#50ddbf"; export const COBALT = "#205fad"; export const ICE = "#dff8ff";

// The Earth's limb on the approved plate, fitted through three points of its curve: v = a·u² + b·u + c.
export const limb = (u: number) => .9507 * u * u - 1.883 * u + 1.1023;
// Window sky: right of the diagonal strut, under the ceiling, above the limb.
export const inSky = ({ u, v }: UV) => u > .5 && u < .995 && v > .07 && v < limb(u) - .025;
// The plate's lit cities on the night side of the Earth (lower right of the window).
const CITY_ZONE = { u0: .82, u1: .975, v0: .3, v1: .52 };

// Equirectangular viewport of the constellation (a crop, never a distortion): longitudes and latitudes map linearly.
export const VIEW = { lon0: -112, lon1: 38, lat0: -42, lat1: 56 };
export const project = (lat: number, lon: number) => ({ x: (lon - VIEW.lon0) / (VIEW.lon1 - VIEW.lon0), y: (VIEW.lat1 - lat) / (VIEW.lat1 - VIEW.lat0) });

function random(seed: number) { let state = seed; return () => (state = (state * 16807) % 2147483647) / 2147483647; }

type Star = UV & { phase: number; period: number; bright: boolean };
type Satellite = { offset: number; speed: number; phase: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string };
type Ring = { x: number; y: number; life: number; max: number; reach: number; color: string };
type Beam = { from: UV; to: UV; life: number; max: number };
type Constellation = { box: { u0: number; v0: number; u1: number; v1: number }; points: { lat: number; lon: number }[]; start: number; ms: number; onStar?: (index: number) => void; shown: number };

// Living Earth: pixel clouds drifting eastward along arcs parallel to the limb (slower and squeezed near the edge, as on
// a turning sphere), a day/night terminator creeping across the night side and city lights waking in its shadow.
// Everything is clipped by the Earth mask the pipeline cut from the plate; the painted planet itself never changes.
type Cloud = { u: number; d: number; speed: number; cells: [number, number][]; alpha: number };
const CLOUD_SPAN = { u0: .4, u1: 1.04 };
export const cloudSpeed = (d: number) => .0035 * (.35 + .65 * Math.min(1, d / .22));
export const terminatorAt = (seconds: number) => .875 + .055 * Math.sin(seconds / 240 * Math.PI * 2);

export function createOrbit({ back, front, earthMask }: { back: HTMLCanvasElement; front: HTMLCanvasElement; earthMask?: string }) {
  const b = back.getContext("2d"); const f = front.getContext("2d");
  const next = random(2017);
  const clouds: Cloud[] = Array.from({ length: 64 }, () => {
    const size = 4 + Math.floor(next() * 10);
    const cells: [number, number][] = [];
    let x = 0; let y = 0;
    for (let i = 0; i < size; i++) { cells.push([x, y]); x += Math.round(next() * 2 - .6); y += Math.round(next() * 1.4 - .7); }
    const d = .01 + next() * .3;
    return { u: CLOUD_SPAN.u0 + next() * (CLOUD_SPAN.u1 - CLOUD_SPAN.u0), d, speed: cloudSpeed(d) * (.8 + next() * .4), cells, alpha: .14 + next() * .2 };
  });
  // Offscreen layers: what moves on the Earth, then clipped to the mask.
  const content = typeof document === "undefined" ? null : document.createElement("canvas");
  const clipped = typeof document === "undefined" ? null : document.createElement("canvas");
  const c = content?.getContext("2d") ?? null; const k = clipped?.getContext("2d") ?? null;
  let mask: HTMLImageElement | null = null;
  if (earthMask && typeof Image !== "undefined") { const image = new Image(); image.onload = () => { mask = image; }; image.src = earthMask; }
  const stars: Star[] = [];
  while (stars.length < 90) { const star = { u: .5 + next() * .5, v: .07 + next() * .4, phase: next() * 6.3, period: 1.5 + next() * 3, bright: next() > .86 }; if (inSky(star)) stars.push(star); }
  const satellites: Satellite[] = [{ offset: .05, speed: .018, phase: .1 }, { offset: .1, speed: -.011, phase: .6 }, { offset: .16, speed: .007, phase: .35 }];
  const glints = Array.from({ length: 22 }, () => ({ u: CITY_ZONE.u0 + next() * (CITY_ZONE.u1 - CITY_ZONE.u0), v: CITY_ZONE.v0 + next() * (CITY_ZONE.v1 - CITY_ZONE.v0), phase: next() * 6.3, period: 2 + next() * 4 }));
  let width = 0; let height = 0; let frame = 0; let running = false; let last = 0; let time = 0;
  let particles: Particle[] = []; let rings: Ring[] = []; let beams: Beam[] = []; let constellation: Constellation | null = null;

  const resize = () => {
    width = Math.max(1, Math.round(back.clientWidth / PIXEL)); height = Math.max(1, Math.round(back.clientHeight / PIXEL));
    for (const canvas of [back, front, content, clipped]) if (canvas) { canvas.width = width; canvas.height = height; }
  };

  function drawEarth(delta: number) {
    if (!b || !c || !k || !content || !clipped || !mask) return;
    c.clearRect(0, 0, width, height);
    // Clouds ride the curvature eastward; near the limb they move slower and get squeezed, like on a sphere.
    for (const cloud of clouds) {
      cloud.u += cloud.speed * delta / 60;
      if (cloud.u > CLOUD_SPAN.u1) cloud.u = CLOUD_SPAN.u0;
      const squeeze = .45 + .55 * Math.min(1, cloud.d / .2);
      const { x, y } = px({ u: cloud.u, v: limb(cloud.u) + cloud.d });
      const fade = Math.min(1, (cloud.u - CLOUD_SPAN.u0) / .05, (CLOUD_SPAN.u1 - cloud.u) / .05);
      for (const [dx, dy] of cloud.cells) dot(c, x + dx * squeeze * 1.5, y + dy, "#f4fbff", cloud.alpha * fade * .8, 2);
    }
    // The terminator: the night side darkens beyond a slowly wandering line, and cities light up in its shadow.
    const edge = terminatorAt(time) * width;
    const shade = c.createLinearGradient(edge - width * .05, 0, edge + width * .05, 0);
    shade.addColorStop(0, "rgba(4, 10, 24, 0)"); shade.addColorStop(1, "rgba(4, 10, 24, .38)");
    c.globalAlpha = 1; c.fillStyle = shade; c.fillRect(Math.round(edge - width * .05), 0, width, height);
    for (const glint of glints) {
      const pulse = Math.max(0, Math.sin(time * (6.3 / glint.period) + glint.phase));
      const night = Math.min(1, Math.max(0, (glint.u * width - edge) / (width * .04) + .5));
      if (pulse > .45 && night > 0) { const { x, y } = px(glint); dot(c, x, y, GOLD, (pulse - .45) * 1.6 * night); }
    }
    k.globalCompositeOperation = "source-over"; k.clearRect(0, 0, width, height); k.drawImage(content, 0, 0);
    k.globalCompositeOperation = "destination-in"; k.imageSmoothingEnabled = false; k.drawImage(mask, 0, 0, width, height);
    k.globalCompositeOperation = "source-over";
    b.globalAlpha = 1; b.drawImage(clipped, 0, 0);
  }
  const px = (uv: UV) => ({ x: uv.u * width, y: uv.v * height });
  const dot = (context: CanvasRenderingContext2D, x: number, y: number, color: string, alpha: number, size = 1) => {
    context.globalAlpha = Math.max(0, Math.min(1, alpha)); context.fillStyle = color; context.fillRect(Math.round(x), Math.round(y), size, size);
  };
  // A pixel circle outline, one dot per step.
  const circle = (context: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number, dashed = false) => {
    const steps = Math.max(12, Math.round(r * 6));
    for (let i = 0; i < steps; i++) if (!dashed || i % 3) { const a = i / steps * Math.PI * 2; dot(context, x + Math.cos(a) * r, y + Math.sin(a) * r * .9, color, alpha); }
  };
  const line = (context: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, alpha: number, upTo = 1) => {
    const steps = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) * upTo));
    const total = Math.max(1, Math.hypot(x1 - x0, y1 - y0));
    for (let i = 0; i <= steps; i++) dot(context, x0 + (x1 - x0) * i / total, y0 + (y1 - y0) * i / total, color, alpha);
  };

  function drawBack(delta: number, now: number) {
    if (!b) return;
    b.clearRect(0, 0, width, height);
    drawEarth(delta);
    drawConstellation(b, now);
    for (const star of stars) {
      const twinkle = .5 + .5 * Math.sin(time * (6.3 / star.period) + star.phase);
      const { x, y } = px(star);
      dot(b, x, y, star.bright ? ICE : "#9fd8ff", .25 + twinkle * .6);
      if (star.bright && twinkle > .92) { dot(b, x - 1, y, ICE, .4); dot(b, x + 1, y, ICE, .4); dot(b, x, y - 1, ICE, .4); dot(b, x, y + 1, ICE, .4); }
    }
    // Aurora: a thin breathing band just above the limb, green fading to cyan.
    for (let u = .43; u < 1; u += 1 / Math.max(1, width)) {
      const v = limb(u); const wave = Math.sin(u * 40 + time * 1.3) * .5 + Math.sin(u * 13 - time * .7) * .5;
      const alpha = .12 + .16 * Math.max(0, wave);
      const { x, y } = px({ u, v });
      dot(b, x, y - 2 - Math.round(Math.max(0, wave) * 2), TEAL, alpha);
      dot(b, x, y - 4 - Math.round(Math.max(0, wave) * 3), CYAN, alpha * .5);
    }
    // Satellites riding the curve: a body and two panels, wrapping around the window.
    for (const sat of satellites) {
      sat.phase = (sat.phase + sat.speed * delta / 60 + 1) % 1;
      const u = .5 + sat.phase * .5; const v = limb(u) - sat.offset;
      if (!inSky({ u, v })) continue;
      const { x, y } = px({ u, v });
      dot(b, x, y, ICE, .9); dot(b, x - 2, y, COBALT, .9); dot(b, x - 1, y, CYAN, .5); dot(b, x + 1, y, CYAN, .5); dot(b, x + 2, y, COBALT, .9);
      if (Math.sin(time * 4 + sat.offset * 50) > .9) dot(b, x, y - 1, GOLD, 1);
    }
    // Without the mask (still loading) the city glints twinkle on their own.
    if (!mask) for (const glint of glints) {
      const pulse = Math.max(0, Math.sin(time * (6.3 / glint.period) + glint.phase));
      if (pulse > .55) { const { x, y } = px(glint); dot(b, x, y, GOLD, (pulse - .55) * 1.8); }
    }
    for (const beam of beams) {
      const t = beam.life / beam.max; const a = px(beam.from); const z = px(beam.to);
      line(b, a.x, a.y, z.x, z.y, CYAN, .25 * (1 - t));
      for (let k = 0; k < 4; k++) { const s = (time * 1.6 + k / 4) % 1; dot(b, a.x + (z.x - a.x) * s, a.y + (z.y - a.y) * s, ICE, .9 * (1 - t), 2); }
    }
    b.globalAlpha = 1;
  }

  // Drawn on the back canvas: the projection floats behind Glaucia and Prince, never over their faces.
  function drawConstellation(f: CanvasRenderingContext2D, now: number) {
    if (!constellation) return;
    const { box, points, start, ms } = constellation;
    const x0 = box.u0 * width; const y0 = box.v0 * height; const w = (box.u1 - box.u0) * width; const h = (box.v1 - box.v0) * height;
    const t = Math.min(1, (now - start) / ms);
    const panel = Math.min(1, t * 4);
    // The unfolded projection: a dim panel and a grid every 15°, the equator in gold.
    f.globalAlpha = .55 * panel; f.fillStyle = "#071022"; f.fillRect(Math.round(x0), Math.round(y0), Math.round(w), Math.round(h));
    for (let lon = -105; lon <= 30; lon += 15) { const { x } = project(0, lon); line(f, x0 + x * w, y0, x0 + x * w, y0 + h * panel, COBALT, .45 * panel); }
    for (let lat = -30; lat <= 45; lat += 15) { const { y } = project(lat, 0); line(f, x0, y0 + y * h, x0 + w * panel, y0 + y * h, lat === 0 ? GOLD : COBALT, (lat === 0 ? .55 : .4) * panel); }
    const reveal = Math.max(0, (t - .15) / .85) * points.length;
    const at = points.map((point) => { const p = project(point.lat, point.lon); return { x: x0 + p.x * w, y: y0 + p.y * h }; });
    for (let i = 1; i < at.length; i++) {
      const part = Math.min(1, Math.max(0, reveal - (i - 1)));
      if (part > 0) line(f, at[i - 1].x, at[i - 1].y, at[i].x, at[i].y, CYAN, .75, part);
    }
    at.forEach((p, i) => {
      if (reveal < i) return;
      const fresh = Math.max(0, 1 - (reveal - i));
      dot(f, p.x - 1, p.y - 1, GOLD, 1, 3); dot(f, p.x, p.y, "#ffffff", 1);
      if (fresh > 0) circle(f, p.x, p.y, 2 + (1 - fresh) * 5, GOLD, fresh);
    });
    const shown = Math.min(points.length, Math.floor(reveal + 1e-6));
    while (constellation.shown < shown) constellation.onStar?.(constellation.shown++);
    f.globalAlpha = 1;
  }

  function drawFront(delta: number) {
    if (!f) return;
    f.clearRect(0, 0, width, height);
    rings = rings.filter((ring) => (ring.life += delta / 60) < ring.max);
    for (const ring of rings) { const t = ring.life / ring.max; circle(f, ring.x, ring.y, 1 + t * ring.reach, ring.color, (1 - t) * .9, true); }
    particles = particles.filter((p) => (p.life += delta / 60) < p.max);
    for (const p of particles) { p.x += p.vx * delta; p.y += p.vy * delta; p.vy -= .004 * delta; dot(f, p.x, p.y, p.color, 1 - p.life / p.max); }
    beams = beams.filter((beam) => (beam.life += delta / 60) < beam.max);
    f.globalAlpha = 1;
  }

  const tick = (now: number) => {
    if (!running) return;
    const delta = last ? Math.min(3, (now - last) / 16.67) : 1; last = now; time += delta / 60;
    drawBack(delta, now); drawFront(delta);
    frame = requestAnimationFrame(tick);
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(back);

  return {
    start() { if (running) return; running = true; last = 0; frame = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(frame); },
    ring(uv: UV, count = 1, reach = 14, color = CYAN) { const { x, y } = px(uv); for (let i = 0; i < count; i++) rings.push({ x, y, life: -i * .22, max: 1.1, reach, color }); },
    sparks(uv: UV, count = 12, color = GOLD) {
      const { x, y } = px(uv);
      for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2; const s = .2 + Math.random() * .5; particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - .2, life: 0, max: .6 + Math.random() * .6, color: Math.random() > .5 ? color : ICE }); }
    },
    beam(from: UV, to: UV, seconds = 1.6) { beams.push({ from, to, life: 0, max: seconds }); },
    constellation(box: Constellation["box"], points: Constellation["points"], ms: number, onStar?: (index: number) => void) { constellation = { box, points, start: performance.now(), ms, onStar, shown: 0 }; },
    clearConstellation() { constellation = null; },
    destroy() { running = false; cancelAnimationFrame(frame); observer.disconnect(); },
  };
}
