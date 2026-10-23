// Low-resolution canvas upscaled with `image-rendering: pixelated`: every particle is a true pixel.
const PIXEL = 3;
const PALETTE = ["#c3f0b3", "#83bc98", "#7cf29a", "#edf5d1"];

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; tx?: number; ty?: number; sx?: number; sy?: number; cx?: number; cy?: number };
type Point = { x: number; y: number };

export function createForceParticles(canvas: HTMLCanvasElement, sources: { palm: () => Point | null; targets: () => Point[] }) {
  const context = canvas.getContext("2d");
  let particles: Particle[] = [];
  let frame = 0;
  let running = false;
  let width = 0; let height = 0; let last = 0; let spawn = 0;
  const resize = () => {
    width = Math.max(1, Math.round(canvas.clientWidth / PIXEL));
    height = Math.max(1, Math.round(canvas.clientHeight / PIXEL));
    canvas.width = width; canvas.height = height;
  };
  const local = (point: Point) => { const box = canvas.getBoundingClientRect(); return { x: (point.x - box.left) / PIXEL, y: (point.y - box.top) / PIXEL }; };
  const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const ambient = () => {
    const dense = width > 300;
    if (particles.length > (dense ? 160 : 70)) return;
    particles.push({ x: width * (.35 + Math.random() * .65), y: height * (.7 + Math.random() * .3), vx: (Math.random() - .5) * 2, vy: -4 - Math.random() * 8, life: 0, max: 2.5 + Math.random() * 3, color: pick(), size: Math.random() > .85 ? 2 : 1 });
    const palm = sources.palm(); const targets = sources.targets();
    if (palm && targets.length && Math.random() > .35) {
      const from = local(palm); const to = local(targets[Math.floor(Math.random() * targets.length)]);
      particles.push({ x: from.x, y: from.y, vx: 0, vy: 0, life: 0, max: .9 + Math.random() * .7, color: pick(), size: 1, sx: from.x, sy: from.y, tx: to.x + (Math.random() - .5) * 6, ty: to.y + (Math.random() - .5) * 6, cx: (from.x + to.x) / 2 + (Math.random() - .5) * 30, cy: Math.min(from.y, to.y) - 10 - Math.random() * 25 });
    }
  };
  const draw = (now: number) => {
    if (!context || !running) return;
    const delta = Math.min(.05, (now - (last || now)) / 1000); last = now;
    spawn += delta;
    while (spawn > .045) { ambient(); spawn -= .045; }
    context.clearRect(0, 0, width, height);
    particles = particles.filter((particle) => {
      particle.life += delta;
      const t = particle.life / particle.max;
      if (t >= 1) return false;
      if (particle.tx !== undefined) {
        const ease = t * t * (3 - 2 * t); const inverse = 1 - ease;
        particle.x = inverse * inverse * particle.sx! + 2 * inverse * ease * particle.cx! + ease * ease * particle.tx;
        particle.y = inverse * inverse * particle.sy! + 2 * inverse * ease * particle.cy! + ease * ease * particle.ty!;
      } else {
        particle.vx *= .985; particle.vy *= .985;
        particle.x += particle.vx * delta; particle.y += particle.vy * delta;
      }
      context.globalAlpha = Math.sin(Math.PI * t) * (particle.size > 1 ? .9 : .7);
      context.fillStyle = particle.color;
      context.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
      return true;
    });
    frame = requestAnimationFrame(draw);
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  return {
    start() { if (running) return; running = true; last = 0; frame = requestAnimationFrame(draw); },
    stop() { running = false; cancelAnimationFrame(frame); context?.clearRect(0, 0, width, height); particles = []; },
    burst(point: Point) {
      const origin = local(point);
      for (let index = 0; index < 56; index++) {
        const angle = Math.random() * Math.PI * 2; const speed = 20 + Math.random() * 70;
        particles.push({ x: origin.x, y: origin.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: .5 + Math.random() * .7, color: index % 4 ? pick() : "#ffffff", size: Math.random() > .7 ? 2 : 1 });
      }
    },
    destroy() { this.stop(); observer.disconnect(); },
  };
}

export type ForceParticles = ReturnType<typeof createForceParticles>;
