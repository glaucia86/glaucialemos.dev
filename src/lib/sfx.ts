// 8-bit effects synthesized with Web Audio: no files, off by default, opt-in only.
export type SoundKind = "blip" | "key" | "boot" | "granted" | "push" | "saber" | "error" | "success" | "levitate" | "deflect" | "rumble" | "splash" | "ion" | "wind" | "ice" | "probe" | "holo" | "tauntaun" | "blaster" | "r2" | "jawa" | "pod" | "cantina" | "sunset" | "zap";
type Tone = { wave: OscillatorType; from: number; to: number; duration: number; gain: number; delay?: number };

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
  ion: [{ wave: "sawtooth", from: 60, to: 30, duration: .6, gain: .06 }, { wave: "square", from: 1800, to: 220, duration: .5, gain: .03, delay: .05 }, { wave: "triangle", from: 440, to: 110, duration: .55, gain: .04, delay: .1 }],
  wind: [{ wave: "triangle", from: 300, to: 520, duration: .6, gain: .015 }, { wave: "sine", from: 600, to: 380, duration: .6, gain: .012, delay: .25 }],
  ice: [{ wave: "square", from: 2400, to: 900, duration: .08, gain: .03 }, { wave: "square", from: 1800, to: 600, duration: .1, gain: .03, delay: .07 }, { wave: "triangle", from: 900, to: 120, duration: .4, gain: .04, delay: .12 }],
  probe: [{ wave: "sawtooth", from: 220, to: 40, duration: .5, gain: .06 }, { wave: "square", from: 90, to: 30, duration: .6, gain: .05, delay: .04 }],
  holo: [{ wave: "sine", from: 440, to: 660, duration: .3, gain: .03 }, { wave: "triangle", from: 880, to: 1320, duration: .4, gain: .02, delay: .15 }],
  tauntaun: [{ wave: "square", from: 300, to: 520, duration: .12, gain: .03 }, { wave: "square", from: 520, to: 260, duration: .2, gain: .03, delay: .13 }],
  blaster: [{ wave: "square", from: 1900, to: 260, duration: .16, gain: .035 }, { wave: "sawtooth", from: 950, to: 140, duration: .2, gain: .02, delay: .015 }],
  r2: [{ wave: "square", from: 1200, to: 2400, duration: .06, gain: .025 }, { wave: "square", from: 2600, to: 900, duration: .08, gain: .025, delay: .07 }, { wave: "square", from: 1800, to: 3000, duration: .05, gain: .025, delay: .17 }, { wave: "square", from: 900, to: 1600, duration: .1, gain: .025, delay: .24 }],
  jawa: [{ wave: "triangle", from: 700, to: 900, duration: .07, gain: .04 }, { wave: "triangle", from: 1100, to: 1300, duration: .07, gain: .04, delay: .09 }, { wave: "triangle", from: 1400, to: 1000, duration: .12, gain: .04, delay: .18 }],
  pod: [{ wave: "sawtooth", from: 80, to: 420, duration: .6, gain: .04 }, { wave: "square", from: 160, to: 840, duration: .6, gain: .015, delay: .05 }],
  cantina: [{ wave: "triangle", from: 523, to: 523, duration: .09, gain: .04 }, { wave: "triangle", from: 659, to: 659, duration: .09, gain: .04, delay: 0.13 }, { wave: "triangle", from: 784, to: 784, duration: .09, gain: .04, delay: 0.26 }, { wave: "triangle", from: 880, to: 880, duration: .09, gain: .04, delay: 0.39 }, { wave: "triangle", from: 784, to: 784, duration: .09, gain: .04, delay: 0.52 }, { wave: "triangle", from: 659, to: 659, duration: .09, gain: .04, delay: 0.65 }, { wave: "triangle", from: 698, to: 698, duration: .09, gain: .04, delay: 0.78 }, { wave: "triangle", from: 587, to: 587, duration: .09, gain: .04, delay: 0.91 }, { wave: "triangle", from: 523, to: 523, duration: .09, gain: .04, delay: 1.04 }, { wave: "triangle", from: 659, to: 659, duration: .09, gain: .04, delay: 1.17 }, { wave: "triangle", from: 784, to: 784, duration: .09, gain: .04, delay: 1.3 }, { wave: "triangle", from: 1046, to: 1046, duration: .09, gain: .04, delay: 1.43 }],
  sunset: [{ wave: "sine", from: 220, to: 220, duration: .6, gain: .03 }, { wave: "sine", from: 277, to: 277, duration: .6, gain: .025, delay: .15 }, { wave: "sine", from: 330, to: 330, duration: .6, gain: .025, delay: .3 }, { wave: "sine", from: 440, to: 440, duration: .6, gain: .02, delay: .45 }],
  zap: [{ wave: "square", from: 3000, to: 200, duration: .15, gain: .03 }, { wave: "sawtooth", from: 1800, to: 100, duration: .25, gain: .03, delay: .05 }, { wave: "square", from: 2400, to: 300, duration: .1, gain: .03, delay: .18 }],
};

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

export function play(kind: SoundKind) {
  if (!isSoundEnabled() || typeof window === "undefined") return;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  const now = context.currentTime;
  for (const tone of soundBank[kind]) {
    const start = now + (tone.delay ?? 0);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = tone.wave;
    oscillator.frequency.setValueAtTime(tone.from, start);
    oscillator.frequency.exponentialRampToValueAtTime(tone.to, start + tone.duration);
    gain.gain.setValueAtTime(tone.gain, start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + tone.duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + tone.duration + .02);
  }
}
