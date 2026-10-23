import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";

const base = process.env.BASE_URL || "http://127.0.0.1:3100";
const shots = "docs/screenshots/jedi";
await fs.mkdir(shots, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" });
await desktop.addInitScript(() => localStorage.setItem("reduce-motion", "false"));
const page = await desktop.newPage();
page.on("pageerror", (error) => errors.push(error.message));
const progress = (target) => target.locator(".reading-progress__fill").evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).d);
const glow = (target) => target.locator(".jedi-blade").evaluate((element) => Number(getComputedStyle(element).opacity));
const scroll = (target, fraction) => target.evaluate((fraction) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * fraction), fraction);

try {
  for (const lang of ["pt", "en", "es"]) {
    for (const width of [390, 900, 1100, 1280, 1920]) {
      console.log(`Review Jedi ${lang} ${width}px`);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}/${lang}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".reading-progress")).toHaveCount(1);
      await expect(page.locator(".jedi-portrait")).toHaveAttribute("data-motion-ready", "true");
      await expect.poll(() => progress(page)).toBe(0);
      await page.locator(".portrait-frame").scrollIntoViewIfNeeded();
      await page.waitForFunction(() => { const image = document.querySelector(".portrait-frame img"); return image.complete && image.naturalWidth > 0; });
      // Let the existing section reveal finish before measuring rotated geometry.
      await page.waitForTimeout(650);
      const alignment = await page.locator(".portrait-image-plane").evaluate((plane) => {
        const image = plane.querySelector("img").getBoundingClientRect();
        const overlay = plane.querySelector("svg").getBoundingClientRect();
        const crop = plane.parentElement;
        const scale = Math.max(crop.clientWidth / 864, crop.clientHeight / 1152);
        return { differences: [image.x - overlay.x, image.y - overlay.y, image.width - overlay.width, image.height - overlay.height], widthError: plane.offsetWidth - 864 * scale, heightError: plane.offsetHeight - 1152 * scale };
      });
      assert.ok(alignment.differences.every((value) => Math.abs(value) < .1), JSON.stringify(alignment));
      assert.ok(Math.abs(alignment.widthError) <= 1 && Math.abs(alignment.heightError) <= 1, JSON.stringify(alignment));
      const safe = await page.locator(".reading-progress").evaluate((indicator) => {
        const box = indicator.getBoundingClientRect();
        const items = [...document.querySelectorAll("main a, main h1, main h2, main p, .portrait-frame")];
        return items.every((item) => { const rect = item.getBoundingClientRect(); return rect.right <= box.left || rect.left >= box.right || rect.bottom <= box.top || rect.top >= box.bottom; });
      });
      assert.ok(safe, `${lang}/${width}: indicator overlaps content`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.equal(await page.locator(".reading-progress").evaluate((element) => getComputedStyle(element).height), width >= 1100 ? "168px" : "112px");
      await page.screenshot({ path: `${shots}/portrait-${lang}-${width}.png` });
      for (const fraction of [0, .5, 1, 0]) {
        await scroll(page, fraction);
        await expect.poll(() => progress(page)).toBeCloseTo(fraction, 2);
      }
      if (lang === "pt") {
        await scroll(page, .5);
        await page.screenshot({ path: `${shots}/progress-${width}.png` });
      }
    }
  }

  // Also wait for the complete page at the desktop threshold, including hero images.
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(`${base}/pt`);
  await page.waitForFunction(() => [...document.querySelectorAll(".home-hero img")].every((image) => image.complete && image.naturalWidth > 0));
  await page.screenshot({ path: `${shots}/home-pt-1100.png`, fullPage: true, animations: "disabled" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${base}/pt`, { waitUntil: "domcontentloaded" });
  await page.locator(".portrait-frame").hover();
  await expect.poll(() => glow(page)).toBe(1);
  const durations = await page.locator(".jedi-blade").evaluate((element) => getComputedStyle(element).transitionDuration);
  assert.equal(durations, "0.22s");
  await page.screenshot({ path: `${shots}/portrait-hover.png` });
  await page.mouse.move(650, 100);
  assert.equal(await page.locator(".jedi-blade").evaluate((element) => getComputedStyle(element).transitionDuration), "0.3s");
  await expect.poll(() => glow(page)).toBe(0);
  // Focus through the keyboard, preserving the existing semantic link.
  await page.locator(".trajectory-link").focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(page.locator(".trajectory-link")).toBeFocused();
  await expect.poll(() => glow(page)).toBe(1);
  await page.screenshot({ path: `${shots}/portrait-focus.png` });
  assert.equal(await page.locator(".portrait-frame [tabindex], .reading-progress [tabindex], .portrait-frame a, .reading-progress a").count(), 0);
  await page.keyboard.press("Tab");
  await expect.poll(() => glow(page)).toBe(0);

  await scroll(page, .5);
  await page.setViewportSize({ width: 900, height: 700 });
  await expect.poll(async () => Math.abs(await progress(page) - await page.evaluate(() => scrollY / (document.documentElement.scrollHeight - innerHeight)))).toBeLessThan(.001);
  await page.evaluate(() => { const extra = document.createElement("div"); extra.id = "height-probe"; extra.style.height = "1200px"; document.body.append(extra); });
  await expect.poll(async () => Math.abs(await progress(page) - await page.evaluate(() => scrollY / (document.documentElement.scrollHeight - innerHeight)))).toBeLessThan(.001);
  await page.evaluate(() => document.getElementById("height-probe").remove());
  assert.equal(await page.locator(".reading-progress").evaluate((element) => getComputedStyle(element).pointerEvents), "none");
  // An actual click under the decorative rail reaches the element below it.
  const hit = await page.locator(".reading-progress").evaluate((element) => { const box = element.getBoundingClientRect(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 }; });
  await page.evaluate(({ x, y }) => {
    const button = document.createElement("button"); button.id = "click-probe";
    Object.assign(button.style, { position: "fixed", left: `${x - 10}px`, top: `${y - 10}px`, width: "20px", height: "20px", zIndex: "1" });
    button.onclick = () => { button.dataset.clicked = "true"; }; document.body.append(button);
  }, hit);
  await page.mouse.click(hit.x, hit.y);
  await expect(page.locator("#click-probe")).toHaveAttribute("data-clicked", "true");
  await page.evaluate(() => document.getElementById("click-probe").remove());

  for (const mode of ["system", "manual"]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    if (mode === "system") await page.emulateMedia({ reducedMotion: "reduce" });
    else { await page.emulateMedia({ reducedMotion: "no-preference" }); await page.locator(".motion-toggle").click(); }
    await page.locator(".portrait-frame").hover();
    await expect.poll(() => glow(page)).toBe(0);
    await expect(page.locator(".reading-progress")).toHaveCSS("height", "112px");
    await expect(page.locator(".reading-progress__hilt")).toBeHidden();
    await scroll(page, 1);
    await expect.poll(() => progress(page)).toBe(1);
    const staticEffects = await page.locator(".jedi-portrait").evaluate((element) => element.getAnimations({ subtree: true }).length);
    assert.equal(staticEffects, 0);
    await expect(page.locator(".reading-progress__fill")).toHaveCSS("box-shadow", "none");
    await page.screenshot({ path: `${shots}/reduced-${mode}.png` });
  }
  await page.locator(".motion-toggle").click();

  const touch = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });
  await touch.addInitScript(() => {
    localStorage.setItem("reduce-motion", "false");
    window.pulseStarts = 0;
    document.addEventListener("animationstart", (event) => { if (event.animationName === "jedi-pulse") window.pulseStarts++; });
  });
  const phone = await touch.newPage();
  await phone.goto(`${base}/pt`, { waitUntil: "domcontentloaded" });
  await expect(phone.locator(".reading-progress")).toHaveCSS("height", "112px");
  await phone.locator(".portrait-frame").evaluate((element) => { const rect = element.getBoundingClientRect(); scrollTo(0, scrollY + rect.top - innerHeight + rect.height * .4); });
  await phone.waitForTimeout(700);
  assert.equal(await phone.evaluate(() => window.pulseStarts), 0, "No touch pulse before half of the portrait is visible");
  await phone.locator(".portrait-frame").scrollIntoViewIfNeeded();
  await expect.poll(() => phone.evaluate(() => window.pulseStarts)).toBe(1);
  await phone.locator(".jedi-blade").evaluate((element) => { const animation = element.getAnimations()[0]; if (animation) { animation.pause(); animation.currentTime = 270; } });
  await phone.screenshot({ path: `${shots}/portrait-touch.png` });
  await phone.locator(".jedi-blade").evaluate((element) => { for (const animation of element.getAnimations()) animation.play(); });
  await phone.waitForTimeout(650);
  await expect.poll(() => glow(phone)).toBe(0);
  await scroll(phone, 0);
  await phone.locator(".portrait-frame").scrollIntoViewIfNeeded();
  await phone.waitForTimeout(650);
  assert.equal(await phone.evaluate(() => window.pulseStarts), 1);
  await phone.locator(".trajectory-link").tap();
  await expect(phone).toHaveURL(`${base}/pt/sobre`);
  await expect(phone.locator(".reading-progress")).toHaveCount(0);

  // Cancelling an active pulse must not replay it when motion is re-enabled.
  for (const mode of ["system", "manual"]) {
    await phone.goto(`${base}/pt`, { waitUntil: "domcontentloaded" });
    await phone.locator(".portrait-frame").scrollIntoViewIfNeeded();
    await expect(phone.locator(".jedi-portrait")).toHaveAttribute("data-pulse", "active");
    await expect.poll(() => phone.evaluate(() => window.pulseStarts)).toBe(1);
    if (mode === "system") await phone.emulateMedia({ reducedMotion: "reduce" });
    else await phone.locator(".motion-toggle").click();
    await expect.poll(() => glow(phone)).toBe(0);
    await expect(phone.locator(".jedi-portrait")).toHaveAttribute("data-pulse", "idle");
    if (mode === "system") await phone.emulateMedia({ reducedMotion: "no-preference" });
    else await phone.locator(".motion-toggle").click();
    await phone.waitForTimeout(650);
    assert.equal(await phone.evaluate(() => window.pulseStarts), 1, `${mode}: cancelled pulse must stay consumed`);
  }
  await phone.setViewportSize({ width: 1280, height: 900 });
  await expect(phone.locator(".reading-progress")).toHaveCSS("height", "112px");
  await expect(phone.locator(".reading-progress__hilt")).toBeHidden();
  await touch.close();

  for (const lang of ["pt", "en", "es"]) {
    await page.goto(`${base}/${lang}`, { waitUntil: "domcontentloaded" });
    await page.locator(".trajectory-link").click();
    await expect(page).toHaveURL(`${base}/${lang}/sobre`);
    await expect(page.locator(".reading-progress")).toHaveCount(0);
    await page.goBack();
    await expect(page.locator(".reading-progress")).toHaveCount(1);
    await expect.poll(async () => Math.abs(await progress(page) - await page.evaluate(() => scrollY / (document.documentElement.scrollHeight - innerHeight)))).toBeLessThan(.001);
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage();
  await staticPage.goto(`${base}/pt`, { waitUntil: "domcontentloaded" });
  await expect(staticPage.locator(".portrait-frame img")).toBeVisible();
  await expect(staticPage.locator(".trajectory-link")).toHaveAttribute("href", "/pt/sobre");
  await expect(staticPage.locator(".reading-progress")).toBeHidden();
  await noJs.close();
  assert.deepEqual(errors, []);
  console.log("PASS: Jedi alignment at 5 widths × 3 languages; hover/focus/touch; progress/resize/content changes; click-through; reduced motion; navigation; no JS.");
} finally { await browser.close(); }
