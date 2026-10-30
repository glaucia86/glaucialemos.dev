import { z } from 'zod';
import { singleLine } from './single-line';
import type { Locale } from '@/i18n/config';
import { testimonialCopy } from '@/i18n/testimonial';
import { LINKEDIN_PROFILE } from './contact-schema';

export const TESTIMONIAL_CONTEXTS = ['talk', 'workshop', 'mentoring'] as const;
export const QUOTE_MIN = 20;
export const QUOTE_MAX = 600;
export const testimonialFields = ['name', 'role', 'linkedin', 'context', 'quote', 'consent'] as const;
export type TestimonialField = typeof testimonialFields[number];
export type TestimonialErrors = Partial<Record<TestimonialField, string[]>>;
export type TestimonialValues = Record<Exclude<TestimonialField, 'consent'>, string> & { consent: boolean };
export type TestimonialState =
  | { status: 'ok' }
  | { status: 'invalid'; errors: TestimonialErrors; values: TestimonialValues }
  | { status: 'captcha' | 'unavailable' | 'error' | 'rate-limited'; values?: TestimonialValues };

export function testimonialSchema(lang: Locale) {
  const errors = testimonialCopy[lang].errors;
  const text = (message: string, max: number) => z.string({ error: message }).transform(singleLine).pipe(z.string().trim().min(1, message).max(max, message));
  return z.object({
    name: text(errors.name, 120),
    role: text(errors.role, 160),
    linkedin: z.string().trim().max(300, errors.linkedin).refine(value => !value || LINKEDIN_PROFILE.test(value), errors.linkedin),
    context: z.enum(TESTIMONIAL_CONTEXTS, { error: errors.context }),
    quote: z.string({ error: errors.quote }).trim().min(QUOTE_MIN, errors.quote).max(QUOTE_MAX, errors.quote),
    consent: z.boolean({ error: errors.consent }).refine(value => value === true, errors.consent),
  });
}

export function testimonialValues(data: FormData): TestimonialValues {
  const string = (name: string, max: number) => {
    const value = data.get(name);
    return typeof value === 'string' ? value.slice(0, max + 1) : '';
  };
  return {
    name: string('name', 120), role: string('role', 160), linkedin: string('linkedin', 300),
    context: string('context', 20), quote: string('quote', QUOTE_MAX), consent: data.get('consent') === 'on',
  };
}
