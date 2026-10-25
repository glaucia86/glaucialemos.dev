import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { SCENES, poseBox } from "@/lib/scenes";
import { HOTSPOTS, LANTERNS } from "@/components/home/ObservatoryScene";
import { HOTSPOTS as NIVEORA_HOTSPOTS, TRACKS } from "@/components/about/NiveoraScene";
import layout from "@/data/galaxia/layout.json";

const observatory = SCENES["earth-observatory"];
type Box = { left: number; top: number; width: number; height: number };
const overlap = (a: Box, b: Box) => a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height;

describe("cena do Observatório das Primeiras Luzes", () => {
  it("mantém Glaucia e Prince à direita, fora da zona de texto, em todas as poses", () => {
    for (const pose of ["idle", "blink", "telescope", "point"]) {
      const box = poseBox(observatory, "glaucia", pose);
      expect(box.left, pose).toBeGreaterThan(60);
      expect(box.left + box.width, pose).toBeLessThanOrEqual(100);
      expect(box.top + box.height, pose).toBeCloseTo(observatory.stages.glaucia.y, 3);
      expect(box.top + box.height, pose).toBeLessThan(96);
    }
  });

  it("piscar é uma camada sobre a pose parada, com o mesmo enquadramento", () => {
    expect(poseBox(observatory, "glaucia", "blink")).toEqual(poseBox(observatory, "glaucia", "idle"));
  });

  it("os pontos interativos ficam à direita do texto, dentro da arte e sem se sobrepor", () => {
    const entries = Object.entries(HOTSPOTS);
    expect(entries.map(([key]) => key)).toEqual(expect.arrayContaining(["glaucia", "prince", "hangar", "console", ...LANTERNS.map((_, index) => `lantern-${index}`)]));
    for (const [key, box] of entries) {
      expect(box.left, key).toBeGreaterThan(55);
      expect(box.left + box.width, key).toBeLessThanOrEqual(100);
      expect(box.top + box.height, key).toBeLessThanOrEqual(100);
    }
    for (const [a, first] of entries) for (const [b, second] of entries) if (a < b) expect(overlap(first, second), `${a} × ${b}`).toBe(false);
  });

  it("publica placa, poses, rostos do Prince e props gerados pelo script", () => {
    const { background, actors, props } = observatory.assets;
    const faces = (["face-idle", "face-happy", "face-joy", "face-curious", "face-wink"] as const).map((face) => actors.prince[face]);
    for (const sprite of [background, ...Object.values(actors.glaucia), ...faces, ...Object.values(props)]) expect(fs.existsSync(`public${sprite.src}`), sprite.src).toBe(true);
    expect(fs.statSync(`public${background.src}`).size).toBeLessThan(600_000);
  });
});

describe("pixel art de verdade", () => {
  for (const id of ["earth-observatory", "niveora", "mars-lab"] as const) it(`${id}: placa original, atores e props na grade da cena`, () => {
    const scene = SCENES[id];
    const { grid, plateGrid } = layout[id];
    const { background, actors, props } = scene.assets as typeof scene.assets & { background: { px?: number[] } };
    if (plateGrid) expect(background.px).toEqual([Math.round(background.w / plateGrid), Math.round(background.h / plateGrid)]);
    else expect(background.px).toBeUndefined();
    for (const [name, stage] of Object.entries(scene.stages)) {
      const reference = actors[name as keyof typeof actors][stage.reference as never] as { h: number; px?: number[] };
      const shown = stage.height / 100 * background.h;
      expect(Math.abs(reference.px![1] - shown / grid), name).toBeLessThanOrEqual(1);
    }
    for (const [name, sprite] of Object.entries(props) as [string, { w: number; px?: number[] }][]) {
      expect(Math.abs(sprite.px![0] - sprite.w * (scene.propScale[name as keyof typeof scene.propScale] ?? 1) / grid), name).toBeLessThanOrEqual(1);
    }
  });
});

