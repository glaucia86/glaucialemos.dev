"use client";

import { useId, type CSSProperties } from "react";
import type { CameraMotion } from "@/lib/spatial-motion";

type Scene = "dagobah" | "hoth" | "tatooine" | "kashyyyk" | "nevarro" | "bespin" | "death-star";

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
// Coordinates use the same 1024 × 576 space as the baked scenes. Keep the
// v4 palette and silhouettes; three depths now carry eight stones each.
const rockLayers = [
  { depth: "back", rocks: [
    [468, 111, 18], [503, 88, 21], [546, 100, 19], [587, 118, 16],
    [611, 155, 20], [478, 179, 17], [530, 237, 14], [620, 220, 13],
  ] },
  { depth: "middle", rocks: [
    [482, 145, 28], [527, 126, 27], [572, 145, 23], [592, 185, 24],
    [510, 185, 35], [550, 160, 32], [578, 212, 29], [465, 222, 22],
  ] },
  { depth: "front", rocks: [
    [545, 228, 49], [593, 248, 41], [485, 237, 45], [470, 290, 26],
    [524, 301, 33], [576, 322, 27], [609, 295, 22], [494, 343, 20],
  ] },
];

function Dagobah() {
  return <>
    {rockLayers.map(({ depth, rocks }, layerIndex) => <div className={`force-depth force-depth--${depth}`} data-depth={[.35, .65, 1][layerIndex]} key={depth}>
      {rocks.map(([x, y, size], index) => <span className="force-orbit" key={index} style={{
        ...position(x, y, size, size),
        "--float-duration": `${4.2 + index * .37 + layerIndex * .6}s`,
        "--float-delay": `${-index * 1.3 - layerIndex * .8}s`,
        "--burst-x": `${(index % 4 - 1.5) * 12}px`,
        "--hand-x": `${(620 - x - size / 2) / size * 100}%`,
        "--hand-y": `${(294 - y - size / 2) / size * 100}%`,
        "--burst-y": `${-50 - index * 9}px`,
      } as CSSProperties}>
        <span className={`force-rock${layerIndex === 2 && index === 0 ? " force-rock--chosen" : ""}`}><svg viewBox="0 0 12 12" shapeRendering="crispEdges" focusable="false">
          {rockShapes[index % 3].flatMap((row, y) => [...row].map((pixel, x) => pixel === "." ? null :
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={rockPalette[pixel]} />))}
        </svg></span>
      </span>)}
    </div>)}
  </>;
}

function Tatooine() {
  return <>
    <svg className="scene-svg" viewBox="0 0 1024 576" shapeRendering="crispEdges">
      <g className="r2-dome-lights">
        <path className="r2-light r2-light--blue" d="M770 384h8v8h-8z" fill="#b5f9ff" />
        <path className="r2-light r2-light--amber" d="M795 398h9v8h-9z" fill="#ffb74f" />
        <path className="r2-light r2-light--red" d="M776 405h6v4h-6z" fill="#ff604d" />
      </g>
      <g className="r2-beep" fill="none" stroke="#c6faff" strokeWidth="3">
        <path d="M817 376h7v7m-61-14h-7v7" />
        <path d="M830 365h9v11m-88-18h-9v11" />
      </g>
    </svg>
  </>;
}

function Nevarro() {
  return <>
    <div className="hologram-globe"><span className="hologram-map" /></div>
    <div className="force-sparkles">
      {Array.from({ length: 12 }, (_, i) => <span className="force-sparkle" data-particle key={i} style={{
        ...position(666 + (i * 47) % 220, 235 + (i * 31) % 175, i % 3 === 0 ? 8 : 4, i % 3 === 0 ? 8 : 4),
        "--delay": `${-i * .43}s`,
      } as CSSProperties} />)}
    </div>
  </>;
}

function Bespin() {
  return <>
    <span className="saber-assembly">
      <span className="saber-blade"><span className="saber-aura" /><span className="saber-core" /></span>
    </span>
    <svg className="scene-svg vader-panel" viewBox="0 0 1024 576" shapeRendering="crispEdges">
      <path className="vader-led" fill="#f87669" d="M807 361h5v4h-5zM807 368h5v4h-5z" />
      <path className="vader-led vader-led--blue" fill="#90cfff" d="M795 378h5v7h-5z" />
    </svg>
  </>;
}

