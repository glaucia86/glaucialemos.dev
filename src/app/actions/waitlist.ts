'use server';

import { isLocale } from '@/i18n/config';
import { clientIp, consumeGlobalRateLimit, consumeRateLimit, consumeRecipientRateLimit } from '@/lib/rate-limit';
import { contactConfig, verifyTurnstile } from '@/lib/contact-config';
import { sendConfirmationMail } from '@/lib/mail';
import { signWaitlistToken, waitlistOrigin } from '@/lib/waitlist-confirmation';
import { waitlistSchema, waitlistValues, type WaitlistState } from '@/lib/waitlist-schema';

export async function submitWaitlist(_previous: WaitlistState | null, data: FormData): Promise<WaitlistState> {
  if (data.get('website')) return { status: 'ok' };
  const config = contactConfig();
  if (!config.enabled || !config.waitlistSecret) return { status: 'unavailable' };
  const locale = data.get('lang');
  const lang = typeof locale === 'string' && isLocale(locale) ? locale : 'pt';
  const values = waitlistValues(data);
  const parsed = waitlistSchema(lang).safeParse(values);
  if (!parsed.success) return { status: 'invalid', errors: parsed.error.flatten().fieldErrors, values };
  const ip = await clientIp();
  if (!consumeRateLimit(ip, 'waitlist')) return { status: 'rate-limited' };
  if (!await verifyTurnstile(config.secretKey!, data.get('cf-turnstile-response'), { remoteIp: ip === 'unknown' ? undefined : ip, expectedAction: 'waitlist' })) return { status: 'captcha', values };
  if (!consumeGlobalRateLimit()) return { status: 'rate-limited' };

  const { name, email, interest } = parsed.data;
  if (!consumeRecipientRateLimit(email)) return { status: 'ok' };
  const token = signWaitlistToken({ name, email, interest, lang }, config.waitlistSecret);
  const sent = await sendConfirmationMail(
    { apiKey: config.apiKey!, from: config.from!, to: email },
    { lang, interest, link: `${waitlistOrigin()}/api/waitlist/confirm?t=${token}` },
  );
  return sent ? { status: 'ok' } : { status: 'error', values };
}
