import type { CSSProperties } from "react";
import { niveoraScene } from "./NiveoraScene";

const { background, actors } = niveoraScene.assets;
const FLAKES = [[8, 4], [22, 12], [38, 2], [54, 16], [70, 6], [86, 14], [14, 30], [46, 26], [78, 32], [62, 40], [30, 44], [92, 46]];
const art = (src: string): CSSProperties => ({ backgroundImage: `url(${src})` });

// Chapter 2 portrait: a small living window onto Nivéora — aurora, falling snow, Glaucia blinking and Prince at
// her feet. Pure CSS: static without JS or with reduced motion.
export function NiveoraPortrait({ label }: { label: string }) {
  return <div className="niveora-portrait" role="img" aria-label={label}>
    <i className="niveora-portrait__sky" style={art(background.src)} />
    <span className="niveora-portrait__aurora" aria-hidden="true"><i /><i /></span>
    <i className="niveora-portrait__glaucia" style={art(actors.glaucia.idle.src)}><i className="niveora-portrait__blink" style={art(actors.glaucia.blink.src)} /></i>
    <i className="niveora-portrait__prince" style={art(actors.prince.stand.src)} />
    {FLAKES.map(([x, y], index) => <i className="niveora-portrait__flake" key={index} style={{ left: `${x}%`, top: `${y}%`, "--fall-delay": `${-index * .8}s` } as CSSProperties} />)}
  </div>;
}
