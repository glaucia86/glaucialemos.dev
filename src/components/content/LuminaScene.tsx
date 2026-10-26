import type { CSSProperties } from "react";
import { SCENES, boxStyle, poseBox, propBox, type Box } from "@/lib/scenes";

// Lúmina: every layer sits on the 16:9 plate (percent), like Nivéora and Marte. The plate is always shown whole.
export const luminaScene = SCENES.lumina;
const { props, actors } = luminaScene.assets;

export const GLAUCIA_POSES = ["idle", "touch", "listen", "cheer"] as const;
export const PRINCE_POSES = ["stand", "sniff-a", "sniff-b", "scan", "wag-b", "sit-up"] as const;
export type GlauciaPose = (typeof GLAUCIA_POSES)[number];
export type PrincePose = (typeof PRINCE_POSES)[number];

const glaucia = Object.fromEntries([...GLAUCIA_POSES, "blink"].map((pose) => [pose, poseBox(luminaScene, "glaucia", pose)])) as Record<GlauciaPose | "blink", Box>;
const prince = Object.fromEntries(PRINCE_POSES.map((pose) => [pose, poseBox(luminaScene, "prince", pose)])) as Record<PrincePose, Box>;

// Approved composition A: the crystal monolith between them, the stack of books by the big crystal.
export const MONOLITH_AT = { x: 82.5, bottom: 82.5 };
const BOOKS_AT = { x: 73.5, bottom: 84.5 };
const monolith = propBox(luminaScene, "crystal-monolith", MONOLITH_AT.x, MONOLITH_AT.bottom);
const books = propBox(luminaScene, "archive-books-closed", BOOKS_AT.x, BOOKS_AT.bottom);
const book = propBox(luminaScene, "archive-book-open", BOOKS_AT.x, BOOKS_AT.bottom);

// Glaucia's fingertip in the touch pose (left edge of the sprite, at 49 % of its height).
const finger = { u: glaucia.touch.left + glaucia.touch.width * .02, v: glaucia.touch.top + glaucia.touch.height * .49 };
// The awakened crystal rises until its tip meets the finger: the lift, in percent of the monolith's own box.
export const CRYSTAL_LIFT = {
  x: Math.round((finger.u - (monolith.left + monolith.width / 2)) / monolith.width * 1000) / 10,
  y: Math.round((finger.v + monolith.height * .02 - monolith.top) / monolith.height * 1000) / 10,
};

const union = (boxes: Box[]): Box => {
  const left = Math.min(...boxes.map((box) => box.left)); const top = Math.min(...boxes.map((box) => box.top));
  return { left, top, width: Math.max(...boxes.map((box) => box.left + box.width)) - left, height: Math.max(...boxes.map((box) => box.top + box.height)) - top };
};
const idle = glaucia.idle;

export const HOTSPOTS = {
  glaucia: { left: idle.left + idle.width * .2, top: idle.top, width: idle.width * .62, height: idle.height * .72 },
  crystal: monolith,
  prince: union([prince.stand, prince["wag-b"]]),
  books: union([books, book]),
} as Record<"glaucia" | "crystal" | "prince" | "books", Box>;

// Anchors (plate percent) shared with the motion island.
export const SPOTS = {
  finger,
  crystal: { u: monolith.left + monolith.width / 2, v: monolith.top + monolith.height * .3 },
  crystalBase: { u: monolith.left + monolith.width / 2, v: MONOLITH_AT.bottom - 1 },
  backpack: { u: prince.scan.left + prince.scan.width * .56, v: prince.scan.top + prince.scan.height * .08 },
  nose: { u: prince["sniff-b"].left + prince["sniff-b"].width * .03, v: prince["sniff-b"].top + prince["sniff-b"].height * .36 },
  books: { u: BOOKS_AT.x, v: books.top + books.height * .3 },
  page: { u: BOOKS_AT.x, v: book.top + book.height * .25 },
};

const art = (src: string): CSSProperties => ({ backgroundImage: `url(${src})` });
const pose = (actor: "glaucia" | "prince", name: string, box: Box): CSSProperties => {
  const sprite = (actors[actor] as Record<string, { src: string; w: number; feetX: number }>)[name];
  return { ...boxStyle(box), ...art(sprite.src), transformOrigin: `${sprite.feetX / sprite.w * 100}% 100%` };
};

export function LuminaScene() {
  return <div className="hero-scene-layer hero-scene-layer--lumina" data-paused="true" aria-hidden="true">
    <div className="lumina-plane">
      <canvas className="lumina-sky lumina-sky--back" />
      <span className="lumina-books" data-books="closed">
        <i className="lumina-books__glow" style={boxStyle(book)} />
        <i className="lumina-books__closed" style={{ ...boxStyle(books), ...art(props["archive-books-closed"].src) }} />
        <i className="lumina-books__open" style={{ ...boxStyle(book), ...art(props["archive-book-open"].src) }} />
      </span>
      {/* Prince and Glaucia: one sprite per pose, anchored on the same feet; blink is an overlay on idle. */}
      <span className="lumina-prince">
        {PRINCE_POSES.map((name) => <i key={name} data-actor-pose={name} className={`lumina-prince__pose lumina-prince__pose--${name}`} style={pose("prince", name, prince[name])} />)}
      </span>
      <span className="lumina-crystal" data-crystal="rest" style={{ ...boxStyle(monolith), "--lift-x": `${CRYSTAL_LIFT.x}%`, "--lift-y": `${CRYSTAL_LIFT.y}%` } as CSSProperties}>
        <i className="lumina-crystal__glow" />
        <i className="lumina-crystal__art" style={art(props["crystal-monolith"].src)} />
      </span>
      <span className="lumina-crew">
        {GLAUCIA_POSES.map((name) => <i key={name} data-actor-pose={name} className={`lumina-crew__pose lumina-crew__pose--${name}`} style={pose("glaucia", name, glaucia[name])} />)}
        <i className="lumina-crew__blink" style={{ ...boxStyle(glaucia.blink), ...art(actors.glaucia.blink.src) }} />
      </span>
      <canvas className="lumina-sky lumina-sky--front" />
    </div>
  </div>;
}

type HotLabels = Record<keyof typeof HOTSPOTS, string>;
// Accessible hotspots, above the copy layer; hidden until the motion island wires them up.
export function LuminaHotspots({ labels }: { labels: HotLabels }) {
  return <div className="lumina-layer">
    <div className="lumina-plane lumina-plane--hot">
      {(Object.entries(HOTSPOTS) as [keyof HotLabels, Box][]).map(([key, box]) => <button key={key} type="button" className={`lumina-hot lumina-hot--${key}`} data-hot={key} aria-label={labels[key]} title={labels[key]} style={boxStyle(box)} hidden />)}
    </div>
  </div>;
}
