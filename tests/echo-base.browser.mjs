// About / Echo Base: run against a production build (npm run build && npm run start -- --port 3100).
// BASE_URL overrides the server. Screenshots go to docs/screenshots/sobre/.
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const shots = "docs/screenshots/sobre";
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
const visible = (page, selector) => page.locator(selector).first().isVisible();
const skipIntro = async (page) => { await page.keyboard.press("Escape"); await page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 4000 }); await page.waitForTimeout(1400); };

await check("transmissão toca uma vez por sessão, ESC pula e não afeta a home", async () => {
  const { context, page, errors } = await open();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.ok(await visible(page, ".boot--echo"));
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.documentElement.dataset.boot === "done", null, { timeout: 3000 });
  assert.equal(await page.evaluate(() => sessionStorage.getItem("echo-boot")), "done");
  assert.equal(await page.evaluate(() => sessionStorage.getItem("holonet-boot")), null);
  await page.reload({ waitUntil: "networkidle" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("transmissão abre também na navegação client-side", async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}/pt`, { waitUntil: "networkidle" });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.documentElement.dataset.boot === "done", null, { timeout: 3000 });
  await page.locator(`header a[href="/pt/sobre"]`).first().click();
  await page.waitForURL(/\/pt\/sobre$/);
  await page.waitForFunction(() => document.documentElement.dataset.boot === "pending", null, { timeout: 3000 });
  assert.ok(await visible(page, ".boot--echo"));
  await page.waitForFunction(() => document.documentElement.dataset.boot === "done", null, { timeout: 6000 });
  await context.close();
});

for (const locale of ["pt", "en", "es"]) await check(`hero, HUD e mapa de operações em ${locale}`, async () => {
  const { context, page, errors } = await open({}, locale);
  await skipIntro(page);
  assert.equal(await page.locator("h1#about-title").count(), 1);
  assert.equal(await page.locator(".echo-copy").evaluate((element) => getComputedStyle(element.querySelector("h1")).visibility), "visible");
  assert.equal(await page.locator(".ops-role").count(), await page.locator(".ops-role a").count());
  assert.ok(await page.locator(".ops-role").count() >= 16);
  assert.equal(await page.locator(".ops-era").count(), 3);
  if (locale === "pt") await page.screenshot({ path: `${shots}/hero-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("trajetória em ordem cronológica, mais recente primeiro", async () => {
  const { context, page } = await open({ javaScriptEnabled: false });
  const companies = await page.locator(".ops-role__company").allInnerTexts();
  assert.equal(companies[0], "Itaú Unibanco");
  assert.ok(companies.indexOf("Oi S.A") < companies.indexOf("HackDev"), "HackDev depois de Oi");
  assert.equal(companies.at(-1), "TopDown Sistemas");
  await context.close();
});

await check("canhão de íons dispara pelo botão e pelo domo, sem navegar", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  const button = page.getByRole("button", { name: "Disparar canhão de íons" });
  assert.ok(await button.isVisible());
  await button.click();
  await page.waitForTimeout(250);
  assert.ok(await page.locator(".echo-ion-bolt").count() > 0);
  assert.equal(await page.locator("[data-echo-hero]").getAttribute("data-ion"), "firing");
  await page.screenshot({ path: `${shots}/ion-1440.png` });
  await page.waitForTimeout(1400);
  assert.equal(await page.locator(".echo-ion-bolt").count(), 0);
  assert.equal(await page.locator("[data-ops]").getAttribute("data-armed"), "true");
  assert.match(await page.locator("[data-ion-status]").innerText(), /Disparo de íons/);
  const beacon = await page.locator(".echo-beacon").boundingBox();
  await page.mouse.click(beacon.x + beacon.width / 2, beacon.y + beacon.height / 2);
  await page.waitForTimeout(200);
  assert.ok(await page.locator(".echo-ion-bolt").count() > 0);
  assert.match(page.url(), /\/pt\/sobre$/);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("temperatura cai com a rolagem e o feixe acende as missões", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  const before = await page.locator("[data-temp]").innerText();
  await page.locator(".ops-chart").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(1600);
  const after = await page.locator("[data-temp]").innerText();
  assert.ok(parseInt(after.replace(/\D/g, ""), 10) > parseInt(before.replace(/\D/g, ""), 10), `${before} → ${after}`);
  assert.ok(await page.locator('.ops-role[data-lit="true"]').count() > 0);
  assert.ok(await visible(page, ".ops-ship"));
  await page.screenshot({ path: `${shots}/ops-1440.png` });
  await context.close();
});

await check("filtro de era: zoom, aria-pressed e ?era= na URL", async () => {
  const { context, page } = await open({}, "pt", "?era=knight");
  await skipIntro(page);
  assert.equal(await page.locator("[data-ops]").getAttribute("data-focus"), "knight");
  assert.equal(await page.getByRole("button", { name: "Era Cavaleira" }).getAttribute("aria-pressed"), "true");
  await page.getByRole("button", { name: "Era Mestre" }).click();
  assert.match(page.url(), /era=master/);
  await page.locator(".ops-chart").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const box = await page.locator('.ops-era[data-era="master"] .ops-role').first().boundingBox();
  assert.ok(box.width > 200, `zoom aplicado (${box.width}px)`);
  await page.screenshot({ path: `${shots}/ops-zoom-1440.png` });
  await page.getByRole("button", { name: "Todas as eras" }).click();
  assert.doesNotMatch(page.url(), /era=/);
  await context.close();
});

await check("o briefing aparece no foco do teclado", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  const link = page.locator(".ops-role a").first();
  await link.focus();
  assert.ok(await page.locator(".ops-role").first().evaluate((element) => element.matches(":focus-within")));
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".ops-role__brief")).opacity === "1", null, { timeout: 2000 });
  await context.close();
});

