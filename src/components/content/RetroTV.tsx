"use client";

import { useEffect, useRef, useState } from "react";
import { motionAllowed } from "@/lib/use-motion";
import { bringIntoView, buzz, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import type { LuminaCopy } from "@/i18n/lumina";
import type { LatestVideo } from "@/lib/youtube";
import { createStatic } from "./tv-static";

type Props = { video: LatestVideo; copy: LuminaCopy["tv"]; locale: string };
type Power = "off" | "tuning" | "on";

export const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;

// retro-tv: an old tube TV that plays the channel's latest long video. Nothing from YouTube loads until someone turns
// it on (click, tap, Enter, the radio or the typed command); then the tube warms up, snows for a moment and the
// privacy-enhanced player takes the screen. Without JavaScript the screen is the video's thumbnail, linking to YouTube.
export function RetroTV({ video, copy, locale }: Props) {
  const [ready, setReady] = useState(false);
  const [power, setPower] = useState<Power>("off");
  const root = useRef<HTMLDivElement>(null);
  const snow = useRef<HTMLCanvasElement>(null);
  const powerButton = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(video.published));
  const aired = copy.aired.replace("{date}", date);
  useEffect(() => setReady(true), []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const turnOn = () => {
    if (power !== "off") return;
    discover("retro-tv"); buzz(20);
    if (!motionAllowed()) { setPower("on"); return; }
    setPower("tuning"); play("crt-on");
    timers.current.push(window.setTimeout(() => play("static"), 350), window.setTimeout(() => setPower("on"), 950));
  };
  const turnOff = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setPower("off"); play("disk-out");
    requestAnimationFrame(() => powerButton.current?.focus({ preventScroll: true }));
  };
  const turnOnRef = useRef(turnOn);
  turnOnRef.current = turnOn;
  useEffect(() => onEgg("retro-tv", () => void bringIntoView(root.current).then(() => turnOnRef.current())), []);

  // The snow only runs while the tube warms up.
  useEffect(() => {
    if (power !== "tuning" || !snow.current) return;
    const noise = createStatic(snow.current);
    noise.start();
    return () => noise.stop();
  }, [power]);

  const thumbnail = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
  return <div ref={root} className="retro-tv" data-power={power}>
    <p className="retro-tv__kicker">{copy.kicker}{!video.live && <span className="retro-tv__saved"> · {copy.saved}</span>}</p>
    <div className="retro-tv__set" role="group" aria-label={copy.screen}>
      <span className="retro-tv__antenna" aria-hidden="true"><i /><i /></span>
      <div className="retro-tv__cabinet">
        <div className="retro-tv__bezel">
          <div className="retro-tv__screen">
            {!ready ? <a className="retro-tv__thumb" href={video.url} target="_blank" rel="noopener noreferrer" style={{ backgroundImage: `url(${thumbnail})` }}>
              <span className="sr-only">{copy.thumb.replace("{title}", video.title)}</span>
            </a> : <>
              {power === "off" && <button ref={powerButton} type="button" className="retro-tv__power" onClick={turnOn}><span>{copy.power}</span></button>}
              {power === "tuning" && <><canvas ref={snow} className="retro-tv__snow" aria-hidden="true" /><p className="retro-tv__tuning" role="status">{copy.tuning}</p></>}
              {power === "on" && <iframe className="retro-tv__player" src={embedUrl(video.id)} title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
            </>}
            <span className="retro-tv__glass" aria-hidden="true" />
          </div>
        </div>
        <div className="retro-tv__panel" aria-hidden="true"><span className="retro-tv__speaker" /><span className="retro-tv__knob" /><span className="retro-tv__knob retro-tv__knob--small" /><span className="retro-tv__led" /></div>
      </div>
      <span className="retro-tv__feet" aria-hidden="true"><i /><i /></span>
    </div>
    <p className="retro-tv__title"><a href={video.url} target="_blank" rel="noopener noreferrer">{video.title}<span aria-hidden="true"> ↗</span></a></p>
    <p className="retro-tv__meta"><time dateTime={video.published}>{aired}</time></p>
    {ready && <p className="retro-tv__actions">
      <a href={video.url} target="_blank" rel="noopener noreferrer">{copy.open} <span aria-hidden="true">↗</span></a>
      {power !== "off" && <button type="button" onClick={turnOff}>{copy.off}</button>}
    </p>}
  </div>;
}
