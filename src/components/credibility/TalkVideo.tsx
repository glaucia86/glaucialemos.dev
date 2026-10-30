'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { TalkVideo as Video } from '@/data/prova-social';

// Click-to-play: until the visitor asks, only the local poster is shown (no YouTube request, no cookies). Without
// JS the poster is a plain link to the video on YouTube.
export function TalkVideo({ video, copy }: { video: Video; copy: { watch: string; label: string; note: string } }) {
  const [playing, setPlaying] = useState(false);
  const title = `${video.event} ${video.year} — ${video.title}`;
  return <figure className="credibility-video">
    <div className="credibility-video__frame">
      {playing
        ? <iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        : <a href={video.url} target="_blank" rel="noopener noreferrer" className="credibility-video__poster"
          onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return; event.preventDefault(); setPlaying(true); }}>
          <Image {...video.poster} alt="" sizes="(max-width: 700px) 100vw, 640px" />
          <span className="credibility-video__play" aria-hidden="true">▶</span>
          <span className="sr-only">{copy.watch}: {title}</span>
        </a>}
    </div>
    <figcaption><strong>{copy.label} · {video.event} {video.year}</strong> {video.title}. <small>{copy.note}</small></figcaption>
  </figure>;
}
