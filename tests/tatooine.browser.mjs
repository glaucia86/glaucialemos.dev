// Projects / Tatooine: run against a production build (npm run build && npm run start -- --port 3100).
// BASE_URL overrides the server. Screenshots go to docs/screenshots/projetos/.
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const shots = "docs/screenshots/projetos";
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
  await page.goto(`${base}/${locale}/projetos`, { waitUntil: "networkidle" });
  return { context, page, errors };
};
const visible = (page, selector) => page.locator(selector).first().isVisible();
const skipIntro = async (page) => { await page.keyboard.press("Escape"); await page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 4000 }); await page.waitForTimeout(1200); };
const found = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("galaxia-encantada:eggs:v2") ?? "[]"));
const comlink = async (page, phrase) => {
  await page.locator(".comlink-toggle").click();
  await page.locator("#comlink-input").fill(phrase);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
};

await check("transmissão astromecânica toca uma vez por sessão e ESC pula", async () => {
  const { context, page, errors } = await open();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.ok(await visible(page, ".boot--astromech"));
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.documentElement.dataset.boot === "done", null, { timeout: 3000 });
  assert.equal(await page.evaluate(() => sessionStorage.getItem("r2-boot")), "done");
  await page.reload({ waitUntil: "networkidle" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.deepEqual(errors, []);
  await context.close();
});

for (const locale of ["pt", "en", "es"]) await check(`cinco transmissões, CTAs, telemetria e esquadrões em ${locale}`, async () => {
  const { context, page, errors } = await open({}, locale);
  await skipIntro(page);
  assert.equal(await page.locator("h1#projects-title").count(), 1);
  const ctas = page.locator(".page-hero .actions a");
  assert.equal(await ctas.count(), 2);
  assert.equal(await ctas.nth(0).getAttribute("href"), "https://github.com/glaucia86");
  assert.equal(await ctas.nth(1).getAttribute("href"), "#projetos");
  assert.equal(await page.locator(".chapter-tag").count(), 5);
  assert.equal(await page.locator(".memory-stats > div").count(), 8);
  assert.ok(await page.locator(".dunes__years li").count() >= 10);
  assert.ok(await page.locator(".archive__grid .repo-card").count() >= 9);
  assert.ok(await page.locator(".squadron").count() >= 5);
  assert.ok(await page.locator(".pilot").count() >= 18);
  assert.ok(await visible(page, ".tatooine-hot--r2"));
  assert.ok(await visible(page, "[data-npx]"));
  assert.deepEqual(errors, []);
  await context.close();
});

await check("arquivo: filtros, busca, contagem acessível e corrida de pods na ordenação", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  await page.locator("#projetos").scrollIntoViewIfNeeded();
  const cards = page.locator(".archive__grid .repo-card");
  const total = await cards.count();
  await page.locator(".archive__filter").first().locator("button").nth(1).click();
  assert.ok(await cards.count() < total);
  await page.locator(".archive__filter").first().locator("button").first().click();
  await page.locator(".archive__search input").fill("typescript");
  assert.ok(await cards.count() >= 1 && await cards.count() < total);
  assert.match(await page.locator(".archive__count").innerText(), /\d/);
  await page.locator(".archive__search input").fill("");
  const before = await cards.first().getAttribute("data-repo");
  await page.locator(".archive__filter--sort button").nth(1).click();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator(".archive__filter--sort button").nth(1).getAttribute("aria-pressed"), "true");
  assert.ok((await found(page)).includes("podrace"));
  assert.ok(before);
  await context.close();
});

await check("truque mental: buscar droides chama Obi-Wan e limpa a busca", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  await page.locator(".archive__search input").fill("droides");
  assert.ok(await visible(page, ".mind-trick"));
  assert.ok((await found(page)).includes("mindtrick"));
  await page.waitForTimeout(4000);
  assert.equal(await visible(page, ".mind-trick"), false);
  assert.equal(await page.locator(".archive__search input").inputValue(), "");
  await context.close();
});

