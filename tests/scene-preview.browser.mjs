import { mkdir } from "node:fs/promises";
import { expect } from "@playwright/test";
import { baseURL, launchBrowser } from "./browser-utils.mjs";

const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  await mkdir("docs/screenshots", { recursive: true });
  for (const [name, width, height] of [["desktop", 1280, 900], ["mobile", 390, 1000]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${baseURL}/pt`);
    await expect(page.locator(".hero-scene-layer")).toHaveAttribute("data-motion", "running");
    await page.locator(".page-hero__image").evaluate((image) => image.decode());
    await page.evaluate(() => document.fonts.ready);
    await page.locator(".scene-image-plane").evaluate((plane) => {
      for (const animation of plane.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = 5000; }
    });
    await page.screenshot({ path: `docs/screenshots/home-cinematic-${name}.jpg`, quality: 88 });
  }
  console.log("PASS: Home desktop and mobile previews captured from the production build.");
} finally { await browser.close(); }
