import { describe, expect, it, vi } from "vitest";
import { EGGS, type EggId } from "@/lib/egg-catalog";
import {
  ARM_WINDOW_MS, HOLD_MS, INITIAL_MOBILE_EGG_STATE, MIN_HOTSPOT_PX, MOBILE_EGG_QUERY, MOBILE_HOTSPOTS,
  SCAN_COOLDOWN_MS, SCAN_HIGHLIGHT_MS, assertMobileHotspots, edgeCues, hotspotScreenPoint,
  mobileEggReducer, nextGlowId, panStep, scanState, sceneXToReveal,
  type MobileEggState, type MobileHotspot, type MobileWorld,
} from "@/lib/mobile-eggs";
import { mobileEggs } from "@/i18n/mobile-eggs";
import { locales } from "@/i18n/config";
import { comlink } from "@/i18n/comlink";

const all = Object.values(MOBILE_HOTSPOTS).flat();
const worlds = Object.keys(MOBILE_HOTSPOTS) as MobileWorld[];
const hotspot = (id: EggId): MobileHotspot => all.find(h => h.id === id)!;
const tap = (id: EggId, now: number, state: MobileEggState = INITIAL_MOBILE_EGG_STATE, locked?: (id: EggId) => boolean) =>
  mobileEggReducer(state, { type: "tap", id, now }, locked);

