// 8-bit effects synthesized with Web Audio: no files, off by default, opt-in only.
export type SoundKind = "blip" | "key" | "boot" | "granted" | "push" | "saber" | "error" | "success" | "levitate" | "deflect" | "rumble" | "splash";
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
