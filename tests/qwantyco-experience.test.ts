import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CareerMap } from '@/components/about/CareerMap';
import { locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { buildCareer } from '@/lib/career';
import { getCargos } from '@/lib/data';
import { curateMilestones } from '@/lib/home-curation';
import { cargoSchema } from '@/lib/types';

const role = () => getCargos().find(item => item.empresa === 'Qwantyco')!;
const textHtml = (text: string) => renderToStaticMarkup(createElement('p', null, text)).slice(3, -4);

describe('Qwantyco partnership', () => {
  it('records the temporary partnership as the latest ongoing role', () => {
    expect(buildCareer(getCargos(), 2026 * 12 + 10)[0]).toMatchObject({
      empresa: 'Qwantyco', cargo: 'AI Solutions Engineer | Business Development',
      periodo: 'nov 2026 – atual', current: true,
    });
    expect(curateMilestones(getCargos()).at(-1)?.empresa).toBe('Qwantyco');
    expect(getCargos().find(item => item.empresa === 'Itaú Unibanco')?.periodo).toBe('mai 2026 – nov 2026');
  });

  it.each(locales)('includes localized current work, future possibilities and company context in %s', lang => {
    expect(role()?.detalhes).toBeDefined();
    const details = role().detalhes!;
    const copy = details[lang];
    expect(details.site).toBe('https://qwantyco.com/');
    expect(copy.vinculo).toBe({ pt: 'Parceria temporária', en: 'Temporary partnership', es: 'Colaboración temporal' }[lang]);
    expect(copy.local).toContain('Rio de Janeiro');
    expect(copy.local).toMatch(/Híbrido|Hybrid/);
    expect(copy.descricao).toMatch(/potenciais clientes|potential clients|clientes potenciales/);
    expect(copy.perspectivas).toMatch(/poderá incluir|may also involve|podrá incluir/);
    expect(copy.empresa).toContain('Olív-IA');
    expect(copy.empresa).toMatch(/instância dedicada|dedicated instance|instancia dedicada/);
    const html = renderToStaticMarkup(createElement(CareerMap, {
      roles: buildCareer(getCargos()), copy: getDictionary(lang).niveora.map,
      locale: lang, source: getDictionary(lang).common.source, ship: '/ship.png',
    }));
    expect(html).toContain('class="ops-role-details"');
    for (const text of [copy.vinculo, copy.local, copy.descricao, copy.perspectivas, copy.empresa, copy.siteLabel]) {
      expect(html).toContain(textHtml(text));
    }
    expect(html).toContain('href="https://qwantyco.com/"');
  });

  it('requires all three translations whenever detailed experience is provided', () => {
    expect(role()?.detalhes).toBeDefined();
    const { es: omitted, ...incomplete } = role().detalhes!;
    expect(omitted).toBeDefined();
    expect(cargoSchema.safeParse({ ...role(), detalhes: incomplete }).success).toBe(false);
  });

  it.each(locales)('keeps the personal identity independent of Qwantyco in %s', lang => {
    const d = getDictionary(lang);
    expect(d.home.eyebrow).toBe('Principal Software Engineer | AI & Developer Education');
    expect(JSON.stringify({ home: d.home, about: d.about, intro: d.journey.intro, crew: d.holonet.crew, log: d.niveora.log })).not.toContain('Qwantyco');
  });
});
