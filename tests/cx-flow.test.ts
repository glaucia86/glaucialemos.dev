import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getEventos, getCargos } from '@/lib/data';
import { buildCareer } from '@/lib/career';
import { commercial, speakingTopics } from '@/i18n/commercial';
import { comlink } from '@/i18n/comlink';
import { holonet } from '@/i18n/holonet';
import { journey } from '@/i18n/journey';
import { speakingVenues, testimonials, venueSources } from '@/data/prova-social';
import { routes } from '@/components/SiteChrome';
import { stickyCtaVisible } from '@/components/StickyCta';
import { CareerDialog } from '@/components/home/CareerDialog';
import { OfferFormats } from '@/components/credibility/OfferFormats';
import { Testimonials } from '@/components/credibility/Testimonials';
import { bootScript, bootScriptFor, skipsBoot, AURELIA_BOOT_KEY } from '@/lib/boot';

const home = readFileSync('src/app/[lang]/page.tsx', 'utf8');

describe('navegação linear (feedback de CX)', () => {
  it('menu na ordem Início, Tripulante, Projetos, Eventos, Workshops e mentorias, Conteúdo', () => {
    expect(routes.map(([key]) => key)).toEqual(['home', 'about', 'projects', 'events', 'services', 'content']);
    expect(readFileSync('src/components/SiteChrome.tsx', 'utf8')).toContain('0{index + 1}');
  });
  it.each(locales)('nomes literais do menu em %s', lang => {
    const nav = getDictionary(lang).nav;
    expect(nav.about).toBe({ pt: 'Tripulante', en: 'Crew', es: 'Tripulante' }[lang]);
    expect(nav.services).toBe({ pt: 'Workshops e mentorias', en: 'Workshops & mentoring', es: 'Talleres y mentorías' }[lang]);
    expect(comlink[lang].pages.services).toBe(nav.services);
  });
  it('a Home tem um único bloco de ofertas e a Tripulante não tira a pessoa da página', () => {
    expect(home.match(/<OfferFormats/g)).toHaveLength(1);
    expect(home).not.toMatch(/href=\{`\/\$\{lang\}\/sobre`\}/);
    expect(home).toContain('<CareerDialog');
    expect(home).toContain('socialLinks.linkedin} target="_blank"');
  });
  it.each(locales)('títulos e rótulos literais e o contexto do exemplo de IA para quem não é engenheiro (%s)', lang => {
    const h = holonet[lang];
    expect(h.episodes.join(' ')).not.toMatch(/arquivo estelar|star archive|archivo estelar|constela/i);
    expect(h.galaxy.title).not.toMatch(/constela/i);
    expect(journey[lang].demo.context).toMatch(/Microsoft/);
    expect(journey[lang].demo.context).toContain(journey[lang].demo.grounded);
  });
  it('o pop-up da trajetória fica no HTML (sem JS ele simplesmente não abre) e não mexe na URL', () => {
    const html = renderToStaticMarkup(createElement(CareerDialog, { copy: { more: holonet.pt.crew.more, title: holonet.pt.crew.mapTitle, intro: holonet.pt.crew.mapIntro, close: holonet.pt.crew.close }, roles: buildCareer(getCargos()), map: getDictionary('pt').niveora.map, locale: 'pt', source: 'Fonte', ship: '/ship.png' }));
    expect(html).toMatch(/<button[^>]*aria-haspopup="dialog"/);
    expect(html).toMatch(/<dialog[^>]*class="career-dialog"[^>]*data-lenis-prevent=""/);
    expect(html).toContain(holonet.pt.crew.mapTitle);
    expect(html.match(/class="ops-role"/g)?.length).toBe(buildCareer(getCargos()).length);
  });
});

describe('CTA sempre presente', () => {
  it.each(locales)('aparece nas páginas de leitura e some em Serviços e nas páginas secretas (%s)', lang => {
    for (const slug of ['', '/sobre', '/projetos', '/eventos', '/conteudo']) expect(stickyCtaVisible(`/${lang}${slug}`, lang)).toBe(true);
    for (const slug of ['/servicos', '/alem-da-ultima-orbita', '/kkkk']) expect(stickyCtaVisible(`/${lang}${slug}`, lang)).toBe(false);
    for (const text of [commercial[lang].cta, commercial[lang].nudgeTitle, commercial[lang].nudgeBody, commercial[lang].nudgeClose]) expect(text.length).toBeGreaterThan(3);
  });
  it('quem chega por #contato pula a abertura e o portal abre direto', () => {
    expect(skipsBoot('#contato')).toBe(true);
    expect(skipsBoot('')).toBe(false);
    for (const script of [bootScript, bootScriptFor(AURELIA_BOOT_KEY)]) expect(script).toContain('location.hash==="#contato"');
    expect(readFileSync('src/components/home/BootSequence.tsx', 'utf8')).toContain('!skipsBoot(location.hash)');
    expect(readFileSync('src/app/aurelia.css', 'utf8')).toMatch(/\.contact-portal__close \{[^}]*right: clamp/);
  });
});

