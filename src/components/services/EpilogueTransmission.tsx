'use client';

import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { BeyondOrbitCopy } from '@/i18n/beyond-orbit';
import type { AureliaStoryCopy } from '@/i18n/aurelia-story';
import { EGGS, type EggPage } from '@/lib/egg-catalog';
import { discoveredWorldCount, epilogueRemaining } from '@/lib/epilogue';
import { useDiscoveries } from '@/lib/use-discoveries';
import { EpilogueSignal } from '@/components/epilogue/EpilogueSignal';

export const TRANSMISSION_WORLDS = [['home', ''], ['about', '/sobre'], ['projects', '/projetos'], ['content', '/conteudo'], ['events', '/eventos']] as const satisfies readonly (readonly [EggPage, string])[];
export const NEEDED_WORLDS = 3;
/** Pages where the visitor has already found at least one secret. */
export const worldsWithSignal = (found: readonly string[]) => new Set(EGGS.filter(egg => found.includes(egg.id)).map(egg => egg.page));

/**
 * The page always ends on a transmission, so every visitor learns there is something beyond the last orbit.
 * Faint (with three lights and the worlds still silent) until three worlds have answered; then the real signal takes over.
 */
export function EpilogueTransmission({ lang, copy, epilogue }: { lang: Locale; copy: AureliaStoryCopy['transmission']; epilogue: BeyondOrbitCopy }) {
  const found = useDiscoveries();
  const remaining = epilogueRemaining(found), count = Math.min(NEEDED_WORLDS, discoveredWorldCount(found));
  const answered = worldsWithSignal(found);
  return <section id="sinal" className="transmission px-frame" data-unlocked={remaining === 0 || undefined} aria-labelledby="transmission-title">
    <div className="transmission__scope" aria-hidden="true"><i /><i /><i /></div>
    <p className="aurelia-kicker">{copy.kicker}</p>
    <h2 id="transmission-title">{copy.title}</h2>
    <p>{copy.body}</p>
    {remaining === 0 ? <EpilogueSignal lang={lang} copy={epilogue} /> : <>
      <p className="transmission__locked" role="status">{copy.locked.replace('{n}', String(remaining))}</p>
      <div className="transmission__lights">
        <span aria-hidden="true">{Array.from({ length: NEEDED_WORLDS }, (_, i) => <i key={i} data-on={i < count || undefined} />)}</span>
        <span>{copy.progress.replace('{n}', String(count))}</span>
      </div>
      <ul className="transmission__worlds">{TRANSMISSION_WORLDS.map(([page, path]) => <li key={page} data-found={answered.has(page) || undefined}>
        <Link href={`/${lang}${path}`}>{copy.worlds[page]}</Link> <span>{answered.has(page) ? copy.found : copy.silent}</span>
      </li>)}</ul>
      <p className="transmission__hint">{copy.hint}</p>
    </>}
  </section>;
}
