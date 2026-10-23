// Builds the Force-pose Yoda layers from the AI-generated source art in docs/art/segments-yoda.
// Run: node scripts/build-yoda-force.mjs (provenance and measurements: docs/dagobah-art.md).
import fs from "node:fs";
import sharp from "sharp";

const SOURCE = "docs/art/segments-yoda";
const OUT = "public/pixel/yoda-force";
const SCALE = 0.75; // sprite px → 1280 × 720 scene px; balances head size and body height of the idle Yoda
const IDLE_FEET = { x: 873, y: 498 }; // idle Yoda's feet on the mossy platform (1280 × 720)
const SPRITE_FEET = { x: 228, y: 321 };
const SCENE = { w: 1280, h: 720 };

const raw = async (file) => {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};

// Locate a segment inside the sprite: lowest mean RGB difference over its opaque pixels.
function locate(sprite, part) {
  let best = { score: Infinity, x: 0, y: 0 };
  for (let oy = 0; oy <= sprite.h - part.h; oy++) for (let ox = 0; ox <= sprite.w - part.w; ox++) {
    let score = 0; let count = 0;
    for (let y = 0; y < part.h; y += 2) for (let x = 0; x < part.w; x += 2) {
      const p = (y * part.w + x) * 4; if (part.data[p + 3] < 200) continue;
      const s = ((y + oy) * sprite.w + x + ox) * 4;
      score += Math.abs(part.data[p] - sprite.data[s]) + Math.abs(part.data[p + 1] - sprite.data[s + 1]) + Math.abs(part.data[p + 2] - sprite.data[s + 2]) + (sprite.data[s + 3] < 128 ? 200 : 0);
      count++;
    }
    score /= count;
    if (score < best.score) best = { score, x: ox, y: oy };
  }
  return best;
}

// Cut the sprite's own pixels under a segment's silhouette, so colors always match the body.
function cut(sprite, part, at, taken) {
  const layer = Buffer.alloc(sprite.data.length);
  for (let y = 0; y < part.h; y++) for (let x = 0; x < part.w; x++) {
    if (part.data[(y * part.w + x) * 4 + 3] < 100) continue;
    const sx = x + at.x; const sy = y + at.y; const s = (sy * sprite.w + sx) * 4;
    if (taken[sy * sprite.w + sx] || sprite.data[s + 3] < 16) continue;
    sprite.data.copy(layer, s, s, s + 4);
    taken[sy * sprite.w + sx] = 1;
  }
  return layer;
}

const sprite = await raw(`${SOURCE}/yoda.png`);
const parts = { earRight: "pointy-ears/pointy-ears-1", earLeft: "pointy-ears/pointy-ears-2", robe: "robe" };
const taken = new Uint8Array(sprite.w * sprite.h);
const layers = {}; const found = {};
for (const [name, file] of Object.entries(parts)) {
  const part = await raw(`${SOURCE}/${file}.png`);
  found[name] = { ...locate(sprite, part), w: part.w, h: part.h };
  layers[name] = cut(sprite, part, found[name], taken);
}
const body = Buffer.from(sprite.data);
for (let i = 0; i < taken.length; i++) if (taken[i]) body[i * 4 + 3] = 0;
layers.body = body;

fs.mkdirSync(OUT, { recursive: true });
const write = (name, data) => sharp(data, { raw: { width: sprite.w, height: sprite.h, channels: 4 } }).webp({ lossless: true }).toFile(`${OUT}/${name}.webp`);
await Promise.all([
  write("body", layers.body), write("robe", layers.robe), write("ear-left", layers.earLeft), write("ear-right", layers.earRight),
]);

const pct = (value, total) => Number((value / total * 100).toFixed(4));
const left = IDLE_FEET.x - SPRITE_FEET.x * SCALE; const top = IDLE_FEET.y - SPRITE_FEET.y * SCALE;
const toScene = ([x, y]) => ({ x: pct(left + x * SCALE, SCENE.w), y: pct(top + y * SCALE, SCENE.h) });
const origin = ([x, y]) => `${pct(x, sprite.w)}% ${pct(y, sprite.h)}%`;
const layout = {
  sprite: { w: sprite.w, h: sprite.h, scale: SCALE },
  box: { left: pct(left, SCENE.w), top: pct(top, SCENE.h), width: pct(sprite.w * SCALE, SCENE.w), height: pct(sprite.h * SCALE, SCENE.h) },
  palms: [toScene([40, 45]), toScene([125, 75])],
  origins: {
    earRight: origin([found.earRight.x + 6, found.earRight.y + found.earRight.h * .55]),
    earLeft: origin([found.earLeft.x + found.earLeft.w - 4, found.earLeft.y + found.earLeft.h - 6]),
    robe: origin([found.robe.x + found.robe.w * .55, found.robe.y + 20]),
  },
  segments: Object.fromEntries(Object.entries(found).map(([name, { x, y, w, h, score }]) => [name, { x, y, w, h, score: Number(score.toFixed(2)) }])),
};
fs.writeFileSync("src/components/home/yoda-force.json", JSON.stringify(layout, null, 2) + "\n");
console.log(JSON.stringify(layout, null, 2));
