import type { CSSProperties } from "react";
import { SCENES, boxStyle, poseBox, propBox, type Box } from "@/lib/scenes";

// Marte: every layer sits on the 16:9 plate (percent). The plate is always shown whole, like Nivéora's.
export const marsScene = SCENES["mars-lab"];
const { props, actors } = marsScene.assets;

export const GLAUCIA_POSES = ["idle", "point", "cheer"] as const;
export const PRINCE_POSES = ["stand", "sniff", "gaze", "watch"] as const;
export type GlauciaPose = (typeof GLAUCIA_POSES)[number];
export type PrincePose = (typeof PRINCE_POSES)[number];

const glaucia = Object.fromEntries([...GLAUCIA_POSES, "blink"].map((pose) => [pose, poseBox(marsScene, "glaucia", pose)])) as Record<GlauciaPose | "blink", Box>;
const prince = Object.fromEntries(PRINCE_POSES.map((pose) => [pose, poseBox(marsScene, "prince", pose)])) as Record<PrincePose, Box>;
const idle = glaucia.idle;

// Where the props stand (centre x, bottom y in plate percent), approved in the composition review.
const ROVER_AT = { x: 75.5, bottom: 63.6 };
// The scanning sprite adds the arm on the right: its body stays where the idle rover was.
const SCANNING_SHIFT = 3.4;
const rover = propBox(marsScene, "rover-idle", ROVER_AT.x, ROVER_AT.bottom);
const scanning = propBox(marsScene, "rover-scanning", ROVER_AT.x + SCANNING_SHIFT, ROVER_AT.bottom);
const beacon = propBox(marsScene, "data-beacon", 61.8, 61.5);
const consoleIdle = propBox(marsScene, "analysis-console-idle", 96, 93.5);
const consoleOn = propBox(marsScene, "analysis-console-activated", 96, 93.5);
const sampleCase = propBox(marsScene, "sample-case-sealed", 67, 93.5);
const sample = propBox(marsScene, "mineral-sample-large", 67, 93.5);

// A stable hover target for Prince: the union of every pose he takes on stage.
const union = (boxes: Box[]): Box => {
  const left = Math.min(...boxes.map((box) => box.left)); const top = Math.min(...boxes.map((box) => box.top));
  return { left, top, width: Math.max(...boxes.map((box) => box.left + box.width)) - left, height: Math.max(...boxes.map((box) => box.top + box.height)) - top };
};

export const HOTSPOTS = {
  glaucia: { left: idle.left + idle.width * .18, top: idle.top, width: idle.width * .64, height: idle.height * .7 },
  rover,
  prince: union(Object.values(prince)),
  console: consoleIdle,
} as Record<"glaucia" | "rover" | "prince" | "console", Box>;

// Anchors (plate percent) shared with the motion island.
export const SPOTS = {
  wheels: { u: rover.left + rover.width * .35, v: ROVER_AT.bottom - .6 },
  sensor: { u: scanning.left + scanning.width * .73, v: scanning.top + scanning.height * .14 },
  rock: { u: scanning.left + scanning.width * .84, v: scanning.top + scanning.height * .72 },
  screen: { u: consoleOn.left + consoleOn.width * .5, v: consoleOn.top + consoleOn.height * .3 },
  hand: { u: glaucia.point.left + glaucia.point.width * .06, v: glaucia.point.top + glaucia.point.height * .34 },
  nose: { u: prince.sniff.left + prince.sniff.width * .16, v: prince.sniff.top + prince.sniff.height * .8 },
  caseTop: { u: 67, v: sampleCase.top + sampleCase.height * .2 },
  boots: { u: marsScene.stages.glaucia.x, v: marsScene.stages.glaucia.y - .5 },
  beacon: { u: beacon.left + beacon.width * .5, v: beacon.top + beacon.height * .06 },
};
const art = (src: string): CSSProperties => ({ backgroundImage: `url(${src})` });
const pose = (actor: "glaucia" | "prince", name: string, box: Box): CSSProperties => {
  const sprite = (actors[actor] as Record<string, { src: string; w: number; feetX: number }>)[name];
  return { ...boxStyle(box), ...art(sprite.src), transformOrigin: `${sprite.feetX / sprite.w * 100}% 100%` };
};

export function MarsScene() {
  return <div className="hero-scene-layer hero-scene-layer--mars" data-paused="true" aria-hidden="true">
    <div className="scene-image-plane mars-plane">
      <canvas className="mars-sky mars-sky--back" />
      <span className="mars-beacon" style={boxStyle(beacon)}><i className="mars-beacon__art" style={art(props["data-beacon"].src)} /><i className="mars-beacon__lamp" /></span>
      <span className="mars-rover" data-rover="idle">
        <i className="mars-rover__idle" style={{ ...boxStyle(rover), ...art(props["rover-idle"].src) }} />
        <i className="mars-rover__scanning" style={{ ...boxStyle(scanning), ...art(props["rover-scanning"].src) }} />
      </span>
      <span className="mars-case" data-case="sealed">
        <i className="mars-case__glow" style={boxStyle(sample)} />
        <i className="mars-case__sealed" style={{ ...boxStyle(sampleCase), ...art(props["sample-case-sealed"].src) }} />
        <i className="mars-case__sample" style={{ ...boxStyle(sample), ...art(props["mineral-sample-large"].src) }} />
      </span>
      {/* Prince and Glaucia: one sprite per pose, anchored on the same feet; blink is an overlay on idle. */}
      <span className="mars-prince">
        {PRINCE_POSES.map((name) => <i key={name} data-actor-pose={name} className={`mars-prince__pose mars-prince__pose--${name}`} style={pose("prince", name, prince[name])} />)}
      </span>
      <span className="mars-crew">
        {GLAUCIA_POSES.map((name) => <i key={name} data-actor-pose={name} className={`mars-crew__pose mars-crew__pose--${name}`} style={pose("glaucia", name, glaucia[name])} />)}
        <i className="mars-crew__blink" style={{ ...boxStyle(glaucia.blink), ...art(actors.glaucia.blink.src) }} />
      </span>
      <span className="mars-console" data-console="idle">
        <i className="mars-console__idle" style={{ ...boxStyle(consoleIdle), ...art(props["analysis-console-idle"].src) }} />
        <i className="mars-console__on" style={{ ...boxStyle(consoleOn), ...art(props["analysis-console-activated"].src) }} />
      </span>
      <canvas className="mars-sky mars-sky--front" />
    </div>
  </div>;
}

type HotLabels = Record<keyof typeof HOTSPOTS, string>;
// Accessible hotspots, above the copy layer; hidden until the motion island wires them up.
export function MarsHotspots({ labels }: { labels: HotLabels }) {
  return <div className="mars-layer">
    <div className="mars-plane mars-plane--hot">
      {(Object.entries(HOTSPOTS) as [keyof HotLabels, Box][]).map(([key, box]) => <button key={key} type="button" className={`mars-hot mars-hot--${key}`} data-hot={key} aria-label={labels[key]} title={labels[key]} style={boxStyle(box)} hidden />)}
    </div>
  </div>;
}
