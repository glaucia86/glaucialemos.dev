import { getServicos } from './data';
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
export { serviceHref, RING_START, turnRing, ringsAligned, advancePollination } from './aurelia-controls';
export const servicePrice = (service: Servico, lang: Locale) => service.preco === 'sob consulta' ? getDictionary(lang).services.price : service.preco;
