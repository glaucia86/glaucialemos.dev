'use client';

import { useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import { ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useMotionEnabled } from '@/lib/use-motion';
import { play } from '@/lib/sfx';
import { serviceHref } from '@/lib/aurelia-controls';
import type { GardenRecord } from '@/lib/aurelia-records';
import type { Locale } from '@/i18n/config';
import type { AureliaStoryCopy } from '@/i18n/aurelia-story';
import { bloomPhase, createBloomGarden, type FlowerKind } from './bloom-engine';

const KIND: Record<GardenRecord['subject'], FlowerKind> = { workshop: 'coral', mentoria: 'mint', palestra: 'gold' };

/**
 * The garden blooms with the scroll: a sticky stage where each real service grows from a seed into its own pixel flower,
 * while its title, description, waitlist and call to action open beside it. Without JS or with reduced motion: a list.
 */
export function GardenBloom({ records, copy, lang, waitlist }: { records: GardenRecord[]; copy: AureliaStoryCopy['bloom']; lang: Locale; waitlist: string }) {
  const root = useRef<HTMLDivElement>(null);
  const motion = useMotionEnabled();
  const total = String(records.length).padStart(2, '0');

  useGSAP(() => {
    const section = root.current;
    if (!section || !motion) return;
    section.dataset.live = 'true';
    const canvas = section.querySelector<HTMLCanvasElement>('.bloom__canvas')!;
    const panels = Array.from(section.querySelectorAll<HTMLElement>('.bloom__panels > li'));
    const dots = Array.from(section.querySelectorAll<HTMLElement>('.bloom__dots i'));
    const garden = createBloomGarden(canvas, records.map(record => KIND[record.subject]));
    let shown = -1, bloomed = -1;
    const render = (progress: number) => {
      garden.draw(progress);
      const { index, local } = bloomPhase(progress, records.length);
      if (index !== shown) {
        panels.forEach((panel, i) => { panel.dataset.active = String(i === index); panel.inert = i !== index; });
        shown = index;
      }
      dots.forEach((dot, i) => { dot.dataset.state = i < index || (i === index && local > .8) ? 'bloom' : i === index ? 'sprout' : 'seed'; });
      const open = index - (local > .8 ? 0 : 1);
      if (open > bloomed) play('garden-bloom', { detune: open * 200 });
      bloomed = Math.max(bloomed, open);
    };
    const resize = new ResizeObserver(() => garden.resize());
    resize.observe(canvas);
    const trigger = ScrollTrigger.create({ trigger: section.querySelector('.bloom__track'), start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: self => render(self.progress) });
    render(0);
    return () => { trigger.kill(); resize.disconnect(); panels.forEach(panel => { panel.inert = false; delete panel.dataset.active; }); delete section.dataset.live; };
  }, { scope: root, dependencies: [motion, records], revertOnUpdate: true });

  return <div ref={root} className="bloom" style={{ '--beds': records.length } as CSSProperties}>
    <div className="bloom__track">
      <div className="bloom__frame">
        <canvas className="bloom__canvas" aria-hidden="true" />
        <div className="bloom__dots" aria-hidden="true">{records.map(({ service }) => <i key={service.id} />)}</div>
        <ol className="bloom__panels">{records.map(({ service, subject }, i) => <li key={service.id} className="px-frame" data-kind={KIND[subject]}>
          <p className="aurelia-kicker">{copy.count.replace('{n}', String(i + 1).padStart(2, '0')).replace('{total}', total)}</p>
          <h3>{service.titulo[lang]}</h3>
          <p>{service.descricao[lang]}</p>
          <a className="hero-link" href="#lista-de-espera">{waitlist}</a>
          <Link className="button primary" data-magnetic href={serviceHref(lang, subject)}>{copy.cta}</Link>
        </li>)}</ol>
        <p className="bloom__scroll" aria-hidden="true">{copy.scroll}<i /></p>
      </div>
    </div>
  </div>;
}
