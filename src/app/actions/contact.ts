'use server';

import { verifyTurnstile } from '@/lib/turnstile';
import { postWeb3Forms } from '@/lib/web3forms';
import { isLocale } from '@/i18n/config';
import { contactConfig } from '@/lib/contact-config';
import { contactOptions, contactSchema, contactValues, type ContactState } from '@/lib/contact-schema';

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
  if (!await verifyTurnstile(data.get('cf-turnstile-response'), config.secretKey)) return { status: 'captcha', values };
  const service = contactOptions(lang).find(option => option.value === parsed.data.service)!;
  const sent = await postWeb3Forms(config.accessKey, {
    subject: `Contato glaucialemos.dev — ${service.label}`,
    ...parsed.data, service: service.label, service_id: service.value, lang,
  });
  return sent ? { status: 'ok' } : { status: 'error', values };
}
