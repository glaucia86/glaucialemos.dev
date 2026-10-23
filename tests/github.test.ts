import { afterEach, describe, expect, it, vi } from "vitest";
import { getContribuicoes, getProjetos } from "@/lib/data";
import { getContribuicoesComEstrelas, getTopRepos, repoPath, TOP_REPOS_URL } from "@/lib/github";

const repo = (name: string, stars: number, language: string | null = "TypeScript") => ({
  name, html_url: `https://github.com/glaucia86/${name}`, stargazers_count: stars, language, description: `${name} description`,
});
const ok = (payload: unknown) => vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
const fallback = (limit: number) => [...getProjetos()].sort((a, b) => b.estrelas - a.estrelas || a.nome.localeCompare(b.nome)).slice(0, limit);

describe("getTopRepos", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it("ordena o ranking ao vivo por estrelas e respeita o limite", async () => {
    vi.stubGlobal("fetch", ok({ items: [repo("b", 10), repo("a", 50, null), repo("c", 10), repo("d", 5)] }));
    const top = await getTopRepos(3);
    expect(top.map((item) => item.nome)).toEqual(["a", "b", "c"]);
    expect(top[0]).toEqual({ nome: "a", url: "https://github.com/glaucia86/a", estrelas: 50, linguagem: null, descricao: "a description" });
  });

  it("faz uma única busca sem forks, ordenada por estrelas", async () => {
    const fetchMock = ok({ items: [repo("a", 1)] });
    vi.stubGlobal("fetch", fetchMock);
    await getTopRepos(6);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(TOP_REPOS_URL);
    expect(decodeURIComponent(TOP_REPOS_URL)).toContain("user:glaucia86 fork:false");
    expect(TOP_REPOS_URL).toContain("sort=stars");
  });

  it.each([
    ["timeout", () => Promise.reject(new DOMException("timeout", "TimeoutError"))],
    ["erro de rede", () => Promise.reject(new TypeError("network failed"))],
    ["limite de requisições", () => Promise.resolve({ ok: false, status: 403 })],
    ["JSON inválido", () => Promise.resolve({ ok: true, json: async () => ({ items: [{ name: 1 }] }) })],
    ["ranking vazio", () => Promise.resolve({ ok: true, json: async () => ({ items: [] }) })],
  ])("usa o projetos.json em caso de %s", async (_label, response) => {
    vi.stubGlobal("fetch", vi.fn(response));
    await expect(getTopRepos(6)).resolves.toEqual(fallback(6));
  });

  it("envia o token somente quando GITHUB_TOKEN existe", async () => {
    const fetchMock = ok({ items: [repo("a", 1)] });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("GITHUB_TOKEN", "");
    await getTopRepos(1);
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
    vi.stubEnv("GITHUB_TOKEN", "test-token");
    await getTopRepos(1);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer test-token");
  });
});

describe("getContribuicoesComEstrelas", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("mantém as estrelas locais em resposta HTTP não OK", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(getContribuicoesComEstrelas()).resolves.toEqual(getContribuicoes());
  });

  it("consulta o dono real do repositório nas contribuições", async () => {
    const fetchMock = ok({ stargazers_count: 999 });
    vi.stubGlobal("fetch", fetchMock);
    const contribuicoes = await getContribuicoesComEstrelas();
    expect(contribuicoes.every((item) => item.estrelas === 999)).toBe(true);
    expect(fetchMock.mock.calls.map(([url]) => url)).toContain("https://api.github.com/repos/Azure-Samples/serverless-chat-langchainjs");
    expect(repoPath("https://github.com/glaucia86/repocheckai/")).toBe("glaucia86/repocheckai");
  });
});
