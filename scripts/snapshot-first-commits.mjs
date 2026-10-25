// Records the first commit of the repositories whose "casing" opens on the Projects page (Marte), so the workbench log
// works offline and never calls the API at runtime. Writes src/data/marte-registros.json.
// Usage: node scripts/snapshot-first-commits.mjs   (GITHUB_TOKEN optional)
import { writeFile } from "node:fs/promises";

const user = "glaucia86";
export const BENCH_REPOS = ["curso-typescript-zero-to-hero", "glaucia_lemos86", "repocheckai", "ai-js-course", "glaucialemos.dev"];
const headers = { Accept: "application/vnd.github+json", ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
const get = async (url) => {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response;
};

// The commits list is newest first: with one commit per page, the last page holds the first commit.
async function firstCommit(repo) {
  const base = `https://api.github.com/repos/${user}/${repo}/commits?per_page=1`;
  const head = await get(base);
  const last = head.headers.get("link")?.match(/[?&]page=(\d+)>; rel="last"/)?.[1];
  const [commit] = await (last ? await get(`${base}&page=${last}`) : head).json();
  return { repo, commits: Number(last ?? 1), sha: commit.sha, date: commit.commit.author.date.slice(0, 10), message: commit.commit.message.split("\n")[0], url: commit.html_url };
}

const records = [];
for (const repo of BENCH_REPOS) records.push(await firstCommit(repo));
await writeFile("src/data/marte-registros.json", `${JSON.stringify(records, null, 2)}\n`);
for (const { repo, date, message } of records) console.log(`${repo}: ${date} · ${message}`);
