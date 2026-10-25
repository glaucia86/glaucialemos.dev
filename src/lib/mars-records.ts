// Real records behind Marte's secrets. Nothing here is invented: every item points to its public source.
import { z } from "zod";
import registros from "@/data/marte-registros.json";
import type { Projeto } from "./types";

const firstCommitSchema = z.object({ repo: z.string(), commits: z.number().int().positive(), sha: z.string(), date: z.iso.date(), message: z.string(), url: z.url() });
export type FirstCommit = z.infer<typeof firstCommitSchema>;
// Snapshot written by scripts/snapshot-first-commits.mjs; the API is never called at runtime for this.
export const firstCommits: Record<string, FirstCommit> = Object.fromEntries(z.array(firstCommitSchema).parse(registros).map((record) => [record.repo, record]));

export const SITE_REPO = { nome: "glaucialemos.dev", url: "https://github.com/glaucia86/glaucialemos.dev" };

// Oldest and newest original repositories, by creation date; the most recent push. Ties fall back to the name.
const byDate = (key: "criado" | "atualizado", newest: boolean) => (a: Projeto, b: Projeto) => (newest ? b[key].localeCompare(a[key]) : a[key].localeCompare(b[key])) || a.nome.localeCompare(b.nome);
const dated = (repos: Projeto[], key: "criado" | "atualizado") => repos.filter((repo) => /^\d{4}-\d{2}-\d{2}$/.test(repo[key]));
export const oldestRepo = (repos: Projeto[]) => [...dated(repos, "criado")].sort(byDate("criado", false))[0];
export const newestRepo = (repos: Projeto[]) => [...dated(repos, "criado")].sort(byDate("criado", true))[0];
export const latestPush = (repos: Projeto[]) => [...dated(repos, "atualizado")].sort(byDate("atualizado", true))[0];

// "The colony that grew": modules per year, proportional to the repositories created that year (at least one if any).
export type Lot = { year: number; count: number; modules: number };
export function colonyLots(years: { year: number; count: number }[], max = 7): Lot[] {
  const peak = Math.max(1, ...years.map((item) => item.count));
  return years.map(({ year, count }) => ({ year, count, modules: count ? Math.max(1, Math.round(count / peak * max)) : 0 }));
}

// The rover scans the most-starred repositories in turn.
export const scanTargets = (repos: Projeto[], count = 5) => [...repos].sort((a, b) => b.estrelas - a.estrelas || a.nome.localeCompare(b.nome)).slice(0, count);

// "A bug lost in the lab": Azure/static-web-apps-cli PR #555, src/core/frameworks/frameworks.ts (Next.js entry).
export const SWA_BUG = {
  repo: "Azure/static-web-apps-cli",
  pr: "https://github.com/Azure/static-web-apps-cli/pull/555",
  merged: "2022-09-12",
  input: "swa init",
  process: 'packages: ["next"]',
  parts: [
    { key: "appDevserverCommand", broken: "npm dev", fixed: "npm run dev" },
    { key: "outputLocation", broken: ".", fixed: ".next" },
  ],
} as const;

// The npx card from github.com/glaucia86/glaucia_lemos86 (bin/card.js, 2018), then today's version.
export type CardLine = { label?: string; value: string; color?: string };
export const CARD_2018: CardLine[] = [
  { value: "Glaucia Lemos / glaucia_lemos86" }, { value: "" },
  { label: "Open Source", value: "Node.Js Foundation | React Community", color: "#80ff80" },
  { label: "Work", value: "Regional Cloud Developer at Microsoft", color: "#ff4040" },
  { label: "Twitter", value: "https://twitter.com/glaucia_lemos86", color: "#6b6bff" },
  { label: "GitHub", value: "https://github.com/glaucia86", color: "#fdf505" },
  { label: "LinkedIn", value: "https://www.linkedin.com/in/glaucialemos/", color: "#00ffff" },
  { label: "Youtube", value: "https://www.youtube.com/user/l32759", color: "#ff1919" },
  { label: "Instagram", value: "https://www.instagram.com/glaucia.lemos.dev/", color: "#bfffb3" },
  { label: "Medium", value: "https://medium.com/@glaucia86", color: "#b07a3c" },
  { label: "Web", value: "https://code4coders.wordpress.com/", color: "#ff884d" },
  { value: "" }, { label: "Card", value: "npx glaucia_lemos86", color: "#f00df0" },
];
export const CARD_NOW: CardLine[] = [
  { value: "Glaucia Lemos / glaucia_lemos86" }, { value: "" },
  { label: "Work", value: "Principal Software Engineer · AI Transformation Lead @ Itaú", color: "#ff4040" },
  { label: "Badges", value: "Microsoft MVP · OpenAI Codex Ambassador · Devin Ambassador", color: "#80ff80" },
  { label: "Book", value: "Packt co-author", color: "#ff884d" },
  { label: "YouTube", value: "https://www.youtube.com/@GlauciaLemos", color: "#ff1919" },
  { label: "X", value: "https://x.com/glaucia_lemos86", color: "#6b6bff" },
  { label: "LinkedIn", value: "https://www.linkedin.com/in/glaucialemos", color: "#00ffff" },
  { label: "GitHub", value: "https://github.com/glaucia86", color: "#fdf505" },
  { label: "Instagram", value: "https://www.instagram.com/glaucia.lemos.dev", color: "#bfffb3" },
  { value: "" }, { label: "Card", value: "npx glaucia_lemos86", color: "#f00df0" },
];
export const CARD_REPO = "glaucia_lemos86";
