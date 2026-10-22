import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { shouldReduceMotion, timelineProgress } from "@/lib/motion";

describe("timeline ignition", () => {
  it.each([
    [900, 1200, 800, 0],
    [800, 1200, 800, 0],
    [200, 1200, 800, 0.5],
    [-400, 1200, 800, 1],
    [-600, 1200, 800, 1],
    [600, 400, 800, 0.5],
    [400, 400, 800, 1],
  ])("maps section top %s, height %s and viewport %s to %s", (top, height, viewport, expected) => {
    expect(timelineProgress(top, height, viewport)).toBe(expected);
  });
});

describe("redução de movimento", () => {
  it.each([
    [true, false, true],
    [false, true, true],
    [false, false, false],
  ])("combina preferência do sistema (%s) e escolha manual (%s)", (system, manual, expected) => {
    expect(shouldReduceMotion(system, manual)).toBe(expected);
  });

  it("a regra CSS central desliga animações e oculta as camadas das cenas", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

    expect(css).toMatch(/html\.reduce-motion[^{}]*\.hero-scene-layer[^{}]*\{[^}]*animation\s*:\s*none\s*!important[^}]*\}/);
    expect(css).toMatch(/prefers-reduced-motion\s*:\s*reduce[\s\S]*\.hero-scene-layer[^{}]*\{[^}]*animation\s*:\s*none\s*!important[^}]*\}/);
  });
});
