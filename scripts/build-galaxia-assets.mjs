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

export const SCENES = ["earth-observatory", "niveora", "mars-lab", "lumina", "earth-orbit", "aurelia", "red-tide"];
// Pose names in reading order (rows top to bottom, then left to right). Unnamed poses become pose-N.
const POSES = {
  "earth-observatory": {
    glaucia: ["idle", "blink", "telescope", "point"],
    prince: ["stand", "side", "paw", "look-up", "face-idle", "face-happy", "face-joy", "face-curious", "face-wink"],
  },
};

// Horizontal anchor (source px) when the automatic feet centre is skewed by a companion or a prop: Glaucia's hips.
const ANCHORS = {
  "earth-observatory": { glaucia: { idle: 165, telescope: 315, point: 165 } },
};

const num = (scene) => String(SCENES.indexOf(scene) + 1).padStart(2, "0");
const sources = (scene) => ({
  plate: `${SOURCE}/GE-PL-${num(scene)}-${scene}.png`,
  glaucia: `${SOURCE}/GE-GL-${num(scene)}-${scene}.png`,
  prince: `${SOURCE}/GE-DOG-${num(scene)}-${scene}.png`,
  props: `${SOURCE}/props/${scene}`,
});
const webp = (input, raw) => sharp(input, raw && { raw }).webp({ quality: 92, alphaQuality: 100, smartSubsample: true, effort: 6 });

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

// Connected components on alpha; small specks (sparkles, dust) are dropped unless they sit inside a big component's box.
function poses(img) {
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
      if (A.x0 <= B.x1 && B.x0 <= A.x1 && A.y0 <= B.y1 && B.y0 <= A.y1) {
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

async function actor(scene, name, file) {
  if (!fs.existsSync(file)) return null;
  const img = await loadRgba(file);
  if (!img.alpha) keyWhite(img);
  const { label, groups } = poses(img);
  const names = POSES[scene]?.[name] ?? [];
  const dir = `${OUT}/actors/${name}/${scene}`;
  fs.mkdirSync(dir, { recursive: true });
  const sprites = Object.fromEntries(groups.map((group, index) => [names[index] ?? `pose-${index + 1}`, cut(img, label, group)]));
  if (sprites.idle && sprites.blink) {
    sprites.blink = blinkOverlay(sprites.idle, sprites.blink);
    if (DEBUG) console.log(`${name}/blink: shift ${JSON.stringify(sprites.blink.shift)}, eyes ${JSON.stringify(sprites.blink.eyes)}`);
  }
  const out = {};
  for (const [pose, sprite] of Object.entries(sprites)) {
    await webp(sprite.data, { width: sprite.w, height: sprite.h, channels: 4 }).toFile(`${dir}/${pose}.webp`);
    const feetX = ANCHORS[scene]?.[name]?.[pose === "blink" ? "idle" : pose] ?? sprite.feetX;
    out[pose] = { src: `/galaxia/actors/${name}/${scene}/${pose}.webp`, w: sprite.w, h: sprite.h, feetX };
    if (DEBUG && sprite.x0 !== undefined) console.log(`${name}/${pose}: ${sprite.w}×${sprite.h} at ${sprite.x0},${sprite.y0}`);
  }
  if (DEBUG) {
    const preview = path.join(os.tmpdir(), `galaxia-${scene}-${name}.png`);
    const tiles = Object.entries(out).map(([pose, p]) => ({ pose, ...p }));
    const width = tiles.reduce((s, t) => s + t.w + 8, 8); const height = Math.max(...tiles.map((t) => t.h)) + 16;
    let left = 8;
    const layers = tiles.map((t) => { const l = { input: `public${t.src}`, left, top: 8 }; left += t.w + 8; return l; });
    await sharp({ create: { width, height, channels: 4, background: { r: 30, g: 24, b: 60, alpha: 1 } } }).composite(layers).png().toFile(preview);
    console.log("preview:", preview);
  }
  return out;
}

async function scene(id) {
  const src = sources(id);
  const result = { scene: id };
  if (fs.existsSync(src.plate)) {
    fs.mkdirSync(`${OUT}/scenes/${id}`, { recursive: true });
    const meta = await sharp(src.plate).metadata();
    await sharp(src.plate).webp({ quality: 90, smartSubsample: true, effort: 6 }).toFile(`${OUT}/scenes/${id}/background.webp`);
    result.background = { src: `/galaxia/scenes/${id}/background.webp`, w: meta.width, h: meta.height };
  }
  result.actors = {};
  for (const name of ["glaucia", "prince"]) {
    const poses = await actor(id, name, src[name]);
    if (poses) result.actors[name] = poses;
  }
  result.props = {};
  if (fs.existsSync(src.props)) {
    fs.mkdirSync(`${OUT}/props/${id}`, { recursive: true });
    for (const file of fs.readdirSync(src.props).filter((f) => f.endsWith(".png")).sort()) {
      const name = file.replace(/\.png$/, "");
      const meta = await sharp(`${src.props}/${file}`).metadata();
      await webp(`${src.props}/${file}`).toFile(`${OUT}/props/${id}/${name}.webp`);
      result.props[name] = { src: `/galaxia/props/${id}/${name}.webp`, w: meta.width, h: meta.height };
    }
  }
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(`${DATA}/${id}.json`, JSON.stringify(result, null, 2) + "\n");
  console.log(`${id}: background ${result.background ? "ok" : "missing"}, actors ${Object.keys(result.actors).join(", ") || "none"}, ${Object.keys(result.props).length} props`);
}

async function manifest() {
  const previous = fs.existsSync(`${ART}/manifest.json`) ? JSON.parse(fs.readFileSync(`${ART}/manifest.json`, "utf8")) : { assets: [] };
  const byFile = new Map(previous.assets.map((a) => [a.file, a]));
  const files = [];
  const walk = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const p = `${dir}/${entry.name}`; if (entry.isDirectory()) walk(p); else if (p.endsWith(".png")) files.push(p); } };
  walk(SOURCE);
  const assets = [];
  for (const file of files.sort()) {
    const rel = path.relative(ART, file).split(path.sep).join("/");
    const base = path.basename(file, ".png");
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
else if (arg === "all") for (const id of SCENES) await scene(id);
else if (SCENES.includes(arg)) await scene(arg);
else { console.error(`Usage: node scripts/build-galaxia-assets.mjs <${SCENES.join("|")}|all> [--debug] | --manifest`); process.exit(1); }