await check("R2: cinco toques dão choque, segurar projeta os planos", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  const r2 = page.locator(".tatooine-hot--r2");
  for (let index = 0; index < 5; index++) { await r2.click(); await page.waitForTimeout(120); }
  assert.ok((await found(page)).includes("artoo"));
  const box = await r2.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.waitForTimeout(800); await page.mouse.up();
  assert.ok(await visible(page, "dialog.plans-dialog[open]"));
  await page.keyboard.press("Escape");
  await page.screenshot({ path: `${shots}/hero-1440.png` });
  await context.close();
});

await check("pôr do sol binário: primeiro sol, depois o segundo", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  await page.locator(".tatooine-hot--sun-a").click();
  await page.locator(".tatooine-hot--sun-b").click();
  assert.equal(await page.locator(".projects-page").getAttribute("data-sunset"), "true");
  await page.waitForTimeout(4500);
  await page.screenshot({ path: `${shots}/sunset-1440.png` });
  await context.close();
});

await check("comlink: todos os segredos de Tatooine respondem e o npx abre o holocron", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  await comlink(page, "npx glaucia_lemos86");
  await page.waitForTimeout(1500);
  assert.ok(await visible(page, "dialog.npx-dialog[open]"));
  assert.match(await page.locator(".npx-card").innerText(), /Regional Cloud Developer/);
  await page.locator(".npx-dialog .tatooine-dialog__actions button").first().click();
  await page.waitForTimeout(1500);
  assert.match(await page.locator(".npx-card").innerText(), /AI Transformation Lead/);
  await page.keyboard.press("Escape");
  for (const phrase of ["utinni", "sand", "hello there", "beebee", "cantina", "boonta", "sunset", "plans"]) {
    await comlink(page, phrase);
    await page.waitForTimeout(1800);
    await page.keyboard.press("Escape");
  }
  const secrets = await found(page);
  for (const id of ["npx", "utinni", "sand", "hellothere", "bb8", "cantina", "podrace", "sunset", "plans"]) assert.ok(secrets.includes(id), id);
  assert.ok(await visible(page, ".repo-card--stolen"));
  await page.locator(".repo-card__bargain").click();
  assert.equal(await page.locator(".repo-card--stolen").count(), 0);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("movimento reduzido: cena estática e segredos continuam acessíveis", async () => {
  const { context, page } = await open({ reducedMotion: "reduce" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.equal(await page.locator(".tatooine-crawler").evaluate((element) => getComputedStyle(element).animationName), "none");
  await comlink(page, "plans");
  assert.ok(await visible(page, "dialog.plans-dialog[open]"));
  await context.close();
});

await check("sem JavaScript: conteúdo completo, sem overlay nem hotspots", async () => {
  const { context, page } = await open({ javaScriptEnabled: false });
  assert.equal(await visible(page, ".boot"), false);
  assert.ok(await visible(page, "h1#projects-title"));
  assert.equal(await visible(page, ".tatooine-hot--r2"), false);
  assert.ok(await page.locator(".archive__grid .repo-card").count() >= 9);
  assert.ok(await page.locator(".pilot").count() >= 18);
  await page.screenshot({ path: `${shots}/nojs-full.png`, fullPage: true });
  await context.close();
});

for (const width of [390, 900, 1280, 1920]) await check(`${width}px: legível e sem rolagem horizontal`, async () => {
  const mobile = width < 700;
  const { context, page } = await open({ viewport: { width, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile });
  await page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 6000 });
  await page.waitForTimeout(1600);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: `${shots}/hero-${width}.png` });
  await page.locator("#projetos").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/market-${width}.png` });
  await context.close();
});

await browser.close();
if (failures.length) { console.error(`${failures.length} falha(s)`); process.exit(1); }
console.log("Tatooine: todos os cenários passaram");
