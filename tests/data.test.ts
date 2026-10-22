import { describe, expect, it } from "vitest";
import eventosJson from "@/data/eventos.json";
import {
  getArtigos,
  getCargos,
  getEventStats,
  getEventos,
  getProjetos,
  getServicos,
} from "@/lib/data";
import { eventoSchema } from "@/lib/types";

describe("dados", () => {
  it("limita Itaú ao título público e à descrição genérica, sem detalhes internos", () => {
    const itau = getCargos().find((entry) => entry.id === "itau")!;
    expect(itau).toBeDefined();
    expect(itau.tecnologias).toEqual([]);
    for (const lang of ["pt", "en", "es"] as const) {
      expect(itau.cargo[lang]).toBe("Principal Software Engineer / AI Transformation Lead");
      expect(itau.descricao?.[lang]).toBeTruthy();
      expect(itau.conquistas[lang]).toEqual([]);
    }
    const content = JSON.stringify(getCargos());
    expect(content).not.toMatch(/squads|6[,.]?300|licen[cs]|ClearSale|Blip\.ai|Agro Varejo/i);
    expect(getCargos().filter((entry) => entry.empresa === "Microsoft")).toHaveLength(3);
  });

  it("carrega e valida todas as coleções", () => {
    expect(getEventos()).toHaveLength(105);
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
      eventos: 105,
      paises: 8,
      idiomas: { "pt-BR": 76, en: 24, es: 5 },
    });
  });

  it("rejeita um evento com idioma inválido", () => {
    const evento = { ...eventosJson[0], idioma: "fr" };

    expect(eventoSchema.safeParse(evento).success).toBe(false);
  });

  it("não conta país nulo nem Global", () => {
    expect(getEventStats().paises).toBe(8);
    expect(getEventos().some((evento) => evento.pais === null)).toBe(true);
    expect(getEventos().some((evento) => evento.pais === "Global")).toBe(true);
  });

  it("não agrega estimativas de público nas estatísticas", () => {
    expect(getEventStats()).not.toHaveProperty("publico");
  });
});
