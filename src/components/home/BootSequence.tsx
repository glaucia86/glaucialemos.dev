"use client";

import { useEffect, useRef } from "react";
import { gsap, SCRAMBLE_CHARS } from "@/lib/gsap";
import { BOOT_KEY, bootSeen, finishBoot } from "@/lib/boot";
import { motionAllowed } from "@/lib/use-motion";
import { play } from "@/lib/sfx";

const BLOCKS = 24;
let mounted = 0;
const pixels = (rows: string[]) => rows.flatMap((row, y) => [...row].flatMap((pixel, x) => pixel === "#" ? [[x, y]] : []));
// Nivéora's ice crystal, 15 × 15 pixels.
const ICE_CREST = pixels([
  ".......#.......", "....#..#..#....", ".....#.#.#.....", "..#...###...#..", "...#..###..#...", "....#.###.#....", ".#...#####...#.", "#######.#######",
  ".#...#####...#.", "....#.###.#....", "...#..###..#...", "..#...###...#..", ".....#.#.#.....", "....#..#..#....", ".......#.......",
]);
// R2-D2's dome and body, 15 × 15 pixels.
const R2_CREST = pixels([
  "....#######....", "..###########..", ".####...######.", ".####.#.######.", "###############", "#.#.#.#.#.#.#.#", "###############", ".#############.",
  ".##.#######.##.", ".##.#.....#.##.", ".##.#.###.#.##.", ".##.#.....#.##.", ".##.#######.##.", ".###.......###.", "###.........###",
]);
// Observatory dome under a four-point star, 15 × 15 pixels.
const OBSERVATORY_CREST = pixels([
  ".......#.......", "......###......", "....#######....", "......###......", ".......#.......", "...............", ".....#####.....", "...#########...",
  "..##.####..##..", ".###.#####.###.", ".#############.", ".#############.", ".##.##...##.##.", ".##.##...##.##.", "###############",
]);
const CRESTS: Partial<Record<BootVariant, number[][]>> = { niveora: ICE_CREST, astromech: R2_CREST, observatory: OBSERVATORY_CREST };

type BootVariant = "niveora" | "astromech" | "observatory";
type BootProps = { lines: string[]; granted: string; skip: string; label: string; storageKey?: string; brand?: string; variant?: BootVariant; armOnNavigation?: boolean };

// Visible only when the inline boot script marked <html data-boot="pending">.
// armOnNavigation also opens it after a client-side navigation, when inline scripts do not run.
export function BootSequence({ lines, granted, skip, label, storageKey = BOOT_KEY, brand = "// GALÁXIA ENCANTADA", variant = "observatory", armOnNavigation = false }: BootProps) {
  const root = useRef<HTMLDivElement>(null);
  const skipNow = useRef<() => void>(() => {});
  useEffect(() => {
    const overlay = root.current;
    mounted++;
    const finish = () => finishBoot(storageKey);
    const release = () => { mounted--; setTimeout(() => { if (!mounted && document.documentElement.dataset.boot === "pending") { finish(); window.__lenis?.start(); } }, 60); };
    if (armOnNavigation && document.documentElement.dataset.boot !== "pending" && !bootSeen(storageKey) && motionAllowed()) document.documentElement.dataset.boot = "pending";
    if (!overlay || document.documentElement.dataset.boot !== "pending") return release;
    window.__lenis?.stop();
    const q = gsap.utils.selector(overlay);
    let closing = false;
    const close = (fast = false) => {
      if (closing) return; closing = true;
      main.kill();
      gsap.timeline({ onComplete: () => { finish(); window.__lenis?.start(); } })
        .to(q(".boot__screen"), { scaleY: .006, duration: fast ? .12 : .2, ease: "power4.in" })
        .to(q(".boot__screen"), { scaleX: 0, duration: fast ? .1 : .16, ease: "power4.in" })
        .to(q(".boot__flash"), { autoAlpha: 1, duration: .05 }, "<")
        .to(overlay, { autoAlpha: 0, duration: .25, ease: "power2.out" });
    };
    const main = gsap.timeline({ delay: .15, onComplete: () => close() });
    main.call(() => play("boot"));
    if (CRESTS[variant]) main.to(q(".boot__crest-px"), { autoAlpha: 1, duration: .01, stagger: { each: .006, from: "random" } }, 0);
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
    return () => { removeEventListener("keydown", onKey); main.kill(); gsap.set([overlay, ...q(".boot__screen, .boot__line, .boot__block, .boot__granted, .boot__flash, .boot__crest-px")], { clearProps: "all" }); release(); };
  }, [lines, granted, storageKey, armOnNavigation, variant]);

  return <div ref={root} className={`boot boot--${variant}`} role="presentation" onClick={() => skipNow.current()}>
    <div className="boot__screen">
      <div className="boot__frame" aria-hidden="true">
        {CRESTS[variant] && <svg className="boot__crest" viewBox="0 0 16 16" shapeRendering="crispEdges" focusable="false">{CRESTS[variant].map(([x, y], index) => <rect className="boot__crest-px" key={index} x={x} y={y} width="1" height="1" />)}</svg>}
        <p className="boot__brand">GL-OS <span>{brand}</span></p>
        <ol className="boot__log">{lines.map((_, index) => <li className="boot__line" key={index}>{"\u00a0"}</li>)}</ol>
        <div className="boot__bar">{Array.from({ length: BLOCKS }, (_, index) => <i className="boot__block" key={index} />)}</div>
        <p className="boot__granted">{"\u00a0"}</p>
      </div>
      <button type="button" className="boot__skip" aria-label={label + " — " + skip}>{skip} <kbd>ESC</kbd></button>
    </div>
    <span className="boot__flash" aria-hidden="true" />
  </div>;
}