describe("mobile hotspot contract", () => {
  it("imports and runs without browser globals", async () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    const mobileModule = await import("@/lib/mobile-eggs");
    expect(() => mobileModule.assertMobileHotspots()).not.toThrow();
    expect(MOBILE_EGG_QUERY).toContain("(orientation: portrait) and (max-width: 820px)");
    expect(MOBILE_EGG_QUERY).toContain("(pointer: coarse) and (max-width: 820px)");
    expect(MOBILE_EGG_QUERY).toContain("(pointer: coarse) and (orientation: landscape) and (max-height: 520px)");
  });

  it("assigns every catalog id to exactly one world, including globals", () => {
    expect(EGGS).toHaveLength(50);
    expect(all).toHaveLength(50);
    expect(new Set(all.map(h => h.id)).size).toBe(50);
    expect(all.map(h => h.id).sort()).toEqual(EGGS.map(egg => egg.id).sort());
    expect(() => assertMobileHotspots()).not.toThrow();
    expect(MOBILE_HOTSPOTS.home).toContainEqual(hotspot("star-map"));
    expect(MOBILE_HOTSPOTS.about).toContainEqual(hotspot("deep-night"));
    expect(MOBILE_HOTSPOTS.content).toContainEqual(hotspot("curious-letter"));
    expect(all.filter(h => h.kind === "hold").map(h => h.id).sort()).toEqual([
      "greenhouse-dusk", "launch-charge", "orbital-selfie",
    ]);
    expect(all.filter(h => h.gated).map(h => h.id).sort()).toEqual(["curious-letter", "epilogue-signal"]);
  });

  it("keeps centers below the identity block, within the plate, with usable hit diameters", () => {
    expect(MIN_HOTSPOT_PX).toBeGreaterThanOrEqual(60);
    for (const h of all) {
      expect(h.x).toBeGreaterThanOrEqual(0); expect(h.x).toBeLessThanOrEqual(100);
      expect(h.y).toBeGreaterThanOrEqual(33); expect(h.y).toBeLessThanOrEqual(100);
      expect(Math.max(MIN_HOTSPOT_PX, h.size / 100 * 1280)).toBeGreaterThanOrEqual(60);
    }
  });

  it("preserves all plate centers from the shared table", () => {
    // Independent spec fixture: order matters only within this table comparison.
    const expected: Record<MobileWorld, readonly (readonly [EggId, number, number])[]> = {
      home: [["focus-lens", 82.5, 56], ["dog-signal", 79, 84], ["hangar-check", 91.8, 36], ["dark-sky", 72.8, 77], ["wish", 44, 34], ["launch-charge", 62.5, 47], ["meteor-shower", 30, 35], ["star-map", 56, 37]],
      about: [["paw-tracks", 75.9, 72.7], ["memory-capsule", 84.4, 46], ["whiteout", 95, 84], ["aurora-prism", 69, 70.7], ["snowdrift", 38, 72], ["between-lines", 52, 35], ["borrowed-star", 40, 42], ["deep-night", 18, 38]],
      projects: [["rover-scan", 75.5, 57], ["sample-cache", 77.4, 86], ["terminal-launch", 95.5, 89], ["first-sprout", 82, 38], ["before-pretty", 63, 52], ["lost-bug", 50, 78], ["dust-fall", 70, 67], ["lost-commit", 38, 84]],
      content: [["crystal-whisper", 82.5, 75], ["first-page", 73.5, 80], ["prism-align", 68, 48], ["crystal-echo", 94, 60], ["series-constellation", 33, 36], ["library-dusk", 88, 34], ["retro-tv", 58, 72], ["curious-letter", 47, 56]],
      events: [["orbital-trail", 75.5, 58], ["constellation-route", 92, 58], ["dog-navigation", 84.4, 78.7], ["prince-antenna", 35, 36], ["paw-stamp", 62, 80], ["runaway-satellite", 56, 36], ["orbital-selfie", 58, 48]],
      services: [["garden-bloom", 87, 65], ["beacon-relay", 77, 83], ["pollination", 52, 86], ["seed-vault", 70, 66], ["greenhouse-dusk", 55, 36], ["ring-alignment", 36, 58], ["epilogue-signal", 20, 60], ["proposal-harvest", 92, 40]],
      notfound: [["signal-recovered", 93.5, 64], ["paw-rescue", 68, 85.5]],
      epilogue: [["last-light", 72, 41]],
    };
    for (const world of worlds) expect(MOBILE_HOTSPOTS[world].map(h => [h.id, h.x, h.y])).toEqual(expected[world]);
  });

  it("rejects omissions, duplicates, unknown ids and incorrect world assignments at runtime", () => {
    expect(() => assertMobileHotspots({ ...MOBILE_HOTSPOTS, epilogue: [] })).toThrow(/Missing/);
    expect(() => assertMobileHotspots({ ...MOBILE_HOTSPOTS, home: [...MOBILE_HOTSPOTS.home, hotspot("focus-lens")] })).toThrow(/Duplicate/);
    expect(() => assertMobileHotspots({ ...MOBILE_HOTSPOTS, epilogue: [{ ...hotspot("last-light"), id: "typo" as EggId }] })).toThrow(/Unknown/);
    expect(() => assertMobileHotspots({ ...MOBILE_HOTSPOTS, home: [...MOBILE_HOTSPOTS.home, hotspot("last-light")], epilogue: [] })).toThrow(/Wrong mobile world/);
  });

  it.each([{ x: -1 }, { x: 101 }, { y: 32.9 }, { y: 101 }, { x: NaN }, { y: Infinity }, { size: 0 }])(
    "rejects invalid geometry %j", change => {
      expect(() => assertMobileHotspots({ ...MOBILE_HOTSPOTS, epilogue: [{ ...hotspot("last-light"), ...change }] })).toThrow(/Invalid/);
    },
  );
});

