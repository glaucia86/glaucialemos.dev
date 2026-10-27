'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useMotionEnabled } from '@/lib/use-motion';
import { play } from '@/lib/sfx';
import type { AureliaStoryCopy } from '@/i18n/aurelia-story';

/** How we grow it: a vine draws itself with the scroll and each step sprouts as the vine reaches it. */
export function WorkSteps({ copy }: { copy: AureliaStoryCopy['steps'] }) {
  const root = useRef<HTMLOListElement>(null);
  const motion = useMotionEnabled();

  useGSAP(() => {
    const list = root.current;
    if (!list || !motion) return;
    list.dataset.live = 'true';
    const steps = Array.from(list.querySelectorAll<HTMLElement>('.work-steps__step'));
    let lit = -1;
    const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 75%', end: 'bottom 55%', scrub: .6, onUpdate: ({ progress }) => {
      const next = steps.reduce((index, _, i) => progress >= i / Math.max(1, steps.length - 1) - .02 ? i : index, -1);
      if (next > lit) play('seed', { detune: next * 200 });
      if (next !== lit) steps.forEach((step, i) => { step.dataset.lit = String(i <= next); });
      lit = next;
    } } }).fromTo(list.querySelector('.work-steps__vine path'), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', ease: 'none' });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); delete list.dataset.live; steps.forEach(step => delete step.dataset.lit); };
  }, { scope: root, dependencies: [motion], revertOnUpdate: true });

  return <ol ref={root} className="work-steps">
    <svg className="work-steps__vine" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 20 C 25 4, 50 36, 75 20 S 125 4, 150 20 S 200 36, 225 20 S 275 4, 300 20" />
    </svg>
    {copy.items.map((item, i) => <li key={item.title} className="work-steps__step">
      <span className="work-steps__bud" aria-hidden="true"><i /></span>
      <span className="aurelia-kicker">{String(i + 1).padStart(2, '0')}</span>
      <h3>{item.title}</h3><p>{item.body}</p>
    </li>)}
  </ol>;
}
