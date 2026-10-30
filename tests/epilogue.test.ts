import { afterEach, describe, expect, it, vi } from "vitest";
import { discoveredWorldCount, epilogueRemaining, epilogueUnlocked } from "@/lib/epilogue";
import { EGGS, discover, forget, getFoundSnapshot, matchPhrase, pageOf, remainingDiscoveries, subscribeFound, FOUND_KEY } from "@/lib/eggs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BeyondOrbitScene } from "@/components/epilogue/BeyondOrbitScene";
import { EpilogueVoyage } from "@/components/epilogue/EpilogueVoyage";
import { beyondOrbit } from "@/i18n/beyond-orbit";
import { comlink } from "@/i18n/comlink";

const worlds = ["focus-lens", "paw-tracks", "rover-scan", "first-page"] as const;
afterEach(() => { forget({ removeItem: () => {} }); vi.unstubAllGlobals(); });

describe("epilogue eligibility", () => {
  it.each([0, 1, 2, 3, 4])("counts %i distinct worlds", count => {
    const found = worlds.slice(0, count);
    expect(discoveredWorldCount(found)).toBe(count);
    expect(epilogueRemaining(found)).toBe(Math.max(0, 3 - count));
    expect(epilogueUnlocked(found)).toBe(count >= 3);
  });
  it("ignores duplicates, unknown ids and discoveries outside the four worlds", () => {
    const found = ["focus-lens", "focus-lens", "wish", "dog-signal", "star-map", "curious-letter", "last-light", "epilogue-signal", "garden-bloom", "beacon-relay", "invalid"];
    expect(discoveredWorldCount(found)).toBe(1);
    expect(remainingDiscoveries("epilogue-signal", found)).toBe(2);
    expect(remainingDiscoveries("curious-letter", ["focus-lens", "wish", "dog-signal"])).toBe(0);
  });
  it.each([0, 1, 2, 3, 4])("keeps the gate at three original worlds even with every Aurélia secret (%i worlds)", count => {
    const gardens = EGGS.filter((egg) => egg.page === "services" && egg.id !== "epilogue-signal").map((egg) => egg.id);
    const found = [...worlds.slice(0, count), ...gardens];
    expect(discoveredWorldCount(found)).toBe(count);
    expect(epilogueRemaining(found)).toBe(Math.max(0, 3 - count));
    expect(epilogueUnlocked(found)).toBe(count >= 3);
  });
  it.each(["Além da última órbita!", "Beyond the Last Orbit", "Más allá de la última órbita"])("recognizes %s", phrase => {
    expect(matchPhrase(phrase)).toBe("epilogue-signal");
  });
  it.each(["pt", "en", "es"])("maps the route in %s", lang => {
    expect(pageOf(`/${lang}/alem-da-ultima-orbita`)).toBe("epilogue");
    expect(EGGS).toHaveLength(50);
  });
});

