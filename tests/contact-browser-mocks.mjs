// Browser interception cannot reach fetch() inside a Server Action. Intercept the
// action POST itself as well as both providers, so this suite never sends mail.
// Minimal Next 15 Flight action envelope; actual action/provider behavior is tested in Vitest.
export async function mockContact(page, base) {
  const mock = { result: { status: 'ok' }, posts: [], challenges: [], providers: [] };
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname === 'api.resend.com') {
      mock.providers.push(request.url());
      return route.fulfill({ status: 200, json: { id: 'browser-mock-email' } });
    }
    if (url.hostname === 'challenges.cloudflare.com') {
      mock.challenges.push(request.url());
      if (url.pathname === '/turnstile/v0/api.js') return route.fulfill({
        contentType: 'application/javascript',
        body: `(() => {
          const widgets = new Map(); let sequence = 0;
          const complete = id => setTimeout(() => widgets.get(id)?.callback('browser-mock-token'), 0);
          window.turnstile = {
            render(container, options) { const id = String(++sequence); widgets.set(id, options); complete(id); return id; },
            reset(id) { complete(id); }, remove(id) { widgets.delete(id); }
          };
        })();`,
      });
      return route.fulfill({ status: 200, json: { success: true } });
    }
    if (url.origin === new URL(base).origin && request.method() === 'POST') {
      mock.posts.push(request.postData() ?? '');
      if (request.headers()['next-action']) return route.fulfill({
        status: 200, contentType: 'text/x-component',
        body: `0:${JSON.stringify({ a: mock.result, f: '' })}\n`,
      });
      // Includes native/no-JS form submissions: never forward these to the server.
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Contact POST intercepted by browser test.</p>' });
    }
    // Allow suites to install an offline guard underneath these provider mocks.
    return route.fallback();
  });
  return mock;
}
