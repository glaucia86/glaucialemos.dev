import type { SoundKind, SoundWorld } from "./sfx";

// Shared interactions acquire the material of their world; Aurélia keeps its original mix.
const VOICES: Partial<Record<SoundWorld, Partial<Record<SoundKind, SoundKind>>>> = {
  observatory: { success: "wish", switch: "twinkle" },
  niveora: { success: "aurora", switch: "snow" },
  mars: { success: "sprout", switch: "build" },
  lumina: { success: "prism", switch: "link" },
  atlas: { success: "citylights", switch: "visor" },
  epilogue: { success: "shimmer", switch: "star-ping" },
};

export function worldSound(world: SoundWorld | undefined, kind: SoundKind): SoundKind {
  return (world && VOICES[world]?.[kind]) || kind;
}
