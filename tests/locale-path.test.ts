import { describe, expect, it } from "vitest";
import { localizePath, preferredLocale } from "@/i18n/config";

describe("localizePath", () => {
  it.each([
    ["/pt", "en", "/en"],
    ["/pt/sobre", "es", "/es/sobre"],
    ["/conteudo", "pt", "/pt/conteudo"],
    ["/", "es", "/es"],
  ] as const)("troca o locale em %s preservando a página", (path, locale, expected) => {
    expect(localizePath(path, locale)).toBe(expected);
  });
});

describe("preferredLocale", () => {
  it("respeita pesos q mesmo quando o idioma preferido vem depois", () => {
    expect(preferredLocale("en-US;q=0.5, es-ES;q=0.9, pt-BR;q=0.7")).toBe("es");
  });

  it("ignora idiomas não suportados e usa o próximo compatível", () => {
    expect(preferredLocale("fr-FR, en;q=0.8")).toBe("en");
  });

  it("usa português quando o cabeçalho está ausente ou inválido", () => {
    expect(preferredLocale(null)).toBe("pt");
    expect(preferredLocale("de;q=oops, *;q=0.8")).toBe("pt");
  });
});
