'use server';

import { isLocale } from '@/i18n/config';
import { waitlistCopy } from '@/i18n/waitlist';
import { contactConfig } from '@/lib/contact-config';
import { verifyTurnstile } from '@/lib/turnstile';
import { postWeb3Forms } from '@/lib/web3forms';
import { waitlistSchema, waitlistValues, type WaitlistState } from '@/lib/waitlist-schema';

export async function submitWaitlist(_previous: WaitlistState | null, data: FormData): Promise<WaitlistState> {
  if (data.get('website')) return { status: 'ok' };
  const config = contactConfig();
  if (!config.enabled) return { status: 'unavailable' };
  const locale = data.get('lang');
  const lang = typeof locale === 'string' && isLocale(locale) ? locale : 'pt';
  const values = waitlistValues(data);
  const parsed = waitlistSchema(lang).safeParse(values);
  if (!parsed.success) return { status: 'invalid', errors: parsed.error.flatten().fieldErrors, values };
  if (!await verifyTurnstile(data.get('cf-turnstile-response'), config.secretKey)) return { status: 'captcha', values };
  const label = waitlistCopy[lang].offerings[parsed.data.interest];
  const sent = await postWeb3Forms(config.accessKey, {
    ...parsed.data, form: 'waitlist', interest_label: label, lang,
    subject: `Lista de espera glaucialemos.dev — ${label}`,
  });
  return sent ? { status: 'ok' } : { status: 'error', values };
}
