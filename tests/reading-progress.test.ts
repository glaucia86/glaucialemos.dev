import { afterEach, describe, expect, it, vi } from "vitest";
import { getReadingProgress, observeReadingProgress } from "@/lib/reading-progress";

afterEach(() => vi.unstubAllGlobals());

describe("reading progress", () => {
  it.each([[0, 2000, 1000, 0], [500, 2000, 1000, .5], [1000, 2000, 1000, 1], [-100, 2000, 1000, 0], [1500, 2000, 1000, 1], [0, 500, 1000, 0], [0, 1000, 1000, 0]])("maps %s / (%s - %s) to %s", (y, height, viewport, expected) => {
    expect(getReadingProgress(y, height, viewport)).toBe(expected);
  });

  it("coalesces scroll/resize/content changes, reads the latest extent, and cancels pending work on unmount", () => {
    const target = new EventTarget();
    const root = { scrollHeight: 2000 };
    const frames = new Map<number, FrameRequestCallback>();
    let next = 0;
    let resized = () => {};
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal("window", target);
    vi.stubGlobal("document", { documentElement: root, body: {} });
    vi.stubGlobal("scrollY", 0);
    vi.stubGlobal("innerHeight", 1000);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++next, callback); return next; });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    vi.stubGlobal("ResizeObserver", class { constructor(callback: () => void) { resized = callback; } observe = observe; disconnect = disconnect; });
    const fill = { style: { transform: "" } } as HTMLElement;
    const stop = observeReadingProgress(fill);
    const flush = () => { const current = [...frames.values()]; frames.clear(); current.forEach((callback) => callback(0)); };
    flush();
    expect(fill.style.transform).toBe("scaleY(0)");
    vi.stubGlobal("scrollY", 500);
    target.dispatchEvent(new Event("scroll"));
    target.dispatchEvent(new Event("scroll"));
    target.dispatchEvent(new Event("resize"));
    resized();
    expect(frames.size).toBe(1);
    flush();
    expect(fill.style.transform).toBe("scaleY(0.5)");
    root.scrollHeight = 3000;
    resized();
    flush();
    expect(fill.style.transform).toBe("scaleY(0.25)");
    target.dispatchEvent(new Event("scroll"));
    stop();
    expect(frames.size).toBe(0);
    expect(disconnect).toHaveBeenCalledOnce();
    expect(observe).toHaveBeenCalledTimes(2);
    target.dispatchEvent(new Event("scroll"));
    target.dispatchEvent(new Event("resize"));
    expect(frames.size).toBe(0);
  });
});
