import { expect } from '@playwright/test';
import { baseURL, launchBrowser } from './browser-utils.mjs';
const browser = await launchBrowser();
try {
 const page = await browser.newPage();
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 for (const [width,height] of [[1280,1000],[390,900]]) {
  await page.setViewportSize({width,height});
  await page.goto(`${baseURL}/pt/eventos`);
  await expect(page.locator('.event-stats strong').nth(0)).toHaveText('116');
  await expect(page.locator('.event-stats strong').nth(1)).toHaveText('9');
  await expect(page.locator('.event-countries li')).toHaveCount(9);
  await expect(page.locator('.event-history details').first()).toHaveAttribute('open','');
  await expect(page.locator('.event-history')).toContainText('AgentCon Rio de Janeiro');
  await expect(page.locator('canvas.globe')).toHaveAttribute('width', /[1-9]\d+/);
  await page.locator('.globe-wrap').scrollIntoViewIfNeeded();
  await page.screenshot({path:`docs/screenshots/event-globe-${width}.png`});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 }
 const staticPage = await browser.newPage({ javaScriptEnabled: false });
 await staticPage.goto(`${baseURL}/pt/eventos`);
 await expect(staticPage.locator('.event-stats strong').nth(1)).toHaveText('9');
 await expect(staticPage.locator('.event-history')).toContainText('AgentCon');
 await staticPage.close();
 expect(errors).toEqual([]);
 console.log('PASS: globe runtime, 116 records, 9 countries, latest year expanded, desktop/mobile layout.');
} finally { await browser.close(); }
