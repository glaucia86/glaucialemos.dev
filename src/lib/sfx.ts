// Hybrid Web Audio: real world samples and synthesized UI, off by default, opt-in only.
import { worldSound } from "./world-sound";
import { syncMusic } from "./music";
export type SoundKind = "blip" | "key" | "boot" | "granted" | "push" | "saber" | "error" | "success" | "levitate" | "deflect" | "rumble" | "splash" | "wind" | "ice" | "holo" | "r2" | "jawa" | "pod" | "cantina" | "sunset" | "zap" | "twinkle" | "lens" | "woof" | "beacon" | "ignite" | "launch" | "hangar" | "switch" | "hush" | "catch" | "wish" | "warp" | "pawstep" | "capsule" | "aurora" | "gust" | "scan" | "dust" | "sprout" | "bug"
  | "type" | "return" | "disk-in" | "disk-out" | "crt-on" | "dig" | "thread" | "letter" | "snow" | "gust-dust" | "scan-sweep" | "static" | "build" | "brush"
  | "chime" | "page" | "prism" | "scanner" | "echo" | "link" | "dusk" | "refract" | "facet"
  | "implode" | "nova" | "shimmer" | "bloom" | "star-ping" | "slam" | "credits-chord" | "transmission" | "dive"
  | "garden-bloom" | "relay" | "seed" | "greenhouse" | "align-aurelia" | "hover-aurelia" | "click-aurelia"
  | "hover-observatory" | "click-observatory" | "hover-niveora" | "click-niveora" | "hover-mars" | "click-mars" | "hover-lumina" | "click-lumina"
  | "hover-epilogue" | "click-epilogue" | "blizzard" | "thunder" | "comet" | "garden" | "beacon-sample"
  | "observatory" | "red-dunes" | "crystal-hum" | "orbit-hum" | "veil" | "snow-bed"
  | "orbit" | "star" | "visor" | "radar" | "descent" | "citylights" | "hover-atlas" | "click-atlas";
// "noise" is filtered white noise: `from`/`to` sweep the band-pass centre instead of a pitch.
type Tone = { wave: OscillatorType | "noise"; from: number; to: number; duration: number; gain: number; delay?: number };
export type SoundWorld = "aurelia" | "observatory" | "niveora" | "mars" | "lumina" | "epilogue" | "atlas";
const WORLDS: readonly string[] = ["aurelia", "observatory", "niveora", "mars", "lumina", "epilogue", "atlas"] satisfies SoundWorld[];

export const SOUND_KEY = "sfx-enabled";
export const SOUND_EVENT = "sfx-change";

