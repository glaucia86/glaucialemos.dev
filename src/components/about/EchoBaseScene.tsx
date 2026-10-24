import type { CSSProperties } from "react";
import { PixelSprite, PROBE, SPEEDER } from "./sprites";
import { box, leia, leiaArt } from "./leia";

// Echo Base overlays, positioned on the 1280 × 720 artwork. Everything is decorative.
const at = (x: number, y: number) => ({ left: `${x / 12.8}%`, top: `${y / 7.2}%` });

const walker = { o: "var(--echo-walker)", d: "var(--echo-walker-dark)" };
const AT_AT_BODY = [
  ".......ooooooooooooooo..",
  "......oooooooooooooooood",
  "oo...ooooooooooooooooood",
  "ooo.oooooooooooooooooood",
  "oooooooooooooooooooooood",
  "ooo...ooooooooooooooood.",
];
const legs = (rows: string[]) => [...AT_AT_BODY.map(row => row.replace(/./g, ".")), ...rows];
const AT_AT_LEGS_A = legs([
  ".......dd..........dd...", ".......dd..........dd...", "......ddd.........ddd...", "......d.d.........d.d...",
  "......d.d.........d.d...", "......d.d.........d.d...", ".....dd.dd.......dd.dd..",
]);
const AT_AT_LEGS_B = legs([
  ".......dd..........dd...", ".......dd..........dd...", ".......ddd.........ddd..", ".......d.d.........d.d..",
  "......d..d........d..d..", "......d..d........d..d..", ".....dd..dd......dd..dd.",
]);
const AT_AT_TOP = [...AT_AT_BODY, ...Array.from({ length: 7 }, () => "........................")];

const antennas = [[762, 265], [787, 284], [1097, 166], [1115, 159], [1220, 242]];
const windows = [[1132, 255], [1090, 327], [1210, 332]];

export function EchoBaseScene() {
  return <>
    {/* Leia (AI-generated layers): a plate patch hides the painted Leia once LeiaActor has loaded them. */}
    <div className="scene-image-plane echo-plane echo-actor">
      {leia.patch && <span className="echo-actor__plate" style={{ ...box(leia.patch), "--art": `url(${leiaArt("plate")})` } as CSSProperties} />}
      <span className="echo-actor__leia" style={{ ...box(leia.frame), transformOrigin: `${leia.feet.x}% ${leia.feet.y}%` }}>
        <span className="echo-actor__body" style={{ transformOrigin: `${leia.feet.x}% ${leia.feet.y}%` }}>
          {leia.poses.map((pose) => <i key={pose} className={`echo-actor__pose echo-actor__pose--${pose}`} style={{ "--art": `url(${leiaArt(pose)})` } as CSSProperties} />)}
        </span>
      </span>
    </div>
    <span className="echo-aurora" />
    <div className="scene-image-plane echo-plane">
      <span className="echo-speeder" style={at(-60, 120)}><PixelSprite {...SPEEDER} /><span className="echo-speeder__trail" /></span>
      <span className="echo-speeder echo-speeder--wing" style={at(-110, 150)}><PixelSprite {...SPEEDER} /><span className="echo-speeder__trail" /></span>
      {[{ x: 520, y: 470, size: 4.2, delay: 0 }, { x: 600, y: 488, size: 3, delay: -26 }].map(({ x, y, size, delay }) =>
        <span className="echo-walker" key={x} style={{ ...at(x, y), width: `${size}%`, "--walk-delay": `${delay}s` } as CSSProperties}>
          <PixelSprite className="echo-walker__body" rows={AT_AT_TOP} palette={walker} />
          <PixelSprite className="echo-walker__legs echo-walker__legs--a" rows={AT_AT_LEGS_A} palette={walker} />
          <PixelSprite className="echo-walker__legs echo-walker__legs--b" rows={AT_AT_LEGS_B} palette={walker} />
        </span>)}
      <span className="echo-probe" style={at(640, 150)}>
        <span className="echo-probe__beam" />
        <PixelSprite {...PROBE} />
      </span>
      <span className="echo-beacon" style={at(765, 417)}><span className="echo-beacon__ring" /></span>
      {antennas.map(([x, y], index) => <span className="echo-antenna" key={`${x}-${y}`} style={{ ...at(x, y), "--blink-delay": `${-index * .37}s` } as CSSProperties} />)}
      {windows.map(([x, y], index) => <span className="echo-window" key={`${x}-${y}`} style={{ ...at(x, y), "--blink-delay": `${-index * 1.9}s` } as CSSProperties} />)}
      <span className="echo-breath" style={at(970, 387)}><i /><i /><i /></span>
      <span className="echo-leia" style={{ ...at(915, 290), width: `${150 / 12.8}%`, height: `${255 / 7.2}%` }} />
      <span className="echo-ion" style={at(765, 417)} />
    </div>
    <div className="echo-snow">
      <span className="echo-snow__layer echo-snow__layer--far" />
      <span className="echo-snow__layer echo-snow__layer--mid" />
      <span className="echo-snow__layer echo-snow__layer--near" />
    </div>
  </>;
}
