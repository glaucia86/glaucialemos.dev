// Build with all five contact variables and WAITLIST_SIGNING_SECRET (32+ chars)
// set (dummy values suffice: no mail is sent),
// then: node tests/run-browser.mjs security-headers
// run-browser starts next start, or reuses BASE_URL. Never run against next dev.
// All external browser requests are mocked/blocked; the real Turnstile challenge
// still needs a separate online smoke check with a valid site key.
import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { baseURL, launchBrowser } from './browser-utils.mjs';
import { mockContact } from './contact-browser-mocks.mjs';

const routes = ['/pt', '/pt/servicos', '/pt/conteudo', '/pt/eventos', '/pt/sobre', '/pt/projetos', '/pt/alem-da-ultima-orbita'];
const devices = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];
const failures = [];
const browser = await launchBrowser();

async function exerciseTurnstile(page, contact) {
  const form = page.locator('#lista-de-espera form');
  await expect(form.locator('[name=name]'), 'Build with the five contact variables and WAITLIST_SIGNING_SECRET to exercise Turnstile; do not silently skip it.').toBeEnabled();
  await form.scrollIntoViewIfNeeded();
  await expect(form.locator('[name="cf-turnstile-response"]')).toHaveValue('browser-mock-token:waitlist');
  assert.ok(contact.challenges.some(url => new URL(url).pathname === '/turnstile/v0/api.js'));

  // The shared mock checks script loading/callbacks. These extra probes exercise
  // connect-src and cross-origin iframe postMessage under COOP same-origin too.
  await page.evaluate(async () => {
    const response = await fetch('https://challenges.cloudflare.com/security-header-probe/connect');
    if (!response.ok) throw new Error('Turnstile connection blocked');
    window.__securityFrameReady = false;
    const frame = document.createElement('iframe');
    frame.title = 'Turnstile CSP transport probe';
    window.addEventListener('message', function ready(event) {
      if (event.origin === 'https://challenges.cloudflare.com' && event.source === frame.contentWindow && event.data === 'security-frame-ready') {
        window.__securityFrameReady = true;
        window.removeEventListener('message', ready);
        frame.remove();
      }
    });
    frame.src = 'https://challenges.cloudflare.com/security-header-probe/frame';
    document.body.append(frame);
  });
  await page.waitForFunction(() => window.__securityFrameReady === true);
  assert.deepEqual(contact.posts, []);
  assert.deepEqual(contact.providers, []);
}

try {
  for (const { name, ...device } of devices) for (const route of routes) {
    const context = await browser.newContext({ ...device, reducedMotion: 'no-preference', serviceWorkers: 'block' });
    const violations = [], unexpected = [];
    try {
      const page = await context.newPage();
      await page.exposeFunction('__recordSecurityViolation', violation => violations.push(violation));
      page.on('console', message => {
        if (/content security policy/i.test(message.text())) violations.push({ console: message.text() });
      });
      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', event => {
          void window.__recordSecurityViolation({
            directive: event.effectiveDirective, blocked: event.blockedURI,
            document: event.documentURI, disposition: event.disposition,
          });
        });
        if (window !== window.top) return;
        for (const world of ['galaxia', 'aurelia', 'lumina', 'atlas', 'niveora', 'marte']) sessionStorage.setItem(`${world}-boot`, 'done');
        localStorage.setItem('sound-invite-seen', '1');
        localStorage.setItem('comlink-hint-seen', '1');
      });
      // Registered first: mockContact handles Turnstile/action POSTs before falling
      // through to this offline guard. CSP still applies to mocked request URLs.
      await page.route('**/*', async requestRoute => {
        const url = new URL(requestRoute.request().url());
        if (url.origin === new URL(baseURL).origin) return requestRoute.continue();
        if (url.origin === 'https://i.ytimg.com') return requestRoute.fulfill({
          contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'),
        });
        if (url.origin === 'https://www.youtube-nocookie.com') return requestRoute.fulfill({
          contentType: 'text/html', body: '<!doctype html><title>Offline video embed</title><p>Video embed loaded</p>',
        });
        unexpected.push(url.origin);
        return requestRoute.abort('blockedbyclient');
      });
      const contact = await mockContact(page, baseURL);
      // mockContact's non-provider requests must reach the offline guard.
      await page.route('https://challenges.cloudflare.com/security-header-probe/**', async requestRoute => {
        const frame = requestRoute.request().url().endsWith('/frame');
        return requestRoute.fulfill({
          contentType: frame ? 'text/html' : 'application/json',
          headers: { 'Access-Control-Allow-Origin': new URL(baseURL).origin },
          body: frame ? '<!doctype html><script>parent.postMessage("security-frame-ready", "*")</script>' : '{}',
        });
      });
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'load' });
      assert.equal(response.status(), 200);
      const headers = response.headers();
      assert.ok(headers['content-security-policy']?.includes("frame-ancestors 'none'"));
      assert.ok(headers['content-security-policy'].includes("object-src 'none'"));
      assert.ok(headers['content-security-policy'].includes('upgrade-insecure-requests'), 'A production build is required');
      assert.ok(!headers['content-security-policy'].includes("'unsafe-eval'"));
      assert.equal(headers['content-security-policy-report-only'], undefined);
      assert.equal(headers['x-frame-options'], 'DENY');
      assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
      assert.equal(headers['x-content-type-options'], 'nosniff');
      assert.equal(headers['strict-transport-security'], 'max-age=63072000; includeSubDomains');
      assert.equal(headers['cross-origin-opener-policy'], 'same-origin');
      assert.equal(headers['permissions-policy'], 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()');
      assert.equal(headers['x-powered-by'], undefined);
      await expect(page.locator('main h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      // A real user gesture enables both local music and Web Audio effects.
      const music = page.waitForResponse(response => new URL(response.url()).pathname.startsWith('/music/') && response.ok());
      const sound = page.locator('.sound-toggle');
      await sound.click();
      await expect(sound).toHaveAttribute('aria-pressed', 'true');
      await music;
      await sound.click();

      // Visit lower sections to activate lazy images, styles and motion engines.
      for (const section of await page.locator('main section').all()) {
        await section.evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      }
      if (route === '/pt/servicos') await exerciseTurnstile(page, contact);
      if (route === '/pt/conteudo') {
        await page.locator('.retro-tv__power').click();
        await expect(page.frameLocator('.retro-tv__player').getByText('Video embed loaded')).toBeVisible();
      }
      await page.waitForLoadState('networkidle');
      assert.deepEqual(unexpected, [], 'Unexpected external resource origins');
      assert.deepEqual(violations, [], `${name} ${route}: CSP violations`);
      console.log(`ok - security headers: ${name} ${route}`);
    } catch (error) {
      failures.push(`${name} ${route}`);
      console.error(`not ok - ${name} ${route}\n${error.stack}\n${JSON.stringify({ violations, unexpected })}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
assert.deepEqual(failures, [], 'Security header browser checks failed');
