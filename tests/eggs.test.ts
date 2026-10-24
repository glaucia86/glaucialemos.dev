import { describe, expect, it } from "vitest";
import { EGGS, KONAMI_GESTURES, eggsFor, forget, gestureOf, konamiStep, matchPhrase, matchTail, normalizePhrase, pageOf, readFound, FOUND_KEY } from "@/lib/eggs";

describe("easter eggs", () => {
  it("normaliza frases com acento, espaço e pontuação", () => {
    expect(normalizePhrase("Eu te amo!")).toBe("euteamo");
    expect(normalizePhrase("Canhão de íons")).toBe("canhaodeions");
    expect(normalizePhrase("C-3PO")).toBe("cpo");
    expect(matchPhrase("  HELP me ")).toBe("holo");
    expect(matchPhrase("cañón")).toBe("ion");
    expect(matchPhrase("help me", ["iknow"])).toBeNull();
    expect(matchPhrase("transmissão desconhecida")).toBeNull();
  });

  it("encontra a frase no fim do buffer do teclado", () => {
    expect(matchTail("abchoth", ["blizzard"])).toBe("blizzard");
    expect(matchTail("iloveyo", ["iknow"])).toBeNull();
  });

  it("separa os segredos por página, com os globais em todas", () => {
    expect(pageOf("/pt")).toBe("home");
    expect(pageOf("/en/sobre")).toBe("about");
    expect(pageOf("/es/eventos")).toBe("global");
    expect(eggsFor("home").map((egg) => egg.id)).toEqual(["konami", "force-push", "force-hold", "deflect"]);
    expect(eggsFor("about").every((egg) => egg.page !== "home")).toBe(true);
    expect(new Set(EGGS.flatMap((egg) => egg.phrases)).size).toBe(EGGS.flatMap((egg) => egg.phrases).length);
  });

  it("lê os segredos descobertos com storage vazio, inválido ou bloqueado", () => {
    expect(readFound({ getItem: () => null })).toEqual([]);
    expect(readFound({ getItem: () => "{" })).toEqual([]);
    expect(readFound({ getItem: () => { throw new Error("blocked"); } })).toEqual([]);
    expect(readFound({ getItem: (key) => key === FOUND_KEY ? '["probe","nope","holo"]' : null })).toEqual(["holo", "probe"]);
  });

  it("apaga a memória de segredos, mesmo com storage bloqueado", () => {
    const store = new Map([[FOUND_KEY, '["holo"]']]);
    forget({ removeItem: (key) => store.delete(key) });
    expect(readFound({ getItem: (key) => store.get(key) ?? null })).toEqual([]);
    expect(() => forget({ removeItem: () => { throw new Error("blocked"); } })).not.toThrow();
  });

  it("reconhece o Konami por gestos e recomeça quando erra", () => {
    expect(gestureOf(0, -120, 200)).toBe("up");
    expect(gestureOf(-90, 10, 200)).toBe("left");
    expect(gestureOf(3, 2, 120)).toBe("tap");
    expect(gestureOf(60, 60, 200)).toBeNull();
    expect(gestureOf(0, -120, 1500)).toBeNull();
    expect(KONAMI_GESTURES.reduce(konamiStep, 0)).toBe(KONAMI_GESTURES.length);
    expect(konamiStep(3, "left")).toBe(0);
    expect(konamiStep(2, "up")).toBe(1);
  });
});
