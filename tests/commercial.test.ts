import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync } from 'node:fs';
import { locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getCargos, getServicos } from '@/lib/data';
import { commercial, offers } from '@/i18n/commercial';
import { experience, photographs, publishedPhotos } from '@/data/prova-social';
import { OfferFormats } from '@/components/credibility/OfferFormats';

describe('apresentação comercial e fontes', () => {
  it.each(locales)('apresenta os três formatos equivalentes e o contato correto em %s, sem JS', lang => {
    const html = renderToStaticMarkup(createElement(OfferFormats, { lang }));
    expect((html.match(/<article /g) ?? [])).toHaveLength(3);
    expect(html).toContain('id="formatos"');
    for (const offer of offers) {
      expect(getServicos().some(service => service.id === offer.serviceId)).toBe(true);
      expect(html).toContain(`/${lang}/servicos?assunto=${offer.subject}#contato`);
      for (const text of Object.values(offer.copy[lang])) expect(text.trim()).not.toBe('');
      expect(html).toContain(offer.copy[lang].title);
    }
    expect(html).toContain(getDictionary(lang).services.price);
    expect(offers.map(offer => offer.subject)).toEqual(['palestra', 'workshop', 'mentoria']);
    expect(commercial[lang].mentoringAudience).toBe(offers[2].copy[lang].audience);
  });

  it.each(locales)('inclui palestras na apresentação, metadata e menu em %s', lang => {
    const d = getDictionary(lang);
    expect(d.nav.services).toBe(commercial[lang].menu);
    expect(d.services.title).toBe(commercial[lang].headline);
    expect(d.services.metadata.title).toContain(offers[0].copy[lang].title);
    expect(d.services.metadata.description).toContain(commercial[lang].metadataDescription);
    expect(d.home.value).toBe(commercial[lang].intro);
    // Glaucia's choice (28/10/2026): leadership first, then AI and engineering.
    expect(d.home.eyebrow).toBe({ pt: 'Liderança • IA • Engenharia', en: 'Leadership • AI • Engineering', es: 'Liderazgo • IA • Ingeniería' }[lang]);
  });

  it('só apresenta vínculos presentes no histórico, separados de eventos', () => {
    expect(experience.map(item => item.company)).toEqual(['Microsoft', 'Itaú Unibanco', 'Zup Innovation', 'Packt', 'Pagar.me', 'GlobalLogic LATAM']);
    for (const item of experience) {
      expect(getCargos()).toContainEqual(expect.objectContaining({ empresa: item.company, fonte: item.source }));
      expect(item.kind).toBe('employment');
      for (const lang of locales) expect(item.context[lang]).not.toBe('');
      if (!item.logo) continue;
      expect(existsSync(`public${item.logo.src}`)).toBe(true);
      expect(item.logo.source).toMatch(/^https:\/\/github.com\//);
    }
  });

  it('não publica candidatos sem escolha explícita nem fotografias remotas', () => {
    expect(publishedPhotos(photographs.map(photo => ({ ...photo, status: 'pending' })))).toEqual([]);
    for (const photo of publishedPhotos()) {
      expect(photo.status).toBe('approved');
      expect(photo.image.src).toMatch(/^\/prova-social\//);
      expect(existsSync(`public${photo.image.src}`)).toBe(true);
      expect(photo.image.width).toBeGreaterThan(0);
      expect(photo.image.height).toBeGreaterThan(0);
      expect(photo.source).toMatch(/^https:\/\//);
      for (const lang of locales) {
        expect(photo.caption[lang]).not.toBe('');
        expect(photo.alt[lang]).not.toBe('');
      }
    }
  });
});
