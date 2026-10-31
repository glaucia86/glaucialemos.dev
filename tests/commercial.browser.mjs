// Run only by Glaucia with her server. No server or real messages are started here.
// PowerShell: $env:BASE_URL='http://127.0.0.1:3100'; node tests/commercial.browser.mjs
// PHOTO_EXPECT=approved requires the chosen portrait and activity photo to be present.
// Optional BASELINE_URL captures the same first screens from the previous version.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { mockContact } from './contact-browser-mocks.mjs';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:3100';
const photosApproved = process.env.PHOTO_EXPECT === 'approved';
const shots = path.join(os.tmpdir(), 'prova-social');
fs.mkdirSync(shots, { recursive: true });
const browser = await chromium.launch();
const failures = [];
const viewports = [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
const modes = [
  { name: 'motion', javaScriptEnabled: true, reducedMotion: 'no-preference' },
  { name: 'reduced', javaScriptEnabled: true, reducedMotion: 'reduce' },
  { name: 'no-js', javaScriptEnabled: false, reducedMotion: 'reduce' },
];
const copy = {
  pt: { headline: 'Palestras, workshops e mentorias', offers: ['Palestras', 'Workshops', 'Mentorias'] },
  en: { headline: 'Talks, workshops and mentoring', offers: ['Talks', 'Workshops', 'Mentoring'] },
  es: { headline: 'Charlas, talleres y mentorías', offers: ['Charlas', 'Talleres', 'Mentorías'] },
};
const waitlistSuccess = {
  pt: 'Confira sua caixa de entrada e a pasta de spam. Abra o link do e-mail e confirme sua inscrição na lista de espera.',
  en: 'Check your inbox and spam folder. Open the email link and confirm your waitlist registration.',
  es: 'Revisa tu bandeja de entrada y la carpeta de spam. Abre el enlace del correo y confirma tu inscripción en la lista de espera.',
};
const subjects = ['palestra', 'workshop', 'mentoria'];
const serviceIds = ['palestras', 'workshop-sdlc-agentes-ia', 'mentoria-consultoria-lideranca-tecnica'];

async function check(name, run) {
  try { await run(); console.log(`ok - ${name}`); }
  catch (error) { failures.push(name); console.error(`not ok - ${name}\n${error.stack}`); }
}

async function open(viewport, mode) {
  const context = await browser.newContext({ viewport, javaScriptEnabled: mode.javaScriptEnabled, reducedMotion: mode.reducedMotion, hasTouch: viewport.width < 600 });
  if (mode.javaScriptEnabled) await context.addInitScript(() => {
    sessionStorage.setItem('galaxia-boot', 'done');
    sessionStorage.setItem('aurelia-boot', 'done');
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  const contact = await mockContact(page, base);
  return { context, page, contact, errors };
}

async function firstScreen(page, url, file, javaScriptEnabled) {
  await page.goto(url);
  if (javaScriptEnabled) await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('main .page-hero .actions')).toBeVisible();
  // Wait for the existing boot/hero entrance; do not add a fixed animation sleep.
  if (javaScriptEnabled) await expect(page.locator('main .page-hero .actions')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: path.join(shots, file) });
}

try {
  // Requires the five contact variables plus WAITLIST_SIGNING_SECRET (32+ chars).
  // The shared mock intercepts the action itself; no confirmation mail is sent.
  for (const lang of ['pt', 'en', 'es']) await check(`${lang}: lista de espera pede confirmação por e-mail`, async () => {
    const { context, page, contact } = await open(viewports[0], modes[1]);
    try {
      await page.goto(`${base}/${lang}/servicos#lista-de-espera`);
      const form = page.locator('#lista-de-espera form');
      await expect(form.locator('[name=name]')).toBeEnabled();
      await form.locator('[name=name]').fill('Ana');
      await form.locator('[name=email]').fill('ana@example.com');
      await form.locator('[name=interest][value=curso-gravado]').check();
      await form.locator('[name=consent]').check();
      await expect(form.locator('[name="cf-turnstile-response"]')).toHaveValue('browser-mock-token:waitlist');
      await form.locator('button[type=submit]').click();
      await expect(page.locator('#lista-de-espera [role=status]')).toHaveText(waitlistSuccess[lang]);
      assert.equal(contact.posts.length, 1);
      assert.deepEqual(contact.providers, []);
    } finally { await context.close(); }
  });
  for (const lang of ['pt', 'en', 'es']) for (const viewport of viewports) for (const mode of modes) {
    await check(`${lang} ${viewport.width} ${mode.name}: apresentação, formatos e fontes`, async () => {
      const { context, page, contact, errors } = await open(viewport, mode);
      try {
        for (const route of ['', '/servicos']) {
          const key = `${lang}-${route ? 'servicos' : 'home'}-${viewport.width}-${mode.name}`;
          if (process.env.BASELINE_URL) await firstScreen(page, `${process.env.BASELINE_URL}/${lang}${route}`, `${key}-before.png`, mode.javaScriptEnabled);
          await firstScreen(page, `${base}/${lang}${route}`, `${key}-after.png`, mode.javaScriptEnabled);
          await expect(page.locator('main h1')).toHaveCount(1);
          if (route) await expect(page.locator('main h1')).toHaveText(copy[lang].headline);
          else await expect(page.locator('main h1')).toHaveAttribute('aria-label', 'Glaucia Lemos');
          await expect(page.locator('.credibility-experience li')).toHaveCount(route ? 3 : 0);
          if (route) await expect(page.locator('.credibility-experience')).toBeInViewport();
          else await expect(page.locator('.credibility-experience')).toHaveCount(0);
          await expect(page.locator('.credibility-portrait')).toHaveCount(photosApproved ? 1 : 0);
          if (photosApproved) await expect(page.locator('.credibility-portrait')).toBeInViewport();
          await expect(page.locator('.credibility-gallery')).toHaveCount(photosApproved && route ? 1 : 0);
          const links = page.locator('.page-hero .actions a');
          await expect(links.nth(0)).toHaveAttribute('href', route ? '#contato' : `/${lang}/servicos#contato`);
          await expect(links.nth(1)).toHaveAttribute('href', '#formatos');
          const order = await page.locator('main').evaluate(main => {
            const formats = main.querySelector('#formatos');
            const hero = main.querySelector('.page-hero');
            const next = main.querySelector('#orbitas, #tripulante');
            return Boolean(hero.compareDocumentPosition(formats) & Node.DOCUMENT_POSITION_FOLLOWING)
              && Boolean(formats.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING);
          });
          assert.ok(order, 'Formatos deve vir entre o hero e os capítulos narrativos');
          const cards = page.locator('#formatos article');
          await expect(cards).toHaveCount(3);
          for (let i = 0; i < 3; i++) {
            await expect(cards.nth(i).getByRole('heading', { level: 3 })).toHaveText(copy[lang].offers[i]);
            await expect(cards.nth(i).getByRole('link')).toHaveAttribute('href', `/${lang}/servicos?assunto=${subjects[i]}#contato`);
          }
          // The source links and photo URLs must resolve to local, dimensioned images.
          const imageInfo = await page.locator('.credibility-experience img, .credibility-portrait img').evaluateAll(images => images.map(img => ({ src: img.getAttribute('src'), width: img.width, height: img.height, loaded: img.complete && img.naturalWidth > 0 })));
          assert.ok(imageInfo.every(img => img.src.startsWith('/') && img.width > 0 && img.height > 0));
          if (mode.javaScriptEnabled) await expect.poll(async () => page.locator('.credibility-experience img, .credibility-portrait img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Sem overflow horizontal');
          if (mode.javaScriptEnabled) {
            // A keyboard activation reaches the plain anchor, including with motion reduced.
            await links.nth(1).focus(); await page.keyboard.press('Enter');
            await expect(page).toHaveURL(/#formatos$/);
          } else await links.nth(1).click();
          await expect(page.locator('#formats-title')).toBeInViewport();
          await page.screenshot({ path: path.join(shots, `${key}-formats.png`) });
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(contact.posts, []);
      } finally { await context.close(); }
    });
  }

  for (const lang of ['pt', 'en', 'es']) for (let i = 0; i < subjects.length; i++) {
    for (const mode of modes) await check(`${lang} ${subjects[i]} ${mode.name}: assunto e portal`, async () => {
      const { context, page, contact, errors } = await open(viewports[0], mode);
      try {
        await page.goto(`${base}/${lang}/servicos`);
        await page.locator(`#formatos [data-offer="${subjects[i]}"] a`).click();
        await expect(page).toHaveURL(new RegExp(`assunto=${subjects[i]}#contato$`));
        await expect(page.locator(`#contato [name="service"][value="${serviceIds[i]}"]`)).toBeChecked();
        if (mode.javaScriptEnabled) {
          await expect(page.locator('.contact-portal')).toHaveAttribute('data-open', 'true');
          await expect(page.locator('#contact-title')).toBeFocused();
          await page.keyboard.press('Tab');
          assert.ok(await page.evaluate(() => Boolean(document.activeElement.closest('.contact-portal'))));
          await page.keyboard.press('Escape');
          await expect(page.locator('.contact-portal')).not.toHaveAttribute('data-open', 'true');
        } else await expect(page.locator('#contact-title')).toBeInViewport();
        assert.deepEqual(errors, []); assert.deepEqual(contact.posts, []);
      } finally { await context.close(); }
    });
  }
} finally { await browser.close(); }
console.log(`Capturas: ${shots}`);
if (failures.length) { console.error(`${failures.length} cenário(s) falharam.`); process.exitCode = 1; }