function Hoth() {
  return <svg className="scene-svg" viewBox="0 0 1024 576" shapeRendering="crispEdges">
    <g className="leia-breath" fill="#d4f5ff"><path d="M765 316h-12v-4h-14v-5h-13v-5h14v3h16v5h9z" /></g>
  </svg>;
}

function Kashyyyk() {
  return <svg className="scene-svg" viewBox="0 0 1024 576" shapeRendering="crispEdges">
    <g className="chewie-roar">
      <path fill="#352216" d="M734 326h20v7h-3v4h-14v-4h-3z" />
      <path fill="#eacba0" d="M738 326h12v3h-12z" />
      <path fill="none" stroke="#eacb8f" strokeWidth="3" d="M709 320h-8v14h8m72-14h8v14h-8m-89-19h-7v24h7m105-24h7v24h-7" />
    </g>
  </svg>;
}

function DeathStar() {
  return <svg className="scene-svg" viewBox="0 0 1024 576" shapeRendering="crispEdges">
    <g className="trooper-question" fill="#cceaff">
      <path d="M877 194h18v4h4v14h-4v4h-5v7h-6v-12h9v-11h-10v5h-6zM884 228h6v6h-6z" />
    </g>
    <path className="trooper-scan" fill="#9be9ff" d="M750 268h58v2h-58z" />
  </svg>;
}

// Traced silhouettes and eye pixels from the original art, never a second
// character illustration. Tiny expansion anchored at the feet covers the
// baked silhouette while the torso breathes, without an exposed cutout hole.
const characters: Record<Scene, {
  name: string; bounds: [number, number, number, number]; outline: string;
  eyes?: [number, number, number, number, number]; lid?: string;
}> = {
  dagobah: { name: "Yoda", bounds: [608, 228, 166, 172],
    outline: "M608 277H619L637 295L658 294L664 282L641 261V254H665L682 235L696 229H712L730 239L741 256L769 254V260L739 280L735 296L752 311L760 341L748 361L746 383L750 398H654V383L660 336L642 342L628 333L626 307L609 299Z",
    eyes: [667, 269, 30, 12, 11], lid: "#639968" },
  hoth: { name: "Leia", bounds: [731, 233, 124, 198],
    outline: "M733 270L739 252L761 236H796L818 246L827 255L843 259L851 277L847 296L831 308L825 319L834 343V375H827V404L817 410V429H790V411H782V428H755V414L762 404L751 395V375H745L748 349L754 330L766 318L750 310L748 294L734 286Z",
    eyes: [755, 286, 32, 13, 18], lid: "#edb78e" },
  tatooine: { name: "R2-D2", bounds: [721, 360, 144, 161],
    outline: "M745 416V394L751 380L769 366L783 361H804L821 370L834 384L839 399V417L850 419L856 428V461L851 466V488L861 495L865 519H815V503H769L755 515H721L725 497L733 488V459L729 452V432L733 422Z" },
  kashyyyk: { name: "Chewbacca", bounds: [695, 234, 137, 231],
    outline: "M704 276L715 258L723 253L726 241L733 246L740 237L749 240L760 234L768 242H780L782 249H795L793 257L805 261L803 270L814 282L808 286L818 298L813 305L819 319L810 323L812 337L821 351L825 376L832 405L823 422H811L807 441L810 463H770L764 450L756 461H717L714 451L723 440L718 425L706 423L698 412L702 396L698 384L706 367L709 348L702 335L707 327L700 313L704 303L701 292L705 285Z",
    eyes: [723, 303, 34, 12, 13], lid: "#b48750" },
  nevarro: { name: "Grogu", bounds: [790, 327, 149, 130],
    outline: "M792 342L824 346L837 332L849 329H873L890 341L936 344L929 352L916 366L897 374L902 387L901 403L914 425L916 440L904 450L885 453H820L806 444L800 431L808 414L811 393L815 380L811 370L801 356Z",
    eyes: [824, 355, 32, 16, 15], lid: "#7bb28e" },
  bespin: { name: "Darth Vader", bounds: [672, 151, 312, 400],
    outline: "M731 258L747 231L749 210L762 178L781 164L803 158L809 151H833L854 160L870 177L889 204L895 234L912 269L922 285V300L887 308L905 336L921 386L951 440L981 487L978 510L963 512L947 527L924 528L923 511L904 520L881 514L884 537L875 548H839L833 538L831 515L814 513L810 531L785 539H730L728 528L748 513L746 502L719 510L710 495L697 509L695 522L680 517L674 500V486L691 447L710 398L727 365L714 350L712 336L719 329L740 341L753 320L767 311L742 305L729 297Z" },
  "death-star": { name: "Stormtrooper", bounds: [726, 211, 154, 228],
    outline: "M742 255L747 238L761 221L778 215H810L819 219L824 214H838L848 224L855 244L864 255L871 277L878 290L877 315L867 330L850 339L831 338L832 366L837 382L830 399L835 413V437H799V414L793 398H783L779 413V432H743V421L751 411L751 397L744 392L733 395L726 385L729 361L736 344L737 322L746 314L738 302L736 288L743 282Z" },
};

