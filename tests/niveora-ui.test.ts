import { describe, expect, it } from 'vitest';
import { buildCareer, groupEras, normalizeEra } from '@/lib/career';
import { getCargos } from '@/lib/data';
import { niveora } from '@/i18n/niveora';

describe('Nivéora interface', () => {
  it('groups parallel trails into eras and falls back for an unknown filter', () => {
    const roles = buildCareer(getCargos());
    const groups = groupEras(roles);
    expect(groups.flatMap(group => group.roles)).toHaveLength(roles.length);
    for (const group of groups) {
      expect(group.roles.every(role => role.era === group.era && role.start >= group.from && role.end <= group.to)).toBe(true);
    }
    expect(new Set(roles.map(role => role.lane)).size).toBeGreaterThan(1);
    expect(normalizeEra('unknown')).toBe('all');
    expect(normalizeEra('advocacy')).toBe('advocacy');
  });
  it('provides four distinct symbols and shared destinations in every locale', () => {
    for (const copy of Object.values(niveora)) {
      expect(new Set(copy.log.badges.map(badge => badge.symbol)).size).toBe(4);
      expect(copy.log.badges.map(badge => badge.href)).toEqual(niveora.pt.log.badges.map(badge => badge.href));
      for (const badge of copy.log.badges) expect(badge.linkLabel.length).toBeGreaterThan(5);
      expect(copy.discoveries).toContain('{total}');
    }
  });
});