export const soundBank: Record<SoundKind, Tone[]> = {
  blizzard: [{ wave: "noise", from: 180, to: 420, duration: .55, gain: .02 }],
  thunder: [{ wave: "sawtooth", from: 48, to: 36, duration: .6, gain: .07 }],
  comet: [{ wave: "noise", from: 200, to: 1800, duration: .35, gain: .035 }],
  garden: [{ wave: "noise", from: 1200, to: 700, duration: .6, gain: .012 }],
  observatory: [{ wave: "sine", from: 660, to: 330, duration: .6, gain: .03 }],
  "red-dunes": [{ wave: "noise", from: 700, to: 1700, duration: .55, gain: .022 }],
  "crystal-hum": [{ wave: "sine", from: 1568, to: 1568, duration: .3, gain: .024 }],
  "orbit-hum": [{ wave: "sine", from: 220, to: 880, duration: .5, gain: .025 }],
  veil: [{ wave: "sine", from: 2093, to: 2093, duration: .5, gain: .02 }],
  "snow-bed": [{ wave: "noise", from: 5200, to: 3000, duration: .25, gain: .012 }],
  "beacon-sample": [{ wave: "sine", from: 880, to: 880, duration: .09, gain: .035 }, { wave: "triangle", from: 1320, to: 1760, duration: .16, gain: .025, delay: .12 }],
  blip: [{ wave: "square", from: 880, to: 1320, duration: .04, gain: .025 }],
  key: [{ wave: "square", from: 220, to: 180, duration: .025, gain: .03 }],
  boot: [{ wave: "square", from: 110, to: 440, duration: .35, gain: .04 }],
  granted: [{ wave: "square", from: 660, to: 660, duration: .08, gain: .04 }, { wave: "square", from: 990, to: 990, duration: .14, gain: .04, delay: .09 }],
  push: [{ wave: "sawtooth", from: 180, to: 40, duration: .45, gain: .06 }, { wave: "triangle", from: 90, to: 30, duration: .5, gain: .08 }],
  saber: [{ wave: "sawtooth", from: 70, to: 140, duration: .55, gain: .045 }, { wave: "square", from: 140, to: 220, duration: .3, gain: .02 }],
  error: [{ wave: "square", from: 160, to: 120, duration: .12, gain: .045 }, { wave: "square", from: 120, to: 90, duration: .16, gain: .045, delay: .13 }],
  success: [{ wave: "triangle", from: 523, to: 523, duration: .07, gain: .05 }, { wave: "triangle", from: 784, to: 784, duration: .07, gain: .05, delay: .08 }, { wave: "triangle", from: 1046, to: 1046, duration: .16, gain: .05, delay: .16 }],
  levitate: [{ wave: "triangle", from: 90, to: 260, duration: .6, gain: .05 }, { wave: "sine", from: 180, to: 520, duration: .6, gain: .03 }],
  deflect: [{ wave: "square", from: 1400, to: 300, duration: .12, gain: .035 }, { wave: "sawtooth", from: 220, to: 90, duration: .2, gain: .03, delay: .02 }],
  rumble: [{ wave: "sawtooth", from: 48, to: 36, duration: .6, gain: .07 }, { wave: "triangle", from: 96, to: 140, duration: .6, gain: .04, delay: .05 }],
  splash: [{ wave: "square", from: 900, to: 120, duration: .22, gain: .03 }, { wave: "triangle", from: 260, to: 50, duration: .5, gain: .06, delay: .03 }],
  wind: [{ wave: "triangle", from: 300, to: 520, duration: .6, gain: .015 }, { wave: "sine", from: 600, to: 380, duration: .6, gain: .012, delay: .25 }],
  ice: [{ wave: "square", from: 2400, to: 900, duration: .08, gain: .03 }, { wave: "square", from: 1800, to: 600, duration: .1, gain: .03, delay: .07 }, { wave: "triangle", from: 900, to: 120, duration: .4, gain: .04, delay: .12 }],
  holo: [{ wave: "sine", from: 440, to: 660, duration: .3, gain: .03 }, { wave: "triangle", from: 880, to: 1320, duration: .4, gain: .02, delay: .15 }],
  r2: [{ wave: "square", from: 1200, to: 2400, duration: .06, gain: .025 }, { wave: "square", from: 2600, to: 900, duration: .08, gain: .025, delay: .07 }, { wave: "square", from: 1800, to: 3000, duration: .05, gain: .025, delay: .17 }, { wave: "square", from: 900, to: 1600, duration: .1, gain: .025, delay: .24 }],
  jawa: [{ wave: "triangle", from: 700, to: 900, duration: .07, gain: .04 }, { wave: "triangle", from: 1100, to: 1300, duration: .07, gain: .04, delay: .09 }, { wave: "triangle", from: 1400, to: 1000, duration: .12, gain: .04, delay: .18 }],
  pod: [{ wave: "sawtooth", from: 80, to: 420, duration: .6, gain: .04 }, { wave: "square", from: 160, to: 840, duration: .6, gain: .015, delay: .05 }],
  cantina: [{ wave: "triangle", from: 523, to: 523, duration: .09, gain: .04 }, { wave: "triangle", from: 659, to: 659, duration: .09, gain: .04, delay: 0.13 }, { wave: "triangle", from: 784, to: 784, duration: .09, gain: .04, delay: 0.26 }, { wave: "triangle", from: 880, to: 880, duration: .09, gain: .04, delay: 0.39 }, { wave: "triangle", from: 784, to: 784, duration: .09, gain: .04, delay: 0.52 }, { wave: "triangle", from: 659, to: 659, duration: .09, gain: .04, delay: 0.65 }, { wave: "triangle", from: 698, to: 698, duration: .09, gain: .04, delay: 0.78 }, { wave: "triangle", from: 587, to: 587, duration: .09, gain: .04, delay: 0.91 }, { wave: "triangle", from: 523, to: 523, duration: .09, gain: .04, delay: 1.04 }, { wave: "triangle", from: 659, to: 659, duration: .09, gain: .04, delay: 1.17 }, { wave: "triangle", from: 784, to: 784, duration: .09, gain: .04, delay: 1.3 }, { wave: "triangle", from: 1046, to: 1046, duration: .09, gain: .04, delay: 1.43 }],
  sunset: [{ wave: "sine", from: 220, to: 220, duration: .6, gain: .03 }, { wave: "sine", from: 277, to: 277, duration: .6, gain: .025, delay: .15 }, { wave: "sine", from: 330, to: 330, duration: .6, gain: .025, delay: .3 }, { wave: "sine", from: 440, to: 440, duration: .6, gain: .02, delay: .45 }],
  zap: [{ wave: "square", from: 3000, to: 200, duration: .15, gain: .03 }, { wave: "sawtooth", from: 1800, to: 100, duration: .25, gain: .03, delay: .05 }, { wave: "square", from: 2400, to: 300, duration: .1, gain: .03, delay: .18 }],
  // Galáxia Encantada: music-box chimes, a two-note bark and a soft rocket.
  twinkle: [{ wave: "triangle", from: 1568, to: 1568, duration: .08, gain: .03 }, { wave: "triangle", from: 2093, to: 2093, duration: .12, gain: .025, delay: .07 }],
  lens: [{ wave: "sine", from: 330, to: 660, duration: .3, gain: .03 }, { wave: "triangle", from: 1319, to: 1319, duration: .1, gain: .03, delay: .28 }, { wave: "triangle", from: 1760, to: 1760, duration: .18, gain: .03, delay: .36 }],
  woof: [{ wave: "square", from: 420, to: 260, duration: .09, gain: .035 }, { wave: "square", from: 460, to: 240, duration: .11, gain: .035, delay: .16 }],
  beacon: [{ wave: "sine", from: 880, to: 880, duration: .12, gain: .03 }, { wave: "sine", from: 1175, to: 1175, duration: .12, gain: .03, delay: .16 }, { wave: "sine", from: 1480, to: 1480, duration: .22, gain: .03, delay: .32 }],
  ignite: [{ wave: "triangle", from: 110, to: 330, duration: .5, gain: .05 }, { wave: "square", from: 220, to: 440, duration: .4, gain: .015, delay: .1 }],
  launch: [{ wave: "sawtooth", from: 60, to: 180, duration: .6, gain: .05 }, { wave: "triangle", from: 240, to: 960, duration: .6, gain: .03, delay: .08 }],
  switch: [{ wave: "square", from: 1200, to: 900, duration: .03, gain: .03 }, { wave: "triangle", from: 300, to: 180, duration: .06, gain: .03, delay: .03 }],
  hush: [{ wave: "sine", from: 660, to: 330, duration: .6, gain: .03 }, { wave: "triangle", from: 1320, to: 990, duration: .5, gain: .015, delay: .1 }],
  catch: [{ wave: "square", from: 1760, to: 2637, duration: .06, gain: .03 }, { wave: "triangle", from: 2637, to: 2637, duration: .12, gain: .025, delay: .06 }],
  wish: [{ wave: "triangle", from: 523, to: 523, duration: .1, gain: .04 }, { wave: "triangle", from: 659, to: 659, duration: .1, gain: .04, delay: .1 }, { wave: "triangle", from: 784, to: 784, duration: .1, gain: .04, delay: .2 }, { wave: "triangle", from: 1046, to: 1046, duration: .3, gain: .04, delay: .3 }],
  warp: [{ wave: "sawtooth", from: 200, to: 1800, duration: .35, gain: .035 }, { wave: "square", from: 3000, to: 400, duration: .2, gain: .015, delay: .3 }],
  hangar: [{ wave: "square", from: 523, to: 523, duration: .06, gain: .03 }, { wave: "square", from: 784, to: 784, duration: .06, gain: .03, delay: .1 }, { wave: "triangle", from: 196, to: 392, duration: .4, gain: .04, delay: .18 }],
  pawstep: [{ wave: "triangle", from: 240, to: 120, duration: .05, gain: .03 }, { wave: "square", from: 1600, to: 900, duration: .03, gain: .012, delay: .02 }],
  capsule: [{ wave: "square", from: 110, to: 220, duration: .3, gain: .03 }, { wave: "sine", from: 440, to: 880, duration: .45, gain: .03, delay: .2 }, { wave: "triangle", from: 1319, to: 1319, duration: .2, gain: .03, delay: .55 }],
  aurora: [{ wave: "sine", from: 392, to: 392, duration: .5, gain: .03 }, { wave: "sine", from: 494, to: 494, duration: .5, gain: .025, delay: .12 }, { wave: "sine", from: 587, to: 587, duration: .55, gain: .025, delay: .24 }, { wave: "triangle", from: 1568, to: 2093, duration: .3, gain: .015, delay: .4 }],
  gust: [{ wave: "triangle", from: 180, to: 420, duration: .55, gain: .02 }, { wave: "sine", from: 520, to: 260, duration: .6, gain: .015, delay: .2 }],
  // Marte: a sensor sweep, a puff of dust, a sprout's chime and a tiny bug chirp.
  scan: [{ wave: "square", from: 600, to: 1800, duration: .25, gain: .02 }, { wave: "sine", from: 1800, to: 1200, duration: .3, gain: .015, delay: .22 }],
  dust: [{ wave: "triangle", from: 140, to: 60, duration: .45, gain: .03 }, { wave: "sine", from: 300, to: 180, duration: .3, gain: .012, delay: .05 }],
  sprout: [{ wave: "triangle", from: 784, to: 784, duration: .08, gain: .03 }, { wave: "triangle", from: 1175, to: 1175, duration: .1, gain: .03, delay: .09 }, { wave: "sine", from: 1568, to: 2093, duration: .25, gain: .02, delay: .19 }],
  bug: [{ wave: "square", from: 2200, to: 1800, duration: .03, gain: .02 }, { wave: "square", from: 2400, to: 2000, duration: .03, gain: .02, delay: .06 }],
  // The old Mars terminal: mechanical keys, a carriage return, the floppy drive and the CRT warming up.
  type: [{ wave: "noise", from: 2600, to: 1700, duration: .03, gain: .05 }, { wave: "square", from: 900, to: 600, duration: .02, gain: .01 }],
  return: [{ wave: "noise", from: 900, to: 320, duration: .08, gain: .05 }, { wave: "triangle", from: 220, to: 110, duration: .12, gain: .03, delay: .02 }, { wave: "triangle", from: 1760, to: 1760, duration: .14, gain: .012, delay: .12 }],
  "disk-in": [{ wave: "noise", from: 1300, to: 600, duration: .05, gain: .05 }, { wave: "square", from: 180, to: 90, duration: .1, gain: .035, delay: .05 }, { wave: "noise", from: 3200, to: 2200, duration: .22, gain: .015, delay: .16 }],
  "disk-out": [{ wave: "square", from: 300, to: 600, duration: .05, gain: .03 }, { wave: "noise", from: 900, to: 1500, duration: .1, gain: .04, delay: .04 }],
  "crt-on": [{ wave: "noise", from: 400, to: 4200, duration: .18, gain: .03 }, { wave: "sine", from: 60, to: 120, duration: .35, gain: .04 }, { wave: "sine", from: 7800, to: 7800, duration: .25, gain: .006, delay: .2 }],
  dig: [{ wave: "noise", from: 650, to: 300, duration: .12, gain: .05 }, { wave: "noise", from: 520, to: 260, duration: .12, gain: .04, delay: .15 }],
  // Nivéora: a thread of light, unfolding paper and soft snow.
  thread: [{ wave: "sine", from: 440, to: 1320, duration: .5, gain: .02 }, { wave: "triangle", from: 1320, to: 1760, duration: .18, gain: .012, delay: .42 }],
  letter: [{ wave: "noise", from: 3000, to: 1500, duration: .15, gain: .03 }, { wave: "noise", from: 2500, to: 1200, duration: .12, gain: .025, delay: .18 }, { wave: "triangle", from: 988, to: 988, duration: .12, gain: .02, delay: .32 }],
  snow: [{ wave: "noise", from: 5200, to: 3000, duration: .25, gain: .012 }],
  // Marte: dust in the wind, the scan sweep, static, a module clicking into place and a brush on a panel.
  "gust-dust": [{ wave: "noise", from: 700, to: 1700, duration: .55, gain: .022 }],
  "scan-sweep": [{ wave: "sine", from: 300, to: 2400, duration: .5, gain: .02 }, { wave: "square", from: 2400, to: 2400, duration: .03, gain: .01, delay: .5 }],
  static: [{ wave: "noise", from: 6000, to: 2000, duration: .3, gain: .03 }],
  build: [{ wave: "square", from: 660, to: 520, duration: .04, gain: .018 }, { wave: "noise", from: 2500, to: 2500, duration: .03, gain: .018 }],
  brush: [{ wave: "noise", from: 1800, to: 1200, duration: .09, gain: .025 }],
  // Lúmina: a crystal humming, a page turning, light splitting in a prism, the scanner, an echo, a dusk chord, the tunnel.
  chime: [{ wave: "sine", from: 1568, to: 1568, duration: .3, gain: .024 }, { wave: "sine", from: 1976, to: 1976, duration: .3, gain: .02, delay: .1 }, { wave: "sine", from: 2349, to: 2349, duration: .35, gain: .016, delay: .2 }],
  page: [{ wave: "noise", from: 3500, to: 1200, duration: .12, gain: .03 }, { wave: "noise", from: 2800, to: 900, duration: .1, gain: .02, delay: .1 }],
  prism: [{ wave: "triangle", from: 784, to: 784, duration: .08, gain: .024 }, { wave: "triangle", from: 988, to: 988, duration: .08, gain: .024, delay: .07 }, { wave: "triangle", from: 1175, to: 1175, duration: .08, gain: .024, delay: .14 }, { wave: "triangle", from: 1568, to: 1568, duration: .22, gain: .022, delay: .21 }, { wave: "sine", from: 1576, to: 1576, duration: .25, gain: .01, delay: .21 }],
  scanner: [{ wave: "sine", from: 1200, to: 1250, duration: .05, gain: .02 }, { wave: "sine", from: 1600, to: 1650, duration: .05, gain: .02, delay: .09 }, { wave: "sine", from: 2000, to: 2100, duration: .08, gain: .02, delay: .18 }],
  echo: [{ wave: "triangle", from: 1319, to: 1319, duration: .1, gain: .03 }, { wave: "triangle", from: 1319, to: 1319, duration: .1, gain: .015, delay: .16 }, { wave: "triangle", from: 1319, to: 1319, duration: .12, gain: .007, delay: .32 }],
  link: [{ wave: "triangle", from: 1760, to: 1760, duration: .06, gain: .022 }, { wave: "sine", from: 3520, to: 3520, duration: .04, gain: .006, delay: .02 }],
  dusk: [{ wave: "sine", from: 659, to: 659, duration: .4, gain: .022 }, { wave: "sine", from: 523, to: 523, duration: .4, gain: .02, delay: .1 }, { wave: "sine", from: 392, to: 392, duration: .38, gain: .018, delay: .2 }],
  refract: [{ wave: "sine", from: 600, to: 2400, duration: .45, gain: .018 }, { wave: "sine", from: 606, to: 2424, duration: .45, gain: .012, delay: .03 }],
  facet: [{ wave: "noise", from: 7000, to: 4000, duration: .2, gain: .02 }, { wave: "triangle", from: 2093, to: 2093, duration: .25, gain: .016, delay: .05 }, { wave: "triangle", from: 3136, to: 3136, duration: .25, gain: .01, delay: .12 }],
  // Epilogue: light pulled into the last star, the nova's sub-bass boom, the Veil blooming, the constellation's
  // arpeggio, the title landing, warm credit chords and an intercepted transmission. Chained on the finale's timeline.
  // Every tone stays within the site's volume cap (gain ≤ 0.08); the weight comes from stacking low voices.
  implode: [{ wave: "noise", from: 300, to: 4200, duration: .6, gain: .05 }, { wave: "sine", from: 40, to: 110, duration: .6, gain: .08 }, { wave: "sine", from: 41, to: 112, duration: .6, gain: .06 }, { wave: "sawtooth", from: 80, to: 240, duration: .55, gain: .02 }],
  nova: [{ wave: "sine", from: 95, to: 28, duration: .6, gain: .08 }, { wave: "sine", from: 72, to: 24, duration: .6, gain: .08 }, { wave: "triangle", from: 55, to: 30, duration: .6, gain: .08 }, { wave: "noise", from: 3000, to: 150, duration: .5, gain: .08 }, { wave: "noise", from: 900, to: 60, duration: .6, gain: .07 }, { wave: "square", from: 1800, to: 60, duration: .18, gain: .04 }],
  shimmer: [{ wave: "sine", from: 2093, to: 2093, duration: .5, gain: .02 }, { wave: "sine", from: 2637, to: 2637, duration: .45, gain: .018, delay: .05 }, { wave: "sine", from: 3136, to: 3136, duration: .4, gain: .016, delay: .1 }, { wave: "triangle", from: 4186, to: 4186, duration: .3, gain: .01, delay: .2 }],
  bloom: [{ wave: "triangle", from: 392, to: 392, duration: .5, gain: .035 }, { wave: "sine", from: 587, to: 587, duration: .5, gain: .03, delay: .05 }, { wave: "sine", from: 784, to: 784, duration: .45, gain: .025, delay: .1 }, { wave: "noise", from: 6000, to: 3000, duration: .4, gain: .015 }],
  "star-ping": [{ wave: "triangle", from: 1047, to: 1047, duration: .25, gain: .03 }, { wave: "sine", from: 2094, to: 2094, duration: .2, gain: .012, delay: .02 }],
  slam: [{ wave: "sine", from: 80, to: 30, duration: .6, gain: .08 }, { wave: "sine", from: 62, to: 26, duration: .6, gain: .08 }, { wave: "triangle", from: 48, to: 30, duration: .55, gain: .07 }, { wave: "noise", from: 1500, to: 100, duration: .35, gain: .08 }, { wave: "square", from: 110, to: 55, duration: .2, gain: .03 }, { wave: "triangle", from: 220, to: 220, duration: .6, gain: .035 }, { wave: "triangle", from: 277, to: 277, duration: .55, gain: .03, delay: .03 }, { wave: "triangle", from: 330, to: 330, duration: .5, gain: .03, delay: .06 }],
  "credits-chord": [{ wave: "sine", from: 262, to: 262, duration: .6, gain: .03 }, { wave: "sine", from: 330, to: 330, duration: .54, gain: .026, delay: .05 }, { wave: "sine", from: 392, to: 392, duration: .49, gain: .024, delay: .1 }, { wave: "triangle", from: 523, to: 523, duration: .44, gain: .015, delay: .15 }],
  transmission: [{ wave: "noise", from: 5000, to: 1500, duration: .25, gain: .03 }, { wave: "square", from: 1400, to: 1400, duration: .05, gain: .02, delay: .28 }, { wave: "square", from: 1800, to: 1800, duration: .05, gain: .02, delay: .38 }, { wave: "square", from: 1400, to: 1400, duration: .08, gain: .02, delay: .48 }],
  dive: [{ wave: "noise", from: 200, to: 3000, duration: .5, gain: .04 }, { wave: "sawtooth", from: 120, to: 900, duration: .5, gain: .02 }],
  // Atlas das Conexões: an orbit closing, a constellation star, Prince's visor, a radar ring, the night dive and the cities lighting up.
  orbit: [{ wave: "sine", from: 220, to: 880, duration: .5, gain: .025 }, { wave: "triangle", from: 880, to: 1320, duration: .2, gain: .02, delay: .42 }, { wave: "sine", from: 1760, to: 1760, duration: .16, gain: .012, delay: .5 }],
  star: [{ wave: "triangle", from: 1319, to: 1319, duration: .14, gain: .024 }, { wave: "sine", from: 2637, to: 2637, duration: .1, gain: .008, delay: .02 }],
  visor: [{ wave: "square", from: 988, to: 988, duration: .05, gain: .02 }, { wave: "square", from: 1319, to: 1319, duration: .05, gain: .02, delay: .08 }, { wave: "sine", from: 660, to: 1320, duration: .25, gain: .018, delay: .16 }],
  radar: [{ wave: "sine", from: 1400, to: 900, duration: .3, gain: .02 }, { wave: "sine", from: 1400, to: 900, duration: .3, gain: .008, delay: .25 }],
  descent: [{ wave: "noise", from: 2400, to: 300, duration: .6, gain: .03 }, { wave: "sine", from: 330, to: 110, duration: .6, gain: .03 }],
  citylights: [{ wave: "triangle", from: 784, to: 784, duration: .1, gain: .022 }, { wave: "triangle", from: 1047, to: 1047, duration: .1, gain: .02, delay: .08 }, { wave: "triangle", from: 1319, to: 1319, duration: .1, gain: .018, delay: .16 }, { wave: "sine", from: 1568, to: 1568, duration: .3, gain: .016, delay: .24 }],
  // Hover and click, one voice per world (FxLayer reads data-sound-world on <main>).
  "hover-observatory": [{ wave: "triangle", from: 2093, to: 2093, duration: .06, gain: .018 }],
  "click-observatory": [{ wave: "triangle", from: 1319, to: 1319, duration: .05, gain: .025 }, { wave: "triangle", from: 1760, to: 1760, duration: .07, gain: .02, delay: .05 }],
  "hover-niveora": [{ wave: "sine", from: 2637, to: 3136, duration: .05, gain: .018 }, { wave: "triangle", from: 4186, to: 4186, duration: .03, gain: .008, delay: .02 }],
  "click-niveora": [{ wave: "noise", from: 4000, to: 2500, duration: .04, gain: .03 }, { wave: "square", from: 1800, to: 1200, duration: .03, gain: .012 }],
  "hover-mars": [{ wave: "square", from: 1200, to: 1000, duration: .025, gain: .014 }, { wave: "noise", from: 3000, to: 3000, duration: .02, gain: .01 }],
  "click-mars": [{ wave: "noise", from: 1500, to: 900, duration: .04, gain: .035 }, { wave: "square", from: 300, to: 200, duration: .05, gain: .02 }],
  "garden-bloom": [{ wave: "sine", from: 523, to: 784, duration: .28, gain: .045 }, { wave: "triangle", from: 1047, to: 1319, duration: .2, gain: .025, delay: .08 }],
  relay: [{ wave: "sine", from: 880, to: 880, duration: .09, gain: .035 }, { wave: "triangle", from: 1320, to: 1760, duration: .16, gain: .025, delay: .12 }],
  seed: [{ wave: "triangle", from: 392, to: 587, duration: .18, gain: .04 }],
  greenhouse: [{ wave: "sine", from: 440, to: 220, duration: .38, gain: .035 }],
  "align-aurelia": [{ wave: "sine", from: 659, to: 988, duration: .24, gain: .04 }, { wave: "sine", from: 1319, to: 1319, duration: .2, gain: .022, delay: .1 }],
  "hover-aurelia": [{ wave: "sine", from: 1760, to: 2093, duration: .045, gain: .015 }],
  "click-aurelia": [{ wave: "triangle", from: 1047, to: 1568, duration: .08, gain: .025 }],
  "hover-lumina": [{ wave: "sine", from: 3136, to: 3322, duration: .05, gain: .016 }, { wave: "triangle", from: 4699, to: 4699, duration: .03, gain: .007, delay: .02 }],
  "click-lumina": [{ wave: "triangle", from: 2637, to: 2637, duration: .05, gain: .022 }, { wave: "noise", from: 6000, to: 4000, duration: .03, gain: .015 }],
  "hover-epilogue": [{ wave: "sine", from: 1760, to: 1976, duration: .06, gain: .016 }, { wave: "triangle", from: 3520, to: 3520, duration: .03, gain: .006, delay: .02 }],
  "click-epilogue": [{ wave: "triangle", from: 1319, to: 1319, duration: .05, gain: .022 }, { wave: "sine", from: 659, to: 330, duration: .12, gain: .02 }],
  "hover-atlas": [{ wave: "square", from: 1568, to: 1568, duration: .025, gain: .012 }, { wave: "sine", from: 2349, to: 2349, duration: .04, gain: .008, delay: .02 }],
  "click-atlas": [{ wave: "square", from: 1175, to: 1175, duration: .035, gain: .02 }, { wave: "sine", from: 1760, to: 2349, duration: .06, gain: .016, delay: .03 }],
};

