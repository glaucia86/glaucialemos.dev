// "To be continued…" assembled from stardust: the text is drawn once on an offscreen canvas with the element's own
// font, its pixels become targets and particles fly to them from the last star. The HTML text stays the source of
// truth (and what assistive technology reads); this canvas only paints light on top of it and then fades away.
const PIXEL = 2;
const DUST = ["#ffffff", "#fff0c9", "#e9a966", "#f07f77", "#83efac"];
type Grain = { sx: number; sy: number; tx: number; ty: number; delay: number; color: string; curve: number };

export function createStardust(canvas: HTMLCanvasElement, limit = 1600) {
  const context = canvas.getContext("2d");
  let grains: Grain[] = []; let frame = 0; let started = 0; let travel = 1.3; let fadeAt = Infinity;

  const fit = () => {
    canvas.width = Math.max(1, Math.round(canvas.clientWidth / PIXEL)); canvas.height = Math.max(1, Math.round(canvas.clientHeight / PIXEL));
  };

  const draw = (now: number) => {
    if (!context) return;
    const elapsed = (now - started) / 1000;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const fade = elapsed > fadeAt ? Math.max(0, 1 - (elapsed - fadeAt) / .7) : 1;
    if (fade <= 0) { grains = []; return; }
    for (const grain of grains) {
      const t = Math.min(1, Math.max(0, (elapsed - grain.delay) / travel));
      if (t <= 0) continue;
      const ease = 1 - (1 - t) ** 3;
      // A curved flight: the path bows sideways and settles on the letter.
      const bow = Math.sin(Math.PI * ease) * grain.curve;
      const x = grain.sx + (grain.tx - grain.sx) * ease - (grain.ty - grain.sy) * bow * .002;
      const y = grain.sy + (grain.ty - grain.sy) * ease + (grain.tx - grain.sx) * bow * .002;
      context.globalAlpha = (t < 1 ? .9 : .55 + .45 * Math.sin(elapsed * 9 + grain.tx)) * fade;
      context.fillStyle = t < 1 ? grain.color : "#fff0c9";
      context.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    context.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  };

  return {
    // Particles leave `from` (viewport px) and settle on `element`'s text over `duration` seconds.
    form(from: { x: number; y: number }, element: HTMLElement, duration = 1.3) {
      if (!context) return;
      cancelAnimationFrame(frame); fit();
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const text = element.textContent?.trim() ?? "";
      const scratch = document.createElement("canvas");
      const w = Math.max(1, Math.round(box.width / PIXEL)); const h = Math.max(1, Math.round(box.height / PIXEL));
      scratch.width = w; scratch.height = h;
      const ink = scratch.getContext("2d", { willReadFrequently: true });
      if (!ink || !text) return;
      ink.font = `${style.fontStyle} ${style.fontWeight} ${parseFloat(style.fontSize) / PIXEL}px ${style.fontFamily}`;
      ink.textAlign = "center"; ink.textBaseline = "middle"; ink.fillStyle = "#fff";
      ink.fillText(text, w / 2, h / 2);
      const data = ink.getImageData(0, 0, w, h).data;
      const targets: { x: number; y: number }[] = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 140) targets.push({ x, y });
      const step = Math.max(1, Math.ceil(targets.length / limit));
      // The canvas covers the scene and the finale, so every point is taken relative to it.
      const area = canvas.getBoundingClientRect();
      const ox = (box.left - area.left) / PIXEL; const oy = (box.top - area.top) / PIXEL;
      const sx = (from.x - area.left) / PIXEL; const sy = (from.y - area.top) / PIXEL;
      travel = duration * .75;
      grains = targets.filter((_, index) => index % step === 0).map((target, index) => ({
        sx: sx + (Math.random() - .5) * 6, sy: sy + (Math.random() - .5) * 6, tx: ox + target.x, ty: oy + target.y,
        delay: (target.x / w) * duration * .25 + Math.random() * .08, color: DUST[index % DUST.length], curve: (Math.random() - .5) * 220,
      }));
      fadeAt = duration + .25; started = performance.now();
      frame = requestAnimationFrame(draw);
    },
    clear() { cancelAnimationFrame(frame); grains = []; context?.clearRect(0, 0, canvas.width, canvas.height); },
    destroy() { this.clear(); },
    load() { return grains.length; },
  };
}
