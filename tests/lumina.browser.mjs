// Content / Lúmina: run against a production build (npm run build && npm run start -- --hostname 127.0.0.1 --port 3100).
// BASE_URL overrides the server. Screenshots go to docs/screenshots/lumina/.
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const shots = "docs/screenshots/lumina";
fs.mkdirSync(shots, { recursive: true });
const articles = JSON.parse(fs.readFileSync("src/data/artigos.json", "utf8"));
const browser = await chromium.launch();
const failures = [];
const check = async (name, run) => { try { await run(); console.log(`ok - ${name}`); } catch (error) { failures.push(name); console.error(`not ok - ${name}\n  ${error.message}`); } };
const open = async (options = {}, locale = "pt", path = "") => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${base}/${locale}/conteudo${path}`, { waitUntil: "networkidle" });
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

await check("abertura de Lúmina toca uma vez por sessão e ESC pula", async () => {
  const { context, page, errors } = await open();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.ok(await visible(page, ".boot--lumina"));
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.documentElement.dataset.boot === "done", null, { timeout: 3000 });
  assert.equal(await page.evaluate(() => sessionStorage.getItem("lumina-boot")), "done");
  await page.reload({ waitUntil: "networkidle" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.deepEqual(errors, []);
  await context.close();
});

for (const locale of ["pt", "en", "es"]) await check(`cinco capítulos, CTAs, anéis, estantes e coleções em ${locale}`, async () => {
  const { context, page, errors } = await open({}, locale);
  await skipIntro(page);
  assert.equal(await page.locator("h1#content-title").count(), 1);
  const ctas = page.locator(".lumina-copy .actions a");
  assert.equal(await ctas.count(), 2);
  assert.equal(await ctas.nth(0).getAttribute("href"), "#artigos");
  assert.equal(await ctas.nth(1).getAttribute("href"), "https://www.youtube.com/@GlauciaLemos");
  assert.equal(await page.locator(".chapter-tag").count(), 5);
  assert.equal(await page.locator(".shelf-card").count(), articles.length);
  assert.ok(await page.locator(".ring").count() >= 8);
  assert.equal(await page.locator(".series").count(), 4);
  for (const hot of ["glaucia", "crystal", "prince", "books"]) assert.ok(await visible(page, `.lumina-hot--${hot}`), hot);
  assert.match(await page.locator(".lumina-discoveries").innerText(), /\/7/);
  assert.equal(await page.locator("main").getAttribute("data-sound-world"), "lumina");
  await page.screenshot({ path: `${shots}/hero-${locale}-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("hero: o cristal sussurra um artigo real e o Prince acha a primeira página", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  await page.locator(".lumina-hot--glaucia").click();
  await page.waitForFunction(() => document.querySelector(".lumina-crystal")?.dataset.crystal === "awake", null, { timeout: 2000 });
  await page.waitForTimeout(1900);
  assert.ok(await visible(page, ".lumina-readout[data-kind='whisper']"));
  const href = await page.locator(".lumina-readout__title a").getAttribute("href");
  assert.ok(articles.some((article) => article.url === href), href);
  await page.screenshot({ path: `${shots}/whisper-1440.png` });
  await page.locator(".lumina-readout__actions a").click();
  await page.waitForTimeout(1600);
  assert.ok(await visible(page, ".shelf-card[data-found]"));
  await page.locator(".lumina-hot--prince").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2600);
  await page.locator(".lumina-hot--prince").click();
  await page.waitForTimeout(3400);
  assert.ok(await visible(page, ".lumina-readout[data-kind='first']"));
  const oldest = [...articles].sort((a, b) => a.data.localeCompare(b.data))[0];
  assert.equal(await page.locator(".lumina-readout__title a").getAttribute("href"), oldest.url);
  assert.equal(await page.locator(".lumina-books").getAttribute("data-books"), "open");
  await page.screenshot({ path: `${shots}/first-page-1440.png` });
  const ids = await found(page);
  for (const id of ["crystal-whisper", "first-page"]) assert.ok(ids.includes(id), id);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("estantes: filtros independentes, URL e voltar", async () => {
  const { context, page, errors } = await open({}, "pt", "?plataforma=Medium");
  await skipIntro(page);
  await page.locator("#artigos").scrollIntoViewIfNeeded();
  assert.equal(await page.locator(".shelf-card").count(), articles.filter((article) => article.plataforma === "Medium").length);
  await page.locator(".shelves__filter").nth(1).locator("button").nth(1).click();
  assert.match(page.url(), /idioma=pt-BR/);
  await page.locator(".shelves__search input").fill("zzzz-nada");
  assert.ok(await visible(page, ".shelves__empty"));
  await page.locator(".shelves__empty button").click();
  assert.equal(await page.locator(".shelf-card").count(), articles.length);
  await page.goto(`${base}/pt/conteudo?ano=1999&idioma=fr`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".shelf-card").count(), articles.length);
  for (const link of await page.locator(".shelf-card h3 a").all()) assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("segredos: prismas, eco, constelação e entardecer por mouse e teclado", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  // prism-align: 1, 3 and 2 quarter turns away from the gate.
  const prisms = page.locator(".prism");
  await prisms.nth(0).click(); await prisms.nth(0).click(); await prisms.nth(0).click();
  await prisms.nth(1).focus(); await page.keyboard.press("ArrowRight");
  await prisms.nth(2).click(); await prisms.nth(2).click();
  assert.ok(await visible(page, ".prism-gate[data-open] .prism-gate__archive"));
  // crystal-echo
  await page.locator(".echo summary").first().click();
  assert.ok(await visible(page, ".echo[open] .echo__body"));
  // series-constellation: out of order first, then in order.
  const nodes = page.locator(".series").first().locator(".series__node");
  await nodes.nth(2).click();
  assert.equal(await page.locator(".series").first().getAttribute("data-wrong"), "true");
  for (let index = 0; index < await nodes.count(); index++) await nodes.nth(index).click();
  assert.equal(await page.locator(".series").first().getAttribute("data-complete"), "true");
  // library-dusk with the keyboard, then Esc brings the day back.
  const range = page.locator(".dusk-shelf input[type='range']");
  await range.focus();
  for (let step = 0; step < 18; step++) await page.keyboard.press("ArrowLeft");
  assert.equal(await page.locator("main").getAttribute("data-dusk"), "true");
  assert.ok(await visible(page, ".dusk-shelf__body"));
  await page.screenshot({ path: `${shots}/dusk-1440.png` });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("main").getAttribute("data-dusk"), null);
  const ids = await found(page);
  for (const id of ["prism-align", "crystal-echo", "series-constellation", "library-dusk"]) assert.ok(ids.includes(id), id);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("TV antiga: nada do YouTube antes de ligar; liga, toca e desliga", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  assert.equal(await page.locator("iframe").count(), 0);
  await page.locator(".retro-tv").scrollIntoViewIfNeeded();
  await page.locator(".retro-tv__power").click();
  await page.waitForSelector(".retro-tv[data-power='on'] .retro-tv__player", { timeout: 3000 });
  const src = await page.locator(".retro-tv__player").getAttribute("src");
  assert.match(src, /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?autoplay=1/);
  assert.equal(await page.locator(".retro-tv__title a").getAttribute("href"), `https://www.youtube.com/watch?v=${src.split("/embed/")[1].slice(0, 11)}`);
  await page.screenshot({ path: `${shots}/tv-1440.png` });
  await page.locator(".retro-tv__actions button").click();
  assert.equal(await page.locator(".retro-tv__player").count(), 0);
  assert.ok(await page.locator(".retro-tv__power").evaluate((button) => button === document.activeElement));
  assert.ok((await found(page)).includes("retro-tv"));
  assert.deepEqual(errors.filter((error) => !/youtube|ytimg|googlevideo/i.test(error)), []);
  await context.close();
});

