// Galáxia Encantada home (Observatório das Primeiras Luzes): run against a production build (npm run build && npm run start -- --port 3100).
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
  for (const id of ["#tripulante", "#projetos", "#mapa", "#missoes"]) assert.equal(await page.locator(id).count(), 1, id);
  assert.equal(await page.locator(".mission").count(), 3);
  assert.equal(await page.locator(".hero-copy").evaluate((element) => getComputedStyle(element).visibility), "visible");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("Glaucia e Prince aparecem ao abrir, sem clique, e o terraço não é cortado", async () => {
  const { context, page, errors } = await open({ viewport: { width: 1920, height: 960 } });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2400);
  assert.equal(await page.locator(".observatory-crew__pose--idle").evaluate((element) => getComputedStyle(element).opacity), "1");
  const hero = await page.locator(".observatory-hero").boundingBox();
  const crew = await page.locator(".observatory-crew__pose--idle").boundingBox();
  assert.ok(hero && crew && crew.y + crew.height <= hero.y + hero.height, "pés da Glaucia dentro do hero");
  assert.ok(await page.locator(".site-header .comlink-toggle").isVisible(), "rádio estelar no cabeçalho");
  await page.screenshot({ path: `${shots}/hero-1920.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("toque rápido no céu solta poeira de estrelas e não navega", async () => {
  const { context, page } = await open();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2400);
  await page.mouse.click(860, 260);
  assert.match(page.url(), /\/pt$/);
  assert.equal(await page.locator(".observatory-hero").getAttribute("data-stage"), "idle");
  await context.close();
});

await check("segurar o céu: contagem, a nave decola, passa pelo terraço e some no horizonte", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2400);
  const hero = page.locator(".observatory-hero");
  await page.mouse.move(1100, 220);
  await page.mouse.down();
  await page.waitForTimeout(700);
  assert.equal(await hero.getAttribute("data-stage"), "countdown");
  await page.mouse.up();
  assert.equal(await hero.getAttribute("data-stage"), "idle", "soltar antes da ignição cancela");
  await page.mouse.down();
  await page.waitForTimeout(2400);
  assert.equal(await hero.getAttribute("data-stage"), "launch");
  await page.mouse.up();
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${shots}/launch-1440.png` });
  await page.waitForFunction(() => document.querySelector(".observatory-hero")?.dataset.stage === "idle", null, { timeout: 8000 });
  assert.equal(await page.locator(".hero-copy h1").evaluate((element) => getComputedStyle(element).filter), "none");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("hotspots acompanham o zoom, a contagem e os tremores da decolagem", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2400);
  await page.mouse.wheel(0, 180);
  await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector(".hero-scene-layer")).transform).a > 1.03);
  await page.waitForTimeout(1200);
  const aligned = async () => {
    const delta = await page.evaluate(() => {
      const box = (selector) => document.querySelector(selector).getBoundingClientRect();
      const art = box(".hero-scene-layer .observatory-plane");
      const hot = box(".observatory-plane--hot");
      return Math.max(...["x", "y", "width", "height"].map((key) => Math.abs(art[key] - hot[key])));
    });
    assert.ok(delta < 1, `planos da arte e dos hotspots alinhados (diferença: ${delta}px)`);
  };
  await aligned();
  const lantern = await page.locator('[data-lantern="0"] .observatory-lantern__glass').boundingBox();
  assert.ok(lantern);
  await page.mouse.click(lantern.x + lantern.width / 2, lantern.y + lantern.height / 2);
  assert.equal(await page.locator('[data-lantern="0"]').getAttribute("data-off"), "true");
  await page.keyboard.type("launch");
  await page.waitForFunction(() => document.querySelector(".observatory-hero")?.dataset.stage === "countdown");
  await page.waitForTimeout(100);
  await aligned();
  const scales = await page.locator(".page-hero__image, .hero-scene-layer, .observatory-layer").evaluateAll((elements) => elements.map((element) => Number(getComputedStyle(element).scale)));
  assert.equal(scales.length, 3);
  assert.ok(scales.every((scale) => scale > 1 && Math.abs(scale - scales[0]) < .001), "zoom da contagem sincronizado com a placa");
  await page.waitForFunction(() => document.querySelector(".observatory-hero")?.dataset.stage === "launch");
  await page.waitForTimeout(100);
  await aligned();
  assert.deepEqual(errors, []);
  await context.close();
});

