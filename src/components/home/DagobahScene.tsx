import type { CSSProperties } from "react";
import force from "./yoda-force.json";

// Each character is one SVG pixel; the three silhouettes share one palette.
const rockPalette: Record<string, string> = {
  o: "var(--rock-outline)", d: "var(--rock-dark)", m: "var(--rock-mid)",
  l: "var(--rock-light)", h: "var(--rock-highlight)",
  g: "var(--rock-moss)", G: "var(--rock-moss-light)",
};
const rockShapes = [
  ["....oooo....", "..oohllloo..", ".olllllmmmo.", ".olllmmmmmo.", "olllmmmmddoo", "olGgmmmddddo", "omggmmdddddo", ".ommmmddddo.", ".ommmdddddo.", "..odddddoo..", "...ooooo....", "............"],
  [".....ooo....", "....ohllo...", "...olllmo...", "..olllmmmo..", "..ollmmmmo..", ".olGgmmmddo.", ".omggmmdddo.", ".ommmmddddo.", "..ommmdddo..", "..oddddddo..", "...oooooo...", "............"],
  ["............", "............", "...ooooo....", "..ohlllloo..", ".olllllmmmo.", "ollllmmmmddo", "olGgmmmmdddo", "omggmmmddddo", ".ommmmddddo.", "..oooooooo..", "............", "............"],
];
// Fan out above-left from the palm at (620, 285), in 1024 × 576 image space.
const rockLayers = [
  { depth: "back", rocks: [
    { x: 480, y: 140, size: 22.1, shape: 0 },
    { x: 527, y: 125, size: 26, shape: 1 },
    { x: 572, y: 145, size: 20.8, shape: 2, desktop: true },
    { x: 592, y: 185, size: 23.4, shape: 0, desktop: true },
  ] },
  { depth: "middle", rocks: [
    { x: 510, y: 185, size: 35.1, shape: 2 },
    { x: 550, y: 160, size: 32.5, shape: 0 },
    { x: 578, y: 212, size: 31.2, shape: 1, desktop: true },
  ] },
  { depth: "front", rocks: [
    { x: 545, y: 228, size: 49.4, shape: 0 },
    { x: 593, y: 248, size: 41.6, shape: 1 },
    { x: 485, y: 237, size: 45.5, shape: 2, desktop: true },
  ] },
];
const fireflies = [[70, 40], [78, 30], [88, 52], [64, 62], [92, 22], [83, 70], [56, 48], [96, 58]];

// X-wing raised from the swamp, nose left; same one-character-per-pixel convention as the rocks.
const xwingPalette: Record<string, string> = {
  o: "var(--xwing-outline)", l: "var(--xwing-light)", m: "var(--xwing-mid)", d: "var(--xwing-dark)",
  r: "var(--energy-red)", c: "var(--xwing-canopy)", w: "var(--color-white)", e: "var(--color-accent-300)",
  g: "var(--rock-moss)", G: "var(--rock-moss-light)",
};
const xwing = [
  "................................................",
  "..............ooooooooooooooooooooooooo.........",
  "............oommmmmmmmmmmmmmmmmmmmmmmmmooo......",
  "...........oddlllllllllllGGllllllllllllllmo.....",
  "............ooooooooooooooGooorrrrlllllllo......",
  "..........................o...ommmmmmmmmo.......",
  ".............................olllllllllo........",
  "...................ooooo....omggmmmmmmo.........",
  "..................ocwccco..ollllllllloooooooo...",
  "......oooooooooooocccccccooooooooooodmmmmmmmdo..",
  "...ooommllllllllllllllllllglllllllllddddddddeeo.",
  "..odmmmmmmmmrrrrrmmmmmmmmmmmrrrrrrmmddddddddeeo.",
  "...ooddddggGmmmgmmmmmmggGmmGmmmmmmmmddddddddeeo.",
  ".....oooooGoooooooooooooGoooooooooggdddddddddo..",
  "..........o.............o..ommmmmmmmmoooooooo...",
  "............................oddddgddddo.........",
  ".............................ommGmmmmmmo........",
  "..............................oddddggdddo.......",
  "............oooooooooooooooooorrrrmmmGmmmo......",
  "...........oddmmmmGmmmmmmmmmmmmmmmmmmmmmmdo.....",
  "............ooddddddggddddddddddddddddgooo......",
  "..............oooooooGoooooooooooooooGo.........",
];
// Horizontal runs of one colour keep the sprite to a few dozen rects.
const xwingRuns = xwing.flatMap((row, y) => [...row.matchAll(/([^.])\1*/g)].map((match) => ({ x: match.index, y, width: match[0].length, pixel: match[1] })));
const pct = (value: number) => `${value}%`;

