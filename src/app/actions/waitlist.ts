'use server';

import { isLocale } from '@/i18n/config';
import { waitlistCopy } from '@/i18n/waitlist';
import { contactConfig, verifyTurnstile } from '@/lib/contact-config';
import { mailLines, sendMail } from '@/lib/mail';
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
  if (!await verifyTurnstile(config.secretKey!, data.get('cf-turnstile-response'))) return { status: 'captcha', values };

  const label = waitlistCopy[lang].offerings[parsed.data.interest];
  const { name, email, interest } = parsed.data;
  const text = mailLines([
    ['Nome', name], ['E-mail', email], ['Interesse', `${label} (${interest})`], ['Idioma', lang],
    ['Consentimento LGPD', 'sim'], ['Finalidade', 'avisar somente quando a modalidade escolhida estiver disponível'],
  ]);
  const sent = await sendMail(
    { apiKey: config.apiKey!, from: config.from!, to: config.to! },
    `Lista de espera glaucialemos.dev — ${label}`,
    text,
  );
  return sent ? { status: 'ok' } : { status: 'error', values };
}
