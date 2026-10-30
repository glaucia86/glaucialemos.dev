import { MobileEggLayer } from "@/components/mobile/MobileEggLayer";
import type { CSSProperties } from "react";
import { SCENES, boxStyle, poseBox, type Box } from "@/lib/scenes";

// Atlas das Conexões: every layer sits on the 16:9 plate (percent), like Lúmina. Approved composition I: Glaucia and
// Prince to the right of the projection pedestal, facing the visitor, the hologram floating over the pedestal.
export const atlasScene = SCENES["earth-orbit"];
const { props, actors } = atlasScene.assets;

// Approved poses of GE-GL-05/05B and GE-DOG-05/05B/05C. The blink was drawn on the hand-on-hip pose, Glaucia's rest pose.
// Approved composition I: both face the visitor at rest. Prince stands right of the hologram (front view, no helmet, the
// only front view of GE-DOG-05) and turns his side view — which looks left, at the hologram — when he acts.
// Glaucia alternates her front views and turns her profile (also looking left: at Prince and the hologram).
export const GLAUCIA_POSES = ["idle", "hip", "profile", "operate", "trace", "cheer", "tablet"] as const;
export const PRINCE_POSES = ["front", "stand", "paw", "wag", "listen", "leap", "side"] as const;
export type GlauciaPose = (typeof GLAUCIA_POSES)[number];
export type PrincePose = (typeof PRINCE_POSES)[number];

const glaucia = Object.fromEntries([...GLAUCIA_POSES, "blink"].map((pose) => [pose, poseBox(atlasScene, "glaucia", pose)])) as Record<GlauciaPose | "blink", Box>;
const prince = Object.fromEntries(PRINCE_POSES.map((pose) => [pose, poseBox(atlasScene, "prince", pose)])) as Record<PrincePose, Box>;

const W = atlasScene.assets.background.w; const H = atlasScene.assets.background.h;
// A prop centred on a plate point (percent), at its layout scale.
const centred = (prop: keyof typeof props, x: number, y: number): Box => {
  const sprite = props[prop]; const scale = atlasScene.propScale[prop] ?? 1;
  const width = sprite.w * scale / W * 100; const height = sprite.h * scale / H * 100;
  return { left: x - width / 2, top: y - height / 2, width, height };
};

// The hologram floats over the plate's empty projection pedestal (centre 75.5 %, top of the disc at ~74 %).
export const PEDESTAL = { x: 75.5, y: 74.5 };
const HOLO_SIZE = 18; // percent of the plate width
export const HOLO: Box = { left: PEDESTAL.x - HOLO_SIZE / 2, top: 58 - HOLO_SIZE * W / H / 2, width: HOLO_SIZE, height: HOLO_SIZE * W / H };
// The navigation orb hovers between the hologram and Prince, at his eye line.
export const ORB_AT = { x: 79.5, y: 64.5 };
const orbIdle = centred("orb-navigation-idle", ORB_AT.x, ORB_AT.y);
const orbActive = centred("orb-navigation-active", ORB_AT.x, ORB_AT.y - 1.5);

const union = (boxes: Box[]): Box => {
  const left = Math.min(...boxes.map((box) => box.left)); const top = Math.min(...boxes.map((box) => box.top));
  return { left, top, width: Math.max(...boxes.map((box) => box.left + box.width)) - left, height: Math.max(...boxes.map((box) => box.top + box.height)) - top };
};
const idle = glaucia.idle;
const inset = (box: Box, k: number): Box => ({ left: box.left + box.width * k, top: box.top + box.height * k, width: box.width * (1 - 2 * k), height: box.height * (1 - 2 * k) });

export const HOTSPOTS = {
  glaucia: { left: idle.left + idle.width * .12, top: idle.top, width: idle.width * .76, height: idle.height * .7 },
  holo: inset(HOLO, .14),
  prince: union([prince.front, prince.stand]),
  orb: union([orbIdle, orbActive]),
} as Record<"glaucia" | "holo" | "prince" | "orb", Box>;

