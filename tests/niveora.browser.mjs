// Galáxia Encantada About page (Nivéora): run against a production build (npm run build && npm run start -- --port 3100).
// BASE_URL overrides the server. Screenshots go to docs/screenshots/niveora/.
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const shots = "docs/screenshots/niveora";
fs.mkdirSync(shots, { recursive: true });
const browser = await chromium.launch();
const failures = [];
const check = async (name, run) => { try { await run(); console.log(`ok - ${name}`); } catch (error) { failures.push(name); console.error(`not ok - ${name}\n  ${error.message}`); } };
const open = async (options = {}, locale = "pt", query = "") => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${base}/${locale}/sobre${query}`, { waitUntil: "networkidle" });
  return { context, page, errors };
};
const ready = async (page) => { await page.keyboard.press("Escape"); await page.waitForTimeout(2400); };
const visible = (page, selector) => page.locator(selector).first().isVisible();
const stage = (page) => page.locator(".niveora-hero").getAttribute("data-stage");
const found = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("galaxia-encantada:eggs:v2") ?? "[]"));
const hot = (page, key) => page.locator(`.niveora-hot--${key}`).click();

await check("abertura de Nivéora toca uma vez por sessão, com a chave própria", async () => {
  const { context, page, errors } = await open();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.ok(await visible(page, ".boot--niveora"));
  await page.waitForFunction(() => document.documentElement.dataset.boot === "done", null, { timeout: 6000 });
  assert.equal(await page.evaluate(() => sessionStorage.getItem("niveora-boot")), "done");
  await page.reload({ waitUntil: "networkidle" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.deepEqual(errors, []);
  await context.close();
});

for (const locale of ["pt", "en", "es"]) await check(`conteúdo, capítulos e nada de Star Wars em ${locale}`, async () => {
  const { context, page, errors } = await open({}, locale);
  await ready(page);
  for (const id of ["#diario", "#trajetoria"]) assert.equal(await page.locator(id).count(), 1, id);
  assert.equal(await page.locator(".badge").count(), 4);
  assert.ok(await page.locator(".ops-role").count() > 3);
  const text = await page.locator("main").innerText();
  assert.doesNotMatch(text, /Hoth|Leia|Base Eco|Echo Base|Rebel|Rebeld|Jedi|Padawan|C-3PO|Yavin|H\. Solo|tauntaun|Alian[çz]a/i);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("Glaucia e Prince aparecem ao abrir, com os pés dentro do hero", async () => {
  const { context, page, errors } = await open({ viewport: { width: 1920, height: 960 } });
  await ready(page);
  for (const selector of [".niveora-crew__pose--idle", ".niveora-prince__pose--stand"]) {
    assert.equal(await page.locator(selector).evaluate((element) => getComputedStyle(element).opacity), "1", selector);
    const hero = await page.locator(".niveora-hero").boundingBox();
    const box = await page.locator(selector).boundingBox();
    assert.ok(hero && box && box.y + box.height <= hero.y + hero.height, `${selector} dentro do hero`);
  }
  await page.screenshot({ path: `${shots}/hero-1920.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("Prince: pegadas aparecem uma a uma e a cápsula surge na neve", async () => {
  const { context, page, errors } = await open();
  await ready(page);
  await hot(page, "prince");
  assert.equal(await stage(page), "tracks");
  assert.match(await page.locator(".niveora-hero").getAttribute("data-prince"), /^sniff-down-/);
  const initial = await page.locator(".niveora-hot--prince").boundingBox();
  await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.trail === "dig", null, { timeout: 6000 });
  const digging = await page.locator(".niveora-hot--prince").boundingBox();
  assert.ok(digging.x < initial.x, "hotspot acompanha o Prince até a cápsula");
  await page.waitForFunction(() => document.querySelector(".niveora-capsule")?.dataset.capsule === "found", null, { timeout: 3000 });
  assert.equal(await page.locator(".niveora-track[data-on]").count(), 6);
  assert.equal(await page.locator(".niveora-capsule").getAttribute("data-capsule"), "found");
  assert.ok(await visible(page, ".niveora-hot--capsule"));
  await page.screenshot({ path: `${shots}/tracks-1440.png` });
  assert.ok((await found(page)).includes("paw-tracks"));
  await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.stage === "idle", null, { timeout: 6000 });
  assert.equal(await page.locator(".niveora-prince").evaluate(element => element.style.getPropertyValue("--prince-shift")), "0%");
  assert.equal(await page.locator(".niveora-prince").getAttribute("data-facing"), "left");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("Glaucia: ajoelha, a cápsula abre e mostra registros reais com fonte", async () => {
  const { context, page, errors } = await open();
  await ready(page);
  await hot(page, "glaucia");
  await page.waitForTimeout(1200);
  assert.equal(await page.locator(".niveora-hero").getAttribute("data-pose"), "capsule");
  assert.equal(await page.locator(".niveora-capsule").getAttribute("data-capsule"), "open");
  await page.waitForSelector("dialog.capsule[open]", { timeout: 3000 });
  const records = page.locator(".capsule__records li");
  assert.equal(await records.count(), 4);
  for (let index = 0; index < 4; index++) assert.match(await records.nth(index).locator("a").getAttribute("href"), /^https:\/\//);
  await page.screenshot({ path: `${shots}/capsule-1440.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  assert.equal(await page.locator(".niveora-hero").getAttribute("data-pose"), "cheer");
  await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.stage === "idle", null, { timeout: 4000 });
  assert.ok((await found(page)).includes("memory-capsule"));
  assert.deepEqual(errors, []);
  await context.close();
});

await check("cristal: a aurora se intensifica e volta ao normal", async () => {
  const { context, page, errors } = await open();
  await ready(page);
  await hot(page, "crystal");
  assert.equal(await page.locator(".niveora-hero").getAttribute("data-aurora"), "prism");
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${shots}/prism-1440.png` });
  await page.waitForFunction(() => !document.querySelector(".niveora-hero")?.dataset.aurora, null, { timeout: 8000 });
  assert.ok((await found(page)).includes("aurora-prism"));
  assert.deepEqual(errors, []);
  await context.close();
});

await check("estação: nevasca na página inteira, botão e Esc acalmam o vento", async () => {
  const { context, page, errors } = await open();
  await ready(page);
  await hot(page, "station");
  assert.equal(await page.locator("main").getAttribute("data-whiteout"), "true");
  assert.ok(await visible(page, ".niveora-calm"));
  await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.prince === "cold");
  assert.match(await page.locator(".niveora-hero").getAttribute("data-pose"), /^cold-/);
  await page.waitForTimeout(1500);
  assert.match(await page.locator("[data-temp]").innerText(), /−4\d/);
  await page.screenshot({ path: `${shots}/whiteout-1440.png` });
  await page.locator(".niveora-calm").click();
  await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.prince?.startsWith("shake-"));
  assert.equal(await visible(page, ".niveora-calm"), false);
  await page.waitForTimeout(1600);
  assert.equal(await page.locator("main").getAttribute("data-whiteout"), null);
  await page.keyboard.type("nevasca");
  assert.equal(await page.locator("main").getAttribute("data-whiteout"), "true", "frase digitada também chama a nevasca");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("main").getAttribute("data-whiteout"), "ending");
  assert.ok((await found(page)).includes("whiteout"));
  assert.deepEqual(errors, []);
  await context.close();
});

