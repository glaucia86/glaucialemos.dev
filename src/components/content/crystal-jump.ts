// Lúmina's take on the hero jump: a crystal tunnel. Faceted shards grow in from the edges like a geode closing, the
// light splits into violet, pink and cyan bands (one or two pixels apart) while book pages spiral to the centre, and an
// opaline flash of facets opens the archive. Scroll drives every frame: nothing is drawn while the progress is unchanged.
const PIXEL = 2;
const FACETS = ["#aa78f4", "#e474c7", "#53e0e8", "#6b3fb0", "#f7e6ff"];
const OPAL = "#f7e6ff";

export function createCrystalJump(canvas: HTMLCanvasElement, count = 56) {
  const context = canvas.getContext("2d");
  let seed = 41;
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const shards = Array.from({ length: count }, (_, index) => ({ angle: index / count * Math.PI * 2 + next() * .2, size: .05 + next() * .09, color: FACETS[index % 4], depth: next() }));
  const pages = Array.from({ length: 22 }, () => ({ angle: next() * Math.PI * 2, radius: .55 + next() * .5, spin: 4 + next() * 5, flap: next() * 6 }));
  let width = 0; let height = 0; let progress = 0;

  // A filled diamond with a light top-left facet and a dark bottom-right one.
  const diamond = (cx: number, cy: number, rx: number, ry: number, color: string, alpha: number) => {
    if (!context || rx < 1) return;
    for (let dy = -ry; dy <= ry; dy++) {
      const span = Math.round(rx * (1 - Math.abs(dy) / (ry + 1)));
      context.globalAlpha = alpha; context.fillStyle = color;
      context.fillRect(Math.round(cx - span), Math.round(cy + dy), span * 2 + 1, 1);
      context.globalAlpha = alpha * .55; context.fillStyle = dy < 0 ? OPAL : "#2a1648";
      context.fillRect(Math.round(dy < 0 ? cx - span : cx), Math.round(cy + dy), Math.max(1, Math.round(span * .5)), 1);
    }
  };

  const render = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    if (progress <= 0) return;
    const cx = width / 2; const cy = height / 2; const reach = Math.hypot(cx, cy);
    // Aubergine dusk thickening as the tunnel closes.
    context.globalAlpha = Math.min(.6, progress * .9); context.fillStyle = "#160c26"; context.fillRect(0, 0, width, height);
    // 1. Shards growing in from the edges toward the centre.
    const close = Math.min(1, progress / .7);
    for (const shard of shards) {
      const distance = reach * (1.05 - close * (.55 + shard.depth * .3));
      const x = cx + Math.cos(shard.angle) * distance; const y = cy + Math.sin(shard.angle) * distance * .8;
      const size = reach * shard.size * (.4 + close);
      diamond(x, y, Math.round(size * .55), Math.round(size), shard.color, Math.min(1, .3 + close * .7));
    }
    // 2. Refraction: three bands a pixel apart sweep down the tunnel; pages spiral to the centre.
    const split = Math.min(1, Math.max(0, (progress - .3) / .5));
    if (split > 0) {
      const band = Math.round(height * (.15 + split * .7));
      ["#aa78f4", "#e474c7", "#53e0e8"].forEach((color, index) => {
        context.globalAlpha = .5 * (1 - Math.max(0, split - .8) * 4); context.fillStyle = color;
        context.fillRect(0, band + index * 2 - 2, width, 1);
        context.fillRect(Math.round(cx - reach * split * .5) + index, 0, 1, height);
      });
      for (const page of pages) {
        const radius = reach * page.radius * (1 - split);
        const angle = page.angle + split * page.spin;
        const x = Math.round(cx + Math.cos(angle) * radius); const y = Math.round(cy + Math.sin(angle) * radius * .8);
        const open = Math.round(Math.abs(Math.sin(split * 9 + page.flap)) * 3);
        context.globalAlpha = Math.min(1, split * 2); context.fillStyle = OPAL;
        context.fillRect(x - open, y, open, 2); context.fillRect(x + 1, y, open, 2);
        context.fillStyle = "#53e0e8"; context.fillRect(x, y - 1, 1, 4);
      }
    }
    // 3. The archive opens: an opaline flash resolving into a mosaic of facets.
    const burst = Math.max(0, (progress - .78) / .22);
    if (burst > 0) {
      context.globalAlpha = burst * .55; context.fillStyle = OPAL; context.fillRect(0, 0, width, height);
      const cell = 10;
      for (let y = 0; y < height + cell; y += cell) for (let x = (y / cell) % 2 ? cell / 2 : 0; x < width + cell; x += cell) {
        const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
        if ((hash % 1000) / 1000 > burst) continue;
        diamond(x, y, cell / 2 - 1, cell / 2, FACETS[hash % FACETS.length], .5 + burst * .4);
      }
    }
    context.globalAlpha = 1;
  };
  const resize = () => {
    width = Math.max(1, Math.round(canvas.clientWidth / PIXEL));
    height = Math.max(1, Math.round(canvas.clientHeight / PIXEL));
    canvas.width = width; canvas.height = height;
    if (context) context.imageSmoothingEnabled = false;
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