describe("cover panorama math", () => {
  const cw = 390, ch = 700;
  const h = hotspot("wish");

  it("projects the plate's left and right boundaries onto the viewport", () => {
    expect(hotspotScreenPoint({ ...h, x: 0, y: 100 }, 0, cw, ch)).toEqual({ x: 0, y: ch });
    expect(hotspotScreenPoint({ ...h, x: 100 }, 100, cw, ch).x).toBeCloseTo(cw);
    expect(hotspotScreenPoint(h, 0, cw, ch).y).toBeCloseTo(ch * 0.34);
    // Wide landscape crops vertically from the top, matching --scene-y: 100%.
    expect(hotspotScreenPoint({ ...h, x: 50, y: 50 }, 87, 1000, 400)).toEqual({ x: 500, y: 118.75 });
  });

  it.each([-100, -20, 0, 20, 100])("moves the visible hotspot by the pointer displacement %ipx and round-trips", dx => {
    const start = 50;
    const end = panStep(start, dx, cw, ch);
    expect(hotspotScreenPoint(h, end, cw, ch).x - hotspotScreenPoint(h, start, cw, ch).x).toBeCloseTo(dx);
    expect(panStep(end, -dx, cw, ch)).toBeCloseTo(start);
  });

  it("clamps overscroll and handles uncropped or unmeasured frames without division by zero", () => {
    expect(panStep(50, 100000, cw, ch)).toBe(0);
    expect(panStep(50, -100000, cw, ch)).toBe(100);
    expect(panStep(87, 100, 1000, 400)).toBe(87);
    expect(panStep(120, 100, 0, 0)).toBe(100);
    expect(panStep(-20, 0, cw, ch)).toBe(0);
    expect(sceneXToReveal(h, 1000, 400, 30)).toBe(50);
    expect(sceneXToReveal(h, 0, 0, 30)).toBe(50);
  });

  it("reveals each hotspot at the requested reading position when physically possible", () => {
    for (const point of all) {
      const sceneX = sceneXToReveal(point, cw, ch, 30);
      expect(sceneX).toBeGreaterThanOrEqual(0); expect(sceneX).toBeLessThanOrEqual(100);
      const screen = hotspotScreenPoint(point, sceneX, cw, ch);
      expect(screen.x).toBeGreaterThanOrEqual(30);
      expect(screen.x).toBeLessThanOrEqual(cw - 30);
      if (sceneX > 0 && sceneX < 100) expect(screen.x).toBeCloseTo(cw * 0.4);
    }
  });

  it("honours margins, caps impossible margins, and clamps unreachable reading positions", () => {
    expect(hotspotScreenPoint(h, sceneXToReveal(h, cw, ch, 180), cw, ch).x).toBeCloseTo(180);
    expect(hotspotScreenPoint(h, sceneXToReveal(h, cw, ch, 900), cw, ch).x).toBeCloseTo(cw / 2);
    expect(sceneXToReveal({ ...h, x: 0 }, cw, ch, 30)).toBe(0);
    expect(sceneXToReveal({ ...h, x: 100 }, cw, ch, 30)).toBe(100);
  });

  it("shows edge cues only where the plate extends beyond the frame", () => {
    expect(edgeCues(0, cw, ch)).toEqual({ left: false, right: true });
    expect(edgeCues(50, cw, ch)).toEqual({ left: true, right: true });
    expect(edgeCues(100, cw, ch)).toEqual({ left: true, right: false });
    expect(edgeCues(-10, cw, ch)).toEqual({ left: false, right: true });
    expect(edgeCues(110, cw, ch)).toEqual({ left: true, right: false });
    expect(edgeCues(50, 1000, 400)).toEqual({ left: false, right: false });
    expect(edgeCues(50, 0, 0)).toEqual({ left: false, right: false });
  });
});

describe("glow selection", () => {
  it.each(worlds)("stays in %s and never repeats when alternatives exist", world => {
    const ids = MOBILE_HOTSPOTS[world].map(h => h.id);
    let previous: EggId | null = null;
    for (const random of [0, 0, 0.25, 0.5, 0.99, 1, 1, 0]) {
      const next = nextGlowId(world, previous, () => random);
      expect(ids).toContain(next);
      if (ids.length > 1) expect(next).not.toBe(previous);
      previous = next;
    }
  });

  it("permits every entry, including gated ones, without consulting discovery history", () => {
    const ids = MOBILE_HOTSPOTS.content.map(h => h.id);
    expect(ids.map((_, index) => nextGlowId("content", null, () => index / ids.length))).toEqual(ids);
    expect(nextGlowId("home", "last-light", () => 0)).toBe("focus-lens");
  });
});

