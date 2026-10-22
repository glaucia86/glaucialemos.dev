// Run against a running app: node tests/opening-crawl.browser.mjs
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const browser = await chromium.launch();
const baseURL = process.env.BASE_URL || "http://127.0.0.1:3100";
const page = await browser.newPage({ reducedMotion: "no-preference" });
const intro = page.locator(".opening-crawl");
const open = () => page.waitForFunction(() => document.querySelector(".opening-crawl")?.open);
const closed = () => page.waitForFunction(() => !document.querySelector(".opening-crawl")?.open);

try {
  await page.goto(`${baseURL}/pt`);
  await open();
  const skip = intro.getByRole("button", { name: "Pular introdução" });
  assert.ok(await skip.evaluate((el) => el === document.activeElement));
  await page.keyboard.press("Tab");
  // Native dialogs can cycle through browser chrome, but never the inert page.
  assert.ok(await intro.evaluate((el) => el.contains(document.activeElement) || document.activeElement === document.body));
  await page.keyboard.press("Shift+Tab");
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await closed();
  await expect(page.locator("#main")).toBeFocused();
  assert.equal(await page.evaluate(() => localStorage.getItem("intro-dismissed")), "true");
  await page.reload();
  await page.waitForFunction(() => document.querySelector(".motion-toggle")?.getAttribute("aria-pressed") === "false");
  assert.equal(await intro.evaluate((el) => el.open), false, "Dismissal survives reload");

  for (const [locale, label] of [["pt", "Pular introdução"], ["en", "Skip intro"], ["es", "Saltar introducción"]]) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${baseURL}/${locale}?intro=1`);
      await open();
      assert.ok(await intro.getByRole("button", { name: label }).isVisible());
      const sample = async (time) => intro.evaluate((el, time) => {
        for (const animation of el.getAnimations({ subtree: true })) {
          animation.pause();
          animation.currentTime = time;
        }
        return [".opening-crawl__lead", ".opening-crawl__logo", ".opening-crawl__text"].map((selector) => {
          const node = el.querySelector(selector);
          const style = getComputedStyle(node);
          return { opacity: Number(style.opacity), transform: style.transform };
        });
      }, time);
      const lead = await sample(2000);
      assert.ok(lead[0].opacity > .9 && lead[1].opacity === 0 && lead[2].opacity === 0);
      const logo = await sample(6500);
      assert.ok(logo[0].opacity === 0 && logo[1].opacity > .9 && logo[2].opacity === 0);
      const crawl = await sample(28000);
      assert.ok(crawl[0].opacity === 0 && crawl[1].opacity === 0 && crawl[2].opacity > .9);
      assert.notEqual(crawl[2].transform, (await sample(38000))[2].transform);
      if (locale === "pt") await page.screenshot({ path: `/tmp/opening-crawl-${width}.png` });
      await intro.evaluate((el) => {
        for (const animation of el.getAnimations({ subtree: true })) animation.finish();
      });
      await closed();
    }
  }

  await page.goto(`${baseURL}/en?intro=1`);
  await open();
  await page.keyboard.press("Escape");
  await closed();

  for (const preference of ["manual", "system"]) {
    if (preference === "manual") {
      await page.getByRole("button", { name: "Reduce motion" }).click();
      await page.waitForFunction(() => localStorage.getItem("reduce-motion") === "true");
    } else {
      await page.evaluate(() => localStorage.setItem("reduce-motion", "false"));
    }
    await page.emulateMedia({ reducedMotion: preference === "system" ? "reduce" : "no-preference" });
    await page.goto(`${baseURL}/pt?intro=1`);
    await expect(page.locator(".motion-toggle")).toHaveAttribute("aria-pressed", String(preference === "manual"));
    assert.equal(await intro.evaluate((el) => el.open), false);
    const story = page.locator(".crawl-story");
    assert.ok(await story.isVisible());
    assert.equal(await story.locator("p").count(), 3);
    assert.equal(await story.evaluate((el) => el.getAnimations({ subtree: true }).length), 0);
  }

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => localStorage.setItem("reduce-motion", "false"));
  await page.goto(`${baseURL}/pt?intro=1`);
  await open();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await closed();
  console.log("PASS: intro phases, desktop/mobile locales, keyboard dismissal, persistence, replay, automatic completion and reduced motion.");
} finally {
  await browser.close();
}
