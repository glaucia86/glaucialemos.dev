// The epilogue's take on the hero jump: a dive into the Veil. Gas wisps stream out of the core as the camera falls in,
// stars stretch into lines, the heart of the nebula flashes ivory, and the camera pulls back out. Scroll drives every
// frame: nothing is drawn while the progress is unchanged.
const PIXEL = 2;
const WISPS = ["#f07f77", "#e9a966", "#83efac", "#226b59", "#c75b76", "#fff0c9"];

export function createVeilJump(canvas: HTMLCanvasElement, core: { u: number; v: number }, count = 90) {
  const context = canvas.getContext("2d");
  let seed = 88;
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const wisps = Array.from({ length: count }, (_, index) => ({ angle: next() * Math.PI * 2, depth: next(), length: .05 + next() * .2, color: WISPS[index % WISPS.length], wobble: next() * 6 }));
  const stars = Array.from({ length: 70 }, () => ({ angle: next() * Math.PI * 2, depth: next() }));
  let width = 0; let height = 0; let progress = 0;

  const render = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    // The dive peaks at 0.62 and the camera is back out by 1: intensity rises and falls with the scroll.
    const dive = progress < .62 ? progress / .62 : Math.max(0, 1 - (progress - .62) / .3);
    if (dive <= 0) return;
    const cx = core.u * width; const cy = core.v * height; const reach = Math.hypot(width, height);
    context.globalAlpha = Math.min(.55, dive * .7); context.fillStyle = "#060a18"; context.fillRect(0, 0, width, height);
    // Stars stretched into speed lines by the fall.
    context.fillStyle = "#fff0c9";
    for (const star of stars) {
      const distance = reach * ((star.depth + dive * 1.4) % 1);
      const length = 2 + dive * 26 * star.depth;
      for (let step = 0; step < length; step++) {
        const d = distance + step;
        context.globalAlpha = dive * (step / length) * .8;
        context.fillRect(Math.round(cx + Math.cos(star.angle) * d), Math.round(cy + Math.sin(star.angle) * d * .7), 1, 1);
      }
    }
    // Gas wisps: wavy ribbons of the Veil's colours rushing past the camera.
    for (const wisp of wisps) {
      const start = reach * ((wisp.depth + dive * .9) % 1) * .9;
      const length = reach * wisp.length * (.4 + dive);
      context.fillStyle = wisp.color;
      for (let step = 0; step < length; step += 1) {
        const d = start + step;
        const bend = Math.sin(d * .03 + wisp.wobble) * .08;
        const angle = wisp.angle + bend;
        context.globalAlpha = dive * .7 * Math.sin(Math.PI * step / length);
        const size = d / reach > .5 ? 2 : 1;
        context.fillRect(Math.round(cx + Math.cos(angle) * d), Math.round(cy + Math.sin(angle) * d * .7), size, size);
      }
    }
    // The heart of the Veil: an ivory bloom at the deepest point of the dive.
    const flash = Math.max(0, 1 - Math.abs(progress - .62) / .08);
    if (flash > 0) {
      // A soft bloom (a radial gradient on the low-resolution canvas, so it stays grainy rather than banded).
      const radius = reach * (.15 + flash * .7);
      const bloom = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
      bloom.addColorStop(0, "rgba(255, 255, 255, 1)");
      bloom.addColorStop(.18, "rgba(255, 240, 201, .85)");
      bloom.addColorStop(.5, "rgba(240, 127, 119, .3)");
      bloom.addColorStop(1, "rgba(240, 127, 119, 0)");
      context.globalAlpha = flash; context.fillStyle = bloom; context.fillRect(0, 0, width, height);
    }
    context.globalAlpha = 1;
  };
  const resize = () => {
    width = Math.max(1, Math.round(canvas.clientWidth / PIXEL));
    height = Math.max(1, Math.round(canvas.clientHeight / PIXEL));
    canvas.width = width; canvas.height = height;
    render();
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  return {
    set(value: number) { const clamped = Math.min(1, Math.max(0, value)); if (clamped === progress) return; progress = clamped; render(); },
    destroy() { observer.disconnect(); },
  };
}
