import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clientIp, consumeGlobalRateLimit, consumeRateLimit, evaluateGlobalRateLimit, evaluateRateLimit, MAX_RATE_LIMIT_KEYS, resetRateLimits, type RateLimitState } from '@/lib/rate-limit';
import { consumeRecipientRateLimit, evaluateRecipientRateLimit } from '@/lib/rate-limit';

const request = vi.hoisted(() => ({ headers: new Headers() }));
vi.mock('next/headers', () => ({ headers: async () => request.headers }));
const MINUTE = 60_000;
function limiter(maxKeys = MAX_RATE_LIMIT_KEYS) {
  let state: RateLimitState = new Map();
  let now = 0;
  return {
    take(ip = 'ip-a', action: 'contact' | 'waitlist' | 'testimonial' = 'contact') {
      const result = evaluateRateLimit(state, ip, action, () => now, maxKeys);
      state = result.state;
      return result.allowed;
    },
    global() {
      const result = evaluateGlobalRateLimit(state, () => now);
      state = result.state;
      return result.allowed;
    },
    time(value: number) { now = value; },
    get state() { return state; },
  };
}
beforeEach(() => { request.headers = new Headers(); resetRateLimits(); });
afterEach(() => { vi.useRealTimers(); });

describe('janela deslizante de envios', () => {
  it('libera só o envio que expirou, sem reiniciar a janela toda', () => {
    const l = limiter();
    expect(l.take()).toBe(true);
    l.time(2 * MINUTE); expect(l.take()).toBe(true);
    l.time(4 * MINUTE); expect(l.take()).toBe(true);
    l.time(10 * MINUTE - 1); expect(l.take()).toBe(false);
    l.time(10 * MINUTE); expect(l.take()).toBe(true);
    expect(l.take()).toBe(false);
    l.time(12 * MINUTE); expect(l.take()).toBe(true);
  });
  it('isola IPs e ações dentro da janela curta', () => {
    const l = limiter();
    for (let i = 0; i < 3; i++) expect(l.take()).toBe(true);
    expect(l.take()).toBe(false);
    expect(l.take('ip-b')).toBe(true);
    expect(l.take('ip-a', 'waitlist')).toBe(true);
    expect(l.take('ip-a', 'testimonial')).toBe(true);
  });
  it('aplica dez por dia por IP somando todas as ações', () => {
    const l = limiter();
    for (const action of ['contact', 'waitlist', 'testimonial'] as const) {
      for (let i = 0; i < 3; i++) expect(l.take('ip-a', action)).toBe(true);
    }
    l.time(10 * MINUTE);
    expect(l.take()).toBe(true);
    expect(l.take('ip-a', 'waitlist')).toBe(false);
    expect(l.take('ip-b')).toBe(true);
    l.time(24 * 60 * MINUTE - 1); expect(l.take()).toBe(false);
    l.time(24 * 60 * MINUTE); expect(l.take()).toBe(true);
  });
  it('limita a instância a sessenta por hora, incluindo IPs e ações diferentes', () => {
    const l = limiter();
    for (let i = 0; i < 60; i++) {
      l.time(i * 1000);
      expect(l.global()).toBe(true);
    }
    expect(l.global()).toBe(false);
    l.time(60 * MINUTE - 1); expect(l.global()).toBe(false);
    l.time(60 * MINUTE); expect(l.global()).toBe(true);
    expect(l.global()).toBe(false);
  });
  it('não altera o estado de entrada nem consome outras cotas ao negar', () => {
    const input: RateLimitState = new Map();
    const first = evaluateRateLimit(input, 'a', 'contact', () => 0);
    expect(input.size).toBe(0);
    expect(first.state.size).toBe(2);
    const l = limiter();
    for (let i = 0; i < 3; i++) l.take();
    const before = l.state;
    expect(l.take()).toBe(false);
    expect(l.state).toEqual(before);
    expect(l.state).not.toBe(before);
  });
  it('remove entradas expiradas e mantém tamanho limitado sem descartar contadores ativos', () => {
    const l = limiter(4);
    expect(l.take('a')).toBe(true);
    expect(l.take('b')).toBe(true);
    expect(l.state.size).toBe(4);
    for (let i = 0; i < 100; i++) expect(l.take(`new-${i}`)).toBe(false);
    expect(l.state.size).toBe(4);
    expect(l.take('a')).toBe(true);
    expect(l.take('a')).toBe(true);
    expect(l.take('a')).toBe(false);
    l.time(24 * 60 * MINUTE);
    expect(l.take('c')).toBe(true);
    expect([...l.state.keys()].sort()).toEqual(['action:contact:c', 'ip:c']);
    expect(MAX_RATE_LIMIT_KEYS).toBe(5000);
  });
  it('reseta o estado compartilhado entre testes', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 3; i++) expect(consumeRateLimit('a', 'contact')).toBe(true);
    expect(consumeRateLimit('a', 'contact')).toBe(false);
    for (let i = 0; i < 60; i++) expect(consumeGlobalRateLimit()).toBe(true);
    expect(consumeGlobalRateLimit()).toBe(false);
    resetRateLimits();
    expect(consumeGlobalRateLimit()).toBe(true);
    expect(consumeRateLimit('a', 'contact')).toBe(true);
  });
});

