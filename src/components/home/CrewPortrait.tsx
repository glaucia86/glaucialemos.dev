import type { CSSProperties } from "react";
import { observatory } from "./ObservatoryScene";

const { background, actors } = observatory.assets;
const STARS = [[12, 8], [28, 18], [46, 6], [64, 14], [82, 9], [90, 26], [8, 30], [36, 32], [72, 34], [56, 24]];
const FIREFLIES = [[14, 78], [26, 66], [80, 72], [88, 84]];
const art = (src: string): CSSProperties => ({ backgroundImage: `url(${src})` });

// Chapter 2 portrait: a small living window onto the observatory — aurora, stars, a shooting star, fireflies,
// Glaucia blinking. Pure CSS: static without JS or with reduced motion.
export function CrewPortrait({ label }: { label: string }) {
  return <div className="crew-portrait" role="img" aria-label={label}>
    <i className="crew-portrait__sky" style={art(background.src)} />
    <span className="crew-portrait__aurora" aria-hidden="true"><i /><i /></span>
    {STARS.map(([x, y], index) => <i className="crew-portrait__star" key={index} style={{ left: `${x}%`, top: `${y}%`, "--twinkle-delay": `${-index * .37}s` } as CSSProperties} />)}
    <i className="crew-portrait__meteor" />
    <i className="crew-portrait__glaucia" style={art(actors.glaucia.idle.src)}><i className="crew-portrait__blink" style={art(actors.glaucia.blink.src)} /></i>
    {FIREFLIES.map(([x, y], index) => <i className="crew-portrait__firefly" key={index} style={{ left: `${x}%`, top: `${y}%`, "--blink-delay": `${-index * .8}s` } as CSSProperties} />)}
  </div>;
}