// Minimum gap between two plays of the same sound, so fast typing or wiping never piles up (milliseconds).
export const MIN_GAP: Partial<Record<SoundKind, number>> = {
  type: 28, build: 40, brush: 70, snow: 400, "gust-dust": 1500, bug: 300, pawstep: 120,
  "hover-aurelia": 40, "hover-observatory": 40, "hover-niveora": 40, "hover-mars": 40, "hover-lumina": 40, "hover-epilogue": 40, "hover-atlas": 40, star: 60, radar: 200, page: 90, link: 60, blip: 40,
  "star-ping": 45, comet: 1500, thunder: 4000,
};
const lastPlayed = new Map<SoundKind, number>();
export function allowed(kind: SoundKind, now: number, played = lastPlayed) {
  const gap = MIN_GAP[kind] ?? 0;
  const last = played.get(kind);
  if (last !== undefined && now - last < gap) return false;
  played.set(kind, now);
  return true;
}

// Hover/click voice for the current world; pages without a world keep the original blip and key.
export function uiSound(world: string | undefined, action: "hover" | "click"): SoundKind {
  if (world && WORLDS.includes(world)) return `${action}-${world as SoundWorld}`;
  return action === "hover" ? "blip" : "key";
}

export function readSoundPreference(storage: Pick<Storage, "getItem"> | undefined) {
  try { return storage?.getItem(SOUND_KEY) === "true"; } catch { return false; }
}

