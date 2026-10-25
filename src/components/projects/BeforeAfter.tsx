"use client";

import { useState, type CSSProperties } from "react";
import { discover } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import type { MarteCopy } from "@/i18n/marte";

type Sprite = { src: string; w: number; h: number };
type Props = {
  copy: Pick<MarteCopy["bench"]["site"], "before" | "after" | "rejected" | "showRejected" | "showApproved" | "slider">;
  plate: Sprite; raw: Sprite; approved: Sprite; rejected: Sprite; box: CSSProperties;
};

// Before and after on the same stretch of the Mars plate: the pose straight from Grok on the left of the line, the sprite
// that stands in the scene on the right. The line is a native range input (mouse, touch, arrow keys); without JavaScript it
// stays in the middle, so both halves are still visible.
export function BeforeAfter({ copy, plate, raw, approved, rejected, box }: Props) {
  const [split, setSplit] = useState(50);
  const [showRejected, setShowRejected] = useState(false);
  const touched = () => discover("before-pretty");
  const after = showRejected ? rejected : approved;
  const layer = (sprite: Sprite, pixel: boolean): CSSProperties => ({ ...box, backgroundImage: `url(${sprite.src})`, imageRendering: pixel ? "pixelated" : "auto" });

  return <div className="compare" style={{ "--split": `${split}%` } as CSSProperties} data-rejected={showRejected || undefined}>
    <div className="compare__stage" style={{ aspectRatio: `${plate.w} / ${plate.h}`, backgroundImage: `url(${plate.src})` }}>
      <i className="compare__sprite" style={layer(after, true)} />
      <span className="compare__before"><i className="compare__sprite" style={layer(raw, false)} /></span>
      <span className="compare__line" aria-hidden="true"><i /></span>
      <span className="compare__tag compare__tag--before" aria-hidden="true">{copy.before}</span>
      <span className="compare__tag compare__tag--after" aria-hidden="true">{showRejected ? copy.rejected : copy.after}</span>
      <input className="compare__range" type="range" min={0} max={100} value={split} aria-label={copy.slider} aria-valuetext={`${split}%`}
        onChange={(event) => { setSplit(Number(event.target.value)); touched(); }} />
    </div>
    <button type="button" className="compare__toggle" aria-pressed={showRejected} onClick={() => { setShowRejected((current) => !current); touched(); play("switch"); }}>
      {showRejected ? copy.showApproved : copy.showRejected}
    </button>
  </div>;
}
