"use client";

import { useEffect, useRef } from "react";
import { gsap, SCRAMBLE_CHARS } from "@/lib/gsap";
import { finishBoot } from "@/lib/boot";
import { play } from "@/lib/sfx";

const BLOCKS = 24;
let mounted = 0;

// Visible only when the inline boot script marked <html data-boot="pending">.
export function BootSequence({ lines, granted, skip, label }: { lines: string[]; granted: string; skip: string; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const skipNow = useRef<() => void>(() => {});
  useEffect(() => {
    const overlay = root.current;
    mounted++;
    const release = () => { mounted--; setTimeout(() => { if (!mounted && document.documentElement.dataset.boot === "pending") { finishBoot(); window.__lenis?.start(); } }, 60); };
    if (!overlay || document.documentElement.dataset.boot !== "pending") return release;
    window.__lenis?.stop();
    const q = gsap.utils.selector(overlay);
    let closing = false;
    const close = (fast = false) => {
      if (closing) return; closing = true;
      main.kill();
      gsap.timeline({ onComplete: () => { finishBoot(); window.__lenis?.start(); } })
        .to(q(".boot__screen"), { scaleY: .006, duration: fast ? .12 : .2, ease: "power4.in" })
        .to(q(".boot__screen"), { scaleX: 0, duration: fast ? .1 : .16, ease: "power4.in" })
        .to(q(".boot__flash"), { autoAlpha: 1, duration: .05 }, "<")
        .to(overlay, { autoAlpha: 0, duration: .25, ease: "power2.out" });
    };
    const main = gsap.timeline({ delay: .15, onComplete: () => close() });
    main.call(() => play("boot"));
    q(".boot__line").forEach((line, index) => {
      main.fromTo(line, { autoAlpha: 0 }, { autoAlpha: 1, duration: .01 }, index ? ">-.02" : 0)
        .to(line, { duration: .3, scrambleText: { text: lines[index], chars: SCRAMBLE_CHARS, speed: 1, revealDelay: .05 }, onStart: () => play("key") });
    });
    main.to(q(".boot__block"), { autoAlpha: 1, duration: .01, stagger: .014, ease: "none" }, ">-.1")
      .to(q(".boot__granted"), { autoAlpha: 1, duration: .01, onStart: () => play("granted") })
      .to(q(".boot__granted"), { duration: .2, scrambleText: { text: granted, chars: SCRAMBLE_CHARS, speed: 1 } }, "<")
      .to({}, { duration: .25 });
    skipNow.current = () => close(true);
    const onKey = (event: KeyboardEvent) => { if (event.key !== "Tab") close(true); };
    addEventListener("keydown", onKey);
    return () => { removeEventListener("keydown", onKey); main.kill(); gsap.set([overlay, q(".boot__screen"), q(".boot__line"), q(".boot__block"), q(".boot__granted"), q(".boot__flash")], { clearProps: "all" }); release(); };
  }, [lines, granted]);

  return <div ref={root} className="boot" role="presentation" onClick={() => skipNow.current()}>
    <div className="boot__screen">
      <div className="boot__frame" aria-hidden="true">
        <p className="boot__brand">GL-OS <span>{"// HOLONET TERMINAL"}</span></p>
        <ol className="boot__log">{lines.map((_, index) => <li className="boot__line" key={index}>{"\u00a0"}</li>)}</ol>
        <div className="boot__bar">{Array.from({ length: BLOCKS }, (_, index) => <i className="boot__block" key={index} />)}</div>
        <p className="boot__granted">{"\u00a0"}</p>
      </div>
      <button type="button" className="boot__skip" aria-label={label + " — " + skip}>{skip} <kbd>ESC</kbd></button>
    </div>
    <span className="boot__flash" aria-hidden="true" />
  </div>;
}
