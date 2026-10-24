import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { leia, LEIA_LAYERS, restPose } from "@/components/about/leia";

const inside = ({ left, top, width, height }: { left: number; top: number; width: number; height: number }) => {
  expect(left).toBeGreaterThan(50);
  expect(left + width).toBeLessThan(100);
  expect(top).toBeGreaterThan(20);
  expect(top + height).toBeLessThan(100);
};

describe("Leia viva na Base Eco", () => {
  it("fica no lugar da Leia pintada (915–1065 × 290–545 na arte 1280 × 720)", () => {
    inside(leia.frame);
    const feet = { x: leia.frame.left + leia.frame.width * leia.feet.x / 100, y: leia.frame.top + leia.frame.height * leia.feet.y / 100 };
    expect(feet.x * 12.8).toBeGreaterThan(950);
    expect(feet.x * 12.8).toBeLessThan(1030);
    expect(feet.y * 7.2).toBeCloseTo(540, -1);
  });

  it("o patch da placa cobre a Leia pintada inteira", () => {
    expect(leia.patch).not.toBeNull();
    const patch = leia.patch!;
    inside(patch);
    expect(patch.left * 12.8).toBeLessThan(915);
    expect((patch.left + patch.width) * 12.8).toBeGreaterThan(1065);
    expect(patch.top * 7.2).toBeLessThan(290);
    expect((patch.top + patch.height) * 7.2).toBeGreaterThan(540);
    expect(leia.fit.plate.score).toBeLessThan(10);
  });

  it("o cano da blaster fica à esquerda do corpo, apontando para o céu da sonda", () => {
    expect(leia.muzzle.x).toBeGreaterThan(leia.frame.left);
    expect(leia.muzzle.x).toBeLessThan(leia.frame.left + leia.frame.width * .4);
    expect(leia.muzzle.y).toBeGreaterThan(leia.frame.top);
    expect(leia.muzzle.y).toBeLessThan(leia.frame.top + leia.frame.height * .6);
  });

  it("o piscar mexe só nos olhos, na metade de cima do rosto", () => {
    expect(leia.eyes.top).toBeGreaterThan(10);
    expect(leia.eyes.top + leia.eyes.height).toBeLessThan(50);
    expect(leia.eyes.width).toBeLessThan(60);
  });

  it("publica camadas leves e treme de frio na nevasca", () => {
    expect(LEIA_LAYERS).toEqual(expect.arrayContaining(["idle", "blink", "blaster", "plate"]));
    for (const name of LEIA_LAYERS) expect(fs.statSync(`public/pixel/leia/${name}.webp`).size).toBeLessThan(40_000);
    expect(restPose(false)).toBe("idle");
    expect(restPose(true)).toBe(leia.poses.includes("shiver") ? "shiver" : "idle");
  });
});
