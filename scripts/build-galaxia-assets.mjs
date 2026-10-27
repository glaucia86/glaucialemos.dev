// Builds the Galáxia Encantada web assets from the approved Grok sources in docs/art/galaxia-encantada/approved-source.
// Run: node scripts/build-galaxia-assets.mjs <scene-id|all> [--debug]   (writes public/galaxia/** and src/data/galaxia/<scene>.json)
//      node scripts/build-galaxia-assets.mjs --manifest                  (refreshes docs/art/galaxia-encantada/manifest.json)
// Pose sheets come either with a real alpha channel or on a flat white background; white is keyed by flood fill from
// the borders, so whites inside the characters (eyes, highlights) survive. Each pose is cut by connected components.
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const ART = "docs/art/galaxia-encantada";
const SOURCE = `${ART}/approved-source`;
const OUT = "public/galaxia";
const DATA = "src/data/galaxia";
const DEBUG = process.argv.includes("--debug");
// Stages, prop scales and the pixel grid per scene, shared with src/lib/scenes.ts.
const LAYOUT = JSON.parse(fs.readFileSync(`${DATA}/layout.json`, "utf8"));

export const SCENES = ["earth-observatory", "niveora", "mars-lab", "lumina", "earth-orbit", "aurelia", "red-tide", "beyond-orbit"];
// Pose names in reading order (rows top to bottom, then left to right). Unnamed poses become pose-N.
const POSES = {
  // 06: four portraits, then front hand-on-hip, front relaxed, left profile and back. No watering gesture.
  aurelia: {
    glaucia: ["face-smile", "face-neutral", "face-thoughtful", "face-look", "idle", "relaxed", "side", "back"],
    prince: ["front", "stand", "paw", "face-idle", "face-happy", "face-joy", "face-curious"],
  },
  // The accepted sheets vary subtly; do not label them as a fabricated reach or head turn.
  "beyond-orbit": {
    glaucia: ["float-idle", "float-b", "float-c", "float-d"],
    prince: ["float-idle", "float-b", "float-c", "float-d"],
  },
  "earth-observatory": {
    glaucia: ["idle", "blink", "telescope", "point"],
    prince: ["stand", "side", "paw", "look-up", "face-idle", "face-happy", "face-joy", "face-curious", "face-wink"],
  },
  niveora: {
    glaucia: ["idle", "blink", "capsule", "cheer"],
    prince: ["stand", "sniff", "sensor", "face-idle", "face-happy", "face-wink", "face-curious"],
    "glaucia:B": ["cold-a", "cold-b", "brace", "warm-hands"],
    "prince:B": ["walk-1", "walk-2", "walk-3", "walk-4", "sniff-down-a", "sniff-down-b", "dig-a", "dig-b", "walk-slow-1", "walk-slow-2", "walk-slow-3", "walk-slow-4"],
    "prince:C": ["cold", "shake-a", "shake-b", "wag-a", "wag-b", "sit-up", "wind"],
  },
  // The front pose has no helmet (unlike the rest of the sheet): kept as an asset, not used on stage.
  "mars-lab": {
    glaucia: ["idle", "blink", "point", "cheer"],
    prince: ["front", "side", "look", "face-idle", "face-happy", "face-joy", "face-curious"],
    "prince:B": ["stand", "gaze", "watch", "sniff"],
  },
  // Poses 3 and 4 of the Glaucia sheet carry a Prince in another harness: kept as assets, not used on stage.
  lumina: {
    glaucia: ["idle", "blink", "touch-duo", "cheer-duo"],
    prince: ["stand", "side", "look", "face-idle", "face-happy", "face-wink", "face-joy", "face-curious"],
    "glaucia:B": ["touch", "listen", "cheer", "read"],
    "prince:B": ["sniff-a", "sniff-b", "scan", "wag-a", "wag-b", "sit-up"],
  },
  // GE-GL-05 is a character sheet: four busts on top (kept for portraits), four bodies below. GE-DOG-05: the front view has
  // no helmet (kept as an asset, not on stage, like Marte); the helmeted side views act; the busts feed the visor.
  "earth-orbit": {
    glaucia: ["bust-smile", "bust-neutral", "bust-think", "bust-wonder", "hip", "idle", "profile", "back"],
    prince: ["front-bare", "side", "side-b", "face-idle", "face-tongue", "face-joy", "face-idle-b"],
    // 05B: the blink was drawn on the hand-on-hip pose (see BLINK_BASE); "operate" holds its own hologram.
    "glaucia:B": ["blink", "operate", "trace", "cheer", "tablet"],
    // 05B/05C, helmet on (the paw pose keeps its small floating orb).
    "prince:B": ["front", "stand", "paw", "wag"],
    "prince:C": ["listen", "leap", "float", "back-sit"],
  },
};
// The pose a blink overlay is registered on (default: idle).
const BLINK_BASE = { "earth-orbit": "hip" };

// One body-height ratio per extra sheet, before final cutting. Measurements exclude the two-pixel cut padding.
// C has a touching tail between wag-b and sit-up; this source-space seam separates those two bodies only.
const SHEET_NORMALIZATION = {
  niveora: {
    "glaucia:B": { pose: "cold-a", reference: "idle" },
    "prince:B": { pose: "walk-1", reference: "sniff" },
    "prince:C": { pose: "wag-a", reference: "stand", seams: [1302] },
  },
  // B: watch's tail tip shares columns with the sprout in front of sniff.
  "mars-lab": { "prince:B": { pose: "stand", reference: "side", seams: [1274] } },
  // 04B: Glaucia reading stands as upright as idle; Prince's first sniff is the same side view as the 04 sheet.
  lumina: {
    "glaucia:B": { pose: "read", reference: "idle" },
    "prince:B": { pose: "sniff-a", reference: "side" },
  },
  // 05B: the blinking pose is the hand-on-hip pose; Prince's standing helmeted views match his side view.
  "earth-orbit": {
    "glaucia:B": { pose: "blink", reference: "hip" },
    "prince:B": { pose: "stand", reference: "side" },
    "prince:C": { pose: "listen", reference: "side" },
  },
};

// Source-space seams for sheets whose poses touch: mars-lab's pointing finger reaches the blink pose's backpack;
// in lumina the blink pose's coat touches the next Prince, whose companion pose reaches the cheering one.
const SEAMS = { "mars-lab": { glaucia: [702] }, lumina: { glaucia: [655, 1083] } };

