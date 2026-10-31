import './zod-config';
import { z } from "zod";
import { getContribuicoes, getGithubStats, getProjetos } from "./data";
import { languageShare, reposByYear, totals } from "./repos";
import type { Contribuicao, GithubStats, Projeto } from "./types";

const TIMEOUT_MS = 5_000;
export const REVALIDATE_SECONDS = 86_400; // 24 hours
export const GITHUB_USER = "glaucia86";
const REPO_QUERY = encodeURIComponent(`user:${GITHUB_USER} fork:false`);
export const TOP_REPOS_URL = `https://api.github.com/search/repositories?q=${REPO_QUERY}&sort=stars&order=desc&per_page=30`;
export const allReposUrl = (page: number) => `https://api.github.com/search/repositories?q=${REPO_QUERY}&sort=stars&order=desc&per_page=100&page=${page}`;
export const PROFILE_URL = `https://api.github.com/users/${GITHUB_USER}`;
export const MERGED_PRS_URL = `https://api.github.com/search/issues?q=${encodeURIComponent(`author:${GITHUB_USER} is:pr is:merged -user:${GITHUB_USER}`)}&per_page=100`;
const MAX_PAGES = 4;

const searchSchema = z.object({
  total_count: z.number().int().optional(),
  items: z.array(z.object({
    name: z.string(),
    html_url: z.url(),
    stargazers_count: z.number().int().nonnegative(),
    language: z.string().nullable(),
    description: z.string().nullable(),
    forks_count: z.number().int().nonnegative().default(0),
    topics: z.array(z.string()).default([]),
    created_at: z.string().default(""),
    pushed_at: z.string().default(""),
  })),
});

const profileSchema = z.object({
  followers: z.number().int().nonnegative(),
  public_gists: z.number().int().nonnegative(),
  public_repos: z.number().int().nonnegative(),
  created_at: z.string(),
});

const prSearchSchema = z.object({
  total_count: z.number().int().nonnegative(),
  items: z.array(z.object({ repository_url: z.url() })),
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

async function githubJson(url: string) {
  const response = await githubFetch(url);
  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  return response.json() as Promise<unknown>;
}

const byStars = (a: Projeto, b: Projeto) => b.estrelas - a.estrelas || a.nome.localeCompare(b.nome);
const toProjeto = (item: z.infer<typeof searchSchema>["items"][number]): Projeto => ({
  nome: item.name, url: item.html_url, estrelas: item.stargazers_count, linguagem: item.language, descricao: item.description ?? "",
  forks: item.forks_count, topicos: item.topics, criado: item.created_at.slice(0, 10), atualizado: item.pushed_at.slice(0, 10),
});
const fallbackRepos = (limit: number) => [...getProjetos()].sort(byStars).slice(0, limit);

// Most-starred public repositories, live from one search request; projetos.json is the fallback.
export async function getTopRepos(limit: number): Promise<Projeto[]> {
  try {
    const { items } = searchSchema.parse(await githubJson(TOP_REPOS_URL));
    if (!items.length) throw new Error("empty ranking");
    return items.map(toProjeto).sort(byStars).slice(0, limit);
  } catch {
    return fallbackRepos(limit);
  }
}

// Every original repository (up to 400), for the archive and the telemetry. `live` is false on fallback.
export async function getAllRepos(): Promise<{ repos: Projeto[]; live: boolean }> {
  try {
    const repos: Projeto[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { items, total_count } = searchSchema.parse(await githubJson(allReposUrl(page)));
      repos.push(...items.map(toProjeto));
      if (items.length < 100 || repos.length >= (total_count ?? 0)) break;
    }
    if (!repos.length) throw new Error("empty archive");
    return { repos: repos.sort(byStars), live: true };
  } catch {
    return { repos: fallbackRepos(Infinity), live: false };
  }
}

async function getProfile() {
  try {
    const profile = profileSchema.parse(await githubJson(PROFILE_URL));
    return { followers: profile.followers, gists: profile.public_gists, publicRepos: profile.public_repos, since: Number(profile.created_at.slice(0, 4)) };
  } catch {
    const { followers, gists, publicRepos, since } = getGithubStats();
    return { followers, gists, publicRepos, since };
  }
}

// Merged pull requests outside her own account, grouped by repository ("owner/name").
export async function getMergedPrs(): Promise<Pick<GithubStats, "mergedPrs" | "prsByRepo">> {
  try {
    const { total_count, items } = prSearchSchema.parse(await githubJson(MERGED_PRS_URL));
    const prsByRepo: Record<string, number> = {};
    for (const { repository_url } of items) {
      const repo = repository_url.split("/repos/")[1];
      if (repo) prsByRepo[repo] = (prsByRepo[repo] ?? 0) + 1;
    }
    if (!total_count) throw new Error("no merged PRs");
    return { mergedPrs: total_count, prsByRepo };
  } catch {
    const { mergedPrs, prsByRepo } = getGithubStats();
    return { mergedPrs, prsByRepo };
  }
}

// Everything the R2 memory bank shows. Repository aggregates only come from the live archive; the snapshot covers failures.
export async function getGithubTelemetry(archive?: { repos: Projeto[]; live: boolean }): Promise<GithubStats> {
  const [{ repos, live }, profile, prs] = await Promise.all([archive ?? getAllRepos(), getProfile(), getMergedPrs()]);
  const snapshot = getGithubStats();
  const aggregates = live ? { ...totals(repos), languages: languageShare(repos), years: reposByYear(repos) } : { originals: snapshot.originals, stars: snapshot.stars, forks: snapshot.forks, languages: snapshot.languages, years: snapshot.years };
  return { ...profile, ...aggregates, ...prs };
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
