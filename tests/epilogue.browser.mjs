// User-run only: start the production server separately. BASE_URL may override port 3100.
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, expect } from "@playwright/test";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const key = "galaxia-encantada:eggs:v2";
const route = "alem-da-ultima-orbita";
const eligible = ["focus-lens", "paw-tracks", "rover-scan"];
const copy = {
  pt: { title: "Além da Última Órbita", command: "Além da última órbita", locked: "mais 3 mundos", elsewhere: "Serviços", back: "Voltar ao Observatório", revisit: "Revisitar o epílogo" },
  en: { title: "Beyond the Last Orbit", command: "Beyond the Last Orbit", locked: "3 more worlds", elsewhere: "Services", back: "Back to the Observatory", revisit: "Revisit the epilogue" },
  es: { title: "Más allá de la última órbita", command: "Más allá de la última órbita", locked: "3 mundos más", elsewhere: "Servicios", back: "Volver al Observatorio", revisit: "Volver al epílogo" },
};
const browser = await chromium.launch();
const failures = [];
fs.mkdirSync("docs/screenshots/epilogue", { recursive: true });
async function check(name, run) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const errors = [];
  context.on("page", page => page.on("pageerror", error => errors.push(error.message)));
  try { await run(context); assert.deepEqual(errors, []); console.log(`ok - ${name}`); }
  catch (error) { failures.push(name); console.error(`not ok - ${name}: ${error.stack}`); }
  finally { await context.close(); }
}
const found = page => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? "[]"), key);
async function seed(page, ids) {
  await page.evaluate(({ key, ids }) => {
    localStorage.setItem(key, JSON.stringify(ids));
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(ids) }));
  }, { key, ids });
}
async function command(page, text) {
  await page.locator(".comlink-toggle").click();
  await page.locator("#comlink-input").fill(text);
  await page.locator(".comlink__terminal button").click();
}
async function reset(page) {
  if (!await page.locator(".comlink").evaluate(el => el.open)) await page.locator(".comlink-toggle").click();
  await page.locator(".comlink__reset").click();
  await page.locator(".comlink__reset").click();
}

for (const [lang, text] of Object.entries(copy)) {
  await check(`${lang}: localized gate, radio navigation, revisiting and reset`, async context => {
    const page = await context.newPage();
    await page.goto(`${base}/${lang}/servicos`);
    await expect(page.locator(".epilogue-signal")).toHaveCount(0);
    await command(page, text.command);
    await expect(page.locator(".comlink__feedback")).toContainText(text.locked);
    await page.keyboard.press("Escape");
    await seed(page, ["focus-lens", "wish", "dog-signal"]);
    await expect(page.locator(".epilogue-signal")).toHaveCount(0);
    await seed(page, eligible);
    await expect(page.locator(".epilogue-signal button")).toBeVisible();
    await command(page, text.command);
    await expect(page).toHaveURL(`${base}/${lang}/${route}`);
    await expect(page.locator("h1")).toHaveText(text.title);
    assert.ok((await found(page)).includes("epilogue-signal"));
    await expect(page.locator("#epilogue-finale")).toBeHidden();
    const star = page.locator(".beyond-orbit__star");
    await star.focus(); await expect(star).toBeFocused(); await page.keyboard.press("Enter");
    await expect(page.locator("#epilogue-finale")).toBeVisible();
    await expect.poll(() => found(page)).toContain("last-light");
    await page.reload();
    await expect(page.locator("#epilogue-finale")).toBeVisible();
    await command(page, "last light");
    await expect.poll(() => page.locator("#epilogue-finale").evaluate(el => el.getAnimations().some(animation => animation.playState === "running"))).toBe(true);
    await expect(page.locator(".comlink")).not.toBeVisible();
    assert.equal((await found(page)).filter(id => id === "last-light").length, 1);
    await page.locator(".comlink-toggle").click();
    await expect(page.getByRole("link", { name: text.revisit })).toHaveAttribute("href", `/${lang}/${route}`);
    await page.getByRole("link", { name: text.revisit }).click();
    await expect(page.locator(".comlink")).not.toBeVisible();
    await reset(page);
    await expect(page.getByRole("link", { name: text.revisit })).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.locator("#epilogue-finale")).toBeHidden();
    await command(page, text.command);
    await expect(page.locator(".comlink__feedback")).toContainText(text.elsewhere);
  });
}