export function DagobahScene() {
  return <div className="hero-scene-layer hero-scene-layer--dagobah" data-paused="true" aria-hidden="true">
    <div className="scene-image-plane">
      <span className="force-glow" style={{ left: pct(force.palms[0].x), top: pct(force.palms[0].y) }}><span className="force-current" /></span>
      {/* Yoda (AI-generated sprite layers): calm at rest, fully charged while the scene is held. */}
      <div className="yoda-force" style={{ left: pct(force.box.left), top: pct(force.box.top), width: pct(force.box.width), height: pct(force.box.height) }}>
        <span className="yoda-force__aura" />
        <span className="yoda-force__part yoda-force__body" />
        <span className="yoda-force__part yoda-force__robe" style={{ transformOrigin: force.origins.robe }} />
        <span className="yoda-force__part yoda-force__ear yoda-force__ear--left" style={{ transformOrigin: force.origins.earLeft }} />
        <span className="yoda-force__part yoda-force__ear yoda-force__ear--right" style={{ transformOrigin: force.origins.earRight }} />
      </div>
      {force.palms.map(({ x, y }, index) => <span className="force-palm force-palm--pose" key={index} style={{ left: pct(x), top: pct(y) }} />)}
      <div className="force-swamp">
        <svg className="swamp-xwing" viewBox="0 0 48 22" shapeRendering="crispEdges" focusable="false">
          {xwingRuns.map(({ x, y, width, pixel }) => <rect key={`${x}-${y}`} x={x} y={y} width={width} height="1" fill={xwingPalette[pixel]} />)}
        </svg>
      </div>
      <span className="swamp-ripples">{[0, 1, 2].map((ring) => <i key={ring} />)}</span>
      {rockLayers.map(({ depth, rocks }, layerIndex) => <div className={`force-depth force-depth--${depth}`} key={depth}>
        {rocks.map(({ x, y, size, shape, desktop }, index) => <span
          className={`force-rock${desktop ? " force-rock--desktop" : ""}`}
          data-depth={layerIndex + 1}
          key={`${x}-${y}`}
          style={{
            left: `${x / 1024 * 100}%`, top: `${y / 576 * 100}%`, width: `${size / 1024 * 100}%`,
            "--float-duration": `${4.2 + index * .6 + layerIndex * .4}s`,
            "--float-delay": `${-index * 1.3 - layerIndex * .8}s`,
          } as CSSProperties}
        >
          <span className="force-rock__push">
            <svg viewBox="0 0 12 12" shapeRendering="crispEdges" focusable="false">
              {rockShapes[shape].flatMap((row, y) => [...row].map((pixel, x) => pixel === "." ? null :
                <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={rockPalette[pixel]} />))}
            </svg>
          </span>
        </span>)}
      </div>)}
      <div className="dagobah-atmosphere">
        <span className="dagobah-mist dagobah-mist--back" /><span className="dagobah-mist dagobah-mist--front" />
        {fireflies.map(([left, top], index) => <i className="dagobah-firefly" key={index} style={{ left: `${left}%`, top: `${top}%`, "--blink-delay": `${-index * .7}s` } as CSSProperties} />)}
      </div>
      <svg className="dagobah-foreground" viewBox="0 0 1024 576" shapeRendering="crispEdges" focusable="false">
        <path fill="var(--scene-foreground)" d="M1024 576H887v-12h18v-16h14v-20h12v-28h9v-34h7v45h8v22h12v18h13v-44h9v-28h8v-24h7v-27h7v73h7v-36h9v-20h7z" />
        <path fill="var(--scene-foreground-light)" d="M1024 576h-58v-15h-10v-21h-9v-23h-7v-21h6v11h8v17h9v18h11v-36h6v-24h6v-18h6v68h9v-21h8v-16h5z" />
      </svg>
    </div>
  </div>;
}