describe("mobile egg reducer", () => {
  it("arms, triggers on the same tap, clears after triggering and allows replay", () => {
    const first = tap("focus-lens", 0);
    expect(first).toEqual({ state: { armed: "focus-lens", armedAt: 0, holdStartedAt: null }, effect: "hint" });
    const second = tap("focus-lens", 100, first.state);
    expect(second).toEqual({ state: INITIAL_MOBILE_EGG_STATE, effect: "trigger" });
    expect(tap("focus-lens", 200, second.state).effect).toBe("hint");
    expect(first.state.armed).toBe("focus-lens"); // No mutation of prior state.
  });

  it("accepts the arm boundary, expires afterward, and rejects backwards timestamps", () => {
    const { state } = tap("focus-lens", 100);
    expect(tap("focus-lens", 100 + ARM_WINDOW_MS, state).effect).toBe("trigger");
    expect(tap("focus-lens", 101 + ARM_WINDOW_MS, state)).toEqual({
      state: { armed: "focus-lens", armedAt: 101 + ARM_WINDOW_MS, holdStartedAt: null }, effect: "hint",
    });
    expect(tap("focus-lens", 99, state).effect).toBe("hint");
  });

  it("switches the armed egg and clears on an outside tap or cancelled gesture", () => {
    const first = tap("focus-lens", 0);
    const switched = tap("dog-signal", 20, first.state);
    expect(switched.state.armed).toBe("dog-signal"); expect(switched.effect).toBe("hint");
    expect(tap("focus-lens", 40, switched.state).effect).toBe("hint");
    const cleared = mobileEggReducer(switched.state, { type: "clear" });
    expect(cleared).toEqual({ state: INITIAL_MOBILE_EGG_STATE, effect: "none" });
    expect(tap("dog-signal", 60, cleared.state).effect).toBe("hint");
  });

  it.each(all.filter(h => h.kind === "hold").map(h => h.id))("requires a hint and a long enough hold for %s", id => {
    const armed = tap(id, 0);
    expect(armed.effect).toBe("hint");
    expect(tap(id, 20, armed.state).effect).toBe("hint");
    const holding = mobileEggReducer(armed.state, { type: "holdStart", id, now: 0 });
    expect(holding.state.holdStartedAt).toBe(0); expect(holding.effect).toBe("none");
    const short = mobileEggReducer(holding.state, { type: "holdEnd", now: HOLD_MS - 1 });
    expect(short.effect).toBe("none"); expect(short.state.holdStartedAt).toBeNull();
    expect(short.state.armed).toBe(id);
    const long = mobileEggReducer(holding.state, { type: "holdEnd", now: HOLD_MS });
    expect(long).toEqual({ state: INITIAL_MOBILE_EGG_STATE, effect: "trigger" });
    expect(mobileEggReducer(long.state, { type: "holdEnd", now: HOLD_MS + 1 }).effect).toBe("none");
  });

  it("cannot hold an unarmed, expired, different or tap-kind egg", () => {
    expect(mobileEggReducer(INITIAL_MOBILE_EGG_STATE, { type: "holdStart", id: "launch-charge", now: 0 }).state.armed).toBeNull();
    const armed = tap("launch-charge", 0).state;
    expect(mobileEggReducer(armed, { type: "holdStart", id: "launch-charge", now: ARM_WINDOW_MS + 1 }).state.armed).toBeNull();
    expect(mobileEggReducer(armed, { type: "holdStart", id: "orbital-selfie", now: 100 }).state.armed).toBeNull();
    const tapArmed = tap("focus-lens", 0).state;
    const result = mobileEggReducer(tapArmed, { type: "holdStart", id: "focus-lens", now: 100 });
    expect(result.state.holdStartedAt).toBeNull();
    expect(mobileEggReducer(result.state, { type: "holdEnd", now: 2000 }).effect).toBe("none");
  });

  it("allows a timely hold to complete past arm expiry and cancels an interrupted hold", () => {
    const armed = tap("launch-charge", 0).state;
    const holding = mobileEggReducer(armed, { type: "holdStart", id: "launch-charge", now: ARM_WINDOW_MS - 1 }).state;
    expect(mobileEggReducer(holding, { type: "holdEnd", now: ARM_WINDOW_MS + HOLD_MS }).effect).toBe("trigger");
    const cancelled = mobileEggReducer(holding, { type: "clear" }).state;
    expect(mobileEggReducer(cancelled, { type: "holdEnd", now: ARM_WINDOW_MS + HOLD_MS }).effect).toBe("none");
    expect(mobileEggReducer(holding, { type: "holdEnd", now: ARM_WINDOW_MS + 1 }).state).toEqual(INITIAL_MOBILE_EGG_STATE);
  });

  it.each(["curious-letter", "epilogue-signal"] as const)("checks the live gate for %s only on activation", id => {
    const locked = vi.fn(() => true);
    const armed = tap(id, 0, INITIAL_MOBILE_EGG_STATE, locked);
    expect(armed.effect).toBe("hint"); expect(locked).not.toHaveBeenCalled();
    expect(tap(id, 100, armed.state, locked)).toEqual({ state: INITIAL_MOBILE_EGG_STATE, effect: "locked" });
    expect(locked).toHaveBeenCalledWith(id);
    locked.mockReturnValue(false);
    expect(tap(id, 100, armed.state, locked).effect).toBe("trigger");
  });

  it("leaves ordinary eggs ungated and treats the finale star as a single-tap CTA", () => {
    const locked = vi.fn(() => true);
    expect(tap("focus-lens", 10, tap("focus-lens", 0).state, locked).effect).toBe("trigger");
    expect(tap("last-light", 0, INITIAL_MOBILE_EGG_STATE, locked)).toEqual({ state: INITIAL_MOBILE_EGG_STATE, effect: "trigger" });
    expect(locked).not.toHaveBeenCalled();
  });
});

