import { describe, expect, it } from "vitest";
import { MIN_GAP, allowed, soundBank, uiSound } from "@/lib/sfx";

describe("sons dos mundos", () => {
  it("cada mundo migrado tem a sua voz de hover e clique; os outros mantêm a original", () => {
    expect(uiSound("observatory", "hover")).toBe("hover-observatory");
    expect(uiSound("niveora", "click")).toBe("click-niveora");
    expect(uiSound("mars", "hover")).toBe("hover-mars");
    expect(uiSound(undefined, "hover")).toBe("blip");
    expect(uiSound("lumina", "hover")).toBe("hover-lumina");
    expect(uiSound("nevarro", "click")).toBe("key");
    for (const world of ["observatory", "niveora", "mars", "lumina"]) for (const action of ["hover", "click"] as const) expect(soundBank[uiSound(world, action)].length).toBeGreaterThan(0);
  });

  it("não empilha teclas: respeita o intervalo mínimo de cada som", () => {
    const played = new Map();
    expect(allowed("type", 1000, played)).toBe(true);
    expect(allowed("type", 1000 + MIN_GAP.type! - 1, played)).toBe(false);
    expect(allowed("type", 1000 + MIN_GAP.type!, played)).toBe(true);
    expect(allowed("success", 1000, played)).toBe(true);
    expect(allowed("success", 1000, played)).toBe(true);
  });

  it("o terminal de Marte tem digitação, retorno, disquete e CRT, todos curtos", () => {
    for (const kind of ["type", "return", "disk-in", "disk-out", "crt-on", "dig"] as const) {
      expect(soundBank[kind].length, kind).toBeGreaterThan(0);
      for (const tone of soundBank[kind]) expect((tone.delay ?? 0) + tone.duration, kind).toBeLessThanOrEqual(.6);
    }
    expect(soundBank.type.some((tone) => tone.wave === "noise")).toBe(true);
  });

  it("o epílogo tem voz própria e uma sequência de impacto, toda curta", () => {
    expect(uiSound("epilogue", "hover")).toBe("hover-epilogue");
    expect(uiSound("epilogue", "click")).toBe("click-epilogue");
    for (const kind of ["implode", "nova", "shimmer", "bloom", "star-ping", "slam", "credits-chord", "transmission", "dive", "hover-epilogue", "click-epilogue"] as const) {
      expect(soundBank[kind].length, kind).toBeGreaterThan(0);
      for (const tone of soundBank[kind]) expect((tone.delay ?? 0) + tone.duration, kind).toBeLessThanOrEqual(.6);
    }
    expect(soundBank.nova.some((tone) => tone.from < 100 && tone.wave === "sine")).toBe(true);
  });

  it("Lúmina tem cristal, página, prisma, scanner, eco, entardecer e o túnel, todos curtos", () => {
    for (const kind of ["chime", "page", "prism", "scanner", "echo", "link", "dusk", "refract", "facet", "hover-lumina", "click-lumina"] as const) {
      expect(soundBank[kind].length, kind).toBeGreaterThan(0);
      for (const tone of soundBank[kind]) expect((tone.delay ?? 0) + tone.duration, kind).toBeLessThanOrEqual(.6);
    }
  });
});
