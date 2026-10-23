// Scroll drives every frame: no loop runs while the progress is unchanged.
const PIXEL = 2;
const COLORS = ["#ffffff", "#dff6ff", "#9fdcff", "#08a9fa", "#c58bff"];

export function createHyperspace(canvas: HTMLCanvasElement, count = 280) {
  const context = canvas.getContext("2d");
  let random = 7;
  const next = () => (random = (random * 16807) % 2147483647) / 2147483647;
  const stars = Array.from({ length: count }, () => ({ angle: next() * Math.PI * 2, radius: .04 + next() * .96, color: COLORS[Math.floor(next() * COLORS.length)], width: next() > .8 ? 2 : 1 }));
  let width = 0; let height = 0; let progress = 0;
  const render = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    if (progress <= 0) return;
    const centerX = width * .5; const centerY = height * .48;
    const reach = Math.hypot(width, height) * .55;
    const speed = progress * progress;
    for (const star of stars) {
      const outer = star.radius * reach * (1 + speed * 1.8);
      const inner = Math.max(0, outer - (2 + speed * reach * .9) * star.radius);
      const cos = Math.cos(star.angle); const sin = Math.sin(star.angle);
      context.globalAlpha = Math.min(1, .25 + progress);
      context.strokeStyle = star.color;
      context.lineWidth = star.width;
      context.beginPath();
      context.moveTo(Math.round(centerX + cos * inner), Math.round(centerY + sin * inner));
      context.lineTo(Math.round(centerX + cos * outer), Math.round(centerY + sin * outer));
      context.stroke();
    }
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