export function writeSoundPreference(storage: Pick<Storage, "setItem"> | undefined, enabled: boolean) {
  try { storage?.setItem(SOUND_KEY, String(enabled)); } catch { /* The toggle still works for this visit. */ }
}

let context: AudioContext | null = null;
let enabled: boolean | null = null;
let master: GainNode | null = null;
let world: SoundWorld | undefined;
let inView = true;
let listening = false;
let suspendTimer: ReturnType<typeof setTimeout> | undefined;
export type AudioLevels = { music: number; effects: number };
const LEVELS_KEY = 'galaxia-audio-levels';
let audioLevels: AudioLevels | undefined;
export function getAudioLevels(): AudioLevels {
  if (audioLevels) return audioLevels;
  let saved: Partial<AudioLevels> = {};
  try { const parsed: unknown = JSON.parse(window.localStorage.getItem(LEVELS_KEY) || '{}'); if (parsed && typeof parsed === 'object') saved = parsed as Partial<AudioLevels>; } catch { /* Defaults also work without storage. */ }
  const level = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
  return audioLevels = { music: level(saved.music, .3), effects: level(saved.effects, 1) };
}
export function setAudioLevels(levels: AudioLevels) {
  audioLevels = { music: Math.max(0, Math.min(1, levels.music)), effects: Math.max(0, Math.min(1, levels.effects)) };
  try { window.localStorage.setItem(LEVELS_KEY, JSON.stringify(audioLevels)); } catch { /* Keep the current session usable. */ }
  syncAudio();
}
type PlayOptions = { detune?: number; gain?: number };
type Sample = { file: string; world: SoundWorld; gain: number; loop?: boolean; duration?: number; fallback: SoundKind };
export const sampleBank: Partial<Record<SoundKind, Sample>> = {
  observatory: { file: "observatory-ambience", world: "observatory", gain: .07, loop: true, fallback: "hush" },
  "red-dunes": { file: "mars-ambience", world: "mars", gain: .07, loop: true, fallback: "gust-dust" },
  "crystal-hum": { file: "lumina-ambience", world: "lumina", gain: .07, loop: true, fallback: "chime" },
  "orbit-hum": { file: "atlas-ambience", world: "atlas", gain: .07, loop: true, fallback: "orbit" },
  veil: { file: "epilogue-ambience", world: "epilogue", gain: .07, loop: true, fallback: "shimmer" },
  "snow-bed": { file: "snow-ambience", world: "niveora", gain: .06, loop: true, fallback: "snow" },
  wind: { file: "wind", world: "niveora", gain: .08, loop: true, fallback: "wind" },
  blizzard: { file: "blizzard", world: "niveora", gain: .1, loop: true, fallback: "gust" },
  thunder: { file: "thunder", world: "niveora", gain: .12, duration: 4, fallback: "rumble" },
  comet: { file: "comet-whoosh", world: "observatory", gain: .08, duration: 2, fallback: "warp" },
  "gust-dust": { file: "dust-storm", world: "mars", gain: .1, duration: 1.8, fallback: "gust-dust" },
  dig: { file: "rover", world: "mars", gain: .08, duration: 1, fallback: "dig" },
  holo: { file: "hologram", world: "atlas", gain: .08, duration: 1, fallback: "holo" },
  descent: { file: "travel", world: "atlas", gain: .09, duration: 1.6, fallback: "descent" },
  dive: { file: "space-pulse", world: "epilogue", gain: .1, duration: 2.5, fallback: "dive" },
  chime: { file: "crystal-chime", world: "lumina", gain: .09, duration: 1.8, fallback: "chime" },
  garden: { file: "garden-ambience", world: "aurelia", gain: .08, loop: true, fallback: "garden" },
  bloom: { file: "bloom-chime", world: "aurelia", gain: .1, duration: 2, fallback: "bloom" },
  "garden-bloom": { file: "bloom-chime", world: "aurelia", gain: .1, duration: 2, fallback: "garden-bloom" },
  relay: { file: "beacon", world: "aurelia", gain: .08, duration: 2, fallback: "relay" },
  "beacon-sample": { file: "beacon", world: "aurelia", gain: .08, duration: 2, fallback: "relay" },
};
const worldAmbience: Record<SoundWorld, SoundKind> = {
  aurelia: "garden", observatory: "observatory", niveora: "wind", mars: "red-dunes",
  lumina: "crystal-hum", atlas: "orbit-hum", epilogue: "veil",
};
const buffers = new Map<string, AudioBuffer>();
const loads = new Map<string, Promise<AudioBuffer | null>>();
const desiredLoops = new Map<SoundKind, PlayOptions>();
const offsets = new Map<SoundKind, number>();
const loopFallbacks = new Set<SoundKind>();
type Voice = { source: AudioScheduledSourceNode; gain: GainNode; kind: SoundKind; started: number; offset: number; duration?: number };
const voices = new Set<Voice>();
const loops = new Map<SoundKind, Voice>();
const audible = () => typeof window !== "undefined" && isSoundEnabled() && !document.hidden;

