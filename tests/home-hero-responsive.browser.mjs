import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { expect } from "@playwright/test";
import { baseURL, launchBrowser } from "./browser-utils.mjs";

const output = "test-results/home-hero-responsive";
await mkdir(output, { recursive: true });
const browser = await launchBrowser();
const failures = [];
const viewports = [
  { width: 360, height: 640 }, { width: 390, height: 844 },
  { width: 768, height: 1024 }, { width: 1024, height: 768 },
  { width: 844, height: 390 },
];
const cases = viewports.map(viewport => ({ locale: "pt", viewport }));
for (const locale of ["en", "es"]) cases.push({ locale, viewport: viewports[1] });
cases.push({ locale: "pt", viewport: viewports[1], reducedMotion: "reduce" });
cases.push({ locale: "pt", viewport: viewports[1], manualMotion: true });

async function imageState(page, selector = ".home-hero .page-hero__image") {
  const img = page.locator(selector);
  await expect(img).toHaveJSProperty("complete", true);
  assert.ok(await img.evaluate(el => el.naturalWidth > 0), "plate failed to decode");
  await expect(img).toHaveCSS("opacity", "1");
  assert.ok(await img.evaluate(el => {
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (Number(style.opacity) !== 1 || style.visibility === "hidden" || style.display === "none") return false;
    }
    return true;
  }), "an ancestor hides/dims the plate");
  return img;
}

async function layout(page, selector = ".home-hero .page-hero__image") {
  const result = await page.locator(selector).evaluate(img => {
    const plate = img.getBoundingClientRect();
    const header = document.querySelector(".site-header").getBoundingClientRect();
    const hero = img.closest(".page-hero");
    const copy = hero.querySelector(".page-hero__content").getBoundingClientRect();
    const planes = [...hero.querySelectorAll(".observatory-plane,.niveora-plane,.mars-plane,.lumina-plane,.atlas-plane,.aurelia-plane")];
    return {
      y: scrollY, visible: Math.max(0, Math.min(innerHeight, plate.bottom) - Math.max(header.bottom, plate.top)) / plate.height,
      underHeader: Math.abs(plate.top - header.bottom) < 2,
      separated: plate.bottom <= copy.top + 1,
      ratio: plate.width / plate.height,
      overflow: document.documentElement.scrollWidth > innerWidth,
      aligned: planes.length > 0 && planes.every(plane => {
        const box = plane.getBoundingClientRect();
        return [box.left - plate.left, box.top - plate.top, box.width - plate.width, box.height - plate.height].every(n => Math.abs(n) < 2);
      }),
    };
  });
  assert.equal(result.y, 0, "initial checks must not scroll the page");
  assert.ok(result.underHeader, "plate is not directly under the header");
  assert.ok(result.visible >= .6, `only ${Math.round(result.visible * 100)}% of plate visible`);
  assert.ok(result.separated, "copy must follow the plate");
  assert.ok(result.aligned, "effects/hotspots do not match the plate");
  assert.ok(Math.abs(result.ratio - 16 / 9) < .02, "plate is cropped/distorted");
  assert.equal(result.overflow, false, "horizontal overflow");
}

