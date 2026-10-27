import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { aureliaStory } from '@/i18n/aurelia-story';
import { aurelia } from '@/i18n/aurelia';
import { beyondOrbit } from '@/i18n/beyond-orbit';
import { careerStart, gardenRecords, proofStars } from '@/lib/aurelia-records';
import { getArtigos, getCargos, getGithubStats } from '@/lib/data';
import { presenceStats } from '@/lib/atlas-records';
import { EGGS } from '@/lib/egg-catalog';
import { sweepRing, SWEEP_CUES, OrbitGyroscope } from '@/components/services/OrbitGyroscope';
import { ProofConstellation, PROOF_POSITIONS } from '@/components/services/ProofConstellation';
import { GardenBloom } from '@/components/services/GardenBloom';
import { WorkSteps } from '@/components/services/WorkSteps';
import { BeaconFinale } from '@/components/services/BeaconFinale';
import { EpilogueTransmission, NEEDED_WORLDS, TRANSMISSION_WORLDS, worldsWithSignal } from '@/components/services/EpilogueTransmission';
import { bloomPhase, flowerState } from '@/components/services/bloom-engine';
import { flowerConstellation } from '@/components/services/finale-sky';

const langs = ['pt', 'en', 'es'] as const;

describe('Aurélia: história da rolagem', () => {
  it('as três órbitas acendem em ordem e alinham no fim', () => {
    expect(sweepRing(0)).toBe(-1);
    expect(sweepRing(SWEEP_CUES[0])).toBe(0);
    expect(sweepRing(SWEEP_CUES[1] - .01)).toBe(0);
    expect(sweepRing(SWEEP_CUES[1])).toBe(1);
    expect(sweepRing(SWEEP_CUES[2])).toBe(2);
    expect(sweepRing(1)).toBe(2);
  });
  it('a floração dá a cada serviço uma fatia igual da rolagem e abre a flor antes do brilho', () => {
    expect(bloomPhase(0, 3)).toEqual({ index: 0, local: 0 });
    expect(bloomPhase(.5, 3).index).toBe(1);
    expect(bloomPhase(1, 3)).toEqual({ index: 2, local: 1 });
    const seed = flowerState(0), open = flowerState(.8), done = flowerState(1);
    expect(seed).toEqual({ stem: 0, leaves: 0, bud: 0, open: 0, glow: 0 });
    expect(open.open).toBe(1); expect(open.glow).toBe(0);
    expect(done.glow).toBeCloseTo(1);
  });
  it('a constelação final de Aurélia é uma flor de sete estrelas', () => {
    const points = flowerConstellation(.5, .3, .1, 1);
    expect(points).toHaveLength(7);
    for (const point of points.slice(1)) expect(Math.hypot(point.u - .5, point.v - .3)).toBeCloseTo(.1);
  });
});

describe('Aurélia: provas são os registros do site', () => {
  it('cada número vem de um dataset e aponta para o mundo que o mostra', () => {
    const stars = Object.fromEntries(proofStars('pt', 2026).map(star => [star.key, star]));
    const stats = presenceStats();
    expect(stars.events.value).toBe(stats.eventos);
    expect(stars.cities.value).toBe(stats.cidades);
    expect(stars.countries.value).toBe(stats.paisesPresenca);
    expect(stars.articles.value).toBe(getArtigos().length);
    expect(stars.stars.value).toBe(getGithubStats().stars);
    expect(stars.years.value).toBe(2026 - careerStart(getCargos().map(cargo => cargo.periodo)));
    expect(stars.events.href).toBe('/pt/eventos');
    expect(stars.articles.href).toBe('/pt/conteudo');
    expect(proofStars('es', 2026).length).toBeLessThanOrEqual(PROOF_POSITIONS.length);
  });
  it('lê o início da carreira do período mais antigo', () => {
    expect(careerStart(['mai 2026 – atual', 'dez 2013 – dez 2014', 'abr 2016 – mar 2019'])).toBe(2013);
  });
});

describe.each(langs)('Aurélia: SSR sem JS (%s)', lang => {
  const story = aureliaStory[lang];
  const records = gardenRecords();
  it('cada palco é conteúdo legível, sem estado de animação', () => {
    const html = [
      renderToStaticMarkup(createElement(OrbitGyroscope, { copy: aurelia[lang].rings, story: story.orbit, lang })),
      renderToStaticMarkup(createElement(ProofConstellation, { stars: proofStars(lang, 2026), copy: story.proof, locale: lang })),
      renderToStaticMarkup(createElement(GardenBloom, { records, copy: story.bloom, lang, price: 'x' })),
      renderToStaticMarkup(createElement(WorkSteps, { copy: story.steps })),
      renderToStaticMarkup(createElement(BeaconFinale, { copy: story.finale, terrace: createElement('div', { className: 'finale-terrace' }) })),
    ].join('');
    expect(html).not.toMatch(/data-(live|lit|active|aligned)=/);
    expect(html).not.toMatch(/\sinert/);
    for (const ring of story.orbit.rings) expect(html).toContain(ring.title);
    for (const { service } of records) expect(html).toContain(service.titulo[lang].replace(/&/g, '&amp;'));
    for (const item of story.steps.items) expect(html).toContain(item.title);
    expect(html).toContain(story.finale.continued);
    expect(html).toMatch(/<a class="button primary"[^>]*href="#contato">/);
    expect(html).toContain('href="#sinal"');
  });
  it('a transmissão aparece mesmo sem descobertas e lista os cinco mundos', () => {
    const html = renderToStaticMarkup(createElement(EpilogueTransmission, { lang, copy: story.transmission, epilogue: beyondOrbit[lang] }));
    expect(html).toContain('id="sinal"');
    expect(html).toContain(story.transmission.locked.replace('{n}', String(NEEDED_WORLDS)));
    expect(html.match(/<li/g)).toHaveLength(TRANSMISSION_WORLDS.length);
    for (const [page, path] of TRANSMISSION_WORLDS) expect(html).toContain(`href="/${lang}${path}">${story.transmission.worlds[page]}`);
    expect(html).not.toContain('epilogue-signal');
  });
});

describe('Aurélia: transmissão', () => {
  it('conta mundos pelas páginas dos segredos encontrados', () => {
    const home = EGGS.find(egg => egg.page === 'home')!.id, about = EGGS.find(egg => egg.page === 'about')!.id;
    expect([...worldsWithSignal([home, about])].sort()).toEqual(['about', 'home']);
  });
  it('tem copy completa nos três idiomas', () => {
    for (const lang of langs) {
      const { transmission, finale, proof } = aureliaStory[lang];
      expect(Object.keys(transmission.worlds).sort()).toEqual(TRANSMISSION_WORLDS.map(([page]) => page).sort());
      expect(transmission.locked).toContain('{n}'); expect(transmission.progress).toContain('{n}');
      expect(finale.continued.length).toBeGreaterThan(0);
      expect(finale.offMap.length).toBeGreaterThan(0);
      expect(Object.keys(proof.labels)).toHaveLength(6);
    }
  });
});
