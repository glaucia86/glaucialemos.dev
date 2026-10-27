'use server';

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
  const token = data.get('cf-turnstile-response');
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) return { status: 'captcha', values };

  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ secret: config.secretKey, response: token }),
    });
    if (!verification.ok) return { status: 'captcha', values };
    const result = await verification.json();
    if (result?.success !== true) return { status: 'captcha', values };
  } catch {
    return { status: 'captcha', values };
  }

  const service = contactOptions(lang).find(option => option.value === parsed.data.service)!;
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        access_key: config.accessKey, subject: `Contato glaucialemos.dev — ${service.label}`,
        from_name: 'glaucialemos.dev', ...parsed.data, service: service.label, service_id: service.value, lang,
      }),
    });
    if (!response.ok || (await response.json())?.success !== true) return { status: 'error', values };
    return { status: 'ok' };
  } catch {
    return { status: 'error', values };
  }
}
