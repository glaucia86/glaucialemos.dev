import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { EGGS, type EggId, type EggPage } from "@/lib/egg-catalog";
import { DESTINATIONS } from "@/lib/journey-constellation";
import { VOYAGE_WORLDS, mix, paletteAt, worldReport } from "@/lib/voyage";
import { beyondOrbit } from "@/i18n/beyond-orbit";
import { comlink } from "@/i18n/comlink";
import { SCENES } from "@/lib/scenes";

describe("a viagem", () => {
  it("visits every destination in order, with the approved plate of each migrated world", () => {
    expect(VOYAGE_WORLDS.map((world) => world.page)).toEqual([...DESTINATIONS]);
    for (const world of VOYAGE_WORLDS) {
      const report = worldReport(world.page, []);
      if (["home", "about", "projects", "content", "events"].includes(world.page)) expect(world.plate).toMatch(/^\/galaxia\/scenes\/.+\/background\.webp$/);
      if (["home", "about", "projects", "content", "services"].includes(world.page)) expect(world.plate).toMatch(/^\/galaxia\/scenes\/.+\/background\.webp$/);
      expect(report.charted).toBe(report.total > 0);
    }
  });
  it("counts moons from the catalogue and ignores the bridge to the epilogue", () => {
    const home = worldReport("home", ["focus-lens", "wish", "rover-scan", "nope"]);
    expect(home.found).toEqual(["focus-lens", "wish"]);
    expect(home.total).toBe(EGGS.filter((egg) => egg.page === "home").length);
    expect(home.found.length + home.missing.length).toBe(home.total);
    expect(worldReport("events", [])).toMatchObject({ total: 7, charted: true });
    expect(worldReport("services", ["epilogue-signal"])).toMatchObject({ total: 7, charted: true, found: [] });
    expect(worldReport("notfound", ["paw-rescue", "paw-rescue", "epilogue-signal", "unknown"])).toEqual({
      total: 2, charted: true, found: ["paw-rescue"], missing: ["signal-recovered"],
    });
    const later = [...EGGS, { id: "orbital-trail" as EggId, page: "events" as EggPage }];
    expect(worldReport("events", [], later)).toMatchObject({ total: 8, charted: true });
  });
  it("gives Aurélia its own plate, palette and six moons, with every destination charted", () => {
    const ids = ["garden-bloom", "beacon-relay", "ring-alignment", "seed-vault", "greenhouse-dusk", "pollination", "proposal-harvest"];
    const world = VOYAGE_WORLDS.find((world) => world.page === "services")!;
    expect(world).toMatchObject({ path: "/servicos", plate: SCENES.aurelia.assets.background.src, palette: SCENES.aurelia.palette });
    expect(paletteAt(VOYAGE_WORLDS.indexOf(world) / (VOYAGE_WORLDS.length - 1))).toEqual(SCENES.aurelia.palette);
    expect(worldReport("services", []).missing).toEqual(ids);
    for (const count of [0, 1, 6]) {
      const found = ids.slice(0, count);
      expect(worldReport("services", [...found, ...found, "epilogue-signal", "first-page", "unknown"])).toEqual({
        total: 7, charted: true, found, missing: ids.slice(count),
      });
    }
    expect(VOYAGE_WORLDS.filter((world) => worldReport(world.page, []).charted)).toHaveLength(7);
    expect(VOYAGE_WORLDS.filter((world) => !worldReport(world.page, []).charted).map((world) => world.page)).toEqual([]);
  });
  it("blends palettes continuously between worlds", () => {
    expect(mix("#000000", "#ffffff", .5)).toBe("#808080");
    expect(paletteAt(0)).toEqual(VOYAGE_WORLDS[0].palette);
    expect(paletteAt(1)).toEqual(VOYAGE_WORLDS.at(-1)!.palette);
    expect(paletteAt(-3)).toEqual(paletteAt(0));
    for (let step = 0; step <= 100; step++) expect(paletteAt(step / 100).accent).toMatch(/^#[0-9a-f]{6}$/);
  });
  it("ends at Red Tide with its current 404 poster and palette, without a revisit route", () => {
    const world = VOYAGE_WORLDS.find((world) => world.page === "notfound")!;
    const palette = { base: "#0d0612", accent: "#f07072", glow: "#ffbc78" };
    expect(world).toMatchObject({ path: null, plate: "/galaxia/scenes/red-tide/poster.webp", palette });
    expect(existsSync(`public${world.plate}`)).toBe(true);
    expect(paletteAt(1)).toEqual(palette);
  });
  it.each(["pt", "en", "es"] as const)("has a complete voyage in %s, with a name and hint for every secret", (lang) => {
    const copy = beyondOrbit[lang];
    expect(copy.worlds.services).toBe({ pt: "Aurélia, os Jardins Suspensos", en: "Aurélia, the Hanging Gardens", es: "Aurélia, los Jardines Colgantes" }[lang]);
    expect(copy.letter.some((line) => line.includes("Aurélia"))).toBe(true);
    expect(copy.letter.length).toBeGreaterThanOrEqual(5);
    for (const key of ["voyage", "letterTitle", "signature", "atlasTitle", "atlasIntro", "moons", "missing", "seeHint", "revisitWorld", "faint", "allFound", "nextStar", "nextBody", "replay"] as const) expect(copy[key].length, key).toBeGreaterThan(0);
    expect(copy.revisitWorld).toContain("{world}");
    expect(copy.creditsKicker.length).toBeGreaterThan(0);
    // The credits' art (portraits, secret strip, world badges) is matched by position.
    expect(copy.credits.map((credit) => credit.name.match(/\{\w+\}/g)?.join() ?? "")).toEqual(beyondOrbit.pt.credits.map((credit) => credit.name.match(/\{\w+\}/g)?.join() ?? ""));
    expect(copy.credits[0].name).toBe("Glaucia Lemos");
    expect(copy.credits[1].name).toBe("Prince");
    for (const egg of EGGS) expect(comlink[lang].eggs[egg.id].hint.length).toBeGreaterThan(0);
  });
});
