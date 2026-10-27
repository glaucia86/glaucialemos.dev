'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { gsap } from '@/lib/gsap';
import { motionAllowed, useMotionEnabled } from '@/lib/use-motion';
import { bringIntoView, discover, emitEgg, onEgg } from '@/lib/eggs';
import { play } from '@/lib/sfx';
import type { AureliaCopy } from '@/i18n/aurelia';
import { createEclipse, createFireflies, type EclipseState } from './eclipse-engine';

export const HOLD_SECONDS = 1.2;

/**
 * The eclipse (greenhouse-dusk): hold the ringed planet (pointer, Space/Enter on the button, the phrase or the radio)
 * and it slides across the sun. At totality a wave of night runs out from the eclipse over the whole page, the garden turns
 * bioluminescent (main[data-greenhouse="dusk"]) and fireflies follow the pointer. Esc, the button or the sun bring the day back.
 */
export function PlanetEclipse({ copy }: { copy: AureliaCopy['dusk'] }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const wave = useRef<HTMLDivElement>(null);
  const flies = useRef<HTMLCanvasElement>(null);
  const restoreButton = useRef<HTMLButtonElement>(null);
  const holdButton = useRef<HTMLButtonElement>(null);
  const motion = useMotionEnabled();
  const [ready, setReady] = useState(false);
  const [night, setNight] = useState(false);
  const api = useRef<{ start: () => void; cancel: () => void; fall: () => void; rise: () => void }>({ start() {}, cancel() {}, fall() {}, rise() {} });

  useEffect(() => {
    setReady(true);
    const section = root.current, sky = canvas.current;
    if (!section || !sky || !wave.current || !flies.current) return;
    const eclipse = createEclipse(sky), fireflies = createFireflies(flies.current, matchMedia('(pointer: coarse)').matches ? 40 : 70);
    const state: EclipseState = { cover: 0, corona: 0, time: 0 };
    const charge = { value: 0 };
    let hold: gsap.core.Tween | null = null, scene: gsap.core.Timeline | null = null, dark = false;
    const draw = () => eclipse.draw(state);
    const tick = (_: number, delta: number) => { state.time += delta / 1000; draw(); };
    const resize = new ResizeObserver(() => { eclipse.resize(); draw(); });
    resize.observe(sky);
    const origin = () => {
      const box = sky.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2, r: Math.hypot(Math.max(box.left, innerWidth - box.left), Math.max(box.top, innerHeight - box.top)) + box.width };
    };
    const setDark = (value: boolean) => { dark = value; setNight(value); fireflies.show(value && motionAllowed()); };
    api.current = {
      // Holding charges the eclipse: the planet starts to move; letting go early slides it back.
      start() {
        if (dark || hold?.isActive()) return;
        section.dataset.state = 'charging'; play('hover-aurelia');
        hold = gsap.to(charge, { value: 1, duration: HOLD_SECONDS * (1 - charge.value), ease: 'none', onUpdate: () => {
          section.style.setProperty('--charge', String(charge.value)); state.cover = charge.value * .3; draw();
        }, onComplete: () => emitEgg('greenhouse-dusk') });
      },
      cancel() {
        if (dark || !hold) return;
        hold.kill(); hold = null; section.dataset.state = 'day';
        gsap.to(charge, { value: 0, duration: .35, onUpdate: () => { section.style.setProperty('--charge', String(charge.value)); state.cover = charge.value * .3; draw(); } });
      },
      fall() {
        hold?.kill(); hold = null; scene?.kill();
        section.dataset.state = 'night'; setDark(true);
        if (!motionAllowed()) { Object.assign(state, { cover: 1, corona: 1 }); draw(); return; }
        const o = origin(), shell = wave.current!;
        gsap.ticker.add(tick);
        scene = gsap.timeline({ onComplete: () => { gsap.ticker.remove(tick); draw(); } })
          .to(state, { cover: 1, duration: 1.3, ease: 'power2.inOut' })
          .call(() => { play('shimmer'); section.classList.remove('fx-chroma'); void section.offsetWidth; section.classList.add('fx-chroma'); }, [], 1.15)
          .to(state, { corona: 1, duration: .8, ease: 'power2.out' }, 1.1)
          .set(shell, { autoAlpha: 1, '--x': `${o.x}px`, '--y': `${o.y}px` }, 1.15)
          .fromTo(shell, { '--r': '0px' }, { '--r': `${o.r}px`, duration: 1.1, ease: 'power2.in' }, 1.15)
          .to(shell, { autoAlpha: 0, duration: .9, ease: 'power1.out' }, 2.25);
      },
      rise() {
        if (!dark) return;
        scene?.kill(); gsap.ticker.remove(tick);
        section.dataset.state = 'day'; setDark(false); charge.value = 0; section.style.setProperty('--charge', '0');
        if (!motionAllowed()) { Object.assign(state, { cover: 0, corona: 0 }); draw(); return; }
        play('bloom');
        gsap.ticker.add(tick);
        scene = gsap.timeline({ onComplete: () => { gsap.ticker.remove(tick); draw(); } })
          .to(state, { cover: 0, corona: 0, duration: 1.1, ease: 'power2.inOut' });
      },
    };
    draw();
    const stop = onEgg('greenhouse-dusk', () => {
      discover('greenhouse-dusk'); play('greenhouse');
      if (dark) return;
      void bringIntoView(section).then(() => api.current.fall());
    });
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape' && dark && !document.querySelector('dialog[open], .contact-portal[data-open]')) api.current.rise(); };
    addEventListener('keydown', escape);
    return () => {
      stop(); removeEventListener('keydown', escape); resize.disconnect(); hold?.kill(); scene?.kill(); gsap.ticker.remove(tick);
      fireflies.destroy(); section.classList.remove('fx-chroma');
    };
  }, []);

  // The whole page follows the eclipse; the attribute is the contract the rest of Aurélia's CSS reads.
  useEffect(() => {
    const main = root.current?.closest('main');
    if (!main) return;
    if (night) main.dataset.greenhouse = 'dusk'; else delete main.dataset.greenhouse;
    return () => { delete main.dataset.greenhouse; };
  }, [night]);
  useEffect(() => { if (night) restoreButton.current?.focus({ preventScroll: true }); }, [night]);

  const pressKey = (event: KeyboardEvent) => { if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) { event.preventDefault(); api.current.start(); } };
  const releaseKey = (event: KeyboardEvent) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); api.current.cancel(); } };
  return <div ref={root} className="eclipse" data-state="day" data-motion={motion || undefined}>
    <div className="eclipse__sky" onPointerDown={() => night ? api.current.rise() : api.current.start()} onPointerUp={() => api.current.cancel()} onPointerLeave={() => api.current.cancel()}>
      <canvas ref={canvas} className="eclipse__canvas" aria-hidden="true" />
    </div>
    <div className="eclipse__copy">
      <h3>{copy.title}</h3><p>{copy.body}</p>
      {!night && <button ref={holdButton} type="button" className="eclipse__hold" hidden={!ready}
        onPointerDown={() => api.current.start()} onPointerUp={() => api.current.cancel()} onPointerLeave={() => api.current.cancel()}
        onKeyDown={pressKey} onKeyUp={releaseKey} onClick={event => { if (event.detail === 0 && !motionAllowed()) emitEgg('greenhouse-dusk'); }}>
        <i aria-hidden="true" /> {copy.label}</button>}
      {night && <button ref={restoreButton} type="button" className="eclipse__restore" onClick={() => { api.current.rise(); }}>{copy.restore}</button>}
      <p className="sr-only" role="status">{night ? copy.night : ''}</p>
    </div>
    <div ref={wave} className="eclipse-wave" aria-hidden="true" />
    <canvas ref={flies} className="eclipse-fireflies" aria-hidden="true" />
  </div>;
}
