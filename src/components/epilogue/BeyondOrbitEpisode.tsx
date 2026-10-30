"use client";

import { useEffect, useRef, type SyntheticEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { BeyondOrbitCopy } from "@/i18n/beyond-orbit";
import { blockMusic } from "@/lib/music";

const BASE = "/galaxia/scenes/beyond-orbit";
export const EPISODE_LANGS: readonly Locale[] = ["pt", "en", "es"];

let savedWorld: string | null = null;
function hush(quiet: boolean) {
  blockMusic("episode", quiet);
  const page = document.querySelector<HTMLElement>("main");
  if (quiet && savedWorld === null) { savedWorld = page?.dataset.soundWorld ?? ""; if (page) delete page.dataset.soundWorld; }
  else if (!quiet && savedWorld !== null) { if (page && savedWorld) page.dataset.soundWorld = savedWorld; savedWorld = null; }
}

/**
 * "Beyond the Last Orbit", the narrated cartoon episode of the epilogue, in the same mould as the 404 one. It never plays
 * by itself: a click opens it on an old CRT (a modal dialog, so Esc closes it and focus stays inside), with sound, native
 * controls and captions in the three languages (the narration is in Portuguese). Closing pauses it. While it is open the
 * site goes quiet: the world's music and ambience stop (the page leaves its sound world, which FxLayer follows) and hover
 * and click blips from inside the dialog never reach FxLayer.
 */
export function BeyondOrbitEpisode({ copy, lang }: { copy: BeyondOrbitCopy["episode"]; lang: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  useEffect(() => () => hush(false), []);
  const open = () => {
    const box = dialog.current, player = video.current;
    if (!box || !player || box.open) return;
    hush(true);
    box.showModal(); box.dataset.crt = "on";
    player.currentTime = 0;
    void player.play().catch(() => {});
  };
  const close = () => dialog.current?.close();
  const keep = (event: SyntheticEvent) => event.stopPropagation();
  return <>
    <button ref={opener} type="button" className="beyond-orbit__episode" onClick={open}>
      <i aria-hidden="true" style={{ backgroundImage: `url(${BASE}/episode-poster.webp)` }}><b>▶</b></i>
      <span><small>{copy.kicker}</small>{copy.watch}</span>
    </button>
    <dialog ref={dialog} className="beyond-orbit-episode" aria-labelledby="beyond-orbit-episode-title" data-lenis-prevent=""
      onClose={() => { video.current?.pause(); delete dialog.current?.dataset.crt; hush(false); opener.current?.focus({ preventScroll: true }); }}
      onPointerOver={keep}
      onClick={event => { keep(event); if (event.target === event.currentTarget) close(); }}>
      <div className="beyond-orbit-episode__tv">
        <div className="beyond-orbit-episode__head">
          <h2 id="beyond-orbit-episode-title">{copy.title}</h2>
          <button type="button" className="beyond-orbit-episode__close" onClick={close}><span aria-hidden="true">✕</span> {copy.close}</button>
        </div>
        <div className="beyond-orbit-episode__screen">
          <video ref={video} controls playsInline preload="none" poster={`${BASE}/episode-poster.webp`} crossOrigin="anonymous">
            <source src={`${BASE}/episode.webm`} type="video/webm" />
            <source src={`${BASE}/episode.mp4`} type="video/mp4" />
            {EPISODE_LANGS.map(code => <track key={code} kind="captions" srcLang={code} label={copy.tracks[code]} src={`${BASE}/episode.${code}.vtt`} default={code === lang} />)}
          </video>
          <i className="beyond-orbit-episode__glass" aria-hidden="true" />
        </div>
        <p className="beyond-orbit-episode__note">{copy.note}</p>
      </div>
    </dialog>
  </>;
}
