import type { Cargo, Evento, Projeto } from './types';

export type MapEvent = Pick<Evento, 'nome' | 'ano' | 'cidade' | 'pais' | 'lat' | 'lon' | 'idioma' | 'fonte'>;

export const homeRepositories = ['curso-typescript-zero-to-hero', 'ai-js-course', 'repocheckai'] as const;
export const homeServiceSubjects: Record<string, 'workshop' | 'mentoria' | 'palestra'> = {
  'workshop-sdlc-agentes-ia': 'workshop',
  'mentoria-consultoria-lideranca-tecnica': 'mentoria',
  palestras: 'palestra',
};

export function curateProjects(projects: Projeto[]) {
  return homeRepositories.flatMap(name => {
    const project = projects.find(item => item.nome === name);
    return project ? [project] : [];
  });
}

export function curateMilestones(cargos: Cargo[]) {
  return ['TopDown Sistemas', 'Regional Cloud Advocate', 'Cloud Advocate II'].flatMap(name => {
    const cargo = cargos.find(item => item.empresa === name || item.cargo.startsWith(name));
    return cargo ? [cargo] : [];
  });
}

export function formatExperiencePeriod(period: string, locale: string) {
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  return period.replace(/\b(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/g,
    month => formatter.format(new Date(Date.UTC(2000, months.indexOf(month), 1))).replace(/\.$/, ''));
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
