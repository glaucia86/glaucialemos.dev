'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { gsap, SCRAMBLE_CHARS } from '@/lib/gsap';
import { motionAllowed, useMotionEnabled } from '@/lib/use-motion';
import { observeMotionActivity } from '@/lib/motion';
import { discover, eggsFor, emitEgg, matchTail, normalizePhrase, onEgg, type EggId } from '@/lib/eggs';
import { isSoundEnabled, play, SOUND_EVENT } from '@/lib/sfx';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { redTide } from '@/i18n/red-tide';
import { nearestRoute, ROUTES, type RouteKey } from '@/lib/red-tide-routes';
import scene from '@/data/galaxia/red-tide.json';
import { createPlasma, drawWarp } from './plasma-engine';
import { RedTideEpisode } from './RedTideEpisode';

export const AMBIENCE_VOLUME = .35;
const PAGE_EGGS = eggsFor('notfound').filter(egg => egg.page === 'notfound').map(egg => egg.id) as EggId[];
// Hit areas on the 16:9 video (percent of the frame): the crew stands on the deck, the consoles sit on the right.
export const RED_TIDE_HOTSPOTS = {
  glaucia: { left: 69, top: 46, width: 13, height: 48 },
  prince: { left: 64.5, top: 78, width: 7, height: 15 },
  console: { left: 87, top: 53, width: 13, height: 25 },
} as const;
const box = ({ left, top, width, height }: { left: number; top: number; width: number; height: number }) => ({ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` });
const prop = (name: keyof typeof scene.props) => ({ backgroundImage: `url(${scene.props[name].src})` });

/**
 * 404 — Maré Rubra, Coordenadas Perdidas. The approved video plate (Glaucia and Prince from behind, facing the nebula)
 * with pixel embers, plasma and signal glitches on top. Two secrets: the console recovers the coordinates and suggests
 * the real route closest to the typed address (signal-recovered); Prince finds the lost beacon, it flies out of the
 * nebula to him and the navigation portal opens (paw-rescue), a warp home. The back-home link works without any of it.
 */
export function RedTide({ forcedLang }: { forcedLang?: Locale }) {
  const params = useParams<{ lang?: string }>();
  const lang: Locale = forcedLang ?? (params?.lang && isLocale(params.lang) ? params.lang : defaultLocale);
  const copy = redTide[lang];
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const motion = useMotionEnabled();
  const root = useRef<HTMLElement>(null);
  const [signal, setSignal] = useState<RouteKey | null | undefined>(undefined);
  const [rescued, setRescued] = useState(false);
  const [ready, setReady] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  // The plasma layer, HUD scramble and the video, paused offscreen, in hidden tabs and with reduced motion.
  useEffect(() => {
    setReady(true);
    const section = root.current;
    if (!section) return;
    const video = section.querySelector('video'), canvas = section.querySelector<HTMLCanvasElement>('.red-tide__plasma')!;
    const plasma = createPlasma(canvas, matchMedia('(pointer: coarse)').matches);
    let raf = 0, time = 0, previous = 0;
    const loop = (now: number) => { raf = requestAnimationFrame(loop); time += previous ? Math.min(.05, (now - previous) / 1000) : 0; previous = now; plasma.draw(time); };
    const resize = new ResizeObserver(() => plasma.resize()); resize.observe(canvas);
    const stop = observeMotionActivity(section, on => {
      section.dataset.paused = String(!on);
      if (on) { if (!raf) { previous = 0; raf = requestAnimationFrame(loop); } void video?.play().catch(() => {}); }
      else { cancelAnimationFrame(raf); raf = 0; plasma.clear(); video?.pause(); }
    });
    const status = section.querySelector<HTMLElement>('.red-tide__lost');
    if (status && motionAllowed()) gsap.fromTo(status, { scrambleText: { text: '' } }, { duration: 1.2, scrambleText: { text: status.dataset.text ?? '', chars: SCRAMBLE_CHARS, speed: .5 } });
    return () => { cancelAnimationFrame(raf); stop(); resize.disconnect(); };
  }, []);

  // The bridge's own sound (the original clip's rumble and explosion), looped softly. Opt-in like every site sound:
  // only with the header's sound on, silent in a hidden tab and while the episode (which has its own track) is open.
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const audio = new Audio();
    audio.src = audio.canPlayType('audio/ogg; codecs=opus') ? '/galaxia/scenes/red-tide/ambience.ogg' : '/galaxia/scenes/red-tide/ambience.mp3';
    audio.loop = true; audio.preload = 'none'; audio.volume = 0;
    const episode = () => !!section.querySelector('.red-tide-episode[open]');
    let fade: gsap.core.Tween | null = null;
    const sync = () => {
      const wanted = isSoundEnabled() && !document.hidden && !episode();
      fade?.kill();
      if (wanted) {
        void audio.play().then(() => { fade = gsap.to(audio, { volume: AMBIENCE_VOLUME, duration: 1.2 }); }).catch(() => {});
      } else if (!audio.paused) fade = gsap.to(audio, { volume: 0, duration: document.hidden ? 0 : .4, onComplete: () => audio.pause() });
    };
    // A page opened with sound already on may still need one gesture before the browser lets audio start.
    const gesture = () => { if (audio.paused) sync(); };
    const dialogs = new MutationObserver(sync);
    section.querySelectorAll('dialog').forEach(dialog => dialogs.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    addEventListener(SOUND_EVENT, sync); document.addEventListener('visibilitychange', sync);
    addEventListener('pointerdown', gesture); addEventListener('keydown', gesture);
    sync();
    return () => {
      fade?.kill(); audio.pause(); audio.src = ''; dialogs.disconnect();
      removeEventListener(SOUND_EVENT, sync); document.removeEventListener('visibilitychange', sync);
      removeEventListener('pointerdown', gesture); removeEventListener('keydown', gesture);
    };
  }, []);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const run = (id: EggId) => {
      discover(id);
      if (id === 'signal-recovered') {
        play('scan');
        section.dataset.console = 'on';
        setSignal(nearestRoute(pathname));
        return;
      }
      play('radar');
      const beacon = section.querySelector<HTMLElement>('.red-tide__beacon'), portal = section.querySelector<HTMLElement>('.red-tide__portal');
      const done = () => { setRescued(true); section.dataset.portal = 'open'; play('woof'); };
      if (!beacon || !portal || !motionAllowed()) { section.dataset.beacon = 'home'; done(); return; }
      section.dataset.beacon = 'flying';
      gsap.timeline({ onComplete: done })
        .fromTo(beacon, { left: '58%', top: '22%', scale: .4, autoAlpha: 0, rotate: -20 }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(2)' })
        .to(beacon, { motionPath: { path: [{ left: '62%', top: '40%' }, { left: '66%', top: '62%' }, { left: '67.5%', top: '76%' }], curviness: 1.4 }, rotate: 360, duration: 1.4, ease: 'power2.inOut' })
        .call(() => { section.dataset.beacon = 'home'; play('star-ping'); })
        .fromTo(portal, { autoAlpha: 0, scale: .2 }, { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(1.8)' }, '+=.1');
    };
    const stop = onEgg(PAGE_EGGS, id => run(id));
    let buffer = '';
    const key = (event: KeyboardEvent) => {
      if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.key?.length !== 1) return;
      if ((event.target as Element | null)?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), dialog')) return;
      buffer = (buffer + normalizePhrase(event.key)).slice(-24);
      const id = matchTail(buffer, PAGE_EGGS);
      if (id) { buffer = ''; emitEgg(id); }
    };
    addEventListener('keydown', key);
    return () => { stop(); removeEventListener('keydown', key); };
  }, [pathname]);

  useEffect(() => { if (signal !== undefined || rescued) panel.current?.focus({ preventScroll: true }); }, [signal, rescued]);

  // Through the portal: a finite plasma warp, then home. Reduced motion goes straight home.
  const warp = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!motionAllowed() || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    const canvas = root.current?.querySelector<HTMLCanvasElement>('.red-tide__warp'), from = event.currentTarget.getBoundingClientRect();
    if (!canvas) { router.push(`/${lang}`); return; }
    canvas.dataset.on = 'true'; play('warp');
    const state = { p: 0 }, origin = { x: from.left + from.width / 2, y: from.top + from.height / 2 };
    gsap.to(state, { p: 1, duration: .95, ease: 'power2.in', onUpdate: () => drawWarp(canvas, state.p, origin), onComplete: () => router.push(`/${lang}`) });
  };

  const home = `/${lang}`;
  const hot = (name: keyof typeof RED_TIDE_HOTSPOTS, id: EggId) => <button type="button" className={`red-tide__hot red-tide__hot--${name}`} style={box(RED_TIDE_HOTSPOTS[name])}
    aria-label={copy.hot[name]} title={copy.hot[name]} hidden={!ready} onClick={() => emitEgg(id)} />;
  return <main id="main" className="red-tide-page" tabIndex={-1}>
    <section ref={root} className="red-tide" aria-labelledby="red-tide-title" data-paused="true" data-motion={motion || undefined}>
      <div className="red-tide__frame">
        <div className="red-tide__plane">
          <video className="red-tide__video" autoPlay muted loop playsInline preload="metadata" poster="/galaxia/scenes/red-tide/poster.webp" aria-hidden="true">
            <source src="/galaxia/scenes/red-tide/background.webm" type="video/webm" />
            <source src="/galaxia/scenes/red-tide/background.mp4" type="video/mp4" />
          </video>
          <canvas className="red-tide__plasma" aria-hidden="true" />
          <i className="red-tide__console" aria-hidden="true"><b /></i>
          <i className="red-tide__beacon" aria-hidden="true" style={prop('lost-signal-beacon')} />
          <a className="red-tide__portal" href={home} onClick={warp} tabIndex={rescued ? 0 : -1} aria-hidden={!rescued} aria-label={copy.rescue.portal} title={copy.rescue.portal} style={prop('navigation-portal-restored')} />
          {hot('glaucia', 'signal-recovered')}{hot('console', 'signal-recovered')}{hot('prince', 'paw-rescue')}
        </div>
      </div>
      <div className="red-tide__shade" aria-hidden="true" />
      <div className="red-tide__hud" aria-hidden="true">
        <span className="hud-corner hud-corner--tl" /><span className="hud-corner hud-corner--tr" /><span className="hud-corner hud-corner--bl" /><span className="hud-corner hud-corner--br" />
        <p className="red-tide__lost" data-text={copy.hud.lost}>{copy.hud.lost}</p>
        <p className="red-tide__route">{copy.hud.route}: <b>{pathname || '/'}</b></p>
      </div>
      <div className="red-tide__copy">
        <p className="red-tide__world">{copy.world}</p>
        <p className="red-tide__code" aria-hidden="true" data-text={copy.code}>{copy.code}</p>
        <h1 id="red-tide-title">{copy.title}</h1>
        <p className="red-tide__body">{copy.body}</p>
        <div className="actions"><Link className="button primary" data-magnetic href={home}>{copy.back}</Link></div>
        <RedTideEpisode copy={copy.episode} lang={lang} />
        <nav className="red-tide__worlds" aria-label={copy.others}><p>{copy.others}</p><ul>
          {(Object.keys(ROUTES) as RouteKey[]).filter(key => key !== 'home').map(key => <li key={key}><Link href={`/${lang}${ROUTES[key]}`}>{copy.routes[key]}</Link></li>)}
        </ul></nav>
        <p className="red-tide__touch" hidden={!ready}>{copy.touch}</p>
        {(signal !== undefined || rescued) && <div ref={panel} className="red-tide__panel" tabIndex={-1} role="region" aria-label={rescued ? copy.rescue.title : copy.signal.title}>
          {signal !== undefined && <div className="red-tide__readout">
            <i style={prop('coordinate-crystal')} aria-hidden="true" />
            <div><p className="red-tide__kicker">{copy.signal.title}</p>
              {signal ? <><p>{copy.signal.nearest}</p><Link className="button primary" href={`/${lang}${ROUTES[signal]}`}>{copy.signal.go.replace('{name}', copy.routes[signal])}</Link></> : <p>{copy.signal.none}</p>}</div>
          </div>}
          {rescued && <div className="red-tide__readout">
            <i style={prop('navigation-portal-restored')} aria-hidden="true" />
            <div><p className="red-tide__kicker">{copy.rescue.title}</p><p>{copy.rescue.body}</p><a className="button secondary" href={home} onClick={warp}>{copy.rescue.portal}</a></div>
          </div>}
        </div>}
      </div>
      <canvas className="red-tide__warp" aria-hidden="true" />
    </section>
  </main>;
}
