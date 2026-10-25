import type { CSSProperties } from "react";
import { SCENES, boxStyle, poseBox, propBox, type Box } from "@/lib/scenes";
import { GLAUCIA_POSES as POSES, PRINCE_POSES } from "./niveora-acting";

// Nivéora: every layer sits on the 16:9 plate (percent), with the plate's cover projection anchored on the snow.
export const niveoraScene = SCENES.niveora;
const { props, actors } = niveoraScene.assets;
const glaucia = Object.fromEntries([...POSES, "blink"].map((pose) => [pose, poseBox(niveoraScene, "glaucia", pose)])) as Record<(typeof POSES)[number] | "blink", Box>;
const prince = Object.fromEntries(PRINCE_POSES.map((pose) => [pose, poseBox(niveoraScene, "prince", pose)])) as Record<(typeof PRINCE_POSES)[number], Box>;
const idle = glaucia.idle;
// A stable hover target: changing the tail pose must never move the boundary underneath the pointer.
const princeIdleBoxes = [prince.stand, prince["wag-a"], prince["wag-b"]];
const princeHitLeft = Math.min(...princeIdleBoxes.map((box) => box.left));
const princeHitTop = Math.min(...princeIdleBoxes.map((box) => box.top));
const princeHit = {
  left: princeHitLeft, top: princeHitTop,
  width: Math.max(...princeIdleBoxes.map((box) => box.left + box.width)) - princeHitLeft,
  height: Math.max(...princeIdleBoxes.map((box) => box.top + box.height)) - princeHitTop,
};

const CAPSULE_AT = { x: 64, bottom: 80 };
const capsuleSealed = propBox(niveoraScene, "memory-capsule-sealed", CAPSULE_AT.x, CAPSULE_AT.bottom);
const capsuleOpen = propBox(niveoraScene, "memory-capsule-open", CAPSULE_AT.x, CAPSULE_AT.bottom);
const crystal = propBox(niveoraScene, "prismatic-ice-specimen", 69, 75.5);
const station = propBox(niveoraScene, "aurora-beacon", 95.5, 90);
// Keep Prince's whole route on the upper snow shelf, away from the foreground crevasse.
// From his front paws to the buried capsule (centre x, bottom y in plate percent).
export const TRACKS = [[73.8, 80], [72.3, 79.4], [70.8, 80], [69.3, 79.4], [67.8, 80], [66.3, 79.4]] as const;
const track = (index: number) => propBox(niveoraScene, `snow-pawprint-0${index + 1}`, TRACKS[index][0], TRACKS[index][1]);

export const HOTSPOTS = {
  glaucia: { left: idle.left + idle.width * .18, top: idle.top, width: idle.width * .64, height: idle.height * .62 },
  prince: princeHit,
  crystal,
  station,
  capsule: capsuleSealed,
} as Record<string, Box>;

// Anchors (plate percent) shared with the motion island.
export const SPOTS = {
  princeFeet: { u: prince.stand.left + prince.stand.width * .5, v: prince.stand.top + prince.stand.height * .96 },
  princeNose: { u: prince.sniff.left + prince.sniff.width * .08, v: prince.sniff.top + prince.sniff.height * .42 },
  capsuleTop: { u: CAPSULE_AT.x, v: capsuleSealed.top + capsuleSealed.height * .2 },
  capsuleMouth: { u: CAPSULE_AT.x, v: capsuleOpen.top + capsuleOpen.height * .45 },
  hands: { u: glaucia.capsule.left + glaucia.capsule.width * .16, v: glaucia.capsule.top + glaucia.capsule.height * .48 },
  mouth: { u: idle.left + idle.width * .44, v: idle.top + idle.height * .155 },
  crystalTip: { u: crystal.left + crystal.width * .5, v: crystal.top + crystal.height * .12 },
  sky: { u: 82, v: 9 },
  station: { u: station.left + station.width * .5, v: station.top + station.height * .08 },
  tracks: TRACKS.map(([u, v]) => ({ u, v: v - .8 })),
};
const art = (src: string): CSSProperties => ({ backgroundImage: `url(${src})` });

export function NiveoraScene() {
  return <div className="hero-scene-layer hero-scene-layer--niveora" data-paused="true" aria-hidden="true">
    <div className="scene-image-plane niveora-plane">
      <canvas className="niveora-sky niveora-sky--back" />
      <span className="niveora-crystal" style={boxStyle(crystal)}><i className="niveora-crystal__art" style={art(props["prismatic-ice-specimen"].src)} /></span>
      <span className="niveora-station" style={boxStyle(station)}><i className="niveora-station__art" style={art(props["aurora-beacon"].src)} /><i className="niveora-station__lamp" /></span>
      {TRACKS.map((_, index) => <i key={index} className="niveora-track" data-track={index} style={{ ...boxStyle(track(index)), ...art(props[`snow-pawprint-0${index + 1}` as keyof typeof props].src), "--tilt": `${index % 2 ? 8 : -8}deg` } as CSSProperties} />)}
      <span className="niveora-capsule" data-capsule="hidden">
        <i className="niveora-capsule__glow" style={boxStyle(capsuleOpen)} />
        <i className="niveora-capsule__sealed" style={{ ...boxStyle(capsuleSealed), ...art(props["memory-capsule-sealed"].src) }} />
        <i className="niveora-capsule__open" style={{ ...boxStyle(capsuleOpen), ...art(props["memory-capsule-open"].src) }} />
      </span>
      {/* Prince and Glaucia: one sprite per pose, anchored on the same feet; blink is an overlay on idle. */}
      <span className="niveora-prince">
        {PRINCE_POSES.map((pose) => <i key={pose} data-actor-pose={pose} className={`niveora-prince__pose niveora-prince__pose--${pose}`} style={{ ...boxStyle(prince[pose]), ...art(actors.prince[pose].src), transformOrigin: `${actors.prince[pose].feetX / actors.prince[pose].w * 100}% 100%` }} />)}
        {/* Snow that settles on his head and jacket during the blizzard. */}
        <i className="niveora-snowcap niveora-snowcap--prince" style={boxStyle(prince.stand)} />
      </span>
      <span className="niveora-crew">
        {POSES.map((pose) => <i key={pose} data-actor-pose={pose} className={`niveora-crew__pose niveora-crew__pose--${pose}`} style={{ ...boxStyle(glaucia[pose]), ...art(actors.glaucia[pose].src) }} />)}
        <i className="niveora-crew__blink" style={{ ...boxStyle(glaucia.blink), ...art(actors.glaucia.blink.src) }} />
        <i className="niveora-snowcap niveora-snowcap--glaucia" style={boxStyle(idle)} />
      </span>
      <canvas className="niveora-sky niveora-sky--front" />
    </div>
  </div>;
}

type HotLabels = Record<"glaucia" | "prince" | "crystal" | "station" | "capsule", string>;
// Accessible hotspots, above the copy layer; hidden until the motion island wires them up.
export function NiveoraHotspots({ labels }: { labels: HotLabels }) {
  return <div className="niveora-layer">
    <div className="niveora-plane niveora-plane--hot">
      {Object.entries(HOTSPOTS).map(([key, box]) => <button key={key} type="button" className={`niveora-hot niveora-hot--${key}`} data-hot={key} aria-label={labels[key as keyof HotLabels]} title={labels[key as keyof HotLabels]} style={boxStyle(box)} hidden />)}
    </div>
  </div>;
}
