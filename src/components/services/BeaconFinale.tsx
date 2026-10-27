'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useMotionEnabled } from '@/lib/use-motion';
import { play } from '@/lib/sfx';
import type { AureliaStoryCopy } from '@/i18n/aurelia-story';
import { createStardust } from '@/components/epilogue/stardust-text';
import { createFinaleSky } from './finale-sky';

/**
 * The last scene, on the hero's own terrace at night: Prince's beacon throws its beam into the sky (letterbox, lens flare,
 * stars stretching into streaks), seven stars gather into Aurélia's flower with a short shake, and the invitation lights up.
 * Then "To be continued…" forms out of stardust and a star blinks beyond the map, pointing to the transmission below.
 * Static and readable without motion.
 */
export function BeaconFinale({ copy, terrace, tag }: { copy: AureliaStoryCopy['finale']; terrace: ReactNode; tag?: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const motion = useMotionEnabled();

  useGSAP(() => {
    const section = root.current;
    if (!section || !motion) return;
    section.dataset.live = 'true';
    const q = <T extends Element = HTMLElement>(selector: string) => section.querySelector<T>(selector)!;
    const frame = q('.beacon-finale__frame'), canvas = q<HTMLCanvasElement>('.beacon-finale__sky'), beacon = q('.finale-terrace__beacon');
    const continued = q('.beacon-finale__continued span'), dust = q<HTMLCanvasElement>('.beacon-finale__dust');
    const beaconAt = () => {
      const a = canvas.getBoundingClientRect(), b = beacon.getBoundingClientRect();
      const at = { u: (b.left + b.width / 2 - a.left) / Math.max(1, a.width), v: (b.top + b.height * .1 - a.top) / Math.max(1, a.height) };
      frame.style.setProperty('--beam-x', `${at.u * 100}%`);
      return at;
    };
    let sky = createFinaleSky(canvas, beaconAt());
    const stardust = createStardust(dust, 1200);
    const state = { night: 0, beam: 0, gather: 0, streak: 0 };
    const cues = new Set<string>();
    const cue = (name: string, run: () => void) => { if (!cues.has(name)) { cues.add(name); run(); } };
    const shake = () => { frame.classList.remove('fx-shake'); void frame.offsetWidth; frame.classList.add('fx-shake'); };
    const resize = new ResizeObserver(() => { sky = createFinaleSky(canvas, beaconAt()); sky.draw(state); });
    resize.observe(canvas);
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: q('.beacon-finale__track'), start: 'top top', end: 'bottom bottom', scrub: .7,
        onUpdate: ({ progress, direction }) => {
          sky.draw(state);
          if (direction < 0) return;
          if (progress > .14) cue('beam', () => play('relay'));
          if (progress > .5) cue('gather', () => { play('star-ping'); shake(); });
          if (progress > .8) cue('continued', () => {
            const b = beacon.getBoundingClientRect();
            stardust.form({ x: b.left + b.width / 2, y: b.top }, continued, 1.4); play('shimmer');
          });
        },
      },
    })
      .fromTo(section, { '--night': .15 }, { '--night': 1, duration: .14 }, 0)
      .to(state, { night: 1, duration: .14 }, 0)
      .fromTo('.finale-terrace__plane', { scale: 1 }, { scale: 1.08, duration: 1, transformOrigin: '80% 92%' }, 0)
      .fromTo('.beacon-finale__bars i', { scaleY: 0 }, { scaleY: 1, duration: .05, ease: 'power2.out' }, .12)
      .to(state, { streak: 1, duration: .04, ease: 'power2.in' }, .13)
      .to(state, { streak: 0, duration: .06, ease: 'power2.out' }, .17)
      .to(state, { beam: 1, duration: .24, ease: 'power1.in' }, .14)
      .fromTo('.beacon-finale__flare', { autoAlpha: 0, scale: .2 }, { autoAlpha: 1, scale: 1, duration: .08, ease: 'power2.out' }, .3)
      .to(state, { gather: 1, duration: .2, ease: 'power2.out' }, .3)
      .fromTo('.beacon-finale__call', { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: .08, ease: 'power3.out' }, .44)
      .to('.beacon-finale__call', { autoAlpha: 0, y: -50, duration: .06, ease: 'power2.in' }, .72)
      .to('.beacon-finale__bars i', { scaleY: 0, duration: .05 }, .74)
      .fromTo('.beacon-finale__continued', { autoAlpha: 0 }, { autoAlpha: 1, duration: .04 }, .78)
      .fromTo(continued, { opacity: 0 }, { opacity: 1, duration: .06 }, .84)
      .fromTo('.beacon-finale__offmap', { autoAlpha: 0, scale: .4 }, { autoAlpha: 1, scale: 1, duration: .05, ease: 'back.out(3)' }, .9);
    ScrollTrigger.refresh();
    return () => { tl.scrollTrigger?.kill(); tl.kill(); resize.disconnect(); stardust.destroy(); frame.classList.remove('fx-shake'); delete section.dataset.live; };
  }, { scope: root, dependencies: [motion], revertOnUpdate: true });

  return <section ref={root} className="beacon-finale" aria-labelledby="finale-title">
    <div className="beacon-finale__track">
      <div className="beacon-finale__frame">
        {terrace}
        <canvas className="beacon-finale__sky" aria-hidden="true" />
        <i className="beacon-finale__flare" aria-hidden="true" />
        <div className="beacon-finale__call">
          {tag ?? <p className="aurelia-kicker">{copy.kicker}</p>}
          <h2 id="finale-title">{copy.title}</h2>
          <p>{copy.body}</p>
          <a className="button primary" data-magnetic href="#contato">{copy.cta}</a>
        </div>
        <p className="beacon-finale__continued"><span>{copy.continued}</span></p>
        <canvas className="beacon-finale__dust" aria-hidden="true" />
        <a className="beacon-finale__offmap" href="#sinal" title={copy.offMap}><i aria-hidden="true" /><span className="sr-only">{copy.offMap}</span></a>
        <div className="beacon-finale__bars" aria-hidden="true"><i /><i /></div>
      </div>
    </div>
  </section>;
}
