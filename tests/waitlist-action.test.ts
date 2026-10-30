import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitWaitlist } from '@/app/actions/waitlist';
import { waitlistCopy } from '@/i18n/waitlist';
import { waitlistInterests } from '@/lib/waitlist-schema';
import { RESEND_URL } from '@/lib/mail';

const fetchMock = vi.fn();
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: 'Ana', email: 'ana@example.com', interest: 'workshop-corporativo', consent: 'on', lang: 'pt', website: '', 'cf-turnstile-response': 'test-token' })) data.set(key, value);
  return data;
}
beforeEach(() => {
  vi.stubEnv('RESEND_API_KEY', 're_test'); vi.stubEnv('CONTACT_FROM', 'Site <sender@example.com>'); vi.stubEnv('CONTACT_TO', 'owner@example.com');
  vi.stubEnv('TURNSTILE_SITE_KEY', 'public-key'); vi.stubEnv('TURNSTILE_SECRET_KEY', 'private-turnstile');
  vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset();
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe('waitlist action', () => {
  it('silently accepts bots before config/validation with no external calls', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const data = new FormData(); data.set('website', 'bot');
    expect(await submitWaitlist(null, data)).toEqual({ status: 'ok' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['RESEND_API_KEY', 'CONTACT_FROM', 'CONTACT_TO', 'TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'])('is unavailable without %s', async key => {
    for (const value of [undefined, '', '  ']) {
      vi.stubEnv(key, value);
      expect(await submitWaitlist(null, form())).toEqual({ status: 'unavailable' });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['pt', 'en', 'es'] as const)('validates on the server in %s', async lang => {
    const data = form(); data.set('lang', lang); data.set('email', 'invalid'); data.delete('consent');
    const result = await submitWaitlist(null, data);
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(result.errors.email).toEqual([waitlistCopy[lang].errors.email]);
      expect(result.errors.consent).toEqual([waitlistCopy[lang].errors.consent]);
      expect(result.values.name).toBe('Ana');
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([null, '', '  ', 'x'.repeat(2049)])('rejects missing/oversized tokens without fetch (%#)', async token => {
    const data = form();
    if (token === null) data.delete('cf-turnstile-response'); else data.set('cf-turnstile-response', token);
    expect((await submitWaitlist(null, data)).status).toBe('captcha');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  const failures = [
    () => Promise.resolve(response({ success: false })), () => Promise.resolve(response({ success: 'true' })),
    () => Promise.resolve(response({ success: true }, 503)), () => Promise.resolve(new Response('invalid-json')),
    () => Promise.reject(new Error('network')), () => Promise.reject(new DOMException('timeout', 'TimeoutError')),
  ];
  it.each(failures)('fails closed when verification fails (%#)', async failure => {
    fetchMock.mockImplementationOnce(failure);
    expect((await submitWaitlist(null, form())).status).toBe('captcha');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it.each(['pt', 'en', 'es'] as const)('sends validated fields and localized subject for all interests (%s)', async lang => {
    for (const interest of waitlistInterests) {
      fetchMock.mockReset().mockResolvedValueOnce(response({ success: true })).mockResolvedValueOnce(response({ id: 'mail-id' }));
      const data = form(); data.set('lang', lang); data.set('interest', interest);
      for (const field of ['subject', 'from', 'to', 'form', 'interest_label']) data.set(field, 'attacker');
      expect(await submitWaitlist(null, data)).toEqual({ status: 'ok' });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const [verifyUrl, verify] = fetchMock.mock.calls[0];
      expect(verifyUrl).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
      expect(JSON.parse(verify.body)).toEqual({ secret: 'private-turnstile', response: 'test-token' });
      const [url, request] = fetchMock.mock.calls[1];
      expect(url).toBe(RESEND_URL); expect(request).toMatchObject({ method: 'POST', cache: 'no-store' });
      expect(request.headers.Authorization).toBe('Bearer re_test');
      expect(request.headers['Idempotency-Key']).toMatch(/^[a-f0-9]{64}$/);
      const label = waitlistCopy[lang].offerings[interest];
      expect(JSON.parse(request.body)).toEqual({
        from: 'Site <sender@example.com>', to: ['owner@example.com'], subject: `Lista de espera glaucialemos.dev — ${label}`,
        text: `Nome: Ana\nE-mail: ana@example.com\nInteresse: ${label} (${interest})\nIdioma: ${lang}\nConsentimento LGPD: sim\nFinalidade: avisar somente quando a modalidade escolhida estiver disponível`,
      });
    }
  });
  it.each([() => Promise.resolve(response({ message: 'rejected' }, 422)), () => Promise.reject(new Error('network'))])('preserves entered fields when delivery fails (%#)', async failure => {
    fetchMock.mockResolvedValueOnce(response({ success: true })).mockImplementationOnce(failure);
    const result = await submitWaitlist(null, form());
    expect(result).toMatchObject({ status: 'error', values: { email: 'ana@example.com', interest: 'workshop-corporativo', consent: true } });
    expect(fetchMock).toHaveBeenCalledTimes(2); expect(JSON.stringify(result)).not.toContain('private-');
  });
  it('defaults an unsupported locale to Portuguese', async () => {
    const data = form(); data.set('lang', 'xx'); data.set('email', 'bad');
    expect(await submitWaitlist(null, data)).toMatchObject({ status: 'invalid', errors: { email: [waitlistCopy.pt.errors.email] } });
  });
  it('keeps recipient addresses and secrets out of production code', () => {
    const source = readFileSync('src/app/actions/waitlist.ts', 'utf8');
    expect(source).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
    expect(source).not.toContain('WEB3FORMS_ACCESS_KEY');
  });
});
