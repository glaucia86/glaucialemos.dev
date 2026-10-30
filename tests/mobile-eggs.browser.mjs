// Parent-run only: BASE_URL=http://127.0.0.1:3100 node tests/run-browser.mjs mobile-eggs
// No direct emitEgg calls or CSS pan writes: activation and panning use real touch input.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { expect } from "@playwright/test";
import { baseURL, launchBrowser } from "./browser-utils.mjs";

const worlds = [
  ["home", "/pt", 8], ["about", "/pt/sobre", 8], ["projects", "/pt/projetos", 8],
  ["content", "/pt/conteudo", 8], ["events", "/pt/eventos", 7], ["services", "/pt/servicos", 8],
  ["notfound", "/pt/rota-inexistente", 2], ["epilogue", "/pt/alem-da-ultima-orbita", 0],
];
const seed = ["focus-lens", "paw-tracks", "rover-scan"];
const mobileOptions = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "no-preference" };
const ui = [".mobile-eggs", ".mobile-comlink-sheet[open]", ".mobile-egg-narrative", ".comlink-fresh",
  ".egg-meteors", ".egg-harvest", ".egg-selfie", ".niveora-status", ".mars-status", ".lumina-status",
  ".atlas-status", ".service-garden__status", ".series__status", ".egg-night", ".curious-letter[open]",
  ".egg-overlay[open]", "[role='alert']", "[class*='toast']"].join(",");
const counters = [".comlink-toggle__count", ".secrets-guide", ".comlink__progress", ".sky-counters",
  ".niveora-discoveries", ".mars-discoveries", ".lumina-discoveries", ".atlas-discoveries", ".aurelia-discoveries",
  ".ignition-meter", ".observatory-countdown", ".transmission__lights", ".transmission__worlds", ".transmission__locked"].join(",");
const browser = await launchBrowser();
const results = [];
const coverage = new Set();

async function context(options = {}, progress = seed) {
  const ctx = await browser.newContext({ ...mobileOptions, ...options });
  await ctx.addInitScript(({ progress }) => {
    for (const key of ["galaxia-boot", "niveora-boot", "marte-boot", "lumina-boot", "atlas-boot", "aurelia-boot"]) sessionStorage.setItem(key, "done");
    localStorage.setItem("galaxia-encantada:eggs:v2", JSON.stringify(progress));
    localStorage.setItem("sound-invite-seen", "1");
    localStorage.setItem("comlink-hint-seen", "1");
    localStorage.setItem("reduce-motion", "false");
    window.__mobileEggPlays = [];
    window.__mobileReveals = [];
    window.addEventListener("egg:play", event => window.__mobileEggPlays.push(event.detail));
    window.addEventListener("mobile-eggs:reveal", event => window.__mobileReveals.push(event.detail));
  }, { progress });
  return ctx;
}

async function check(name, run) {
  try { await run(); results.push({ name, passed: true }); console.log(`PASS: ${name}`); }
  catch (error) { results.push({ name, passed: false, error: error.stack }); console.error(`FAIL: ${name}: ${error.message}`); }
}

async function visit(page, route, world, reduced = false) {
  await page.goto(`${baseURL}${route}`);
  const layer = page.locator(`.mobile-eggs[data-world="${world}"]`);
  await expect(layer).toBeVisible();
  await expect(layer).toHaveAttribute("data-motion", String(!reduced));
  // Vertical scrolling only; horizontal positioning below must exercise the real pan handler.
  await layer.evaluate(node => node.scrollIntoView({ block: "center", behavior: "instant" }));
  return layer;
}

async function touchDrag(page, cdp, from, to) {
  const point = (x, y) => [{ x, y, id: 1, radiusX: 2, radiusY: 2, force: 1 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: point(from.x, from.y) });
  for (let step = 1; step <= 10; step++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: point(from.x + (to.x - from.x) * step / 10, from.y + (to.y - from.y) * step / 10) });
    await page.waitForTimeout(16); // Real gesture samples, not animation-stability polling.
  }
  await page.waitForTimeout(120); // Release at rest: do not introduce inertia into a positioning assertion.
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function panTo(page, cdp, target) {
  const layer = page.locator(".mobile-eggs");
  await layer.evaluate(node => node.scrollIntoView({ block: "center", behavior: "instant" }));
  let dragged = false;
  for (let attempt = 0; attempt < 16; attempt++) {
    const box = await target.boundingBox();
    assert.ok(box, "hotspot must have a box");
    const x = box.x + box.width / 2;
    if (x >= 60 && x <= 330) {
      if (dragged) await page.waitForTimeout(850); // Production click suppression after a pan is 800 ms.
      assert.ok(box.y + box.height / 2 > 0 && box.y + box.height / 2 < 844, "hotspot center is vertically visible");
      return;
    }
    const frame = await layer.boundingBox();
    assert.ok(frame);
    const y = Math.max(120, Math.min(740, frame.y + frame.height * .62));
    const from = x < 60 ? 75 : 315;
    const dx = Math.max(-235, Math.min(235, 195 - x));
    await touchDrag(page, cdp, { x: from, y }, { x: from + dx, y });
    dragged = true;
  }
  assert.fail(`Touch panning could not reveal ${await target.getAttribute("data-egg") || "last-light"}`);
}

