// Pixel sprites for Tatooine, drawn with PixelSprite / spriteMarkup. Each character is one pixel; "." is transparent.
import type { Sprite } from "@/components/about/sprites";

export const SANDCRAWLER: Sprite = {
  rows: [
    "......######............", ".....#hhhhhh#...........", "....#hhhhhhhh#######....", "...#hhhhwwhhhhhhhhhh#...",
    "..#hhhhhhhhhhhhhhhhhh#..", ".#hhhhhhhhhhwwhhhwwhhh#.", "#mmmmmmmmmmmmmmmmmmmmmm#", "#mmmmmmmmmmmmmmmmmmmmmm#",
    "#dddddddddddddddddddddd#", ".#tt.tt.tt.tt.tt.tt.tt#.", ".tttttttttttttttttttttt.", "..tttttttttttttttttttt..",
  ],
  palette: { "#": "#2a1a10", h: "#a9784a", m: "#8a5c36", d: "#5e3c24", w: "#ffcf6b", t: "#3a2a20" },
};

export const JAWA: Sprite = {
  rows: ["..bbb..", ".bbbbb.", "bbybybb", "bbbbbbb", ".bbbbb.", "bbbbbbb", "bbbbbbb", "bbbbbbb", ".bb.bb.", ".dd.dd."],
  palette: { b: "#6b4a2b", y: "#ffe14d", d: "#3a2a20" },
};

export const PODRACER: Sprite = {
  rows: [
    "..........######...######.", ".........#hhhhhh#.#hhhhhh#", "..####...#mmmmmmff#mmmmmmf", ".#cccc#~~#mmmmmm#~#mmmmmm#",
    ".#cwwc#..#mmmmmmff#mmmmmmf", "..####....######...######.",
  ],
  palette: { "#": "#1d1a24", h: "#e8e2d4", m: "#9aa3b5", c: "#d9a441", w: "#6fd3ff", f: "#ff9a3c", "~": "#7cf2ff" },
};

export const BB8: Sprite = {
  rows: ["...ooo....", "..owwwo...", "..owkwo...", "...ooo....", "..owwwwo..", ".owoOOowo.", "owwOwwOwwo", "owwoOOowwo", ".owwwwwwo.", "..oooooo.."],
  palette: { o: "#2a2a2a", w: "#f2efe8", O: "#f08a24", k: "#111111" },
};

export const THUMB: Sprite = {
  rows: ["..f..", ".fyf.", ".fyf.", "..g..", ".ggg.", "gggg.", "gggg.", ".ggg."],
  palette: { f: "#ff9a3c", y: "#ffe14d", g: "#c9c2b4" },
};

export const OBIWAN: Sprite = {
  rows: [
    "...bbbb...", "..bbbbbb..", ".bbsssbbb.", ".bbsksksb.", ".bbsssssb.", "..bsgggs..", "..bbgggb..", ".bttttttb.",
    "bbttttttbb", "bbttbbttbb", "bbttbbttbb", "bbttttttbb", ".bbbbbbbb.", ".bb....bb.",
  ],
  palette: { b: "#6b4a2b", s: "#e8b48a", k: "#2a1a10", g: "#d9d0c0", t: "#d8c7a4" },
};

export const xwing = (color: string): Sprite => ({
  rows: ["#...........#", "##....#....##", ".##..###..##.", "..#########..", "...###r###...", "..#########..", ".##..###..##.", "##....#....##", "#...........#"],
  palette: { "#": color, r: "#ff4d5e" },
});
