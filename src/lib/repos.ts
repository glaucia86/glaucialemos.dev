// Pure helpers for the Projects archive. Relative type import only, so scripts/snapshot-github.mjs can load it too.
import type { Projeto } from "./types";

export const CATEGORIES = ["ai", "learn", "cloud", "web"] as const;
export type Category = (typeof CATEGORIES)[number];
export type SortKey = "stars" | "recent" | "forks";

const KEYWORDS: Record<Exclude<Category, "web">, string[]> = {
  ai: ["ai", "ia", "mcp", "rag", "langchain", "langchainjs", "llm", "gpt", "openai", "copilot", "gemini", "agent", "agents", "agentic", "genai", "generative", "llama", "sdd", "codex", "skills"],
  learn: ["curso", "course", "workshop", "bootcamp", "serie", "series", "tutorial", "aula", "aulas", "palestra", "livecoding", "studies", "learn", "beginners", "iniciantes", "mba", "handson", "zero", "hero", "video", "videos"],
  cloud: ["azure", "serverless", "functions", "azurefunctions", "docker", "kubernetes", "aws", "cloud", "swa", "devops", "azd", "cosmosdb", "postgresql", "sql"],
};

const tokens = (repo: Pick<Projeto, "nome" | "descricao" | "topicos">) =>
  new Set([repo.nome, repo.descricao, ...repo.topicos].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));

// A repository may belong to several categories; anything without a match is plain web/apps.
export function categorize(repo: Pick<Projeto, "nome" | "descricao" | "topicos">): Category[] {
  const words = tokens(repo);
  const found = (Object.keys(KEYWORDS) as Exclude<Category, "web">[]).filter((category) => KEYWORDS[category].some((word) => words.has(word)));
  return found.length ? found : ["web"];
}

export function languageShare(repos: Pick<Projeto, "linguagem">[], top = 6) {
  const counts = new Map<string, number>();
  for (const { linguagem } of repos) if (linguagem) counts.set(linguagem, (counts.get(linguagem) ?? 0) + 1);
  const sorted = [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const rest = sorted.slice(top).reduce((sum, item) => sum + item.count, 0);
  return rest ? [...sorted.slice(0, top), { name: "other", count: rest }] : sorted;
}

// Every year from the first to the last repository, including empty ones, so the dunes have no gaps.
export function reposByYear(repos: Pick<Projeto, "criado">[]) {
  const years = repos.map((repo) => Number(repo.criado.slice(0, 4))).filter((year) => year > 2000);
  if (!years.length) return [];
  const [first, last] = [Math.min(...years), Math.max(...years)];
  return Array.from({ length: last - first + 1 }, (_, index) => ({ year: first + index, count: years.filter((year) => year === first + index).length }));
}

export function totals(repos: Pick<Projeto, "estrelas" | "forks">[]) {
  return { originals: repos.length, stars: repos.reduce((sum, repo) => sum + repo.estrelas, 0), forks: repos.reduce((sum, repo) => sum + repo.forks, 0) };
}

export function sortRepos<T extends Pick<Projeto, "nome" | "estrelas" | "forks" | "atualizado">>(repos: T[], key: SortKey): T[] {
  const tie = (a: T, b: T) => b.estrelas - a.estrelas || a.nome.localeCompare(b.nome);
  const compare: Record<SortKey, (a: T, b: T) => number> = {
    stars: tie,
    forks: (a, b) => b.forks - a.forks || tie(a, b),
    recent: (a, b) => b.atualizado.localeCompare(a.atualizado) || tie(a, b),
  };
  return [...repos].sort(compare[key]);
}

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function matchesQuery(repo: Pick<Projeto, "nome" | "descricao" | "topicos" | "linguagem">, query: string) {
  const needle = normalize(query.trim());
  return !needle || normalize([repo.nome, repo.descricao, repo.linguagem ?? "", ...repo.topicos].join(" ")).includes(needle);
}
