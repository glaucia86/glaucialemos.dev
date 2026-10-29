import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Testimonials } from '@/components/services/Testimonials';
import { getDepoimentos } from '@/lib/data';
import { depoimentoSchema } from '@/lib/types';
import { getDictionary } from '@/i18n/dictionaries';

// Synthetic schema/rendering fixture only; never published as a testimonial.
const fixture = { id: 'test-only', nome: 'Fixture name', cargo: 'Fixture role', empresa: 'Fixture company', texto: { pt: 'Texto de teste.', en: 'Test text.', es: 'Texto de prueba.' }, url: 'https://example.com/quote' };
describe('testimonials', () => {
  it('ships an empty dataset and renders absolutely nothing', () => {
    expect(getDepoimentos()).toEqual([]);
    const props = { items: getDepoimentos(), lang: 'pt' as const, label: 'Depoimentos', code: '◆ 04' };
    expect(Testimonials(props)).toBeNull();
    expect(renderToStaticMarkup(createElement(Testimonials, props))).toBe('');
  });
  it.each(['pt', 'en', 'es'] as const)('renders the localized quote and attribution (%s)', lang => {
    const html = renderToStaticMarkup(createElement(Testimonials, { items: [depoimentoSchema.parse(fixture)], lang, label: getDictionary(lang).services.testimonials, code: '◆ 04' }));
    expect(html).toContain('id="depoimentos"');
    expect(html).toContain(`<blockquote cite="${fixture.url}"><p>${fixture.texto[lang]}</p>`);
    expect(html).toContain(fixture.nome); expect(html).toContain(`${fixture.cargo} · ${fixture.empresa}`);
  });
  it('allows optional company/url, rejects non-HTTPS URLs and missing required fields', () => {
    const minimal = { id: fixture.id, nome: fixture.nome, cargo: fixture.cargo, texto: fixture.texto };
    expect(depoimentoSchema.safeParse(minimal).success).toBe(true);
    expect(renderToStaticMarkup(createElement(Testimonials, { items: [minimal], lang: 'pt', label: 'Depoimentos', code: '◆ 04' }))).not.toContain('<a ');
    for (const url of ['http://example.com', 'javascript:alert(1)', 'invalid']) expect(depoimentoSchema.safeParse({ ...fixture, url }).success).toBe(false);
    for (const field of ['id', 'nome', 'cargo', 'texto']) expect(depoimentoSchema.safeParse({ ...fixture, [field]: undefined }).success).toBe(false);
    expect(depoimentoSchema.safeParse({ ...fixture, texto: { pt: 'test' } }).success).toBe(false);
  });
});