describe('segredos e som descobríveis', () => {
  it.each(locales)('o rádio explica os segredos e as duas páginas secretas (%s)', lang => {
    const guide = comlink[lang].guide;
    expect(guide.pages).toContain('2');
    expect(guide.epilogueLocked).toContain('{n}');
    for (const text of Object.values(guide)) expect(text.trim().length).toBeGreaterThan(1);
    const sound = holonet[lang].sound;
    for (const text of [sound.invite, sound.inviteOn, sound.inviteOff]) expect(text.length).toBeGreaterThan(3);
  });
  it('o convite de som nunca liga nada sozinho: só depois de um clique', () => {
    const chrome = readFileSync('src/components/SiteChrome.tsx', 'utf8');
    expect(chrome).toContain('if (on && !sound) { setSoundEnabled(true); setSound(true); }');
    expect(chrome).not.toMatch(/setInvite\(true\);\s*setSoundEnabled/);
  });
});

describe('prova social literal', () => {
  it('cada local de palestra vem de um evento real com fonte', () => {
    const sources = venueSources(getEventos());
    expect(sources.map(item => item.name)).toEqual(speakingVenues.map(item => item.name));
    for (const item of sources) expect(item.source).toMatch(/^https:\/\//);
  });
  it.each(locales)('temas de palestra aparecem nos formatos (%s)', lang => {
    const html = renderToStaticMarkup(createElement(OfferFormats, { lang }));
    for (const topic of speakingTopics) expect(html).toContain(topic.copy[lang].title.replace('&', '&amp;'));
    expect(html).toContain(commercial[lang].topicsTitle);
    expect(html).toContain(`/${lang}/servicos?assunto=palestra#contato`);
  });
  it('sem depoimentos aprovados: só o convite e o formulário, nunca uma grade vazia', () => {
    expect(testimonials).toEqual([]);
    const html = renderToStaticMarkup(createElement(Testimonials, { lang: 'pt', enabled: true, siteKey: 'site' }));
    expect(html).not.toContain('credibility-testimonials__list');
    expect(html).toContain('name="quote"');
    expect(html).toContain('name="consent"');
  });
  it('depoimentos aprovados viram cartões estáticos, sem scripts de terceiros', () => {
    const html = renderToStaticMarkup(createElement(Testimonials, { lang: 'en', enabled: false, siteKey: '', items: [{ name: 'Ana', role: 'Tech Lead · Acme', quote: 'A workshop that changed how our team uses AI.', lang: 'en', context: 'workshop', received: '2026-10-28' }] }));
    expect(html).toContain('credibility-testimonials__list');
    expect(html).toContain('Ana');
    const list = html.slice(html.indexOf('credibility-testimonials__list'), html.indexOf('</ul>'));
    expect(list).not.toMatch(/<script|<iframe|platform\.twitter|linkedin\.com\/embed/);
  });
});

describe('palestra gravada na galeria', () => {
  it.each(locales)('mostra o pôster local e só carrega o YouTube depois do clique (%s)', async lang => {
    const { ActivityGallery } = await import('@/components/credibility/ActivityGallery');
    const { talkVideos } = await import('@/data/prova-social');
    const { existsSync } = await import('node:fs');
    const html = renderToStaticMarkup(createElement(ActivityGallery, { lang }));
    for (const video of talkVideos) {
      expect(existsSync(`public${video.poster.src}`)).toBe(true);
      expect(html).toContain(`href="${video.url}"`);
      expect(html).toContain(video.title);
    }
    expect(html).not.toMatch(/<iframe|youtube-nocookie/);
    expect(html).toContain(commercial[lang].video.note);
  });
});

describe('salto pelos 7 mundos', () => {
  it.each(locales)('mostra os 7 mundos com placas reais e links, e esconde o epílogo (%s)', async lang => {
    const { WorldsWarp, WARP_WORLDS } = await import('@/components/home/WorldsWarp');
    const { SCENES } = await import('@/lib/scenes');
    const { existsSync } = await import('node:fs');
    const html = renderToStaticMarkup(createElement(WorldsWarp, { lang }));
    expect(html.match(/class="worlds-warp__world"/g)).toHaveLength(7);
    for (const world of WARP_WORLDS) {
      expect(existsSync(`public${SCENES[world.scene].assets.background.src}`)).toBe(true);
      if (world.path !== null) expect(html).toContain(`href="/${lang}${world.path}"`);
    }
    expect(html).not.toContain('alem-da-ultima-orbita');
  });
});
