'use client';

import { useEffect } from 'react';
import { play } from '@/lib/sfx';
import { useMediaQuery, useMotionEnabled } from '@/lib/use-motion';

// The light that follows the pointer on the format and topic cards (and a soft twinkle, only with sound on).
// Pure enhancement: without JS or with reduced motion the cards keep their static colours.
export function CardGlow({ scope }: { scope: string }) {
  const motion = useMotionEnabled();
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  useEffect(() => {
    if (!motion || !fine) return;
    const cards = [...document.querySelectorAll<HTMLElement>(`${scope} [data-glow-card]`)];
    const cleanups = cards.map(card => {
      const move = (event: PointerEvent) => {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - box.left}px`); card.style.setProperty('--my', `${event.clientY - box.top}px`);
      };
      const enter = () => play('twinkle', { gain: .6 });
      card.addEventListener('pointermove', move); card.addEventListener('pointerenter', enter);
      return () => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerenter', enter); };
    });
    return () => cleanups.forEach(cleanup => cleanup());
  }, [motion, fine, scope]);
  return null;
}