for (const width of [390, 1440]) await check(`${width}: direct link, layout, keyboard, resize and motion preference`, async context => {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${base}/pt/${route}`);
  await expect(page.locator("#epilogue-finale")).toBeHidden();
  assert.deepEqual(await found(page), []);
  await expect(page.locator(".beyond-orbit__plate")).toBeVisible();
  await expect.poll(() => page.locator(".beyond-orbit__plate").evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  const scene = page.locator(".beyond-orbit__scene");
  await scene.scrollIntoViewIfNeeded();
  const experience = page.locator(".beyond-orbit__experience");
  await expect(experience).toHaveAttribute("data-floating", "running");
  const glaucia = page.locator('[data-orbit-actor="glaucia"]');
  const prince = page.locator('[data-orbit-actor="prince"]');
  const before = await glaucia.getAttribute("style");
  await expect.poll(() => glaucia.getAttribute("style")).not.toBe(before);
  const womanBox = await glaucia.locator("span").boundingBox();
  const dogBox = await prince.locator("span").boundingBox();
  assert.ok(womanBox.x + womanBox.width < dogBox.x);
  assert.ok(dogBox.height < womanBox.height * .65);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex, nofollow/);
  await expect(page.locator(`#primary-navigation a[href$="/${route}"]`)).toHaveCount(0);
  const star = page.locator(".beyond-orbit__star");
  const box = await star.boundingBox();
  assert.ok(box.width >= 44 && box.height >= 44);
  await star.focus();
  assert.notEqual(await star.evaluate(el => getComputedStyle(el).outlineStyle), "none");
  await page.keyboard.press("Space");
  await expect(page.locator("#epilogue-finale")).toBeVisible();
  assert.ok(!(await found(page)).includes("epilogue-signal"));
  await page.screenshot({ path: `docs/screenshots/epilogue/pt-${width}.png`, fullPage: true, animations: "disabled" });
  for (const size of [{ width: 390, height: 844 }, { width: 1440, height: 600 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(size);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const visual = await page.locator(".beyond-orbit__scene").boundingBox();
    assert.ok(Math.abs(visual.width / visual.height - 16 / 9) < .01);
    // The frame crops the 16:9 stage like a cover: whole screen below the menu on wide desktops, 4:5 in portrait.
    const frame = await page.locator(".beyond-orbit__frame").boundingBox();
    const menu = await page.locator(".site-header").boundingBox();
    if (size.width >= 1200 && size.height >= 680) assert.ok(Math.abs(frame.height - (size.height - menu.height)) < 2 && frame.width === size.width);
    else if (size.width / size.height <= .75) assert.ok(Math.abs(frame.width / frame.height - .8) < .01);
    else assert.ok(Math.abs(frame.width / frame.height - 16 / 9) < .01);
    assert.ok(visual.width >= frame.width - 1 && visual.height >= frame.height - 1);
    if (size.width < 1200 || size.height < 680) {
      const text = await page.locator(".beyond-orbit__copy").boundingBox();
      assert.ok(text.y + text.height <= visual.y + 1);
    }
  }
  await reset(page); await page.keyboard.press("Escape");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#epilogue-finale")).toBeVisible();
  await expect(experience).not.toHaveAttribute("data-floating", "running");
  await expect.poll(() => glaucia.evaluate(el => el.style.transform)).toBe("");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("#epilogue-finale")).toBeHidden();
  await page.evaluate(() => document.documentElement.classList.add("reduce-motion"));
  await expect(page.locator("#epilogue-finale")).toBeVisible();
  await expect(experience).not.toHaveAttribute("data-floating", "running");
});

await check("floating pauses offscreen and resumes; hoses stay attached after resizing", async context => {
  const page = await context.newPage();
  await page.setViewportSize({ width: 390, height: 400 });
  await page.goto(`${base}/pt/${route}`);
  const experience = page.locator(".beyond-orbit__experience");
  await page.locator(".beyond-orbit__scene").scrollIntoViewIfNeeded();
  await expect(experience).toHaveAttribute("data-floating", "running");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(experience).toHaveAttribute("data-floating", "paused");
  await page.locator(".beyond-orbit__scene").scrollIntoViewIfNeeded();
  await expect(experience).toHaveAttribute("data-floating", "running");
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator(".beyond-orbit__scene").scrollIntoViewIfNeeded();
    await expect(experience).toHaveAttribute("data-floating", "running");
    await expect.poll(() => page.evaluate(() => {
      const plane = document.querySelector(".beyond-orbit__scene").getBoundingClientRect();
      return ["glaucia", "prince"].every(actor => {
        const node = document.querySelector(`[data-orbit-actor="${actor}"]`);
        const transform = new DOMMatrix(getComputedStyle(node).transform);
        const point = document.querySelector(`[data-cable="${actor}"]`).getPointAtLength(0);
        const x = Number.parseFloat(node.style.left) / 100 * plane.width + transform.e;
        const y = Number.parseFloat(node.style.top) / 100 * plane.height + transform.f;
        return Math.abs(point.x / 1600 * plane.width - x) < 1 && Math.abs(point.y / 900 * plane.height - y) < 1;
      });
    })).toBe(true);
  }
});

