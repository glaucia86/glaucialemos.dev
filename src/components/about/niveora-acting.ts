import layout from "@/data/galaxia/layout.json";

export const GLAUCIA_POSES = ["idle", "capsule", "cheer", "cold-a", "cold-b", "brace"] as const;
export const PRINCE_POSES = ["stand", "sniff", "cold", "wind", "shake-a", "shake-b", "wag-a", "wag-b", "walk-1", "walk-2", "walk-3", "walk-4", "sniff-down-a", "sniff-down-b", "dig-a", "dig-b"] as const;
export type GlauciaPose = typeof GLAUCIA_POSES[number];
export type PrincePose = typeof PRINCE_POSES[number];
export const TRAIL_DURATION = 8760;
export const WALK_START = 840;
export const STEP_MS = 480;
const home = layout.niveora.stages.prince;
const destination = 68;
const walk = (time: number): PrincePose => `walk-${Math.floor(time / 120) % 4 + 1}` as PrincePose;
export type TrailFrame = { phase: "sniff" | "walk" | "dig" | "wag" | "return" | "done"; x: number; y: number; facing: "left" | "right"; pose: PrincePose; tracks: number; revealed: boolean };

// Sample only active elapsed time: the caller freezes this clock outside the viewport / hidden tab.
export function trailSample(elapsed: number): TrailFrame {
  const t = Math.max(0, elapsed);
  const common = { y: home.y, facing: "left" as const, tracks: Math.min(6, Math.max(0, Math.floor((t - WALK_START) / STEP_MS))), revealed: t >= 4920 };
  if (t < WALK_START) return { ...common, phase: "sniff", x: home.x, pose: Math.floor(t / 210) % 2 ? "sniff-down-b" : "sniff-down-a" };
  if (t < 3720) return { ...common, phase: "walk", x: home.x + (destination - home.x) * (t - WALK_START) / 2880, pose: walk(t - WALK_START) };
  if (t < 4920) return { ...common, phase: "dig", x: destination, pose: Math.floor((t - 3720) / 160) % 2 ? "dig-b" : "dig-a" };
  if (t < 5880) return { ...common, phase: "wag", x: destination, pose: Math.floor((t - 4920) / 160) % 2 ? "wag-b" : "wag-a" };
  if (t < TRAIL_DURATION) return { ...common, phase: "return", x: destination + (home.x - destination) * (t - 5880) / 2880, facing: "right", pose: walk(t - 5880) };
  return { ...common, phase: "done", x: home.x, pose: "stand" };
}

export function ambientPoses(time: number, state: { storm?: boolean; gust?: boolean; wag?: boolean }): { glaucia: GlauciaPose; prince: PrincePose } {
  if (state.storm) return { glaucia: Math.floor(time / 260) % 2 ? "cold-b" : "cold-a", prince: "cold" };
  if (state.gust) return { glaucia: "brace", prince: "wind" };
  return { glaucia: "idle", prince: state.wag ? (Math.floor(time / 180) % 2 ? "wag-b" : "wag-a") : "stand" };
}
