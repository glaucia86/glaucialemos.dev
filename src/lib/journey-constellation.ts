import { EGGS, type EggId, type EggPage } from "./egg-catalog";

// The visitor's journey drawn in the dark sky on the left of the epilogue plate. Every secret in the catalogue gets a
// star, grouped by world; nothing here is a fixed count, so worlds migrated later light up on their own.
export type Star = { id: EggId; world: EggPage; x: number; y: number };
// Plate coordinates in the 1600×900 viewBox shared with the cables. Kept inside the calm left 40% of the art.
export type Region = { x: number; y: number; w: number; h: number };

// Destinations of the Galáxia Encantada, in the order of the voyage, plus the two places between them.
export const DESTINATIONS = ["home", "about", "projects", "content", "events", "services", "notfound"] as const satisfies readonly EggPage[];
export const REGIONS: Record<EggPage, Region> = {
  home: { x: 70, y: 120, w: 150, h: 150 },
  about: { x: 250, y: 90, w: 150, h: 150 },
  projects: { x: 430, y: 130, w: 150, h: 150 },
  content: { x: 70, y: 360, w: 150, h: 150 },
  events: { x: 250, y: 330, w: 150, h: 150 },
  services: { x: 430, y: 370, w: 150, h: 150 },
  notfound: { x: 70, y: 600, w: 150, h: 150 },
  global: { x: 250, y: 580, w: 150, h: 150 },
  epilogue: { x: 430, y: 620, w: 150, h: 150 },
};
export const MIN_GAP = 26;

// Secrets that belong to the epilogue's own story even though they live on another page: the signal alone does not
// chart Aurélia. Its six garden secrets supply the atlas moons; the bridge still has its own constellation star.
export const BRIDGES: ReadonlySet<EggId> = new Set<EggId>(["epilogue-signal"]);

function hash(text: string) {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}
function random(seed: number) { let state = seed % 2147483646 + 1; return () => (state = (state * 16807) % 2147483647) / 2147483647; }

// Deterministic positions: each id seeds its own search, so adding a secret never moves the others of other worlds.
export function constellation(catalogue: readonly { id: EggId; page: EggPage }[] = EGGS): Star[] {
  const stars: Star[] = [];
  for (const egg of catalogue) {
    const region = REGIONS[egg.page];
    const next = random(hash(egg.id));
    let best = { x: region.x + region.w / 2, y: region.y + region.h / 2, gap: -1 };
    for (let attempt = 0; attempt < 240; attempt++) {
      const x = region.x + next() * region.w; const y = region.y + next() * region.h;
      const gap = Math.min(Infinity, ...stars.map((star) => Math.hypot(star.x - x, star.y - y)));
      if (gap > best.gap) best = { x, y, gap };
      if (gap >= MIN_GAP) break;
    }
    stars.push({ id: egg.id, world: egg.page, x: Math.round(best.x), y: Math.round(best.y) });
  }
  return stars;
}

// Destinations without any secret of their own yet: the next coordinates of the post-credits scene.
export function unchartedWorlds(catalogue: readonly { id: EggId; page: EggPage }[] = EGGS) {
  const charted = new Set(catalogue.filter((egg) => !BRIDGES.has(egg.id)).map((egg) => egg.page));
  return DESTINATIONS.filter((world) => !charted.has(world));
}

// The visitor's path: valid, unique discoveries in the order they were made.
export function journey(found: readonly string[], stars: readonly Star[] = constellation()) {
  const byId = new Map(stars.map((star) => [star.id as string, star]));
  const path = [...new Set(found)].map((id) => byId.get(id)).filter((star): star is Star => Boolean(star));
  const worlds = DESTINATIONS.filter((world) => path.some((star) => star.world === world));
  return { path, worlds, found: path.length, total: stars.length };
}

export function pathData(path: readonly Pick<Star, "x" | "y">[]) {
  return path.map((star, index) => `${index ? "L" : "M"} ${star.x} ${star.y}`).join(" ");
}

export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