// Props cut out of a pose sheet by colour: the glowing sprout Prince sniffs in GE-DOG-03B. `exclude` drops the bubble
// helmet's rim (a circle), except for the leaf tip in front of it; small gaps and holes inside the leaves are closed.
const DERIVED_PROPS = {
  "mars-lab": {
    sprout: {
      sheet: "GE-DOG-03B-mars-lab.png", box: [1255, 660, 1440, 800],
      seed: (r, g, b) => g > r + 12 && g > b + 40,
      exclude: (x, y) => Math.hypot(x - 1420, y - 556) < 155 && ((x - 1360) / 11) ** 2 + ((y - 700) / 16) ** 2 > 1,
    },
  },
};

// Extra prop sheets with several objects, cut by connected components in reading order (GE-PROP-03B: the old terminal).
const PROP_SHEETS = {
  "mars-lab": [{ sheet: "GE-PROP-03B-mars-lab.png", names: ["retro-computer-off", "retro-computer-on", "floppy-flat", "floppy-upright"] }],
};

// Translucent areas enclosed by an object (a glowing CRT screen) become opaque: flood the outside from the borders through
// see-through pixels; whatever see-through pixel the flood cannot reach is inside the object.
function fillHoles(img) {
  const { data, w, h } = img;
  const outside = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const i = stack.pop();
    if (outside[i] || data[i * 4 + 3] >= 128) continue;
    outside[i] = 1;
    const x = i % w; const y = (i / w) | 0;
    if (x > 0) stack.push(i - 1); if (x < w - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - w); if (y < h - 1) stack.push(i + w);
  }
  for (let i = 0; i < w * h; i++) if (!outside[i] && data[i * 4 + 3] < 128) data[i * 4 + 3] = 255;
  return img;
}

function cutDerived({ sheet, box: [X0, Y0, X1, Y1], seed, exclude }, img) {
  const w = X1 - X0; const h = Y1 - Y0;
  const at = (x, y) => ((y + Y0) * img.w + x + X0) * 4;
  const keep = (x, y) => img.data[at(x, y) + 3] > 40 && !exclude(x + X0, y + Y0);
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = at(x, y); if (keep(x, y) && seed(img.data[i], img.data[i + 1], img.data[i + 2])) mask[y * w + x] = 1; }
  const morph = (src, dilate) => src.map((_, j) => {
    const x = j % w; const y = (j / w) | 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const v = src[(y + dy) * w + x + dx] ?? 0; if (dilate ? v : !v) return dilate ? 1 : 0; }
    return dilate ? 0 : 1;
  });
  const closed = morph(morph(mask, true), false);
  const ray = (x, y, dx, dy) => { for (let s = 1; s <= 8; s++) if (closed[(y + dy * s) * w + x + dx * s]) return true; return false; };
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const inside = closed[y * w + x] || mask[y * w + x] || (ray(x, y, 1, 0) && ray(x, y, -1, 0) && ray(x, y, 0, 1) && ray(x, y, 0, -1));
    if (inside && keep(x, y)) img.data.copy(out, (y * w + x) * 4, at(x, y), at(x, y) + 4);
  }
  if (!out.some((value, i) => i % 4 === 3 && value)) throw new Error(`${sheet}: derived prop is empty`);
  return { data: out, w, h };
}

// Horizontal anchor (source px) when the automatic feet centre is skewed by a companion or a prop: Glaucia's hips.
const ANCHORS = {
  "earth-observatory": { glaucia: { idle: 165, telescope: 315, point: 165 } },
  niveora: {
    glaucia: { idle: 140, capsule: 230, cheer: 175, "cold-a": 139, "cold-b": 140, brace: 216, "warm-hands": 154 },
    // Anatomical support centres in normalized crop pixels; flying snow / a lifted paw must not move the actor.
    prince: {
      "walk-1": 335, "walk-2": 342, "walk-3": 330, "walk-4": 358,
      "sniff-down-a": 385, "sniff-down-b": 302, "dig-a": 318, "dig-b": 326,
      "walk-slow-1": 341, "walk-slow-2": 332, "walk-slow-3": 328, "walk-slow-4": 314,
      cold: 146, "shake-a": 154, "shake-b": 132, "wag-a": 247, "wag-b": 136, "sit-up": 161, wind: 183,
    },
  },
};

// Floating actors pivot at the life-support connection, not at their lowest boot.
// Source pixels relative to the padded crop. Mirroring is applied at render time.
const FLOAT_ANCHORS = {
  "beyond-orbit": {
    glaucia: { "float-idle": [136, 192], "float-b": [131, 191], "float-c": [133, 187], "float-d": [131, 188] },
    prince: { "float-idle": [174, 224], "float-b": [176, 224], "float-c": [176, 238], "float-d": [185, 241] },
  },
};

const num = (scene) => String(SCENES.indexOf(scene) + 1).padStart(2, "0");
const sources = (scene) => ({
  plate: `${SOURCE}/GE-PL-${num(scene)}-${scene}.${scene === "beyond-orbit" ? "jpg" : "png"}`,
  glaucia: `${SOURCE}/GE-GL-${num(scene)}-${scene}.png`,
  prince: `${SOURCE}/GE-DOG-${num(scene)}-${scene}.png`,
  props: `${SOURCE}/props/${scene}`,
});
const webp = (input, raw) => sharp(input, raw && { raw }).webp({ quality: 92, alphaQuality: 100, smartSubsample: true, effort: 6 });

// Aurélia's supplied Glaucia sheet has a flat magenta key, not white or alpha.
// Restrict this to 06; preserve the costume's coral trim and the skin.
function keyMagenta(img) {
  for (let i = 0; i < img.data.length; i += 4) {
    const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
    if (r > 140 && g < 75 && b > 75 && r > g * 2 && b > g * 1.5) img.data[i + 3] = 0;
  }
  return img;
}

async function loadRgba(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const meta = await sharp(file).metadata();
  return { data, w: info.width, h: info.height, alpha: meta.hasAlpha };
}