function audioContext() {
  if (!context) {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
  }
  return context;
}

function listen() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener("visibilitychange", syncAudio);
}

// Failed requests are cached too: a missing asset must not cause a fetch on every hover/replay.
function loadSample(sample: Sample): Promise<AudioBuffer | null> {
  const cached = loads.get(sample.file);
  if (cached) return cached;
  const audio = audioContext();
  const request = (async () => {
    for (const extension of ["ogg", "mp3"]) {
      try {
        const response = await fetch(`/sfx/${sample.file}.${extension}`);
        if (!response.ok) continue;
        const buffer = await audio.decodeAudioData(await response.arrayBuffer());
        buffers.set(sample.file, buffer);
        return buffer;
      } catch { /* Opus/network/decode failure: try MP3, then retain the synth. */ }
    }
    return null;
  })();
  loads.set(sample.file, request);
  return request;
}

function track(source: AudioScheduledSourceNode, gain: GainNode, kind: SoundKind, extra: Partial<Voice> = {}) {
  const voice: Voice = { source, gain, kind, started: context!.currentTime, offset: 0, ...extra };
  voices.add(voice);
  source.onended = () => { voices.delete(voice); source.disconnect(); gain.disconnect(); };
  return voice;
}

// cancelAndHoldAtTime is not available in every Web Audio implementation.
function hold(param: AudioParam, now: number) {
  if (typeof param.cancelAndHoldAtTime === "function") param.cancelAndHoldAtTime(now);
  else {
    const current = param.value;
    param.cancelScheduledValues(now);
    param.setValueAtTime(current, now);
  }
}

