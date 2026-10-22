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

  it("oculta a intro e desliga suas animações nas duas preferências", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
    const manual = css.slice(css.indexOf("html.reduce-motion .opening-crawl"));
    const system = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));

    for (const rules of [manual, system]) {
      expect(rules).toMatch(/\.opening-crawl\s*\{[^}]*display\s*:\s*none/);
      expect(rules).toMatch(/\.opening-crawl\s+\*\s*\{[^}]*animation\s*:\s*none\s*!important/);
    }
  });
});