// Flat white background → transparent, flooding only from the borders. Anti-aliased edges fade with their whiteness.
function keyWhite(img) {
  const { data, w, h } = img;
  const white = (i) => Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const i = stack.pop();
    if (seen[i] || white(i) < 200) continue;
    seen[i] = 1;
    const x = i % w; const y = (i / w) | 0;
    if (x > 0) stack.push(i - 1); if (x < w - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - w); if (y < h - 1) stack.push(i + w);
  }
  for (let i = 0; i < w * h; i++) if (seen[i]) data[i * 4 + 3] = Math.round(255 * Math.min(1, Math.max(0, (255 - white(i)) / 40)));
  return img;
}

// Flat chroma background (GE-GL-05: solid magenta) → transparent everywhere, including pockets enclosed by an arm (pure
// key colour never appears in the costume). Within `ring` pixels of the background, colours mixed with the key are
// un-mixed by their "excess magenta" (red and blue both above green): the coral trims and the skin have none, so they
// keep their colour while the pink fringe on the hair goes.
function keyChroma(img, [r0, g0, b0], { hard = 70, ring = 3 } = {}) {
  const { data, w, h } = img;
  const distance = (i) => Math.abs(data[i * 4] - r0) + Math.abs(data[i * 4 + 1] - g0) + Math.abs(data[i * 4 + 2] - b0);
  const full = Math.min(r0 - g0, b0 - g0);
  const spill = (i) => Math.min(data[i * 4] - data[i * 4 + 1], data[i * 4 + 2] - data[i * 4 + 1]) / full;
  let front = [];
  const near = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (distance(i) < hard) { data[i * 4 + 3] = 0; near[i] = 1; front.push(i); }
  for (let step = 0; step < ring; step++) {
    const next = [];
    for (const i of front) {
      const x = i % w; const y = (i / w) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
        if (j < 0 || near[j]) continue;
        near[j] = 1; next.push(j);
        const s = spill(j);
        if (s <= .08) continue;
        const a = Math.max(0, 1 - s);
        if (a < .1) { data[j * 4 + 3] = 0; continue; }
        [r0, g0, b0].forEach((k, c) => { data[j * 4 + c] = Math.round(Math.min(255, Math.max(0, (data[j * 4 + c] - (1 - a) * k) / a))); });
        data[j * 4 + 3] = Math.round(255 * a);
      }
    }
    front = next;
  }
  return img;
}

// Sheets without alpha: white backgrounds keep the original key; any other flat colour (magenta) uses the chroma key.
function keyBackground(img) {
  const corner = [0, 1, 2].map((c) => img.data[c]);
  return Math.min(...corner) >= 200 ? keyWhite(img) : keyChroma(img, corner);
}

// Props were cut from sheets on a black background and keep a dark margin. Flood from the transparent outside
// through near-black pixels only, so the sprites' own dark navy outlines survive.
function keyDark(img, { rg = 20, b = 36 } = {}) {
  const { data, w, h } = img;
  const dark = (i) => data[i * 4 + 3] > 0 && Math.max(data[i * 4], data[i * 4 + 1]) < rg && data[i * 4 + 2] < b;
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let i = 0; i < w * h; i++) {
    const x = i % w; const y = (i / w) | 0;
    const border = x === 0 || y === 0 || x === w - 1 || y === h - 1;
    const outside = data[i * 4 + 3] === 0 || border;
    if (outside) stack.push(i);
  }
  while (stack.length) {
    const i = stack.pop();
    if (seen[i]) continue;
    seen[i] = 1;
    if (data[i * 4 + 3] > 0 && !dark(i)) continue;
    data[i * 4 + 3] = 0;
    const x = i % w; const y = (i / w) | 0;
    if (x > 0) stack.push(i - 1); if (x < w - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - w); if (y < h - 1) stack.push(i + w);
  }
  return img;
}

// A light grey contour drawn outside the dark outline (GE-GL-04B): peeled from the transparent outside, at most
// `depth` pixels deep, through greyish light pixels only, so the coat's own light trim behind the outline survives.
const LIGHT_FRINGE = { lumina: ["glaucia:B"] };
function peelLightFringe(img, depth = 3) {
  const { data, w, h } = img;
  const light = (i) => { const r = data[i * 4]; const g = data[i * 4 + 1]; const b = data[i * 4 + 2]; return Math.min(r, g, b) >= 140 && Math.max(r, g, b) - Math.min(r, g, b) < 40; };
  let front = [];
  for (let i = 0; i < w * h; i++) if (data[i * 4 + 3] === 0) front.push(i);
  for (let step = 0; step < depth && front.length; step++) {
    const next = [];
    for (const i of front) {
      const x = i % w; const y = (i / w) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
        if (j < 0 || data[j * 4 + 3] === 0 || !light(j)) continue;
        data[j * 4 + 3] = 0; next.push(j);
      }
    }
    front = next;
  }
  return img;
}

// One pose drawn bigger than the rest of its sheet (GE-DOG-04B wag-a is a closer front view): source-space scale.
const POSE_SCALE = { lumina: { prince: { "wag-a": 0.88 } } };
async function rescale(sprite, factor) {
  const w = Math.round(sprite.w * factor); const h = Math.round(sprite.h * factor);
  const data = await sharp(sprite.data, { raw: { width: sprite.w, height: sprite.h, channels: 4 } }).resize(w, h, { kernel: "nearest" }).raw().toBuffer();
  return { ...sprite, data, w, h, feetX: Math.round(sprite.feetX * factor) };
}

// Per-scene prop cleanup. Lúmina's props came with a navy glow halo a little lighter than the default key, and loose
// specks (a sliver beside the gate, dust under the monolith): a wider dark key, then only the pixels of the big shapes.
const PROP_CLEANUP = { lumina: { rg: 26, b: 48 } };
function despeck(img) {
  const { label, groups } = poses(img);
  const keep = new Set(groups.flatMap((group) => group.ids));
  const kept = (x, y) => x >= 0 && y >= 0 && x < img.w && y < img.h && keep.has(label[y * img.w + x]);
  for (let i = 0; i < img.w * img.h; i++) {
    if (!img.data[i * 4 + 3] || keep.has(label[i])) continue;
    // The soft fringe (unlabelled, alpha < 96) stays when it touches a kept shape; other specks go.
    const x = i % img.w; const y = (i / img.w) | 0;
    let near = false;
    if (label[i] < 0) for (let d = -2; d <= 2 && !near; d++) near = kept(x + d, y) || kept(x, y + d);
    if (!near) img.data[i * 4 + 3] = 0;
  }
  return img;
}

