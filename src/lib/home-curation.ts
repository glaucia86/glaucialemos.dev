import type { Cargo, Evento } from './types';

export type MapEvent = Pick<Evento, 'nome' | 'ano' | 'cidade' | 'pais' | 'lat' | 'lon' | 'idioma' | 'fonte'>;

export const featuredContribution = 'Azure-Samples/serverless-chat-langchainjs';
export const HOME_ARCHIVE_SIZE = 6;
export const PROJECTS_PAGE_SIZE = 12;
export const homeServiceSubjects: Record<string, 'workshop' | 'mentoria' | 'palestra'> = {
  'workshop-sdlc-agentes-ia': 'workshop',
  'mentoria-consultoria-lideranca-tecnica': 'mentoria',
  palestras: 'palestra',
};

export function curateMilestones(cargos: Cargo[]) {
  return ['TopDown Sistemas', 'Regional Cloud Advocate', 'Developer Advocate II', 'Itaú Unibanco'].flatMap(name => {
    const cargo = cargos.find(item => item.empresa === name || item.cargo.startsWith(name));
    return cargo ? [cargo] : [];
  });
}

const present: Record<string, string> = { pt: 'atual', en: 'present', es: 'actualidad' };

export function formatExperiencePeriod(period: string, locale: string) {
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  return period.replace(/\b(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/g,
    month => formatter.format(new Date(Date.UTC(2000, months.indexOf(month), 1))).replace(/\.$/, ''))
    .replace(/\batual$/, present[locale] ?? present.pt);
}

export function hasCoordinates(event: MapEvent): event is MapEvent & { lat: number; lon: number } {
  return event.lat !== null && event.lon !== null;
}

export function groupEvents(events: MapEvent[], locale: string) {
  const groups = new Map<string, MapEvent[]>();
  for (const event of events) {
    const key = hasCoordinates(event) && event.pais && event.pais !== 'Global' ? event.pais : 'unlocated';
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return [...groups].sort(([a], [b]) => {
    if (a === 'unlocated') return 1;
    if (b === 'unlocated') return -1;
    return a.localeCompare(b, locale);
  }).map(([country, entries]) => ({ country, events: entries.sort((a, b) => b.ano - a.ano || a.nome.localeCompare(b.nome, locale)) }));
}
