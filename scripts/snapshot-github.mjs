// Refreshes the offline fallbacks used when the GitHub API is unavailable:
// src/data/projetos.json (top 30 repositories) and src/data/github-stats.json (Projects telemetry).
// Usage (Node 23.6+, which loads TypeScript): node scripts/snapshot-github.mjs   (GITHUB_TOKEN optional)
import { writeFile } from "node:fs/promises";
import { languageShare, reposByYear, totals } from "../src/lib/repos.ts";

const user = "glaucia86";
const headers = { Accept: "application/vnd.github+json", ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
const get = async (url) => {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
};

const repos = [];
for (let page = 1; page <= 4; page++) {
  const { items, total_count } = await get(`https://api.github.com/search/repositories?q=${encodeURIComponent(`user:${user} fork:false`)}&sort=stars&order=desc&per_page=100&page=${page}`);
  repos.push(...items.map((item) => ({
    nome: item.name, url: item.html_url, estrelas: item.stargazers_count, linguagem: item.language, descricao: (item.description ?? "").trim(),
    forks: item.forks_count, topicos: item.topics ?? [], criado: item.created_at.slice(0, 10), atualizado: item.pushed_at.slice(0, 10),
  })));
  if (items.length < 100 || repos.length >= total_count) break;
}
repos.sort((a, b) => b.estrelas - a.estrelas || a.nome.localeCompare(b.nome));

const profile = await get(`https://api.github.com/users/${user}`);
const prs = await get(`https://api.github.com/search/issues?q=${encodeURIComponent(`author:${user} is:pr is:merged -user:${user}`)}&per_page=100`);
const prsByRepo = {};
for (const { repository_url } of prs.items) { const repo = repository_url.split("/repos/")[1]; prsByRepo[repo] = (prsByRepo[repo] ?? 0) + 1; }

const stats = {
  followers: profile.followers, gists: profile.public_gists, publicRepos: profile.public_repos, since: Number(profile.created_at.slice(0, 4)),
  ...totals(repos), languages: languageShare(repos), years: reposByYear(repos), mergedPrs: prs.total_count, prsByRepo,
};

await writeFile("src/data/projetos.json", `${JSON.stringify(repos.slice(0, 30), null, 2)}\n`);
await writeFile("src/data/github-stats.json", `${JSON.stringify(stats, null, 2)}\n`);
console.log(`${repos.length} repositories · ${stats.stars} stars · ${stats.mergedPrs} merged PRs`);
