'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useMotionEnabled } from '@/lib/use-motion';
import { play } from '@/lib/sfx';
import { mountContactCinema } from './contact-cinema';

/** Decorative only: the form and its accessible status remain the source of truth. */
export function ContactCinema({ copy, children }: { copy: string; children?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const typed = useRef<HTMLSpanElement>(null);
  const motion = useMotionEnabled();

  useEffect(() => {
    const panel = root.current?.querySelector<HTMLElement>('#contato');
    if (!root.current || !canvas.current || !typed.current || !panel) return;
    return mountContactCinema({
      root: root.current, panel, canvas: canvas.current, typed: typed.current, motion, invitation: copy,
      celebrate: () => play('bloom', { gain: .7 }),
    });
  }, [motion, copy]);

  return <div ref={root} className="contact-cinema" data-cinema="static" data-paused="true">
    <p className="contact-cinema__invitation">
      <span className="sr-only">{copy}</span>
      <span ref={typed} aria-hidden="true">{copy}</span>
    </p>
    <div className="contact-cinema__stage">
      <i className="contact-cinema__halo" aria-hidden="true" />
      {children}
      <canvas ref={canvas} className="contact-cinema__air" aria-hidden="true" />
      <i className="contact-cinema__flare" aria-hidden="true" />
      <svg className="contact-cinema__sprout" aria-hidden="true" focusable="false" viewBox="0 0 64 64" fill="none">
        <path d="M12 55h40M32 54V28" />
        <path d="M32 41C19 41 13 34 13 23c12 0 19 7 19 18ZM32 33c0-12 7-19 19-19 0 12-7 19-19 19Z" />
        <circle cx="32" cy="8" r="2" />
      </svg>
    </div>
  </div>;
}
