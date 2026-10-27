import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { markerAngle, project, ringPoint, RINGS, snapTurn } from '@/components/services/gyro-engine';
import { diamondAt, planetOffset } from '@/components/services/eclipse-engine';
import { dwellStep, DWELL_SECONDS, rectAt } from '@/components/services/swarm-engine';
import { FinaleTerrace } from '@/components/services/AureliaScene';
import { PlanetEclipse } from '@/components/services/PlanetEclipse';
import { ServiceGarden } from '@/components/services/ServiceGarden';
import { gardenRecords } from '@/lib/aurelia-records';
import { EGGS } from '@/lib/egg-catalog';
import { aurelia } from '@/i18n/aurelia';

describe('Aurélia: giroscópio', () => {
  it('encaixa em quartos de volta e só alinha as marcas no alto com o dial em 0', () => {
    expect(snapTurn(4.4)).toBe(0); expect(snapTurn(-1)).toBe(3); expect(snapTurn(1.6)).toBe(2);
    for (const ring of RINGS) {
      const top = project(ringPoint(ring, markerAngle(0), 1), 200, 2.4);
      expect(top.x).toBeCloseTo(100); expect(top.y).toBeLessThan(100);
      expect(project(ringPoint(ring, markerAngle(2), 1), 200, 2.4).y).toBeGreaterThan(100);
      // Unlocked rings keep their own roll, so their markers miss the shared vertical.
      expect(Math.abs(project(ringPoint(ring, markerAngle(0), 0), 200, 2.4).x - 100)).toBeGreaterThan(1);
    }
  });
});

describe('Aurélia: eclipse', () => {
  it('o planeta cobre o sol e o anel de diamante aparece pouco antes da totalidade', () => {
    expect(planetOffset(0)).toBeGreaterThan(1); expect(planetOffset(1)).toBe(0);
    expect(diamondAt(.93)).toBe(1); expect(diamondAt(.5)).toBe(0);
  });
  it.each(['pt', 'en', 'es'] as const)('SSR sem JS mostra título e texto, sem botão de segurar nem estado noturno (%s)', lang => {
    const html = renderToStaticMarkup(createElement(PlanetEclipse, { copy: aurelia[lang].dusk }));
    expect(html).toContain(aurelia[lang].dusk.title);
    expect(html).toMatch(/<button[^>]*class="eclipse__hold"[^>]*hidden=""/);
    expect(html).toContain('data-state="day"');
    expect(html).not.toContain('eclipse__restore');
  });
  it('a frase "eclipse" aciona o segredo da estufa', () => {
    expect(EGGS.find(egg => egg.id === 'greenhouse-dusk')!.phrases).toContain('eclipse');
  });
});

describe('Aurélia: enxame do Prince', () => {
  it('poliniza um canteiro depois de pairar sobre ele, uma vez só', () => {
    const rects = [{ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 0, w: 10, h: 10 }];
    expect(rectAt(rects, 25, 5)).toBe(1); expect(rectAt(rects, 15, 5)).toBe(-1);
    const dwell = [0, 0], done = [false, false];
    let reached = -1;
    for (let t = 0; t < DWELL_SECONDS + .1 && reached < 0; t += .05) reached = dwellStep(dwell, 1, .05, done);
    expect(reached).toBe(1);
    done[1] = true; expect(dwellStep(dwell, 1, .05, done)).toBe(-1);
    dwell[0] = .5; dwellStep(dwell, -1, .1, done); expect(dwell[0]).toBeCloseTo(.3);
  });
  it('os cards não têm mais botões de polinização', () => {
    const html = renderToStaticMarkup(createElement(ServiceGarden, { records: gardenRecords(), copy: aurelia.pt.garden, lang: 'pt', price: 'x', princeFace: '/f.webp' }));
    expect(html).not.toContain('service-garden__connect');
    expect(html.match(/<article/g)).toHaveLength(gardenRecords().length);
  });
});

describe('Aurélia: final no terraço', () => {
  it('Glaucia, Prince e o sinalizador ficam nas marcas do palco do hero, sobre a placa', () => {
    const html = renderToStaticMarkup(createElement(FinaleTerrace));
    expect(html).toContain('/galaxia/scenes/aurelia/background.webp');
    expect(html).toContain('/galaxia/actors/glaucia/aurelia/back.webp');
    expect(html).toContain('/galaxia/actors/prince/aurelia/front.webp');
    expect(html).toContain('communication-beacon-active');
    expect(html).toContain('aria-hidden="true"');
  });
});
