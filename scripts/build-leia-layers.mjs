// Builds the animated Leia layers for the About hero from the AI-generated art in docs/art/segments-leia.
// Run: node scripts/build-leia-layers.mjs [--debug] (briefing and provenance: docs/leia-art.md).
// The art comes from Grok at any size, keyed on a flat magenta (or green) background. Every file is registered
// back onto public/pixel/sobre-leia.jpg (1280 × 720): the plate by its scenery, idle and blink by Leia's pixels,
// and the action poses by scale (head and height) anchored at her feet.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "docs/art/segments-leia";
const OUT = "public/pixel/leia";
const SCENE_FILE = "public/pixel/sobre-leia.jpg";
const JSON_FILE = "src/components/about/leia.json";
const RES = 1.25; // output px per scene px: keeps the source detail on large screens
const LEIA = { x0: 905, y0: 282, x1: 1075, y1: 545 }; // original Leia in the scene; kept out of the plate fit
const PATCH_PAD = 14; // scene px of plate around the idle silhouette
const FEATHER = 8;
const DEBUG = process.argv.includes("--debug");

const find = (name) => ["png", "webp", "jpg", "jpeg"].map((ext) => `${SOURCE}/${name}.${ext}`).find((file) => fs.existsSync(file));
const load = async (file) => {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const luma = ({ data, w, h }) => { const out = new Float32Array(w * h); for (let i = 0; i < w * h; i++) out[i] = data[i * 3] * .3 + data[i * 3 + 1] * .59 + data[i * 3 + 2] * .11; return out; };

// Chroma key: the background is a flat, saturated colour that never appears on Leia. Distance is measured along
// that colour's "spill" axis (how much the key channels exceed the other one), which survives JPEG noise.
function key(img) {
  const border = [];
  for (let x = 0; x < img.w; x += 8) border.push(x, (img.h - 1) * img.w + x);
  for (let y = 0; y < img.h; y += 8) border.push(y * img.w, y * img.w + img.w - 1);
  const median = [0, 1, 2].map((c) => border.map((i) => img.data[i * 3 + c]).sort((a, b) => a - b)[border.length >> 1]);
  const green = median[1] > median[0] && median[1] > median[2];
  const spill = (r, g, b) => green ? g - Math.max(r, b) : Math.min(r, b) - g;
  const bg = spill(...median);
  const lo = bg * .3; const hi = bg * .7;
  const out = { w: img.w, h: img.h, data: new Float32Array(img.w * img.h * 4) }; // premultiplied RGBA, alpha 0..1
  for (let i = 0; i < img.w * img.h; i++) {
    let r = img.data[i * 3]; let g = img.data[i * 3 + 1]; let b = img.data[i * 3 + 2];
    const s = spill(r, g, b);
    const a = clamp(1 - (s - lo) / (hi - lo));
    if (s > 0) { if (green) g -= s; else { r -= s; b -= s; } }
    out.data.set([r * a, g * a, b * a, a], i * 4);
  }
  return { ...out, bg: median, green };
}

function bbox(sprite, threshold = .5) {
  let x0 = Infinity; let y0 = Infinity; let x1 = -1; let y1 = -1;
  for (let y = 0; y < sprite.h; y++) {
    let count = 0;
    for (let x = 0; x < sprite.w; x++) if (sprite.data[(y * sprite.w + x) * 4 + 3] > threshold) count++;
    if (count < 2) continue; // ignore stray JPEG specks
    y0 = Math.min(y0, y); y1 = y;
    for (let x = 0; x < sprite.w; x++) if (sprite.data[(y * sprite.w + x) * 4 + 3] > threshold) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  }
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// Widest unbroken run through the crown in the top third (hair buns, not a raised blaster) and the centre of the boots.
function measure(sprite) {
  const box = bbox(sprite);
  const solid = (x, y) => [0, 1, 2].some((d) => sprite.data[(y * sprite.w + x + d) * 4 + 3] > .5);
  const top = []; for (let x = box.x0; x <= box.x1; x++) if (sprite.data[(box.y0 * sprite.w + x) * 4 + 3] > .5) top.push(x);
  const crown = Math.round((top[0] + top[top.length - 1]) / 2);
  let head = 0;
  for (let y = box.y0; y < box.y0 + box.h * .33; y++) {
    if (!solid(crown, y)) continue;
    let x0 = crown; let x1 = crown;
    while (x0 > box.x0 && solid(x0 - 3, y)) x0--;
    while (x1 < box.x1 - 2 && solid(x1 + 1, y)) x1++;
    head = Math.max(head, x1 - x0 + 1);
  }
  let sum = 0; let count = 0;
  for (let y = Math.round(box.y1 - box.h * .06); y <= box.y1; y++) for (let x = box.x0; x <= box.x1; x++) if (sprite.data[(y * sprite.w + x) * 4 + 3] > .5) { sum += x; count++; }
  return { box, head, feet: { x: sum / count, y: box.y1 + 1 } };
}

const near = (map, w, h, x, y) => { const ix = Math.round(x); const iy = Math.round(y); return ix < 0 || iy < 0 || ix >= w || iy >= h ? -1 : map[iy * w + ix]; };

// Coarse-to-fine search over a uniform scale and a translation; score(k, tx, ty, step) returns a mean error.
function fit(score, { k: [k0, k1], t, kStep, tStep, step }) {
  let best = { score: Infinity };
  for (let k = k0; k <= k1 + 1e-9; k += kStep) {
    const [cx, cy, range] = t(k);
    for (let ty = cy - range; ty <= cy + range; ty += tStep) for (let tx = cx - range; tx <= cx + range; tx += tStep) {
      const s = score(k, tx, ty, step);
      if (s < best.score) best = { score: s, k, tx, ty };
    }
  }
  return best;
}
const refine = (score, best, kStep, tStep, step) => fit(score, { k: [best.k - kStep * 2, best.k + kStep * 2], t: () => [best.tx, best.ty, tStep * 2], kStep: kStep / 2, tStep: tStep / 4, step });

// scene ≈ plate · k + t, compared on luminance away from Leia.
function fitPlate(plate, scene) {
  const P = luma(plate); const S = luma(scene);
  const outside = (x, y) => x < LEIA.x0 - 30 || x > LEIA.x1 + 30 || y < LEIA.y0 - 30 || y > LEIA.y1 + 30;
  const score = (k, tx, ty, step) => {
    let sum = 0; let count = 0;
    for (let y = 2; y < scene.h; y += step) for (let x = 2; x < scene.w; x += step) {
      if (!outside(x, y)) continue;
      const p = near(P, plate.w, plate.h, (x - tx) / k, (y - ty) / k);
      if (p < 0) { sum += 80; count++; continue; }
      sum += Math.abs(p - S[y * scene.w + x]); count++;
    }
    return sum / count;
  };
  const guess = scene.w / plate.w;
  let best = fit(score, { k: [guess * .8, guess * 1.25], t: () => [0, 0, 48], kStep: .01, tStep: 6, step: 12 });
  best = refine(score, best, .01, 6, 6);
  best = refine(score, best, .005, 1.5, 3);
  return best;
}

// scene ≈ sprite · k + t, compared on Leia's opaque pixels.
function fitSprite(sprite, scene, k0, k1) {
  const { box } = measure(sprite);
  const centre = { x: (LEIA.x0 + LEIA.x1) / 2, y: (LEIA.y0 + LEIA.y1) / 2 };
  const R = new Float32Array(scene.w * scene.h * 3); for (let i = 0; i < R.length; i++) R[i] = scene.data[i];
  const score = (k, tx, ty, step) => {
    let sum = 0; let count = 0;
    for (let y = box.y0; y <= box.y1; y += step) for (let x = box.x0; x <= box.x1; x += step) {
      const p = (y * sprite.w + x) * 4; if (sprite.data[p + 3] < .95) continue;
      const sx = Math.round(x * k + tx); const sy = Math.round(y * k + ty);
      if (sx < 0 || sy < 0 || sx >= scene.w || sy >= scene.h) { sum += 300; count++; continue; }
      const s = (sy * scene.w + sx) * 3;
      sum += Math.abs(sprite.data[p] - R[s]) + Math.abs(sprite.data[p + 1] - R[s + 1]) + Math.abs(sprite.data[p + 2] - R[s + 2]); count++;
    }
    return sum / count;
  };
  const t = (k) => [centre.x - k * (box.x0 + box.w / 2), centre.y - k * (box.y0 + box.h / 2), 30];
  let best = fit(score, { k: [k0, k1], t, kStep: .01, tStep: 3, step: 6 });
  best = refine(score, best, .01, 3, 3);
  best = refine(score, best, .005, .75, 2);
  best = refine(score, best, .0025, .1875, 2);
  return best;
}

// Bilinear, premultiplied sample of a keyed sprite (or an opaque image when it has 3 channels).
function sample(img, u, v, channels) {
  const x = u - .5; const y = v - .5; const ix = Math.floor(x); const iy = Math.floor(y); const fx = x - ix; const fy = y - iy;
  const out = [0, 0, 0, 0];
  for (const [dx, dy, wgt] of [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]]) {
    const px = clamp(ix + dx, 0, img.w - 1); const py = clamp(iy + dy, 0, img.h - 1); const p = (py * img.w + px) * channels;
    if (channels === 4) for (let c = 0; c < 4; c++) out[c] += img.data[p + c] * wgt;
    else { for (let c = 0; c < 3; c++) out[c] += img.data[p + c] * wgt; out[3] += wgt; }
  }
  return out;
}

// Render a region of the scene (x, y, w, h in scene px) from a source placed at scene = source · k + t.
function render(src, fitting, region, channels, alphaAt = () => 1) {
  const W = Math.round(region.w * RES); const H = Math.round(region.h * RES);
  const out = Buffer.alloc(W * H * 4);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const sx = region.x + (i + .5) / RES; const sy = region.y + (j + .5) / RES;
    const [r, g, b, a0] = sample(src, (sx - fitting.tx) / fitting.k, (sy - fitting.ty) / fitting.k, channels);
    const a = a0 * alphaAt(sx, sy);
    if (a < .02) continue;
    const norm = a0 > 0 ? 1 / a0 : 0;
    out.set([clamp(r * norm, 0, 255), clamp(g * norm, 0, 255), clamp(b * norm, 0, 255), Math.round(clamp(a) * 255)], (j * W + i) * 4);
  }
  return { data: out, w: W, h: H };
}