// Connected components on alpha; small specks (sparkles, dust) are dropped unless they sit inside a big component's box.
function poses(img, seams = []) {
  const { data, w, h } = img;
  const label = new Int32Array(w * h).fill(-1);
  const comps = [];
  for (let start = 0; start < w * h; start++) {
    if (label[start] >= 0 || data[start * 4 + 3] < 96) continue;
    const c = { x0: w, y0: h, x1: 0, y1: 0, area: 0 };
    const stack = [start]; label[start] = comps.length;
    while (stack.length) {
      const i = stack.pop(); const x = i % w; const y = (i / w) | 0;
      c.area++; c.x0 = Math.min(c.x0, x); c.x1 = Math.max(c.x1, x); c.y0 = Math.min(c.y0, y); c.y1 = Math.max(c.y1, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx; const ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (seams.some((seam) => (x < seam) !== (nx < seam))) continue;
        const j = ny * w + nx; if (label[j] < 0 && data[j * 4 + 3] >= 96) { label[j] = comps.length; stack.push(j); }
      }
    }
    comps.push(c);
  }
  const largest = Math.max(...comps.map((c) => c.area));
  const big = comps.map((c, id) => ({ ...c, ids: [id] })).filter((c) => c.area > largest * .05);
  // Merge big components whose boxes overlap (a dog in front of the legs, a tripod beside a person).
  for (let merged = true; merged;) {
    merged = false;
    for (let a = 0; a < big.length && !merged; a++) for (let b = a + 1; b < big.length && !merged; b++) {
      const A = big[a]; const B = big[b];
      const split = seams.some((seam) => ((A.x0 + A.x1) / 2 < seam) !== ((B.x0 + B.x1) / 2 < seam));
      if (!split && A.x0 <= B.x1 && B.x0 <= A.x1 && A.y0 <= B.y1 && B.y0 <= A.y1) {
        Object.assign(A, { x0: Math.min(A.x0, B.x0), y0: Math.min(A.y0, B.y0), x1: Math.max(A.x1, B.x1), y1: Math.max(A.y1, B.y1), area: A.area + B.area, ids: [...A.ids, ...B.ids] });
        big.splice(b, 1); merged = true;
      }
    }
  }
  comps.forEach((c, id) => {
    if (c.area > largest * .05) return;
    const host = big.find((g) => c.x0 >= g.x0 && c.x1 <= g.x1 && c.y0 >= g.y0 && c.y1 <= g.y1);
    if (host) host.ids.push(id);
  });
  // Reading order: group into rows by vertical overlap, then left to right.
  big.sort((a, b) => a.y0 - b.y0);
  const rows = [];
  for (const g of big) {
    const row = rows.find((r) => g.y0 < r.y1 && r.y0 < g.y1);
    if (row) { row.items.push(g); row.y0 = Math.min(row.y0, g.y0); row.y1 = Math.max(row.y1, g.y1); } else rows.push({ y0: g.y0, y1: g.y1, items: [g] });
  }
  return { label, groups: rows.flatMap((r) => r.items.sort((a, b) => a.x0 - b.x0)) };
}

function cut(img, label, group, pad = 2) {
  const keep = new Set(group.ids);
  const x0 = Math.max(0, group.x0 - pad); const y0 = Math.max(0, group.y0 - pad);
  const W = Math.min(img.w, group.x1 + pad + 1) - x0; const H = Math.min(img.h, group.y1 + pad + 1) - y0;
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y0 + y) * img.w + x0 + x;
    // Keep the pose's own pixels plus the soft fringe (alpha < 96) touching them.
    let own = keep.has(label[i]);
    if (!own && label[i] < 0 && img.data[i * 4 + 3] > 0) for (let d = -2; d <= 2 && !own; d++) own = keep.has(label[i + d]) || keep.has(label[i + d * img.w]);
    if (own) img.data.copy(out, (y * W + x) * 4, i * 4, i * 4 + 4);
  }
  // Feet: centre of the opaque pixels in the bottom 4 % of the pose.
  let sum = 0; let count = 0;
  for (let y = Math.floor(H * .96); y < H; y++) for (let x = 0; x < W; x++) if (out[(y * W + x) * 4 + 3] > 128) { sum += x; count++; }
  return { data: out, w: W, h: H, feetX: count ? Math.round(sum / count) : W >> 1, x0, y0 };
}

// Blink drawn as a separate pose never lines up with idle. Register it on the head, then keep only the pixels that
// changed around the eyes, so the blink is an overlay on top of idle.
function blinkOverlay(idle, blink) {
  const head = { y0: 0, y1: Math.round(idle.h * .22) };
  const at = (img, x, y) => (y * img.w + x) * 4;
  let best = { score: Infinity, dx: 0, dy: 0 };
  for (let dy = -24; dy <= 24; dy += 2) for (let dx = -40; dx <= 40; dx += 2) {
    let sum = 0; let count = 0;
    for (let y = head.y0; y < head.y1; y += 3) for (let x = 0; x < idle.w; x += 3) {
      const bx = x + dx; const by = y + dy;
      if (bx < 0 || by < 0 || bx >= blink.w || by >= blink.h) continue;
      const p = at(idle, x, y); const q = at(blink, bx, by);
      if (idle.data[p + 3] < 200 || blink.data[q + 3] < 200) continue;
      sum += Math.abs(idle.data[p] - blink.data[q]) + Math.abs(idle.data[p + 1] - blink.data[q + 1]) + Math.abs(idle.data[p + 2] - blink.data[q + 2]); count++;
    }
    if (count > 200 && sum / count < best.score) best = { score: sum / count, dx, dy };
  }
  const changed = [];
  for (let y = head.y0; y < head.y1; y++) for (let x = 0; x < idle.w; x++) {
    const bx = x + best.dx; const by = y + best.dy;
    if (bx < 0 || by < 0 || bx >= blink.w || by >= blink.h) continue;
    const p = at(idle, x, y); const q = at(blink, bx, by);
    if (idle.data[p + 3] < 250 || blink.data[q + 3] < 250) continue;
    if (Math.abs(idle.data[p] - blink.data[q]) + Math.abs(idle.data[p + 1] - blink.data[q + 1]) + Math.abs(idle.data[p + 2] - blink.data[q + 2]) > 110) changed.push([x, y]);
  }
  const median = (values) => values.sort((a, b) => a - b)[values.length >> 1];
  const mx = median(changed.map(([x]) => x)); const my = median(changed.map(([, y]) => y));
  const box = { x0: Infinity, y0: Infinity, x1: -1, y1: -1 };
  for (const [x, y] of changed) if (Math.abs(x - mx) < idle.w * .2 && Math.abs(y - my) < idle.h * .03) {
    box.x0 = Math.min(box.x0, x); box.x1 = Math.max(box.x1, x); box.y0 = Math.min(box.y0, y); box.y1 = Math.max(box.y1, y);
  }
  const out = Buffer.alloc(idle.data.length);
  for (let y = box.y0 - 3; y <= box.y1 + 3; y++) for (let x = box.x0 - 3; x <= box.x1 + 3; x++) {
    const q = at(blink, x + best.dx, y + best.dy);
    if (idle.data[at(idle, x, y) + 3] > 200) blink.data.copy(out, at(idle, x, y), q, q + 4);
  }
  return { data: out, w: idle.w, h: idle.h, feetX: idle.feetX, shift: best, eyes: box };
}

