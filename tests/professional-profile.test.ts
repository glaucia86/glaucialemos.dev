import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import About from '@/app/[lang]/sobre/page';
import { locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { buildCareer } from '@/lib/career';
import { getCargos } from '@/lib/data';
import { curateMilestones, formatExperiencePeriod } from '@/lib/home-curation';
import { CARD_NOW } from '@/lib/mars-records';

vi.mock('next/navigation', () => ({ usePathname: () => '/pt/sobre', useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn() }), notFound: () => { throw new Error('not found'); } }));

const role = 'Principal Software Engineer | AI & Developer Education';
const taglines = { pt: 'Conectando IA, engenharia e pessoas.', en: 'Connecting AI, engineering, and people.', es: 'Conectando IA, ingeniería y personas.' };
const latestLabels = { pt: 'Experiência mais recente', en: 'Most recent experience', es: 'Experiencia más reciente' };

describe('company-independent professional profile', () => {
  it.each(locales)('uses the approved identity and a localized tagline in %s', lang => {
    const d = getDictionary(lang);
    expect(d.home.eyebrow).toBe(role);
    expect(d.home.value).toBe(taglines[lang]);
    expect(d.holonet.crew.sheet[0][1]).toBe(role);
    expect(d.niveora.log.sheet[0][1]).toBe(role);
    const currentProfile = JSON.stringify({ home: d.home, about: d.about, intro: d.journey.intro, crew: d.holonet.crew, log: d.niveora.log });
    expect(currentProfile).not.toMatch(/ita[uú]|AI Transformation Lead|AI Lead/i);
  });

  it('uses the same company-independent identity on the current Projects card', () => {
    expect(CARD_NOW.find(line => line.label === 'Work')?.value).toBe(role);
  });

  it('preserves the Itaú role as completed history without changing other ongoing work', () => {
    const roles = buildCareer(getCargos(), 2026 * 12 + 10);
    expect(roles.find(item => item.empresa === 'Itaú Unibanco')).toMatchObject({
      cargo: 'AI Transformation Lead · Engineering Specialist II (Itaú Agro Varejo)',
      periodo: 'mai 2026 – nov 2026', current: false, end: 2026 * 12 + 10,
    });
    expect(roles.find(item => item.empresa === 'Packt')?.current).toBe(true);
    expect(curateMilestones(getCargos()).at(-1)?.periodo).toBe('mai 2026 – nov 2026');
  });

  it.each(locales)('labels the latest capsule record as history rather than today in %s', async lang => {
    const html = renderToStaticMarkup(await About({ params: Promise.resolve({ lang }) }));
    const capsule = html.match(/<ol class="capsule__records">([\s\S]*?)<\/ol>/)?.[1];
    expect(capsule).toBeDefined();
    expect(capsule).toContain(latestLabels[lang]);
    expect(capsule).toContain(`Itaú Unibanco · ${formatExperiencePeriod('mai 2026 – nov 2026', lang)}`);
    expect(capsule).not.toMatch(/capsule__label">(?:Hoje|Today|Hoy)</);
  });
});