function stopVoice(voice: Voice, fade = .08) {
  const now = context!.currentTime;
  hold(voice.gain.gain, now);
  voice.gain.gain.linearRampToValueAtTime(0, now + fade);
  voice.source.stop(now + fade);
  voices.delete(voice);
  if (loops.get(voice.kind) === voice) {
    offsets.set(voice.kind, (voice.offset + now - voice.started) % voice.duration!);
    loops.delete(voice.kind);
  }
}

function startSample(kind: SoundKind, sample: Sample, buffer: AudioBuffer, options: PlayOptions) {
  if (!audible() || !inView || sample.world !== world || (sample.loop && loops.has(kind))) return;
  // One instance per file prevents overlapping aliases (bloom/garden-bloom, relay/beacon-sample).
  for (const voice of voices) if (sampleBank[voice.kind]?.file === sample.file) stopVoice(voice);
  const audio = audioContext(), now = audio.currentTime;
  const source = audio.createBufferSource(), gain = audio.createGain();
  source.buffer = buffer;
  source.loop = !!sample.loop;
  // Keep loop playback at its native speed so offsets stay exact across pause/resume.
  if (!sample.loop) source.detune.value = options.detune ?? 0;
  const level = sample.gain * Math.max(0, Math.min(1, options.gain ?? 1));
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(level, now + (sample.loop ? .6 : .025));
  source.connect(gain).connect(master!);
  const offset = sample.loop ? offsets.get(kind) ?? 0 : 0;
  const voice = track(source, gain, kind, { offset, duration: buffer.duration });
  source.start(now, offset);
  if (sample.loop) loops.set(kind, voice);
  else {
    const duration = Math.min(sample.duration!, buffer.duration / (2 ** ((options.detune ?? 0) / 1200)));
    gain.gain.setValueAtTime(level, now + Math.max(.025, duration - .15));
    gain.gain.linearRampToValueAtTime(0, now + duration);
    source.stop(now + duration);
  }
}