export function position(x: number, y: number, width: number, height: number): CSSProperties {
  return { left: `${x / 1024 * 100}%`, top: `${y / 576 * 100}%`, width: `${width / 1024 * 100}%`, height: `${height / 576 * 100}%` };
}

type CharacterPart = { kind: "head" | "arm" | "wind"; bounds: [number, number, number, number]; origin: string };
const characterParts: Partial<Record<Scene, CharacterPart[]>> = {
  dagobah: [{ kind: "arm", bounds: [608, 277, 55, 66], origin: "655px 321px" }],
  hoth: [{ kind: "head", bounds: [731, 233, 124, 88], origin: "790px 314px" }],
  tatooine: [{ kind: "head", bounds: [745, 360, 94, 57], origin: "792px 400px" }],
  kashyyyk: [{ kind: "wind", bounds: [695, 335, 137, 96], origin: "766px 335px" }],
  nevarro: [{ kind: "arm", bounds: [801, 405, 35, 42], origin: "827px 407px" }],
  bespin: [
    { kind: "wind", bounds: [672, 386, 312, 142], origin: "824px 386px" },
    { kind: "arm", bounds: [791, 390, 53, 62], origin: "841px 393px" },
  ],
  "death-star": [{ kind: "head", bounds: [726, 211, 154, 128], origin: "803px 331px" }],
};

export function Character({ scene, image }: { scene: Scene; image: string }) {
  const id = useId();
  const { outline, bounds: [x, y, w, h], eyes, lid } = characters[scene];
  const parts = characterParts[scene] ?? [];
  return <svg className="scene-svg character" viewBox="0 0 1024 576" shapeRendering="crispEdges" focusable="false"
    style={{ "--character-origin": `${(x + w / 2) / 1024 * 100}% ${(y + h) / 576 * 100}%` } as CSSProperties}>
    <defs>
      <clipPath id={id}><path d={outline} /></clipPath>
      {parts.map(({ bounds: [px, py, pw, ph] }, index) => <clipPath id={`${id}-part-${index}`} key={index}>
        <rect x={px} y={py} width={pw} height={ph} />
      </clipPath>)}
    </defs>
    <g className="character-idle">
      <g className="character-gesture">
        <image href={image} width="1024" height="576" clipPath={`url(#${id})`} />
        {parts.map(({ kind, origin }, index) => <g key={index} className={`character-part character-${kind}`} style={{ transformOrigin: origin }}>
          <g clipPath={`url(#${id}-part-${index})`}>
            <image href={image} width="1024" height="576" clipPath={`url(#${id})`} />
          </g>
        </g>)}
        {scene === "bespin" && <path className="vader-point" fill="#322840" stroke="#171322" strokeWidth="3"
          d="M808 422h-13v-9h-12v-7h-15v-7h-17v-7h26l20 10h12l9 10v10z" />}
        {eyes && <g className="character-blink" fill={lid}>
          <rect x={eyes[0]} y={eyes[1]} width={eyes[3]} height={eyes[4]} />
          <rect x={eyes[0] + eyes[2]} y={eyes[1]} width={eyes[3]} height={eyes[4]} />
          <path d={`M${eyes[0]} ${eyes[1] + eyes[4] / 2}h${eyes[3]}m${eyes[2] - eyes[3]} 0h${eyes[3]}`} stroke="#243b2c" strokeWidth="2" />
        </g>}
      </g>
    </g>
  </svg>;
}