await check("um desejo interrompe o voo sem deixar a nave congelada no céu", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2400);
  await page.keyboard.type("launch");
  await page.waitForFunction(() => document.querySelector(".observatory-hero")?.dataset.stage === "launch");
  await page.waitForTimeout(600);
  assert.ok(await visible(page, ".observatory-ship"));
  await page.keyboard.type("wish");
  await page.waitForFunction(() => document.querySelector(".observatory-hero")?.dataset.stage === "wish");
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".observatory-ship")).visibility === "hidden", null, { timeout: 1000 });
  await page.waitForFunction(() => document.querySelector(".observatory-hero")?.dataset.stage === "idle", null, { timeout: 9000 });
  assert.equal(await visible(page, ".observatory-ship"), false);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("telescópio de carreira, Prince, hangar e lanternas que apagam de verdade", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2400);
  const hero = page.locator(".observatory-hero");
  const idle = () => page.waitForFunction(() => document.querySelector(".observatory-hero")?.dataset.stage === "idle", null, { timeout: 12000 });
  await page.getByRole("button", { name: "Glaucia: abrir o telescópio de carreira" }).click();
  assert.equal(await hero.getAttribute("data-pose"), "telescope");
  await page.waitForFunction(() => document.querySelector("dialog.telescope")?.open, null, { timeout: 3000 });
  assert.equal(await page.locator(".telescope__star").count(), 4);
  await page.locator(".telescope__star").first().focus();
  assert.match(await page.locator(".telescope__reading").innerText(), /\S/);
  await page.screenshot({ path: `${shots}/telescope-1440.png` });
  await page.keyboard.press("Escape");
  await idle();
  await page.getByRole("button", { name: "Prince: seguir o faro" }).click();
  await page.waitForTimeout(900);
  assert.equal(await hero.getAttribute("data-pose"), "idle", "o personagem fica fixo");
  assert.ok(await visible(page, ".observatory-bubble"));
  await idle();
  await page.getByRole("button", { name: "Hangar da montanha" }).click();
  assert.equal(await page.locator(".observatory-console").getAttribute("data-on"), "true");
  await idle();
  for (let index = 1; index <= 3; index++) await page.getByRole("button", { name: `Lanterna ${index}: apagar ou acender` }).click();
  assert.match(await page.locator(".sky-counter--lights").innerText(), /3\/4/);
  assert.equal(await page.locator('.observatory-lantern[data-lantern="0"] .observatory-lantern__glass').evaluate((element) => Number(getComputedStyle(element).opacity) > .8), true, "vidro escuro cobre a chama");
  await page.getByRole("button", { name: "Lanterna 4: apagar ou acender" }).click();
  assert.equal(await hero.getAttribute("data-sky"), "dark");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${shots}/dark-sky-1440.png` });
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("galaxia-encantada:eggs:v2") ?? "[]")).then((ids) => ids.sort()), ["dark-sky", "dog-signal", "focus-lens", "hangar-check"]);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("pedido às estrelas pelo rádio estelar desenha a constelação do Prince", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Abrir o rádio estelar" }).click();
  await page.locator("#comlink-input").fill("desejo");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector(".observatory-hero")?.dataset.stage === "wish", null, { timeout: 3000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${shots}/wish-1440.png` });
  assert.ok((await page.evaluate(() => JSON.parse(localStorage.getItem("galaxia-encantada:eggs:v2") ?? "[]"))).includes("wish"));
  assert.deepEqual(errors, []);
  await context.close();
});

await check("o retrato da tripulante é vivo", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.press("Escape");
  await page.locator("#tripulante").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  assert.ok(await page.locator(".crew-portrait__glaucia").isVisible());
  assert.ok(await page.locator(".crew-portrait__star").count() > 5);
  await page.screenshot({ path: `${shots}/crew-card-1440.png` });
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
  assert.equal(await page.locator(".stellar--featured a").getAttribute("href"), "https://github.com/Azure-Samples/serverless-chat-langchainjs");
  const archive = page.locator(".stellar-list .stellar");
  assert.equal(await archive.count(), 6);
  const stars = await page.locator(".stellar-list [data-count]").evaluateAll((items) => items.map((item) => Number(item.dataset.count)));
  assert.deepEqual(stars, [...stars].sort((a, b) => b - a));
  await context.close();
});

await check("rádio estelar: mapa estelar e decolagem pelo terminal, dica de toque no celular", async () => {
  const { context, page, errors } = await open();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Abrir o rádio estelar" }).click();
  await page.locator("#comlink-input").fill("konami");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("dialog.egg-overlay")?.open, null, { timeout: 2000 });
  assert.ok(await page.locator(".egg-overlay .star-map").isVisible());
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Abrir o rádio estelar" }).click();
  await page.locator("#comlink-input").fill("decolar");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector(".observatory-hero")?.dataset.stage === "countdown", null, { timeout: 3000 });
  await page.waitForFunction(() => document.querySelector(".observatory-hero")?.dataset.stage === "idle", null, { timeout: 7000 });
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("galaxia-encantada:eggs:v2") ?? "[]")).then((ids) => ids.sort()), ["launch-charge", "star-map"]);
  assert.deepEqual(errors, []);
  await context.close();
  const mobile = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 6000 });
  await mobile.page.waitForTimeout(1500);
  assert.ok(await visible(mobile.page, ".sky-touch-hint"));
  assert.ok(await visible(mobile.page, ".comlink-toggle"));
  assert.ok(await visible(mobile.page, ".observatory-hot--prince"));
  assert.ok(await visible(mobile.page, ".site-header .comlink-toggle"));
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
  assert.ok(await visible(page, ".observatory-crew__pose--idle"));
  assert.equal(await page.locator(".observatory-hero").getAttribute("data-stage"), null);
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.equal(await visible(page, ".sky-particles"), false);
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
  assert.ok(await page.locator("#demo-grounded").isVisible());
  assert.ok(await page.locator("#demo-ungrounded").isVisible());
    assert.equal(await visible(page, ".observatory-hot"), false);
  assert.ok(await visible(page, ".observatory-crew__pose--idle"));
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
console.log("Observatório: todos os cenários passaram");
