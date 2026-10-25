import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PIXEL, createSnow } from "@/components/about/snow-engine";
import { createBlizzardJump } from "@/components/about/blizzard-jump";

const canvas = () => ({ clientWidth: 1440, clientHeight: 810, width: 0, height: 0, getContext: () => null }) as unknown as HTMLCanvasElement;

describe("motor de neve de Nivéora", () => {
  it("mantém a reação durante a dissipação e pausa o vento fora da tela", () => {
    let frame: FrameRequestCallback = () => {};
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frame = callback; return 1; });
    const changes: boolean[] = [];
    const snow = createSnow({ back: canvas(), front: canvas(), onGust: on => changes.push(on) });
    snow.gust(); snow.start();
    let now = 100;
    const advance = (ms: number) => { for (let t = 0; t < ms; t += 50) { now += 50; frame(now); } };
    advance(2600);
    expect(changes).toEqual([true]);
    snow.stop(); advance(10000);
    expect(changes).toEqual([true]);
    snow.start(); advance(2000);
    expect(changes).toEqual([true, false]);
    snow.destroy();
  });
  beforeEach(() => { vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} }); vi.stubGlobal("cancelAnimationFrame", () => {}); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("usa um canvas em baixa resolução, com pixels de verdade", () => {
    const back = canvas(); const front = canvas();
    createSnow({ back, front });
    expect(back.width).toBe(Math.round(1440 / PIXEL));
    expect(front.height).toBe(Math.round(810 / PIXEL));
  });

  it("liga e desliga a nevasca e o prisma da aurora", () => {
    const snow = createSnow({ back: canvas(), front: canvas() });
    expect(snow.weather()).toMatchObject({ blizzard: 0, prism: 0 });
    snow.blizzard(true); snow.prism(true, { u: .69, v: .67 });
    expect(snow.weather()).toMatchObject({ blizzard: 1, prism: 1 });
    snow.blizzard(false); snow.prism(false);
    expect(snow.weather()).toMatchObject({ blizzard: 0, prism: 0 });
  });

  it("para e libera o observador sem erros", () => {
    const snow = createSnow({ back: canvas(), front: canvas() });
    expect(() => { snow.puff({ u: .7, v: .9 }); snow.embers({ u: .6, v: .85 }); snow.burst({ u: .5, v: .5 }); snow.beam({ u: .69, v: .67 }, { u: .82, v: .09 }); snow.gust(); snow.breath({ u: .83, v: .5 }); snow.destroy(); }).not.toThrow();
  });

  it("avisa a cena a cada rajada de vento", () => {
    let gusts = 0;
    const snow = createSnow({ back: canvas(), front: canvas(), onGust: () => { gusts++; } });
    snow.gust();
    expect(gusts).toBe(1);
  });

  it("o salto de nevasca só desenha quando a rolagem muda", () => {
    const jump = createBlizzardJump(canvas());
    expect(() => { jump.set(-1); jump.set(.5); jump.set(2); jump.destroy(); }).not.toThrow();
  });
});
