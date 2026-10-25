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
  await page.locator('.badge__flip').first().click();
  assert.ok(await page.locator('.badge a').first().isVisible());
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
  assert.ok(!(await found(page)).includes("paw-tracks"));
  assert.equal(await page.locator(".niveora-hot--capsule").isVisible(), false);
  await hot(page, "prince");
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


await check("mapa restaurado: trilhas, detalhes junto as barras e fallback de etapa", async () => {
  const { context, page, errors } = await open({ reducedMotion: "reduce" }, "pt", "?era=unknown");
  await ready(page);
  assert.equal(await page.locator("[data-ops]").getAttribute("data-focus"), "all");
  assert.equal(await page.locator("[data-ops]").getAttribute("data-view"), "map");
  assert.equal(await page.locator(".career-detail, .career-views, .career-select").count(), 0);
  await page.locator('.ops-filter [data-era="leadership"]').click();
  assert.match(page.url(), /era=leadership/);
  const roles = page.locator('.ops-era:not([hidden]) .ops-role');
  assert.ok(await roles.count() > 1);
  const button = roles.last().locator('button');
  await button.focus(); await page.keyboard.press('Enter');
  assert.equal(await button.getAttribute('aria-expanded'), 'true');
  assert.ok(await roles.last().locator('.ops-role__brief a').isVisible());
  await page.locator('.ops-filter [data-era="all"]').click();
  const geometry = await page.locator('.ops-role').evaluateAll(items => items.map(el => ({
    width: el.getBoundingClientRect().width, duration: Number(el.style.getPropertyValue('--w')),
    lane: Number(el.style.getPropertyValue('--lane')), y: el.getBoundingClientRect().y,
  })));
  assert.ok(new Set(geometry.map(item => item.lane)).size > 1);
  const sorted = geometry.sort((a, b) => a.duration - b.duration);
  assert.ok(sorted.at(-1).width > sorted[0].width);
  await page.locator('.ops-filter [data-era="foundation"]').click();
  const last = page.locator('.ops-era:not([hidden]) .ops-role').first();
  await last.locator('button').click();
  const chart = await page.locator('.ops-chart').boundingBox();
  const brief = await last.locator('.ops-role__brief').boundingBox();
  assert.ok(brief.x >= chart.x - 2 && brief.x + brief.width <= chart.x + chart.width + 2);
  assert.deepEqual(errors, []); await context.close();
});

for (const touch of [false, true]) await check(`insígnias: links e foco, toque=${touch}`, async () => {
  const { context, page, errors } = await open({ reducedMotion: "reduce", hasTouch: touch, viewport: { width: touch ? 390 : 1440, height: 900 } });
  const links = [
    'https://mvp.microsoft.com/pt-BR/MVP/profile/d3200941-395d-423b-a0ec-eb0577d3bb86',
    'https://learn.chatgpt.com/community/codex-ambassadors/directory',
    'https://devin.ai/community',
    'https://www.packtpub.com/en-us/product/building-agentic-ai-apps-with-nextjs-and-typescript-9781806700936',
  ];
  for (let i = 0; i < 4; i++) {
    const badge = page.locator('.badge').nth(i); const button = badge.locator('.badge__flip');
    assert.equal(await badge.locator('a').isVisible(), false);
    if (touch) await button.tap(); else { await button.focus(); await page.keyboard.press('Enter'); }
    assert.equal(await badge.locator('a').getAttribute('href'), links[i]);
    assert.ok(await badge.locator('a').isVisible());
    assert.equal(await badge.locator('.badge__face--front').isVisible(), false);
    assert.equal(await badge.locator('.badge__face--back').evaluate(el => getComputedStyle(el).animationName), 'none');
    await badge.locator('a').focus(); assert.ok(await badge.locator('a').evaluate(el => el === document.activeElement));
    if (touch) await button.tap(); else { await button.focus(); await page.keyboard.press('Space'); }
    assert.equal(await badge.locator('a').isVisible(), false);
    assert.ok(await button.evaluate(el => el === document.activeElement));
  }
  assert.deepEqual(errors, []); await context.close();
});

