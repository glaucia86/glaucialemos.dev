import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = new URL("../src/", import.meta.url);

describe("redes sociais oficiais", () => {
  it("centraliza exatamente os quatro URLs oficiais", async () => {
    const { socialLinks } = await import("@/data/social");
    expect(socialLinks).toEqual({
      youtube: "https://www.youtube.com/@GlauciaLemos",
      x: "https://x.com/glaucia_lemos86",
      linkedin: "https://www.linkedin.com/in/glaucialemos",
      instagram: "https://www.instagram.com/glaucia.lemos.dev",
    });
    expect(Object.values(socialLinks).every((url) => !/twitch/i.test(url))).toBe(true);
  });

  it("não contém menções à Twitch em src", () => {
    const matches = readdirSync(sourceRoot, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name))
      .filter((path) => /twitch/i.test(readFileSync(path, "utf8")));
    expect(matches).toEqual([]);
  });
});
