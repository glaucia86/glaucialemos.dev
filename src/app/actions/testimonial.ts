'use server';

import { isLocale } from '@/i18n/config';
import { testimonialCopy } from '@/i18n/testimonial';
import { clientIp, consumeGlobalRateLimit, consumeRateLimit } from '@/lib/rate-limit';
import { contactConfig, verifyTurnstile } from '@/lib/contact-config';
import { mailLines, sanitizeHeader, sendMail } from '@/lib/mail';
import { testimonialSchema, testimonialValues, type TestimonialState } from '@/lib/testimonial-schema';

// A testimonial is never published here: it reaches Glaucia's inbox for review, with the permission to publish.
export async function submitTestimonial(_previous: TestimonialState | null, data: FormData): Promise<TestimonialState> {
  if (data.get('website')) return { status: 'ok' };
  const config = contactConfig();
  if (!config.enabled) return { status: 'unavailable' };
  const locale = data.get('lang');
  const lang = typeof locale === 'string' && isLocale(locale) ? locale : 'pt';
  const values = testimonialValues(data);
  const parsed = testimonialSchema(lang).safeParse(values);
  if (!parsed.success) return { status: 'invalid', errors: parsed.error.flatten().fieldErrors, values };
  const ip = await clientIp();
  if (!consumeRateLimit(ip, 'testimonial')) return { status: 'rate-limited' };
  if (!await verifyTurnstile(config.secretKey!, data.get('cf-turnstile-response'), { remoteIp: ip === 'unknown' ? undefined : ip, expectedAction: 'testimonial' })) return { status: 'captcha', values };
  if (!consumeGlobalRateLimit()) return { status: 'rate-limited' };

  const { name, role, linkedin, context, quote } = parsed.data;
  const text = `${mailLines([['Nome', name], ['Cargo e empresa', role], ['LinkedIn', linkedin || '—'], ['Contexto', testimonialCopy.pt.contexts[context]], ['Idioma', lang], ['Autorizou publicar', 'sim']])}\n\n“${quote}”\n\nPara publicar: adicione em testimonials (src/data/prova-social.ts).`;
  const sent = await sendMail({ apiKey: config.apiKey!, from: config.from!, to: config.to! }, `Depoimento para aprovar — ${sanitizeHeader(name)}`, text);
  return sent ? { status: 'ok' } : { status: 'error', values };
}
