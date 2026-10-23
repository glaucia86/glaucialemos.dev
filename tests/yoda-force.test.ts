import fs from "node:fs";
import { describe, expect, it } from "vitest";
import layout from "@/components/home/yoda-force.json";

describe("alinhamento do Yoda na pose da Força", () => {
  it("fica dentro do plano 1024 × 576 e com os pés na plataforma do Yoda original", () => {
    const { left, top, width, height } = layout.box;
    expect(left).toBeGreaterThan(40);
    expect(left + width).toBeLessThan(100);
    expect(top).toBeGreaterThan(20);
    expect((top + height * 321 / layout.sprite.h)).toBeCloseTo(498 / 720 * 100, 1);
  });

  it("posiciona as duas palmas acima e à esquerda do corpo, perto das pedras", () => {
    for (const palm of layout.palms) {
      expect(palm.x).toBeGreaterThan(layout.box.left);
      expect(palm.x).toBeLessThan(layout.box.left + layout.box.width / 2);
      expect(palm.y).toBeLessThan(layout.box.top + layout.box.height / 2);
    }
  });

  it("encontra orelhas e manto dentro do sprite e publica as camadas", () => {
    for (const { x, y, w, h } of Object.values(layout.segments)) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x + w).toBeLessThanOrEqual(layout.sprite.w);
      expect(y + h).toBeLessThanOrEqual(layout.sprite.h);
    }
    expect(layout.segments.robe.score).toBeLessThan(5);
    for (const file of ["body", "robe", "ear-left", "ear-right"]) {
      expect(fs.statSync(`public/pixel/yoda-force/${file}.webp`).size).toBeLessThan(60_000);
    }
  });
});
