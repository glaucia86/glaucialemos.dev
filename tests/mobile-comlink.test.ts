import { describe, expect, it } from "vitest";
import { MOBILE_HOTSPOTS, sessionHintOrder, type MobileWorld } from "@/lib/mobile-eggs";
import { mobileEggOutcomes } from "@/i18n/mobile-eggs";

describe("anonymous radio order", () => {
  it("keeps every localized static discovery outcome free of digits and count placeholders", () => {
    for (const copy of Object.values(mobileEggOutcomes)) {
      for (const outcome of Object.values(copy)) expect(outcome).not.toMatch(/[0-9]|\{(?:n|total|found)\}/);
    }
  });
  it("keeps only the current world's hints, including its assigned global, across remounts", () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    for (const world of Object.keys(MOBILE_HOTSPOTS) as MobileWorld[]) {
      const order = sessionHintOrder(world, storage, () => 0);
      expect(order.map(h => h.id).sort()).toEqual(MOBILE_HOTSPOTS[world].map(h => h.id).sort());
      expect(sessionHintOrder(world, storage, () => .99)).toEqual(order);
      if (order.length > 1) expect(order).not.toEqual(MOBILE_HOTSPOTS[world]);
    }
  });
  it("repairs malformed or stale session data and works with denied storage", () => {
    for (const value of ['null', '{', '["star-map","star-map"]']) {
      expect(sessionHintOrder("home", { getItem: () => value, setItem: () => {} }, () => .5)).toHaveLength(MOBILE_HOTSPOTS.home.length);
    }
    const denied = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); } };
    expect(sessionHintOrder("about", denied).map(h => h.id).sort()).toEqual(MOBILE_HOTSPOTS.about.map(h => h.id).sort());
  });
});
