import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import Services from '@/app/[lang]/servicos/page';
import * as data from '@/lib/data';
import { getDictionary } from '@/i18n/dictionaries';

vi.mock('next/navigation', () => ({ usePathname: () => '/pt/servicos', useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn() }), notFound: () => { throw new Error('not found'); } }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
const page = async (lang = 'pt', interesse: string | string[] = '') => renderToStaticMarkup(await Services({ params: Promise.resolve({ lang }), searchParams: Promise.resolve({ interesse }) }));
it.each(['pt', 'en', 'es'] as const)('keeps empty testimonials absent and chapter codes unchanged (%s)', async lang => {
  const html = await page(lang);
  expect(html).not.toContain('depoimentos');
  expect(html).not.toContain(getDictionary(lang).services.testimonials);
  const jumps = [...html.matchAll(/class="chapter-jump__label">(.*?) <b>(.*?)<\/b>/g)];
  expect(jumps.map(match => match[1])).toEqual(['◆ 03', '◆ 04', '◆ 05', '◆ 06']);
  const chapterCodes = [...html.matchAll(/class="chapter-tag__ep" aria-hidden="true">(.*?)<\/span>/g)].map(match => match[1]);
  expect(chapterCodes).toEqual(['◆ 01', '◆ 02', '◆ 03', '◆ 04', '◆ 05', '◇', '◆ 06', '◆ 07']);
  expect(html.split(getDictionary(lang).services.independent)).toHaveLength(3);
  expect(html.match(/class="aurelia-independent"/g)).toHaveLength(2);
  expect(html.indexOf('id="lista-de-espera"')).toBeLessThan(html.indexOf('id="contato"'));
  expect(html).toContain('href="#lista-de-espera"');
});
it('inserts populated testimonials after proof and before garden with a chapter label', async () => {
  vi.spyOn(data, 'getDepoimentos').mockReturnValue([{ id: 'fixture', nome: 'Test fixture', cargo: 'Test role', texto: { pt: 'Apenas teste.', en: 'Test only.', es: 'Solo prueba.' } }]);
  const html = await page('en');
  expect(html.indexOf('id="provas"')).toBeLessThan(html.indexOf('id="depoimentos"'));
  expect(html.indexOf('id="depoimentos"')).toBeLessThan(html.indexOf('id="jardins"'));
  expect(html).toContain('Test only.');
  expect(html).toMatch(/chapter-tag__ep" aria-hidden="true">◆ 04<\/span>Testimonials/);
  expect(html).toMatch(/chapter-jump__label">◆ 05 <b>/);
});
it('preselects only a single valid query parameter without changing the contact form', async () => {
  vi.stubEnv('WEB3FORMS_ACCESS_KEY', 'private-key'); vi.stubEnv('TURNSTILE_SITE_KEY', 'public-key'); vi.stubEnv('TURNSTILE_SECRET_KEY', 'private-key');
  const html = await page('pt', 'curso-gravado');
  expect(html).toMatch(/id="waitlist-interest-curso-gravado"[^>]*checked=""/);
  expect(html).not.toMatch(/id="contact-service-[^"]+"[^>]*checked=""/);
  expect(await page('pt', ['curso-gravado', 'workshop-corporativo'])).not.toMatch(/id="waitlist-interest-[^"]+"[^>]*checked=""/);
});
