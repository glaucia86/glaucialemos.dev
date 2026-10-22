// Run against a running app: node tests/hero-scenes.browser.mjs
import assert from "node:assert/strict";
import { expect } from "@playwright/test";


import { baseURL, launchBrowser } from "./browser-utils.mjs";

const browser = await launchBrowser();
const page = await browser.newPage();
await page.addInitScript(() => localStorage.setItem("reduce-motion", "false"));

try {
  for (const width of [390, 900, 901, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/pt", "/pt/servicos"]) {
      await page.goto(`${baseURL}${route}`);
      const plane = page.locator(".scene-image-plane");
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
        assert.equal(await page.locator(".x-wing").count(), 0);
        assert.equal(await page.locator(".force-rock").count(), 10);
        assert.equal(await page.locator(".force-rock:visible").count(), width <= 900 ? 6 : 10);
        assert.equal(await page.locator(".force-depth").count(), 3);
        // Sample every layer's motion, including its independent delay, for overlap.
        for (const time of [0, 1500, 3000, 6000, 10000]) {
          const safe = await plane.evaluate((element, time) => {
            for (const animation of element.getAnimations({ subtree: true })) {
              animation.pause();
              animation.currentTime = time;
            }
            const image = element.getBoundingClientRect();
            const content = element.closest(".page-hero").querySelector(".page-hero__content");
            const text = [...content.children].map((child) => child.getBoundingClientRect());
            return [...element.querySelectorAll(".force-rock")].filter((rock) => getComputedStyle(rock).display !== "none").every((rock) => {
              const rect = rock.querySelector("svg").getBoundingClientRect();
              return (rect.left - image.left) / image.width * 1024 > 430 && text.every((box) =>
                rect.right <= box.left || rect.left >= box.right || rect.bottom <= box.top || rect.top >= box.bottom);
            });
          }, time);
          assert.ok(safe, `${route}, ${width}px: stones overlap text or cross x=430 at ${time}ms`);
        }
        assert.ok(await page.locator(".crawl > div").evaluate((element) => element.getAnimations().length > 0));
      } else {
        assert.equal(await page.locator(".saber-hilt").count(), 0, "Use the image's single hilt");
        const saber = await plane.evaluate((element) => {
          const assembly = element.querySelector(".saber-assembly");
          const blade = element.querySelector(".saber-blade");
          for (const animation of element.getAnimations({ subtree: true })) {
            animation.pause();
            animation.currentTime = 3000;
          }
          const plane = element.getBoundingClientRect();
          const style = getComputedStyle(assembly);
          const matrix = new DOMMatrix(style.transform);
          const length = parseFloat(style.width) / plane.width * 1024;
          return {
            x: parseFloat(style.left) / plane.width * 1024,
            y: parseFloat(style.top) / plane.height * 576,
            length, tipX: matrix.a * length, tipY: matrix.b * length,
            scale: new DOMMatrix(getComputedStyle(blade).transform).a,
            origin: getComputedStyle(blade).transformOrigin,
          };
        });
        assert.ok(Math.abs(saber.x - 718) < .1 && Math.abs(saber.y - 335) < .1, JSON.stringify(saber));
        assert.ok(Math.abs(saber.length - 200) < .1 && saber.tipX < -130 && saber.tipY < -130, JSON.stringify(saber));
        assert.equal(saber.scale, 1);
        assert.ok(saber.origin.startsWith("0px "));
        for (const time of [0, 5400]) {
          const scale = await page.locator(".saber-blade").evaluate((blade, time) => {
            blade.getAnimations()[0].currentTime = time;
            return new DOMMatrix(getComputedStyle(blade).transform).a;
          }, time);
          assert.equal(scale, 0, `Blade must be off at ${time}ms`);
        }
        if (width <= 900) {
          const visible = await plane.evaluate((element) => {
            const plane = element.getBoundingClientRect();
            const hero = element.closest(".page-hero");
            const frame = hero.getBoundingClientRect();
            const text = hero.querySelector(".page-hero__content").getBoundingClientRect();
            // Vader's head and feet in reference-image coordinates.
            return [150, 545].every((y) => {
              const point = { x: plane.x + plane.width * 820 / 1024, y: plane.y + plane.height * y / 576 };
              return point.x > frame.left && point.x < frame.right && point.y > text.bottom && point.y < frame.bottom;
            });
          });
          assert.ok(visible, `${width}px: Vader must be visible below the text`);
        }
      }

      // Exercise the actual button and the independent OS preference.
      for (const preference of ["manual", "system"]) {
        if (preference === "manual") await page.locator(".motion-toggle").click();
        await page.emulateMedia({ reducedMotion: preference === "system" ? "reduce" : "no-preference" });
        // Preference changes dispatch asynchronously; assert the settled state.
        await expect.poll(() => page.locator(".hero-scene-layer").evaluate((layer) =>
          [layer, ...layer.querySelectorAll("*")].every((element) => {
            const style = getComputedStyle(element);
            return style.animationName === "none" && style.opacity === "0";
          }),
        ), { message: `${route}, ${width}px: ${preference} reduced-motion` }).toBe(true);
        if (route === "/pt") {
          const crawl = await page.locator(".crawl > div").evaluate((element) => {
            const style = getComputedStyle(element);
            return { animations: element.getAnimations().length, transform: style.transform, opacity: style.opacity, height: element.getBoundingClientRect().height };
          });
          assert.equal(crawl.animations, 0, `${preference}: crawl must stop`);
          assert.equal(crawl.transform, "none");
          assert.equal(crawl.opacity, "1");
          assert.ok(crawl.height > 0);
        }
        if (preference === "manual") await page.locator(".motion-toggle").click();
      }
      await page.emulateMedia({ reducedMotion: "no-preference" });
      if (route === "/pt") await expect.poll(() => page.locator(".crawl > div").evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);
    }
  }
  console.log("PASS: image alignment, stones, saber, mobile composition and both reduced-motion preferences (including crawl) at 5 viewport widths.");
} finally {
  await browser.close();
}