// True pixel art: shrink to the scene grid (1 art pixel = `grid` plate pixels at the size the sprite is shown), harden
// the alpha and limit the palette without dithering. The browser scales it back up with image-rendering: pixelated.
async function pixelate(img, factor, colors) {
  const w = Math.max(1, Math.round(img.w * factor)); const h = Math.max(1, Math.round(img.h * factor));
  const small = await sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } }).resize(w, h, { kernel: "lanczos3" }).raw().toBuffer();
  for (let i = 3; i < small.length; i += 4) small[i] = small[i] >= 128 ? 255 : 0;
  const png = await sharp(small, { raw: { width: w, height: h, channels: 4 } }).png({ palette: true, colors, dither: 0 }).toBuffer();
  const { data } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) if (small[i] === 0) data[i] = 0;
  return { data, w, h };
}
const COLORS = { plate: 96, actor: 40, prop: 32 };
// Palette sizes per scene (layout.json "colors"), on top of the defaults.
const colorsOf = (scene) => ({ ...COLORS, ...LAYOUT[scene]?.colors });
const lossless = (img) => sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } }).webp({ lossless: true, effort: 6 });

// Every pose sheet of an actor in the scene: GE-GL-02-niveora.png, then extras GE-GL-02B-niveora.png, GE-GL-02C-…
const sheets = (scene, prefix) => fs.readdirSync(SOURCE).filter((file) => new RegExp(`^${prefix}-${num(scene)}[A-Z]?-${scene}\\.png$`).test(file)).sort().map((file) => ({ file: `${SOURCE}/${file}`, tag: file.match(/-\d{2}([A-Z]?)-/)[1] }));

// Cuts every pose of an actor, at the source resolution.
async function cutActor(scene, name, prefix) {
  const sprites = {};
  for (const { file, tag } of sheets(scene, prefix)) {
    let img = await loadRgba(file);
    if (!img.alpha) keyBackground(img);
    if (scene === "aurelia" && name === "glaucia") keyMagenta(img);
    else if (!img.alpha) keyWhite(img);
    const key = tag ? `${name}:${tag}` : name;
    if (LIGHT_FRINGE[scene]?.includes(key)) peelLightFringe(img);
    const names = POSES[scene]?.[key] ?? [];
    const normalization = SHEET_NORMALIZATION[scene]?.[key];
    let seams = normalization?.seams ?? SEAMS[scene]?.[key] ?? [];
    if (normalization) {
      const measured = poses(img, seams).groups;
      if (measured.length !== names.length) throw new Error(`${file}: expected ${names.length} poses, found ${measured.length}`);
      const body = measured[names.indexOf(normalization.pose)];
      const reference = sprites[normalization.reference];
      if (!body || !reference) throw new Error(`${file}: missing scale reference ${normalization.reference}`);
      const sourceHeight = body.y1 - body.y0 + 1;
      const referenceHeight = reference.h - 4;
      const factor = referenceHeight / sourceHeight;
      const { data, info } = await sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } })
        .resize(Math.round(img.w * factor), Math.round(img.h * factor), { kernel: "nearest" }).raw().toBuffer({ resolveWithObject: true });
      seams = seams.map((x) => Math.round(x * info.width / img.w));
      img = { data, w: info.width, h: info.height, alpha: true };
      if (DEBUG) console.log(`${key}: ${normalization.pose} ${sourceHeight}px → ${normalization.reference} ${referenceHeight}px; sheet scale ${factor.toFixed(6)}`);
    }
    const { label, groups } = poses(img, seams);
    if (["beyond-orbit", "aurelia"].includes(scene) && groups.length !== names.length) throw new Error(`${file}: expected ${names.length} separate floating poses, found ${groups.length}`);
    if (normalization && groups.length !== names.length) throw new Error(`${file}: normalization changed pose count to ${groups.length}`);
    groups.forEach((group, index) => { sprites[names[index] ?? `pose-${tag}${index + 1}`] = cut(img, label, group); });
  }
  for (const [pose, factor] of Object.entries(POSE_SCALE[scene]?.[name] ?? {})) if (sprites[pose]) sprites[pose] = await rescale(sprites[pose], factor);
  const blinkBase = BLINK_BASE[scene] ?? "idle";
  if (sprites[blinkBase] && sprites.blink) {
    sprites.blink = blinkOverlay(sprites[blinkBase], sprites.blink);
    if (DEBUG) console.log(`${name}/blink: shift ${JSON.stringify(sprites.blink.shift)}, eyes ${JSON.stringify(sprites.blink.eyes)}`);
  }
  // 06 has no closed-eye pose. A tiny pixel eyelid overlay, derived from idle's skin palette,
  // supplies the blink without calling any of its open-eyed portraits a blink.
  if (scene === "aurelia" && name === "glaucia") {
    const idle = sprites.idle;
    const data = Buffer.alloc(idle.w * idle.h * 4);
    for (const [x0, y0, w, h] of [[104, 64, 27, 19], [149, 64, 26, 19]]) {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
        const i = (y * idle.w + x) * 4;
        const skin = ((y0 + h + 2) * idle.w + x) * 4;
        idle.data.copy(data, i, skin, skin + 4);
        if (y === y0 + 10 || y === y0 + 11) { data[i] = 70; data[i + 1] = 39; data[i + 2] = 30; data[i + 3] = 255; }
      }
    }
    sprites.blink = { ...idle, data, eyes: { x0: 104, y0: 64, x1: 175, y1: 83 } };
  }
  return Object.keys(sprites).length ? sprites : null;
}

