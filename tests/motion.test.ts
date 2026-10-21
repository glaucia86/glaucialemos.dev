import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { shouldReduceMotion } from "@/lib/motion";

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

  it("a regra central para o crawl e mantém o texto visível nas duas preferências", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
    const manual = css.match(/html\.reduce-motion\s+\.crawl\s*>\s*div\s*\{([^}]*)\}/)?.[1];
    const system = css.match(/@media\s*\(prefers-reduced-motion\s*:\s*reduce\)[\s\S]*?\.crawl\s*>\s*div\s*\{([^}]*)\}/)?.[1];

    for (const rule of [manual, system]) {
      expect(rule).toMatch(/animation\s*:\s*none\s*!important/);
      expect(rule).toMatch(/transform\s*:\s*none\s*!important/);
      expect(rule).not.toMatch(/opacity\s*:\s*0|display\s*:\s*none/);
    }
  });
});
