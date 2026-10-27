import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit, devices } from "playwright";
import { mockContact } from "./contact-browser-mocks.mjs";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const output = "test-results/responsiveness";
await mkdir(output, { recursive: true });
const widths = [320, 360, 390, 430, 768, 820, 1024, 1280, 1366, 1440, 1920];
const routes = ["", "sobre", "projetos", "conteudo", "eventos", "servicos", "missing-responsive-page"];
const failures = [];

// Audit text and controls through every clipping ancestor, not only document width.
async function audit(page) {
  return page.evaluate(() => {
    const issues = [];
    const visible = (el) => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && !el.closest('[aria-hidden="true"], .sr-only, .skip-link');
    for (const el of document.querySelectorAll("h1,h2,h3,p,label,button,input,select,textarea,summary,main a")) {
      if (!visible(el)) continue;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const name = `${el.tagName}.${el.className}: ${el.textContent?.trim().slice(0, 60)}`;
      if (rect.left < -2 || rect.right > innerWidth + 2) issues.push(`outside viewport: ${name}`);
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "auto" && el.clientWidth) issues.push(`internal overflow: ${name}`);
      if (el.scrollHeight > el.clientHeight + 2 && ["hidden", "clip"].includes(getComputedStyle(el).overflowY)) issues.push(`text cut off: ${name}`);
      for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const css = getComputedStyle(parent);
        const box = parent.getBoundingClientRect();
        if (["hidden", "clip"].includes(css.overflowX) && (rect.left < box.left - 2 || rect.right > box.right + 2)) issues.push(`clipped horizontally: ${name}`);
        if (["hidden", "clip"].includes(css.overflowY) && (rect.top < box.top - 2 || rect.bottom > box.bottom + 2)) issues.push(`clipped vertically: ${name}`);
      }
    }
    const controls = [...document.querySelectorAll(".site-header button,.site-header select,.site-header .brand")].filter(visible);
    for (let i = 0; i < controls.length; i++) {
      const a = controls[i].getBoundingClientRect();
      if (a.width < 43.5 || a.height < 43.5) issues.push(`small header target: ${controls[i].className}`);
      for (const other of controls.slice(i + 1)) {
        const b = other.getBoundingClientRect();
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) issues.push("overlapping header controls");
      }
    }
    // Check ordinary UI groups too; decorative scene hotspots intentionally overlay art.
    for (const group of document.querySelectorAll('.page-hero__content, .contact-panel, .event-search, .shelves__controls, .archive__controls, .comlink__head')) {
      const elements = [...group.querySelectorAll('h1,h2,p,button,a,input,select,textarea')].filter(visible);
      for (let i = 0; i < elements.length; i++) for (const other of elements.slice(i + 1)) {
        const el = elements[i];
        if (el.contains(other) || other.contains(el)) continue;
        const a = el.getBoundingClientRect(); const b = other.getBoundingClientRect();
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) issues.push(`content/control overlap: ${el.className} / ${other.className}`);
      }
    }
    const modal = document.querySelector("dialog[open]");
    if (modal) {
      const box = modal.getBoundingClientRect();
      const viewport = window.visualViewport;
      if (box.top < (viewport?.offsetTop ?? 0) - 2 || box.bottom > (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight) + 2) issues.push("dialog outside visible viewport");
    }
    return [...new Set(issues)];
  });
}

