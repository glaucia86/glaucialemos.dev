import { afterEach, describe, expect, it, vi } from "vitest";
import { EGGS, FOUND_KEY, discover, forget, getFoundSnapshot, remainingDiscoveries, matchPhrase, subscribeReset } from "@/lib/eggs";
import { storySources } from "@/lib/niveora-stories";
import { niveoraStories, curiousLetter } from "@/i18n/niveora-stories";

afterEach(() => { forget({ removeItem: () => {} }); vi.unstubAllGlobals(); });
describe("segredos narrativos", () => {
  it("sincroniza reset entre abas sem confundir outras descobertas com reset", () => {
    vi.stubGlobal("window", new EventTarget());
    const reset = vi.fn(); const stop = subscribeReset(reset);
    const storage = (key: string | null, newValue: string | null) => window.dispatchEvent(Object.assign(new Event("storage"), { key, newValue }));
    storage(FOUND_KEY, '["whiteout"]'); storage("other", null);
    expect(reset).not.toHaveBeenCalled();
    storage(FOUND_KEY, null); storage(null, null); storage(FOUND_KEY, "[]");
    expect(reset).toHaveBeenCalledTimes(3);
    stop(); storage(FOUND_KEY, null); expect(reset).toHaveBeenCalledTimes(3);
  });
  it("mantém três registros com fontes e textos completos em todos os idiomas", () => {
    expect(storySources).toHaveLength(3);
    expect(storySources[0]).toBe("https://www.udemy.com/user/glaucialemos/");
    expect(storySources[2]).toContain("generative-ai-for-beginners/pulls");
    for (const lang of ["pt", "en", "es"] as const) {
      expect(niveoraStories[lang].records).toHaveLength(3);
      for (const record of niveoraStories[lang].records) expect(record.text.length).toBeGreaterThan(30);
      expect(curiousLetter[lang].locked).toContain("{n}");
      expect(curiousLetter[lang].body.length).toBeGreaterThan(100);
    }
  });
  it("a carta exige três descobertas válidas distintas e não conta a si mesma", () => {
    expect(remainingDiscoveries("curious-letter", [])).toBe(3);
    expect(remainingDiscoveries("curious-letter", ["whiteout", "whiteout", "curious-letter", "unknown"])).toBe(2);
    expect(remainingDiscoveries("curious-letter", ["wish", "between-lines", "borrowed-star"])).toBe(0);
    expect(remainingDiscoveries("between-lines", [])).toBe(0);
    expect(EGGS.filter(egg => egg.page === "about")).toHaveLength(7);
    expect(EGGS.filter(egg => egg.page === "content")).toHaveLength(7);
    expect(EGGS).toHaveLength(37);
    expect(matchPhrase("entre linhas")).toBe("between-lines");
    expect(matchPhrase("borrowed star")).toBe("borrowed-star");
    expect(matchPhrase("carta curiosa")).toBe("curious-letter");
  });
  it("bloqueia descoberta antecipada, persiste a carta e reseta sua elegibilidade", () => {
    let stored = "[]";
    vi.stubGlobal("window", Object.assign(new EventTarget(), { localStorage: {
      getItem: () => stored, setItem: (_key: string, value: string) => { stored = value; }, removeItem: () => { stored = "[]"; },
    } }));
    discover("curious-letter"); expect(getFoundSnapshot()).toBe("");
    discover("wish"); discover("between-lines"); discover("borrowed-star");
    discover("curious-letter"); discover("curious-letter");
    expect(JSON.parse(stored)).toHaveLength(4);
    expect(getFoundSnapshot().split(",")).toContain("curious-letter");
    forget(); expect(remainingDiscoveries("curious-letter", getFoundSnapshot().split(","))).toBe(3);
  });
});