const toScene = (fitting, { x, y }) => ({ x: x * fitting.k + fitting.tx, y: y * fitting.k + fitting.ty });
const sceneBox = (fitting, box) => { const a = toScene(fitting, { x: box.x0, y: box.y0 }); const b = toScene(fitting, { x: box.x1 + 1, y: box.y1 + 1 }); return { x0: a.x, y0: a.y, x1: b.x, y1: b.y }; };
const round = (value, digits = 4) => Number(value.toFixed(digits));
const pctBox = ({ x, y, w, h }, total = { w: 1280, h: 720 }) => ({ left: round(x / total.w * 100), top: round(y / total.h * 100), width: round(w / total.w * 100), height: round(h / total.h * 100) });

// ——— Run ———
const scene = await load(SCENE_FILE);
const files = { plate: find("hoth-plate"), idle: find("leia-idle"), blink: find("leia-blink"), blaster: find("leia-blaster"), shiver: find("leia-shiver") };
for (const required of ["idle", "blink", "blaster"]) if (!files[required]) throw new Error(`Missing ${SOURCE}/leia-${required}.(png|jpg)`);

const sprites = {};
for (const pose of ["idle", "blink", "blaster", "shiver"]) if (files[pose]) sprites[pose] = key(await load(files[pose]));
const report = {};

