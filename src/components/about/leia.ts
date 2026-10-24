import layout from "./leia.json";

// Leia's AI-generated layers, built by scripts/build-leia-layers.mjs. Boxes are % of the 1280 × 720 artwork.
export type LeiaPose = "idle" | "blaster" | "shiver";
export const leia = layout;
export const leiaArt = (name: string) => `/pixel/leia/${name}.webp`;
export const LEIA_LAYERS = [...layout.poses, ...(layout.patch ? ["plate"] : [])];
export const box = ({ left, top, width, height }: { left: number; top: number; width: number; height: number }) =>
  ({ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` });

// She hugs her coat while the blizzard rages, when that pose exists.
export const restPose = (blizzard: boolean): LeiaPose => blizzard && layout.poses.includes("shiver") ? "shiver" : "idle";
