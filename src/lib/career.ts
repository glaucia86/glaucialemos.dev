import type { Cargo } from './types';

// Career maths for the About page. Months are counted as year * 12 + monthIndex.
export type Era = 'foundation' | 'advocacy' | 'leadership';
export type CareerRole = Cargo & { start: number; end: number; current: boolean; era: Era; lane: number };

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const ERAS: Era[] = ['foundation', 'advocacy', 'leadership'];
const ADVOCACY_FROM = 2019 * 12 + 2;
const LEADERSHIP_FROM = 2025 * 12 + 8;

export const monthOf = (date: Date) => date.getUTCFullYear() * 12 + date.getUTCMonth();

function parseMonth(text: string) {
  const match = /^(\w{3}) (\d{4})$/.exec(text.trim());
  const index = match ? MONTHS.indexOf(match[1]) : -1;
  if (!match || index < 0) throw new Error(`Invalid period month: ${text}`);
  return Number(match[2]) * 12 + index;
}

export function parsePeriod(period: string, now = monthOf(new Date())) {
  const [from, to] = period.split('–').map(part => part.trim());
  const current = to === 'atual';
  return { start: parseMonth(from), end: current ? now : parseMonth(to), current };
}

export function eraOf(start: number): Era {
  return start >= LEADERSHIP_FROM ? 'leadership' : start >= ADVOCACY_FROM ? 'advocacy' : 'foundation';
}

// Newest first. Overlapping roles get the first free lane, assigned in start order.
export function buildCareer(cargos: Cargo[], now = monthOf(new Date())): CareerRole[] {
  const roles = cargos.map(cargo => ({ ...cargo, ...parsePeriod(cargo.periodo, now), era: 'foundation' as Era, lane: 0 }));
  const laneEnds: number[] = [];
  for (const role of [...roles].sort((a, b) => a.start - b.start || b.end - a.end)) {
    role.era = eraOf(role.start);
    const free = laneEnds.findIndex(end => end < role.start);
    role.lane = free < 0 ? laneEnds.length : free;
    laneEnds[role.lane] = role.end;
  }
  return roles.sort((a, b) => b.start - a.start || b.end - a.end);
}

export function groupEras(roles: CareerRole[]) {
  return ERAS.map(era => {
    const items = roles.filter(role => role.era === era);
    return { era, roles: items, from: Math.min(...items.map(role => role.start)), to: Math.max(...items.map(role => role.end)) };
  }).filter(group => group.roles.length).reverse();
}

export function careerStats(roles: CareerRole[], now = monthOf(new Date())) {
  const first = Math.min(...roles.map(role => role.start));
  return {
    years: Math.floor((now - first) / 12),
    companies: new Set(roles.map(role => role.empresa)).size,
    roles: roles.length,
    lanes: Math.max(...roles.map(role => role.lane)) + 1,
    microsoftYears: Math.floor(roles.filter(role => role.empresa === 'Microsoft').reduce((total, role) => total + role.end - role.start + 1, 0) / 12),
  };
}

export const yearOf = (month: number) => Math.floor(month / 12);
