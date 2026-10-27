import { describe, expect, it } from "vitest";
import { worldSound } from "@/lib/world-sound";

describe("vozes de interação por mundo", () => {
  it("adapta ações comuns sem alterar Aurélia ou páginas sem mundo", () => {
    for (const world of ["observatory", "niveora", "mars", "lumina", "atlas", "epilogue"] as const) {
      expect(worldSound(world, "success")).not.toBe("success");
      expect(worldSound(world, "switch")).not.toBe("switch");
    }
    expect(worldSound("aurelia", "success")).toBe("success");
    expect(worldSound(undefined, "switch")).toBe("switch");
    expect(worldSound("mars", "type")).toBe("type");
  });
});
