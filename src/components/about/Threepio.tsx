"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useMotionEnabled } from "@/lib/use-motion";
import { bringIntoView, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import type { EchoCopy } from "@/i18n/echo-base";
import { PixelSprite, THREEPIO, THREEPIO_ARM } from "./sprites";

export const THREEPIO_EVENT = "threepio:say";
export type ThreepioReaction = "doomed" | "maker" | "relief";
const ARM_EVERY = 5;

// The protocol droid: every tap is a new line; the fifth costs him an arm, as in Cloud City.
export function Threepio({ copy, languages }: { copy: EchoCopy["threepio"]; languages: string }) {
  const motion = useMotionEnabled();
  const droid = useRef<HTMLButtonElement>(null);
  const arm = useRef<HTMLSpanElement>(null);
  const taps = useRef(0);
  const [line, setLine] = useState("");
  const [typed, setTyped] = useState("");
  const [flail, setFlail] = useState(false);
  const [armless, setArmless] = useState(false);

  const say = useCallback((text: string, wave = false) => {
    setLine(text); play("blip");
    if (wave) { setFlail(true); setTimeout(() => setFlail(false), 1400); }
  }, []);

  // Typewriter, or the whole line at once when motion is reduced.
  useEffect(() => {
    if (!motion) { setTyped(line); return; }
    let index = 0; setTyped("");
    const id = setInterval(() => { index += 2; setTyped(line.slice(0, index)); if (index >= line.length) clearInterval(id); }, 30);
    return () => clearInterval(id);
  }, [line, motion]);

  const dropArm = useCallback(() => {
    if (armless) return;
    discover("threepio-arm"); setArmless(true); say(copy.armOff, true); play("error");
    if (motion && arm.current) gsap.timeline()
      .to(arm.current, { rotation: 70, duration: .15, ease: "power2.in" })
      .to(arm.current, { y: "190%", x: "-60%", rotation: 160, duration: .5, ease: "bounce.out" });
    setTimeout(() => {
      setArmless(false); say(copy.armOn);
      if (arm.current) gsap.to(arm.current, { x: 0, y: 0, rotation: 0, duration: motion ? .4 : 0, ease: "back.out(2)" });
    }, 3000);
  }, [armless, copy, motion, say]);

  const talk = () => {
    taps.current += 1;
    if (taps.current % ARM_EVERY === 0) { dropArm(); return; }
    const next = copy.lines[(taps.current - 1) % copy.lines.length];
    say(next, next === copy.lines[1]);
  };

  useEffect(() => {
    const react = (event: Event) => { const kind = (event as CustomEvent<ThreepioReaction>).detail; say(copy[kind], kind === "doomed"); };
    addEventListener(THREEPIO_EVENT, react);
    const stop = onEgg("threepio-arm", () => void bringIntoView(droid.current).then(dropArm));
    return () => { removeEventListener(THREEPIO_EVENT, react); stop(); };
  }, [copy, say, dropArm]);

  return <div className="threepio" data-talking={typed && typed !== line ? "true" : undefined} data-flail={flail || undefined} data-armless={armless || undefined}>
    <button ref={droid} type="button" className="threepio__droid" aria-label={copy.label} onClick={talk}>
      <span className="threepio__arm threepio__arm--right"><PixelSprite {...THREEPIO_ARM} /></span>
      <PixelSprite className="threepio__body" {...THREEPIO} />
      <span ref={arm} className="threepio__arm threepio__arm--left"><PixelSprite {...THREEPIO_ARM} /></span>
    </button>
    <div className="threepio__copy">
      <p className="threepio__languages">{languages}</p>
      <p className="threepio__bubble" aria-hidden="true" data-show={line ? "true" : undefined}>{typed}</p>
      <p className="sr-only" aria-live="polite">{line}</p>
    </div>
  </div>;
}