// Plate pixels per source pixel for an actor: from its stage (height in % of the plate) or a fixed scale.
function actorScale(scene, name, sprites, plateH) {
  const stage = LAYOUT[scene]?.stages?.[name];
  if (stage && sprites[stage.reference]) return stage.height / 100 * plateH / sprites[stage.reference].h;
  return LAYOUT[scene]?.actorScale?.[name] ?? 1;
}

// Pixelates every pose with the same factor. The blink overlay is rebuilt on the pixel grid: idle with closed eyes is
// pixelated as a whole and only the changed pixels around the eyes are kept, so it always lines up with idle.
async function pixelActor(sprites, factor, colors = COLORS.actor, base = "idle") {
  const out = {};
  for (const [pose, sprite] of Object.entries(sprites)) if (pose !== "blink") out[pose] = await pixelate(sprite, factor, colors);
  if (sprites.blink && sprites[base]) {
    const shut = Buffer.from(sprites[base].data);
    for (let i = 0; i < shut.length; i += 4) if (sprites.blink.data[i + 3]) sprites.blink.data.copy(shut, i, i, i + 4);
    const closed = await pixelate({ ...sprites[base], data: shut }, factor, colors);
    const open = out[base]; const eyes = sprites.blink.eyes;
    const box = { x0: Math.floor((eyes.x0 - 4) * factor), x1: Math.ceil((eyes.x1 + 4) * factor), y0: Math.floor((eyes.y0 - 4) * factor), y1: Math.ceil((eyes.y1 + 4) * factor) };
    const data = Buffer.alloc(open.data.length);
    for (let y = Math.max(0, box.y0); y <= Math.min(open.h - 1, box.y1); y++) for (let x = Math.max(0, box.x0); x <= Math.min(open.w - 1, box.x1); x++) {
      const i = (y * open.w + x) * 4;
      if (closed.data[i + 3] && Math.abs(closed.data[i] - open.data[i]) + Math.abs(closed.data[i + 1] - open.data[i + 1]) + Math.abs(closed.data[i + 2] - open.data[i + 2]) > 24) closed.data.copy(data, i, i, i + 4);
    }
    out.blink = { data, w: open.w, h: open.h };
  }
  return out;
}

// "Before it was pretty" (Projects): Glaucia's idle pose as it came out of Grok (source resolution, not pixelated), the
// stretch of plate she stands on, and the rejected first version (3 × 3 grid, 40 colours). The approved one is the regular
// idle asset. `crop` is the plate window in percent [left, top, right, bottom].
const BENCH = { "mars-lab": { pose: "idle", crop: [74, 38, 99, 97], grids: [3] } };
async function bench(id, plateFile, sprites, scale, colors) {
  const { pose, crop, grids } = BENCH[id];
  const dir = `${OUT}/bench/${id}`;
  fs.mkdirSync(dir, { recursive: true });
  const source = sprites[pose];
  await webp(source.data, { width: source.w, height: source.h, channels: 4 }).toFile(`${dir}/raw-${pose}.webp`);
  const meta = await sharp(plateFile).metadata();
  const [left, top, right, bottom] = crop.map((value, index) => Math.round(value / 100 * (index % 2 ? meta.height : meta.width)));
  await sharp(plateFile).extract({ left, top, width: right - left, height: bottom - top }).webp({ quality: 90, effort: 6 }).toFile(`${dir}/plate.webp`);
  const out = {
    raw: { src: `/galaxia/bench/${id}/raw-${pose}.webp`, w: source.w, h: source.h },
    plate: { src: `/galaxia/bench/${id}/plate.webp`, w: right - left, h: bottom - top, crop },
  };
  for (const grid of grids) {
    const art = await pixelate(source, scale / grid, colors);
    await lossless(art).toFile(`${dir}/grid-${grid}.webp`);
    out[`grid-${grid}`] = { src: `/galaxia/bench/${id}/grid-${grid}.webp`, w: art.w * grid, h: art.h * grid, px: [art.w, art.h] };
  }
  return out;
}

// The Earth seen through the Atlas's window: a 1-bit mask (¼ of the plate) of the pixels that belong to the planet, so
// the motion layers (clouds, terminator, city lights) only touch the Earth. The plate itself is never changed.
// Earth = below the limb curve, above the console, bluish / white / green (the window's struts are neutral greys),
// connected to a seed in the open ocean.
// The lit bench under the left of the window is bluish too: the floor of the mask rises there.
const EARTH_MASK = { "earth-orbit": { scale: 4, limb: (u) => .9507 * u * u - 1.883 * u + 1.1023, bottom: (u) => u < .46 ? .5 : u < .545 ? Math.max(.5, .477 + (u - .46) / .085 * .123) : .6, left: .4, seed: [.72, .36] } };
async function earthMask(id, plate) {
  const spec = EARTH_MASK[id];
  const w = Math.round(plate.w / spec.scale); const h = Math.round(plate.h / spec.scale);
  const { data } = await sharp(plate.data, { raw: { width: plate.w, height: plate.h, channels: 4 } }).resize(w, h, { kernel: "cubic" }).raw().toBuffer({ resolveWithObject: true });
  const earthy = (x, y) => {
    const u = x / w; const v = y / h;
    if (u < spec.left || v > spec.bottom(u) || v < spec.limb(u) + .004) return false;
    const i = (y * w + x) * 4; const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
    const luma = .3 * r + .59 * g + .11 * b;
    return b - r > 12 || luma > 140 || (g - r > 8 && g > 40);
  };
  const mask = new Uint8Array(w * h);
  const stack = [Math.round(spec.seed[1] * h) * w + Math.round(spec.seed[0] * w)];
  while (stack.length) {
    const i = stack.pop(); const x = i % w; const y = (i / w) | 0;
    if (mask[i] || !earthy(x, y)) continue;
    mask[i] = 1;
    if (x > 0) stack.push(i - 1); if (x < w - 1) stack.push(i + 1); if (y > 0) stack.push(i - w); if (y < h - 1) stack.push(i + w);
  }
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) if (mask[i]) { out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = 255; out[i * 4 + 3] = 255; }
  await lossless({ data: out, w, h }).toFile(`${OUT}/scenes/${id}/earth-mask.webp`);
  if (DEBUG) console.log(`earth mask: ${mask.reduce((sum, value) => sum + value, 0)} of ${w * h} px`);
  return { src: `/galaxia/scenes/${id}/earth-mask.webp`, w, h };
}