// Sample the rendered scene (including shade/effects), not just the source image.
// Decode the PNG in the page: no sharp/png dependency and no cross-origin canvas.
async function pixels(page, id, selector = ".home-hero .page-hero__image") {
  const rect = await page.locator(selector).boundingBox();
  assert.ok(rect);
  const viewport = page.viewportSize();
  const x = Math.max(0, rect.x), y = Math.max(0, rect.y);
  const width = Math.min(rect.x + rect.width, viewport.width) - x;
  const height = Math.min(rect.y + rect.height, viewport.height) - y;
  assert.ok(width > 0 && height > 0, "no visible plate pixels");
  const shot = await page.screenshot({ path: `${output}/${id}.png`, clip: { x, y, width, height } });
  const sample = await page.evaluate(async base64 => {
    const img = new Image();
    img.src = `data:image/png;base64,${base64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 128; canvas.height = 72;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let total = 0, lit = 0;
    for (let i = 0; i < data.length; i += 4) {
      const luminance = .2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2];
      total += luminance;
      if (luminance > 20) lit++;
    }
    return { mean: total / (data.length / 4), lit: lit / (data.length / 4) };
  }, shot.toString("base64"));
  assert.ok(sample.mean > 25, `plate mean luminance ${sample.mean.toFixed(1)}/255`);
  assert.ok(sample.lit >= .05, `only ${Math.round(sample.lit * 100)}% non-black pixels`);
}

async function soundInvite(page) {
  const invite = page.locator(".sound-invite");
  if (!await invite.isVisible()) return;
  const box = await invite.boundingBox();
  assert.ok(box, "sound invitation has no bounding box");
  assert.ok(box.height <= page.viewportSize().height * .25, "sound invitation covers >25% of viewport");
  if (page.viewportSize().width > 600) assert.ok(box.height <= 73, "compact sound invitation exceeds 72px (1px tolerance)");
  for (const button of await invite.getByRole("button").all()) {
    const target = await button.boundingBox();
    assert.ok(target, "sound invitation button has no bounding box");
    assert.ok(target.height >= 44 && target.width >= 44, "small sound invitation button");
    assert.ok(await button.evaluate(el => el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1), "sound invitation button text is clipped");
  }
  assert.ok(await invite.evaluate(el => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1), "invitation text is clipped");
}

async function readableControls(page) {
  const issues = await page.evaluate(() => {
    const issues = [];
    for (const el of document.querySelectorAll(".secrets-guide button,.career-dialog__open,.credibility-offer__waitlist,a.worlds-warp__label,.credibility-venues a,footer a,.footer-top,.contact-consent")) {
      const box = el.getBoundingClientRect();
      if (box.width && box.height && Math.min(box.width, box.height) < 44) issues.push(`small target: ${el.className}`);
    }
    for (const el of document.querySelectorAll(".chapter-tag,.comlink-toggle__count,.sky-touch-hint,small,.footer-top,.credibility-kicker,.mars-discoveries,.atlas-discoveries")) {
      if (el.getBoundingClientRect().width && parseFloat(getComputedStyle(el).fontSize) < 12) issues.push(`small font: ${el.className}`);
    }
    return issues;
  });
  assert.deepEqual(issues, []);
}

async function setup(options) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => {
    for (const key of ["galaxia-boot", "niveora-boot", "marte-boot", "lumina-boot", "atlas-boot", "aurelia-boot"]) sessionStorage.setItem(key, "done");
  });
  return context;
}

try {
  for (const { locale, viewport, reducedMotion = "no-preference", manualMotion = false } of cases) {
    const id = `${locale}-${viewport.width}x${viewport.height}-${manualMotion ? "manual" : reducedMotion}`;
    const context = await setup({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion });
    const page = await context.newPage();
    try {
      if (manualMotion) await context.addInitScript(() => localStorage.setItem("reduce-motion", "true"));
      await page.goto(`${baseURL}/${locale}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      // Intentional settling interval from the entry regression, with no scrolling.
      await page.waitForTimeout(1500);
      await imageState(page);
      await layout(page);
      await pixels(page, `${id}-entry`);
      const title = page.getByRole("heading", { level: 1, name: "Glaucia Lemos" });
      await expect(title).toBeVisible();
      const titleBox = await title.boundingBox();
      assert.ok(titleBox, "Glaucia title has no bounding box");
      const titleBottom = titleBox.y + titleBox.height + await page.evaluate(() => window.scrollY);
      assert.ok(titleBottom <= 2 * viewport.height, "Glaucia title below first two screens");
      if (manualMotion) await expect(page.locator("html")).toHaveClass(/reduce-motion/);
      await soundInvite(page);
      await readableControls(page);
      for (const fraction of [.5, 1]) {
        await page.evaluate(f => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), fraction);
        await page.waitForTimeout(500);
        assert.ok(await page.evaluate(() => scrollY > 0), "scroll did not advance");
        await imageState(page);
        await soundInvite(page);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        // The plate is offscreen here. Return to it to test repaint after observers pause/resume.
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(500);
        await imageState(page);
        await layout(page);
        await pixels(page, `${id}-after-${fraction}`);
      }
      console.log(`PASS ${id}`);
    } catch (error) {
      failures.push(`${id}: ${error.message}`);
      await page.screenshot({ path: `${output}/${id}-failed.png` }).catch(() => {});
    } finally { await context.close(); }
  }

  // Shared geometry must also hold for every per-world override.
  for (const route of ["sobre", "projetos", "eventos", "servicos", "conteudo"]) for (const viewport of [viewports[1], viewports[4]]) {
    const id = `${route}-${viewport.width}x${viewport.height}`;
    const context = await setup({ viewport, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    try {
      await page.goto(`${baseURL}/pt/${route}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await imageState(page, ".page-hero__image");
      await layout(page, ".page-hero__image");
      await readableControls(page);
      console.log(`PASS ${id}`);
    } catch (error) { failures.push(`${id}: ${error.message}`); }
    finally { await context.close(); }
  }

  for (const viewport of [viewports[1], viewports[4]]) {
    const context = await setup({ viewport, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    try {
      await page.goto(`${baseURL}/pt/missing-responsive-page`, { waitUntil: "load" });
      const stage = await page.locator(".red-tide__frame").boundingBox();
      const copy = await page.locator(".red-tide__copy").boundingBox();
      const header = await page.locator(".site-header").boundingBox();
      assert.ok(stage && copy && header, "404 stage, copy or header has no bounding box");
      assert.ok(Math.abs(stage.y - (header.y + header.height)) < 2);
      assert.ok(stage.y + stage.height <= viewport.height + 1);
      assert.ok(stage.y + stage.height <= copy.y + 1);
      assert.ok(Math.abs(stage.width / stage.height - 16 / 9) < .02);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await pixels(page, `404-${viewport.width}`, ".red-tide__frame");
      console.log(`PASS 404-${viewport.width}`);
    } catch (error) { failures.push(`404-${viewport.width}: ${error.message}`); }
    finally { await context.close(); }
  }

  // Root-scale contract: ordinary desktop unchanged, TV copy/container scale together.
  for (const [width, height, font] of [[1440, 900, 16], [1920, 1080, 16], [2560, 1440, 20], [3840, 2160, 28]]) {
    const context = await setup({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    try {
      await page.goto(`${baseURL}/pt`, { waitUntil: "load" });
      const sizing = await page.evaluate(() => ({
        root: parseFloat(getComputedStyle(document.documentElement).fontSize),
        content: document.querySelector(".page-hero__content").getBoundingClientRect().width,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      assert.equal(sizing.root, font);
      assert.ok(Math.abs(sizing.content - 73.75 * font) < 2, "content width did not scale with text");
      assert.equal(sizing.overflow, false);
      await page.screenshot({ path: `${output}/desktop-${width}.png` });
      console.log(`PASS desktop-${width}`);
    } catch (error) { failures.push(`desktop-${width}: ${error.message}`); }
    finally { await context.close(); }
  }
} finally { await browser.close(); }

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log("PASS: image-first entry, scene pixels, scroll repaint, touch geometry, motion preferences and TV scale.");
