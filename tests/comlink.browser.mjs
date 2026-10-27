// Run against an existing server: BASE_URL=http://127.0.0.1:3100 node tests/comlink.browser.mjs
import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';
import { baseURL, launchBrowser } from './browser-utils.mjs';

const ids = [...readFileSync(new URL('../src/lib/egg-catalog.ts', import.meta.url), 'utf8')
  .matchAll(/id: "([^"]+)"/g)].map(match => match[1]);
const browser = await launchBrowser();
try {
  for (const [width, height] of [[1440, 680], [390, 844]]) {
    const mobile = width < 640;
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
    try {
      const page = await context.newPage();
      // All discoveries expose replay buttons and both optional shortcuts. The list stays scoped to this world.
      await page.addInitScript(found => {
        sessionStorage.setItem('atlas-boot', 'done');
        localStorage.setItem('galaxia-encantada:eggs:v2', JSON.stringify(found));
      }, ids);
      await page.goto(`${baseURL}/pt/eventos`);
      await page.locator('.comlink-toggle').click();
      const dialog = page.locator('dialog.comlink');
      const scroll = dialog.locator('.comlink__scroll');
      const last = dialog.locator('.comlink__list > li').last();
      await expect(dialog).toBeVisible();
      await dialog.locator('.comlink__panel').evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
      await expect(dialog.locator('#comlink-input')).toBeFocused();
      await expect(scroll).toHaveCSS('overflow-y', 'auto');
      await expect.poll(() => scroll.evaluate(el => el.clientHeight > 0 && el.clientHeight < el.scrollHeight)).toBe(true);
      await expect.poll(() => dialog.locator('.comlink__panel').evaluate(el => {
        const box = el.getBoundingClientRect();
        return box.top >= 0 && box.bottom <= innerHeight;
      })).toBe(true);

      // The title, terminal and feedback must stay put while the final entry becomes fully reachable.
      const fixed = '.comlink__head, .comlink__progress, .comlink__terminal, .comlink__feedback';
      const tops = await dialog.locator(fixed).evaluateAll(elements => elements.map(el => el.getBoundingClientRect().top));
      const lastIsInside = () => last.evaluate(el => {
        const item = el.getBoundingClientRect();
        const frame = el.closest('.comlink__scroll').getBoundingClientRect();
        return item.top >= frame.top - 1 && item.bottom <= frame.bottom + 1;
      });
      await scroll.evaluate(el => { el.scrollTop = el.scrollHeight; });
      await expect.poll(lastIsInside).toBe(true);
      await scroll.evaluate(el => { el.scrollTop = 0; });
      await last.evaluate(el => el.scrollIntoView({ block: 'end' }));
      await expect.poll(lastIsInside).toBe(true);
      expect(await dialog.locator(fixed).evaluateAll(elements => elements.map(el => el.getBoundingClientRect().top))).toEqual(tops);

      // Native keys and wheel/touch must reach the scroll container with Lenis enabled.
      for (const key of ['PageDown', 'ArrowDown']) {
        await scroll.focus();
        await scroll.evaluate(el => { el.scrollTop = 0; });
        await page.keyboard.press(key);
        await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
      }
      await scroll.evaluate(el => { el.scrollTop = 0; });
      const box = await scroll.boundingBox();
      if (mobile) {
        const cdp = await context.newCDPSession(page);
        await cdp.send('Input.synthesizeScrollGesture', {
          x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height * .8),
          yDistance: -150, gestureSourceType: 'touch', speed: 400,
        });
        await cdp.detach();
      } else {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, 250);
      }
      await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBeGreaterThan(0);

      // Tab alone must reveal the last replay button without activating any egg.
      await scroll.focus();
      await scroll.evaluate(el => { el.scrollTop = 0; });
      const focusable = scroll.locator('a[href], button');
      for (let i = 0; i < await focusable.count(); i++) await page.keyboard.press('Tab');
      await expect(last.getByRole('button')).toBeFocused();
      await expect.poll(() => last.getByRole('button').evaluate(el => {
        const button = el.getBoundingClientRect();
        const frame = el.closest('.comlink__scroll').getBoundingClientRect();
        return button.top >= frame.top - 1 && button.bottom <= frame.bottom + 1;
      })).toBe(true);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      console.log(`PASS: Comlink ${width}×${height}: viewport, scroll, fixed controls, input focus, keys, ${mobile ? 'touch' : 'wheel'}, Tab to last egg.`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
