import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/config';
import { chromeDictionary, getDictionary } from '@/i18n/dictionaries';
import { aurelia } from '@/i18n/aurelia';
import { aureliaStory } from '@/i18n/aurelia-story';
import { commercial, offers } from '@/i18n/commercial';
import { beyondOrbit } from '@/i18n/beyond-orbit';
import { waitlistCopy } from '@/i18n/waitlist';
import { experience, testimonials } from '@/data/prova-social';
import { getDepoimentos, getServicos } from '@/lib/data';
import { CARD_NOW } from '@/lib/mars-records';

describe('Itaú stays within professional/career history', () => {
  it.each(locales)('keeps the shared chrome payload free of the employer in %s', lang => {
    const dictionary = chromeDictionary(lang);
    expect(Object.keys(dictionary).sort()).toEqual([
      'accessibility', 'comlink', 'easterEgg', 'footer', 'holonet', 'motion', 'nav',
    ]);
    expect(JSON.stringify(dictionary)).not.toMatch(/ita[uú]/i);
  });

  it.each(locales)('keeps Services data and copy free of the employer in %s', lang => {
    const sources = {
      experience,
      services: getDictionary(lang).services,
      aurelia: aurelia[lang],
      aureliaStory: aureliaStory[lang],
      commercial: commercial[lang],
      offers: offers.map(offer => offer.copy[lang]),
      beyondOrbit: beyondOrbit[lang],
      waitlist: waitlistCopy[lang],
      servicos: getServicos(),
      depoimentos: getDepoimentos(),
      testimonials,
    };
    for (const [name, value] of Object.entries(sources)) {
      expect(JSON.stringify(value), `${lang}: ${name}`).not.toMatch(/ita[uú]/i);
    }
  });

  it('ships no employer logo in public/prova-social', () => {
    expect(readdirSync('public/prova-social', { recursive: true })
      .filter(file => /^ita[uú]/i.test(String(file).split(/[\\/]/).at(-1)!))).toEqual([]);
  });

  it.each(locales)('keeps Home crew copy outside the career timeline free of the employer in %s', lang => {
    const d = getDictionary(lang);
    expect(d.journey.intro).not.toMatch(/ita[uú]/i);
    expect(JSON.stringify(d.holonet.crew.sheet)).not.toMatch(/ita[uú]/i);
  });

  it('keeps the Projects current card free of the employer', () => {
    expect(JSON.stringify(CARD_NOW)).not.toMatch(/ita[uú]/i);
  });
});