it.each(["pt", "en", "es"] as const)("renders an accessible static finale and localized radio copy in %s", lang => {
  const copy = beyondOrbit[lang];
  const html = renderToStaticMarkup(createElement(BeyondOrbitScene, { copy }));
  expect(html).toContain("To be continued…");
  expect(html).toContain(copy.postscript);
  expect(html).toContain(`aria-label="${copy.starAction}"`);
  expect(html).not.toContain("data-waiting");
  expect(html).toContain('role="img"');
  expect(html).toContain(`aria-label="${copy.sceneAlt}"`);
  expect(html).toContain('/galaxia/scenes/beyond-orbit/background.webp');
  expect(html).toContain('data-orbit-actor="glaucia"');
  expect(html).toContain('data-orbit-actor="prince"');
  expect(html).toContain(copy.skip);
  expect(html).toContain(copy.starHint);
  const voyage = renderToStaticMarkup(createElement(EpilogueVoyage, { copy, lang }));
  for (const text of [copy.creditsTitle, copy.postTitle, copy.postNone, copy.letterTitle, copy.atlasTitle, copy.nextStar, copy.worlds.services, copy.worlds.notfound, ...copy.letter]) expect(voyage).toContain(text.replace("'", "&#x27;"));
  expect(voyage).toContain(`aria-label="${copy.replay}"`);
  expect(voyage).not.toContain("beyond-orbit__star\"");
  expect(voyage).not.toContain("data-waiting");
  expect(voyage).toContain(`href="/${lang}/sobre"`);
  expect(voyage).not.toContain(`>${copy.back}<`);
  expect(voyage.match(/class="beyond-orbit__world-stop"/g)).toHaveLength(7);
  const gardens = voyage.slice(voyage.indexOf('data-world="services"'), voyage.indexOf('data-world="notfound"'));
  expect(gardens).toContain('data-charted="true"');
  expect(gardens).toContain(copy.worlds.services);
  expect(gardens).toContain('/galaxia/scenes/aurelia/background.webp');
  expect(gardens).toContain(`href="/${lang}/servicos"`);
  expect(gardens).toContain(copy.found.replace("{found}", "0").replace("{total}", "7"));
  expect(gardens.match(/<i style=/g)).toHaveLength(7);
  expect(gardens).not.toContain(copy.faint);
  expect(gardens).not.toContain(copy.signalTitle);
  for (const egg of EGGS.filter((egg) => egg.page === "services" && egg.id !== "epilogue-signal")) {
    expect(gardens).toContain(comlink[lang].eggs[egg.id].hint);
  }
  const redTide = voyage.slice(voyage.indexOf('data-world="notfound"'), voyage.indexOf("</ol>"));
  expect(redTide).toContain('data-charted="true"');
  expect(redTide).toContain(copy.worlds.notfound);
  expect(redTide).toContain('/galaxia/scenes/red-tide/poster.webp');
  expect(redTide).toContain('--accent:#f07072;--glow:#ffbc78');
  expect(redTide).toContain(copy.found.replace("{found}", "0").replace("{total}", "2"));
  expect(redTide.match(/<i style=/g)).toHaveLength(2);
  for (const id of ["signal-recovered", "paw-rescue"] as const) expect(redTide).toContain(comlink[lang].eggs[id].hint);
  expect(redTide).not.toContain("<a ");
  expect(voyage).not.toContain(copy.faint);
  expect(html).not.toContain('data-uncharted="true"');
  expect(html).toContain("/galaxia/scenes/beyond-orbit/ambient.webp");
  expect(html.match(/class="beyond-orbit__node"/g)).toHaveLength(EGGS.length);
  expect(comlink[lang].epilogue.signalLocked).toBe(copy.signalLocked);
  expect(comlink[lang].epilogue.revisit).toBe(copy.revisit);
  expect(comlink[lang].pages.epilogue).toBe(copy.title);
});

it.each([false, true])("gates, persists, deduplicates and resets with blocked storage = %s", blocked => {
  let stored: string | null = null;
  vi.stubGlobal("window", Object.assign(new EventTarget(), { localStorage: {
    getItem: () => { if (blocked) throw Error("blocked"); return stored; },
    setItem: (_key: string, value: string) => { if (blocked) throw Error("blocked"); stored = value; },
    removeItem: () => { if (blocked) throw Error("blocked"); stored = null; },
  } }));
  const updates: string[] = [];
  const stop = subscribeFound(() => updates.push(getFoundSnapshot()));
  discover("epilogue-signal");
  expect(getFoundSnapshot()).toBe("");
  worlds.slice(0, 3).forEach(discover);
  discover("epilogue-signal"); discover("last-light"); discover("last-light");
  expect(updates).toHaveLength(5);
  expect(getFoundSnapshot()).toContain("epilogue-signal,last-light");
  if (!blocked) {
    expect(JSON.parse(stored!)).toContain("last-light");
    stored = '["first-page"]';
    window.dispatchEvent(Object.assign(new Event("storage"), { key: FOUND_KEY }));
    expect(getFoundSnapshot()).toBe("first-page");
  }
  forget(); expect(getFoundSnapshot()).toBe("");
  const count = updates.length;
  stop(); discover("last-light"); expect(updates).toHaveLength(count);
});