// A tiny copy of the plate, stretched smoothly behind the 16:9 frame so the scene's light spills over the page.
const AMBIENT = new Set(["beyond-orbit"]);
async function ambient(id, plate) {
  const [w, h] = [64, 36];
  await sharp(plate).resize(w, h, { kernel: "lanczos3" }).modulate({ saturation: 1.35 }).webp({ quality: 80 }).toFile(`${OUT}/scenes/${id}/ambient.webp`);
  return { src: `/galaxia/scenes/${id}/ambient.webp`, w, h };
}

async function scene(id) {
  const src = sources(id);
  const grid = LAYOUT[id]?.grid ?? 0;
  // plateGrid 0 keeps the approved plate as it is; actors and props still go on the grid.
  const plateGrid = LAYOUT[id]?.plateGrid ?? grid;
  const colors = colorsOf(id);
  const result = { scene: id };
  let plateH = 941;
  if (fs.existsSync(src.plate)) {
    fs.mkdirSync(`${OUT}/scenes/${id}`, { recursive: true });
    const plate = await loadRgba(src.plate);
    plateH = plate.h;
    const file = `${OUT}/scenes/${id}/background.webp`;
    const art = plateGrid ? await pixelate(plate, 1 / plateGrid, colors.plate) : null;
    if (art) await lossless(art).toFile(file); else await sharp(src.plate).webp({ quality: 90, smartSubsample: true, effort: 6 }).toFile(file);
    result.background = { src: `/galaxia/scenes/${id}/background.webp`, w: plate.w, h: plate.h, ...(art && { px: [art.w, art.h] }) };
    if (AMBIENT.has(id)) result.ambient = await ambient(id, src.plate);
    if (EARTH_MASK[id]) result.earthMask = await earthMask(id, plate);
  }
  result.actors = {};
  for (const [name, prefix] of [["glaucia", "GE-GL"], ["prince", "GE-DOG"]]) {
    const sprites = await cutActor(id, name, prefix);
    if (!sprites) continue;
    const dir = `${OUT}/actors/${name}/${id}`;
    fs.mkdirSync(dir, { recursive: true });
    const factor = actorScale(id, name, sprites, plateH) / (grid || 1);
    const art = grid ? await pixelActor(sprites, factor, colors.actor, BLINK_BASE[id] ?? "idle") : null;
    result.actors[name] = {};
    for (const [pose, sprite] of Object.entries(sprites)) {
      const file = `${dir}/${pose}.webp`;
      if (art) await lossless(art[pose]).toFile(file); else await webp(sprite.data, { width: sprite.w, height: sprite.h, channels: 4 }).toFile(file);
      const pivot = FLOAT_ANCHORS[id]?.[name]?.[pose];
      const feetX = pivot?.[0] ?? ANCHORS[id]?.[name]?.[pose === "blink" ? "idle" : pose] ?? sprite.feetX;
      result.actors[name][pose] = { src: `/galaxia/actors/${name}/${id}/${pose}.webp`, w: sprite.w, h: sprite.h, feetX, ...(pivot && { anchorY: pivot[1] }), ...(art && { px: [art[pose].w, art[pose].h] }) };
      if (DEBUG && sprite.x0 !== undefined) console.log(`${name}/${pose}: ${sprite.w}×${sprite.h} at ${sprite.x0},${sprite.y0}${art ? ` → ${art[pose].w}×${art[pose].h} px` : ""}`);
    }
    if (name === "glaucia" && BENCH[id]) result.bench = await bench(id, src.plate, sprites, factor * (grid || 1), COLORS.actor);
  }
  result.props = {};
  if (fs.existsSync(src.props)) {
    fs.mkdirSync(`${OUT}/props/${id}`, { recursive: true });
    for (const file of fs.readdirSync(src.props).filter((f) => f.endsWith(".png")).sort()) {
      const name = file.replace(/\.png$/, "");
      const cleanup = PROP_CLEANUP[id];
      const keyed = keyDark(await loadRgba(`${src.props}/${file}`), cleanup);
      const img = cleanup ? despeck(keyed) : keyed;
      const art = grid ? await pixelate(img, (LAYOUT[id]?.props?.[name] ?? 1) / grid, colors.prop) : null;
      await (art ? lossless(art) : webp(img.data, { width: img.w, height: img.h, channels: 4 })).toFile(`${OUT}/props/${id}/${name}.webp`);
      result.props[name] = { src: `/galaxia/props/${id}/${name}.webp`, w: img.w, h: img.h, ...(art && { px: [art.w, art.h] }) };
    }
  }
  for (const [name, spec] of Object.entries(DERIVED_PROPS[id] ?? {})) {
    fs.mkdirSync(`${OUT}/props/${id}`, { recursive: true });
    const img = cutDerived(spec, await loadRgba(`${SOURCE}/${spec.sheet}`));
    const art = grid ? await pixelate(img, (LAYOUT[id]?.props?.[name] ?? 1) / grid, colors.prop) : null;
    await (art ? lossless(art) : webp(img.data, { width: img.w, height: img.h, channels: 4 })).toFile(`${OUT}/props/${id}/${name}.webp`);
    result.props[name] = { src: `/galaxia/props/${id}/${name}.webp`, w: img.w, h: img.h, ...(art && { px: [art.w, art.h] }) };
  }
  for (const { sheet, names } of PROP_SHEETS[id] ?? []) {
    fs.mkdirSync(`${OUT}/props/${id}`, { recursive: true });
    const img = fillHoles(await loadRgba(`${SOURCE}/${sheet}`));
    if (!img.alpha) keyWhite(img);
    const { label, groups } = poses(img);
    if (groups.length !== names.length) throw new Error(`${sheet}: expected ${names.length} props, found ${groups.length}`);
    for (const [index, name] of names.entries()) {
      const sprite = cut(img, label, groups[index]);
      const art = grid ? await pixelate(sprite, (LAYOUT[id]?.props?.[name] ?? 1) / grid, colors.prop) : null;
      await (art ? lossless(art) : webp(sprite.data, { width: sprite.w, height: sprite.h, channels: 4 })).toFile(`${OUT}/props/${id}/${name}.webp`);
      result.props[name] = { src: `/galaxia/props/${id}/${name}.webp`, w: sprite.w, h: sprite.h, ...(art && { px: [art.w, art.h] }) };
      if (DEBUG) console.log(`${name}: ${sprite.w}×${sprite.h} at ${sprite.x0},${sprite.y0}${art ? ` → ${art.w}×${art.h} px` : ""}`);
    }
  }
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(`${DATA}/${id}.json`, JSON.stringify(result, null, 2) + "\n");
  console.log(`${id}: grid ${grid || "off"}, background ${result.background ? "ok" : "missing"}, actors ${Object.keys(result.actors).join(", ") || "none"}, ${Object.keys(result.props).length} props`);
}

