import fs from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(file, "utf8");
const css = read("src/app/responsive.css");
const worlds = ["home", "niveora", "marte", "lumina", "atlas", "aurelia"];
const styles = [...worlds, "responsive", "editorial", "credibility", "hero-scenes", "beyond-orbit", "red-tide", "globals"];

describe("full-bleed hero geometry", () => {
  it.each(styles)("removes stacked/letterboxed hero markers from %s.css", (name) => {
    const source = read(`src/app/${name}.css`);
    expect(source).not.toContain("--scene-height");
    expect(source).not.toMatch(/\.page-hero::before\s*\{/);
    expect(source).not.toMatch(/top:\s*0\s*!important;\s*bottom:\s*auto\s*!important/);
    expect(source).not.toMatch(/[^{}]*\.page-hero__image[^{}]*\{[^}]*object-fit:\s*contain/);
    expect(source).not.toMatch(/min-height:\s*min\(calc\(100svh[^;]+56\.25vw/);
    expect(source).not.toMatch(/\.(?:red-tide|beyond-orbit)__frame\s*\{[^}]*aspect-ratio/);
    expect(source).not.toMatch(/width:\s*min\(100%,\s*calc\(\(100svh[^;]+16\s*\/\s*9/);
  });

  it("covers the entire hero with the image, shade and every coordinate container", () => {
    expect(css).toMatch(/html body \.page-hero\s*\{[^}]*min-height:\s*calc\(100vh - var\(--header-height\)\)[^}]*min-height:\s*calc\(100svh - var\(--header-height\)\)/);
    const layers = css.match(/\.page-hero :is\(\.page-hero__image,[^{]+\{([^}]+)\}/)?.[1];
    expect(layers).toMatch(/position:\s*absolute;\s*inset:\s*0;\s*width:\s*100%;\s*height:\s*100%/);
    for (const name of ["observatory", "niveora", "mars", "lumina", "atlas", "aurelia"]) {
      expect(css).toContain(`.${name}-layer`);
      expect(css).toMatch(new RegExp(`\\.${name}-hero \\{ --scene-x: \\d+%; --scene-y: \\d+%; \\}`));
    }
    expect(css).toMatch(/\.page-hero__image\s*\{\s*object-fit:\s*cover;\s*object-position:\s*var\(--scene-x/);
    expect(css).toContain("background-color: #292440");
  });

  it.each(worlds)("keeps the %s effect plane in plate percentages with cover projection", (name) => {
    const source = read(`src/app/${name}.css`);
    expect(source).toMatch(/width:\s*max\(100cqw,\s*177\.777778cqh\)/);
    expect(source).toMatch(/height:\s*max\(100cqh,\s*56\.25cqw\)/);
    expect(source).toMatch(/left:\s*var\(--scene-x\);\s*top:\s*var\(--scene-y\)/);
  });

  it("sizes identity with both viewport axes and keeps the previous accessibility fixes", () => {
    expect(css).toMatch(/\.commercial-intro \.hero-name\s*\{[^}]*clamp\([^;]*vw[^;]*svh/);
    expect(css).toMatch(/\.credibility-portrait\s*\{[^}]*clamp\([^;]*vw[^;]*svh/);
    expect(css).toContain("env(safe-area-inset-left)");
    expect(css).toContain("env(safe-area-inset-right)");
    expect(css).toContain("min-height: 44px");
    expect(css).toContain("height: max(100%, 44px)");
    expect(css).toContain("font-size: .75rem !important");
    expect(css).toContain("max-height: min(72px, 25svh)");
    expect(css).toContain("@media (min-width: 2200px)");
    expect(css).toContain("white-space: nowrap; overflow: hidden; text-overflow: ellipsis");
  });

  it("does not gate hero cover/choreography on desktop or pointer capabilities", () => {
    const motion = read("src/lib/gsap.ts");
    expect(motion).toContain('HERO_OVERLAY = "(min-width: 0px)"');
    expect(motion).toContain('hero.offsetHeight > window.innerHeight ? "bottom bottom" : "top top"');
    for (const component of ["home/Observatory", "about/Niveora", "projects/Mars", "content/Lumina", "events/Atlas", "services/Aurelia"]) {
      expect(read(`src/components/${component}Motion.tsx`)).toMatch(/start:\s*\(\)\s*=>\s*heroScrollStart\(section\)/);
    }
    const runner = read("tests/run-browser.mjs");
    expect(runner).toContain('"home-hero-responsive"');
    expect(runner).toContain("tests/${suite}.browser.mjs");
  });
});
