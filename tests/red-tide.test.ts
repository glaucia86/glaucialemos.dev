import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { distance, nearestRoute, ROUTES } from '@/lib/red-tide-routes';
import { glitchAt, WINDOW } from '@/components/notfound/plasma-engine';
import { redTide } from '@/i18n/red-tide';
import { EGGS } from '@/lib/egg-catalog';
import { eggsFor } from '@/lib/eggs';
import { comlink as comlinkCopy } from '@/i18n/comlink';

vi.mock('next/navigation', () => ({ useParams: () => ({ lang: 'en' }), usePathname: () => '/en/servicoss', useRouter: () => ({ push: () => {} }) }));
const { RedTide, RED_TIDE_HOTSPOTS } = await import('@/components/notfound/RedTide');

describe('Maré Rubra: rota mais próxima', () => {
  it('mede a distância de edição', () => {
    expect(distance('servicoss', 'servicos')).toBe(1);
    expect(distance('', 'abc')).toBe(3);
  });
  it.each([
    ['/pt/servicoss', 'services'], ['/en/about', 'about'], ['/es/proyectos', 'projects'], ['/pt/blog', 'content'],
    ['/pt/eventoss', 'events'], ['/pt/sobr', 'about'], ['/pt', 'home'], ['/pt/contato', 'services'], ['/pt/conteúdo', 'content'],
  ] as const)('%s → %s', (path, key) => expect(nearestRoute(path)).toBe(key));
  it('não inventa uma rota quando nada é parecido', () => {
    expect(nearestRoute('/pt/xyzqwvk')).toBeNull();
  });
  it('só sugere rotas que existem e nunca o epílogo', () => {
    expect(Object.values(ROUTES)).toEqual(['', '/sobre', '/projetos', '/conteudo', '/eventos', '/servicos']);
  });
});

describe('Maré Rubra: plasma e cena', () => {
  it('a falha de sinal é curta e periódica', () => {
    expect(glitchAt(0)).toBe(true); expect(glitchAt(1)).toBe(false); expect(glitchAt(4.25)).toBe(true);
  });
  it('a janela e os alvos ficam do lado direito, fora do texto', () => {
    expect(WINDOW.left).toBeGreaterThan(.3);
    for (const spot of Object.values(RED_TIDE_HOTSPOTS)) { expect(spot.left).toBeGreaterThan(50); expect(spot.left + spot.width).toBeLessThanOrEqual(100); }
  });
});

describe('Maré Rubra: segredos', () => {
  it('registra os dois segredos da 404 com frases e dicas nos três idiomas', () => {
    const ids = eggsFor('notfound').filter(egg => egg.page === 'notfound').map(egg => egg.id).sort();
    expect(ids).toEqual(['paw-rescue', 'signal-recovered']);
    for (const lang of ['pt', 'en', 'es'] as const) for (const id of ids) expect(comlinkCopy[lang].eggs[id].hint.length).toBeGreaterThan(10);
    const phrases = EGGS.flatMap(egg => egg.phrases as readonly string[]);
    expect(new Set(phrases).size).toBe(phrases.length);
  });
});

describe('Maré Rubra: SSR', () => {
  it('sem JS: título, link para a base, mundos, vídeo mudo em loop com poster e portal fora do foco', () => {
    const html = renderToStaticMarkup(createElement(RedTide));
    const copy = redTide.en;
    expect(html).toContain(`>${copy.title}</h1>`);
    expect(html).toMatch(/<a class="button primary"[^>]*href="\/en">/);
    for (const name of Object.values(copy.routes).slice(1)) expect(html).toContain(name);
    expect(html).toMatch(/<video[^>]*autoPlay=""|<video[^>]*autoplay=""/i);
    expect(html).toMatch(/<video[^>]*muted=""/);
    expect(html).toContain('poster="/galaxia/scenes/red-tide/poster.webp"');
    expect(html).toMatch(/class="red-tide__portal"[^>]*tabindex="-1"/i);
    expect(html).toContain('/en/servicoss');
  });
  it('o episódio só abre por clique, com som, controles e legendas nos três idiomas (inglês por padrão aqui)', () => {
    const html = renderToStaticMarkup(createElement(RedTide));
    const episode = html.slice(html.indexOf('<dialog'));
    expect(html).toContain(redTide.en.episode.watch);
    expect(episode).toMatch(/<video[^>]*controls=""/);
    expect(episode).not.toMatch(/autoplay/i);
    expect(episode.match(/<track/g)).toHaveLength(3);
    const english = episode.match(/<track[^>]*srcLang="en"[^>]*>/i)?.[0] ?? '';
    expect(english).toContain('default=""');
    expect(episode.match(/<track[^>]*default=""/gi)).toHaveLength(1);
  });
  it.each(['pt', 'en', 'es'] as const)('copy completa (%s)', lang => {
    const copy = redTide[lang];
    expect(copy.signal.go).toContain('{name}');
    expect(Object.keys(copy.routes)).toHaveLength(6);
  });
});
