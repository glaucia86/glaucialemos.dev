import type { CSSProperties } from "react";
import { SceneMotion } from "./SceneMotion";

type Scene = "dagobah" | "hoth" | "tatooine" | "kashyyyk" | "nevarro" | "bespin" | "death-star";

const sceneByImage: Record<string, Scene> = {
  "/pixel/home-yoda.jpg": "dagobah",
  "/pixel/sobre-leia.jpg": "hoth",
  "/pixel/projetos-r2d2.jpg": "tatooine",
  "/pixel/conteudo-chewbacca.jpg": "kashyyyk",
  "/pixel/eventos-grogu.jpg": "nevarro",
  "/pixel/servicos-vader.jpg": "bespin",
  "/pixel/404-stormtrooper.jpg": "death-star",
};

const particles = (className: string, count: number) =>
  Array.from({ length: count }, (_, index) => <i className={className} key={index} />);

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
// The leftmost rock stays beyond x=430 even at maximum drift and rotation.
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

function Dagobah() {
  return <div className="scene-image-plane">
    <div className="dagobah-light"><i /><i /><i /></div>
    <div className="dagobah-mist dagobah-mist--far" />
    <div className="dagobah-mist dagobah-mist--near" />
    <div className="dagobah-spores">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{
      left: `${44 + (i * 17 % 51)}%`, top: `${16 + (i * 23 % 70)}%`,
      "--delay": `${-i * 1.7}s`, "--duration": `${7 + i % 6}s`,
    } as CSSProperties} />)}</div>
    <div className="force-field"><i /><i /><i /></div>
    <div className="swamp-ripples"><i /><i /><i /></div>
    <span className="force-glow"><span className="force-current" /></span>
    {rockLayers.map(({ depth, rocks }) => <div className={`force-depth force-depth--${depth}`} key={depth}>
      {rocks.map(({ x, y, size, shape, desktop }) => <span
        className={`force-rock${desktop ? " force-rock--desktop" : ""}`}
        key={`${x}-${y}`}
        style={{
          left: `${x / 1024 * 100}%`, top: `${y / 576 * 100}%`, width: `${size / 1024 * 100}%`,
          "--rock-turn": `${shape === 1 ? -3 : 3}deg`,
        } as CSSProperties}
      >
        <svg viewBox="0 0 12 12" shapeRendering="crispEdges" focusable="false">
          {rockShapes[shape].flatMap((row, y) => [...row].map((pixel, x) => pixel === "." ? null :
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={rockPalette[pixel]} />))}
        </svg>
      </span>)}
    </div>)}
    <svg className="force-debris" viewBox="0 0 1024 576" shapeRendering="crispEdges" focusable="false">
      <g fill="var(--rock-light)">
        <rect x="540" y="226" width="2" height="2" /><rect x="552" y="185" width="1" height="1" />
        <rect x="498" y="142" width="2" height="2" /><rect x="591" y="238" width="1" height="1" />
      </g>
      <g fill="var(--rock-moss)">
        <rect x="568" y="267" width="2" height="2" /><rect x="510" y="175" width="1" height="1" />
        <rect x="605" y="279" width="2" height="2" />
      </g>
    </svg>
  </div>;
}

function Hoth() { return <>{particles("snowflake", 18)}</>; }

function Tatooine() {
  return <>
    <div className="scene-image-plane">
      <span className="twin-sun twin-sun--large" /><span className="twin-sun twin-sun--small" />
      <span className="r2-light" />
    </div>
    {particles("sand-grain", 12)}
  </>;
}

function Kashyyyk() { return <><div className="scene-particles">{particles("falling-leaf", 10)}</div><div className="scene-particles">{particles("firefly", 8)}</div></>; }
function Nevarro() { return <div className="scene-image-plane"><span className="nevarro-hologram-light" /><span className="nevarro-projector-light" /></div>; }
function Bespin() {
  return <>
    <div className="bespin-clouds">{particles("moving-cloud", 4)}</div>
    <div className="scene-image-plane">
      <span className="saber-assembly">
        <span className="saber-blade"><span className="saber-aura" /><span className="saber-core" /></span>
      </span>
    </div>
  </>;
}
function DeathStar() { return <><span className="alarm-light alarm-light--left" /><span className="alarm-light alarm-light--right" /></>; }

const scenes: Record<Scene, () => React.ReactNode> = {
  dagobah: Dagobah, hoth: Hoth, tatooine: Tatooine, kashyyyk: Kashyyyk,
  nevarro: Nevarro, bespin: Bespin, "death-star": DeathStar,
};

export function HeroScene({ image }: { image: string }) {
  const scene = sceneByImage[image];
  if (!scene) return null;
  const Scene = scenes[scene];
  return <SceneMotion className={`hero-scene-layer hero-scene-layer--${scene}`}><Scene /></SceneMotion>;
}
