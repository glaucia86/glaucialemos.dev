import { afterEach, describe, expect, it, vi } from "vitest";
import { createIceBlocks } from "@/components/about/ice-blocks";

const target = () => ({ classList: { remove: vi.fn() } }) as unknown as HTMLElement;
const block = () => ({ parentElement: null, remove: vi.fn() }) as unknown as HTMLElement;

afterEach(() => vi.useRealTimers());
describe("ciclo de vida do gelo", () => {
  it("quebrar durante o derretimento remove uma vez, mesmo sem parentElement", () => {
    vi.useFakeTimers();
    const ice = createIceBlocks(); const card = target(); const overlay = block();
    ice.add(overlay, card);
    ice.releaseAfter(overlay, 1500);
    vi.advanceTimersByTime(100);
    ice.releaseAfter(overlay, 950);
    vi.advanceTimersByTime(950);
    expect(overlay.remove).toHaveBeenCalledTimes(1);
    expect(card.classList.remove).toHaveBeenCalledWith("is-frozen");
    expect(() => vi.runAllTimers()).not.toThrow();
    ice.release(overlay);
    expect(overlay.remove).toHaveBeenCalledTimes(1);
  });

  it("cleanup cancela todos os callbacks de remoção pendentes", () => {
    vi.useFakeTimers();
    const released = vi.fn(); const ice = createIceBlocks(released);
    const first = block(); const second = block();
    ice.add(first, target()); ice.add(second, target());
    ice.releaseAfter(first, 950); ice.releaseAfter(second, 1500);
    ice.dispose();
    expect(vi.getTimerCount()).toBe(0);
    expect(released).toHaveBeenCalledTimes(2);
    vi.runAllTimers();
    expect(released).toHaveBeenCalledTimes(2);
  });

  it("uma remoção antiga não descongela o novo bloco do mesmo card", () => {
    const ice = createIceBlocks(); const card = target();
    const first = block(); const second = block();
    ice.add(first, card); ice.release(first);
    vi.mocked(card.classList.remove).mockClear();
    ice.add(second, card); ice.release(first);
    expect(card.classList.remove).not.toHaveBeenCalled();
    ice.release(second);
    expect(card.classList.remove).toHaveBeenCalledTimes(1);
  });
});
