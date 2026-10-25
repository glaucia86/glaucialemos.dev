import { describe, expect, it } from "vitest";
import { EGGS, KONAMI_GESTURES, eggsFor, forget, gestureOf, konamiStep, matchPhrase, matchTail, normalizePhrase, pageOf, readFound, FOUND_KEY } from "@/lib/eggs";

describe("easter eggs", () => {
  it("normaliza frases com acento, espaço e pontuação", () => {
    expect(normalizePhrase("Eu te amo!")).toBe("euteamo");
    expect(normalizePhrase("Canhão de íons")).toBe("canhaodeions");
    expect(normalizePhrase("C-3PO")).toBe("cpo");
    expect(matchPhrase("  CÁPSULA ")).toBe("memory-capsule");
    expect(matchPhrase("Ventisca!")).toBe("whiteout");
    expect(matchPhrase("cápsula", ["whiteout"])).toBeNull();
    expect(matchPhrase("transmissão desconhecida")).toBeNull();
  });

  it("encontra a frase no fim do buffer do teclado", () => {
    expect(matchTail("abcnevasca", ["whiteout"])).toBe("whiteout");
    expect(matchTail("pegada", ["paw-tracks"])).toBeNull();
  });

  it("separa os segredos por página, com os globais em todas", () => {
    expect(pageOf("/pt")).toBe("home");
    expect(pageOf("/en/sobre")).toBe("about");
    expect(pageOf("/es/eventos")).toBe("events");
    expect(pageOf("/pt/conteudo")).toBe("content");
    expect(pageOf("/en/servicos/")).toBe("services");
    expect(pageOf("/pt/rota-perdida")).toBe("notfound");
    expect(pageOf("/pt/projetos/qualquer-coisa")).toBe("notfound");
    expect(eggsFor("home").map((egg) => egg.id)).toEqual(["star-map", "curious-letter", "focus-lens", "launch-charge", "dog-signal", "hangar-check", "dark-sky", "wish"]);
    expect(eggsFor("notfound").map((egg) => egg.id)).toEqual(["star-map", "curious-letter"]);
    expect(eggsFor("about").map((egg) => egg.id)).toEqual(["star-map", "curious-letter", "paw-tracks", "memory-capsule", "whiteout", "aurora-prism", "snowdrift", "between-lines", "borrowed-star"]);
    expect(new Set(EGGS.flatMap((egg) => egg.phrases)).size).toBe(EGGS.flatMap((egg) => egg.phrases).length);
  });

  it("reconhece os segredos de Marte na página de Projetos", () => {
    expect(pageOf("/pt/projetos")).toBe("projects");
    expect(pageOf("/en/projetos/")).toBe("projects");
    expect(eggsFor("projects").map((egg) => egg.id)).toEqual(["star-map", "curious-letter", "rover-scan", "sample-cache", "terminal-launch", "first-sprout", "before-pretty", "lost-bug", "dust-fall"]);
    expect(matchPhrase("npx glaucia_lemos86")).toBe("terminal-launch");
    expect(matchPhrase("Varredura")).toBe("rover-scan");
    expect(matchPhrase("Carcaça")).toBe("before-pretty");
    expect(matchPhrase("Poeira")).toBe("dust-fall");
    expect(matchTail("xxdepurar", ["lost-bug"])).toBe("lost-bug");
    expect(matchTail("umbroto", ["first-sprout"])).toBe("first-sprout");
  });

  it("lê os segredos descobertos com storage vazio, inválido ou bloqueado", () => {
    expect(readFound({ getItem: () => null })).toEqual([]);
    expect(readFound({ getItem: () => "{" })).toEqual([]);
    expect(readFound({ getItem: () => { throw new Error("blocked"); } })).toEqual([]);
    expect(readFound({ getItem: (key) => key === FOUND_KEY ? '["whiteout","nope","paw-tracks"]' : null })).toEqual(["paw-tracks", "whiteout"]);
  });

  it("apaga a memória de segredos, mesmo com storage bloqueado", () => {
    const store = new Map([[FOUND_KEY, '["whiteout"]']]);
    forget({ removeItem: (key) => store.delete(key) });
    expect(readFound({ getItem: (key) => store.get(key) ?? null })).toEqual([]);
    expect(() => forget({ removeItem: () => { throw new Error("blocked"); } })).not.toThrow();
  });

  it("reconhece os segredos do observatório na página inicial", () => {
    expect(matchPhrase("Telescópio")).toBe("focus-lens");
    expect(matchPhrase("decolar!")).toBe("launch-charge");
    expect(matchPhrase("Príncipe")).toBe("dog-signal");
    expect(matchPhrase("au au")).toBe("dog-signal");
    expect(matchPhrase("hangar")).toBe("hangar-check");
    expect(matchPhrase("konami")).toBe("star-map");
    expect(matchPhrase("mapa estelar")).toBe("star-map");
    expect(matchPhrase("Via Láctea")).toBe("dark-sky");
    expect(matchPhrase("estrela cadente")).toBe("wish");
    expect(matchTail("vamosdesejo", ["wish"])).toBe("wish");
    expect(matchPhrase("amanhecer")).toBeNull();
  });

  it("reconhece os segredos de Nivéora na página Sobre", () => {
    expect(matchPhrase("pegadas")).toBe("paw-tracks");
    expect(matchPhrase("Memória")).toBe("memory-capsule");
    expect(matchPhrase("aurora")).toBe("aurora-prism");
    expect(matchPhrase("neve")).toBe("snowdrift");
    expect(matchPhrase("hoth")).toBeNull();
  });

  it("usa uma memória nova, sem herdar segredos do tema anterior", () => {
    expect(FOUND_KEY).toBe("galaxia-encantada:eggs:v2");
    expect(readFound({ getItem: (key) => key === "holonet-secrets" ? '["konami"]' : null })).toEqual([]);
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
