import { getArtigos, getCargos, getGithubStats, getServicos } from './data';
import { presenceStats } from './atlas-records';
import { getDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';
import type { Servico } from './types';

export type Subject = 'workshop' | 'mentoria' | 'palestra';
export type GardenRecord = { service: Servico; subject: Subject };
const SUBJECTS: Record<string, Subject> = {
  'workshop-sdlc-agentes-ia': 'workshop',
  'mentoria-consultoria-lideranca-tecnica': 'mentoria',
  palestras: 'palestra',
};
// Fail visibly if the catalogue changes: no invented offer or silent substitution.
export function gardenRecords(services = getServicos()): GardenRecord[] {
  if (!services.length) throw new Error('Aurélia needs the existing service catalogue');
  return services.map(service => {
    const subject = SUBJECTS[service.id];
    if (!subject) throw new Error(`Aurélia: unmapped service ${service.id}`);
    return { service, subject };
  });
}
export { serviceHref, RING_START, turnRing, ringsAligned } from './aurelia-controls';
export const servicePrice = (service: Servico, lang: Locale) => service.preco === 'sob consulta' ? getDictionary(lang).services.price : service.preco;

export type ProofKey = 'events' | 'cities' | 'countries' | 'articles' | 'years' | 'stars';
export type ProofStar = { key: ProofKey; value: number; href: string; link: 'events' | 'articles' | 'years' | 'stars' };
/** First year in the career records ("dez 2013 – dez 2014" → 2013). */
export const careerStart = (periods: readonly string[]) => Math.min(...periods.map(period => Number(period.match(/\d{4}/)?.[0] ?? Infinity)));
// Aurélia's constellation of proof: every value is computed from the datasets other worlds already show.
export function proofStars(lang: Locale, year = new Date().getFullYear()): ProofStar[] {
  const stats = presenceStats();
  const start = careerStart(getCargos().map(cargo => cargo.periodo));
  if (!Number.isFinite(start)) throw new Error('Aurélia: career records without a start year');
  return [
    { key: 'events', value: stats.eventos, href: `/${lang}/eventos`, link: 'events' },
    { key: 'cities', value: stats.cidades, href: `/${lang}/eventos`, link: 'events' },
    { key: 'countries', value: stats.paisesPresenca, href: `/${lang}/eventos`, link: 'events' },
    { key: 'articles', value: getArtigos().length, href: `/${lang}/conteudo`, link: 'articles' },
    { key: 'years', value: year - start, href: `/${lang}/sobre`, link: 'years' },
    { key: 'stars', value: getGithubStats().stars, href: `/${lang}/projetos`, link: 'stars' },
  ];
}
