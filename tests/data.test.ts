import { describe, expect, it } from "vitest";
import eventosJson from "@/data/eventos.json";
import {
  getArtigos,
  getCargos,
  getEventStats,
  getEventCountries,
  getEventos,
  getProjetos,
  getServicos,
} from "@/lib/data";
import { eventoSchema } from "@/lib/types";

describe("dados", () => {
  it("carrega e valida todas as coleções", () => {
    expect(getEventos()).toHaveLength(116);
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
      eventos: 116,
      paises: 9,
      idiomas: { "pt-BR": 87, en: 24, es: 5 },
    });
  });

  it("inclui a África do Sul e permite auditar os países representados", () => {
    expect(getEventCountries()).toEqual(["África do Sul", "Argentina", "Brasil", "Canadá", "Estados Unidos", "França", "Grécia", "México", "República Dominicana"]);
    expect(getEventos().filter(e => e.ano > 2023)).toHaveLength(11);
    expect(getEventos().filter(e => e.ano > 2023).every(e => e.fonte.startsWith("https://"))).toBe(true);
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
