// Events / Atlas das Conexões: run against a server (npm run start -- --hostname 127.0.0.1 --port 3100, or the dev server).
// BASE_URL overrides the server. Screenshots go to SHOTS (default: the system temp folder).
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const shots = process.env.SHOTS ?? path.join(os.tmpdir(), "atlas");
fs.mkdirSync(shots, { recursive: true });
const events = JSON.parse(fs.readFileSync("src/data/eventos.json", "utf8"));
const browser = await chromium.launch();
const failures = [];
const check = async (name, run) => { try { await run(); console.log(`ok - ${name}`); } catch (error) { failures.push(name); console.error(`not ok - ${name}\n  ${error.message}`); } };
const open = async (options = {}, locale = "pt", query = "", { boot = false } = {}) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  if (!boot) await page.addInitScript(() => sessionStorage.setItem("atlas-boot", "done"));
  await page.goto(`${base}/${locale}/eventos${query}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  return { context, page, errors };
};
const visible = (page, selector) => page.locator(selector).first().isVisible();
const found = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("galaxia-encantada:eggs:v2") ?? "[]"));
const comlink = async (page, phrase) => {
  await page.locator(".comlink-toggle").click();
  await page.locator("#comlink-input").fill(phrase);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
};

await check("abertura do Atlas toca uma vez por sessão e ESC pula", async () => {
  const { context, page, errors } = await open({}, "pt", "", { boot: true });
  assert.equal(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.ok(await visible(page, ".boot--atlas"));
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.documentElement.dataset.boot === "done", null, { timeout: 3000 });
  assert.equal(await page.evaluate(() => sessionStorage.getItem("atlas-boot")), "done");
  assert.deepEqual(errors, []);
  await context.close();
});

for (const locale of ["pt", "en", "es"]) await check(`cinco capítulos, CTAs, hotspots e holograma em ${locale}`, async () => {
  const { context, page, errors } = await open({}, locale);
  assert.equal(await page.locator("h1#events-title").count(), 1);
  const ctas = page.locator(".atlas-copy .actions a");
  assert.equal(await ctas.nth(0).getAttribute("href"), `/${locale}/servicos?assunto=palestra#contato`);
  assert.equal(await ctas.nth(1).getAttribute("href"), "#diario");
  assert.equal(await page.locator(".chapter-tag").count(), 5);
  for (const hot of ["glaucia", "holo", "prince", "orb"]) assert.ok(await visible(page, `.atlas-hot--${hot}`), hot);
  assert.match(await page.locator(".atlas-discoveries").innerText(), /\/6/);
  assert.equal(await page.locator("main").getAttribute("data-sound-world"), "atlas");
  await page.waitForFunction(() => document.querySelector(".atlas-holo")?.dataset.ready === "true", null, { timeout: 5000 });
  await page.screenshot({ path: `${shots}/hero-${locale}-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("constellation-route: a Glaucia liga as 20 cidades presenciais (linhas de constelação, não rotas)", async () => {
  const { context, page, errors } = await open();
  await page.locator(".atlas-hot--glaucia").click();
  await page.waitForSelector(".atlas-tablet");
  await page.locator(".atlas-tablet__action").first().click();
  await page.waitForFunction(() => document.querySelector(".atlas-holo")?.dataset.holo === "unfold", null, { timeout: 2000 });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${shots}/constellation-drawing-1440.png` });
  await page.waitForSelector(".atlas-readout[data-kind='constellation']:not([hidden])", { timeout: 6000 });
  assert.equal(await page.locator(".atlas-readout__stars li").count(), 20);
  assert.match(await page.locator(".atlas-readout__note").innerText(), /não rotas de viagem/);
  assert.ok((await found(page)).includes("constellation-route"));
  await page.screenshot({ path: `${shots}/constellation-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("dog-navigation: o visor mostra um evento real com fonte e leva ao diário", async () => {
  const { context, page, errors } = await open();
  await page.locator(".atlas-hot--prince").click();
  await page.waitForFunction(() => document.querySelector(".atlas-orb")?.dataset.orb === "active", null, { timeout: 2000 });
  await page.waitForSelector(".atlas-readout[data-kind='visor']:not([hidden])", { timeout: 4000 });
  const href = await page.locator(".atlas-readout__title a").getAttribute("href");
  const name = await page.locator(".atlas-readout__title a").innerText();
  const event = events.find((item) => item.fonte === href && name.startsWith(item.nome));
  assert.ok(event, `${name} ${href}`);
  const place = await page.locator(".atlas-readout__place").getAttribute("data-format");
  assert.equal(place, event.cidade === "Online" ? "remoto" : "presencial");
  await page.screenshot({ path: `${shots}/visor-1440.png` });
  await page.locator(".atlas-readout__actions a").click();
  await page.waitForTimeout(1800);
  assert.ok(await visible(page, ".log__entry[data-found]"));
  assert.ok((await found(page)).includes("dog-navigation"));
  assert.deepEqual(errors, []);
  await context.close();
});

await check("orbital-trail: o holograma lança o globo, que fecha a órbita de um ano", async () => {
  const { context, page, errors } = await open();
  await page.locator(".atlas-hot--holo").click();
  await page.waitForSelector(".atlas-orbit-card:not([hidden])", { timeout: 6000 });
  assert.match(await page.locator(".atlas-orbit-card__kicker").innerText(), /20\d\d/);
  assert.ok((await found(page)).includes("orbital-trail"));
  await page.screenshot({ path: `${shots}/orbit-1440.png` });
  await page.locator(".atlas-orbit-card__actions button").first().click();
  await page.waitForTimeout(300);
  assert.match(await page.locator(".atlas-orbit-card__kicker").innerText(), /20\d\d/);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("orbital-trail: uma volta inteira pelas setas acende o odômetro e fecha a órbita", async () => {
  const { context, page, errors } = await open();
  const globe = page.locator("canvas.globe");
  await globe.scrollIntoViewIfNeeded();
  await page.waitForSelector(".atlas-globe[data-ready]");
  await globe.focus();
  for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowRight");
  assert.ok(await page.locator(".atlas-globe__odometer i[data-on]").count() > 10);
  for (let i = 0; i < 25; i++) await page.keyboard.press("ArrowRight");
  await page.waitForSelector(".atlas-orbit-card:not([hidden])", { timeout: 3000 });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("frases digitadas e o rádio estelar tocam os três segredos", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.type("visor");
  await page.waitForSelector(".atlas-readout[data-kind='visor']:not([hidden])", { timeout: 5000 });
  await page.evaluate(() => localStorage.removeItem("galaxia-encantada:eggs:v2"));
  await comlink(page, "órbita");
  await page.waitForSelector(".atlas-orbit-card:not([hidden])", { timeout: 6000 });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("movimento reduzido: segredos com o estado final, sem salto", async () => {
  const { context, page, errors } = await open({ reducedMotion: "reduce" });
  assert.equal(await page.locator(".atlas-hero").getAttribute("data-motion"), "false");
  await page.locator(".atlas-hot--glaucia").click();
  await page.locator(".atlas-tablet__action").first().click();
  assert.ok(await visible(page, ".atlas-readout[data-kind='constellation']"));
  await page.locator(".atlas-readout__actions button").click();
  await page.locator(".atlas-hot--prince").click();
  assert.ok(await visible(page, ".atlas-readout[data-kind='visor']"));
  assert.ok(await visible(page, ".atlas-voyage__static"));
  assert.deepEqual(errors, []);
  await context.close();
});

await check("viagem de câmera: globo 3D com o ano e os nomes reais", async () => {
  const { context, page, errors } = await open();
  const box = await page.evaluate(() => { const t = document.querySelector(".atlas-voyage__track").getBoundingClientRect(); return { top: t.top + scrollY, h: t.height }; });
  await page.evaluate(({ top, h }) => { const y = top + (h - innerHeight) * .6; if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true }); else scrollTo(0, y); }, box);
  await page.waitForTimeout(2200);
  assert.match(await page.locator(".atlas-voyage__year").innerText(), /20\d\d/);
  assert.ok((await page.locator(".atlas-voyage__marquee").innerText()).length > 3);
  await page.screenshot({ path: `${shots}/voyage-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});
await check("segredos do Prince: satélite, antena e carimbo", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.type("satelite");
  await page.waitForSelector(".atlas-readout[data-kind='postcard']:not([hidden])", { timeout: 6000 });
  await page.keyboard.type("antena");
  await page.waitForSelector(".prince-antenna__card", { timeout: 6000 });
  await page.keyboard.type("patinha");
  await page.waitForSelector(".atlas-base-card", { timeout: 6000 });
  for (const id of ["runaway-satellite", "prince-antenna", "paw-stamp"]) assert.ok((await found(page)).includes(id), id);
  assert.deepEqual(errors, []);
  await context.close();
});

