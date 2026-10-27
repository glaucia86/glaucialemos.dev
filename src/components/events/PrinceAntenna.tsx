"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, CustomWiggle } from "@/lib/gsap";
import { discover, onEgg, bringIntoView } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import { useMotionEnabled } from "@/lib/use-motion";
import type { AtlasCopy } from "@/i18n/atlas";

type Signal = { nome: string; ano: number; fonte: string };
type Props = { radar: string; prince: string; first: Signal; copy: AtlasCopy["prince"] };

// prince-antenna: the dish in "Signals and lights" belongs to Prince. Pressing it, he listens: short beeps decode the oldest
// remote participation on record and the cyan (remote) half of every year column lights up in turn.
export function PrinceAntenna({ radar, prince, first, copy }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "decoding" | "done">("idle");
  const motion = useMotionEnabled();

  const listen = () => {
    const element = root.current;
    if (!element || state === "decoding") return;
    discover("prince-antenna");
    const deck = element.closest(".signals");
    deck?.setAttribute("data-listening", "");
    if (!motion) { setState("done"); return; }
    setState("decoding");
    CustomWiggle.create("antenna-wiggle", { wiggles: 6, type: "easeOut" });
    gsap.fromTo(element.querySelector(".prince-antenna__dish"), { rotation: 0 }, { rotation: 8, duration: .9, ease: "antenna-wiggle", transformOrigin: "50% 90%" });
    gsap.fromTo(element.querySelector(".prince-antenna__prince"), { y: 0 }, { y: -6, duration: .18, yoyo: true, repeat: 3, ease: "power1.out" });
    [0, 220, 440, 700].forEach((delay, index) => setTimeout(() => play(index === 3 ? "transmission" : "radar", { detune: index * 120 }), delay));
    setTimeout(() => setState("done"), 1400);
  };

  useEffect(() => onEgg("prince-antenna", () => void bringIntoView(root.current).then(listen)));

  return <div className="prince-antenna" ref={root} data-state={state}>
    <button type="button" className="prince-antenna__button" aria-label={copy.antenna} title={copy.antenna} onClick={listen}>
      <i className="prince-antenna__dish" style={{ backgroundImage: `url(${radar})` }} />
      <i className="prince-antenna__prince" style={{ backgroundImage: `url(${prince})` }} />
      <span className="prince-antenna__waves" aria-hidden="true"><i /><i /><i /></span>
    </button>
    <p className="prince-antenna__status" role="status" aria-live="polite">{state === "decoding" ? copy.decoding : ""}</p>
    {state === "done" && <div className="prince-antenna__card">
      <p className="prince-antenna__kicker">{copy.firstSignal} · {first.ano}</p>
      <p className="prince-antenna__title"><a href={first.fonte} target="_blank" rel="noopener noreferrer">{first.nome}<span aria-hidden="true"> ↗</span></a></p>
      <p className="prince-antenna__note">{copy.firstNote}</p>
      <button type="button" onClick={() => { setState("idle"); root.current?.closest(".signals")?.removeAttribute("data-listening"); }}>{copy.close}</button>
    </div>}
  </div>;
}