await check('descobertas 0/7 a 7/7, persistência, global excluído e reset pelo rádio', async () => {
  const { context, page, errors } = await open({ reducedMotion: 'reduce' });
  const count = page.locator('.niveora-discoveries');
  assert.match(await count.innerText(), /0\/7/);
  for (const [index, id] of ['paw-tracks', 'memory-capsule', 'whiteout', 'aurora-prism', 'snowdrift', 'between-lines', 'borrowed-star'].entries()) {
    await page.evaluate(id => window.dispatchEvent(new CustomEvent('egg:play', { detail: id })), id);
    await page.waitForFunction(n => document.querySelector('.niveora-discoveries').textContent.includes(`${n}/7`), index + 1);
    await page.keyboard.press('Escape');
  }
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('egg:play', { detail: 'aurora-prism' })));
  assert.match(await count.innerText(), /7\/7/);
  // A second tab updates the same persistent memory through the browser storage event.
  const other = await context.newPage(); await other.goto(`${base}/pt/sobre`, { waitUntil: 'networkidle' });
  await other.evaluate(() => {
    const key = 'galaxia-encantada:eggs:v2'; const ids = JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify([...ids, 'star-map']));
  });
  await page.waitForFunction(() => document.querySelector('.comlink-toggle__count').textContent.startsWith('8/'));
  assert.match(await count.innerText(), /7\/7/);
  await page.reload({ waitUntil: 'networkidle' }); assert.match(await count.innerText(), /7\/7/);
  await page.locator('.comlink-toggle').click(); await page.locator('.comlink__reset').click(); await page.locator('.comlink__reset').click();
  assert.match(await count.innerText(), /0\/7/);
  assert.match(await page.locator('.comlink__progress').innerText(), /0\/26/);
  await other.waitForFunction(() => document.querySelector('.niveora-discoveries').textContent.includes('0/7'));
  assert.deepEqual(errors, []); await context.close();
});

await check('lista sem JS, progresso de gelo, CTA e rodapé nos três idiomas', async () => {
  for (const locale of ['pt', 'en', 'es']) {
    const { context, page } = await open({ javaScriptEnabled: false }, locale);
    assert.equal(await page.locator('[data-ops]').getAttribute('data-view'), 'list');
    assert.equal(await page.locator('.ops-role__brief a').count(), await page.locator('.ops-role').count());
    assert.equal(await page.locator('.badge a:visible').count(), 4);
    for (const badge of await page.locator('.badge').all()) {
      const front = await badge.locator('.badge__face--front').boundingBox();
      const back = await badge.locator('.badge__face--back').boundingBox();
      assert.ok(front && back && back.y >= front.y + front.height - 1, 'faces empilhadas sem JS');
    }
    assert.equal(await page.locator('.reading-progress__hilt').count(), 0);
    assert.equal(await page.locator('.reading-progress__crystal').count(), 1);
    assert.equal(await page.locator('.chapter--expedition a.primary').getAttribute('href'), `/${locale}/servicos#contato`);
    assert.doesNotMatch(await page.locator('footer').innerText(), /Disney|Lucasfilm/);
    await context.close();
  }
});

for (const width of [390, 720, 900]) await check(`lista responsiva e espaço de texto a ${width}px`, async () => {
  // 720 CSS px also covers the reflow of a 1440px display at 200% browser zoom.
  const { context, page } = await open({ reducedMotion: 'reduce', viewport: { width, height: 900 } });
  assert.equal(await page.locator('[data-ops]').getAttribute('data-view'), 'list');
  assert.equal(await page.locator('.career-views').count(), 0);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: `${shots}/interface-${width}.png`, fullPage: true });
  await context.close();
});

