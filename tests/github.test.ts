import { afterEach, describe, expect, it, vi } from "vitest";
import { getContribuicoes, getGithubStats, getProjetos } from "@/lib/data";
import { allReposUrl, getAllRepos, getContribuicoesComEstrelas, getGithubTelemetry, getMergedPrs, getTopRepos, MERGED_PRS_URL, PROFILE_URL, repoPath, TOP_REPOS_URL } from "@/lib/github";

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
    expect(top[0]).toEqual({ nome: "a", url: "https://github.com/glaucia86/a", estrelas: 50, linguagem: null, descricao: "a description", forks: 0, topicos: [], criado: "", atualizado: "" });
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

const page = (count: number, offset = 0, total = count) => ({ total_count: total, items: Array.from({ length: count }, (_, index) => ({
  ...repo(`r${offset + index}`, 1000 - offset - index), forks_count: 2, topics: ["ai"], created_at: `${2015 + (index % 3)}-05-01T00:00:00Z`, pushed_at: "2026-01-02T10:00:00Z",
})) });
const respond = (routes: Record<string, unknown>) => vi.fn(async (url: string) => url in routes ? { ok: true, json: async () => routes[url] } : { ok: false, status: 404 });

describe("arquivo e telemetria do GitHub", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("pagina a busca até o total e converte os campos novos", async () => {
    vi.stubGlobal("fetch", respond({ [allReposUrl(1)]: page(100, 0, 130), [allReposUrl(2)]: page(30, 100, 130) }));
    const { repos, live } = await getAllRepos();
    expect(live).toBe(true);
    expect(repos).toHaveLength(130);
    expect(repos[0]).toMatchObject({ nome: "r0", forks: 2, topicos: ["ai"], criado: "2015-05-01", atualizado: "2026-01-02" });
  });

  it("usa o projetos.json quando o arquivo falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const { repos, live } = await getAllRepos();
    expect(live).toBe(false);
    expect(repos).toEqual(fallback(Infinity));
  });

  it("agrupa os PRs mergeados por repositório", async () => {
    const item = (repo: string) => ({ repository_url: `https://api.github.com/repos/${repo}` });
    vi.stubGlobal("fetch", respond({ [MERGED_PRS_URL]: { total_count: 3, items: [item("microsoft/a"), item("microsoft/a"), item("nodejs/b")] } }));
    await expect(getMergedPrs()).resolves.toEqual({ mergedPrs: 3, prsByRepo: { "microsoft/a": 2, "nodejs/b": 1 } });
    expect(decodeURIComponent(MERGED_PRS_URL)).toContain("is:merged -user:glaucia86");
  });

  it("calcula a telemetria ao vivo a partir do arquivo e do perfil", async () => {
    vi.stubGlobal("fetch", respond({
      [allReposUrl(1)]: page(3),
      [PROFILE_URL]: { followers: 10, public_gists: 2, public_repos: 50, created_at: "2012-04-11T01:27:22Z" },
      [MERGED_PRS_URL]: { total_count: 1, items: [{ repository_url: "https://api.github.com/repos/x/y" }] },
    }));
    const stats = await getGithubTelemetry();
    expect(stats).toMatchObject({ followers: 10, gists: 2, publicRepos: 50, since: 2012, originals: 3, stars: 2997, forks: 6, mergedPrs: 1 });
    expect(stats.years).toEqual([{ year: 2015, count: 1 }, { year: 2016, count: 1 }, { year: 2017, count: 1 }]);
  });

  it.each([
    ["erro de rede", () => Promise.reject(new TypeError("offline"))],
    ["limite de requisições", () => Promise.resolve({ ok: false, status: 403 })],
    ["JSON inválido", () => Promise.resolve({ ok: true, json: async () => ({ nope: true }) })],
  ])("usa o snapshot inteiro em caso de %s", async (_label, response) => {
    vi.stubGlobal("fetch", vi.fn(response));
    await expect(getGithubTelemetry()).resolves.toEqual(getGithubStats());
  });
});
