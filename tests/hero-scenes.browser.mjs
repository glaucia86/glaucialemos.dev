// Run against a running app: node tests/hero-scenes.browser.mjs
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage();
const baseURL = process.env.BASE_URL || "http://127.0.0.1:3100";
await page.addInitScript(() => localStorage.setItem("reduce-motion", "false"));

try {
  for (const width of [390, 900, 901, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/pt", "/pt/servicos"]) {
      await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.documentElement.dataset.boot !== "pending");
      const plane = page.locator(route === "/pt/servicos" ? ".hero-scene-layer--aurelia .aurelia-plane" : ".scene-image-plane");
      await plane.waitFor({ state: "attached", timeout: 10000 });
      await page.waitForFunction(() => document.querySelector(".motion-toggle")?.getAttribute("aria-pressed") === "false");
      const alignment = await plane.evaluate((element) => {
        const image = element.closest(".page-hero").querySelector(".page-hero__image");
        const box = image.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        const scale = Math.max(box.width / 1024, box.height / 576);
        const [x, y] = getComputedStyle(image).objectPosition.split(" ").map(parseFloat);
        return {
          widthError: rect.width - 1024 * scale,
          heightError: rect.height - 576 * scale,
          xError: rect.x - box.x - (box.width - 1024 * scale) * x / 100,
          yError: rect.y - box.y - (box.height - 576 * scale) * y / 100,
        };
      });
      for (const error of Object.values(alignment)) assert.ok(Math.abs(error) < 0.1, JSON.stringify(alignment));

      if (route === "/pt") {
        assert.equal(await page.locator(".observatory-crew__pose--idle").count(), 1);
        assert.equal(await page.locator(".observatory-hot").count(), 3);
        // Glaucia and Prince never cover the copy, in any pose.
        for (const pose of ["idle", "telescope", "point"]) {
          const safe = await plane.evaluate((element, pose) => {
            const crew = element.querySelector(`.observatory-crew__pose--${pose}`).getBoundingClientRect();
            const content = element.closest(".page-hero").querySelector(".page-hero__content");
            return [...content.children].map((child) => child.getBoundingClientRect()).every((box) =>
              crew.right <= box.left || crew.left >= box.right || crew.bottom <= box.top || crew.top >= box.bottom);
          }, pose);
          assert.ok(safe, `${route}, ${width}px: ${pose} overlaps the copy`);
        }
      } else {
        assert.equal(await page.locator(".aurelia-hot").count(), 4);
        for (const actor of [".aurelia-crew", ".aurelia-prince"]) {
          assert.equal(await plane.locator(actor).count(), 1);
        }
      }

      // Exercise the actual button and the independent OS preference.
      for (const preference of ["manual", "system"]) {
        if (preference === "manual") await page.locator(".motion-toggle").click();
        await page.emulateMedia({ reducedMotion: preference === "system" ? "reduce" : "no-preference" });
        const stopped = await page.locator(".hero-scene-layer").evaluate((layer) =>
          [layer, ...layer.querySelectorAll("*")].every((element) => {
            const style = getComputedStyle(element);
            return style.animationName === "none";
          }),
        );
        assert.ok(stopped, `${route}, ${width}px: ${preference} reduced-motion`);
        assert.equal(await page.locator(".hero-scene-layer").evaluate((layer) => getComputedStyle(layer).opacity), "1");
        if (preference === "manual") await page.locator(".motion-toggle").click();
      }
      await page.emulateMedia({ reducedMotion: "no-preference" });
    }
  }
  console.log("PASS: image alignment, actors, mobile composition and visible static scenes with both reduced-motion preferences at 5 viewport widths.");
} finally {
  await browser.close();
}