await check("cross-tab unlock, discovery and reset; listeners leave with the route", async context => {
  const services = await context.newPage(); const epilogue = await context.newPage();
  await services.goto(`${base}/pt/servicos`); await epilogue.goto(`${base}/pt/${route}`);
  await seed(epilogue, eligible);
  await expect(services.locator(".epilogue-signal button")).toBeVisible();
  await services.locator(".epilogue-signal button").focus(); await services.keyboard.press("Space");
  await expect(services).toHaveURL(`${base}/pt/${route}`);
  await services.locator(".beyond-orbit__star").click();
  await expect(epilogue.locator("#epilogue-finale")).toBeVisible();
  await reset(services);
  await expect(epilogue.locator("#epilogue-finale")).toBeHidden();
  await services.keyboard.press("Escape");
  // Client navigation retains the document, exposing any leaked last-light listener.
  await services.getByRole("link", { name: copy.pt.back, exact: true }).click();
  await expect(services).toHaveURL(`${base}/pt`);
  await services.evaluate(() => window.dispatchEvent(new CustomEvent("egg:play", { detail: "last-light" })));
  assert.ok(!(await found(services)).includes("last-light"));
});

await check("touch signal and touch star", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  try {
    const page = await context.newPage(); await page.goto(`${base}/pt/servicos`); await seed(page, eligible);
    await page.locator(".epilogue-signal button").tap();
    await expect(page).toHaveURL(`${base}/pt/${route}`);
    await page.locator(".beyond-orbit__star").tap();
    await expect(page.locator("#epilogue-finale")).toBeVisible();
  } finally { await context.close(); }
});

for (const lang of Object.keys(copy)) await check(`${lang}: no JavaScript keeps finale and return link visible`, async () => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage(); await page.goto(`${base}/${lang}/${route}`);
    await expect(page.locator("#epilogue-finale")).toBeVisible();
    await expect(page.locator("#epilogue-finale")).toContainText("To be continued…");
    await expect(page.locator(".beyond-orbit__plate")).toBeVisible();
    await expect(page.locator('[data-orbit-actor="glaucia"] span')).toBeVisible();
    await expect(page.locator('[data-orbit-actor="prince"] span')).toBeVisible();
    await expect(page.getByRole("link", { name: copy[lang].back, exact: true })).toHaveAttribute("href", `/${lang}`);
  } finally { await context.close(); }
});

await check("blocked storage preserves this visit's reveal and reset", async context => {
  await context.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw Error("blocked storage"); } }));
  const page = await context.newPage(); await page.goto(`${base}/pt/${route}`);
  await page.locator(".beyond-orbit__star").click();
  await expect(page.locator("#epilogue-finale")).toBeVisible();
  await reset(page); await page.keyboard.press("Escape");
  await expect(page.locator("#epilogue-finale")).toBeHidden();
});

