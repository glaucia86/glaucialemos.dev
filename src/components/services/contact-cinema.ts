import { observeMotionActivity } from '@/lib/motion';
import { createContactGarden } from './garden-engine';

type CinemaElements = {
  root: HTMLElement; panel: HTMLElement; canvas: HTMLCanvasElement; typed: HTMLElement;
  motion: boolean; celebrate: () => void; invitation: string;
};

/** One finite clock shared by typing and particles; CSS follows the same phase/pause. */
export function mountContactCinema({ root, panel, canvas, typed, motion, celebrate, invitation }: CinemaElements) {
  const letters = Array.from(invitation);
  let destroyed = false, active = false, raf = 0, previous: number | null = null;
  let elapsed = 0, phase: 'arrival' | 'success' | null = null, soundPending = false;
  let entered = root.dataset.cinemaEntered === 'true';
  let lastStatus = panel.dataset.contactStatus;
  const garden = motion ? createContactGarden(canvas) : null;

  const pause = () => {
    cancelAnimationFrame(raf); raf = 0; previous = null;
  };
  const settle = () => {
    pause(); phase = null; soundPending = false;
    typed.textContent = invitation;
    root.dataset.cinema = root.dataset.cinemaSuccess ? 'success' : entered ? 'ready' : 'static';
    garden?.clear();
  };
  const schedule = () => { if (!destroyed && active && phase && !raf) raf = requestAnimationFrame(frame); };
  const frame = (now: number) => {
    raf = 0;
    if (destroyed || !active || !phase) return;
    // This is a finite timeline, not a physics step: low FPS must not lengthen it.
    // pause() resets previous, so time spent offscreen/hidden is still excluded.
    if (previous !== null) elapsed += Math.max(0, now - previous);
    previous = now;
    if (soundPending) { soundPending = false; celebrate(); }
    const duration = phase === 'arrival' ? 2400 : 2600;
    if (elapsed >= duration) { settle(); return; }
    if (phase === 'arrival') {
      const text = letters.slice(0, Math.floor(letters.length * Math.min(1, elapsed / 1800))).join('');
      if (typed.textContent !== text) typed.textContent = text;
    }
    garden?.draw(phase, elapsed / duration);
    schedule();
  };
  const begin = (next: 'arrival' | 'success') => {
    pause(); phase = next; elapsed = 0; entered = true;
    root.dataset.cinemaEntered = 'true';
    root.dataset.cinema = next === 'arrival' ? 'arriving' : 'celebrating';
    typed.textContent = next === 'arrival' ? '' : invitation;
    soundPending = next === 'success';
    schedule();
  };
  const readStatus = () => {
    if (destroyed || lastStatus === panel.dataset.contactStatus) return;
    lastStatus = panel.dataset.contactStatus;
    if (lastStatus === 'ok') {
      root.dataset.cinemaSuccess = 'true';
      if (motion) begin('success'); else { settle(); celebrate(); }
    } else {
      delete root.dataset.cinemaSuccess;
      if (phase === 'success' || root.dataset.cinema === 'success') settle();
    }
  };

  // Existing success (including a preference change) gets its final state, never a replay.
  if (lastStatus === 'ok') { root.dataset.cinemaSuccess = 'true'; entered = true; }
  else delete root.dataset.cinemaSuccess;
  settle(); root.dataset.paused = 'true';
  const status = new MutationObserver(readStatus);
  status.observe(panel, { attributes: true, attributeFilter: ['data-contact-status'] });
  const stopActivity = motion ? observeMotionActivity(panel, on => {
    if (destroyed) return;
    active = on; root.dataset.paused = String(!on);
    if (!on) { pause(); return; }
    if (!entered) begin('arrival'); else schedule();
  }) : undefined;

  return () => {
    destroyed = true;
    stopActivity?.(); status.disconnect(); settle(); garden?.destroy();
    root.dataset.paused = 'true';
  };
}