describe('recipient confirmation quota', () => {
  it('allows one per ten minutes and three per rolling day across case variants', () => {
    let state: RateLimitState = new Map();
    const take = (now: number, email = 'ana@example.com') => {
      const result = evaluateRecipientRateLimit(state, email, () => now);
      state = result.state;
      return result.allowed;
    };
    expect(take(0)).toBe(true);
    expect(take(10 * MINUTE - 1, ' ANA@EXAMPLE.COM ')).toBe(false);
    expect(take(10 * MINUTE)).toBe(true);
    expect(take(20 * MINUTE)).toBe(true);
    expect(take(30 * MINUTE)).toBe(false);
    expect(take(30 * MINUTE, 'other@example.com')).toBe(true);
    expect(take(24 * 60 * MINUTE - 1)).toBe(false);
    expect(take(24 * 60 * MINUTE)).toBe(true);
    for (const key of state.keys()) {
      expect(key).toMatch(/^recipient:(short|day):[a-f0-9]{64}$/);
      expect(key).not.toContain('@');
    }
  });
  it('reserves synchronously, resets and fails closed at capacity', () => {
    expect(consumeRecipientRateLimit('ana@example.com')).toBe(true);
    expect(consumeRecipientRateLimit('ANA@example.com')).toBe(false);
    resetRateLimits();
    expect(consumeRecipientRateLimit('ana@example.com')).toBe(true);
    const initial = new Map();
    const first = evaluateRecipientRateLimit(initial, 'a@example.com', () => 0, 2);
    expect(initial.size).toBe(0);
    const second = evaluateRecipientRateLimit(first.state, 'b@example.com', () => 0, 2);
    expect(second.allowed).toBe(false);
    expect(second.state.size).toBe(2);
  });
});

describe('IP do visitante', () => {
  it.each([
    [{ 'x-vercel-forwarded-for': '203.0.113.1, 10.0.0.1', 'x-forwarded-for': '203.0.113.2', 'x-real-ip': '203.0.113.3' }, '203.0.113.1'],
    [{ 'x-forwarded-for': ' 203.0.113.2 , 10.0.0.1', 'x-real-ip': '203.0.113.3' }, '203.0.113.2'],
    [{ 'x-real-ip': '203.0.113.3' }, '203.0.113.3'],
    [{ 'x-vercel-forwarded-for': '2001:db8::1, ::1' }, '2001:db8::1'],
    [{ 'x-vercel-forwarded-for': '', 'x-forwarded-for': '127.0.0.1' }, '127.0.0.1'],
    [{ 'x-forwarded-for': 'not-an-ip, 203.0.113.2' }, 'unknown'],
    [{}, 'unknown'],
  ] as [Record<string, string>, string][])('lê o primeiro salto com a prioridade configurada (%#)', async (values, expected) => {
    request.headers = new Headers(values);
    expect(await clientIp()).toBe(expected);
  });
});