export function Atmosphere() {
  return <div className="scene-atmosphere">
    {Array.from({ length: 20 }, (_, i) => <span className="ambient-pixel" data-particle key={i} style={{
      ...position(455 + (i * 83) % 540, 70 + (i * 61) % 450, i % 3 === 0 ? 5 : 3, i % 3 === 0 ? 5 : 3),
      "--delay": `${-i * .73}s`, "--duration": `${5 + i % 6}s`,
    } as CSSProperties} />)}
    <span className="shooting-star" data-particle />
  </div>;
}

// Per-page layers share one camera. The small mid/background depth delta
// keeps these traced overlays covering their baked silhouettes.
const layers = { background: .18, mid: .3, foreground: 1.6 };
export const spatialScenes = {
  "/pixel/home-yoda.jpg": { scene: "dagobah", camera: { kind: "push", duration: 9000, direction: 1 }, story: { beat: "force-lift", duration: 3200 }, color: "#a9e6a0", layers, Details: null, Environment: Dagobah },
  "/pixel/sobre-leia.jpg": { scene: "hoth", camera: { kind: "pan", duration: 10000, direction: -1 }, story: { beat: "head-turn", duration: 2200 }, color: "#b9eaff", layers, Details: Hoth, Environment: null },
  "/pixel/projetos-r2d2.jpg": { scene: "tatooine", camera: { kind: "pan", duration: 8000, direction: 1 }, story: { beat: "dome-spin", duration: 2600 }, color: "#79dfff", layers, Details: Tatooine, Environment: null },
  "/pixel/conteudo-chewbacca.jpg": { scene: "kashyyyk", camera: { kind: "push", duration: 8500, direction: 1 }, story: { beat: "roar", duration: 2000 }, color: "#f0c27a", layers, Details: Kashyyyk, Environment: null },
  "/pixel/eventos-grogu.jpg": { scene: "nevarro", camera: { kind: "push", duration: 10000, direction: 1 }, story: { beat: "reach", duration: 3000 }, color: "#8adfff", layers, Details: null, Environment: Nevarro },
  "/pixel/servicos-vader.jpg": { scene: "bespin", camera: { kind: "pan", duration: 9000, direction: -1 }, story: { beat: "ignite-point", duration: 3000 }, color: "#ff5555", layers, Details: Bespin, Environment: null },
  "/pixel/404-stormtrooper.jpg": { scene: "death-star", camera: { kind: "pan", duration: 7000, direction: 1 }, story: { beat: "look-around", duration: 2800 }, color: "#e2f2ff", layers, Details: DeathStar, Environment: null },
} satisfies Record<string, { scene: Scene; color: string; camera: CameraMotion; story: { beat: string; duration: number }; layers: typeof layers; Details: (() => React.ReactNode) | null; Environment: (() => React.ReactNode) | null }>;

export function characterFor(scene: Scene) { return characters[scene]; }

export function SceneLighting({ scene }: { scene: Scene }) {
  return <div className="scene-lighting" aria-hidden="true">
    {scene === "tatooine" && <><span className="twin-sun twin-sun--large" /><span className="twin-sun twin-sun--small" /></>}
    <div className="scene-fog-plane" data-fog><span className="scene-haze scene-haze--back" /></div>
    <div className="scene-fog-plane" data-fog><span className="scene-haze scene-haze--front" /></div>
    <span className="scene-backlight" />
    {scene === "bespin" && <>
      <span className="vader-strip vader-strip--left" />
      <span className="vader-strip vader-strip--right" />
      <span className="vader-reflection" />
    </>}
  </div>;
}

export function Foreground() {
  return <div className="scene-debris" aria-hidden="true">
    {[0, 1, 2].map((side) => <svg className={`scene-framing-rock scene-framing-rock--${side}`} key={`rock-${side}`} viewBox="0 0 12 12" shapeRendering="crispEdges">
      {rockShapes[side].flatMap((row, y) => [...row].map((pixel, x) => pixel === "." ? null :
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={rockPalette[pixel]} />))}
    </svg>)}
    {Array.from({ length: 12 }, (_, i) => <span data-particle key={i} style={{
      left: `${52 + (i * 17) % 44}%`, top: `${i % 2 ? 98 - i % 4 : -2 + i % 5}%`,
      "--delay": `${-i * 1.7}s`, "--duration": `${8 + i % 5}s`,
    } as CSSProperties} />)}
  </div>;
}