describe("scan timing", () => {
  it("starts ready and treats zero as a valid previous scan timestamp", () => {
    expect(scanState(0, null)).toEqual({ ready: true, highlighted: false, cooldownProgress: 1 });
    expect(scanState(0, 0)).toEqual({ ready: false, highlighted: true, cooldownProgress: 0 });
  });

  it("ends the highlight independently from the cooldown and clamps ring progress", () => {
    expect(scanState(SCAN_HIGHLIGHT_MS - 1, 0).highlighted).toBe(true);
    expect(scanState(SCAN_HIGHLIGHT_MS, 0).highlighted).toBe(false);
    expect(scanState(SCAN_COOLDOWN_MS / 2, 0)).toEqual({ ready: false, highlighted: false, cooldownProgress: 0.5 });
    expect(scanState(SCAN_COOLDOWN_MS - 1, 0).ready).toBe(false);
    expect(scanState(SCAN_COOLDOWN_MS, 0)).toEqual({ ready: true, highlighted: false, cooldownProgress: 1 });
    expect(scanState(SCAN_COOLDOWN_MS * 2, 0).cooldownProgress).toBe(1);
    expect(scanState(0, 100)).toEqual({ ready: false, highlighted: false, cooldownProgress: 0 });
  });
});

describe("mobile copy", () => {
  const uiKeys = ["hotspotAria", "scanLabel", "scanAria", "sheetTitle", "sheetClose", "armHint", "holdHint", "lockedHint", "edgeLeftAria", "edgeRightAria", "panoramaAria"];
  it("has exactly the supported locales", () => {
    expect(Object.keys(mobileEggs).sort()).toEqual([...locales].sort());
    expect(Object.keys(mobileEggs).sort()).toEqual(["en", "es", "pt"]);
  });

  it.each(locales)("provides every UI string and anonymous touch hint in %s", locale => {
    const copy = mobileEggs[locale];
    expect(Object.keys(copy.ui).sort()).toEqual([...uiKeys].sort());
    expect(Object.keys(copy.hints).sort()).toEqual(EGGS.map(egg => egg.id).sort());
    expect(Object.keys(copy.hints)).toHaveLength(50);
    for (const text of [...Object.values(copy.ui), ...Object.values(copy.hints)]) {
      expect(text.trim().length).toBeGreaterThan(0);
      expect(text).not.toMatch(/[0-9]/);
      expect(text).not.toMatch(/\d\s*\/\s*\d/);
      expect(text).not.toMatch(/\{(?:n|found|total)\}/);
    }
    const holdWord = { pt: /segure/i, en: /hold/i, es: /mantén/i }[locale];
    for (const h of all) {
      const hint = copy.hints[h.id];
      expect(hint.length, h.id).toBeLessThanOrEqual(110);
      for (const egg of EGGS) {
        expect(hint.toLocaleLowerCase(), h.id).not.toContain(egg.id);
        expect(hint.toLocaleLowerCase(), h.id).not.toContain(comlink[locale].eggs[egg.id].name.toLocaleLowerCase());
      }
      if (h.kind === "hold") expect(hint).toMatch(holdWord);
    }
  });
});
