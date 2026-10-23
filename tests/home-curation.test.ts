import { describe, it, expect } from 'vitest';
import { groupEvents, curateProjects, hasCoordinates, formatExperiencePeriod } from '@/lib/home-curation';
import { getEventos, getProjetos } from '@/lib/data';

describe('home curation', () => {
  it('localizes the source periods without changing their dates', () => {
    expect(formatExperiencePeriod('dez 2019 – mai 2025', 'en')).toBe('Dec 2019 – May 2025');
    expect(formatExperiencePeriod('mar 2019 – dez 2019', 'es')).toBe('mar 2019 – dic 2019');
    expect(formatExperiencePeriod('dez 2013 – dez 2014', 'pt')).toBe('dez 2013 – dez 2014');
  });
  it('keeps the course first even when star counts change', () => {
    const projects = getProjetos().map(project => ({ ...project, estrelas: project.nome === 'repocheckai' ? 99999 : 0 }));
    expect(curateProjects(projects).map(project => project.nome)).toEqual(['curso-typescript-zero-to-hero', 'ai-js-course', 'repocheckai']);
  });
  it('keeps all records exactly once and never places missing coordinates on the map', () => {
    const events = getEventos();
    const groups = groupEvents(events, 'pt');
    expect(groups.flatMap(group => group.events)).toHaveLength(events.length);
    const unknown = groups.find(group => group.country === 'unlocated')!;
    expect(unknown.events.some(event => event.nome === 'Codecon 2022')).toBe(true);
    expect(groups.filter(group => group.country !== 'unlocated').every(group => group.events.every(hasCoordinates))).toBe(true);
    expect(hasCoordinates({ ...events[0], lat: 0, lon: 0 })).toBe(true);
    expect(hasCoordinates({ ...events[0], lat: null, lon: 0 })).toBe(false);
    expect(hasCoordinates({ ...events[0], lat: 0, lon: null })).toBe(false);
  });
  it('orders newest first and names alphabetically for ties, without mutating input', () => {
    const event = getEventos()[0];
    const input = [{ ...event, ano: 2020, nome: 'B' }, { ...event, ano: 2023, nome: 'Z' }, { ...event, ano: 2020, nome: 'A' }];
    expect(groupEvents(input, 'en')[0].events.map(event => event.nome)).toEqual(['Z', 'A', 'B']);
    expect(input.map(event => event.nome)).toEqual(['B', 'Z', 'A']);
  });
});
