import { EGGS, type EggId, type EggPage } from "./egg-catalog";
import { BRIDGES, DESTINATIONS } from "./journey-constellation";
import { SCENES } from "./scenes";

// "A Viagem": the scroll below the epilogue, revealed after the last light. Each destination of the galaxy becomes a
// planet whose surface is the approved plate of its page and whose moons are the secrets found there. Everything is
// derived from the egg catalogue, so worlds migrated later join the voyage on their own.
export type Palette = { base: string; accent: string; glow: string };
export type VoyageWorld = { page: (typeof DESTINATIONS)[number]; path: string | null; plate: string | null; palette: Palette };

const FAINT: Palette = { base: "#120d1c", accent: "#5b4a6e", glow: "#c75b76" };
const PLATES: Partial<Record<EggPage, keyof typeof SCENES>> = { home: "earth-observatory", about: "niveora", projects: "mars-lab", content: "lumina", events: "earth-orbit", services: "aurelia" };
const PATHS: Record<(typeof DESTINATIONS)[number], string | null> = { home: "", about: "/sobre", projects: "/projetos", content: "/conteudo", events: "/eventos", services: "/servicos", notfound: null };

export const VOYAGE_WORLDS: VoyageWorld[] = DESTINATIONS.map((page) => {
  // The 404's video poster already includes Glaucia and Prince.
  if (page === "notfound") return {
    page, path: PATHS[page], plate: "/galaxia/scenes/red-tide/poster.webp",
    palette: { base: "#0d0612", accent: "#f07072", glow: "#ffbc78" },
  };
  const scene = PLATES[page] ? SCENES[PLATES[page]!] : null;
  return { page, path: PATHS[page], plate: scene?.assets.background.src ?? null, palette: scene?.palette ?? FAINT };
});

export function worldReport(page: EggPage, found: readonly string[], catalogue: readonly { id: EggId; page: EggPage }[] = EGGS) {
  const own = catalogue.filter((egg) => egg.page === page && !BRIDGES.has(egg.id)).map((egg) => egg.id);
  const seen = new Set(found);
  return { found: own.filter((id) => seen.has(id)), missing: own.filter((id) => !seen.has(id)), total: own.length, charted: own.length > 0 };
}

const channel = (hex: string, index: number) => parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
export function mix(a: string, b: string, t: number) {
  const value = (index: number) => Math.round(channel(a, index) + (channel(b, index) - channel(a, index)) * t).toString(16).padStart(2, "0");
  return `#${value(0)}${value(1)}${value(2)}`;
}

// The voyage's colour at `progress` (0..1): a smooth blend between the palettes of consecutive worlds.
export function paletteAt(progress: number, worlds: readonly { palette: Palette }[] = VOYAGE_WORLDS): Palette {
  const position = Math.min(1, Math.max(0, progress)) * (worlds.length - 1);
  const index = Math.min(worlds.length - 2, Math.floor(position));
  const t = position - index;
  const [from, to] = [worlds[index].palette, worlds[index + 1].palette];
  return { base: mix(from.base, to.base, t), accent: mix(from.accent, to.accent, t), glow: mix(from.glow, to.glow, t) };
}
