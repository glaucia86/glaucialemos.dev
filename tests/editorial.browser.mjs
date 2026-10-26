// BASE_URL=http://127.0.0.1:3100 node tests/editorial.browser.mjs
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";

const browser = await chromium.launch();
const base = process.env.BASE_URL || "http://127.0.0.1:3100";
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await fs.mkdir("docs/screenshots/editorial", { recursive: true });
try {
  for (const lang of ["pt", "en", "es"]) {
    for (const width of [390, 900, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      console.log(`Review home ${lang} ${width}px`);
      await page.goto(`${base}/${lang}`);
      await expect(page.locator(".home-projects .project-rows article")).toHaveCount(2);
      await expect(page.locator(".typescript-demo")).toHaveCount(1);
      await expect(page.locator(".dagobah-character")).toBeVisible();
      await expect(page.locator(".next-services a").first()).toHaveAttribute("href", `/${lang}/servicos?assunto=workshop#contato`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${lang} ${width}: overflow`);
      const safe = await page.locator(".page-hero").evaluate((hero) => {
        const character = hero.querySelector(".dagobah-character").getBoundingClientRect();
        return [...hero.querySelector(".page-hero__content").children].every((child) => {
          const text = child.getBoundingClientRect();
          return text.right <= character.left || text.left >= character.right || text.bottom <= character.top || text.top >= character.bottom;
        });
      });
      assert.ok(safe, `${lang} ${width}: character overlaps copy`);
      await page.locator(".portrait-frame").scrollIntoViewIfNeeded();
      await page.locator(".portrait-frame img").evaluate((image) => { image.loading = "eager"; });
      await page.waitForFunction(() => { const image = document.querySelector(".portrait-frame img"); return image.complete && image.naturalWidth > 0; });
      await page.locator(".page-hero").scrollIntoViewIfNeeded();
      await page.waitForFunction(() => { const image = document.querySelector(".dagobah-character img"); return image.complete && image.naturalWidth > 0; });
      await page.screenshot({ path: `docs/screenshots/editorial/hero-${lang}-${width}.png`, animations: "disabled" });
      await page.screenshot({ path: `docs/screenshots/editorial/home-${lang}-${width}.png`, fullPage: true, animations: "disabled" });
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${base}/pt`);
  const staticScene = await page.locator(".hero-scene-layer").evaluate((layer) => ({
    animations: layer.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length,
    opacity: getComputedStyle(layer).opacity,
    characterOpacity: getComputedStyle(layer.querySelector(".dagobah-character")).opacity,
  }));
  assert.deepEqual(staticScene, { animations: 0, opacity: "1", characterOpacity: "1" });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator(".motion-toggle").click();
  await expect(page.locator(".motion-toggle")).toHaveAttribute("aria-pressed", "true");
  assert.equal(await page.locator(".hero-scene-layer").evaluate((layer) => layer.getAnimations({ subtree: true }).length), 0);
  await page.locator(".motion-toggle").click();
  await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-paused", "false");
  await page.setViewportSize({ width: 390, height: 500 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-paused", "true");
  await page.locator(".dagobah-character").scrollIntoViewIfNeeded();
  await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-paused", "false");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-paused", "true");
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-paused", "false");
  await page.locator(".home-next").scrollIntoViewIfNeeded();
  await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-paused", "true");

  for (const lang of ["pt", "en", "es"]) {
    for (const route of ["sobre", "projetos", "conteudo", "eventos", "servicos"]) {
      await page.setViewportSize({ width: 390, height: 900 });
      const response = await page.goto(`${base}/${lang}/${route}`);
      assert.equal(response.status(), 200);
      await expect(page.locator("h1")).toBeVisible();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${lang}/${route}: overflow`);
      await page.screenshot({ path: `docs/screenshots/editorial/${route}-${lang}-390.png`, fullPage: true, animations: "disabled" });
    }
    await page.goto(`${base}/${lang}/conteudo`);
    const filters = page.locator(".shelves__filter").first().locator("button");
    const total = await page.locator(".shelf-card").count();
    await filters.nth(1).click();
    await expect(filters.nth(1)).toHaveAttribute("aria-pressed", "true");
    assert.ok(await page.locator(".shelf-card").count() < total);
    await filters.first().click();
    await expect(page.locator(".shelf-card")).toHaveCount(total);
    await page.locator(".menu-toggle").click();
    await expect(page.locator(".menu-toggle")).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator(".menu-toggle")).toHaveAttribute("aria-expanded", "false");
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  const staticPage = await noJs.newPage();
  await staticPage.goto(`${base}/pt`);
  await expect(staticPage.locator("h1")).toBeVisible();
  await expect(staticPage.locator(".dagobah-character")).toBeVisible();
  assert.equal(await staticPage.locator(".hero-scene-layer").evaluate((layer) => getComputedStyle(layer.querySelector(".force-rock")).animationPlayState), "paused");
  await noJs.close();
  assert.deepEqual(errors, []);
  console.log("PASS: 3 locales, responsive home, internal routes, images, manual/system motion, offscreen/hidden pause, filters, menu, no-JS static scene, no browser errors.");
} finally { await browser.close(); }
