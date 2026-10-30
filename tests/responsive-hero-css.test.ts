import fs from "node:fs";
import { describe, expect, it } from "vitest";

const css = fs.readFileSync("src/app/responsive.css", "utf8");
const stacked = css.split("@media (width < 1200px), (height < 680px), (hover: none), (pointer: coarse) {")[1]?.split("@media")[0];

describe("stacked hero geometry", () => {
  it("reserves the plate before the copy and anchors every layer at the top", () => {
    expect(stacked).toBeTruthy();
    expect(stacked).toMatch(/\.page-hero::before\s*\{[^}]*height:\s*var\(--scene-height\)/);
    expect(stacked).not.toMatch(/\.page-hero::after/);
    const layers = stacked.match(/\.page-hero :is\(\.page-hero__image,[^{]+\{([^}]+)\}/)?.[1];
    expect(layers).toMatch(/top:\s*0\s*!important/);
    expect(layers).toMatch(/bottom:\s*auto/);
    expect(layers).not.toMatch(/bottom:\s*0/);
    expect(stacked).toContain(".atlas-layer");
    expect(stacked).toContain(".aurelia-layer");
  });

  it("caps and centers the same 16:9 box for the image and its coordinate planes", () => {
    expect(stacked).toContain("--scene-height: min(56.25cqw, calc(100svh - var(--header-height)))");
    expect(stacked).toMatch(/width:\s*calc\(var\(--scene-height\) \* 16 \/ 9\)/);
    expect(stacked).toContain("margin-inline: auto");
    expect(stacked).not.toMatch(/bottom:\s*calc\(var\(--scene-height\)/);
  });

  it("does not retain competing bottom-anchored per-world layouts", () => {
    for (const world of ["home", "niveora", "marte", "lumina", "atlas", "aurelia"]) {
      const source = fs.readFileSync(`src/app/${world}.css`, "utf8");
      expect(source).not.toMatch(/top: auto !important; bottom: (?:0|60px)/);
      expect(source).not.toContain("bottom: 60px !important");
      expect(source).not.toMatch(/bottom: calc\((?:var\(--scene-height\)|56\.25vw)/);
    }
  });
});
