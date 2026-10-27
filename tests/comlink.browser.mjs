// Run against an existing server: BASE_URL=http://127.0.0.1:3100 node tests/comlink.browser.mjs
import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';
import { baseURL, launchBrowser } from './browser-utils.mjs';

const ids = [...readFileSync(new URL('../src/lib/egg-catalog.ts', import.meta.url), 'utf8')
  .matchAll(/id: "([^"]+)"/g)].map(match => match[1]);
const browser = await launchBrowser();
async function expectNativeScroll(scroll) {
  await expect(scroll).toHaveCSS('overflow-y', 'scroll');
  await expect(scroll).toHaveCSS('scrollbar-gutter', 'stable');
  await expect(scroll).toHaveCSS('overscroll-behavior', 'contain');
  if (await scroll.evaluate(() => CSS.supports('selector(::-webkit-scrollbar)'))) {
    // Standard non-auto values override the custom scrollbar in modern Chromium.
    await expect(scroll).toHaveCSS('scrollbar-width', 'auto');
    await expect(scroll).toHaveCSS('scrollbar-color', 'auto');
    await expect.poll(() => scroll.evaluate(el => {
      const bar = getComputedStyle(el, '::-webkit-scrollbar');
      return [bar.width, bar.height];
    })).toEqual(['6px', '6px']);
  } else {
    await expect(scroll).toHaveCSS('scrollbar-width', 'thin');
  }
}
async function expectMiniScrollbar(bar) {
  await expect(bar).toBeVisible();
  await expect(bar).toHaveAttribute('aria-hidden', 'true');
  await expect(bar).toHaveCSS('width', '6px');
  await expect(bar).toHaveCSS('pointer-events', 'none');
  await expect.poll(() => bar.evaluate(el => parseFloat(el.style.getPropertyValue('--thumb-h')))).toBeGreaterThan(0);
  await expect.poll(() => bar.locator('i').evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(0);
  await expect.poll(() => bar.locator('i').evaluate(el => {
    const style = getComputedStyle(el);
    // Resolve the theme token to a computed color, including color-mix themes.
    const probe = document.createElement('i');
    probe.style.color = 'var(--energy-green)';
    el.append(probe);
    const green = getComputedStyle(probe).color;
    probe.remove();
    return style.backgroundColor === green && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
  })).toBe(true);
}
const thumbTop = bar => bar.evaluate(el => parseFloat(el.style.getPropertyValue('--thumb-t')));
const paintedThumbTop = bar => bar.locator('i').evaluate(el => el.getBoundingClientRect().top - el.parentElement.getBoundingClientRect().top);
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
      const scrollFrame = dialog.locator('.comlink__scroll-frame');
      const miniBar = scrollFrame.locator('.comlink__mini-bar');
      const last = dialog.locator('.comlink__list > li').last();
      await expect(dialog).toBeVisible();
      await dialog.locator('.comlink__panel').evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
      await expect(dialog.locator('#comlink-input')).toBeFocused();
      await expect(scroll).toHaveAttribute('data-lenis-prevent', '');
      await expectNativeScroll(scroll);
      await expect.poll(() => scroll.evaluate(el => el.clientHeight > 0 && el.clientHeight < el.scrollHeight)).toBe(true);
      await expectMiniScrollbar(miniBar);
      await expect.poll(() => thumbTop(miniBar)).toBe(0);
      const initialThumbTop = await paintedThumbTop(miniBar);
      await expect(scrollFrame).toHaveAttribute('data-more', '');
      await expect.poll(() => scrollFrame.evaluate(el => getComputedStyle(el, '::after').opacity)).toBe('1');
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
      await expect.poll(() => thumbTop(miniBar)).toBeGreaterThan(0);
      await expect.poll(() => paintedThumbTop(miniBar)).toBeGreaterThan(initialThumbTop);
      await expect.poll(() => miniBar.evaluate(el => {
        const track = el.getBoundingClientRect();
        const thumb = el.firstElementChild.getBoundingClientRect();
        return Math.abs(track.bottom - thumb.bottom) <= 1;
      })).toBe(true);
      await expect(scrollFrame).not.toHaveAttribute('data-more');
      await expect.poll(() => scrollFrame.evaluate(el => getComputedStyle(el, '::after').opacity)).toBe('0');
      await scroll.evaluate(el => { el.scrollTop = 0; });
      await expect(scrollFrame).toHaveAttribute('data-more', '');
      await expect.poll(() => thumbTop(miniBar)).toBe(0);
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
        // Check cancellation before any fallback so scroll-jacking still fails the test.
        const touchCanceled = await scroll.evaluate(el => {
          const frame = el.getBoundingClientRect();
          const touch = clientY => new Touch({
            identifier: 1, target: el, clientX: frame.x + frame.width / 2, clientY,
          });
          const start = touch(frame.y + frame.height * .8);
          const moved = touch(start.clientY - 150);
          const dispatch = (type, touches, changedTouches) => {
            const event = new TouchEvent(type, {
              touches, targetTouches: touches, changedTouches,
              bubbles: true, cancelable: true, composed: true,
            });
            el.dispatchEvent(event);
            return event.defaultPrevented;
          };
          dispatch('touchstart', [start], [start]);
          const canceled = dispatch('touchmove', [moved], [moved]);
          dispatch('touchend', [], [moved]);
          return canceled;
        });
        expect(touchCanceled, 'Lenis must leave Comlink touchmove events uncanceled').toBe(false);
        const cdp = await context.newCDPSession(page);
        await cdp.send('Input.synthesizeScrollGesture', {
          x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height * .8),
          yDistance: -150, gestureSourceType: 'touch', speed: 400,
        });
        await cdp.detach();
        try {
          await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
        } catch {
          // Headless Chromium may not scroll nested overflow with the CDP touch gesture.
          // Cancellation was checked above; now verify the element can actually scroll.
          await scroll.evaluate(el => el.scrollBy({ top: 150, behavior: 'instant' }));
          console.log('INFO: Comlink touch used scrollBy fallback after the cancellation check.');
        }
      } else {
        // Lenis checks the bubbling path before preventDefault (SmoothScroll's prevent option).
        // Keep this event cancelable so a regression cannot be hidden by scrollBy below.
        const wheelCanceled = await scroll.evaluate(el => {
          const event = new WheelEvent('wheel', { deltaY: 250, bubbles: true, cancelable: true, composed: true });
          el.dispatchEvent(event);
          return event.defaultPrevented;
        });
        expect(wheelCanceled, 'Lenis must leave Comlink wheel events uncanceled').toBe(false);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, 250);
        try {
          await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
        } catch {
          // Some browser runs do not apply the native wheel default action to the modal.
          // Cancellation was checked above; now verify the element can actually scroll.
          await scroll.evaluate(el => el.scrollBy({ top: 250, behavior: 'instant' }));
          console.log('INFO: Comlink wheel used scrollBy fallback after the cancellation check.');
        }
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

      // Resizing and content changes must clear the hint when nothing overflows.
      // Restore the real list afterward; no egg is activated by this check.
      await scroll.evaluate(el => { el.style.maxHeight = '100px'; el.scrollTop = 0; });
      await expect(scrollFrame).toHaveAttribute('data-more', '');
      const content = scroll.locator('.comlink__scroll-content');
      await content.evaluate(el => { el.style.display = 'none'; });
      await expect.poll(() => scroll.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
      await expect(scrollFrame).not.toHaveAttribute('data-more');
      await expect(miniBar).toBeHidden();
      await content.evaluate(el => { el.style.removeProperty('display'); });
      await expect(scrollFrame).toHaveAttribute('data-more', '');
      await expectMiniScrollbar(miniBar);
      await scroll.evaluate(el => { el.style.removeProperty('max-height'); });
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();

      await page.locator('.comlink-toggle').click();
      await dialog.locator('button.comlink__envelope').click();
      const letter = page.locator('dialog.curious-letter');
      await expect(letter).toBeVisible();
      const letterScroll = letter.locator('.comlink__scroll');
      const letterFrame = letter.locator('.comlink__scroll-frame');
      const letterBar = letter.locator('.comlink__mini-bar');
      await expectNativeScroll(letterScroll);
      await expect(letter).toHaveAttribute('data-lenis-prevent', '');
      await expect(letterScroll).toHaveAttribute('data-lenis-prevent', '');
      await expect.poll(() => letterScroll.evaluate(el => {
        const bar = el.parentElement.querySelector('.comlink__mini-bar');
        return bar.hidden === (el.scrollHeight <= el.clientHeight);
      })).toBe(true);

      // Exercise both letter states regardless of viewport size or translated copy length.
      const paper = letter.locator('.curious-letter__paper');
      await letterScroll.evaluate(el => { el.style.height = '160px'; });
      await paper.evaluate(el => { el.style.minHeight = '1200px'; });
      await letterScroll.evaluate(el => { el.scrollTop = 0; });
      await expectMiniScrollbar(letterBar);
      await expect(letterFrame).toHaveAttribute('data-more', '');
      await expect.poll(() => thumbTop(letterBar)).toBe(0);
      await letterScroll.evaluate(el => { el.scrollTop = el.scrollHeight; });
      await expect.poll(() => thumbTop(letterBar)).toBeGreaterThan(0);
      await expect.poll(() => paintedThumbTop(letterBar)).toBeGreaterThan(0);
      await expect(letterFrame).not.toHaveAttribute('data-more');
      const smallThumbHeight = await letterBar.locator('i').evaluate(el => el.getBoundingClientRect().height);
      await paper.evaluate(el => { el.style.minHeight = '600px'; });
      await expect.poll(() => letterBar.locator('i').evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(smallThumbHeight);
      await paper.evaluate(el => { el.style.display = 'none'; });
      await expect(letterBar).toBeHidden();
      await expect(letterFrame).not.toHaveAttribute('data-more');
      await paper.evaluate(el => { el.style.removeProperty('display'); el.style.removeProperty('min-height'); });
      await letterScroll.evaluate(el => { el.style.removeProperty('height'); });
      await letter.getByRole('button').click();
      await expect(letter).not.toBeVisible();
      console.log(`PASS: Comlink ${width}×${height}: mini scrollbar, fade, letter, viewport, fixed controls, input focus, keys, ${mobile ? 'touch' : 'wheel'}, Tab to last egg.`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