describe("cena de Nivéora", () => {
  const niveora = SCENES.niveora;

  it("mantém o hotspot parado cobrindo os dois quadros de abanar, sem oscilação de hover", () => {
    const hit = NIVEORA_HOTSPOTS.prince;
    for (const pose of ["stand", "wag-a", "wag-b"]) {
      const box = poseBox(niveora, "prince", pose);
      expect(hit.left).toBeLessThanOrEqual(box.left);
      expect(hit.top).toBeLessThanOrEqual(box.top);
      expect(hit.left + hit.width + .001).toBeGreaterThanOrEqual(box.left + box.width);
      expect(hit.top + hit.height + .001).toBeGreaterThanOrEqual(box.top + box.height);
    }
  });

  it("integra as 23 poses da Etapa B sem nomes provisórios ou quadros unidos", () => {
    const expected = {
      glaucia: ["cold-a", "cold-b", "brace", "warm-hands"],
      prince: ["walk-1", "walk-2", "walk-3", "walk-4", "sniff-down-a", "sniff-down-b", "dig-a", "dig-b", "walk-slow-1", "walk-slow-2", "walk-slow-3", "walk-slow-4", "cold", "shake-a", "shake-b", "wag-a", "wag-b", "sit-up", "wind"],
    };
    for (const [actor, names] of Object.entries(expected)) {
      const sprites = niveora.assets.actors[actor as keyof typeof niveora.assets.actors] as Record<string, { src: string; w: number; h: number; feetX: number }>;
      expect(Object.keys(sprites).filter(name => name.startsWith("pose-"))).toEqual([]);
      for (const name of names) {
        expect(sprites[name], `${actor}/${name}`).toBeDefined();
        const sprite = sprites[name];
        expect(fs.existsSync(`public${sprite.src}`)).toBe(true);
        expect(sprite.w).toBeGreaterThan(0);
        expect(sprite.feetX).toBeGreaterThan(0);
        expect(sprite.feetX).toBeLessThan(sprite.w);
        const box = poseBox(niveora, actor, name);
        expect(box.left).toBeGreaterThan(55);
        expect(box.left + box.width).toBeLessThanOrEqual(100);
        expect(box.top).toBeGreaterThan(0);
        expect(box.top + box.height).toBeCloseTo(niveora.stages[actor].y, 2);
      }
    }
    const dog = niveora.assets.actors.prince as Record<string, { w: number; h: number }>;
    expect(dog["wag-b"].w).toBeLessThan(dog["wag-a"].w * 1.2);
    expect(dog["sit-up"].w).toBeLessThan(dog["wag-a"].w);
  });

  it("normaliza sheets extras pela referência, preservando variações de postura", () => {
    for (const [actor, pose, reference] of [["glaucia", "cold-a", "idle"], ["prince", "walk-1", "sniff"], ["prince", "wag-a", "stand"]]) {
      const actual = poseBox(niveora, actor, pose);
      const original = poseBox(niveora, actor, reference);
      expect(Math.abs(actual.height - original.height) * niveora.assets.background.h / 100).toBeLessThanOrEqual(2);
    }
    expect(poseBox(niveora, "prince", "cold").height).toBeLessThan(poseBox(niveora, "prince", "wag-a").height);
  });

  it("mantém Glaucia e Prince à direita, fora da zona de texto, com os pés na neve", () => {
    for (const pose of ["idle", "blink", "capsule", "cheer"]) {
      const box = poseBox(niveora, "glaucia", pose);
      expect(box.left, pose).toBeGreaterThan(60);
      expect(box.left + box.width, pose).toBeLessThanOrEqual(100);
      expect(box.top + box.height, pose).toBeCloseTo(niveora.stages.glaucia.y, 3);
    }
    for (const pose of ["stand", "sniff"]) {
      const box = poseBox(niveora, "prince", pose);
      expect(box.left, pose).toBeGreaterThan(60);
      expect(box.top + box.height, pose).toBeCloseTo(niveora.stages.prince.y, 3);
      expect(box.height, pose).toBeLessThan(poseBox(niveora, "glaucia", "idle").height / 2);
    }
    expect(poseBox(niveora, "glaucia", "blink")).toEqual(poseBox(niveora, "glaucia", "idle"));
  });

  it("os pontos interativos e as pegadas ficam à direita do texto e sem se sobrepor", () => {
    const entries = Object.entries(NIVEORA_HOTSPOTS);
    expect(entries.map(([key]) => key)).toEqual(["glaucia", "prince", "crystal", "station", "capsule"]);
    for (const [key, box] of entries) {
      expect(box.left, key).toBeGreaterThan(55);
      expect(box.left + box.width, key).toBeLessThanOrEqual(100);
      expect(box.top + box.height, key).toBeLessThanOrEqual(100);
    }
    for (const [a, first] of entries) for (const [b, second] of entries) if (a < b) expect(overlap(first, second), `${a} × ${b}`).toBe(false);
    for (const [u, v] of TRACKS) { expect(u).toBeGreaterThan(55); expect(v).toBeLessThan(100); }
  });

  it("publica placa, poses e props gerados pelo script", () => {
    const { background, actors, props } = niveora.assets;
    for (const sprite of [background, ...Object.values(actors.glaucia), ...Object.values(actors.prince), ...Object.values(props)]) expect(fs.existsSync(`public${sprite.src}`), sprite.src).toBe(true);
    expect(fs.statSync(`public${background.src}`).size).toBeLessThan(600_000);
  });
});
