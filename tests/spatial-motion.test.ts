import { describe, expect, it } from "vitest";
import { advanceStory, cameraMotion, clamp, smooth, showOrientationPermission, type CameraMotion } from "@/lib/spatial-motion";

describe("continuous spatial motion", () => {
  const push: CameraMotion = { kind: "push", duration: 9000, direction: 1 };

  it("reverses and returns without accumulating zoom, with faster foreground travel", () => {
    const start = cameraMotion(0, push);
    const end = cameraMotion(9000, push);
    expect(end.scale).toBeGreaterThan(start.scale);
    expect(end.foregroundScale - start.foregroundScale).toBeGreaterThan(end.scale - start.scale);
    expect(cameraMotion(18000, push)).toEqual(start);
    expect(cameraMotion(27000, push)).toEqual(end);
    expect(cameraMotion(8999, push).scale).toBeCloseTo(cameraMotion(9001, push).scale, 10);
  });

  it("pans in the configured direction and keeps its zoom fixed", () => {
    const pan: CameraMotion = { kind: "pan", duration: 7000, direction: -1 };
    expect(cameraMotion(0, pan).pan).toBe(12);
    expect(cameraMotion(7000, pan).pan).toBe(-12);
    expect(cameraMotion(14000, pan).pan).toBe(12);
    expect(cameraMotion(3500, pan).scale).toBe(cameraMotion(0, pan).scale);
  });
});

describe("occasional story beats", () => {
  it.each([[0, 12000], [.5, 16000], [1, 20000]])("plays on entry and schedules the next beat with random=%s", (random, interval) => {
    const entry = advanceStory({ until: 0, next: 0 }, 16, 3000, false, () => random);
    expect(entry).toEqual({ until: 3016, next: interval + 16 });
    expect(advanceStory(entry, 300, 3000, true)).toBe(entry);
    expect(advanceStory(entry, 3016, 3000)).toBe(entry);
    expect(advanceStory(entry, entry.next - 1, 3000)).toBe(entry);
    expect(advanceStory(entry, entry.next, 3000, false, () => random)).toEqual({
      until: entry.next + 3000, next: entry.next + interval,
    });
  });

  it("allows an interaction after the beat and reschedules to avoid immediate repetition", () => {
    const clock = { until: 3000, next: 16000 };
    expect(advanceStory(clock, 5000, 2000, true, () => .5)).toEqual({ until: 7000, next: 21000 });
    expect(advanceStory(clock, 1000, 2000, true, () => .5)).toBe(clock);
  });
});

describe("spatial input", () => {
  it.each([[-80, -1], [-.4, -.4], [0, 0], [.8, .8], [90, 1], [NaN, 0], [Infinity, 0]])("clamps sensor value %s to %s", (value, expected) => {
    expect(clamp(value, -1, 1)).toBe(expected);
  });

  it("smooths without overshooting in either direction", () => {
    expect(smooth(0, 1, 16)).toBeGreaterThan(0);
    expect(smooth(0, 1, 16)).toBeLessThan(1);
    expect(smooth(1, -1, 16)).toBeGreaterThan(-1);
    expect(smooth(1, -1, 16)).toBeLessThan(1);
    expect(smooth(.5, .5, 16)).toBe(.5);
    expect(smooth(0, 1, 0)).toBe(0);
    expect(smooth(0, 1, -10)).toBe(0);
    expect(smooth(0, 1, 100000)).toBe(1);
  });

  it("converges at the same rate on 60 Hz and 120 Hz displays", () => {
    const advance = (hz: number) => Array.from({ length: hz }).reduce<number>((value) => smooth(value, 1, 1000 / hz), 0);
    expect(advance(60)).toBeCloseTo(advance(120), 10);
    expect(advance(60)).toBeGreaterThan(.99);
  });
});

describe("orientation permission button", () => {
  const ios = { mobile: true, supported: true, requiresPermission: true, reduced: false, dismissed: false, permission: "prompt" as const };

  it("appears only for a mobile sensor that needs an explicit gesture", () => {
    expect(showOrientationPermission(ios)).toBe(true);
  });

  it.each([
    { mobile: false },
    { supported: false },
    { requiresPermission: false },
    { reduced: true },
    { dismissed: true },
    { permission: "pending" as const },
    { permission: "granted" as const },
    { permission: "denied" as const },
  ])("hides it for %j", (override) => {
    expect(showOrientationPermission({ ...ios, ...override })).toBe(false);
  });
});