function syncLoops() {
  for (const [kind, voice] of loops) if (!audible() || !inView || !desiredLoops.has(kind)) stopVoice(voice, audible() ? .12 : 0);
  if (!audible() || !inView) return;
  for (const [kind, options] of desiredLoops) {
    const sample = sampleBank[kind]!;
    if (sample.world !== world || loops.has(kind)) continue;
    const buffer = buffers.get(sample.file);
    if (buffer) startSample(kind, sample, buffer, options);
    else {
      if (!loopFallbacks.has(kind)) { loopFallbacks.add(kind); synth(sample.fallback, options); }
      void loadSample(sample).then(loaded => {
        if (loaded && desiredLoops.has(kind)) startSample(kind, sample, loaded, desiredLoops.get(kind)!);
      });
    }
  }
}

function syncAudio() {
  clearTimeout(suspendTimer);
  syncMusic({ world, enabled: isSoundEnabled(), visible: inView && !document.hidden, volume: getAudioLevels().music });
  if (!audible()) {
    if (context && master) {
      const now = context.currentTime;
      hold(master.gain, now);
      master.gain.linearRampToValueAtTime(0, now + (document.hidden ? 0 : .04));
      for (const voice of voices) stopVoice(voice, document.hidden ? 0 : .04);
      // Hidden tabs suspend immediately; mute gets a short click-free fade.
      if (document.hidden) void context.suspend().catch(() => {});
      else suspendTimer = setTimeout(() => { if (!audible()) void context?.suspend().catch(() => {}); }, 50);
    }
    return;
  }
  const audio = audioContext();
  if (audio.state === "suspended") void audio.resume().catch(() => {});
  hold(master!.gain, audio.currentTime);
  master!.gain.linearRampToValueAtTime(getAudioLevels().effects, audio.currentTime + .08);
  syncLoops();
}

