import { z } from "zod";
import { getContribuicoes, getProjetos } from "./data";
import type { Contribuicao, Projeto } from "./types";

const TIMEOUT_MS = 5_000;
export const REVALIDATE_SECONDS = 2_592_000; // 30 days
export const GITHUB_USER = "glaucia86";
export const TOP_REPOS_URL = `https://api.github.com/search/repositories?q=${encodeURIComponent(`user:${GITHUB_USER} fork:false`)}&sort=stars&order=desc&per_page=30`;

const searchSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    html_url: z.url(),
    stargazers_count: z.number().int().nonnegative(),
    language: z.string().nullable(),
    description: z.string().nullable(),
  })),
});

export function repoPath(url: string) {
  return new URL(url).pathname.replace(/^\/|\/$/g, "");
}

// A token only raises GitHub's rate limits; public data works without it.
function githubFetch(url: string) {
  const token = process.env.GITHUB_TOKEN;
  return fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
}

const byStars = (a: Projeto, b: Projeto) => b.estrelas - a.estrelas || a.nome.localeCompare(b.nome);

// Most-starred public repositories, live from one search request; projetos.json is the fallback.
export async function getTopRepos(limit: number): Promise<Projeto[]> {
  try {
    const response = await githubFetch(TOP_REPOS_URL);
    if (!response.ok) throw new Error(`GitHub ${response.status}`);
    const { items } = searchSchema.parse(await response.json());
    if (!items.length) throw new Error("empty ranking");
    return items
      .map((item) => ({ nome: item.name, url: item.html_url, estrelas: item.stargazers_count, linguagem: item.language, descricao: item.description ?? "" }))
      .sort(byStars)
      .slice(0, limit);
  } catch {
    return [...getProjetos()].sort(byStars).slice(0, limit);
  }
}

async function withStars<T extends { url: string; estrelas: number }>(items: T[]): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => {
      try {
        const response = await githubFetch(`https://api.github.com/repos/${repoPath(item.url).split("/").map(encodeURIComponent).join("/")}`);
        if (!response.ok) return item;
        const payload: unknown = await response.json();
        if (typeof payload !== "object" || payload === null || !("stargazers_count" in payload) || typeof payload.stargazers_count !== "number") return item;
        return { ...item, estrelas: payload.stargazers_count };
      } catch {
        return item;
      }
    }),
  );
}

export const getContribuicoesComEstrelas = (): Promise<Contribuicao[]> => withStars(getContribuicoes());