await check("Prince lembra a descoberta, cumprimenta sem deslocamento e reinicia após reset", async () => {
  const { context, page, errors } = await open(); await ready(page);
  await hot(page, "glaucia"); await page.waitForSelector("dialog.capsule[open]");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.querySelector('.niveora-hero').dataset.stage === 'idle');
  await page.reload({ waitUntil: 'networkidle' }); await ready(page);
  assert.ok(await visible(page, '.niveora-hot--capsule'));
  const original = await page.locator('.niveora-hot--prince').boundingBox();
  await hot(page, 'prince');
  assert.equal(await stage(page), 'greeting');
  await page.waitForTimeout(950);
  assert.match(await page.locator('.niveora-hero').getAttribute('data-prince'), /^wag-/);
  await hot(page, 'prince'); // Must not restart the 3 s sequence.
  await page.waitForTimeout(2200);
  assert.equal(await stage(page), 'idle');
  assert.equal(await page.locator('.niveora-track[data-on]').count(), 0);
  assert.deepEqual(await page.locator('.niveora-hot--prince').boundingBox(), original);
  await hot(page, 'prince');
  await page.locator('.comlink-toggle').click();
  await page.locator('.comlink__reset').click(); await page.locator('.comlink__reset').click();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('.niveora-hero').dataset.stage === 'idle');
  assert.equal(await page.locator('.niveora-hot--capsule').isVisible(), false);
  await hot(page, 'prince');
  assert.equal(await stage(page), 'tracks');
  assert.ok(!(await found(page)).includes('paw-tracks'));
  await page.waitForFunction(() => document.querySelector('.niveora-hero').dataset.trail === 'walk');
  await page.keyboard.type('nevasca');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('galaxia-encantada:eggs:v2')).includes('paw-tracks'), null, { timeout: 7000 });
  assert.deepEqual(errors, []); await context.close();
});

for (const locale of ['pt', 'en', 'es']) await check(`aurora: idioma local, teclado e registros ${locale}`, async () => {
  const { context, page, errors } = await open({ reducedMotion: 'reduce' }, locale); await ready(page);
  const section = page.locator('.chapter--aurora');
  assert.equal(await section.getAttribute('data-signal'), locale);
  const urls = ['repo-doctor-25a6', 'analyzer-136n', 'contoso-real-estate-63i'];
  for (const [index, lang] of ['pt', 'en', 'es'].entries()) {
    const button = section.locator(`button[lang="${lang}"]`);
    await button.focus(); await page.keyboard.press('Enter');
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    const record = section.locator('article:visible');
    assert.equal(await record.count(), 1);
    assert.equal(await record.getAttribute('lang'), lang);
    assert.ok((await record.locator('a').getAttribute('href')).endsWith(urls[index]));
    assert.ok(await record.locator('time').getAttribute('datetime'));
    assert.equal(await section.locator('.aurora-wave').evaluate(el => Number(getComputedStyle(el).opacity)), 0);
    assert.equal(new URL(page.url()).pathname, `/${locale}/sobre`);
  }
  assert.deepEqual(errors, []); await context.close();
  const fallback = await open({ javaScriptEnabled: false }, locale);
  assert.equal(await fallback.page.locator('.aurora-records article:visible').count(), 3);
  assert.equal(await fallback.page.locator('.aurora-records a:visible').count(), 3);
  await fallback.context.close();
});

await check('aurora: toque, troca rápida, ligação à nave e convite visível', async () => {
  const { context, page, errors } = await open({ hasTouch: true, viewport: { width: 390, height: 844 } }); await ready(page);
  const section = page.locator('.chapter--aurora');
  await section.scrollIntoViewIfNeeded();
  for (const lang of ['es', 'en', 'pt', 'es']) await section.locator(`button[lang="${lang}"]`).tap();
  assert.equal(await section.locator('article:visible').getAttribute('lang'), 'es');
  await page.waitForTimeout(1800);
  assert.equal(await section.locator('.aurora-spark').evaluate(el => Number(getComputedStyle(el).opacity)), 0);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  const scene = await section.locator('.aurora-lake').boundingBox();
  const record = await section.locator('.aurora-records').boundingBox();
  assert.ok(record.y >= scene.y + scene.height);
  await page.locator('.chapter--expedition').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.chapter--expedition').dataset.launch === 'true');
  assert.ok(await page.locator('#expedition-title').isVisible());
  assert.equal(await page.locator('.credits').evaluate(el => Number(getComputedStyle(el).opacity)), 1);
  assert.equal(await page.locator('.chapter--expedition').evaluate(el => getComputedStyle(el).minHeight), '0px');
  assert.deepEqual(errors, []); await context.close();
});

