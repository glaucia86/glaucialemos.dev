import { z } from 'zod';
import services from '@/data/servicos.json';
import { contactCopy } from '@/i18n/contact';
import type { Locale } from '@/i18n/config';

const kinds = ['workshop', 'consultoria', 'palestra', 'mentoria'] as const;
type Kind = typeof kinds[number];
// Match the service category, not incidental words (the mentoring ID also contains "consultoria").
const serviceFor = (kind: Kind) => services.find(service => service.id.startsWith(kind));
export const contactServiceId = (subject: string | null) => {
  if (kinds.includes(subject as Kind)) return serviceFor(subject as Kind)?.id ?? subject!;
  return services.some(service => service.id === subject) ? subject! : '';
};
export function contactOptions(lang: Locale) {
  const copy = contactCopy[lang];
  const labels = { workshop: copy.workshop, consultoria: copy.consultancy, palestra: copy.talk, mentoria: copy.mentoring };
  return [
    ...services.map(service => ({ value: service.id, label: service.titulo[lang] })),
    ...kinds.filter(kind => !serviceFor(kind)).map(kind => ({ value: kind, label: labels[kind] })),
  ];
}
export const LINKEDIN_PROFILE = /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?$/;
export const contactFields = ['name', 'company', 'service', 'message', 'linkedin', 'consent'] as const;
export type ContactField = typeof contactFields[number];
export type ContactErrors = Partial<Record<ContactField, string[]>>;
export type ContactValues = Record<Exclude<ContactField, 'consent'>, string> & { consent: boolean };
export type ContactState =
  | { status: 'ok' }
  | { status: 'invalid'; errors: ContactErrors; values: ContactValues }
  | { status: 'captcha' | 'unavailable' | 'error'; values?: ContactValues };

export function contactSchema(lang: Locale) {
  const errors = contactCopy[lang].errors;
  const text = (message: string, max: number) => z.string({ error: message }).trim().min(1, message).max(max, message);
  return z.object({
    name: text(errors.name, 120),
    company: text(errors.company, 160),
    service: z.string({ error: errors.service }).refine(value => contactOptions(lang).some(option => option.value === value), errors.service),
    message: text(errors.message, 5000),
    linkedin: z.string({ error: errors.linkedin }).max(300, errors.linkedin).regex(LINKEDIN_PROFILE, errors.linkedin),
    consent: z.boolean({ error: errors.consent }).refine(value => value === true, errors.consent),
  });
}
// The staged form walks the same schema in three steps: need → who → message (+ Turnstile and LGPD).
export const contactSteps = [['service'], ['name', 'company', 'linkedin'], ['message', 'consent']] as const satisfies readonly (readonly ContactField[])[];
export const contactStepOf = (field: ContactField) => contactSteps.findIndex(step => (step as readonly ContactField[]).includes(field));
export function validateContactStep(lang: Locale, step: number, values: ContactValues): ContactErrors {
  const fields: readonly ContactField[] = contactSteps[step] ?? [];
  const parsed = contactSchema(lang).pick(Object.fromEntries(fields.map(field => [field, true])) as Record<ContactField, true>).safeParse(values);
  return parsed.success ? {} : parsed.error.flatten().fieldErrors as ContactErrors;
}
export function contactValues(data: FormData): ContactValues {
  const string = (name: string, max: number) => {
    const value = data.get(name);
    // Bound reflected values while retaining overflow so schema validation still rejects it.
    return typeof value === 'string' ? value.slice(0, max + 1) : '';
  };
  return {
    name: string('name', 120), company: string('company', 160), service: string('service', 200),
    message: string('message', 5000), linkedin: string('linkedin', 300), consent: data.get('consent') === 'on',
  };
}