for (const engine of (process.env.BROWSER_ENGINE === "webkit" ? [webkit] : [chromium])) {
  const browser = await engine.launch();
  try {
    const cases = widths.map(width => ({ name: `${width}`, viewport: { width, height: 900 } }));
    cases.push(...[
      { name: "landscape", viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true },
      { name: "short-laptop", viewport: { width: 1366, height: 600 } },
      { name: "boundary-below", viewport: { width: 1199, height: 680 } },
      { name: "boundary-at", viewport: { width: 1200, height: 680 } },
      { name: "boundary-short", viewport: { width: 1200, height: 679 } },
      { name: "zoom-200-reflow", viewport: { width: 720, height: 450 } },
      { name: "android", ...devices["Pixel 7"] },
      { name: "ios", ...devices["iPhone 13"] },
    ]);
    for (const locale of ["pt", "en", "es"]) for (const route of routes) for (const testCase of cases) {
      const { name, ...options } = testCase;
      delete options.defaultBrowserType;
      const id = `${engine.name()}-${locale}-${route || "home"}-${name}`;
      const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
      const page = await context.newPage();
      try {
        await page.goto(`${base}/${locale}/${route}`, { waitUntil: "networkidle" });
        await page.keyboard.press("Escape");
        await page.evaluate(() => document.fonts.ready);
        const problems = await audit(page);
        assert.deepEqual(problems, [], problems.join("\n"));
        if (options.viewport.width < 1440) {
          await page.locator(".menu-toggle").click();
          assert.ok(await page.locator("nav a").first().evaluate(el => el === document.activeElement));
          assert.ok(await page.locator("nav .motion-toggle").isVisible());
          assert.deepEqual(await audit(page), []);
          await page.keyboard.press("Escape");
          assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "false");
        }
        await page.locator(".comlink-toggle").click();
        assert.ok(await page.locator(".comlink[open]").isVisible());
        assert.deepEqual(await audit(page), []);
        await page.keyboard.press("Escape");
        const compact = await page.evaluate(() => !matchMedia("(min-width: 1200px) and (min-height: 680px) and (hover: hover) and (pointer: fine)").matches);
        if (compact) {
          const geometry = await page.locator(".page-hero").first().evaluate(el => {
            const img = el.querySelector(".page-hero__image");
            const a = img.getBoundingClientRect();
            const b = el.querySelector(".page-hero__content").getBoundingClientRect();
            const planes = [...el.querySelectorAll('.observatory-plane,.niveora-plane,.mars-plane,.lumina-plane')];
            const aligned = planes.every(plane => {
              const p = plane.getBoundingClientRect();
              return Math.abs(p.left - a.left) < 2 && Math.abs(p.top - a.top) < 2 && Math.abs(p.width - a.width) < 2 && Math.abs(p.height - a.height) < 2;
            });
            return { separated: b.bottom <= a.top + 2, aligned, ratio: a.width / a.height, naturalRatio: img.naturalWidth / img.naturalHeight };
          });
          assert.ok(geometry.separated, "copy overlaps scene");
          assert.ok(geometry.aligned, "effects/hotspot plane does not match plate");
          assert.ok(Math.abs(geometry.ratio - geometry.naturalRatio) < .02, "scene cropped");
        }
        await page.screenshot({ path: `${output}/${id}.png`, fullPage: true });
      } catch (error) {
        failures.push({ id, error: error.message });
        await page.screenshot({ path: `${output}/${id}-failed.png`, fullPage: true });
      } finally { await context.close(); }
    }
    // Live transitions exercise GSAP cleanup; a fresh reduced-motion page cannot do this.
    for (const locale of ["pt", "en", "es"]) for (const route of routes.slice(0, 6)) {
      const id = `${engine.name()}-${locale}-${route || "home"}-interactions`;
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
      const page = await context.newPage();
      try {
        await page.goto(`${base}/${locale}/${route}`, { waitUntil: "networkidle" });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(1600);
        await page.evaluate(() => scrollTo(0, 250));
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(1200);
        assert.equal(await page.locator(".pin-spacer .page-hero").count(), 0, "hero pin survives compact resize");
        await page.setViewportSize({ width: 844, height: 390 });
        await page.waitForTimeout(500);
        assert.equal(await page.locator(".pin-spacer .page-hero").count(), 0);
        await page.evaluate(() => scrollTo(0, 0));
        await page.locator(".menu-toggle").click();
        const toggle = page.locator("nav .motion-toggle");
        await toggle.click();
        assert.equal(await toggle.getAttribute("aria-pressed"), "true");
        await toggle.click();
        assert.equal(await toggle.getAttribute("aria-pressed"), "false");
        await page.keyboard.press("Escape");
        assert.ok(await page.locator(".menu-toggle").evaluate(el => el === document.activeElement));
        const search = page.locator('main input[type="search"]').first();
        if (await search.count()) {
          await search.fill("unusually-long-query-without-spaces-for-responsive-layout");
          await page.waitForTimeout(500);
          await search.fill("");
          const filter = page.locator('.shelves__filter button, .archive__filter button').nth(1);
          if (await filter.count()) await filter.click();
          const select = page.locator("main select").first();
          if (await select.count() && await select.locator("option").count() > 1) await select.selectOption({ index: 1 });
        }
        if (route === "servicos") {
          await mockContact(page, base);
          const name = page.locator('[name="name"]');
          if (await name.isEnabled()) {
            // Three steps: need → who → message.
            await page.locator('[name="service"][value="consultoria"]').check();
            await page.locator(".contact-step__next:visible").click();
            await name.fill("Responsive layout test");
            await page.locator('[name="company"]').fill("Responsive test");
            await page.locator('[name="linkedin"]').fill("https://linkedin.com/in/responsive-test");
            await page.locator(".contact-step__next:visible").click();
            await page.locator('[name="consent"]').check();
            await page.locator('[name="message"]').fill("Long message ".repeat(80));
            await page.locator('.contact-panel button[type="submit"]').click();
            // With motion the submission lifts the form into the full-screen portal; close it before the radio.
            if (await page.locator('.contact-portal[data-open]').count()) {
              await page.waitForTimeout(4000);
              await page.keyboard.press("Escape");
            }
          } else assert.ok(await page.locator(".form-notice").isVisible());
        }
        await page.evaluate(() => scrollTo(0, 0));
        await page.locator(".comlink-toggle").click();
        await page.locator("#comlink-input").fill(route === "" ? "telescopio" : "a long unknown command");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1500);
        if (route === "") {
          assert.ok(await page.locator(".telescope[open]").isVisible());
          await page.locator(".telescope__close").scrollIntoViewIfNeeded();
          await page.locator(".telescope__close").click();
        } else await page.keyboard.press("Escape");
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(1600);
        assert.deepEqual(await audit(page), []);
        await page.screenshot({ path: `${output}/${id}.png`, fullPage: true });
      } catch (error) {
        failures.push({ id, error: error.message });
        await page.screenshot({ path: `${output}/${id}-failed.png`, fullPage: true });
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
}
await writeFile(`${output}/results.json`, JSON.stringify(failures, null, 2));
assert.deepEqual(failures, [], `${failures.length} responsive cases failed; see ${output}/results.json`);
