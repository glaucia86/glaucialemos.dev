import type { BeyondOrbitCopy } from "@/i18n/beyond-orbit";
import Image from "next/image";
import type { CSSProperties } from "react";
import { SCENES, poseBox } from "@/lib/scenes";
import { ACTORS, STAR, STATIC_FRAME, cablePath, type OrbitActor } from "@/lib/beyond-orbit";
import { BeyondOrbitMotion } from "./BeyondOrbitMotion";
import { JourneyConstellation } from "./JourneyConstellation";

const scene = SCENES["beyond-orbit"];
const { background, actors, ambient } = scene.assets;

// Layers, back to front: ambilight (outside the 16:9 frame), the approved plate with its light currents and rays,
// the journey's constellation and the last star, back canvas (stars, threads, comets), the crew (cables + actors),
// front canvas (dust, sparks, shockwave), the dive canvas and the lens flare. Then vignette, grain, flash, bars.
export function BeyondOrbitScene({ copy }: { copy: BeyondOrbitCopy }) {
  // Copies of the plate for the light effects are CSS backgrounds, so the approved <Image> stays the only LCP candidate.
  const plate = (className: string) => <span className={className} style={{ "--plate": `url(${background.src})` } as CSSProperties} />;
  return <BeyondOrbitMotion skip={copy.skip} hint={copy.starHint}
    overlays={<>
      <span className="beyond-orbit__vignette" aria-hidden="true" />
      <span className="beyond-orbit__grain" aria-hidden="true" />
      <span className="beyond-orbit__flash" aria-hidden="true" />
      <span className="beyond-orbit__bars" aria-hidden="true"><i /><i /></span>
      <div className="beyond-orbit__roll" aria-hidden="true"><div className="beyond-orbit__roll-track" /></div>
    </>}
    ambient={<div className="beyond-orbit__ambient" data-depth="ambient" aria-hidden="true"><Image src={ambient.src} alt="" width={ambient.w} height={ambient.h} unoptimized /></div>}
    finale={<>
      <p className="beyond-orbit__continued" lang="en">{copy.finale}</p>
      <p className="beyond-orbit__postscript">{copy.postscript}</p>
    </>}>
    <svg className="beyond-orbit__filters" aria-hidden="true" focusable="false">
      <filter id="beyond-orbit-red"><feColorMatrix values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
      <filter id="beyond-orbit-cyan"><feColorMatrix values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
    </svg>
    <div className="beyond-orbit__camera">
      <div className="beyond-orbit__layer" data-depth="plate">
        <div className="beyond-orbit__art" role="img" aria-label={copy.sceneAlt}>
          <Image className="beyond-orbit__plate" src={background.src} alt="" width={background.w} height={background.h} priority unoptimized />
          <div className="beyond-orbit__currents" aria-hidden="true">{plate("beyond-orbit__glow")}</div>
          <div className="beyond-orbit__breath" aria-hidden="true">{plate("beyond-orbit__glow")}</div>
          <div className="beyond-orbit__chroma" data-channel="red" aria-hidden="true">{plate("beyond-orbit__glow")}</div>
          <div className="beyond-orbit__chroma" data-channel="cyan" aria-hidden="true">{plate("beyond-orbit__glow")}</div>
          <span className="beyond-orbit__rays" aria-hidden="true" />
        </div>
        <JourneyConstellation copy={copy} />
        <button type="button" className="beyond-orbit__star" aria-label={copy.starAction} aria-controls="epilogue-finale"
          style={{ left: `${STAR.u * 100}%`, top: `${STAR.v * 100}%` }}>
          <span aria-hidden="true">✦</span><i aria-hidden="true" /><i aria-hidden="true" />
        </button>
      </div>
      <canvas className="beyond-orbit__canvas" data-depth="back" data-canvas="back" aria-hidden="true" />
      <div className="beyond-orbit__layer beyond-orbit__crew" data-depth="crew">
        <svg className="beyond-orbit__cables" viewBox="0 0 1600 900" aria-hidden="true" focusable="false">
          {(["glaucia", "prince"] as const).map(actor => <g key={actor}>
            <path className="beyond-orbit__cable-edge" data-cable={actor} d={cablePath(actor, STATIC_FRAME[actor])} />
            <path className="beyond-orbit__cable" data-cable={actor} d={cablePath(actor, STATIC_FRAME[actor])} />
            <path className="beyond-orbit__cable-pulse" data-cable={actor} d={cablePath(actor, STATIC_FRAME[actor])} />
          </g>)}
        </svg>
        {(Object.keys(ACTORS) as OrbitActor[]).map(actor => {
          const stage = ACTORS[actor];
          const sprite = actors[actor]["float-idle"];
          const box = poseBox(scene, actor, "float-idle");
          return <span key={actor} data-orbit-actor={actor} className="beyond-orbit__actor" style={{ left: `${stage.x}%`, top: `${stage.y}%`, width: `${box.width}%`, height: `${box.height}%` }}>
            <span className="beyond-orbit__sprite" style={{
              left: `${(box.left - stage.x) / box.width * 100}%`, top: `${(box.top - stage.y) / box.height * 100}%`,
              backgroundImage: `url(${sprite.src})`, "--sprite": `url(${sprite.src})`, "--face": stage.flip ? -1 : 1,
            } as CSSProperties}><i className="beyond-orbit__sheen" aria-hidden="true" /></span>
            {actor === "prince" && <b className="beyond-orbit__heart" aria-hidden="true" />}
          </span>;
        })}
      </div>
      <canvas className="beyond-orbit__canvas" data-depth="front" data-canvas="front" aria-hidden="true" />
      <canvas className="beyond-orbit__canvas beyond-orbit__jump" data-canvas="jump" aria-hidden="true" />
      <span className="beyond-orbit__flare" aria-hidden="true" style={{ top: `${STAR.v * 100}%` }} />
    </div>
  </BeyondOrbitMotion>;
}
