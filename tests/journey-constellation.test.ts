import { describe, expect, it } from "vitest";
import { EGGS, type EggId, type EggPage } from "@/lib/egg-catalog";
import { DESTINATIONS, MIN_GAP, REGIONS, constellation, fill, journey, pathData, unchartedWorlds } from "@/lib/journey-constellation";

describe("journey constellation", () => {
  const stars = constellation();
  it("gives every secret of the catalogue its own star inside its world's region, left of the Veil", () => {
    expect(stars).toHaveLength(EGGS.length);
    expect(new Set(stars.map((star) => star.id)).size).toBe(EGGS.length);
    for (const star of stars) {
      const region = REGIONS[star.world];
      expect(star.x).toBeGreaterThanOrEqual(region.x); expect(star.x).toBeLessThanOrEqual(region.x + region.w);
      expect(star.y).toBeGreaterThanOrEqual(region.y); expect(star.y).toBeLessThanOrEqual(region.y + region.h);
      expect(star.x).toBeLessThan(1600 * .4);
    }
  });
  it("keeps stars apart and is deterministic", () => {
    for (const [index, a] of stars.entries()) for (const b of stars.slice(index + 1)) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(MIN_GAP - 1);
    expect(constellation()).toEqual(stars);
  });
  it("grows with the catalogue: a secret added later gets a star and keeps the others in place", () => {
    const extended = [...EGGS, { id: "orbital-trail" as EggId, page: "events" as EggPage }];
    const grown = constellation(extended);
    expect(grown).toHaveLength(EGGS.length + 1);
    expect(grown.slice(0, EGGS.length)).toEqual(stars);
    expect(unchartedWorlds(extended)).not.toContain("events");
  });
  it("lists destinations without secrets of their own as the next coordinates", () => {
    const next = unchartedWorlds();
    expect(next).toEqual(DESTINATIONS.filter((world) => !EGGS.some((egg) => egg.page === world && egg.id !== "epilogue-signal")));
    expect(next).toContain("services");
    expect(next).not.toContain("home");
  });
  it("draws the visitor's path in discovery order, ignoring duplicates and unknown ids", () => {
    const trip = journey(["rover-scan", "focus-lens", "rover-scan", "nope", "paw-tracks"], stars);
    expect(trip.path.map((star) => star.id)).toEqual(["rover-scan", "focus-lens", "paw-tracks"]);
    expect(trip.found).toBe(3);
    expect(trip.total).toBe(EGGS.length);
    expect(trip.worlds).toEqual(["home", "about", "projects"]);
    expect(pathData(trip.path)).toMatch(/^M \d+ \d+ L \d+ \d+ L \d+ \d+$/);
    expect(journey([], stars)).toMatchObject({ found: 0, worlds: [] });
  });
  it("fills copy templates and leaves unknown tokens alone", () => {
    expect(fill("{found} de {total}", { found: 3, total: 31 })).toBe("3 de 31");
    expect(fill("{x}", {})).toBe("{x}");
  });
});
