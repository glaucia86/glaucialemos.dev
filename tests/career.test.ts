import { describe, expect, it } from 'vitest';
import { buildCareer, careerStats, eraOf, groupEras, parsePeriod } from '@/lib/career';
import { getCargos } from '@/lib/data';

const NOW = 2026 * 12 + 9;

describe('career', () => {
  it('parses source periods, including the current role', () => {
    expect(parsePeriod('dez 2013 – dez 2014', NOW)).toEqual({ start: 2013 * 12 + 11, end: 2014 * 12 + 11, current: false });
    expect(parsePeriod('mai 2026 – atual', NOW)).toEqual({ start: 2026 * 12 + 4, end: NOW, current: true });
    expect(() => parsePeriod('maio 2026 – atual', NOW)).toThrow();
  });

  it('orders roles newest first, fixing the HackDev position', () => {
    const roles = buildCareer(getCargos(), NOW);
    expect(roles.map(role => role.start)).toEqual([...roles].map(role => role.start).sort((a, b) => b - a));
    const names = roles.map(role => role.empresa);
    expect(names.indexOf('Oi S.A')).toBeLessThan(names.indexOf('HackDev'));
    expect(roles).toHaveLength(getCargos().length);
  });

  it('places overlapping roles on different lanes', () => {
    const roles = buildCareer(getCargos(), NOW);
    for (const a of roles) for (const b of roles) {
      if (a !== b && a.lane === b.lane) expect(a.end < b.start || b.end < a.start).toBe(true);
    }
    expect(new Set(roles.map(role => role.lane)).size).toBeGreaterThan(1);
  });

  it('splits the journey in three eras', () => {
    expect([eraOf(2013 * 12), eraOf(2019 * 12 + 2), eraOf(2025 * 12 + 8)]).toEqual(['padawan', 'knight', 'master']);
    const eras = groupEras(buildCareer(getCargos(), NOW));
    expect(eras.map(group => group.era)).toEqual(['master', 'knight', 'padawan']);
    expect(eras.find(group => group.era === 'knight')!.roles.every(role => role.empresa === 'Microsoft')).toBe(true);
    expect(eras.flatMap(group => group.roles)).toHaveLength(getCargos().length);
  });

  it('derives stats from the data', () => {
    const stats = careerStats(buildCareer(getCargos(), NOW), NOW);
    expect(stats.years).toBe(12);
    expect(stats.roles).toBe(getCargos().length);
    expect(stats.microsoftYears).toBe(6);
    expect(stats.companies).toBeLessThan(stats.roles);
  });
});
