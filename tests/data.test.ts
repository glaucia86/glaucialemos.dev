import { describe, expect, it } from "vitest";
import eventosJson from "@/data/eventos.json";
import {
  getArtigos,
  getCargos,
  getContribuicoes,
  getEventStats,
  getEventos,
  getProjetos,
  getServicos,
} from "@/lib/data";
import { eventoSchema } from "@/lib/types";

describe("dados", () => {
  it("carrega e valida todas as coleções", () => {
    expect(getEventos()).toHaveLength(136);
    expect(getCargos().length).toBeGreaterThan(0);
    expect(getProjetos().length).toBeGreaterThan(0);
    expect(getArtigos().length).toBeGreaterThan(0);
    expect(getServicos()).toHaveLength(3);
    expect(getProjetos().some((projeto) => projeto.linguagem === null)).toBe(true);
  });

  it("calcula estatísticas a partir do JSON sem contar Global como país", () => {
    const idiomas = eventosJson.reduce(
      (totais, evento) => {
        totais[evento.idioma as keyof typeof totais] += 1;
        return totais;
      },
      { "pt-BR": 0, en: 0, es: 0 },
    );
    const paises = new Set(
      eventosJson.map(({ pais }) => pais).filter((pais) => pais !== null && pais !== "Global"),
    );

    expect(getEventStats()).toEqual({
      eventos: eventosJson.length,
      paises: paises.size,
      idiomas,
    });
    expect(getEventStats()).toEqual({
      eventos: 136,
      paises: 9,
      idiomas: { "pt-BR": 105, en: 26, es: 5 },
    });
  });

  it("inclui os eventos de 2024 a 2026 com fonte pública e sem duplicatas", () => {
    const recentes = getEventos().filter((evento) => evento.ano > 2023);
    expect(recentes).toHaveLength(21);
    expect(recentes.every((evento) => evento.fonte.startsWith("https://"))).toBe(true);
    const desde2023 = getEventos().filter((evento) => evento.ano >= 2023);
    expect(new Set(desde2023.map((evento) => `${evento.ano}|${evento.nome}`)).size).toBe(desde2023.length);
  });

  it("valida as contribuições open source com textos nos três idiomas", () => {
    const contribuicoes = getContribuicoes();
    expect(contribuicoes.map((item) => item.repo)).toContain("Azure-Samples/serverless-chat-langchainjs");
    for (const item of contribuicoes) {
      expect(item.url).toBe(`https://github.com/${item.repo}`);
      expect(Object.values(item.descricao).every(Boolean)).toBe(true);
    }
  });

  it("rejeita um evento com idioma inválido", () => {
    const evento = { ...eventosJson[0], idioma: "fr" };

    expect(eventoSchema.safeParse(evento).success).toBe(false);
  });

  it("não conta país nulo nem Global", () => {
    expect(getEventStats().paises).toBe(9);
    expect(getEventos().some((evento) => evento.pais === null)).toBe(true);
    expect(getEventos().some((evento) => evento.pais === "Global")).toBe(true);
  });

  it("não agrega estimativas de público nas estatísticas", () => {
    expect(getEventStats()).not.toHaveProperty("publico");
  });
});
