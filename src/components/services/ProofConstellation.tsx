'use client';

import { useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap';
import { useMotionEnabled } from '@/lib/use-motion';
import { play } from '@/lib/sfx';
import type { AureliaStoryCopy } from '@/i18n/aurelia-story';
import type { ProofStar } from '@/lib/aurelia-records';

// Where each star sits on the desktop sky (percent of the frame); the constellation joins them in this order.
export const PROOF_POSITIONS: readonly [number, number][] = [[12, 28], [30, 70], [47, 32], [64, 72], [80, 30], [92, 70]];

/** Real numbers as a constellation: the scroll draws the lines and lights each star; HomeChoreography counts the values up. */
export function ProofConstellation({ stars, copy, locale }: { stars: ProofStar[]; copy: AureliaStoryCopy['proof']; locale: string }) {
  const root = useRef<HTMLDivElement>(null);
  const motion = useMotionEnabled();
  const format = new Intl.NumberFormat(locale);
  const path = PROOF_POSITIONS.slice(0, stars.length).map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');

  useGSAP(() => {
    const section = root.current;
    if (!section || !motion) return;
    section.dataset.live = 'true';
    const items = Array.from(section.querySelectorAll<HTMLElement>('.proof-star'));
    let lit = -1;
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 72%', end: 'bottom 62%', scrub: .6, onUpdate: ({ progress }) => {
      const next = progress <= .02 ? -1 : Math.min(items.length - 1, Math.floor(progress * items.length));
      if (next === lit) return;
      if (next > lit) for (let i = lit + 1; i <= next; i++) play('star', { detune: i * 200 });
      items.forEach((item, i) => { item.dataset.lit = String(i <= next); });
      lit = next;
    } } }).fromTo(section.querySelector('.proof-sky__line'), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', ease: 'none' });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); delete section.dataset.live; items.forEach(item => delete item.dataset.lit); };
  }, { scope: root, dependencies: [motion], revertOnUpdate: true });

  return <div ref={root} className="proof-sky px-frame">
    <svg className="proof-sky__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="proof-sky__track" d={path} /><path className="proof-sky__line" d={path} />
    </svg>
    <ul className="proof-sky__stars">{stars.map((star, i) => <li key={star.key} style={{ '--x': `${PROOF_POSITIONS[i][0]}%`, '--y': `${PROOF_POSITIONS[i][1]}%` } as CSSProperties}>
      <Link className="proof-star" href={star.href}>
        <i className="proof-star__glyph" aria-hidden="true" />
        <strong data-count={star.value}>{format.format(star.value)}</strong>
        <span>{copy.labels[star.key]}</span>
        <small>{copy.source}: {copy.links[star.link]} <span aria-hidden="true">↗</span></small>
      </Link>
    </li>)}</ul>
  </div>;
}
