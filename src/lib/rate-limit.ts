import 'server-only';
import { isIP } from 'node:net';
import { headers } from 'next/headers';

type Action = 'contact' | 'waitlist' | 'testimonial';
type Window = { windowMs: number; timestamps: readonly number[] };
export type RateLimitState = ReadonlyMap<string, Window>;
export const MAX_RATE_LIMIT_KEYS = 5000;
const MINUTE = 60_000;

type Rule = { key: string; limit: number; windowMs: number };

// Pure state transition: the input is never mutated and time is injectable.
function evaluateRules(previous: RateLimitState, rules: readonly Rule[], clock: () => number, maxKeys: number) {
  const now = clock();
  const state = new Map<string, Window>();
  for (const [key, entry] of previous) {
    const timestamps = entry.timestamps.filter(time => time > now - entry.windowMs);
    if (timestamps.length) state.set(key, { ...entry, timestamps });
  }
  const newKeys = rules.filter(rule => !state.has(rule.key)).length;
  // Fail closed at capacity instead of evicting live counters and allowing a bypass.
  if (state.size + newKeys > maxKeys || rules.some(rule => (state.get(rule.key)?.timestamps.length ?? 0) >= rule.limit)) {
    return { allowed: false, state };
  }
  for (const rule of rules) {
    state.set(rule.key, { windowMs: rule.windowMs, timestamps: [...(state.get(rule.key)?.timestamps ?? []), now] });
  }
  return { allowed: true, state };
}

export function evaluateRateLimit(previous: RateLimitState, ip: string, action: Action, clock = Date.now, maxKeys = MAX_RATE_LIMIT_KEYS) {
  return evaluateRules(previous, [
    { key: `action:${action}:${ip}`, limit: 3, windowMs: 10 * MINUTE },
    { key: `ip:${ip}`, limit: 10, windowMs: 24 * 60 * MINUTE },
  ], clock, maxKeys);
}

export function evaluateGlobalRateLimit(previous: RateLimitState, clock = Date.now) {
  return evaluateRules(previous, [{ key: 'global', limit: 60, windowMs: 60 * MINUTE }], clock, 1);
}

// Serverless instances have independent memory: this is a best-effort layer.
// The Vercel Firewall rule is the real limit across instances and deployments.
let state: RateLimitState = new Map();
let globalState: RateLimitState = new Map();
export function consumeRateLimit(ip: string, action: Action) {
  // Failed CAPTCHA attempts still consume the per-IP quotas before any external request.
  const result = evaluateRateLimit(state, ip, action);
  state = result.state;
  return result.allowed;
}

// Call only after Turnstile succeeds. Reserve synchronously before sending mail,
// so concurrent verified requests cannot overrun the shared hourly allowance.
export function consumeGlobalRateLimit() {
  const result = evaluateGlobalRateLimit(globalState);
  globalState = result.state;
  return result.allowed;
}

export function resetRateLimits() { state = new Map(); globalState = new Map(); }

export async function clientIp(): Promise<string> {
  const requestHeaders = await headers();
  for (const name of ['x-vercel-forwarded-for', 'x-forwarded-for', 'x-real-ip']) {
    const ip = requestHeaders.get(name)?.split(',')[0].trim();
    if (ip && isIP(ip)) return ip;
  }
  return 'unknown';
}
