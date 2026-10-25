// Projects / Marte: run against a production build (npm run build && npm run start -- --hostname 127.0.0.1 --port 3100).
// BASE_URL overrides the server. Screenshots go to docs/screenshots/marte/.
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const shots = "docs/screenshots/marte";
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

await check("abertura de Marte toca uma vez por sessão e ESC pula", async () => {
  const { context, page, errors } = await open();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.ok(await visible(page, ".boot--mars"));
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.documentElement.dataset.boot === "done", null, { timeout: 3000 });
  assert.equal(await page.evaluate(() => sessionStorage.getItem("marte-boot")), "done");
  await page.reload({ waitUntil: "networkidle" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.deepEqual(errors, []);
  await context.close();
});

for (const locale of ["pt", "en", "es"]) await check(`cinco capítulos, CTAs, telemetria, arquivo e estações em ${locale}`, async () => {
  const { context, page, errors } = await open({}, locale);
  await skipIntro(page);
  assert.equal(await page.locator("h1#projects-title").count(), 1);
  const ctas = page.locator(".mars-copy .actions a");
  assert.equal(await ctas.count(), 2);
  assert.equal(await ctas.nth(0).getAttribute("href"), "https://github.com/glaucia86");
  assert.equal(await ctas.nth(1).getAttribute("href"), "#projetos");
  assert.equal(await page.locator(".chapter-tag").count(), 5);
  assert.equal(await page.locator(".telemetry-stats > div").count(), 8);
  assert.ok(await page.locator(".colony__lot").count() >= 10);
  assert.ok(await visible(page, ".telemetry-reading, .telemetry-offline"));
  assert.ok(await page.locator(".archive__grid .repo-card").count() >= 9);
  assert.ok(await page.locator(".station").count() >= 5);
  assert.ok(await page.locator(".module").count() >= 18);
  for (const hot of ["glaucia", "rover", "prince", "console"]) assert.ok(await visible(page, `.mars-hot--${hot}`), hot);
  assert.ok(await visible(page, ".retro__prince"));
  assert.ok(await visible(page, ".site-bench .compare__stage"));
  assert.ok(await visible(page, ".lost-bug"));
  assert.equal(await page.locator(".bench").count() >= 3, true);
  assert.match(await page.locator(".mars-discoveries").innerText(), /\/7/);
  await page.screenshot({ path: `${shots}/hero-${locale}-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("hero: rover lê um repositório real e o Prince acha a amostra mais antiga", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  await page.locator(".mars-hot--glaucia").click();
  await page.waitForTimeout(2600);
  assert.ok(await visible(page, ".mars-readout[data-kind='scan']"));
  assert.match(await page.locator(".mars-readout__title a").getAttribute("href"), /^https:\/\/github\.com\/glaucia86\//);
  await page.screenshot({ path: `${shots}/scan-1440.png` });
  await page.waitForTimeout(1800);
  await page.locator(".mars-hot--prince").click();
  await page.waitForTimeout(2200);
  assert.ok(await visible(page, ".mars-readout[data-kind='sample']"));
  assert.ok((await found(page)).includes("rover-scan"));
  assert.ok((await found(page)).includes("sample-cache"));
  await page.locator(".mars-readout__actions a").click();
  await page.waitForTimeout(1600);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("teclado: hotspot com Enter leva o foco à leitura; Esc fecha diálogos", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  await page.locator(".mars-hot--rover").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2400);
  assert.equal(await page.evaluate(() => document.activeElement?.id), "mars-readout-title");
  await page.locator(".retro__prince").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1400);
  await page.locator(".retro__floppy").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1200);
  assert.ok(await visible(page, "dialog.crt[open]"));
  const box = await page.locator("dialog.crt").boundingBox();
  const viewport = page.viewportSize();
  assert.ok(Math.abs(box.x + box.width / 2 - viewport.width / 2) < 4, "CRT centralizado na horizontal");
  assert.ok(Math.abs(box.y + box.height / 2 - viewport.height / 2) < 8, "CRT centralizado na vertical");
  await page.screenshot({ path: `${shots}/crt-1440.png` });
  await page.keyboard.press("Escape");
  assert.equal(await page.evaluate(() => document.activeElement?.matches(".retro__floppy")), true);
  await context.close();
});

await check("segredos do conteúdo: terminal, broto, carcaça, bug e poeira", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  await comlink(page, "npx glaucia_lemos86");
  await page.waitForTimeout(1500);
  await page.waitForTimeout(2600);
  assert.ok(await visible(page, "dialog.crt[open]"));
  assert.match(await page.locator(".crt__card").innerText(), /Regional Cloud Developer/);
  assert.match(await page.locator("dialog.crt").innerText(), /2013/);
  await page.locator(".crt__controls button").first().click();
  await page.waitForTimeout(1500);
  assert.match(await page.locator(".crt__card").innerText(), /AI Transformation Lead/);
  await page.keyboard.press("Escape");

  await page.locator(".colony__sprout").click();
  assert.ok(await visible(page, "#sprout-reading"));

  const range = page.locator(".compare__range");
  await range.focus();
  for (let step = 0; step < 10; step++) await page.keyboard.press("ArrowRight");
  await page.locator(".compare__toggle").click();
  assert.equal(await page.locator(".compare").getAttribute("data-rejected"), "true");
  await page.screenshot({ path: `${shots}/bench-1440.png` });

  await page.locator(".bench__summary").first().click();
  assert.ok(await visible(page, ".bench[open] .bench__log"));

  await page.locator(".lost-bug").click();
  assert.ok(await visible(page, "dialog.circuit[open]"));
  for (const part of await page.locator(".circuit__value--broken").all()) await part.click();
  assert.match(await page.locator(".circuit__result").innerText(), /#555/);
  await page.screenshot({ path: `${shots}/circuit-1440.png` });
  await page.keyboard.press("Escape");

  await comlink(page, "poeira");
  await page.waitForTimeout(1800);
  assert.equal(await page.locator(".dust-panel").getAttribute("data-state"), "clean");
  const secrets = await found(page);
  for (const id of ["terminal-launch", "first-sprout", "before-pretty", "lost-bug", "dust-fall"]) assert.ok(secrets.includes(id), id);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("frase digitada na página dispara o segredo, mas não na busca do arquivo", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  await page.locator(".archive__search input").fill("bug");
  assert.equal(await visible(page, "dialog.circuit[open]"), false);
  await page.locator("body").click({ position: { x: 5, y: 400 } });
  await page.keyboard.type("broto");
  await page.waitForTimeout(1600);
  assert.ok(await visible(page, "#sprout-reading"));
  await context.close();
});

await check("toque: 3 toques limpam a poeira; o bug abre com toque", async () => {
  const { context, page } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await skipIntro(page);
  const dust = page.locator(".dust-panel__dust");
  await dust.scrollIntoViewIfNeeded();
  for (let tap = 0; tap < 3; tap++) { await dust.tap(); await page.waitForTimeout(120); }
  await page.waitForTimeout(1200);
  assert.equal(await page.locator(".dust-panel").getAttribute("data-state"), "clean");
  await page.locator(".lost-bug").tap();
  assert.ok(await visible(page, "dialog.circuit[open]"));
  await context.close();
});

await check("movimento reduzido: sem pin nem canvas animado, segredos com resultado imediato", async () => {
  const { context, page } = await open({ reducedMotion: "reduce" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.equal(await page.locator(".mars-hero").getAttribute("data-motion"), "false");
  await page.locator(".mars-hot--rover").click();
  assert.ok(await visible(page, ".mars-readout[data-kind='scan']"));
  assert.equal(await page.locator(".lost-bug").evaluate((element) => getComputedStyle(element).animationName), "none");
  await comlink(page, "poeira");
  await page.waitForTimeout(400);
  assert.equal(await page.locator(".dust-panel").getAttribute("data-state"), "clean");
  await context.close();
});

await check("rolagem larga: o hero fixa e o salto de poeira mostra os números reais", async () => {
  const { context, page } = await open({ viewport: { width: 1440, height: 900 } });
  await skipIntro(page);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(1600);
  assert.match(await page.locator(".hero-jump__readouts").innerText(), /\d/);
  await page.screenshot({ path: `${shots}/jump-1440.png` });
  await context.close();
});

await check("sem JavaScript: conteúdo completo, sem abertura nem hotspots, painel limpo e circuito em texto", async () => {
  const { context, page } = await open({ javaScriptEnabled: false });
  assert.equal(await visible(page, ".boot"), false);
  assert.ok(await visible(page, "h1#projects-title"));
  assert.equal(await visible(page, ".mars-hot--glaucia"), false);
  assert.ok(await page.locator(".archive__grid .repo-card").count() >= 9);
  assert.ok(await page.locator(".module").count() >= 18);
  assert.ok(await visible(page, ".dust-panel__name a"));
  assert.ok(await visible(page, ".lost-bug__fallback"));
  await page.screenshot({ path: `${shots}/nojs-full.png`, fullPage: true });
  await context.close();
});

for (const width of [390, 720, 900, 1280, 1920]) await check(`${width}px: legível e sem rolagem horizontal`, async () => {
  const mobile = width < 700;
  const { context, page } = await open({ viewport: { width, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile });
  await page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 6000 }).catch(() => page.keyboard.press("Escape"));
  await page.waitForTimeout(1600);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: `${shots}/hero-${width}.png` });
  await page.locator("#projetos").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/archive-${width}.png` });
  await context.close();
});

await browser.close();
if (failures.length) { console.error(`${failures.length} falha(s)`); process.exit(1); }
console.log("Marte: todos os cenários passaram");
