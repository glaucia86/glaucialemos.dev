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

await check("segurar: o Yoda (mesmo personagem) se energiza, levanta o X-wing e volta ao soltar", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2400);
  const hero = page.locator(".home-hero-v2");
  const layer = page.locator(".hero-scene-layer");
  const opacity = (selector) => page.locator(selector).first().evaluate((element) => Number(getComputedStyle(element).opacity));
  await page.mouse.move(1150, 450);
  await page.mouse.down();
  await page.waitForTimeout(800);
  assert.equal(await hero.getAttribute("data-force-stage"), "force");
  assert.equal(await layer.getAttribute("data-levitating"), "true");
  assert.equal(await page.locator(".dagobah-character").count(), 0);
  assert.ok(await opacity(".yoda-force__aura") > .2);
  assert.ok(await page.evaluate(() => performance.getEntriesByType("resource").some((entry) => entry.name.endsWith("/pixel/yoda-force/body.webp"))));
  await page.screenshot({ path: `${shots}/force-1440.png` });
  await page.waitForTimeout(2600);
  assert.equal(await hero.getAttribute("data-force-stage"), "xwing");
  const ship = await page.locator(".swamp-xwing").boundingBox();
  const water = await page.locator(".swamp-ripples").boundingBox();
  assert.ok(ship && water && ship.y + ship.height < water.y + water.height / 2, "X-wing acima da água");
  await page.screenshot({ path: `${shots}/xwing-1440.png` });
  await page.mouse.up();
  assert.equal(await hero.getAttribute("data-force-stage"), "idle");
  await page.waitForTimeout(1500);
  assert.ok(await opacity(".yoda-force") > .9);
  assert.ok(await opacity(".yoda-force__aura") < .1);
  assert.equal(await page.locator(".hero-copy h1").evaluate((element) => getComputedStyle(element).filter), "none");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("a Jedi rebate os disparos pelo botão e pelo card", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.press("Escape");
  await page.locator("#jedi").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const button = page.getByRole("button", { name: "Rebater disparos" });
  assert.ok(await button.isVisible());
  await button.click();
  await page.waitForTimeout(450);
  assert.ok(await page.locator(".jedi-bolts .jedi-bolt").count() > 0);
  assert.ok(await page.locator(".jedi-bolts .jedi-spark").count() > 0);
  await page.screenshot({ path: `${shots}/jedi-deflect-1440.png` });
  await page.waitForTimeout(1800);
  assert.equal(await page.locator(".jedi-bolts .jedi-bolt").count(), 0);
  await page.locator(".holo-card__frame").click();
  await page.waitForTimeout(200);
  assert.ok(await page.locator(".jedi-bolts .jedi-bolt").count() > 0);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("terminal RAG alterna estados acessíveis", async () => {
  const { context, page } = await open({}, "en");
  await page.keyboard.press("Escape");
  await page.locator("#projetos").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Question with sources" }).click();
  assert.equal(await page.locator(".rag-demo").getAttribute("data-state"), "valid");
  assert.ok(await page.locator("#demo-grounded").isVisible());
  assert.match(await page.locator("#demo-grounded").innerText(), /retriever\.invoke\(question\)/);
  await page.getByRole("button", { name: "Question without sources" }).click();
  assert.equal(await page.locator(".rag-demo").getAttribute("data-state"), "invalid");
  assert.match(await page.locator("#demo-ungrounded").innerText(), /capital of France/);
  assert.equal(await page.locator(".holocron--featured a").getAttribute("href"), "https://github.com/Azure-Samples/serverless-chat-langchainjs");
  const archive = page.locator(".holocron-list .holocron");
  assert.equal(await archive.count(), 6);
  const stars = await page.locator(".holocron-list [data-count]").evaluateAll((items) => items.map((item) => Number(item.dataset.count)));
  assert.deepEqual(stars, [...stars].sort((a, b) => b - a));
  await context.close();
});

await check("comlink: konami e Força pelo terminal, dica de toque no celular", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Abrir o canal secreto" }).click();
  await page.locator("#comlink-input").fill("konami");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("dialog.egg-overlay")?.open, null, { timeout: 2000 });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Abrir o canal secreto" }).click();
  await page.locator("#comlink-input").fill("força");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector(".home-hero-v2")?.dataset.forceStage === "force", null, { timeout: 3000 });
  await page.waitForFunction(() => document.querySelector(".home-hero-v2")?.dataset.forceStage === "idle", null, { timeout: 6000 });
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("holonet-secrets") ?? "[]")).then((ids) => ids.sort()), ["force-hold", "konami"]);
  assert.deepEqual(errors, []);
  await context.close();
  const mobile = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 6000 });
  await mobile.page.waitForTimeout(1500);
  assert.ok(await visible(mobile.page, ".force-touch-hint"));
  assert.ok(await visible(mobile.page, ".comlink-toggle"));
  await mobile.context.close();
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
  await page.mouse.move(1150, 450);
  await page.mouse.down(); await page.waitForTimeout(700); await page.mouse.up();
  assert.ok(await visible(page, ".yoda-force__body"));
  assert.equal(await page.locator(".home-hero-v2").getAttribute("data-force-stage"), null);
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.equal(await visible(page, ".force-particles"), false);
  assert.equal(await visible(page, ".hud-hint"), false);
  assert.equal(await visible(page, ".jedi-deflect"), false);
  assert.equal(await page.locator(".pin-spacer").count(), 0);
  await page.screenshot({ path: `${shots}/reduced-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("sem JavaScript: conteúdo completo e sem overlay", async () => {
  const { context, page } = await open({ javaScriptEnabled: false });
  assert.equal(await visible(page, ".boot"), false);
  assert.ok(await visible(page, ".hero-name"));
  assert.ok(await page.locator("#demo-grounded").isVisible());
  assert.ok(await page.locator("#demo-ungrounded").isVisible());
  assert.equal(await visible(page, ".jedi-deflect"), false);
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