async function press(page, cdp, target) {
  const box = await target.boundingBox();
  assert.ok(box);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1 }] });
  await page.waitForTimeout(1100); // Must exceed the real hold timer, without a synthetic click.
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function anonymousUI(page) {
  const findings = await page.evaluate(({ ui, counters }) => {
    const visible = node => node.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    const digits = [];
    for (const root of document.querySelectorAll(ui)) {
      for (const node of [root, ...root.querySelectorAll("*")]) {
        if (!visible(node)) continue;
        const text = `${node.innerText || ""} ${node.getAttribute("aria-label") || ""}`;
        if (/[0-9]/.test(text)) digits.push({ selector: node.className, text });
      }
    }
    return {
      digits, counters: [...document.querySelectorAll(counters)].filter(visible).map(node => node.className),
      marks: [...document.querySelectorAll(".mobile-eggs [data-found], .mobile-comlink-sheet [data-found]")].length,
      width: document.documentElement.scrollWidth, viewport: innerWidth,
    };
  }, { ui, counters });
  assert.deepEqual(findings.digits, [], "mobile hints and notifications must contain no digits, including accessible labels");
  assert.deepEqual(findings.counters, [], "discovery counters must be hidden");
  assert.equal(findings.marks, 0, "no found markers in mobile discovery UI");
  assert.ok(findings.width <= findings.viewport, `horizontal overflow: ${findings.width} > ${findings.viewport}`);
}

async function activate(page, cdp, id, kind) {
  const target = page.locator(`.mobile-eggs__hot[data-egg="${id}"]`);
  await panTo(page, cdp, target);
  await target.tap({ force: true }); // Actor animation must not block Playwright's stability check.
  const tooltip = page.locator(".mobile-eggs__tooltip");
  await expect(tooltip).toHaveAttribute("data-visible", "true");
  assert.deepEqual(await page.evaluate(() => window.__mobileEggPlays), [], "first tap must only reveal a hint");
  assert.doesNotMatch(await tooltip.innerText(), /[0-9]/);
  const hint = await tooltip.evaluate(node => node.firstChild?.textContent || "");
  await anonymousUI(page);
  if (kind === "hold") await press(page, cdp, target);
  else await target.tap({ force: true });
  await expect.poll(() => page.evaluate(() => window.__mobileEggPlays)).toEqual([id]);
  // Owners can scroll to their puzzle, show a modal, or navigate to the epilogue.
  await expect(page.locator(".mobile-eggs__tooltip")).toHaveText("");
  await expect(page.locator(".mobile-eggs__tooltip")).not.toHaveAttribute("data-visible", "true");
  await expect(page.locator(".mobile-eggs [data-holding], .mobile-eggs [data-reveal], .mobile-eggs[data-scan]")).toHaveCount(0);
  const dialogs = { "star-map": ".egg-overlay", "lost-commit": ".egg-dialog:not(.egg-selfie)", "orbital-selfie": ".egg-selfie", "curious-letter": ".curious-letter", "lost-bug": ".circuit" };
  if (dialogs[id]) await expect(page.locator(`${dialogs[id]}[open]`)).toBeVisible();
  if (id === "proposal-harvest") await expect(page.locator(".egg-harvest")).toBeVisible();
  if (id === "meteor-shower") await expect(page.locator(".egg-meteors")).toBeVisible();
  if (id === "dark-sky") await expect(page.locator(".page-hero")).toHaveAttribute("data-sky", "dark");
  if (id === "epilogue-signal") await expect(page).toHaveURL(`${baseURL}/pt/alem-da-ultima-orbita`);
  if (id === "snowdrift" && await page.locator(".mobile-eggs").getAttribute("data-motion") === "true") {
    await expect(page.locator(".about-page")).toHaveAttribute("data-settled", "true");
  }
  if (id === "pollination") {
    await expect(page.locator(".aurelia-cards article[data-lit]")).not.toHaveCount(0);
    await anonymousUI(page);
    await expect(page.locator(".aurelia-cards article[data-lit]")).toHaveCount(0, { timeout: 5500 });
  }
  if (id === "deep-night") {
    await expect(page.locator("html")).toHaveAttribute("data-deep-night", "on");
    await touchDrag(page, cdp, { x: 150, y: 420 }, { x: 230, y: 450 });
    assert.equal(await page.locator("html").evaluate(node => node.style.getPropertyValue("--night-x")), "230px");
    await page.locator(".egg-night button").tap({ force: true });
    await expect(page.locator("html")).not.toHaveAttribute("data-deep-night", "on");
    assert.equal(await page.locator("html").evaluate(node => node.style.getPropertyValue("--night-x")), "");
  }
  await anonymousUI(page);
  coverage.add(id);
  return hint;
}

