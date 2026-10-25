// 8-bit effects synthesized with Web Audio: no files, off by default, opt-in only.
export type SoundKind = "blip" | "key" | "boot" | "granted" | "push" | "saber" | "error" | "success" | "levitate" | "deflect" | "rumble" | "splash" | "wind" | "ice" | "holo" | "r2" | "jawa" | "pod" | "cantina" | "sunset" | "zap" | "twinkle" | "lens" | "woof" | "beacon" | "ignite" | "launch" | "hangar" | "switch" | "hush" | "catch" | "wish" | "warp" | "pawstep" | "capsule" | "aurora" | "gust" | "scan" | "dust" | "sprout" | "bug"
  | "type" | "return" | "disk-in" | "disk-out" | "crt-on" | "dig" | "thread" | "letter" | "snow" | "gust-dust" | "scan-sweep" | "static" | "build" | "brush"
  | "hover-observatory" | "click-observatory" | "hover-niveora" | "click-niveora" | "hover-mars" | "click-mars";
// "noise" is filtered white noise: `from`/`to` sweep the band-pass centre instead of a pitch.
type Tone = { wave: OscillatorType | "noise"; from: number; to: number; duration: number; gain: number; delay?: number };
export type SoundWorld = "observatory" | "niveora" | "mars";

export const SOUND_KEY = "sfx-enabled";
export const SOUND_EVENT = "sfx-change";

export const soundBank: Record<SoundKind, Tone[]> = {
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
  // Hover and click, one voice per world (FxLayer reads data-sound-world on <main>).
  "hover-observatory": [{ wave: "triangle", from: 2093, to: 2093, duration: .06, gain: .018 }],
  "click-observatory": [{ wave: "triangle", from: 1319, to: 1319, duration: .05, gain: .025 }, { wave: "triangle", from: 1760, to: 1760, duration: .07, gain: .02, delay: .05 }],
  "hover-niveora": [{ wave: "sine", from: 2637, to: 3136, duration: .05, gain: .018 }, { wave: "triangle", from: 4186, to: 4186, duration: .03, gain: .008, delay: .02 }],
  "click-niveora": [{ wave: "noise", from: 4000, to: 2500, duration: .04, gain: .03 }, { wave: "square", from: 1800, to: 1200, duration: .03, gain: .012 }],
  "hover-mars": [{ wave: "square", from: 1200, to: 1000, duration: .025, gain: .014 }, { wave: "noise", from: 3000, to: 3000, duration: .02, gain: .01 }],
  "click-mars": [{ wave: "noise", from: 1500, to: 900, duration: .04, gain: .035 }, { wave: "square", from: 300, to: 200, duration: .05, gain: .02 }],
};

// Minimum gap between two plays of the same sound, so fast typing or wiping never piles up (milliseconds).
export const MIN_GAP: Partial<Record<SoundKind, number>> = {
  type: 28, build: 40, brush: 70, snow: 400, "gust-dust": 1500, bug: 300, pawstep: 120,
  "hover-observatory": 40, "hover-niveora": 40, "hover-mars": 40, blip: 40,
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
  if (world === "observatory" || world === "niveora" || world === "mars") return `${action}-${world}`;
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
  window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: value }));
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
export function play(kind: SoundKind, { detune = 0, gain: level = 1 }: { detune?: number; gain?: number } = {}) {
  if (!isSoundEnabled() || typeof window === "undefined" || document.hidden) return;
  if (!allowed(kind, performance.now())) return;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  const now = context.currentTime;
  for (const tone of soundBank[kind]) {
    const start = now + (tone.delay ?? 0);
    const gain = context.createGain();
    gain.gain.setValueAtTime(tone.gain * level, start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + tone.duration);
    gain.connect(context.destination);
    if (tone.wave === "noise") {
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      source.buffer = noiseBuffer(context);
      source.playbackRate.value = 2 ** (detune / 1200);
      filter.type = "bandpass"; filter.Q.value = 1.2;
      filter.frequency.setValueAtTime(tone.from, start);
      filter.frequency.exponentialRampToValueAtTime(tone.to, start + tone.duration);
      source.connect(filter).connect(gain);
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
    oscillator.start(start);
    oscillator.stop(start + tone.duration + .02);
  }
}
