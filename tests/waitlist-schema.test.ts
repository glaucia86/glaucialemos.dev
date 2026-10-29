import { describe, expect, it } from 'vitest';
import { waitlistCopy } from '@/i18n/waitlist';
import { waitlistInterest, waitlistInterests, waitlistSchema, waitlistValues } from '@/lib/waitlist-schema';

const valid = { name: 'Ana', email: 'ana@example.com', interest: 'workshop-corporativo', consent: true };
const langs = ['pt', 'en', 'es'] as const;
describe.each(langs)('waitlist schema (%s)', lang => {
  it.each(waitlistInterests)('accepts %s and normalizes text', interest => {
    expect(waitlistSchema(lang).parse({ ...valid, interest, name: ' Ana ', email: ' ana@example.com ' })).toEqual({ ...valid, interest });
  });
  it('reports all required fields in the selected language', () => {
    const result = waitlistSchema(lang).safeParse({ name: ' ', email: 'invalid', interest: 'unknown', consent: false });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors).toEqual(Object.fromEntries(Object.entries(waitlistCopy[lang].errors).map(([key, value]) => [key, [value]])));
    expect(waitlistSchema(lang).safeParse({}).success).toBe(false);
    expect(waitlistSchema(lang).safeParse({ ...valid, consent: 'on' }).success).toBe(false);
  });
  it('bounds name and email lengths', () => {
    expect(waitlistSchema(lang).safeParse({ ...valid, name: 'a'.repeat(120) }).success).toBe(true);
    expect(waitlistSchema(lang).safeParse({ ...valid, name: 'a'.repeat(121) }).success).toBe(false);
    const email = `a@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(63)}.${'e'.repeat(56)}.com`;
    expect(email).toHaveLength(254);
    expect(waitlistSchema(lang).safeParse({ ...valid, email }).success).toBe(true);
    expect(waitlistSchema(lang).safeParse({ ...valid, email: `a${email}` }).success).toBe(false);
  });
});
it('reads bounded FormData, refuses forged consent, and filters query parameters', () => {
  const data = new FormData();
  data.set('name', 'a'.repeat(500)); data.set('email', 'b'.repeat(500)); data.set('interest', 'c'.repeat(500)); data.set('consent', 'true');
  const values = waitlistValues(data);
  expect(values.name).toHaveLength(121); expect(values.email).toHaveLength(255); expect(values.interest).toHaveLength(41); expect(values.consent).toBe(false);
  data.set('name', new Blob(['file']));
  expect(waitlistValues(data).name).toBe('');
  for (const interest of waitlistInterests) expect(waitlistInterest(interest)).toBe(interest);
  for (const interest of [null, '', 'unknown']) expect(waitlistInterest(interest)).toBe('');
});