// Idle and blink are traced from the scene, so they register on Leia's own pixels.
const idleSize = measure(sprites.idle);
const kGuess = (LEIA.y1 - LEIA.y0) / idleSize.box.h;
const fits = {};
for (const pose of ["idle", "blink"]) fits[pose] = fitSprite(sprites[pose], scene, kGuess * .85, kGuess * 1.15);
// Action poses are redrawn: match head width and height to idle, and stand on the same spot.
const idleFeet = toScene(fits.idle, idleSize.feet);
for (const pose of ["blaster", "shiver"]) {
  if (!sprites[pose]) continue;
  const size = measure(sprites[pose]);
  const k = fits.idle.k * Math.sqrt((idleSize.head / size.head) * (idleSize.box.h / size.box.h));
  fits[pose] = { k, tx: idleFeet.x - size.feet.x * k, ty: idleFeet.y - size.feet.y * k, score: NaN };
}
for (const [pose, f] of Object.entries(fits)) report[pose] = { k: round(f.k), tx: round(f.tx, 2), ty: round(f.ty, 2), score: round(f.score, 2), source: files[pose] };

// One frame shared by every pose, so switching poses is just switching layers.
const boxes = Object.entries(fits).map(([pose, f]) => sceneBox(f, measure(sprites[pose]).box));
const frame = { x: Math.floor(Math.min(...boxes.map((b) => b.x0)) - 4), y: Math.floor(Math.min(...boxes.map((b) => b.y0)) - 4) };
frame.w = Math.ceil(Math.max(...boxes.map((b) => b.x1)) + 4) - frame.x;
frame.h = Math.ceil(Math.max(...boxes.map((b) => b.y1)) + 2) - frame.y;
const layers = Object.fromEntries(Object.entries(fits).map(([pose, f]) => [pose, render(sprites[pose], f, frame, 4)]));

