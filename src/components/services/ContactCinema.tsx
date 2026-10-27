'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useMotionEnabled } from '@/lib/use-motion';
import { play } from '@/lib/sfx';
import { mountContactCinema } from './contact-cinema';
import { mountContactPortal, type PortalCopy } from './contact-portal';

/** Decorative only: the form and its accessible status remain the source of truth. */
export function ContactCinema({ copy, portal: portalCopy, crew, children }: { copy: string; portal: PortalCopy; crew?: ReactNode; children?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const typed = useRef<HTMLSpanElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const portal = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const vortex = useRef<HTMLCanvasElement>(null);
  const launch = useRef<HTMLDivElement>(null);
  const signal = useRef<HTMLCanvasElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const motion = useMotionEnabled();
  const portalText = useRef(portalCopy);
  useEffect(() => { portalText.current = portalCopy; }, [portalCopy]);

  useEffect(() => {
    const panel = root.current?.querySelector<HTMLElement>('#contato');
    if (!root.current || !canvas.current || !typed.current || !panel) return;
    return mountContactCinema({
      root: root.current, panel, canvas: canvas.current, typed: typed.current, motion, invitation: copy,
      celebrate: () => play('bloom', { gain: .7 }),
    });
  }, [motion, copy]);

  // Independent of the motion preference: toggling it must never close an open portal or drop the form.
  useEffect(() => {
    const panel = root.current?.querySelector<HTMLElement>('#contato');
    if (!root.current || !dock.current || !portal.current || !stage.current || !close.current || !vortex.current || !launch.current || !signal.current || !caption.current || !panel) return;
    const controller = mountContactPortal({
      root: root.current, dock: dock.current, portal: portal.current, stage: stage.current, panel, close: close.current,
      vortex: vortex.current, launch: launch.current, signal: signal.current, caption: caption.current,
      crew: root.current.querySelector<HTMLElement>('.contact-crew'),
      copy: () => portalText.current,
      sound: kind => play(kind),
    });
    return controller.destroy;
  }, []);

  return <div ref={root} className="contact-cinema" data-cinema="static" data-paused="true">
    <p className="contact-cinema__invitation">
      <span className="sr-only">{copy}</span>
      <span ref={typed} aria-hidden="true">{copy}</span>
    </p>
    <div ref={dock} className="contact-cinema__dock">
      <div ref={portal} className="contact-portal" data-lenis-prevent="">
        <canvas ref={vortex} className="contact-portal__vortex" aria-hidden="true" />
        <button ref={close} type="button" className="contact-portal__close" hidden><span aria-hidden="true">✕</span> {portalCopy.close}</button>
        <div ref={stage} className="contact-cinema__stage">
          <i className="contact-cinema__halo" aria-hidden="true" />
          {crew}
          {children}
          <canvas ref={canvas} className="contact-cinema__air" aria-hidden="true" />
          <i className="contact-cinema__flare" aria-hidden="true" />
          <svg className="contact-cinema__sprout" aria-hidden="true" focusable="false" viewBox="0 0 64 64" fill="none">
            <path d="M12 55h40M32 54V28" />
            <path d="M32 41C19 41 13 34 13 23c12 0 19 7 19 18ZM32 33c0-12 7-19 19-19 0 12-7 19-19 19Z" />
            <circle cx="32" cy="8" r="2" />
          </svg>
        </div>
        <div ref={launch} className="contact-launch" aria-hidden="true">
          <canvas ref={signal} className="contact-launch__sky" />
          <p ref={caption} className="contact-launch__caption" />
        </div>
      </div>
    </div>
  </div>;
}
