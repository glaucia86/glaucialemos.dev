import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/waitlist/confirm/route';
import { signWaitlistToken, WAITLIST_TOKEN_TTL } from '@/lib/waitlist-confirmation';
import { resetRateLimits } from '@/lib/rate-limit';
import { CONFIRMED_WAITLIST_BANNER, RESEND_URL, VISITOR_BANNER } from '@/lib/mail';
import { waitlistConfirmationCopy } from '@/i18n/waitlist-confirmation';
import { waitlistCopy } from '@/i18n/waitlist';
import type { Locale } from '@/i18n/config';

vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-vercel-forwarded-for': '203.0.113.9' }) }));
const secret = 'a'.repeat(40);
const now = 1_800_000_000_000;
const endpoint = 'https://glaucialemos.dev/api/waitlist/confirm';
const fetchMock = vi.fn();
function token(lang: Locale = 'pt', name = 'Ana', at = now) {
  return signWaitlistToken({ name, email: 'ana@example.com', interest: 'curso-gravado', lang }, secret, at);
}
const post = (value: string, lang = 'pt') => new Request(endpoint, { method: 'POST', headers: { 'accept-language': lang }, body: new URLSearchParams({ t: value }) });
beforeEach(() => {
  resetRateLimits(); vi.useFakeTimers(); vi.setSystemTime(now);
  vi.stubEnv('RESEND_API_KEY', 'dummy'); vi.stubEnv('CONTACT_FROM', 'Site <sender@example.com>'); vi.stubEnv('CONTACT_TO', 'owner@example.com');
  vi.stubEnv('TURNSTILE_SITE_KEY', 'x'); vi.stubEnv('TURNSTILE_SECRET_KEY', 'x'); vi.stubEnv('WAITLIST_SIGNING_SECRET', secret);
  fetchMock.mockReset().mockImplementation(() => Promise.resolve(Response.json({ id: 'mail-id' })));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe.each(['pt', 'en', 'es'] as const)('waitlist confirmation (%s)', lang => {
  it('GET renders a localized POST form but sends no email, including repeated scanner visits', async () => {
    const value = token(lang);
    for (let i = 0; i < 5; i++) {
      const response = await GET(new Request(`${endpoint}?t=${value}`));
      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(response.headers.get('referrer-policy')).toBe('no-referrer');
      expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
      const html = await response.text();
      expect(html).toContain(`<html lang="${lang}">`);
      expect(html).toContain('<meta name="robots" content="noindex">');
      expect(html).toContain('<form method="post" action="/api/waitlist/confirm">');
      expect(html).toContain(`<input type="hidden" name="t" value="${value}">`);
      expect(html).toContain(`>${waitlistConfirmationCopy[lang].button}</button>`);
      expect(html.match(/<button/g)).toHaveLength(1);
      expect(html).not.toMatch(/<script|onload=/);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('POST alone sends one confirmed notification to CONTACT_TO with subscriber reply_to', async () => {
    const response = await POST(post(token(lang)));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(waitlistConfirmationCopy[lang].success);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe(RESEND_URL);
    const body = JSON.parse(request.body);
    expect(body).toMatchObject({ to: ['owner@example.com'], from: 'Site <sender@example.com>', reply_to: 'ana@example.com',
      subject: `[Site] Lista de espera (confirmada) — ${waitlistCopy[lang].offerings['curso-gravado']}` });
    expect(body.text).toContain(CONFIRMED_WAITLIST_BANNER);
    expect(body.text).not.toContain(VISITOR_BANNER);
    expect(body).not.toHaveProperty('html');
    expect(body.text).not.toContain(token(lang));
  });
  it.each(['invalid', 'expired'])('rejects %s tokens on GET/POST with a localized neutral error and no mail', async kind => {
    const value = kind === 'expired' ? token(lang, 'Ana', now - WAITLIST_TOKEN_TTL) : 'bad';
    for (const response of [await GET(new Request(`${endpoint}?t=${value}`, { headers: { 'accept-language': lang } })), await POST(post(value, lang))]) {
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(response.headers.get('referrer-policy')).toBe('no-referrer');
      const html = await response.text();
      expect(html).toContain(waitlistConfirmationCopy[lang].invalid);
      expect(html).toContain(`href="/${lang}/servicos#lista-de-espera"`);
      expect(html).not.toContain('<form');
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
it('rechecks expiry between viewing GET and submitting POST', async () => {
  const value = token();
  expect((await GET(new Request(`${endpoint}?t=${value}`))).status).toBe(200);
  vi.setSystemTime(now + WAITLIST_TOKEN_TTL);
  expect((await POST(post(value))).status).toBe(400);
  expect(fetchMock).not.toHaveBeenCalled();
});
it('escapes all user-controlled text and never reflects an invalid token', async () => {
  const response = await GET(new Request(`${endpoint}?t=${token('en', '<img src=x onerror="alert(1)"> & \'Ana\'')}`));
  const html = await response.text();
  expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;Ana&#39;');
  expect(html).not.toContain('<img');
  const bad = '<script>alert(1)</script>';
  expect(await (await GET(new Request(`${endpoint}?t=${encodeURIComponent(bad)}`))).text()).not.toContain(bad);
});
it('uses identical content-derived Resend idempotency on repeated confirmations', async () => {
  await POST(post(token()));
  vi.setSystemTime(now + 1000);
  await POST(post(token('pt', 'Ana', now)));
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[0][1].headers['Idempotency-Key']).toBe(fetchMock.mock.calls[1][1].headers['Idempotency-Key']);
});
it('limits valid POST attempts per IP without sending another mail', async () => {
  for (let i = 0; i < 3; i++) expect((await POST(post(token()))).status).toBe(200);
  expect((await POST(post(token()))).status).toBe(429);
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
it('rejects oversized, duplicated and unsupported POST bodies', async () => {
  for (const body of [new URLSearchParams({ t: 'x'.repeat(10000) }), new URLSearchParams([['t', token()], ['t', token()]]), 't=bad']) {
    expect((await POST(new Request(endpoint, { method: 'POST', body }))).status).toBe(400);
  }
  expect(fetchMock).not.toHaveBeenCalled();
});
it('fails closed with missing configuration or failed delivery', async () => {
  vi.stubEnv('WAITLIST_SIGNING_SECRET', '');
  expect((await POST(post(token()))).status).toBe(400);
  vi.stubEnv('WAITLIST_SIGNING_SECRET', secret); vi.stubEnv('RESEND_API_KEY', '');
  expect((await POST(post(token()))).status).toBe(503);
  expect(fetchMock).not.toHaveBeenCalled();
  vi.stubEnv('RESEND_API_KEY', 'dummy'); fetchMock.mockResolvedValue(Response.json({}, { status: 503 }));
  expect((await POST(post(token()))).status).toBe(502);
});
