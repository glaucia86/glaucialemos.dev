// Run against a running app: node tests/hero-scenes.browser.mjs
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage();
const baseURL = process.env.BASE_URL || "http://127.0.0.1:3100";
await page.addInitScript(() => localStorage.setItem("reduce-motion", "false"));

try {
  for (const width of [320, 390, 640, 641, 900, 901, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/pt/eventos", "/pt", "/pt/servicos"]) {
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
      } else if (route === "/pt/eventos") {
        const globe = page.locator(".hologram-globe");
        const geometry = await globe.evaluate((element) => {
          const image = element.closest(".page-hero").querySelector(".page-hero__image");
          const box = image.getBoundingClientRect();
          const rect = element.getBoundingClientRect();
          const scale = Math.max(box.width / 1024, box.height / 576);
          const [x, y] = getComputedStyle(image).objectPosition.split(" ").map(parseFloat);
          return {
            xError: rect.x + rect.width / 2 - (box.x + (box.width - 1024 * scale) * x / 100 + 708 * scale),
            yError: rect.y + rect.height / 2 - (box.y + (box.height - 576 * scale) * y / 100 + 272 * scale),
            widthError: rect.width - 160 * scale,
            heightError: rect.height - 160 * scale,
          };
        });
        for (const error of Object.values(geometry)) assert.ok(Math.abs(error) < .1, `${width}px: ${JSON.stringify(geometry)}`);
        const rotation = await globe.evaluate((element) => {
          const animation = element.getAnimations()[0];
          if (!animation) return null;
          animation.pause();
          const duration = animation.effect.getTiming().duration;
          return [0, duration / 4, duration].map((time) => {
            animation.currentTime = time;
            const style = getComputedStyle(element);
            return { x: parseFloat(style.backgroundPositionX), transform: style.transform };
          });
        });
        assert.ok(rotation, "The globe must rotate");
        assert.ok(Math.abs(rotation[1].x - rotation[0].x) >= 50, "Continents must visibly travel across the sphere");
        assert.equal(rotation[0].x, rotation[2].x, "The texture must loop seamlessly");
        assert.equal(rotation[0].transform, rotation[1].transform, "The sphere stays fixed while continents rotate");
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
        const stopped = await page.locator(".hero-scene-layer").evaluate((layer) =>
          [layer, ...layer.querySelectorAll("*")].every((element) => {
            const style = getComputedStyle(element);
            return style.animationName === "none" && style.opacity === (layer.classList.contains("hero-scene-layer--nevarro") ? "1" : "0");
          }),
        );
        assert.ok(stopped, `${route}, ${width}px: ${preference} reduced-motion`);
        if (route === "/pt/eventos") {
          assert.ok(await page.locator(".hologram-globe").isVisible());
          assert.equal(await page.locator(".hologram-globe").evaluate((element) => element.getAnimations().length), 0);
        }
        if (preference === "manual") await page.locator(".motion-toggle").click();
      }
      await page.emulateMedia({ reducedMotion: "no-preference" });
    }
  }
  console.log("PASS: image alignment, stones, saber, rotating globe, mobile composition and both reduced-motion preferences at 8 viewport widths.");
} finally {
  await browser.close();
}
