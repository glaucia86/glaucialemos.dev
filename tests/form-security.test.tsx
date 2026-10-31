import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from '@/components/ContactForm';
import { WaitlistForm } from '@/components/WaitlistForm';
import { TestimonialForm } from '@/components/credibility/TestimonialForm';
import { getDictionary } from '@/i18n/dictionaries';
import { contactCopy } from '@/i18n/contact';
import { waitlistCopy } from '@/i18n/waitlist';
import { testimonialCopy } from '@/i18n/testimonial';
import { contactSchema } from '@/lib/contact-schema';
import { waitlistSchema } from '@/lib/waitlist-schema';
import { testimonialSchema } from '@/lib/testimonial-schema';

const actionState = vi.hoisted(() => ({ state: null as { status: 'rate-limited' } | null }));
vi.mock('react', async importOriginal => ({
  ...await importOriginal<typeof import('react')>(),
  useActionState: () => [actionState.state, '/test-action', false],
}));
afterEach(() => { actionState.state = null; });

describe.each(['pt', 'en', 'es'] as const)('proteções dos formulários em %s', lang => {
  it('anuncia o limite nos três formulários e mantém as ações distintas do Turnstile', () => {
    actionState.state = { status: 'rate-limited' };
    const props = { lang, enabled: true, siteKey: 'public-key' };
    const forms = [
      [createElement(ContactForm, { ...props, copy: getDictionary(lang).services }), contactCopy[lang], 'contact'],
      [createElement(WaitlistForm, props), waitlistCopy[lang], 'waitlist'],
      [createElement(TestimonialForm, props), testimonialCopy[lang], 'testimonial'],
    ] as const;
    for (const [form, copy, action] of forms) {
      const html = renderToStaticMarkup(form);
      expect(html).toContain(`role="alert">${copy.rateLimited}</p>`);
      expect(html).toContain(`data-action="${action}"`);
    }
  });
  it('remove controles de nomes e rótulos antes de validar tamanho', () => {
    for (const schema of [contactSchema(lang).shape.name, waitlistSchema(lang).shape.name, testimonialSchema(lang).shape.name]) {
      expect(schema.parse('  Ana\r\n\u0000\u007f\u2028\u2029 Silva ')).toBe('Ana Silva');
      expect(schema.parse('x'.repeat(120) + '\r\n')).toHaveLength(120);
      expect(schema.safeParse('x'.repeat(121)).success).toBe(false);
      expect(schema.safeParse('\r\n\u0000').success).toBe(false);
    }
    for (const schema of [contactSchema(lang).shape.company, testimonialSchema(lang).shape.role]) {
      expect(schema.parse('Equipe\r\nOutra linha')).toBe('EquipeOutra linha');
      expect(schema.safeParse('\r\n').success).toBe(false);
      expect(schema.safeParse('x'.repeat(161)).success).toBe(false);
    }
    expect(contactSchema(lang).shape.message.parse('Linha 1\nLinha 2')).toBe('Linha 1\nLinha 2');
  });
});
