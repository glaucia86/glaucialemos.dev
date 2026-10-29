import layout from "@/data/galaxia/layout.json";
import { SCENES, poseBox } from "./scenes";
import type { SoundKind } from "./sfx";

// Percent coordinates on the uncut 16:9 plate. These are backpack pivots.
export const ACTORS = layout["beyond-orbit"].stages;
export type OrbitActor = keyof typeof ACTORS;
export type OrbitPose = "float-idle" | "float-b" | "float-c" | "float-d";

// The brightest knot of the Veil and the last star at its heart (plate fractions).
export const CORE = { u: .72, v: .43 };
export const STAR = { u: .72, v: .41 };

// Parallax depth of each layer for the pointer camera (plate is the reference). Larger moves more.
export const DEPTH = { ambient: .15, plate: .45, back: .7, crew: 1.15, front: 1.9 } as const;
export type DepthLayer = keyof typeof DEPTH;

// Sprite box of a pose relative to the actor's span, which is sized to the float-idle box.
export function poseStyle(actor: OrbitActor, pose: OrbitPose) {
  const scene = SCENES["beyond-orbit"];
  const stage = ACTORS[actor];
  const idle = poseBox(scene, actor, "float-idle");
  const box = poseBox(scene, actor, pose);
  const round = (value: number) => Math.round(value * 1000) / 1000;
  return {
    src: scene.assets.actors[actor][pose].src,
    left: round((box.left - stage.x) / idle.width * 100), top: round((box.top - stage.y) / idle.height * 100),
    width: round(box.width / idle.width * 100), height: round(box.height / idle.height * 100),
  };
}

// "A Última Luz": the beats of the finale in seconds. Sounds are short (≤ 0.6 s each) and never louder than the bank
// (gain ≤ 1); the weight comes from the sequence, the doubled sub-bass hits and the silence before the nova.
export const BEATS = {
  implode: 0, hush: 1.2, nova: 1.6, bloom: 2.2, react: 2.4, constellation: 3.5,
  title: 6.4, slam: 7.6, postscript: 9.6, credits: 11.2, post: 13.4, end: 19.4,
} as const;
export type Beat = keyof typeof BEATS;
export const CUES: { at: number; sound: SoundKind; gain?: number; detune?: number }[] = [
  { at: BEATS.implode, sound: "implode" },
  { at: BEATS.implode + .55, sound: "implode", detune: 700, gain: .8 },
  { at: BEATS.nova, sound: "nova" },
  { at: BEATS.nova + .3, sound: "nova", detune: -1200, gain: .7 },
  { at: BEATS.nova + .35, sound: "shimmer" },
  { at: BEATS.bloom, sound: "bloom" },
  { at: BEATS.title, sound: "dive", gain: .7 },
  { at: BEATS.slam + .75, sound: "slam" },
  { at: BEATS.slam + 1.05, sound: "shimmer", detune: -500, gain: .8 },
  { at: BEATS.postscript, sound: "credits-chord" },
  { at: BEATS.credits, sound: "credits-chord", detune: -500 },
  { at: BEATS.post, sound: "transmission" },
  { at: BEATS.post + 1.1, sound: "transmission", detune: 300, gain: .7 },
];
// Arpeggio for the constellation: one pentatonic step per lit star, climbing two octaves and wrapping.
const PENTATONIC = [0, 200, 400, 700, 900];
export function starNote(index: number) { return PENTATONIC[index % 5] + 1200 * (Math.floor(index / 5) % 3); }
// Stars light at an even pace that shrinks with the journey's length, so even a long one fits before the title.
export function starDelays(count: number, window = BEATS.title - BEATS.constellation - .4) {
  const step = count > 1 ? Math.min(.18, window / count) : 0;
  return Array.from({ length: count }, (_, index) => Math.round(index * step * 1000) / 1000);
}

export type Drift = { x: number; y: number; angle: number };
export const STATIC_FRAME: Record<OrbitActor, Drift> = {
  glaucia: { x: 0, y: 0, angle: 0 },
  prince: { x: 0, y: 0, angle: 0 },
};

// Both periods divide the 120s timeline, so restarting it has no discontinuity.
// Small independent offsets convey weightlessness without changing the artwork.
export function floatingFrame(seconds: number): Record<OrbitActor, Drift> {
  const g = seconds * Math.PI * 2 / 15;
  const p = seconds * Math.PI * 2 / 12;
  return {
    glaucia: { x: Math.sin(g) * .45, y: Math.sin(g / 2) * .75, angle: Math.sin(g) * 1.1 },
    prince: { x: Math.sin(p) * .6, y: Math.sin(p / 2) * .85, angle: Math.sin(p) * 1.3 },
  };
}

// SVG uses a 1600×900 viewBox. Rotation is around the connection itself, so
// no DOM measurement is needed to keep the hose attached during a resize.
export function cablePath(actor: OrbitActor, drift: Drift): string {
  const x = (ACTORS[actor].x + drift.x) * 16;
  const y = (ACTORS[actor].y + drift.y) * 9;
  const sag = actor === "glaucia" ? 170 : 135;
  const exit = actor === "glaucia" ? 1500 : 1570;
  return `M ${x.toFixed(3)} ${y.toFixed(3)} C ${(x + 45).toFixed(3)} ${(y + sag).toFixed(3)}, ${exit - 150} 840, ${exit} 940`;
}
