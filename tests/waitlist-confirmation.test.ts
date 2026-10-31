import { createHmac, timingSafeEqual } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_WAITLIST_TOKEN_LENGTH, signWaitlistToken, verifyWaitlistToken, WAITLIST_TOKEN_TTL, waitlistOrigin } from '@/lib/waitlist-confirmation';

vi.mock('node:crypto', async importOriginal => ({ ...await importOriginal<typeof import('node:crypto')>(), timingSafeEqual: vi.fn((await importOriginal<typeof import('node:crypto')>()).timingSafeEqual) }));
const secret = 'a'.repeat(40);
const now = 1_800_000_000_000;
const payload = { name: 'Ana', email: 'ana@example.com', interest: 'curso-gravado', lang: 'pt' } as const;
function signed(value: unknown) {
  const encoded = Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encoded}.${createHmac('sha256', secret).update(encoded).digest('base64url')}`;
}
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe('signed waitlist tokens', () => {
  it('roundtrips with a 48 hour lifetime and trimmed secret', () => {
    const token = signWaitlistToken(payload, ` ${secret} `, now);
    expect(token).toMatch(/^[\w-]+\.[\w-]{43}$/);
    expect(verifyWaitlistToken(token, secret, now)).toEqual({ ...payload, exp: now + WAITLIST_TOKEN_TTL });
    expect(verifyWaitlistToken(token, secret, now + WAITLIST_TOKEN_TTL - 1)).not.toBeNull();
    expect(verifyWaitlistToken(token, secret, now + WAITLIST_TOKEN_TTL)).toBeNull();
  });
  it('rejects tampered payload, signature and wrong secret', () => {
    const token = signWaitlistToken(payload, secret, now);
    const [body, signature] = token.split('.');
    const changed = Buffer.from(JSON.stringify({ ...payload, email: 'other@example.com', exp: now + WAITLIST_TOKEN_TTL })).toString('base64url');
    for (const bad of [`${changed}.${signature}`, `${body}.${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`]) {
      expect(verifyWaitlistToken(bad, secret, now)).toBeNull();
    }
    expect(verifyWaitlistToken(token, 'b'.repeat(40), now)).toBeNull();
  });
  it('compares full-length signatures using timingSafeEqual, including mismatches', () => {
    const token = signWaitlistToken(payload, secret, now);
    verifyWaitlistToken(token, secret, now);
    verifyWaitlistToken(token, 'b'.repeat(40), now);
    expect(timingSafeEqual).toHaveBeenCalledTimes(2);
    for (const [a, b] of vi.mocked(timingSafeEqual).mock.calls) {
      expect(a.byteLength).toBe(32); expect(b.byteLength).toBe(32);
    }
  });
  it.each([null, undefined, 123, {}, '', 'a.b', 'a.b.c', 'a'.repeat(MAX_WAITLIST_TOKEN_LENGTH + 1), '%%%%.' + 'a'.repeat(43)])('rejects malformed/oversized input (%#)', token => {
    expect(verifyWaitlistToken(token, secret, now)).toBeNull();
    expect(timingSafeEqual).not.toHaveBeenCalled();
  });
  it.each([
    { extra: true }, { name: '' }, { email: 'bad' }, { interest: 'invalid' }, { lang: 'fr' },
    { exp: 'tomorrow' }, { exp: now }, { exp: now + WAITLIST_TOKEN_TTL + 1 }, { exp: 1.1 }, { name: 'x'.repeat(121) },
  ])('rejects signed but invalid/expired payloads (%#)', changes => {
    expect(verifyWaitlistToken(signed({ ...payload, exp: now + WAITLIST_TOKEN_TTL, ...changes }), secret, now)).toBeNull();
  });
  it('rejects signed nonobjects, missing fields and non-JSON data', () => {
    for (const value of [null, [], payload, { exp: now + WAITLIST_TOKEN_TTL }]) expect(verifyWaitlistToken(signed(value), secret, now)).toBeNull();
    const encoded = Buffer.from('not json').toString('base64url');
    expect(verifyWaitlistToken(`${encoded}.${createHmac('sha256', secret).update(encoded).digest('base64url')}`, secret, now)).toBeNull();
  });
  it('requires a sufficiently long signing key', () => {
    for (const key of ['', 'a'.repeat(31), `  ${'a'.repeat(31)} `]) {
      expect(() => signWaitlistToken(payload, key, now)).toThrow();
      expect(verifyWaitlistToken(signWaitlistToken(payload, secret, now), key, now)).toBeNull();
    }
  });
  it.each(['', 'http://evil.example', 'javascript:alert(1)', 'not a URL', 'https://user:pass@example.com'])('uses the safe fallback for invalid SITE_URL (%s)', value => {
    vi.stubEnv('SITE_URL', value); expect(waitlistOrigin()).toBe('https://glaucialemos.dev');
  });
  it('accepts an explicitly configured HTTPS origin only', () => {
    vi.stubEnv('SITE_URL', ' https://preview.example.com/path?q=1#x ');
    expect(waitlistOrigin()).toBe('https://preview.example.com');
  });
});
