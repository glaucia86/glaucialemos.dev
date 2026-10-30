'use server';

import { isLocale } from '@/i18n/config';
import { clientIp, consumeRateLimit } from '@/lib/rate-limit';
import { contactConfig, verifyTurnstile } from '@/lib/contact-config';
import { contactOptions, contactSchema, contactValues, type ContactState } from '@/lib/contact-schema';
import { mailLines, sendMail } from '@/lib/mail';

export async function submitContact(_previous: ContactState | null, data: FormData): Promise<ContactState> {
  // Do not reflect bot content or make any external request.
  if (data.get('website')) return { status: 'ok' };
  const config = contactConfig();
  if (!config.enabled) return { status: 'unavailable' };
  const locale = data.get('lang');
  const lang = typeof locale === 'string' && isLocale(locale) ? locale : 'pt';
  const values = contactValues(data);
  const parsed = contactSchema(lang).safeParse(values);
  if (!parsed.success) return { status: 'invalid', errors: parsed.error.flatten().fieldErrors, values };
  const ip = await clientIp();
  if (!consumeRateLimit(ip, 'contact')) return { status: 'rate-limited' };
  if (!await verifyTurnstile(config.secretKey!, data.get('cf-turnstile-response'), { remoteIp: ip === 'unknown' ? undefined : ip, expectedAction: 'contact' })) return { status: 'captcha', values };

  // Delivered from the server through Resend (Web3Forms' free plan rejects server-side submissions).
  const service = contactOptions(lang).find(option => option.value === parsed.data.service)!;
  const { name, company, linkedin, message } = parsed.data;
  const text = `${mailLines([['Nome', name], ['Empresa', company], ['LinkedIn', linkedin], ['Interesse', `${service.label} (${service.value})`], ['Idioma', lang], ['Consentimento LGPD', 'sim']])}\n\n${message}`;
  const sent = await sendMail({ apiKey: config.apiKey!, from: config.from!, to: config.to! }, `Contato glaucialemos.dev — ${service.label}`, text);
  return sent ? { status: 'ok' } : { status: 'error', values };
}