// Blink: keep only the pixels that changed around the eyes, laid over idle.
const idleBox = sceneBox(fits.idle, idleSize.box);
const head = { x0: (idleBox.x0 - frame.x) * RES, x1: (idleBox.x1 - frame.x) * RES, y0: (idleBox.y0 - frame.y) * RES, y1: (idleBox.y0 - frame.y + (idleBox.y1 - idleBox.y0) * .45) * RES };
const eyes = { x0: Infinity, y0: Infinity, x1: -1, y1: -1 };
{
  const { data: a, w } = layers.idle; const b = layers.blink.data;
  const changed = [];
  for (let y = Math.ceil(head.y0); y < head.y1; y++) for (let x = Math.ceil(head.x0); x < head.x1; x++) {
    const p = (y * w + x) * 4;
    if (a[p + 3] < 250 || b[p + 3] < 250) continue;
    if (Math.abs(a[p] - b[p]) + Math.abs(a[p + 1] - b[p + 1]) + Math.abs(a[p + 2] - b[p + 2]) > 120) changed.push([x, y]);
  }
  // The eyes are the densest cluster of change: keep points close to the median.
  const mx = changed.map(([x]) => x).sort((p, q) => p - q)[changed.length >> 1];
  const my = changed.map(([, y]) => y).sort((p, q) => p - q)[changed.length >> 1];
  const reach = { x: (head.x1 - head.x0) * .32, y: (head.y1 - head.y0) * .2 };
  for (const [x, y] of changed) if (Math.abs(x - mx) < reach.x && Math.abs(y - my) < reach.y) {
    eyes.x0 = Math.min(eyes.x0, x); eyes.x1 = Math.max(eyes.x1, x); eyes.y0 = Math.min(eyes.y0, y); eyes.y1 = Math.max(eyes.y1, y);
  }
  const pad = Math.round(2 * RES);
  Object.assign(eyes, { x0: eyes.x0 - pad, y0: eyes.y0 - pad, x1: eyes.x1 + pad, y1: eyes.y1 + pad });
  const only = Buffer.alloc(b.length);
  for (let y = eyes.y0; y <= eyes.y1; y++) for (let x = eyes.x0; x <= eyes.x1; x++) { const p = (y * w + x) * 4; b.copy(only, p, p, p + 4); }
  layers.blink = { ...layers.blink, data: only };
  report.blink.changed = changed.length;
}

// Muzzle: the leftmost pixels of the raised blaster.
const muzzle = (() => {
  const { data, w, h } = layers.blaster;
  for (let x = 0; x < w; x++) {
    const ys = [];
    for (let y = 0; y < h * .7; y++) if (data[(y * w + x) * 4 + 3] > 200) ys.push(y);
    if (ys.length >= 2) return { x: frame.x + x / RES, y: frame.y + (ys[0] + ys[ys.length - 1]) / 2 / RES };
  }
})();

