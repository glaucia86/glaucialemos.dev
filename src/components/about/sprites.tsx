// Pixel sprites for Echo Base. Each character is one SVG pixel; "." is transparent.
export type Sprite = { rows: string[]; palette: Record<string, string> };

export function PixelSprite({ rows, palette, className }: Sprite & { className?: string }) {
  return <svg className={className} viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges" focusable="false" aria-hidden="true">
    {rows.flatMap((row, y) => [...row].map((pixel, x) => palette[pixel] ?
      <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={palette[pixel]} /> : null))}
  </svg>;
}

// Same output as a string, for sprites created on demand by client effects.
export function spriteMarkup({ rows, palette }: Sprite, className = "") {
  const pixels = rows.flatMap((row, y) => [...row].flatMap((pixel, x) => palette[pixel] ? [`<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[pixel]}"/>`] : []));
  return `<svg class="${className}" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" focusable="false" aria-hidden="true">${pixels.join("")}</svg>`;
}

const fit = (rows: string[], width: number) => rows.map(row => row.slice(0, width).padEnd(width, "."));

export const PROBE: Sprite = {
  rows: [
    ".....oooooo.....", "...oohhhhmmoo...", "..ohhhmmmmmmmo..", ".ohhmmmmmmmmmmo.", ".ommeemmmmeemmo.", ".ommmmmmmmmmmmo.",
    "..ommmmmmmmmmo..", "...oommmmmmoo...", ".....oooooo.....", "....l.l..l.l....", "...l..l..l..l...", "..l...l..l...l..",
    "..l...l..l...l..", ".l....l..l....l.", ".l....l..l....l.", "......l..l......", ".....ll..ll.....",
  ],
  palette: { o: "#121826", h: "#6b7488", m: "#323a4d", e: "var(--energy-red)", l: "#4b5366" },
};

export const SPEEDER: Sprite = {
  rows: ["......oo........", "..oooowwoooo....", "ooowwwwwwwwwoo..", ".oorrrwwwwwwwwoo", "...oooooooooo..."],
  palette: { o: "#4f5a70", w: "#e6ebf4", r: "#ff7a3a" },
};

const medalRows = fit([
  "..rrrrRRRRrrrr..", "..rrrrRRRRrrrr..", "...rrrRRRRrrr...", "....rrRRRRrr....", ".....rRRRRr.....", "......oooo......",
  "....oohhhhoo....", "...ohhggggggo...", "..ohggggyggggo..", "..ohgggyyyggdo..", ".ohgyyyyyyyyydo.", ".ohggyyyyyyggdo.",
  ".ohgggyyyyggddo.", ".ohggyyggyyggdo.", "..ogyygggyygdo..", "..odggggggggdo..", "...oddggggddo...", "....oodddddo....", "......oooo......",
], 16);
export const medal = (ribbon: string, stripe: string): Sprite => ({
  rows: medalRows,
  palette: { r: ribbon, R: stripe, o: "#5c3b0a", h: "#fff1b8", g: "#e9b949", y: "#fff7d6", d: "#a8741d" },
});

const tauntaunPalette = { o: "#6b5a4a", w: "#ece6da", s: "#c9bfae" };
const tauntaunBody = [
  "...........oo...", "..........owwo..", ".........owwwwo.", ".........owwwwwo", "..........owwo..", ".....oooooowo...",
  "...oowwwwwwwo...", "..owwwwwwwwwo...", ".owwwwwwwwso....", "o.owwwwwwso.....",
];
export const TAUNTAUN_A: Sprite = { rows: fit([...tauntaunBody, "....owo.owo.....", "....owo..owo....", "...owo....owo...", "...oo......oo..."], 16), palette: tauntaunPalette };
export const TAUNTAUN_B: Sprite = { rows: fit([...tauntaunBody, ".....owowo......", ".....oowwo......", "....owo.owo.....", "....oo...oo....."], 16), palette: tauntaunPalette };

// C-3PO without arms (16 × 24) plus one arm (3 × 9), so the left arm can fall off.
const threepioPalette = { g: "#7a5612", G: "#e8b93b", d: "#5c4410", e: "var(--threepio-eye, #ffb52e)", w: "#f5d76e", r: "#d94a3a", b: "#3a7bd5" };
export const THREEPIO: Sprite = {
  rows: fit([
    "......gggg......", ".....gGGGGg.....", "....gGGGGGGg....", "....gGeGGeGg....", "....gGGGGGGg....", "....gGGddGGg....",
    ".....gGGGGg.....", "......gddg......", "....gggggggg....", "...gGGGGGGGGg...", "...gGGwwwwGGg...", "...gGGwrbwGGg...",
    "...gGGwwwwGGg...", "....gGGGGGGg....", "....gddddddg....", "....gGGGGGGg....", "....gGG..GGg....", "....gGG..GGg....",
    "....gGG..GGg....", "....gGd..dGg....", "....gGG..GGg....", "....gGG..GGg....", "...ggGG..GGgg...", "...gggg..gggg...",
  ], 16),
  palette: threepioPalette,
};
export const THREEPIO_ARM: Sprite = { rows: [".g.", "gGg", "gGg", "gGg", "gdg", "gGg", "gGg", "gGg", ".g."], palette: threepioPalette };

export const TRANSPORT: Sprite = {
  rows: fit([
    "........oooooooooooooo..........", "....ooohhhhhhhhhhhhhhhhooo......", "..oohhmmmmmmmmmmmmmmmmmmmhhoo...", "oohmmmmddmmmmddmmmmddmmmmmmmhoo.",
    "ohmmmmmmmmmmmmmmmmmmmmmmmmmmmmho", "oohmmmmmmmmmmmmmmmmmmmmmmmmmmhoo", "..oohhmmmmmmmmmmmmmmmmmmmhhoo...", "....oooddddddddddddddddooo......", "........oooooooooooooo..........",
  ], 32),
  palette: { o: "#3c4456", h: "#e2e7f0", m: "#aab4c6", d: "#ff6b4a" },
};