await check("dossiê: o gelo racha, contadores, medalhas viram e a frase do Han aparece", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  assert.equal(await page.locator(".dossier-card").getAttribute("data-frozen"), "true");
  await page.locator(".dossier-card").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 200);
  await page.waitForFunction(() => document.querySelector(".dossier-card")?.dataset.frozen === "thawed", null, { timeout: 5000 });
  await page.screenshot({ path: `${shots}/dossier-1440.png` });
  assert.equal(await page.locator(".dossier-stats dd").count(), 5);
  const odds = page.locator(".dossier-odds__toggle");
  await odds.click();
  assert.equal(await odds.getAttribute("aria-expanded"), "true");
  const medal = page.locator(".medal").first();
  await medal.click();
  assert.equal(await medal.getAttribute("aria-pressed"), "true");
  await page.locator(".medal-list").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${shots}/medals-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("easter eggs: holomensagem, “Eu sei.” e nevasca pelo teclado", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  await page.keyboard.type("help me");
  assert.ok(await page.locator("dialog.echo-holo").evaluate((dialog) => dialog.open));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/holo-1440.png` });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog.echo-holo").evaluate((dialog) => dialog.open), false);
  await page.keyboard.type("eu te amo");
  await page.waitForFunction(() => document.querySelector(".echo-toast")?.textContent?.includes("Eu sei."), null, { timeout: 2000 });
  await page.keyboard.type("hoth");
  assert.equal(await page.locator(".about-page").getAttribute("data-blizzard"), "true");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/blizzard-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("Leia viva: camadas carregam, ela pisca e a placa esconde a Leia pintada", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  const hero = page.locator("[data-echo-hero]");
  await page.waitForFunction(() => document.querySelector("[data-echo-hero]")?.dataset.leia === "idle", null, { timeout: 5000 });
  assert.equal(await page.locator(".echo-actor").evaluate((element) => getComputedStyle(element).visibility), "visible");
  assert.match(await page.locator(".echo-actor__pose--idle").evaluate((element) => getComputedStyle(element).backgroundImage), /leia\/idle\.webp/);
  await page.waitForFunction(() => document.querySelector("[data-echo-hero]")?.dataset.blink === "true", null, { timeout: 7000, polling: 20 });
  await page.screenshot({ path: `${shots}/leia-1440.png` });
  await page.keyboard.type("hoth");
  await page.waitForFunction(() => document.querySelector("[data-echo-hero]")?.dataset.leia === "shiver", null, { timeout: 2000 });
  assert.equal(await hero.getAttribute("data-leia"), "shiver");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("Leia saca a blaster, o disparo derruba a sonda e ela volta a ficar parada", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  await page.waitForFunction(() => document.querySelector("[data-echo-hero]")?.dataset.leia === "idle", null, { timeout: 5000 });
  const probe = await page.locator(".echo-probe").boundingBox();
  await page.mouse.click(probe.x + probe.width / 2, probe.y + probe.height / 2);
  assert.equal(await page.locator("[data-echo-hero]").getAttribute("data-leia"), "blaster");
  await page.waitForSelector(".echo-laser", { timeout: 1500 });
  await page.screenshot({ path: `${shots}/leia-blaster-1440.png` });
  await page.waitForFunction(() => document.querySelector(".echo-probe")?.dataset.destroyed === "true", null, { timeout: 1500 });
  await page.waitForFunction(() => document.querySelector("[data-echo-hero]")?.dataset.leia === "idle", null, { timeout: 2000 });
  assert.equal(await page.locator(".echo-probe").getAttribute("data-targeted"), null);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("easter eggs: a sonda se autodestrói e o tauntaun atravessa a neve", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  const probe = await page.locator(".echo-probe").boundingBox();
  await page.mouse.click(probe.x + probe.width / 2, probe.y + probe.height / 2);
  await page.waitForFunction(() => document.querySelector(".echo-probe")?.dataset.destroyed === "true", null, { timeout: 2000 });
  assert.ok(await page.locator(".echo-debris").count() > 0);
  await page.waitForFunction(() => document.querySelector(".echo-toast")?.textContent?.includes("Sonda imperial"), null, { timeout: 2000 });
  await page.mouse.click(1000, 820);
  await page.waitForTimeout(600);
  assert.equal(await page.locator(".echo-tauntaun").count(), 1);
  await page.screenshot({ path: `${shots}/tauntaun-1440.png` });
  assert.match(page.url(), /\/pt\/sobre$/);
  assert.deepEqual(errors, []);
  await context.close();
});

await check("parado, a neve acumula nos cards", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  await page.locator(".medal-list").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector(".about-page")?.dataset.settled === "true", null, { timeout: 9000 });
  await page.waitForTimeout(4000);
  const drift = await page.locator(".echo-drift").boundingBox();
  assert.ok(drift && drift.y < 900 - 40, `monte de neve visível (${drift?.y})`);
  await page.screenshot({ path: `${shots}/settled-1440.png` });
  await page.mouse.move(400, 400);
  await page.waitForFunction(() => !document.querySelector(".about-page")?.dataset.settled, null, { timeout: 2000 });
  await page.waitForTimeout(700);
  const gone = await page.locator(".echo-drift").boundingBox();
  assert.ok(gone && gone.y >= 900 - 2, "a neve cai ao mexer o mouse");
  await context.close();
});

await check("créditos: o transporte decola e o CTA leva ao contato", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  await page.locator(".chapter--recruit").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator(".chapter--recruit").getAttribute("data-launch"), "true");
  assert.equal(await page.locator(".chapter--recruit .button.primary").getAttribute("href"), "/pt/servicos#contato");
  await page.screenshot({ path: `${shots}/recruit-1440.png` });
  await context.close();
});

await check("comlink: terminal dispara segredos, contador persiste e avisa sinais de outra página", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  await page.getByRole("button", { name: "Abrir o canal secreto" }).click();
  const dialog = page.locator("dialog.comlink");
  assert.ok(await dialog.evaluate((element) => element.open));
  await page.locator("#comlink-input").fill("forca");
  await page.keyboard.press("Enter");
  assert.match(await page.locator(".comlink__feedback").innerText(), /fora de alcance/);
  await page.locator("#comlink-input").fill("Help me");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("dialog.echo-holo")?.open, null, { timeout: 2000 });
  await page.keyboard.press("Escape");
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("holonet-secrets") ?? "[]")), ["holo"]);
  await page.getByRole("button", { name: "Abrir o canal secreto" }).click();
  assert.equal(await page.locator(".comlink__list li[data-found]").count(), 1);
  await page.screenshot({ path: `${shots}/comlink-1440.png` });
  await page.locator(".comlink__list li[data-found] button").click();
  await page.waitForFunction(() => document.querySelector("dialog.echo-holo")?.open, null, { timeout: 2000 });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Abrir o canal secreto" }).click();
  const wipe = page.locator(".comlink__reset");
  await wipe.click();
  assert.equal(await wipe.getAttribute("data-confirming"), "true", "o primeiro clique só pede confirmação");
  assert.equal(await page.locator(".comlink__list li[data-found]").count(), 1);
  await wipe.click();
  assert.equal(await page.locator(".comlink__list li[data-found]").count(), 0);
  assert.equal(await page.evaluate(() => localStorage.getItem("holonet-secrets")), null);
  assert.equal(await page.locator(".comlink__reset").count(), 0);
  assert.match(await page.locator(".comlink-toggle__count").innerText(), /^0\//);
  assert.equal(await page.locator(".comlink").evaluate(() => getComputedStyle(document.body).cursor), "auto", "cursor nativo volta com a janela aberta");
  assert.deepEqual(errors, []);
  await context.close();
});

await check("hoth congela os cards; cada gelo quebra em 3 golpes (clique e Enter)", async () => {
  const { context, page, errors } = await open();
  await skipIntro(page);
  await page.keyboard.type("hoth");
  await page.waitForFunction(() => document.querySelectorAll(".ice-block").length === 8, null, { timeout: 5000 });
  await page.locator(".medal-list").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${shots}/frozen-1440.png` });
  const ice = page.locator(".medal-list .ice-block").first();
  await ice.click(); assert.equal(await ice.getAttribute("data-hits"), "1");
  await ice.click(); assert.equal(await ice.getAttribute("data-hits"), "2");
  await ice.click();
  await page.waitForFunction(() => document.querySelectorAll(".medal-list .ice-block").length === 3, null, { timeout: 2000 });
  assert.equal(await page.locator(".medal").first().getAttribute("aria-pressed"), "false", "o golpe não vira a medalha");
  const next = page.locator(".medal-list .ice-block").first();
  await next.focus();
  for (let index = 0; index < 3; index++) await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelectorAll(".medal-list .ice-block").length === 2, null, { timeout: 2000 });
  await page.waitForFunction(() => document.querySelector(".echo-toast")?.textContent?.includes("Gelo quebrado 2/8"), null, { timeout: 2000 });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("C-3PO fala, perde o braço no 5º toque e o recupera", async () => {
  const { context, page } = await open();
  await skipIntro(page);
  const droid = page.getByRole("button", { name: "Falar com o C-3PO" });
  await droid.scrollIntoViewIfNeeded();
  await droid.click();
  await page.waitForTimeout(1200);
  assert.match(await page.locator(".threepio__bubble").innerText(), /seis milhões/);
  for (let index = 0; index < 4; index++) await droid.click();
  assert.equal(await page.locator(".threepio").getAttribute("data-armless"), "true");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/threepio-1440.png` });
  await page.waitForTimeout(3200);
  assert.equal(await page.locator(".threepio").getAttribute("data-armless"), null);
  await context.close();
});

await check("celular: segurar a Leia abre a holomensagem e o comlink abre como painel", async () => {
  const { context, page, errors } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 6000 });
  await page.waitForTimeout(1500);
  const leia = await page.locator(".echo-leia").boundingBox();
  await page.locator(".echo-leia").scrollIntoViewIfNeeded();
  const box = await page.locator(".echo-leia").boundingBox();
  assert.ok(leia && box);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.waitForTimeout(800); await page.mouse.up();
  await page.waitForFunction(() => document.querySelector("dialog.echo-holo")?.open, null, { timeout: 2000 });
  await page.keyboard.press("Escape");
  assert.ok(await visible(page, ".echo-touch-hint"));
  await page.locator(".comlink-toggle").tap();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/comlink-390.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("movimento reduzido: sem transmissão, sem botão do canhão, missões acesas", async () => {
  const { context, page, errors } = await open({ reducedMotion: "reduce" });
  assert.notEqual(await page.evaluate(() => document.documentElement.dataset.boot), "pending");
  assert.equal(await visible(page, ".echo-ion-button"), false);
  assert.equal(await page.locator('.ops-role[data-lit="true"]').count(), await page.locator(".ops-role").count());
  assert.equal(await page.locator(".dossier-card").getAttribute("data-frozen"), null);
  assert.equal(await page.locator("[data-echo-hero]").getAttribute("data-leia"), null, "a Leia pintada continua parada");
  assert.equal(await page.locator(".echo-actor").evaluate((element) => getComputedStyle(element).visibility), "hidden");
  await page.keyboard.type("help me");
  assert.ok(await page.locator("dialog.echo-holo").evaluate((dialog) => dialog.open), "a holomensagem funciona sem animação");
  await page.keyboard.press("Escape");
  await page.screenshot({ path: `${shots}/reduced-1440.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

await check("sem JavaScript: conteúdo completo e sem overlay", async () => {
  const { context, page } = await open({ javaScriptEnabled: false });
  assert.equal(await visible(page, ".boot"), false);
  assert.ok(await visible(page, "h1#about-title"));
  assert.equal(await visible(page, ".ops-filter"), false);
  assert.equal(await visible(page, ".dossier-ice"), false);
  assert.equal(await page.locator(".medal").count(), 4);
  await page.screenshot({ path: `${shots}/nojs-full.png`, fullPage: true });
  await context.close();
});

for (const width of [390, 900, 1280, 1920]) await check(`${width}px: legível e sem rolagem horizontal`, async () => {
  const mobile = width < 700;
  const { context, page } = await open({ viewport: { width, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile });
  await page.waitForFunction(() => document.documentElement.dataset.boot !== "pending", null, { timeout: 6000 });
  await page.waitForTimeout(1600);
  assert.equal(await page.locator(".echo-copy h1").evaluate((element) => getComputedStyle(element).opacity), "1");
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: `${shots}/hero-${width}.png` });
  await page.locator("#trajetoria").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${shots}/ops-${width}.png` });
  await context.close();
});

await browser.close();
if (failures.length) { console.error(`${failures.length} falha(s)`); process.exit(1); }
console.log("Base Eco: todos os cenários passaram");