await check('saudação pausa com aba oculta e retoma o tempo ativo', async () => {
  const { context, page } = await open(); await ready(page);
  await page.evaluate(() => {
    localStorage.setItem('galaxia-encantada:eggs:v2', JSON.stringify(['paw-tracks']));
  });
  await page.reload({ waitUntil: 'networkidle' }); await ready(page);
  await hot(page, 'prince');
  await page.waitForTimeout(300);
  // Exercise the visibility observer deterministically, independent of headed/headless tab policy.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const pose = await page.locator('.niveora-hero').getAttribute('data-prince');
  await page.waitForTimeout(3200);
  assert.equal(await stage(page), 'greeting');
  assert.equal(await page.locator('.niveora-hero').getAttribute('data-prince'), pose);
  await page.evaluate(() => {
    delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForFunction(() => document.querySelector('.niveora-hero').dataset.stage === 'idle', null, { timeout: 4500 });
  await context.close();
});

await check('entre linhas: teclado, fontes, filtros e foco ao fechar', async () => {
  const { context, page, errors } = await open({ reducedMotion: 'reduce' }); await ready(page);
  await page.locator('.ops-filter [data-era="foundation"]').click();
  const summary = page.locator('.between-lines > summary');
  await summary.focus(); await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('.between-lines').open);
  assert.equal(await page.locator('.between-lines__note li').count(), 3);
  for (const link of await page.locator('.between-lines__note a').all()) assert.match(await link.getAttribute('href'), /^https:\/\//);
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('galaxia-encantada:eggs:v2')).includes('between-lines'));
  await page.locator('.between-lines .story-close').click();
  assert.ok(await summary.evaluate(el => el === document.activeElement));
  assert.equal(await page.locator('[data-ops]').getAttribute('data-focus'), 'foundation');
  assert.deepEqual(errors, []); await context.close();
});

for (const locale of ['pt', 'en', 'es']) await check(`novos segredos: toque, carta, recarga e reset ${locale}`, async () => {
  const { context, page, errors } = await open({ reducedMotion: 'reduce', hasTouch: true, viewport: { width: 390, height: 844 } }, locale); await ready(page);
  await page.locator('.comlink-toggle').tap();
  await page.locator('#comlink-input').fill('curious letter'); await page.locator('.comlink__terminal button').tap();
  assert.match(await page.locator('.comlink__feedback').innerText(), /3/);
  assert.equal(await page.locator('.curious-letter').isVisible(), false);
  await page.keyboard.press('Escape');
  await page.locator('.prince-trail__call').tap();
  assert.equal(await page.locator('.prince-trail').getAttribute('data-walking'), 'false');
  assert.ok(!(await found(page)).includes('borrowed-star'));
  await page.locator('.borrowed-star summary').tap();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('galaxia-encantada:eggs:v2')).includes('borrowed-star'));
  await page.locator('.between-lines summary').tap();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('galaxia-encantada:eggs:v2')).includes('between-lines'));
  await page.evaluate(() => dispatchEvent(new CustomEvent('egg:play', { detail: 'whiteout' })));
  await page.locator('.comlink-toggle').tap();
  assert.ok(await page.locator('.comlink__envelope').isVisible());
  await page.locator('.comlink__envelope').tap();
  await page.waitForSelector('.curious-letter[open]');
  assert.ok((await found(page)).includes('curious-letter'));
  assert.ok((await page.locator('.curious-letter__paper p').first().innerText()).length > 100);
  await page.keyboard.press('Escape');
  assert.ok(await page.locator('.comlink-toggle').evaluate(el => el === document.activeElement));
  await page.reload({ waitUntil: 'networkidle' }); await ready(page);
  assert.ok(await page.locator('#borrowed-star').isVisible());
  await page.locator('.comlink-toggle').tap();
  assert.ok(await page.locator('.comlink__envelope').isVisible());
  await page.locator('.comlink__reset').tap(); await page.locator('.comlink__reset').tap();
  assert.equal(await page.locator('.comlink__envelope').count(), 0);
  assert.equal(await page.locator('#borrowed-star').isVisible(), false);
  assert.equal(await page.locator('.between-lines').evaluate(el => el.open), false);
  assert.deepEqual(await found(page), []);
  assert.deepEqual(errors, []); await context.close();
});

