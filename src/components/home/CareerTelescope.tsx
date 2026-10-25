"use client";

import { useEffect, useRef, useState } from "react";
import { play } from "@/lib/sfx";

export const TELESCOPE_OPEN = "observatory:telescope";
export const TELESCOPE_CLOSED = "observatory:telescope-closed";
export type CareerStar = { title: string; company: string; period: string; source: string };
export type TelescopeCopy = { title: string; intro: string; close: string; hint: string; source: string };

// A rising constellation: each real milestone is a star, from the first role (low left) to today (high right).
const PLACES = [[18, 72], [38, 50], [60, 60], [80, 26], [70, 82], [28, 28]];

// The eyepiece: opened by Glaucia's telescope, it shows the career as a constellation that can be explored.
export function CareerTelescope({ stars, copy }: { stars: CareerStar[]; copy: TelescopeCopy }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(stars.length - 1);
  const places = stars.map((_, index) => PLACES[index % PLACES.length]);

  useEffect(() => {
    const open = () => { setSelected(stars.length - 1); if (!dialog.current?.open) dialog.current?.showModal(); };
    addEventListener(TELESCOPE_OPEN, open);
    return () => removeEventListener(TELESCOPE_OPEN, open);
  }, [stars.length]);

  const choose = (index: number) => { setSelected(index); play("twinkle"); };
  const star = stars[selected];
  return <dialog ref={dialog} className="telescope" aria-labelledby="telescope-title" onClose={() => dispatchEvent(new Event(TELESCOPE_CLOSED))} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <div className="telescope__eyepiece">
      <svg className="telescope__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <polyline points={places.map(([x, y]) => `${x},${y}`).join(" ")} pathLength={1} />
      </svg>
      <span className="telescope__reticle" aria-hidden="true" />
      <ol className="telescope__stars">{stars.map((item, index) => <li key={item.title + item.company}>
        <button type="button" className="telescope__star" style={{ left: `${places[index][0]}%`, top: `${places[index][1]}%`, animationDelay: `${.6 + index * .18}s` }} aria-pressed={index === selected} onClick={() => choose(index)} onFocus={() => setSelected(index)} onPointerEnter={() => setSelected(index)}>
          <span className="sr-only">{item.title} · {item.company} · {item.period}</span>
        </button>
      </li>)}</ol>
    </div>
    <div className="telescope__panel">
      <h2 id="telescope-title">{copy.title}</h2>
      <p className="telescope__intro">{copy.intro}</p>
      {star && <p className="telescope__reading" aria-live="polite"><b>{star.title}</b><span>{star.company} · {star.period}</span><a href={star.source} target="_blank" rel="noopener noreferrer">{copy.source}<span aria-hidden="true"> ↗</span></a></p>}
      <p className="telescope__hint">{copy.hint}</p>
      <button type="button" className="telescope__close" onClick={() => dialog.current?.close()}>{copy.close}</button>
    </div>
  </dialog>;
}