// Background patch: the plate rebuilds the snow and buildings behind idle Leia, feathered into the artwork.
let patch = null;
if (files.plate) {
  const plate = await load(files.plate);
  const f = fitPlate(plate, scene);
  report.plate = { k: round(f.k), tx: round(f.tx, 2), ty: round(f.ty, 2), score: round(f.score, 2), source: files.plate };
  const region = { x: Math.floor(Math.min(idleBox.x0, LEIA.x0) - PATCH_PAD), y: Math.floor(Math.min(idleBox.y0, LEIA.y0) - PATCH_PAD) };
  region.w = Math.ceil(Math.max(idleBox.x1, LEIA.x1) + PATCH_PAD) - region.x;
  region.h = Math.ceil(Math.max(idleBox.y1, LEIA.y1) + PATCH_PAD) - region.y;
  // Match the plate's tone to the artwork on the ring around the patch.
  const offset = [0, 0, 0]; let count = 0;
  for (let y = region.y - 10; y < region.y + region.h + 10; y += 2) for (let x = region.x - 10; x < region.x + region.w + 10; x += 2) {
    const inside = x >= region.x && x < region.x + region.w && y >= region.y && y < region.y + region.h;
    if (inside || x < 0 || y < 0 || x >= scene.w || y >= scene.h) continue;
    const p = sample(plate, (x + .5 - f.tx) / f.k, (y + .5 - f.ty) / f.k, 3);
    for (let c = 0; c < 3; c++) offset[c] += scene.data[(y * scene.w + x) * 3 + c] - p[c];
    count++;
  }
  for (let c = 0; c < 3; c++) offset[c] /= count;
  const toned = { ...plate, data: Buffer.from(plate.data.map((value, i) => clamp(value + offset[i % 3], 0, 255))) };
  const edge = (sx, sy) => clamp(Math.min(sx - region.x, region.x + region.w - sx, sy - region.y, region.y + region.h - sy) / FEATHER);
  patch = { region, image: render(toned, f, region, 3, edge) };
  report.plate.tone = offset.map((value) => round(value, 1));
}

// ——— Write ———
fs.mkdirSync(OUT, { recursive: true });
const write = (name, { data, w, h }) => sharp(data, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 92, alphaQuality: 100, smartSubsample: true, effort: 6 }).toFile(`${OUT}/${name}.webp`);
await Promise.all([...Object.entries(layers).map(([pose, image]) => write(pose, image)), patch && write("plate", patch.image)]);

const inFrame = ({ x, y }) => ({ x: round((x - frame.x) / frame.w * 100), y: round((y - frame.y) / frame.h * 100) });
const layout = {
  frame: pctBox(frame),
  patch: patch ? pctBox(patch.region) : null,
  poses: Object.keys(layers),
  feet: inFrame(idleFeet),
  muzzle: { x: round(muzzle.x / 12.8), y: round(muzzle.y / 7.2) },
  eyes: pctBox({ x: eyes.x0, y: eyes.y0, w: eyes.x1 - eyes.x0 + 1, h: eyes.y1 - eyes.y0 + 1 }, layers.idle),
  fit: report,
};
fs.writeFileSync(JSON_FILE, JSON.stringify(layout, null, 2) + "\n");
console.log(JSON.stringify(layout, null, 2));

// --debug: previews of what the hero shows in each pose, written to the temp folder.
if (DEBUG) {
  const base = sharp(SCENE_FILE).resize(Math.round(1280 * RES), Math.round(720 * RES));
  const at = (x, y) => ({ left: Math.round(x * RES), top: Math.round(y * RES) });
  const png = (img) => sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } }).png().toBuffer();
  const under = patch ? [{ input: await png(patch.image), ...at(patch.region.x, patch.region.y) }] : [];
  const crop = { left: Math.round(780 * RES), top: Math.round(220 * RES), width: Math.round(400 * RES), height: Math.round(360 * RES) };
  const previews = Object.keys(layers).map((pose) => [pose, pose === "blink" ? ["idle", "blink"] : [pose]]);
  if (patch) previews.push(["plate", []]);
  for (const [name, stack] of previews) {
    const over = await Promise.all(stack.map(async (pose) => ({ input: await png(layers[pose]), ...at(frame.x, frame.y) })));
    const full = await base.clone().composite([...under, ...over]).png().toBuffer();
    const file = path.join(os.tmpdir(), `leia-preview-${name}.png`);
    await sharp(full).extract(crop).png().toFile(file);
    console.log("preview:", file);
  }
}
