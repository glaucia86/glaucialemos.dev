// Marte's take on the hero jump: a dust storm blowing sideways across the screen, a cyan scan line that reads the
// valley into a telemetry grid with an oscilloscope trace, and an amber burst of static at the end ("signal acquired").
// Scroll drives every frame: nothing is drawn while the progress is unchanged.
const PIXEL = 2;
const DUST = ["#f3ae62", "#d27a43", "#bd5632", "#ffd6a0"];
const CYAN = "#42cfe0";
const GRID = 12;

export function createDustJump(canvas: HTMLCanvasElement, count = 260) {
  const context = canvas.getContext("2d");
  let random = 29;
  const next = () => (random = (random * 16807) % 2147483647) / 2147483647;
  const grains = Array.from({ length: count }, () => ({ x: next(), y: next(), speed: .6 + next() * 1.4, length: 2 + Math.floor(next() * 10), color: DUST[Math.floor(next() * DUST.length)], depth: next() }));
  const noise = Array.from({ length: 64 }, () => next() * 2 - 1);
  let width = 0; let height = 0; let progress = 0;

  const render = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    if (progress <= 0) return;
    const storm = Math.min(1, progress * 1.4);
    // Amber haze thickening as the storm builds.
    context.globalAlpha = storm * .45; context.fillStyle = "#3a1a12"; context.fillRect(0, 0, width, height);
    // Dust bands: grains blowing right to left, longer and faster as the jump builds.
    for (const grain of grains) {
      const travel = (grain.x - progress * grain.speed * (1.2 + grain.depth * 2.4)) % 1;
      const x = Math.round((travel < 0 ? travel + 1 : travel) * width);
      const y = Math.round(grain.y * height);
      const length = Math.round(grain.length * (1 + storm * 3 * grain.depth));
      context.globalAlpha = Math.min(1, .2 + storm * (.4 + grain.depth * .5)); context.fillStyle = grain.color;
      context.fillRect(x, y, length, grain.depth > .82 ? 2 : 1);
    }
    // Scan line: sweeps left to right between .3 and .8, laying a telemetry grid behind it.
    const scan = Math.min(1, Math.max(0, (progress - .3) / .5));
    if (scan > 0) {
      const lineX = Math.round(scan * width);
      context.globalAlpha = .16 + scan * .1; context.fillStyle = CYAN;
      for (let x = 0; x < lineX; x += GRID) context.fillRect(x, 0, 1, height);
      for (let y = 0; y < height; y += GRID) context.fillRect(0, y, lineX, 1);
      // Oscilloscope trace across the middle: a stepped wave drawn up to the scan line.
      const mid = height * .5; const amplitude = height * .08 * (1 - Math.max(0, progress - .82) * 3);
      context.globalAlpha = .9;
      for (let x = 0; x < lineX; x++) {
        const y = mid + Math.sin(x * .09 + progress * 14) * amplitude * .6 + noise[Math.floor(x / 6) % noise.length] * amplitude * .4;
        context.fillRect(x, Math.round(y), 1, 1);
      }
      context.globalAlpha = 1; context.fillStyle = "#9ff3ff"; context.fillRect(lineX, 0, 2, height);
      context.globalAlpha = .25; context.fillRect(lineX - 6, 0, 6, height);
    }
    // Signal acquired: amber static spreading over everything at the end.
    const burst = Math.max(0, (progress - .78) / .22);
    if (burst > 0) {
      context.globalAlpha = burst * .5; context.fillStyle = "#f3ae62"; context.fillRect(0, 0, width, height);
      context.globalAlpha = Math.min(1, burst * 1.2);
      const dots = Math.round(width * height * .05 * burst);
      for (let index = 0; index < dots; index++) {
        context.fillStyle = index % 3 ? "#ffd6a0" : "#ffffff";
        context.fillRect(Math.floor(((index * 7919) % 997) / 997 * width + noise[index % noise.length] * 3), Math.floor(((index * 104729) % 991) / 991 * height), 1, 1);
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
