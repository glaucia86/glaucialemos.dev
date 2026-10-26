// Art-only proof, not a browser screenshot. Uses the same generated assets and
// layout as the page; leaves approved sources untouched.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const scene = JSON.parse(fs.readFileSync("src/data/galaxia/beyond-orbit.json", "utf8"));
const layout = JSON.parse(fs.readFileSync("src/data/galaxia/layout.json", "utf8"))["beyond-orbit"];
const out = path.join(os.tmpdir(), "beyond-orbit-preview");
fs.mkdirSync(out, { recursive: true });
const layers = [];
const paths = Object.entries(layout.stages).map(([actor, stage]) => {
  const x = stage.x * 16; const y = stage.y * 9;
  const sag = actor === "glaucia" ? 170 : 135; const exit = actor === "glaucia" ? 1500 : 1570;
  return `<path d="M ${x} ${y} C ${x + 45} ${y + sag}, ${exit - 150} 840, ${exit} 940"/>`;
}).join("");
layers.push({ input: await sharp(Buffer.from(`<svg width="${scene.background.w}" height="${scene.background.h}" viewBox="0 0 1600 900"><g fill="none" stroke-linecap="round"><g stroke="#101526" stroke-width="6">${paths}</g><g stroke="#b7b3c5" stroke-width="3">${paths}</g></g></svg>`)).png().toBuffer(), top: 0, left: 0 });
for (const [actor, stage] of Object.entries(layout.stages)) {
  const sprite = scene.actors[actor][stage.reference];
  const scale = stage.height / 100 * scene.background.h / sprite.h;
  const left = Math.round(stage.x / 100 * scene.background.w - (stage.flip ? sprite.w - sprite.feetX : sprite.feetX) * scale);
  const top = Math.round(stage.y / 100 * scene.background.h - sprite.anchorY * scale);
  let image = sharp(`public${sprite.src}`).resize(Math.round(sprite.w * scale), Math.round(sprite.h * scale), { kernel: "nearest" });
  if (stage.flip) image = image.flop();
  layers.push({ input: await image.png().toBuffer(), left, top });
}
const composed = await sharp(`public${scene.background.src}`).composite(layers).png().toBuffer();
for (const width of [1792, 1440, 390]) {
  const file = path.join(out, `composition-${width}.png`);
  await sharp(composed).resize(width).png().toFile(file);
  console.log(file);
}