await check("nevasca congela os cards: raspar com o mouse ou 3 cliques quebram o gelo", async () => {
  const { context, page, errors } = await open();
  await ready(page);
  await hot(page, "station");
  await page.waitForSelector(".ice-block", { timeout: 4000 });
  assert.ok(await page.locator(".ice-block").count() >= 5);
  await page.locator(".niveora-calm").click();
  const stats = page.locator(".log-stats .ice-block");
  await stats.scrollIntoViewIfNeeded();
  const box = await stats.boundingBox();
  await page.mouse.move(box.x + 2, box.y + 2);
  for (let y = box.y + 4; y < box.y + box.height; y += 14) {
    await page.mouse.move(box.x + 2, y, { steps: 2 });
    await page.mouse.move(box.x + box.width - 2, y, { steps: 12 });
  }
  await page.waitForFunction(() => !document.querySelector(".log-stats .ice-block"), null, { timeout: 3000 });
  const badge = page.locator(".badge-list > li .ice-block").first();
  await badge.scrollIntoViewIfNeeded();
  for (let hit = 0; hit < 3; hit++) await badge.click();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator(".badge-list > li:first-child .ice-block").count(), 0);
  await page.screenshot({ path: `${shots}/frozen-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("celular: 3 toques quebram o gelo e a página continua rolando", async () => {
  const { context, page } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 6000 });
  await page.waitForTimeout(1800);
  await page.locator(".niveora-hot--station").tap();
  await page.waitForSelector(".ice-block", { timeout: 4000 });
  await page.locator(".niveora-calm").tap();
  const ice = page.locator(".log-stats .ice-block");
  await ice.scrollIntoViewIfNeeded();
  for (let tap = 0; tap < 3; tap++) await ice.tap();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator(".log-stats .ice-block").count(), 0);
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(400);
  assert.ok(await page.evaluate(() => scrollY) > before);
  await context.close();
});

await check("neve acumula ao ficar parada e cai ao mexer", async () => {
  const { context, page } = await open();
  await ready(page);
  await page.waitForTimeout(6800);
  assert.equal(await page.locator("main").getAttribute("data-settled"), "true");
  assert.ok((await found(page)).includes("snowdrift"));
  await page.mouse.move(400, 400);
  assert.equal(await page.locator("main").getAttribute("data-settled"), null);
  await context.close();
});

await check("rolagem: hero fixado, zoom e salto de nevasca até o diário", async () => {
  const { context, page, errors } = await open();
  await ready(page);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(1500);
  assert.equal(await page.locator(".pin-spacer").count(), 1);
  assert.ok(await page.locator(".hero-jump--niveora .hero-jump__canvas").evaluate((element) => Number(getComputedStyle(element).opacity) > 0));
  await page.screenshot({ path: `${shots}/jump-1440.png` });
  const delta = await page.evaluate(() => {
    const box = (selector) => document.querySelector(selector).getBoundingClientRect();
    const art = box(".hero-scene-layer .niveora-plane"); const hot = box(".niveora-plane--hot");
    return Math.max(...["x", "y", "width", "height"].map((key) => Math.abs(art[key] - hot[key])));
  });
  assert.ok(delta < 1, `planos da arte e dos hotspots alinhados (diferença: ${delta}px)`);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("mapa da travessia: filtro de etapa e link com ?era=", async () => {
  const { context, page, errors } = await open({}, "pt", "?era=advocacy");
  await ready(page);
  assert.equal(await page.locator("[data-ops]").getAttribute("data-focus"), "advocacy");
  await page.locator('.ops-filter button[data-era="all"]').click();
  assert.equal(await page.locator("[data-ops]").getAttribute("data-focus"), "all");
  assert.doesNotMatch(page.url(), /era=/);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("movimento reduzido: cápsula acessível sem caminhada e sem fixar o hero", async () => {
  const { context, page, errors } = await open({ reducedMotion: "reduce" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.ok(await visible(page, ".niveora-crew__pose--idle"));
  await hot(page, "prince");
  assert.equal(await page.locator(".niveora-capsule").getAttribute("data-capsule"), "found");
  assert.equal(await page.locator(".niveora-hero").getAttribute("data-trail"), null);
  assert.ok((await found(page)).includes("paw-tracks"));
  await hot(page, "capsule");
  await page.waitForSelector("dialog.capsule[open]");
  assert.equal(await page.locator(".pin-spacer").count(), 0);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("Prince abana por foco/hover e a busca sobrevive à nevasca e à preferência de movimento", async () => {
  const { context, page, errors } = await open();
  await ready(page);
  await page.locator(".niveora-hot--prince").focus();
  await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.prince?.startsWith("wag-"));
  await page.keyboard.press("Enter");
  await page.keyboard.type("nevasca");
  await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.trail === "walk", null, { timeout: 3000 });
  assert.match(await page.locator(".niveora-hero").getAttribute("data-prince"), /^walk-/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.motion === "false");
  assert.equal(await page.locator(".niveora-hero").getAttribute("data-trail"), null);
  assert.equal(await page.locator("main").getAttribute("data-whiteout"), null);
  assert.equal(await page.locator(".niveora-capsule").getAttribute("data-capsule"), "found");
  await hot(page, "capsule");
  await page.waitForSelector("dialog.capsule[open]");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("hover nas bordas não muda a área clicável nem interrompe o abanar", async () => {
  const { context, page, errors } = await open();
  await ready(page);
  const hit = page.locator(".niveora-hot--prince");
  const box = await hit.boundingBox();
  for (const x of [box.x + 2, box.x + box.width - 2]) {
    await page.mouse.move(x, box.y + box.height * .6);
    await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.prince?.startsWith("wag-"));
    for (let frame = 0; frame < 4; frame++) {
      await page.waitForTimeout(190);
      assert.deepEqual(await hit.boundingBox(), box);
      assert.match(await page.locator(".niveora-hero").getAttribute("data-prince"), /^(wag-|wind$)/);
    }
    await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.prince?.startsWith("wag-"));
  }
  assert.deepEqual(errors, []);
  await context.close();
});

await check("caminhada pausa fora da tela e retoma sem saltar para o final", async () => {
  const { context, page, errors } = await open();
  await ready(page);
  await hot(page, "prince");
  await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.trail === "walk", null, { timeout: 3000 });
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector(".hero-scene-layer--niveora")?.dataset.paused === "true");
  const before = await page.locator(".niveora-prince").getAttribute("style");
  await page.waitForTimeout(800);
  assert.equal(await page.locator(".niveora-prince").getAttribute("style"), before);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForFunction(() => document.querySelector(".hero-scene-layer--niveora")?.dataset.paused === "false");
  assert.equal(await stage(page), "tracks");
  await page.waitForFunction(() => document.querySelector(".niveora-hero")?.dataset.stage === "idle", null, { timeout: 12000 });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("sem JavaScript: conteúdo completo e sem overlay", async () => {
  const { context, page } = await open({ javaScriptEnabled: false });
  assert.equal(await visible(page, ".boot"), false);
  assert.ok(await visible(page, "#about-title"));
  assert.ok(await visible(page, ".niveora-crew__pose--idle"));
  assert.equal(await visible(page, ".niveora-hot"), false);
  assert.ok(await page.locator(".ops-role").count() > 3);
  await page.screenshot({ path: `${shots}/nojs-full.png`, fullPage: true });
  await context.close();
});

for (const width of [390, 900]) await check(`mobile ${width}px: hero legível, toque no Prince e sem rolagem horizontal`, async () => {
  const { context, page } = await open({ viewport: { width, height: 844 }, isMobile: width < 700, hasTouch: width < 700 });
  await page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 6000 });
  await page.waitForTimeout(1800);
  assert.equal(await page.locator(".niveora-copy").evaluate((element) => getComputedStyle(element).opacity), "1");
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.locator(".niveora-hot--prince").scrollIntoViewIfNeeded();
  if (width < 700) await page.locator(".niveora-hot--prince").tap(); else await page.locator(".niveora-hot--prince").click();
  assert.equal(await stage(page), "tracks");
  await page.screenshot({ path: `${shots}/hero-${width}.png` });
  await context.close();
});

await browser.close();
if (failures.length) { console.error(`${failures.length} falha(s)`); process.exit(1); }
console.log("Nivéora: todos os cenários passaram");
