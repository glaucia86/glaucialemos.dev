import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:3110';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await fs.mkdir('docs/screenshots/journey', { recursive: true });
try {
  for (const lang of ['pt', 'en', 'es']) {
    await page.goto(`${base}/${lang}`);
    await expect(page.locator('.typescript-demo')).toBeVisible();
    const choices = page.locator('.demo-controls button');
    await expect(choices.first()).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.demo-example:visible')).toContainText('"2"');
    await choices.last().focus();
    await page.keyboard.press('Enter');
    await expect(choices.last()).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.demo-example:visible')).toContainText('soma(2, 3)');
    await expect(page.locator('.demo-example:visible')).toContainText('5');
    await choices.first().click();
    await expect(page.locator('.demo-example:visible')).toContainText('"23"');
    await expect(page.locator('.country-controls button[aria-pressed="true"]')).toHaveAttribute('data-country', 'Brasil');
    assert.ok(await page.evaluate(async () => {
      const svg = await fetch('/maps/world-land.svg').then(response => response.text());
      const path = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('path').getAttribute('d');
      const context = document.createElement('canvas').getContext('2d');
      return context.isPointInPath(new Path2D(path), 266.7334, 227.101, 'evenodd');
    }), 'São Paulo must lie on the land projection');
    const countries = page.locator('.country-controls button');
    for (let i = 0; i < await countries.count(); i++) {
      await countries.nth(i).focus();
      await page.keyboard.press('Enter');
      await expect(countries.nth(i)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.event-country:visible')).toHaveCount(1);
      assert.ok(await page.locator('.event-country:visible li').count() > 0);
      if (await countries.nth(i).getAttribute('data-country') === 'unlocated') {
        await expect(page.locator('.event-map circle[data-selected="true"]')).toHaveCount(0);
      }
    }
    for (const width of [320, 390, 768, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}/${lang}`);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${lang}/${width}: overflow`);
      await page.locator('.portrait-frame img').evaluate(img => img.decode());
      await page.locator('.event-map-frame').scrollIntoViewIfNeeded();
      await page.locator('.map-land-image').evaluate(img => img.decode());
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `docs/screenshots/journey/${lang}-${width}.png`, fullPage: true, animations: 'disabled' });
    }
    for (const subject of ['workshop', 'mentoria', 'palestra', 'unknown']) {
      await page.goto(`${base}/${lang}/servicos?assunto=${subject}#contato`);
      if (subject === 'unknown') await expect(page.locator('textarea')).toHaveValue('');
      else assert.ok((await page.locator('textarea').inputValue()).length > 15);
    }
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage();
  for (const lang of ['pt', 'en', 'es']) {
    await staticPage.goto(`${base}/${lang}`);
    await expect(staticPage.locator('.demo-example:visible')).toHaveCount(2);
    assert.ok(await staticPage.locator('.event-country:visible').count() > 1);
    await expect(staticPage.locator('.demo-controls')).toBeHidden();
    await expect(staticPage.locator('.event-country li')).toHaveCount(105);
    await expect(staticPage.locator('.project-feature a')).toHaveAttribute('href', 'https://github.com/glaucia86/curso-typescript-zero-to-hero');
    await expect(staticPage.locator('.page-hero .hero-link')).toHaveAttribute('href', '#projetos');
  }
  await noJs.close();
  assert.deepEqual(errors, []);
  console.log('PASS journey: demo, countries, unlocated events, subjects, 15 responsive layouts, reduced motion, no JavaScript.');
} finally { await browser.close(); }
