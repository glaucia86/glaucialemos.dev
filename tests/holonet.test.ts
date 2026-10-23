import { describe, expect, it } from "vitest";
import { shouldBoot, bootScript, BOOT_KEY } from "@/lib/boot";
import { readSoundPreference, writeSoundPreference, soundBank, SOUND_KEY } from "@/lib/sfx";

describe("boot da HoloNet", () => {
  it.each([
    [{ seen: false, systemReduced: false, manualReduced: false }, true],
    [{ seen: true, systemReduced: false, manualReduced: false }, false],
    [{ seen: false, systemReduced: true, manualReduced: false }, false],
    [{ seen: false, systemReduced: false, manualReduced: true }, false],
  ])("decide se a abertura toca (%#)", (input, expected) => {
    expect(shouldBoot(input)).toBe(expected);
  });

  it("o script inline usa a mesma chave de sessão e respeita as duas preferências", () => {
    expect(bootScript).toContain(`sessionStorage.getItem("${BOOT_KEY}")`);
    expect(bootScript).toContain('localStorage.getItem("reduce-motion")');
    expect(bootScript).toContain("prefers-reduced-motion: reduce");
    expect(bootScript).toMatch(/try\{[\s\S]*\}catch/);
  });
});

describe("efeitos sonoros", () => {
  it("ficam desligados por padrão e com storage indisponível", () => {
    expect(readSoundPreference({ getItem: () => null })).toBe(false);
    expect(readSoundPreference(undefined)).toBe(false);
    expect(readSoundPreference({ getItem: () => { throw new Error("blocked"); } })).toBe(false);
  });

  it("persistem somente a escolha explícita", () => {
    const store = new Map<string, string>();
    writeSoundPreference({ setItem: (key, value) => store.set(key, value) }, true);
    expect(store.get(SOUND_KEY)).toBe("true");
    expect(readSoundPreference({ getItem: (key) => store.get(key) ?? null })).toBe(true);
    expect(() => writeSoundPreference({ setItem: () => { throw new Error("blocked"); } }, true)).not.toThrow();
  });

  it("mantém volumes baixos e durações curtas", () => {
    for (const tones of Object.values(soundBank)) for (const tone of tones) {
      expect(tone.gain).toBeLessThanOrEqual(.08);
      expect(tone.duration).toBeLessThanOrEqual(.6);
    }
  });
});