await check('Prince no diário: pausa, cliques repetidos e reset durante a caminhada', async () => {
  const { context, page, errors } = await open(); await ready(page);
  await page.locator('.prince-trail__call').click();
  await page.waitForFunction(() => document.querySelector('.prince-trail').dataset.paused === 'false');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const before = await page.locator('.prince-trail__traveler').getAttribute('style');
  await page.waitForTimeout(2600);
  assert.equal(await page.locator('.prince-trail__traveler').getAttribute('style'), before);
  assert.equal(await page.locator('.prince-trail').getAttribute('data-walking'), 'true');
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(1000); await page.locator('.prince-trail__call').click();
  await page.waitForTimeout(1600);
  assert.equal(await page.locator('.prince-trail').getAttribute('data-walking'), 'false');
  await page.locator('.between-lines summary').click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('galaxia-encantada:eggs:v2')).includes('between-lines'));
  await page.locator('.prince-trail__call').click();
  await page.locator('.comlink-toggle').click();
  await page.locator('.comlink__reset').click(); await page.locator('.comlink__reset').click();
  await page.waitForTimeout(2700);
  assert.equal(await page.locator('.prince-trail').getAttribute('data-walking'), 'false');
  assert.equal(await page.locator('#borrowed-star').isVisible(), false);
  assert.deepEqual(await found(page), []);
  assert.deepEqual(errors, []); await context.close();
});

await check('carta global e comandos dos novos segredos', async () => {
  const { context, page, errors } = await open({ reducedMotion: 'reduce' }); await ready(page);
  for (const phrase of ['entre linhas', 'estrela emprestada']) {
    await page.locator('.comlink-toggle').click();
    await page.locator('#comlink-input').fill(phrase); await page.locator('.comlink__terminal button').click();
    await page.waitForFunction(n => JSON.parse(localStorage.getItem('galaxia-encantada:eggs:v2')).length >= n, phrase === 'entre linhas' ? 1 : 2);
  }
  await page.evaluate(() => dispatchEvent(new CustomEvent('egg:play', { detail: 'whiteout' })));
  await page.goto(`${base}/pt/conteudo`, { waitUntil: 'networkidle' }); await ready(page);
  await page.locator('.comlink-toggle').click(); await page.locator('.comlink__envelope').click();
  await page.waitForSelector('.curious-letter[open]');
  assert.ok((await found(page)).includes('curious-letter'));
  assert.deepEqual(errors, []); await context.close();
});

for (const locale of ['pt', 'en', 'es']) await check(`histórias sem JavaScript ${locale}`, async () => {
  const { context, page } = await open({ javaScriptEnabled: false }, locale);
  await page.locator('.between-lines summary').click();
  assert.equal(await page.locator('.between-lines__note a:visible').count(), 3);
  await page.locator('.borrowed-star summary').click();
  assert.ok(await page.locator('.borrowed-star__note').isVisible());
  await page.locator('.story-letter-fallback summary').click();
  assert.ok(await page.locator('.story-letter-fallback p').first().isVisible());
  assert.equal(await page.locator('.prince-trail__call').isVisible(), false);
  await context.close();
});

await check('Prince no diário volta a responder após alternar movimento reduzido', async () => {
  const { context, page, errors } = await open(); await ready(page);
  await page.locator('.prince-trail__call').click();
  await page.waitForTimeout(300);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelector('.prince-trail').dataset.walking === 'false');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.prince-trail').getAttribute('data-walking'), 'false');
  await page.locator('.prince-trail__call').click();
  assert.equal(await page.locator('.prince-trail').getAttribute('data-walking'), 'true');
  assert.deepEqual(errors, []); await context.close();
});

await check('reset em outra aba recolhe estrela, anotação e carta', async () => {
  const { context, page, errors } = await open({ reducedMotion: 'reduce' }); await ready(page);
  await page.locator('.between-lines summary').click();
  await page.locator('.prince-trail__call').click(); await page.locator('.borrowed-star summary').click();
  await page.evaluate(() => dispatchEvent(new CustomEvent('egg:play', { detail: 'whiteout' })));
  await page.locator('.comlink-toggle').click(); await page.locator('.comlink__envelope').click();
  await page.waitForSelector('.curious-letter[open]');
  const other = await context.newPage(); await other.goto(`${base}/pt/sobre`, { waitUntil: 'networkidle' });
  await other.evaluate(() => localStorage.removeItem('galaxia-encantada:eggs:v2'));
  await page.waitForFunction(() => !document.querySelector('.curious-letter').open && document.querySelector('#borrowed-star').hidden && !document.querySelector('.between-lines').open);
  assert.equal(await page.locator('.comlink__envelope').count(), 0);
  assert.deepEqual(errors, []); await context.close();
});

await browser.close();
if (failures.length) { console.error(`${failures.length} falha(s)`); process.exit(1); }
console.log("Nivéora: todos os cenários passaram");