await check("TV antiga liga pelo comando digitado na página", async () => {
  const { context, page } = await open({ reducedMotion: "reduce" });
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.type("tv");
  await page.waitForSelector(".retro-tv[data-power='on'] .retro-tv__player", { timeout: 4000 });
  await context.close();
});

await check("rádio e frases digitadas acionam os sete segredos", async () => {
  const { context, page, errors } = await open({ reducedMotion: "reduce" });
  for (const phrase of ["sussurro", "primeira pagina", "alinhar", "eco", "serie", "entardecer", "tv"]) await comlink(page, phrase);
  await page.keyboard.press("Escape");
  const ids = await found(page);
  for (const id of ["crystal-whisper", "first-page", "prism-align", "crystal-echo", "series-constellation", "library-dusk", "retro-tv"]) assert.ok(ids.includes(id), id);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("movimento reduzido: estado final na hora, sem salto nem partículas", async () => {
  const { context, page, errors } = await open({ reducedMotion: "reduce" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  await page.locator(".lumina-hot--prince").click();
  assert.ok(await visible(page, ".lumina-readout[data-kind='first']"));
  assert.equal(await page.locator(".hero-jump--lumina").isVisible(), false);
  assert.equal(await page.locator(".lumina-hero").getAttribute("data-motion"), "false");
  assert.deepEqual(errors, []);
  await context.close();
});

for (const width of [390, 900]) await check(`celular e tablet (${width}px): cena inteira, sem rolagem lateral, alvos de toque`, async () => {
  const { context, page, errors } = await open({ viewport: { width, height: 860 }, hasTouch: true, isMobile: width < 600 });
  await skipIntro(page);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const image = await page.locator(".lumina-hero .page-hero__image").boundingBox();
  assert.ok(Math.abs(image.width / image.height - 16 / 9) < .02, JSON.stringify(image));
  for (const hot of ["glaucia", "prince"]) {
    const box = await page.locator(`.lumina-hot--${hot}`).boundingBox();
    assert.ok(box.width >= 44 && box.height >= 44, `${hot} ${JSON.stringify(box)}`);
  }
  await page.locator(".lumina-hot--glaucia").tap();
  await page.waitForTimeout(2200);
  assert.ok(await visible(page, ".lumina-readout"));
  await page.screenshot({ path: `${shots}/mobile-${width}.png`, fullPage: false });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("sem JavaScript: artigos, séries, pares e coleção do entardecer continuam legíveis", async () => {
  const { context, page } = await open({ javaScriptEnabled: false });
  assert.equal(await page.locator(".shelf-card").count(), articles.length);
  assert.equal(await page.locator(".shelves__controls").isVisible(), false);
  await page.locator(".prism-gate--static summary").click();
  assert.ok(await page.locator(".prism-pairs a").first().isVisible());
  await page.locator(".dusk-shelf--static summary").click();
  assert.ok(await page.locator(".dusk-shelf__list a").first().isVisible());
  await page.locator(".echo summary").first().click();
  assert.ok(await page.locator(".echo__body").first().isVisible());
  assert.ok(await page.locator(".series__parts a").first().isVisible());
  assert.match(await page.locator(".retro-tv__thumb").getAttribute("href"), /^https:\/\/www\.youtube\.com\/watch\?v=/);
  assert.equal(await page.locator("iframe").count(), 0);
  await page.screenshot({ path: `${shots}/no-js-1440.png`, fullPage: true });
  await context.close();
});

await browser.close();
if (failures.length) { console.error(`\n${failures.length} falha(s): ${failures.join(", ")}`); process.exit(1); }
