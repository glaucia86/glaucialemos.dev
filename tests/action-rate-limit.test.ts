import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitContact } from '@/app/actions/contact';
import { submitTestimonial } from '@/app/actions/testimonial';
import { submitWaitlist } from '@/app/actions/waitlist';
import { consumeGlobalRateLimit, resetRateLimits } from '@/lib/rate-limit';
import { RESEND_URL } from '@/lib/mail';

const visitor = vi.hoisted(() => ({ sequence: 0 }));
vi.mock('next/headers', () => ({
  // A new IP per request: exercise the shared limit, not the per-IP quotas.
  headers: async () => new Headers({ 'x-real-ip': `2001:db8::${(++visitor.sequence).toString(16)}` }),
}));
const actions = [
  ['contact', submitContact], ['testimonial', submitTestimonial], ['waitlist', submitWaitlist],
] as const;
const fetchMock = vi.fn();
function form(token: string) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    name: 'Ana', company: 'Equipe', service: 'consultoria', message: 'Vamos conversar.',
    linkedin: 'https://linkedin.com/in/ana', consent: 'on', lang: 'pt',
    role: 'Dev', context: 'workshop', quote: 'O workshop ajudou a equipe no dia a dia.',
    email: 'ana@example.com', interest: 'workshop-corporativo', 'cf-turnstile-response': token,
  })) data.set(key, value);
  return data;
}
const response = (body: unknown) => new Response(JSON.stringify(body));
function acceptCaptcha() {
  fetchMock.mockImplementation(async (url: string, init: RequestInit) => response(url === RESEND_URL
    ? { id: 'mock-mail' }
    : { success: true, hostname: 'glaucialemos.dev', action: JSON.parse(String(init.body)).response }));
}
beforeEach(() => {
  resetRateLimits(); visitor.sequence = 0;
  vi.stubEnv('RESEND_API_KEY', 'mock-key');
  vi.stubEnv('CONTACT_FROM', 'sender@example.com'); vi.stubEnv('CONTACT_TO', 'owner@example.com');
  vi.stubEnv('TURNSTILE_SITE_KEY', 'mock-site'); vi.stubEnv('TURNSTILE_SECRET_KEY', 'mock-secret');
  vi.stubEnv('WAITLIST_SIGNING_SECRET', 'a'.repeat(40));
  fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe.each(actions)('%s global quota after CAPTCHA', (name, submit) => {
  it('failed/missing CAPTCHA requests from many IPs leave all 60 global slots available', async () => {
    fetchMock.mockImplementation(async () => response({ success: false }));
    for (let i = 0; i < 65; i++) {
      expect((await submit(null, form(i % 2 ? name : ''))).status).toBe('captcha');
    }
    expect(fetchMock.mock.calls.some(([url]) => url === RESEND_URL)).toBe(false);
    acceptCaptcha();
    // All three actions share the same quota, including after the failed requests.
    for (let i = 0; i < 60; i++) {
      const [action, send] = actions[i % actions.length];
      expect(await send(null, form(action))).toEqual({ status: 'ok' });
    }
    fetchMock.mockClear();
    expect(await submit(null, form(name))).toEqual({ status: 'rate-limited' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/siteverify');
  });

  it('checks CAPTCHA even when the global quota is full and never sends mail', async () => {
    for (let i = 0; i < 60; i++) expect(consumeGlobalRateLimit()).toBe(true);
    fetchMock.mockImplementation(async () => response({ success: false }));
    expect((await submit(null, form(name))).status).toBe('captcha');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    acceptCaptcha(); fetchMock.mockClear();
    expect(await submit(null, form(name))).toEqual({ status: 'rate-limited' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/siteverify');
  });
});

it('reserves the global quota synchronously across concurrent verified actions', async () => {
  acceptCaptcha();
  const results = await Promise.all(Array.from({ length: 61 }, (_, i) => {
    const [action, submit] = actions[i % actions.length];
    const data = form(action);
    // Distinct recipients isolate the global cap from the recipient quota.
    data.set('email', `person${i}@example.com`);
    return submit(null, data);
  }));
  expect(results.filter(result => result.status === 'ok')).toHaveLength(60);
  expect(results.filter(result => result.status === 'rate-limited')).toHaveLength(1);
  expect(fetchMock.mock.calls.filter(([url]) => url === RESEND_URL)).toHaveLength(60);
});

it('reserves recipient quota synchronously across different IPs', async () => {
  acceptCaptcha();
  const results = await Promise.all(Array.from({ length: 3 }, () => submitWaitlist(null, form('waitlist'))));
  expect(results).toEqual([{ status: 'ok' }, { status: 'ok' }, { status: 'ok' }]);
  expect(fetchMock.mock.calls.filter(([url]) => url === RESEND_URL)).toHaveLength(1);
});