for (const width of [390, 1440]) await check(`${width}: "A Última Luz" plays as cinema, can be skipped and lands on the static finale`, async context => {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: width < 1200 ? 844 : 900 });
  await page.goto(`${base}/pt/${route}`);
  await seed(page, ["focus-lens", "paw-tracks", "rover-scan", "first-page"]);
  const experience = page.locator(".beyond-orbit__experience");
  await expect(experience).toHaveAttribute("data-motion", "on");
  await expect(page.locator(".beyond-orbit__voyage")).toBeHidden();
  await expect(page.locator(".beyond-orbit__hint")).toBeVisible();
  await page.locator(".beyond-orbit__star").click();
  await expect(experience).toHaveAttribute("data-theater", "on");
  await expect(page.locator(".beyond-orbit__skip")).toBeVisible();
  await expect(experience).toHaveAttribute("data-beat", "nova", { timeout: 4000 });
  await expect(experience).toHaveAttribute("data-beat", "constellation", { timeout: 6000 });
  // The four seeded secrets plus last-light itself.
  await expect.poll(() => page.locator(".beyond-orbit__node[data-on]").count()).toBe(5);
  await expect(experience).toHaveAttribute("data-beat", "slam", { timeout: 8000 });
  await expect(experience).toHaveAttribute("data-beat", "credits", { timeout: 8000 });
  await expect(page.locator(".beyond-orbit__roll-track dt").first()).toHaveText("Direção, roteiro e código");
  await page.screenshot({ path: `docs/screenshots/epilogue/credits-${width}.png` });
  await page.locator(".beyond-orbit__skip").click();
  await expect(experience).not.toHaveAttribute("data-theater", "on");
  await expect(page.locator("#epilogue-finale")).toBeVisible();
  await expect(page.locator(".beyond-orbit__credits")).toContainText(/5 de \d+ segredos/);
  await expect(page.locator(".beyond-orbit__post")).toContainText("Aurélia");
  assert.equal(await page.locator(".beyond-orbit__roll-track").evaluate(el => el.childElementCount), 0);
  // Esc also ends a replay at once.
  await page.locator(".beyond-orbit__star").click();
  await expect(experience).toHaveAttribute("data-theater", "on");
  await page.keyboard.press("Escape");
  await expect(experience).not.toHaveAttribute("data-theater", "on");
  if (width >= 1200) {
    await page.evaluate(() => scrollTo(0, innerHeight));
    await expect.poll(() => page.locator('[data-depth="plate"]').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a)).toBeGreaterThan(1.05);
  }
  await page.screenshot({ path: `docs/screenshots/epilogue/after-${width}.png` });

  // The voyage below: letter, atlas (moons = secrets found), credits and the next star.
  await expect(page.locator(".beyond-orbit__hint")).toHaveCount(0);
  const voyage = page.locator(".beyond-orbit__voyage");
  await expect(voyage).toBeVisible();
  await expect(voyage).toHaveAttribute("data-motion", "on");
  // The letter: one sentence at a time, always whole on screen (phone, phone landscape, tablet, desktop).
  const letter = page.locator(".beyond-orbit__letter");
  await expect(letter).toHaveAttribute("data-cinema", "on");
  for (const size of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 820, height: 1180 }, { width, height: width < 1200 ? 844 : 900 }]) {
    await page.setViewportSize(size);
    for (const fraction of [.05, .5, .95]) {
      await page.evaluate(fraction => { const box = document.querySelector(".beyond-orbit__letter"); scrollTo(0, box.getBoundingClientRect().top + scrollY + (box.offsetHeight - innerHeight) * fraction); }, fraction);
      await page.waitForTimeout(700);
      const fits = await page.evaluate(() => [...document.querySelectorAll(".beyond-orbit__letter [data-line]")]
        .filter(line => Number(getComputedStyle(line).opacity) > .6)
        .every(line => { const box = line.getBoundingClientRect(); return box.top >= 0 && box.bottom <= innerHeight && box.left >= 0 && box.right <= innerWidth; }));
      assert.ok(fits, `letter line overflows at ${size.width}×${size.height}, ${fraction}`);
    }
  }
  await expect(page.locator(".beyond-orbit__credits-run")).toHaveAttribute("data-cinema", "on");
  await expect(page.locator('[data-world="home"] .beyond-orbit__moons i[data-found]')).toHaveCount(1);
  await expect(page.locator('[data-world="services"]')).not.toHaveAttribute("data-charted", /.*/);
  if (width >= 1200) await expect(page.locator(".beyond-orbit__atlas")).toHaveAttribute("data-flight", "on");
  else await expect(page.locator(".beyond-orbit__atlas")).not.toHaveAttribute("data-flight", /.*/);
  if (width < 1200) {
    await page.locator('[data-world="about"] .beyond-orbit__hints summary').click();
    await expect(page.locator('[data-world="about"] .beyond-orbit__hints li').first()).toBeVisible();
  }
  const next = page.locator(".beyond-orbit__next-star");
  await next.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `docs/screenshots/epilogue/voyage-${width}.png` });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await next.click();
  await expect(experience).toHaveAttribute("data-theater", "on");
  await page.locator(".beyond-orbit__skip").click();
});

await browser.close();
if (failures.length) { console.error(failures); process.exitCode = 1; }
