// HoloNet home: run against a production build (npm run build && npm run start -- --port 3100).
// BASE_URL overrides the server. Screenshots go to docs/screenshots/holonet/.
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const shots = "docs/screenshots/holonet";
fs.mkdirSync(shots, { recursive: true });
const browser = await chromium.launch();
const failures = [];
const check = async (name, run) => { try { await run(); console.log(`ok - ${name}`); } catch (error) { failures.push(name); console.error(`not ok - ${name}\n  ${error.message}`); } };
const open = async (options = {}, locale = "pt") => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
  return { context, page, errors };
};
const visible = (page, selector) => page.locator(selector).first().isVisible();

await check("boot toca uma vez por sessão e ESC pula", async () => {
  const { context, page, errors } = await open();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.ok(await visible(page, ".boot"));
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.documentElement.dataset.boot === "done", null, { timeout: 3000 });
  await page.waitForTimeout(700);
  assert.equal(await visible(page, ".boot"), false);
  await page.reload({ waitUntil: "networkidle" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("boot termina sozinho e libera a rolagem", async () => {
  const { context, page } = await open();
  await page.waitForFunction(() => document.documentElement.dataset.boot === "done", null, { timeout: 6000 });
  assert.notEqual(await page.evaluate(() => getComputedStyle(document.documentElement).overflow), "hidden");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${shots}/hero-1440.png` });
  await context.close();
});

for (const locale of ["pt", "en", "es"]) await check(`conteúdo e capítulos visíveis em ${locale}`, async () => {
  const { context, page, errors } = await open({}, locale);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2600);
  assert.equal(await page.locator("h1").getAttribute("aria-label"), "Glaucia Lemos");
  for (const id of ["#jedi", "#projetos", "#mapa", "#missoes"]) assert.equal(await page.locator(id).count(), 1, id);
  assert.equal(await page.locator(".mission").count(), 3);
  assert.equal(await page.locator(".hero-copy").evaluate((element) => getComputedStyle(element).visibility), "visible");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("Force Push cria a onda de choque e não navega", async () => {
  const { context, page } = await open();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2400);
  await page.mouse.click(860, 420);
  assert.equal(await page.locator(".force-wave").count(), 1);
  assert.match(page.url(), /\/pt$/);
  await page.waitForTimeout(1200);
  assert.equal(await page.locator(".force-wave").count(), 0);
  await context.close();
});

await check("terminal alterna estados acessíveis", async () => {
  const { context, page } = await open({}, "en");
  await page.keyboard.press("Escape");
  await page.locator("#projetos").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Corrected input" }).click();
  assert.equal(await page.locator(".typescript-demo").getAttribute("data-state"), "valid");
  assert.ok(await page.locator("#demo-corrected").isVisible());
  await page.getByRole("button", { name: "Incorrect input" }).click();
  assert.equal(await page.locator(".typescript-demo").getAttribute("data-state"), "invalid");
  await context.close();
});

await check("som fica desligado por padrão e persiste o opt-in", async () => {
  const { context, page } = await open();
  await page.keyboard.press("Escape");
  const toggle = page.locator(".sound-toggle");
  assert.equal(await toggle.getAttribute("aria-pressed"), "false");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-pressed"), "true");
  assert.equal(await page.evaluate(() => localStorage.getItem("sfx-enabled")), "true");
  await context.close();
});

await check("movimento reduzido: sem boot, sem canvas, composição estática", async () => {
  const { context, page, errors } = await open({ reducedMotion: "reduce" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.equal(await visible(page, ".force-particles"), false);
  assert.equal(await visible(page, ".hud-hint"), false);
  assert.equal(await page.locator(".pin-spacer").count(), 0);
  await page.screenshot({ path: `${shots}/reduced-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("sem JavaScript: conteúdo completo e sem overlay", async () => {
  const { context, page } = await open({ javaScriptEnabled: false });
  assert.equal(await visible(page, ".boot"), false);
  assert.ok(await visible(page, ".hero-name"));
  assert.ok(await page.locator("#demo-corrected").isVisible());
  await page.screenshot({ path: `${shots}/nojs-full.png`, fullPage: true });
  await context.close();
});

for (const width of [390, 900]) await check(`mobile ${width}px: hero legível e sem rolagem horizontal`, async () => {
  const { context, page } = await open({ viewport: { width, height: 844 }, isMobile: width < 700, hasTouch: width < 700 });
  await page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 6000 });
  await page.waitForTimeout(1800);
  assert.equal(await page.locator(".hero-copy").evaluate((element) => getComputedStyle(element).opacity), "1");
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: `${shots}/hero-${width}.png` });
  await context.close();
});

await browser.close();
if (failures.length) { console.error(`${failures.length} falha(s)`); process.exit(1); }
console.log("HoloNet: todos os cenários passaram");
