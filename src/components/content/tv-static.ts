// The old TV's snow: a tiny canvas of grey and violet pixels, redrawn a few times per second while it runs.
const PALETTE = ["#120a20", "#2e1a4a", "#6b5a86", "#bfb3d6", "#f7e6ff"];

export function createStatic(canvas: HTMLCanvasElement, width = 64, height = 48, fps = 12) {
  const context = canvas.getContext("2d");
  canvas.width = width; canvas.height = height;
  let frame = 0; let running = false; let last = 0;
  const draw = () => {
    if (!context) return;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      context.fillStyle = PALETTE[Math.floor(Math.random() * Math.random() * PALETTE.length)];
      context.fillRect(x, y, 1, 1);
    }
    // A brighter rolling band, like a badly tuned set.
    context.globalAlpha = .25; context.fillStyle = PALETTE[4];
    context.fillRect(0, Math.floor((performance.now() / 40) % height), width, 2);
    context.globalAlpha = 1;
  };
  const tick = (now: number) => {
    if (!running) return;
    if (now - last > 1000 / fps) { last = now; draw(); }
    frame = requestAnimationFrame(tick);
  };
  return {
    start() { if (running) return; running = true; frame = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(frame); },
    // One still frame, for reduced motion.
    still: draw,
  };
}
