import './zod-config';
import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { locales } from '@/i18n/config';
import { waitlistSchema } from './waitlist-schema';

export const WAITLIST_TOKEN_TTL = 48 * 60 * 60 * 1000;
export const MAX_WAITLIST_TOKEN_LENGTH = 2048;
const payloadSchema = waitlistSchema('pt').omit({ consent: true }).extend({
  lang: z.enum(locales),
  exp: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
}).strict();
type Payload = z.infer<typeof payloadSchema>;

// now and exp are Unix milliseconds. Tokens carry data, not encryption; never log them.
export function signWaitlistToken(payload: Omit<Payload, 'exp'>, secret: string, now = Date.now()): string {
  if (secret.trim().length < 32) throw new Error('Invalid waitlist signing configuration');
  const parsed = payloadSchema.parse({ ...payload, exp: now + WAITLIST_TOKEN_TTL });
  const encoded = Buffer.from(JSON.stringify(parsed)).toString('base64url');
  const signature = createHmac('sha256', secret.trim()).update(encoded).digest('base64url');
  const token = `${encoded}.${signature}`;
  if (token.length > MAX_WAITLIST_TOKEN_LENGTH) throw new Error('Waitlist token too large');
  return token;
}

export function verifyWaitlistToken(token: unknown, secret: string, now = Date.now()): Payload | null {
  try {
    if (typeof token !== 'string' || token.length > MAX_WAITLIST_TOKEN_LENGTH || secret.trim().length < 32 || !Number.isFinite(now)) return null;
    const match = /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{43})$/.exec(token);
    if (!match) return null;
    const [, encoded, signature] = match;
    const actual = Buffer.from(signature, 'base64url');
    const expected = createHmac('sha256', secret.trim()).update(encoded).digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    // Reject noncanonical base64url encodings, even if they decode to identical bytes.
    if (actual.toString('base64url') !== signature) return null;
    const json = Buffer.from(encoded, 'base64url');
    if (json.toString('base64url') !== encoded) return null;
    const parsed = payloadSchema.safeParse(JSON.parse(json.toString('utf8')));
    if (!parsed.success || parsed.data.exp <= now || parsed.data.exp > now + WAITLIST_TOKEN_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

// Configuration only: never use Host, forwarded headers or the request URL.
export function waitlistOrigin(): string {
  const fallback = 'https://glaucialemos.dev';
  try {
    const url = new URL(process.env.SITE_URL?.trim() || fallback);
    return url.protocol === 'https:' && !url.username && !url.password ? url.origin : fallback;
  } catch {
    return fallback;
  }
}
