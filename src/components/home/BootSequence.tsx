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
// Marte's six-wheeled rover with its sensor mast, 15 × 15 pixels.
const ROVER_CREST = pixels([
  "..........###..", "..........#.#..", "..........###..", "...........#...", ".#.........#...", ".#############.", ".#...#...#...#.", ".#############.",
  "..###########..", "...#...#...#...", "..###.###.###..", "..#.#.#.#.#.#..", "..###.###.###..", "...............", "###############",
]);
// Observatory dome under a four-point star, 15 × 15 pixels.
const OBSERVATORY_CREST = pixels([
  ".......#.......", "......###......", "....#######....", "......###......", ".......#.......", "...............", ".....#####.....", "...#########...",
  "..##.####..##..", ".###.#####.###.", ".#############.", ".#############.", ".##.##...##.##.", ".##.##...##.##.", "###############",
]);
// Lúmina's open book with a crystal rising from its pages, 15 × 15 pixels.
const BOOK_CREST = pixels([
  ".......#.......", "......###......", ".....#####.....", "......###......", ".......#.......", "...............", "..###.....###..", ".#...##.##...#.",
  "#.##...#...##.#", "#....#.#.#....#", "#.##...#...##.#", "#....#.#.#....#", "#.##...#...##.#", ".####..#..####.", "......###......",
]);
// The Atlas: a globe with meridians inside a tilted orbit and its satellite, 15 × 15 pixels.
const GLOBE_CREST = pixels([
  ".............#.", "......###...###", "....#######..#.", "...##.#.#.##...", "..#.#.#.#.#.#..", ".#############.", "#.#.#.#.#.#.#.#",
  ".#############.", "#.#.#.#.#.#.#.#", ".#############.", "..#.#.#.#.#.#..", "...##.#.#.##...", ".#..#######....", "###...###......", ".#.............",
]);
// A stem with two leaves encircled by an orbital ring.
const GARDEN_CREST = pixels([
  ".......#.......", "...#...#...#...", "..#....#....#..", ".#.....#.....#.", "#..##..#..##..#", "#..###.#.###..#", "#...#######...#", "#....#####....#",
  "#......#......#", ".#.....#.....#.", "..#....#....#..", "...#...#...#...", "....#######....", ".......#.......", ".....#####.....",
]);
const CRESTS: Partial<Record<BootVariant, number[][]>> = { niveora: ICE_CREST, mars: ROVER_CREST, observatory: OBSERVATORY_CREST, lumina: BOOK_CREST, aurelia: GARDEN_CREST, atlas: GLOBE_CREST };

type BootVariant = "niveora" | "mars" | "observatory" | "lumina" | "aurelia" | "atlas";
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
    // SmoothScroll turns lag smoothing off for Lenis. While the intro plays (Lenis is stopped), keep it on, so a heavy page
    // mounting underneath cannot make GSAP jump to the end of the intro; restore it when the intro closes.
    gsap.ticker.lagSmoothing(500, 33);
    const restoreLag = () => gsap.ticker.lagSmoothing(0);
    const q = gsap.utils.selector(overlay);
    let closing = false;
    const close = (fast = false) => {
      if (closing) return; closing = true;
      main.kill();
      gsap.timeline({ onComplete: () => { restoreLag(); finish(); window.__lenis?.start(); } })
        .to(q(".boot__screen"), { scaleY: .006, duration: fast ? .12 : .2, ease: "power4.in" })
        .to(q(".boot__screen"), { scaleX: 0, duration: fast ? .1 : .16, ease: "power4.in" })
        .to(q(".boot__flash"), { autoAlpha: 1, duration: .05 }, "<")
        .to(overlay, { autoAlpha: 0, duration: .25, ease: "power2.out" });
    };
    // Paused until the page underneath has mounted (two frames), then it plays from the start.
    const main = gsap.timeline({ paused: true, delay: .15, onComplete: () => close() });
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => main.play()); });
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
    return () => { cancelAnimationFrame(frame); removeEventListener("keydown", onKey); main.kill(); restoreLag(); gsap.set([overlay, ...q(".boot__screen, .boot__line, .boot__block, .boot__granted, .boot__flash, .boot__crest-px")], { clearProps: "all" }); release(); };
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