async function sheetChecks(page, cdp, expectedHints, finale) {
  const opener = page.locator(".comlink-toggle");
  await opener.focus();
  await opener.tap({ force: true });
  const sheet = page.locator(".mobile-comlink-sheet");
  await expect(sheet).toBeVisible();
  const rows = sheet.locator("li button");
  const order = await rows.allTextContents();
  assert.equal(order.length, finale ? 1 : expectedHints.length);
  if (!finale) assert.deepEqual([...order].sort(), [...expectedHints].sort(), "sheet is exactly this world's hints, including its assigned global egg");
  assert.ok((await sheet.boundingBox()).height <= 844 * .7 + 2, "sheet is capped at seventy percent of the viewport");
  await anonymousUI(page);
  const close = sheet.locator("header button");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(rows.last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(sheet).not.toBeVisible();
  await expect(opener).toBeFocused();
  // The dock uses comlink:open; verify it reaches the same sheet and preserves session ordering.
  await page.locator(".mobile-eggs__comlink").tap({ force: true });
  await expect(sheet).toBeVisible();
  assert.deepEqual(await rows.allTextContents(), order);
  await rows.first().tap({ force: true });
  await expect(sheet).not.toBeVisible();
  const id = await page.evaluate(() => window.__mobileReveals.at(-1));
  assert.ok(id);
  const target = finale ? page.locator(".beyond-orbit__star") : page.locator(`.mobile-eggs__hot[data-egg="${id}"]`);
  const box = await target.boundingBox();
  assert.ok(box && box.x + box.width / 2 >= 30 && box.x + box.width / 2 <= 360, "hint selection pans into view");
  await expect(page.locator(".mobile-eggs")).toHaveAttribute("data-revealing", id);
  await expect(page.locator(".mobile-eggs__tooltip")).toHaveText("");
  assert.deepEqual(await page.evaluate(() => window.__mobileEggPlays), [], "sheet selection must never activate an egg");
  await expect(page.locator(".mobile-eggs")).not.toHaveAttribute("data-revealing", id, { timeout: 2500 });
  await opener.tap({ force: true });
  const head = await sheet.locator("header").boundingBox();
  await touchDrag(page, cdp, { x: 110, y: head.y + 15 }, { x: 110, y: head.y + 100 });
  await expect(sheet).not.toBeVisible();
  await opener.tap({ force: true });
  const bounds = await sheet.boundingBox();
  await page.touchscreen.tap(10, bounds.y - 20);
  await expect(sheet).not.toBeVisible();
  await opener.tap({ force: true });
  await close.tap({ force: true });
  await expect(sheet).not.toBeVisible();
  await page.reload();
  await expect(page.locator(".mobile-eggs")).toBeVisible();
  await opener.tap({ force: true });
  await expect(sheet).toBeVisible();
  assert.deepEqual(await rows.allTextContents(), order, "session shuffle survives remounts and reloads");
}

try {
  const ctx = await context();
  try {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const cdp = await ctx.newCDPSession(page);
    for (const [world, route, count] of worlds) {
      let hotspots = [];
      const hints = [];
      await check(`${world}: inventory and clean viewport`, async () => {
        await visit(page, route, world);
        // DOM is the tiny runtime copy of MOBILE_HOTSPOTS; do not duplicate ids in this test.
        hotspots = await page.locator(".mobile-eggs__hot[data-egg]").evaluateAll(nodes => nodes.map(node => ({ id: node.dataset.egg, kind: node.dataset.kind })));
        assert.equal(hotspots.length, count);
        await anonymousUI(page);
      });
      for (const { id, kind } of hotspots) await check(`${world}: ${id} via touch`, async () => {
        // Reload between owners: an in-flight story must not swallow the next owner's activation.
        await visit(page, route, world);
        hints.push(await activate(page, cdp, id, kind));
      });
      await check(`${world}: radio sheet, reveal and dismissal`, async () => {
        await visit(page, route, world);
        await sheetChecks(page, cdp, hints, world === "epilogue");
      });
      if (world === "epilogue") await check("epilogue: existing star is a single-tap finale, without Scan", async () => {
        await visit(page, route, world);
        await expect(page.locator(".mobile-eggs__scan")).toHaveCount(0);
        const star = page.locator(".beyond-orbit__star");
        await panTo(page, cdp, star);
        const box = await star.boundingBox();
        assert.ok(box.width >= 60 && box.height >= 60);
        await star.tap({ force: true });
        await expect.poll(() => page.evaluate(() => window.__mobileEggPlays)).toEqual(["last-light"]);
        await expect(page.locator(".mobile-eggs__tooltip")).toHaveText("");
        await anonymousUI(page);
        coverage.add("last-light");
      });
    }
    await check("catalog: every egg has been activated through touch", async () => assert.equal(coverage.size, 50));
  } finally { await ctx.close(); }

  const locked = await context({}, []);
  try {
    const page = await locked.newPage();
    const cdp = await locked.newCDPSession(page);
    for (const [world, route, id] of [["content", "/pt/conteudo", "curious-letter"], ["services", "/pt/servicos", "epilogue-signal"]]) {
      await check(`${id}: locked hint stays anonymous and emits nothing`, async () => {
        await visit(page, route, world);
        const target = page.locator(`.mobile-eggs__hot[data-egg="${id}"]`);
        await panTo(page, cdp, target);
        await target.tap({ force: true });
        const tip = page.locator(".mobile-eggs__tooltip");
        await expect(tip).toHaveAttribute("data-visible", "true");
        const hint = await tip.innerText();
        await target.tap({ force: true });
        await expect(tip).not.toHaveText(hint);
        assert.deepEqual(await page.evaluate(() => window.__mobileEggPlays), []);
        await anonymousUI(page);
      });
    }
  } finally { await locked.close(); }

  const reduced = await context({ reducedMotion: "reduce" });
  try {
    const page = await reduced.newPage();
    const cdp = await reduced.newCDPSession(page);
    for (const [world, route, id] of [["home", "/pt", "dog-signal"], ["about", "/pt/sobre", "snowdrift"], ["home", "/pt", "star-map"]]) {
      await check(`${id}: reduced-motion owner remains playable`, async () => {
        await visit(page, route, world, true);
        await activate(page, cdp, id, "tap");
        if (id === "star-map") await expect(page.locator(".egg-overlay[open]")).toBeVisible();
        else {
          await expect(page.locator(".mobile-egg-narrative")).toBeVisible();
          await expect(page.locator(".mobile-egg-narrative")).toHaveCount(0, { timeout: 5500 });
        }
        await visit(page, route, world, true);
        await page.locator(".comlink-toggle").tap({ force: true });
        assert.equal(await page.locator(".mobile-comlink-sheet").evaluate(node => getComputedStyle(node).animationName), "none");
      });
    }
  } finally { await reduced.close(); }

  const desktop = await context({ viewport: { width: 1440, height: 900 }, hasTouch: false, isMobile: false });
  try {
    await check("desktop: original Comlink dialog remains available", async () => {
      const page = await desktop.newPage();
      await page.goto(`${baseURL}/pt`);
      await page.locator(".comlink-toggle").click();
      await expect(page.locator("dialog.comlink")).toBeVisible();
      await expect(page.locator(".mobile-comlink-sheet")).toHaveCount(0);
      await expect(page.locator(".mobile-eggs")).toHaveCount(0);
    });
  } finally { await desktop.close(); }
} finally {
  await browser.close();
  await mkdir("test-results", { recursive: true });
  await writeFile("test-results/mobile-eggs.json", JSON.stringify({ results, activated: [...coverage] }, null, 2));
}
if (results.some(result => !result.passed)) process.exitCode = 1;