// Anchors (plate percent) shared with the motion island and the pixel engine.
export const SPOTS = {
  holo: { u: HOLO.left + HOLO.width / 2, v: HOLO.top + HOLO.height / 2 },
  holoRadius: HOLO.width / 2,
  pedestal: { u: PEDESTAL.x, v: PEDESTAL.y },
  orb: { u: ORB_AT.x, v: ORB_AT.y },
  // Prince faces left in his side view: the helmet's front, at a third of the sprite's height.
  nose: { u: prince.side.left + prince.side.width * .1, v: prince.side.top + prince.side.height * .35 },
  hand: { u: glaucia.profile.left + glaucia.profile.width * .2, v: glaucia.profile.top + glaucia.profile.height * .42 },
};

const art = (src: string): CSSProperties => ({ backgroundImage: `url(${src})` });
const pose = (actor: "glaucia" | "prince", name: string, box: Box): CSSProperties => {
  const sprite = (actors[actor] as Record<string, { src: string; w: number; feetX: number }>)[name];
  return { ...boxStyle(box), ...art(sprite.src), transformOrigin: `${sprite.feetX / sprite.w * 100}% 100%` };
};

export function AtlasScene({ holoLabel }: { holoLabel: string }) {
  return <><MobileEggLayer world="events" projection="cover" /><div className="hero-scene-layer hero-scene-layer--atlas" data-paused="true" aria-hidden="true">
    <div className="atlas-plane">
      <canvas className="atlas-sky atlas-sky--back" />
      {/* The projection beam rising from the pedestal, and the hologram it carries. */}
      <span className="atlas-beam" style={{ left: `${HOLO.left + HOLO.width * .18}%`, width: `${HOLO.width * .64}%`, top: `${HOLO.top + HOLO.height * .5}%`, height: `${PEDESTAL.y - HOLO.top - HOLO.height * .5}%` }} />
      <span className="atlas-holo" data-holo="idle" style={boxStyle(HOLO)} title={holoLabel}>
        <canvas className="atlas-holo__globe" />
        <i className="atlas-holo__ring" />
        <i className="atlas-holo__scan" />
      </span>
      <span className="atlas-prince">
        {PRINCE_POSES.map((name) => <i key={name} data-actor-pose={name} className={`atlas-prince__pose atlas-prince__pose--${name}`} style={pose("prince", name, prince[name])} />)}
      </span>
      <span className="atlas-orb" data-orb="idle">
        <i className="atlas-orb__glow" style={boxStyle(orbActive)} />
        <i className="atlas-orb__idle" style={{ ...boxStyle(orbIdle), ...art(props["orb-navigation-idle"].src) }} />
        <i className="atlas-orb__active" style={{ ...boxStyle(orbActive), ...art(props["orb-navigation-active"].src) }} />
      </span>
      <span className="atlas-crew">
        {GLAUCIA_POSES.map((name) => <i key={name} data-actor-pose={name} className={`atlas-crew__pose atlas-crew__pose--${name}`} style={pose("glaucia", name, glaucia[name])} />)}
        <i className="atlas-crew__blink" style={pose("glaucia", "blink", glaucia.blink)} />
      </span>
      <canvas className="atlas-sky atlas-sky--front" />
    </div>
  </div></>;
}

type HotLabels = Record<keyof typeof HOTSPOTS, string>;
// Accessible hotspots, above the copy layer; hidden until the motion island wires them up.
// The runaway satellite flies across the window's sky (plate percent); AtlasMotion animates it and catches it.
export function AtlasHotspots({ labels, satellite }: { labels: HotLabels; satellite: string }) {
  return <div className="atlas-layer">
    <div className="atlas-plane atlas-plane--hot">
      <button type="button" className="atlas-satellite" aria-label={satellite} title={satellite} hidden>
        <svg viewBox="0 0 16 16" focusable="false" shapeRendering="crispEdges" aria-hidden="true"><path fill="#205fad" d="M0 6h5v4H0zM11 6h5v4h-5z" /><path fill="#4bdfff" d="M1 7h1v2H1zM3 7h1v2H3zM12 7h1v2h-1zM14 7h1v2h-1z" /><path fill="#dbe7f5" d="M6 5h4v6H6z" /><path fill="#f7c36c" d="M7 2h2v3H7zM7 11h2v1H7z" /><path fill="#071022" d="M7 7h2v2H7z" /></svg>
      </button>
      {(Object.entries(HOTSPOTS) as [keyof HotLabels, Box][]).map(([key, box]) => <button key={key} type="button" className={`atlas-hot atlas-hot--${key}`} data-hot={key} aria-label={labels[key]} title={labels[key]} style={boxStyle(box)} hidden />)}
    </div>
  </div>;
}
