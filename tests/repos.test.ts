import { describe, expect, it } from "vitest";
import { getProjetos } from "@/lib/data";
import { categorize, isDroidQuery, languageShare, matchesQuery, reposByYear, sortRepos, totals } from "@/lib/repos";

const repo = (nome: string, extra: Partial<{ descricao: string; topicos: string[]; estrelas: number; forks: number; atualizado: string; linguagem: string | null }> = {}) => ({
  nome, descricao: "", topicos: [], estrelas: 0, forks: 0, atualizado: "", linguagem: null, ...extra,
});

describe("arquivo de repositórios", () => {
  it("classifica por nome, tópicos e descrição, com mais de uma categoria quando cabe", () => {
    expect(categorize(repo("weather-mcp-server"))).toEqual(["ai"]);
    expect(categorize(repo("curso-typescript-zero-to-hero"))).toEqual(["learn"]);
    expect(categorize(repo("workshop-mean-serverless"))).toEqual(["learn", "cloud"]);
    expect(categorize(repo("x", { topicos: ["azure-functions", "cosmosdb"] }))).toEqual(["cloud"]);
    expect(categorize(repo("ai-js-course", { descricao: "Repositório com aulas" }))).toEqual(["ai", "learn"]);
    expect(categorize(repo("employee-crud-api"))).toEqual(["web"]);
  });

  it("garante ao menos uma categoria para cada repositório da reserva", () => {
    expect(getProjetos().every((item) => categorize(item).length > 0)).toBe(true);
  });

  it("agrupa linguagens, ignora nulos e junta o resto em other", () => {
    const repos = ["TS", "TS", "JS", null, "Go", "C#"].map((linguagem) => ({ linguagem }));
    expect(languageShare(repos, 2)).toEqual([{ name: "TS", count: 2 }, { name: "C#", count: 1 }, { name: "other", count: 2 }]);
    expect(languageShare(repos)).toHaveLength(4);
  });

  it("conta repositórios por ano sem lacunas", () => {
    expect(reposByYear([{ criado: "2014-01-01" }, { criado: "2016-03-02" }, { criado: "2016-09-09" }, { criado: "" }])).toEqual([
      { year: 2014, count: 1 }, { year: 2015, count: 0 }, { year: 2016, count: 2 },
    ]);
    expect(reposByYear([])).toEqual([]);
  });

  it("soma estrelas e forks", () => {
    expect(totals([{ estrelas: 3, forks: 1 }, { estrelas: 4, forks: 0 }])).toEqual({ originals: 2, stars: 7, forks: 1 });
  });

  it("ordena por estrelas, forks ou sinal mais recente, com desempate estável", () => {
    const repos = [repo("b", { estrelas: 5, forks: 9, atualizado: "2020-01-01" }), repo("a", { estrelas: 5, forks: 1, atualizado: "2026-01-01" }), repo("c", { estrelas: 9, atualizado: "2021-01-01" })];
    expect(sortRepos(repos, "stars").map((item) => item.nome)).toEqual(["c", "a", "b"]);
    expect(sortRepos(repos, "forks").map((item) => item.nome)).toEqual(["b", "a", "c"]);
    expect(sortRepos(repos, "recent").map((item) => item.nome)).toEqual(["a", "c", "b"]);
  });

  it("busca sem acento em nome, descrição, linguagem e tópicos", () => {
    const item = repo("curso-typescript", { descricao: "Repositório do Curso", topicos: ["nodejs"], linguagem: "TypeScript" });
    expect(matchesQuery(item, "repositorio")).toBe(true);
    expect(matchesQuery(item, "NODEJS")).toBe(true);
    expect(matchesQuery(item, "  ")).toBe(true);
    expect(matchesQuery(item, "python")).toBe(false);
  });

  it("reconhece a busca por droides do truque mental", () => {
    for (const query of ["droids", "Droides", " the droids ", "droid"]) expect(isDroidQuery(query)).toBe(true);
    expect(isDroidQuery("android")).toBe(false);
  });
});
