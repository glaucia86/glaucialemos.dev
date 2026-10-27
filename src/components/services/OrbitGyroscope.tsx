'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, useGSAP, SCRAMBLE_CHARS } from '@/lib/gsap';
import { useMediaQuery, useMotionEnabled } from '@/lib/use-motion';
import { observeMotionActivity } from '@/lib/motion';
import { bringIntoView, discover, emitEgg, onEgg } from '@/lib/eggs';
import { RING_START, ringsAligned, turnRing } from '@/lib/aurelia-controls';
import { play } from '@/lib/sfx';
import type { AureliaCopy } from '@/i18n/aurelia';
import type { AureliaStoryCopy } from '@/i18n/aurelia-story';
import type { Locale } from '@/i18n/config';
import { createGyroscope, snapTurn, type GyroFrame } from './gyro-engine';

// Progress of the sticky stage where each ring takes the light (approach first, then the sweep).
export const SWEEP_CUES = [.3, .52, .74] as const;
export const sweepRing = (progress: number) => SWEEP_CUES.reduce((index, cue, i) => progress >= cue ? i : index, -1);

/**
 * "Find an orbit in common": a full-screen orbital gyroscope. The scroll approaches the ringed planet and sweeps its three
 * rings (engineering, leadership, applied AI); the visitor drags (or taps, or uses the buttons) each ring until its marker
 * locks at the top. Each lock flashes; with all three, the rings fold into a beam with a shockwave, letterbox and title.
 * Without motion: a still planet, the three areas as a list and the same buttons.
 */