// Previews for choosing the look: the plate and the actors' reference poses composed on their stages. A = layout.json
// (approved: original plate, actors on the plate's own pixel), B = grid 1.5 everywhere, C = grid 2 everywhere.
async function preview(id) {
  const src = sources(id);
  const plate = await loadRgba(src.plate);
  const colors = colorsOf(id);
  const variants = [["A", LAYOUT[id]?.grid ?? 1, LAYOUT[id]?.plateGrid ?? 0], ["B", 1.5, 1.5], ["C", 2, 2]];
  for (const [variant, grid, plateGrid] of variants) {
    const art = plateGrid ? await pixelate(plate, 1 / plateGrid, colors.plate) : plate;
    const base = await sharp(art.data, { raw: { width: art.w, height: art.h, channels: 4 } }).resize(plate.w, plate.h, { kernel: "nearest" }).png().toBuffer();
    const layers = [];
    for (const [name, prefix] of [["glaucia", "GE-GL"], ["prince", "GE-DOG"]]) {
      const stage = LAYOUT[id]?.stages?.[name];
      if (!stage) continue;
      const sprites = await cutActor(id, name, prefix);
      if (!sprites) continue;
      const scale = actorScale(id, name, sprites, plate.h);
      const pose = await pixelate(sprites[stage.reference], scale / grid, colors.actor);
      const w = Math.round(sprites[stage.reference].w * scale); const h = Math.round(sprites[stage.reference].h * scale);
      const pivot = FLOAT_ANCHORS[id]?.[name]?.[stage.reference];
      const feetX = pivot?.[0] ?? ANCHORS[id]?.[name]?.[stage.reference] ?? sprites[stage.reference].feetX;
      let image = sharp(pose.data, { raw: { width: pose.w, height: pose.h, channels: 4 } }).resize(w, h, { kernel: "nearest" });
      if (stage.flip) image = image.flop();
      const input = await image.png().toBuffer();
      layers.push({ input, left: Math.round(stage.x / 100 * plate.w - (stage.flip ? sprites[stage.reference].w - feetX : feetX) * scale), top: Math.round(stage.y / 100 * plate.h - (pivot ? pivot[1] * scale : h)) });
    }
    const composed = await sharp(base).composite(layers).png().toBuffer();
    const full = path.join(os.tmpdir(), `galaxia-${id}-${variant}.png`);
    const close = path.join(os.tmpdir(), `galaxia-${id}-${variant}-close.png`);
    await sharp(composed).toFile(full);
    await sharp(composed).extract({ left: Math.round(plate.w * .55), top: Math.round(plate.h * .35), width: Math.round(plate.w * .45), height: Math.round(plate.h * .65) }).toFile(close);
    console.log(`preview ${variant} (grid ${grid}, plate ${plateGrid || "original"}):`, full, close);
  }
}

async function manifest() {
  const previous = fs.existsSync(`${ART}/manifest.json`) ? JSON.parse(fs.readFileSync(`${ART}/manifest.json`, "utf8")) : { assets: [] };
  const byFile = new Map(previous.assets.map((a) => [a.file, a]));
  const files = [];
  const plates = new Set(SCENES.map(id => sources(id).plate));
  const walk = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const p = `${dir}/${entry.name}`; if (entry.isDirectory()) walk(p); else if (p.endsWith(".png") || plates.has(p)) files.push(p); } };
  walk(SOURCE);
  const assets = [];
  for (const file of files.sort()) {
    const rel = path.relative(ART, file).split(path.sep).join("/");
    const base = path.basename(file, path.extname(file));
    const sceneId = SCENES.find((s) => rel.includes(`/${s}/`) || base.endsWith(s)) ?? null;
    const id = base.startsWith("GE-") ? base.replace(new RegExp(`-${sceneId}$`), "") : `GE-PROP-${num(sceneId)}:${base}`;
    const meta = await sharp(file).metadata();
    const sha256 = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    const old = byFile.get(rel) ?? {};
    assets.push({ id, file: rel, sceneId, status: old.status ?? "approved", tool: "Grok Image", nativeWidth: meta.width, nativeHeight: meta.height, alpha: !!meta.hasAlpha, sha256, reviewer: old.reviewer ?? "Glaucia Lemos", notes: old.notes ?? "" });
  }
  fs.writeFileSync(`${ART}/manifest.json`, JSON.stringify({ project: "Galáxia Encantada", prompts: "docs/galaxia-encantada/PLANO-MIGRACAO.md (seção 19)", assets }, null, 2) + "\n");
  console.log(`manifest: ${assets.length} assets`);
}

const arg = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (process.argv.includes("--manifest")) await manifest();
else if (SCENES.includes(arg) && process.argv.includes("--preview")) await preview(arg);
else if (arg === "all") for (const id of SCENES) await scene(id);
else if (SCENES.includes(arg)) await scene(arg);
else { console.error(`Usage: node scripts/build-galaxia-assets.mjs <${SCENES.join("|")}|all> [--debug] [--preview] | --manifest`); process.exit(1); }
