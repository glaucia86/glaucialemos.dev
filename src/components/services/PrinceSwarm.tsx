'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { motionAllowed } from '@/lib/use-motion';
import { observeMotionActivity } from '@/lib/motion';
import { play } from '@/lib/sfx';
import { createSwarm, dwellStep, rectAt, SWARM_PIXEL, type Rect } from './swarm-engine';

/**
 * Prince lets out a swarm of fireflies over the garden beds. The swarm follows the pointer (or the finger, or the card
 * that has keyboard focus); hovering a bed for a moment pollinates it. With every bed lit, light threads join them.
 * Reduced motion: the button lights the beds one after another, without particles.
 */
export function PrinceSwarm({ area, lit, onLight, complete, label, hint, face }: {
  area: RefObject<HTMLDivElement | null>; lit: readonly boolean[]; onLight: (index: number) => void; complete: boolean;
  label: string; hint: string; face: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [flying, setFlying] = useState(false);
  const litRef = useRef(lit), completeRef = useRef(complete), lightRef = useRef(onLight);
  useEffect(() => { litRef.current = lit; completeRef.current = complete; lightRef.current = onLight; });

  useEffect(() => {
    const box = area.current, surface = canvas.current;
    if (!flying || !box || !surface) return;
    if (!motionAllowed()) {
      const timers = litRef.current.map((_, i) => setTimeout(() => lightRef.current(i), 350 * (i + 1)));
      const end = setTimeout(() => setFlying(false), 350 * (litRef.current.length + 1));
      return () => { timers.forEach(clearTimeout); clearTimeout(end); };
    }
    const swarm = createSwarm(surface, matchMedia('(pointer: coarse)').matches ? 40 : 60);
    const cards = () => Array.from(box.querySelectorAll<HTMLElement>('.aurelia-cards article'));
    const local = (clientX: number, clientY: number) => { const r = surface.getBoundingClientRect(); return { x: (clientX - r.left) / SWARM_PIXEL, y: (clientY - r.top) / SWARM_PIXEL }; };
    const rects = (): Rect[] => cards().map(card => { const r = card.getBoundingClientRect(), o = surface.getBoundingClientRect(); return { x: (r.left - o.left) / SWARM_PIXEL, y: (r.top - o.top) / SWARM_PIXEL, w: r.width / SWARM_PIXEL, h: r.height / SWARM_PIXEL }; });
    const start = button.current?.getBoundingClientRect();
    const origin = start ? local(start.left + start.width / 2, start.top + start.height / 2) : { x: 20, y: 20 };
    swarm.spawn(origin.x, origin.y);
    let target = { ...origin }, raf = 0, previous = 0, time = 0, threads = 0, wander = 0, active = true;
    const dwell = litRef.current.map(() => 0);
    const loop = (now: number) => {
      const dt = previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now; time += dt;
      const beds = rects();
      // With no guidance for a while the swarm explores the beds on its own, one after another.
      wander += dt;
      if (wander > 3.5) { const next = beds[Math.floor(time / 2.2) % beds.length]; if (next) target = { x: next.x + next.w / 2, y: next.y + next.h / 2 }; }
      const centre = swarm.step(dt, target.x, target.y);
      const reached = dwellStep(dwell, rectAt(beds, centre.x, centre.y), dt, litRef.current);
      if (reached >= 0) { lightRef.current(reached); swarm.burst(centre.x, centre.y); play('garden-bloom', { detune: reached * 200 }); }
      if (completeRef.current) threads = Math.min(1, threads + dt * .8);
      swarm.draw(completeRef.current ? beds.map(bed => ({ x: bed.x + bed.w / 2, y: bed.y + bed.h * .25 })) : [], threads, time);
      if (completeRef.current && threads >= 1 && time > 1) { setTimeout(() => setFlying(false), 2600); return; }
      if (active) raf = requestAnimationFrame(loop);
    };
    const guide = (event: PointerEvent) => { wander = 0; target = local(event.clientX, event.clientY); };
    const focus = (event: FocusEvent) => {
      const card = (event.target as Element | null)?.closest('article');
      if (!card) return;
      wander = 0; const r = card.getBoundingClientRect(); target = local(r.left + r.width / 2, r.top + r.height / 2);
    };
    const resize = new ResizeObserver(() => swarm.resize());
    resize.observe(surface);
    box.addEventListener('pointermove', guide, { passive: true }); box.addEventListener('pointerdown', guide, { passive: true });
    box.addEventListener('focusin', focus);
    const stopActivity = observeMotionActivity(box, on => {
      active = on;
      if (on && !raf) { previous = 0; raf = requestAnimationFrame(loop); }
      if (!on) { cancelAnimationFrame(raf); raf = 0; }
    });
    play('woof');
    return () => {
      active = false; cancelAnimationFrame(raf); stopActivity(); resize.disconnect(); swarm.clear();
      box.removeEventListener('pointermove', guide); box.removeEventListener('pointerdown', guide); box.removeEventListener('focusin', focus);
    };
  }, [flying, area]);

  return <>
    <div className="prince-swarm">
      <button ref={button} type="button" className="prince-swarm__launch" aria-pressed={flying} onClick={() => setFlying(true)} disabled={flying}>
        <i style={{ backgroundImage: `url(${face})` }} aria-hidden="true" /><span>{label}</span>
      </button>
      <p className="prince-swarm__hint">{hint}</p>
    </div>
    <canvas ref={canvas} className="prince-swarm__sky" data-flying={flying || undefined} aria-hidden="true" />
  </>;
}
