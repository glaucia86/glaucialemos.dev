import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const require = createRequire(import.meta.url);
const base = process.env.BASE_URL || 'http://127.0.0.1:3110';
const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: 'reduce' });
const reports = [];
try {
  for (const lang of ['pt', 'en', 'es']) {
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}/${lang}`);
      await page.locator('.demo-controls button').last().click();
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const results = await page.evaluate(() => window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      }));
      reports.push({ lang, width, violations: results.violations, incomplete: results.incomplete.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })) });
      await page.keyboard.press('Tab');
      for (const selector of ['.demo-controls button', '.country-controls button']) {
        for (const button of await page.locator(selector).all()) {
          await button.focus();
          assert.ok(await button.evaluate(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.height >= 44 && rect.width >= 44 && element.matches(':focus-visible') && style.outlineStyle !== 'none';
          }), `${lang}/${width}: touch target or keyboard focus ${selector}`);
        }
      }
    }
  }
  await fs.writeFile('docs/journey-accessibility.json', JSON.stringify(reports, null, 2) + '\n');
  assert.deepEqual(reports.flatMap(report => report.violations.map(issue => ({ lang: report.lang, width: report.width, id: issue.id, nodes: issue.nodes.map(node => node.target) }))), []);
  console.log('PASS: axe WCAG A/AA, keyboard focus and 44px interaction targets at 320/1280px in PT/EN/ES.');
} finally { await browser.close(); }
