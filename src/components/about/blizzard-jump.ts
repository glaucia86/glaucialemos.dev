// Nivéora's take on the hero jump: a tunnel of snow pushed by the wind, aurora curtains falling from the top and a
// frosted whiteout at the end. Scroll drives every frame: no loop runs while the progress is unchanged.
const PIXEL = 2;
const AURORA = ["#55e9e8", "#b89dfc", "#f3a5d8", "#88cbe9"];

export function createBlizzardJump(canvas: HTMLCanvasElement, count = 320) {
  const context = canvas.getContext("2d");
  let random = 11;
  const next = () => (random = (random * 16807) % 2147483647) / 2147483647;
  const flakes = Array.from({ length: count }, () => ({ angle: next() * Math.PI * 2, radius: .03 + next() * .97, size: next() > .82 ? 2 : 1, tint: next() > .85 ? "#bff7f6" : "#ffffff" }));
  const curtains = Array.from({ length: 7 }, (_, index) => ({ x: (index + .5) / 7 + (next() - .5) * .08, width: .06 + next() * .07, color: AURORA[index % AURORA.length], phase: next() * Math.PI * 2 }));
  // Frost crystals growing in from the edges for the final whiteout.
  const frost = Array.from({ length: 90 }, () => { const side = Math.floor(next() * 4); return { side, t: next(), reach: .04 + next() * .12, branch: next() }; });
  let width = 0; let height = 0; let progress = 0;

  const render = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    if (progress <= 0) return;
    const speed = progress * progress;
    // Aurora curtains: stepped vertical bands sliding down from the top, brighter as the jump builds.
    const fall = Math.min(1, progress * 1.6);
    for (const curtain of curtains) {
      const x0 = Math.round((curtain.x - curtain.width / 2) * width); const x1 = Math.round((curtain.x + curtain.width / 2) * width);
      for (let x = x0; x <= x1; x += 2) {
        const ripple = Math.sin(x * .09 + curtain.phase + progress * 6) * .06;
        const length = height * fall * (.55 + ripple);
        context.fillStyle = curtain.color;
        for (let band = 0; band < 4; band++) {
          context.globalAlpha = (.12 + progress * .22) * (1 - band * .22);
          context.fillRect(x, Math.round(length * band / 4), 2, Math.ceil(length / 4));
        }
      }
    }
    // Snow tunnel: flakes rush out of the centre while the wind bends them to the left.
    const centerX = width * .52; const centerY = height * .5;
    const reach = Math.hypot(width, height) * .55;
    const windBend = width * .12 * speed;
    for (const flake of flakes) {
      const outer = flake.radius * reach * (1 + speed * 1.6);
      const inner = Math.max(0, outer - (1 + speed * reach * .5) * flake.radius);
      const cos = Math.cos(flake.angle); const sin = Math.sin(flake.angle);
      const bend = windBend * flake.radius;
      context.globalAlpha = Math.min(1, .3 + progress);
      context.strokeStyle = flake.tint; context.lineWidth = flake.size;
      context.beginPath();
      context.moveTo(Math.round(centerX + cos * inner - bend * .4), Math.round(centerY + sin * inner));
      context.lineTo(Math.round(centerX + cos * outer - bend), Math.round(centerY + sin * outer));
      context.stroke();
    }
    // Whiteout: a pale veil and frost feathers creeping in from every edge.
    const white = Math.max(0, (progress - .55) / .45);
    if (white > 0) {
      context.globalAlpha = white * .55; context.fillStyle = "#e6f3ff"; context.fillRect(0, 0, width, height);
      context.globalAlpha = Math.min(1, white * 1.4); context.fillStyle = "#ffffff";
      for (const crystal of frost) {
        const length = crystal.reach * white * Math.min(width, height);
        const along = crystal.side % 2 ? height : width;
        const p = crystal.t * along;
        for (let step = 0; step < length; step++) {
          const side = step * .45 * (crystal.branch > .5 ? 1 : -1);
          const [x, y] = crystal.side === 0 ? [p + side, step] : crystal.side === 1 ? [width - 1 - step, p + side] : crystal.side === 2 ? [p + side, height - 1 - step] : [step, p + side];
          context.fillRect(Math.round(x), Math.round(y), 1, 1);
          if (step % 4 === 2) context.fillRect(Math.round(x) + 1, Math.round(y) + 1, 1, 1);
        }
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