export function OrbitGyroscope({ copy, story, lang }: { copy: AureliaCopy['rings']; story: AureliaStoryCopy['orbit']; lang: Locale }) {
  const root = useRef<HTMLDivElement>(null);
  const motion = useMotionEnabled();
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const [rings, setRings] = useState<number[]>([...RING_START]);
  const [ready, setReady] = useState(false);
  const frame = useRef<GyroFrame>({ time: 0, approach: 1, active: -1, collapse: 0, turns: [...RING_START], locks: RING_START.map(() => 0), flash: 0 });
  const targets = useRef<number[]>([...RING_START]);
  const celebrate = useRef<() => void>(() => {});
  const aligned = ringsAligned(rings);
  const lockedCount = rings.filter(value => value === 0).length;

  const setTurn = (index: number, value: number, float?: number) => {
    targets.current[index] = float ?? targets.current[index] + ((value - (snapTurn(targets.current[index])) + 4) % 4);
    setRings(previous => {
      const next = previous.map((current, i) => i === index ? value : current);
      if (ringsAligned(next) && !ringsAligned(previous)) queueMicrotask(() => emitEgg('ring-alignment'));
      return next;
    });
  };
  const turn = (index: number) => { setTurn(index, turnRing(rings[index])); play('hover-aurelia'); };

  useEffect(() => {
    setReady(true);
    let disposed = false;
    const stop = onEgg('ring-alignment', () => void bringIntoView(root.current).then(() => {
      if (disposed) return;
      // Each marker glides forward to the next top position.
      targets.current = targets.current.map(value => Math.ceil(Math.round(value) / 4) * 4);
      setRings([0, 0, 0]); discover('ring-alignment'); play('align-aurelia');
      celebrate.current();
    }));
    return () => { disposed = true; stop(); };
  }, []);

  // Locks follow the dial: a ring at 0 snaps gold with a flash and a chime; leaving 0 releases it.
  useEffect(() => {
    const section = root.current;
    rings.forEach((value, i) => {
      const locked = value === 0;
      if (!motion) { frame.current.locks[i] = locked ? 1 : 0; return; }
      if (locked && frame.current.locks[i] < 1) {
        gsap.to(frame.current.locks, { [i]: 1, duration: .45, ease: 'back.out(2)', overwrite: 'auto' });
        gsap.fromTo(frame.current, { flash: .9 }, { flash: 0, duration: .5 });
        play('align-aurelia', { detune: i * 300 });
        section?.querySelector('.gyro__stage')?.classList.remove('fx-chroma');
        requestAnimationFrame(() => section?.querySelector('.gyro__stage')?.classList.add('fx-chroma'));
      } else if (!locked && frame.current.locks[i] > 0) gsap.to(frame.current.locks, { [i]: 0, duration: .3, overwrite: 'auto' });
    });
  }, [rings, motion]);

  useGSAP(() => {
    const section = root.current;
    if (!section || !motion) return;
    section.dataset.live = 'true';
    const q = <T extends Element = HTMLElement>(selector: string) => section.querySelector<T>(selector)!;
    const canvas = q<HTMLCanvasElement>('.gyro__canvas'), stage = q('.gyro__stage');
    const pillars = Array.from(section.querySelectorAll<HTMLElement>('.gyro__pillars li'));
    const gyro = createGyroscope(canvas);
    const f = frame.current;
    f.approach = 0;
    let raf = 0, previous = 0, running = false, shown = -2, booted = false;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now;
      f.time += dt;
      // Markers glide to their dial targets (springy, never instant).
      f.turns = f.turns.map((value, i) => value + (targets.current[i] - value) * Math.min(1, dt * 9));
      gyro.draw(f);
    };
    const stopActivity = observeMotionActivity(stage, on => {
      running = on; stage.dataset.paused = String(!on);
      if (on && !raf) { previous = 0; raf = requestAnimationFrame(loop); }
      if (!on) { cancelAnimationFrame(raf); raf = 0; }
    });
    const status = q('.gyro__status');
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: q('.gyro__track'), start: 'top top', end: 'bottom bottom', scrub: .8,
        onUpdate: ({ progress }) => {
          const index = sweepRing(progress);
          if (index !== shown) {
            f.active = index;
            pillars.forEach((pillar, i) => { pillar.dataset.active = String(i === index); });
            if (index > shown && index >= 0) play('scanner', { detune: index * 200 });
            shown = index;
          }
          if (!booted && progress > .08) {
            booted = true;
            gsap.to(status, { duration: .8, scrambleText: { text: status.dataset.text ?? '', chars: SCRAMBLE_CHARS, speed: .7 } });
          }
          if (!running) gyro.draw(f);
        },
      },
    })
      .to(f, { approach: 1, duration: .3, ease: 'power2.out' }, 0)
      .fromTo('.gyro__hud', { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: .08 }, .06);

    // Drag on a fine pointer, tap on touch: both grab the ring under the pointer.
    let drag: { ring: number; start: number; base: number; moved: boolean; id: number } | null = null;
    const angleAt = (event: PointerEvent) => { const p = gyro.toCanvas(event.clientX, event.clientY), c = gyro.center(); return Math.atan2(p.y - c.y, p.x - c.x); };
    const down = (event: PointerEvent) => {
      const ring = gyro.hit(event.clientX, event.clientY, f);
      if (ring < 0) return;
      drag = { ring, start: angleAt(event), base: targets.current[ring], moved: false, id: event.pointerId };
      if (event.pointerType !== 'touch') { canvas.setPointerCapture(event.pointerId); event.preventDefault(); }
      canvas.dataset.grab = String(ring);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' && !drag) { canvas.style.cursor = gyro.hit(event.clientX, event.clientY, f) >= 0 ? 'grab' : ''; return; }
      if (!drag || event.pointerId !== drag.id || event.pointerType === 'touch') return;
      let delta = angleAt(event) - drag.start;
      if (delta > Math.PI) delta -= Math.PI * 2; if (delta < -Math.PI) delta += Math.PI * 2;
      if (Math.abs(delta) > .05) drag.moved = true;
      targets.current[drag.ring] = drag.base + delta / (Math.PI / 2);
    };
    const up = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const { ring, moved, base } = drag; drag = null; delete canvas.dataset.grab;
      const float = moved ? Math.round(targets.current[ring]) : Math.round(base) + 1;
      setTurn(ring, snapTurn(float), float); play('hover-aurelia');
    };
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

    celebrate.current = () => {
      section.dataset.aligned = 'true';
      gsap.timeline()
        .to(f, { collapse: 1, duration: 1.5, ease: 'power2.inOut' })
        .call(() => { stage.classList.remove('fx-shake'); void stage.offsetWidth; stage.classList.add('fx-shake'); play('shimmer'); }, [], .7)
        .fromTo('.gyro__headline', { autoAlpha: 0, letterSpacing: '.1em' }, { autoAlpha: 1, letterSpacing: '.45em', duration: .8, ease: 'power3.out' }, .6)
        .to(f, { collapse: 0, duration: .9, ease: 'power2.out' }, 1.6);
    };
    gyro.draw(f);
    ScrollTrigger.refresh();
    return () => {
      cancelAnimationFrame(raf); stopActivity(); tl.scrollTrigger?.kill(); tl.kill();
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up);
      celebrate.current = () => {}; f.approach = 1; f.collapse = 0;
      delete section.dataset.live; stage.classList.remove('fx-shake', 'fx-chroma');
    };
  }, { scope: root, dependencies: [motion], revertOnUpdate: true });

  useEffect(() => {
    // Reduced motion still shows the aligned state (headline and gold rings), just without the cinema.
    if (aligned) root.current?.setAttribute('data-aligned', 'true'); else root.current?.removeAttribute('data-aligned');
  }, [aligned]);

  return <div ref={root} className="gyro">
    <div className="gyro__track">
      <div className="gyro__frame">
        <div className="gyro__stage" data-paused="true">
          <canvas className="gyro__canvas" aria-hidden="true" />
          <div className="orbital-garden__planet gyro__still" aria-hidden="true"><i />{rings.map((angle, index) => <span key={index} style={{ '--angle': `${angle * 90}deg`, '--orbit': index } as CSSProperties}><b /></span>)}</div>
          <div className="gyro__hud" aria-hidden="true">
            <span className="hud-corner hud-corner--tl" /><span className="hud-corner hud-corner--tr" /><span className="hud-corner hud-corner--bl" /><span className="hud-corner hud-corner--br" />
            <p className="gyro__title">{story.hud.title} <span className="gyro__status" data-text={story.hud.calibrating}>{story.hud.calibrating}</span></p>
            <p className="gyro__locks">{story.hud.locked.replace('{n}', String(lockedCount))}</p>
            <i className="gyro__reticle" />
          </div>
          <p className="gyro__headline" aria-hidden="true">{story.hud.headline}</p>
          <div className="gyro__bars" aria-hidden="true"><i /><i /></div>
        </div>
        <div className="gyro__copy">
          <p className="aurelia-kicker">{story.label}</p>
          <p>{copy.intro}</p>
          <ol className="gyro__pillars">{story.rings.map((ring, i) => <li key={ring.title} data-ring={i}>
            <span className="gyro__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><h3>{ring.title}</h3><p>{ring.body}</p>
          </li>)}</ol>
          <p className="gyro__hint" hidden={!ready}>{fine ? story.hud.drag : story.hud.tap}</p>
          <div className="gyro__controls" hidden={!ready}>{rings.map((angle, index) => <button type="button" key={index} data-ring={index} onClick={() => turn(index)}
            aria-label={`${copy.label.replace('{n}', String(index + 1))}. ${copy.position.replace('{n}', String(angle + 1))}`} aria-pressed={angle === 0}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')} ↻</span></button>)}</div>
          <p className="gyro__aligned" role="status">{aligned ? copy.aligned : ''}</p>
          <Link className="hero-link" href={`/${lang}/sobre#trajetoria`}>{copy.link} <span aria-hidden="true">↗</span></Link>
          {aligned && <button type="button" className="aurelia-reset" onClick={() => { targets.current = targets.current.map((value, i) => value + RING_START[i]); setRings([...RING_START]); delete root.current?.dataset.aligned; }}>{copy.reset}</button>}
        </div>
      </div>
    </div>
  </div>;
}
