import type { Locale } from '@/i18n/config';
import type { Subject } from './aurelia-records';

// Small, pure controls shared with client islands; no datasets or dictionaries in their runtime imports.
export const serviceHref = (lang: Locale, subject: Subject) => `/${lang}/servicos?assunto=${subject}#contato`;
export const RING_START = [1, 2, 3] as const;
export const turnRing = (value: number) => (value + 1) % 4;
export const ringsAligned = (rings: readonly number[]) => rings.length === 3 && rings.every(value => value === 0);