/** FxLayer owns the current page and its intersection, independently of motion preferences. */
export function setSoundWorld(value: string | undefined, visible = true) {
  listen();
  const next = WORLDS.includes(value ?? "") ? value as SoundWorld : undefined;
  if (next !== world) {
    for (const voice of voices) stopVoice(voice, .5);
    desiredLoops.clear(); offsets.clear(); loopFallbacks.clear();
    world = next;
    if (world) desiredLoops.set(worldAmbience[world], {});
  }
  inView = visible;
  syncAudio();
}

/** Stop a requested loop (for example when a whiteout ends); mute/visibility retain its intent. */
export function stop(kind: SoundKind) {
  desiredLoops.delete(kind);
  const voice = loops.get(kind);
  if (voice) stopVoice(voice);
  offsets.delete(kind);
  loopFallbacks.delete(kind);
  if (kind === "blizzard" && world === "niveora") desiredLoops.set("wind", {});
  syncLoops();
}

export function isSoundEnabled() {
  if (enabled === null) {
    try { enabled = typeof window !== "undefined" && readSoundPreference(window.localStorage); }
    catch { enabled = false; }
  }
  return enabled;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
  try { writeSoundPreference(window.localStorage, value); } catch { /* Keep the in-memory preference when storage access is blocked. */ }
  listen();
  syncAudio();
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: value }));
  if (value) play("granted");
}

let noise: AudioBuffer | null = null;
const noiseBuffer = (audio: AudioContext) => {
  if (noise) return noise;
  noise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
  const channel = noise.getChannelData(0);
  for (let index = 0; index < channel.length; index++) channel[index] = Math.random() * 2 - 1;
  return noise;
};

// `detune` (cents) and `gain` (multiplier) vary a sound per play, so repeated keys never sound robotic.
export function play(kind: SoundKind, options: PlayOptions = {}) {
  listen();
  kind = worldSound(world, kind);
  const sample = sampleBank[kind];
  if (sample?.loop && sample.world === world) {
    desiredLoops.set(kind, options);
    if (kind === "blizzard") desiredLoops.delete("wind");
    syncAudio();
    return;
  }
  if (!audible() || !allowed(kind, performance.now())) return;
  syncAudio();
  if (sample && sample.world === world) {
    if (!inView) return;
    const buffer = buffers.get(sample.file);
    if (buffer) { startSample(kind, sample, buffer, options); return; }
    // Immediate synth feedback on a cold cache; never replay a stale impact after an async load.
    void loadSample(sample);
    synth(sample.fallback, options);
  } else synth(kind, options);
}

function synth(kind: SoundKind, { detune = 0, gain: level = 1 }: PlayOptions) {
  if (!context || !master) return;
  const now = context.currentTime;
  for (const tone of soundBank[kind]) {
    const start = now + (tone.delay ?? 0);
    const gain = context.createGain();
    gain.gain.setValueAtTime(tone.gain * level, start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + tone.duration);
    gain.connect(master);
    if (tone.wave === "noise") {
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      source.buffer = noiseBuffer(context);
      source.playbackRate.value = 2 ** (detune / 1200);
      filter.type = "bandpass"; filter.Q.value = 1.2;
      filter.frequency.setValueAtTime(tone.from, start);
      filter.frequency.exponentialRampToValueAtTime(tone.to, start + tone.duration);
      source.connect(filter).connect(gain);
      track(source, gain, kind);
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); for (const voice of voices) if (voice.source === source) voices.delete(voice); };
      source.start(start, Math.random() * .5);
      source.stop(start + tone.duration + .02);
      continue;
    }
    const oscillator = context.createOscillator();
    oscillator.type = tone.wave;
    oscillator.detune.value = detune;
    oscillator.frequency.setValueAtTime(tone.from, start);
    oscillator.frequency.exponentialRampToValueAtTime(tone.to, start + tone.duration);
    oscillator.connect(gain);
    track(oscillator, gain, kind);
    oscillator.start(start);
    oscillator.stop(start + tone.duration + .02);
  }
}
