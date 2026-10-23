import { expect } from '@playwright/test';
import { baseURL, launchBrowser } from './browser-utils.mjs';
const browser = await launchBrowser();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${baseURL}/pt`);
  const scene = page.locator('.hero-scene-layer--dagobah');
  await expect(scene).toHaveAttribute('data-motion', 'running');
  await expect(page.locator('.dagobah-spores i')).toHaveCount(24);
  await page.mouse.move(1100, 400);
  await expect(scene).toHaveAttribute('data-focused', 'true');
  expect(await scene.evaluate(el => parseFloat(el.style.getPropertyValue('--look-x')))).toBeGreaterThan(0);
  await page.mouse.move(0, 0);
  await expect(scene).not.toHaveAttribute('data-focused', 'true');
  await page.mouse.move(1100, 400);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(scene).toHaveAttribute('data-motion', 'paused');
  await expect(scene).not.toHaveAttribute('data-focused', 'true');
  expect(await scene.evaluate(el => el.style.getPropertyValue('--look-x'))).toBe('');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({width: 390, height: 1000});
  await expect(scene).toHaveAttribute('data-motion', 'running');
  expect(await page.locator('.dagobah-spores i:visible').count()).toBe(8);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  console.log('PASS: pointer depth, pointer exit, reduced-motion cleanup and mobile budget.');
} finally { await browser.close(); }