for (const [width, height] of [[1920, 1080], [1440, 900], [1366, 768], [768, 1024], [390, 844]]) await check(`enquadramento ${width}×${height}: cena inteira, sem rolagem horizontal`, async () => {
  const touch = width < 1000 ? { isMobile: true, hasTouch: true } : {};
  const { context, page, errors } = await open({ viewport: { width, height }, ...touch });
  const layout = await page.evaluate(() => {
    const hero = document.querySelector(".atlas-hero").getBoundingClientRect();
    const glaucia = document.querySelector(".atlas-crew__pose--idle").getBoundingClientRect();
    const prince = document.querySelector(".atlas-prince__pose--front-bare").getBoundingClientRect();
    return { overflow: document.documentElement.scrollWidth > innerWidth, glaucia: glaucia.right <= hero.right + 1 && glaucia.bottom <= hero.bottom + 1 && glaucia.width > 0, prince: prince.left >= hero.left - 1 && prince.width > 0 };
  });
  assert.deepEqual(layout, { overflow: false, glaucia: true, prince: true });
  await page.screenshot({ path: `${shots}/hero-${width}x${height}.png` });
  await page.screenshot({ path: `${shots}/full-${width}x${height}.png`, fullPage: true });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("sem JavaScript: cena em repouso, textos e diário completos", async () => {
  const { context, page } = await open({ javaScriptEnabled: false });
  assert.ok(await visible(page, "h1#events-title"));
  assert.ok(await visible(page, ".atlas-crew__pose--idle"));
  assert.equal(await page.locator(".log__entry").count(), events.length);
  assert.ok(await visible(page, ".atlas-countries"));
  await page.screenshot({ path: `${shots}/nojs-1440.png`, fullPage: true });
  await context.close();
});

await browser.close();
console.log(`screenshots: ${shots}`);
if (failures.length) { console.error(`${failures.length} failed`); process.exit(1); }
