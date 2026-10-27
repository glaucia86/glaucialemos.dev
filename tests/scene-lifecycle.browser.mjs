import assert from "node:assert/strict";
import { expect } from "@playwright/test";
import { baseURL, launchBrowser } from "./browser-utils.mjs";

const browser = await launchBrowser();
const failures = [];
async function check(name, run) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(10000);
  try { await run(page); console.log(`PASS: ${name}`); }
  catch (error) { console.error(`FAIL: ${name}: ${error.message}`); failures.push(`${name}: ${error.message}`); }
  finally { await page.close(); }
}
try {
  await check("system changes are reflected without persisting a manual choice", async (page) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${baseURL}/pt`);
    const toggle = page.locator(".motion-toggle");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    assert.equal(await page.evaluate(() => localStorage.getItem("reduce-motion")), null);
    await expect(toggle).toBeDisabled();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(toggle).toBeEnabled();
    await toggle.click();
    assert.equal(await page.evaluate(() => localStorage.getItem("reduce-motion")), "true");
    await page.reload();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    assert.equal(await page.evaluate(() => localStorage.getItem("reduce-motion")), "false");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });
  await check("storage denial leaves the motion control usable", async (page) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } });
    });
    await page.goto(`${baseURL}/pt`);
    const toggle = page.locator(".motion-toggle");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });
  await check("offscreen and hidden scenes freeze and resume their clocks", async (page) => {
    await page.goto(`${baseURL}/pt`);
    const layer = page.locator(".hero-scene-layer");
    await expect(layer).toHaveAttribute("data-motion", "running");
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(layer).toHaveAttribute("data-motion", "paused");
    const clock = () => layer.evaluate((node) => node.querySelector(".force-depth").getAnimations()[0].currentTime);
    const before = await clock();
    await page.waitForTimeout(150);
    assert.ok(Math.abs(await clock() - before) < 1, "offscreen animation must not advance");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(layer).toHaveAttribute("data-motion", "running");
    // Browser visibility is supplied by the platform; dispatch its real event contract.
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(layer).toHaveAttribute("data-motion", "paused");
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(layer).toHaveAttribute("data-motion", "running");
    const resumed = await clock();
    await page.waitForTimeout(150);
    assert.ok(await clock() > resumed, "visible animation must advance");
    await page.locator(".page-hero .actions a").last().click();
    await expect(page).toHaveURL(`${baseURL}/pt/eventos`);
    await expect(page.locator(".hero-scene-layer--atlas")).toHaveAttribute("data-paused", "false");
  });
  await check("Home has a coordinated lift and a quiet interval", async (page) => {
    await page.goto(`${baseURL}/pt`);
    await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-motion", "running");
    const sample = (time) => page.locator(".scene-image-plane").evaluate((plane, time) => {
      for (const animation of plane.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = time; }
      return [...plane.querySelectorAll(".force-depth")].map((depth) => new DOMMatrix(getComputedStyle(depth).transform).f);
    }, time);
    const rest = await sample(0);
    const quiet = await sample(1000);
    const lifted = await sample(5000);
    assert.deepEqual(quiet, rest, "opening rest holds all three planes");
    assert.ok(lifted.every((y, i) => y < rest[i] - 3), "all planes lift together");
    assert.ok(Math.abs(lifted[2]) > Math.abs(lifted[0]), "foreground travels more than background");
    assert.deepEqual(await sample(12000), rest, "the loop closes without a jump");
  });
  await check("route changes release observers and preserve the keyboard Easter egg", async (page) => {
    await page.addInitScript(() => {
      const active = new Set();
      const NativeObserver = window.IntersectionObserver;
      window.IntersectionObserver = class extends NativeObserver {
        observe(target) { if (target.classList.contains("hero-scene-layer")) active.add(this); super.observe(target); }
        disconnect() { active.delete(this); super.disconnect(); }
      };
      window.sceneObserverCount = () => active.size;
    });
    await page.goto(`${baseURL}/pt`);
    await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-motion", "running");
    for (const slug of ["servicos"]) {
      await page.locator(`nav a[href="/pt/${slug}"]`).click();
      await expect(page).toHaveURL(`${baseURL}/pt/${slug}`);
      await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-motion", "running");
      assert.equal(await page.evaluate(() => window.sceneObserverCount()), 1);
    }
    for (const key of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) await page.keyboard.press(key);
    await expect(page.locator("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog")).not.toBeVisible();
  });
  await check("without JavaScript the original artwork and links remain usable", async () => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}/pt`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".page-hero__image")).toBeVisible();
      await expect(page.locator(".page-hero .actions a").first()).toHaveAttribute("href", "/pt/servicos");
      await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-motion", "paused");
      assert.equal(await page.locator(".force-depth").first().evaluate((node) => getComputedStyle(node).animationPlayState), "paused");
    } finally { await context.close(); }
  });
  await check("secondary scenes share cover geometry", async (page) => {
    for (const width of [390, 900, 901, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ["servicos"]) {
        await page.goto(`${baseURL}/pt/${route}`);
        const alignment = await page.locator(".scene-image-plane").evaluate((plane) => {
          const image = plane.closest(".page-hero").querySelector(".page-hero__image");
          const box = image.getBoundingClientRect(); const rect = plane.getBoundingClientRect();
          const scale = Math.max(box.width / 1024, box.height / 576);
          const [x, y] = getComputedStyle(image).objectPosition.split(" ").map(parseFloat);
          return [rect.width - 1024 * scale, rect.height - 576 * scale, rect.x - box.x - (box.width - 1024 * scale) * x / 100, rect.y - box.y - (box.height - 576 * scale) * y / 100];
        });
        assert.ok(alignment.every((error) => Math.abs(error) < .1), `${route} at ${width}: ${alignment}`);
      }
    }
  });
  if (failures.length) throw new Error(failures.join("\n\n"));
} finally { await browser.close(); }
