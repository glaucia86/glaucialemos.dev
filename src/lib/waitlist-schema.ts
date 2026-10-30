import './zod-config';
import { z } from 'zod';
import { singleLine } from './single-line';
import type { Locale } from '@/i18n/config';
import { waitlistCopy } from '@/i18n/waitlist';

export const waitlistInterests = ['workshop-corporativo', 'mentoria-grupo-noite', 'curso-gravado'] as const;
export const waitlistFields = ['name', 'email', 'interest', 'consent'] as const;
export type WaitlistField = typeof waitlistFields[number];
export type WaitlistValues = { name: string; email: string; interest: string; consent: boolean };
export type WaitlistErrors = Partial<Record<WaitlistField, string[]>>;
export type WaitlistState =
  | { status: 'ok' }
  | { status: 'invalid'; errors: WaitlistErrors; values: WaitlistValues }
  | { status: 'unavailable' | 'captcha' | 'error' | 'rate-limited'; values?: WaitlistValues };

export function waitlistSchema(lang: Locale) {
  const e = waitlistCopy[lang].errors;
  return z.object({
    name: z.string({ error: e.name }).transform(singleLine).pipe(z.string().min(1, e.name).max(120, e.name)),
    email: z.string({ error: e.email }).trim().email(e.email).max(254, e.email),
    interest: z.enum(waitlistInterests, { error: e.interest }),
    consent: z.boolean({ error: e.consent }).refine(value => value === true, e.consent),
  });
}
export function waitlistValues(data: FormData): WaitlistValues {
  const text = (key: string, max: number) => {
    const value = data.get(key);
    return typeof value === 'string' ? value.slice(0, max + 1) : '';
  };
  return { name: text('name', 120), email: text('email', 254), interest: text('interest', 40), consent: data.get('consent') === 'on' };
}
export const waitlistInterest = (value: string | null) => waitlistInterests.find(interest => interest === value) ?? '';
