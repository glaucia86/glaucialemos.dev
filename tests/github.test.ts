import { afterEach, describe, expect, it, vi } from "vitest";
import { getProjetos } from "@/lib/data";
import { getProjetosComEstrelas } from "@/lib/github";

describe("getProjetosComEstrelas", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ["timeout", () => Promise.reject(new DOMException("timeout", "TimeoutError"))],
    ["erro de rede", () => Promise.reject(new TypeError("network failed"))],
  ])("mantém as estrelas locais em caso de %s", async (_label, response) => {
    vi.stubGlobal("fetch", vi.fn(response));

    await expect(getProjetosComEstrelas()).resolves.toEqual(getProjetos());
  });

  it("mantém as estrelas locais em resposta HTTP não OK", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(getProjetosComEstrelas()).resolves.toEqual(getProjetos());
  });
});
