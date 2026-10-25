import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PIXEL, createSky } from "@/components/home/sky-engine";

const canvas = () => ({ clientWidth: 1440, clientHeight: 810, width: 0, height: 0, getContext: () => null }) as unknown as HTMLCanvasElement;

describe("motor do céu do observatório", () => {
  beforeEach(() => { vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} }); vi.stubGlobal("cancelAnimationFrame", () => {}); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("usa um canvas em baixa resolução, com pixels de verdade", () => {
    const back = canvas(); const front = canvas();
    createSky({ back, front });
    expect(back.width).toBe(Math.round(1440 / PIXEL));
    expect(front.height).toBe(Math.round(810 / PIXEL));
  });

  it("pega a estrela cadente perto do ponteiro uma única vez", () => {
    const sky = createSky({ back: canvas(), front: canvas() });
    sky.meteor({ u: .5, v: .1 });
    expect(sky.catchAt({ u: .9, v: .9 })).toBeNull();
    const caught = sky.catchAt({ u: .505, v: .102 });
    expect(caught).not.toBeNull();
    expect(caught!.u).toBeCloseTo(.5, 2);
    expect(sky.catchAt({ u: .5, v: .1 })).toBeNull();
  });

  it("pega também pela cauda, com um raio generoso", () => {
    const sky = createSky({ back: canvas(), front: canvas() });
    sky.meteor({ u: .5, v: .1 });
    expect(sky.catchAt({ u: .51, v: .1 })).not.toBeNull();
  });

  it("para e libera o observador sem erros", () => {
    const sky = createSky({ back: canvas(), front: canvas() });
    expect(() => { sky.dark(true); sky.burst({ u: .5, v: .5 }); sky.destroy(); }).not.toThrow();
  });
});
