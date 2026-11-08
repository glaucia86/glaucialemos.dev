import { describe, expect, it } from 'vitest';
import { getArtigos } from '@/lib/data';
import { TRANSLATIONS, articlesByYear, libraryStats, platformCounts } from '@/lib/lumina-records';
import { NO_FILTERS, parseFilters, shelve } from '@/lib/lumina-shelves';

const editions = [
  {
    titulo: 'From Voice to a Support Board: Building a Triage Application with GPT-Live, the Decisions API, and TypeScript',
    url: 'https://glaucialemos.hashnode.dev/from-voice-to-a-support-board-building-a-triage-application-with-gpt-live-the-decisions-api-and-typescript',
    idioma: 'en',
  },
  {
    titulo: 'Da voz ao quadro de suporte: construindo uma aplicação de triagem com GPT-Live, Decisions API e TypeScript',
    url: 'https://glaucialemos.hashnode.dev/da-voz-ao-quadro-de-suporte-construindo-uma-aplica-o-de-triagem-com-gpt-live-decisions-api-e-typescript',
    idioma: 'pt-BR',
  },
] as const;
const articles = getArtigos();

describe('Hashnode voice triage tutorial', () => {
  it.each(editions)('includes the verified $idioma edition once with its original metadata', edition => {
    expect(articles.filter(article => article.url === edition.url)).toEqual([
      { ...edition, plataforma: 'Hashnode', data: '2026-11-07' },
    ]);
  });

  it('keeps article URLs unique and registers the two editions as a translation pair', () => {
    expect(new Set(articles.map(article => article.url)).size).toBe(articles.length);
    expect(TRANSLATIONS.filter(pair => pair.some(article => article.url === editions[0].url)))
      .toEqual([[articles.find(article => article.url === editions[0].url), articles.find(article => article.url === editions[1].url)]]);
  });

  it('exposes both editions through the existing Hashnode URL filter', () => {
    const valid = { platforms: platformCounts().map(platform => platform.name), years: articlesByYear().map(item => item.year) };
    const filters = parseFilters('?plataforma=Hashnode', valid);
    expect(filters.platform).toBe('Hashnode');
    expect(shelve(articles, filters).map(article => article.url).sort()).toEqual(editions.map(edition => edition.url).sort());
  });

  it.each(editions)('keeps the $idioma edition in its own language filter', edition => {
    expect(shelve(articles, { ...NO_FILTERS, platform: 'Hashnode', language: edition.idioma }).map(article => article.url)).toEqual([edition.url]);
  });

  it('derives the new platform and counts from the catalogue', () => {
    expect(platformCounts()).toContainEqual({ name: 'Hashnode', count: 2 });
    expect(libraryStats()).toMatchObject({ records: 117, platforms: 5 });
  });
});
