import type { CSSProperties } from "react";
import { SCENES, boxStyle, poseBox, propBox, type Box } from "@/lib/scenes";

// Observatório das Primeiras Luzes: every layer sits on the 16:9 plate (percent), with the plate's cover projection.
export const observatory = SCENES["earth-observatory"];
const { props, actors } = observatory.assets;
const poses = ["idle", "telescope", "point"] as const;
const boxes = Object.fromEntries([...poses, "blink"].map((pose) => [pose, poseBox(observatory, "glaucia", pose)])) as Record<(typeof poses)[number] | "blink", Box>;
const idle = boxes.idle;

// Lights on the terrace that can be switched off (the one behind Glaucia's legs stays out of reach).
// u, v: centre of the painted flame; w, h: the glass that goes dark when the lantern is switched off (plate percent).
export const LANTERNS = [{ u: 59.6, v: 76.4, w: 1.65, h: 4.25 }, { u: 72.8, v: 77.5, w: .95, h: 2.95 }, { u: 93.03, v: 63.9, w: .65, h: 6.1 }, { u: 93.6, v: 70.6, w: 1.05, h: 2.85 }];
const LANTERN_SIZE = 3.4; // halo width, percent of the plate width (square)
const lanternBox = ({ u, v }: { u: number; v: number }): Box => ({ left: u - 1.5, top: v - 3.2, width: 3, height: 5.4 });

export const HOTSPOTS = {
  glaucia: { left: idle.left + idle.width * .22, top: idle.top, width: idle.width * .66, height: idle.height * .6 },
  prince: { left: idle.left - idle.width * .02, top: idle.top + idle.height * .64, width: idle.width * .56, height: idle.height * .36 },
  hangar: { left: 86.6, top: 32, width: 10.4, height: 8.6 },
  console: propBox(observatory, "launch-console-idle", 93.5, 96.5, 1.15),
  ...Object.fromEntries(LANTERNS.map((lantern, index) => [`lantern-${index}`, lanternBox(lantern)])),
} as Record<string, Box>;

// Anchors (plate percent) shared with the motion island.
export const SPOTS = {
  princeHead: { u: HOTSPOTS.prince.left + HOTSPOTS.prince.width * .5, v: HOTSPOTS.prince.top + 4 },
  receiver: { u: 65.5, v: 81 },
  signal: { u: 94, v: 19 },
  hangarMouth: { u: 89.6, v: 40.5 },
};
const receiver = propBox(observatory, "receiver-cyan-pulse", 65.5, 89.5, .95);
const ship = propBox(observatory, "spacecraft-near", 0, 0, .5);
const at = (x: number, y: number): CSSProperties => ({ left: `${x}%`, top: `${y}%` });
const art = (src: string): CSSProperties => ({ backgroundImage: `url(${src})` });
const FIREFLIES = [[52, 86], [56, 80], [60, 90], [66, 84], [97, 86], [54, 93]];

export function ObservatoryScene() {
  return <div className="hero-scene-layer hero-scene-layer--observatory" data-paused="true" aria-hidden="true">
    <div className="scene-image-plane observatory-plane">
      <canvas className="observatory-sky observatory-sky--back" />
      <span className="observatory-hangar" style={at(SPOTS.hangarMouth.u, 39.2)}><i /><i /><i /></span>
      <i className="observatory-ship" style={{ width: `${ship.width}%`, height: `${ship.height}%`, ...at(SPOTS.hangarMouth.u, SPOTS.hangarMouth.v), ...art(props["spacecraft-near"].src) }} />
      <span className="observatory-countdown" style={at(SPOTS.hangarMouth.u, 24)} data-countdown />
      {LANTERNS.map(({ u, v, w, h }, index) => <span className="observatory-lantern" data-lantern={index} key={index} style={{ ...at(u, v), "--flicker-delay": `${-index * .9}s` } as CSSProperties}>
        <i className="observatory-lantern__glow" />
        <i className="observatory-lantern__glass" style={{ width: `${w / LANTERN_SIZE * 100}%`, height: `${h / (LANTERN_SIZE * 16 / 9) * 100}%` }} />
      </span>)}
      <span className="observatory-receiver" style={boxStyle(receiver)}>
        <i className="observatory-receiver__art" style={art(props["receiver-cyan-pulse"].src)} />
        <i className="observatory-receiver__ring" /><i className="observatory-receiver__ring" />
      </span>
      <span className="observatory-console" style={boxStyle(HOTSPOTS.console)}>
        <i className="observatory-console__idle" style={art(props["launch-console-idle"].src)} />
        <i className="observatory-console__on" style={art(props["launch-console-activated"].src)} />
      </span>
      <span className="observatory-signal-star" style={at(SPOTS.signal.u, SPOTS.signal.v)}><span className="observatory-signal-star__label" data-signal-label /></span>
      {/* Glaucia and Prince: one sprite per pose, all anchored on the same hips; blink is an overlay on idle. */}
      <span className="observatory-crew">
        {poses.map((pose) => <i key={pose} className={`observatory-crew__pose observatory-crew__pose--${pose}`} style={{ ...boxStyle(boxes[pose]), ...art(actors.glaucia[pose].src) }} />)}
        <i className="observatory-crew__blink" style={{ ...boxStyle(boxes.blink), ...art(actors.glaucia.blink.src) }} />
      </span>
      <span className="observatory-bubble" style={at(HOTSPOTS.prince.left - 1, HOTSPOTS.prince.top - .5)}><i className="observatory-bubble__face" /></span>
      {FIREFLIES.map(([x, y], index) => <i className="observatory-firefly" key={index} style={{ ...at(x, y), "--blink-delay": `${-index * .7}s` } as CSSProperties} />)}
      <canvas className="observatory-sky observatory-sky--front" />
      <span className="observatory-flash" />
    </div>
  </div>;
}

type HotLabels = { glaucia: string; prince: string; hangar: string; console: string; lantern: string };
// Accessible hotspots, above the copy layer; hidden until the motion island wires them up.
export function ObservatoryHotspots({ labels }: { labels: HotLabels }) {
  const label = (key: string) => key.startsWith("lantern-") ? labels.lantern.replace("{n}", String(Number(key.slice(8)) + 1)) : labels[key as keyof HotLabels];
  return <div className="observatory-layer">
    <div className="observatory-plane observatory-plane--hot">
      {Object.entries(HOTSPOTS).map(([key, box]) => <button key={key} type="button" className={`observatory-hot observatory-hot--${key.replace(/-\d$/, "")}`} data-hot={key} aria-label={label(key)} title={label(key)} style={boxStyle(box)} hidden />)}
    </div>
  </div>;
}
