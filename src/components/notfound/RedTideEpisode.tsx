'use client';

import { useRef } from 'react';
import type { Locale } from '@/i18n/config';
import type { RedTideCopy } from '@/i18n/red-tide';

const BASE = '/galaxia/scenes/red-tide';
export const EPISODE_LANGS: readonly Locale[] = ['pt', 'en', 'es'];

/**
 * "Lost Coordinates", the narrated cartoon episode of the 404. It never plays by itself: a click opens it on an old CRT
 * (a modal dialog, so Esc closes it and focus stays inside), with sound, native controls and captions in the three languages
 * (the narration is in Portuguese). Closing pauses it. The calm bridge loop stays as the page background.
 */
export function RedTideEpisode({ copy, lang }: { copy: RedTideCopy['episode']; lang: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const open = () => {
    const box = dialog.current, player = video.current;
    if (!box || !player || box.open) return;
    box.showModal(); box.dataset.crt = 'on';
    player.currentTime = 0;
    void player.play().catch(() => {});
  };
  const close = () => dialog.current?.close();
  return <>
    <button ref={opener} type="button" className="red-tide__episode" onClick={open}>
      <i aria-hidden="true" style={{ backgroundImage: `url(${BASE}/episode-poster.webp)` }}><b>▶</b></i>
      <span><small>{copy.kicker}</small>{copy.watch}</span>
    </button>
    <dialog ref={dialog} className="red-tide-episode" aria-labelledby="red-tide-episode-title" data-lenis-prevent=""
      onClose={() => { video.current?.pause(); delete dialog.current?.dataset.crt; opener.current?.focus({ preventScroll: true }); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="red-tide-episode__tv">
        <div className="red-tide-episode__head">
          <h2 id="red-tide-episode-title">{copy.title}</h2>
          <button type="button" className="red-tide-episode__close" onClick={close}><span aria-hidden="true">✕</span> {copy.close}</button>
        </div>
        <div className="red-tide-episode__screen">
          <video ref={video} controls playsInline preload="none" poster={`${BASE}/episode-poster.webp`} crossOrigin="anonymous">
            <source src={`${BASE}/episode.webm`} type="video/webm" />
            <source src={`${BASE}/episode.mp4`} type="video/mp4" />
            {EPISODE_LANGS.map(code => <track key={code} kind="captions" srcLang={code} label={copy.tracks[code]} src={`${BASE}/episode.${code}.vtt`} default={code === lang} />)}
          </video>
          <i className="red-tide-episode__glass" aria-hidden="true" />
        </div>
        <p className="red-tide-episode__note">{copy.note}</p>
      </div>
    </dialog>
  </>;
}
