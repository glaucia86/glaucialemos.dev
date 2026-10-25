import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { SCENES, poseBox } from "@/lib/scenes";
import { HOTSPOTS, LANTERNS } from "@/components/home/ObservatoryScene";

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
