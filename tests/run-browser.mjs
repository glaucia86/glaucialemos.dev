import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

// Run after npm run build. A supplied BASE_URL reuses an existing server.
const suites = process.argv.slice(2);
const files = suites.length ? suites : ["hero-ctas", "hero-scenes", "scene-lifecycle"];
const port = process.env.BROWSER_PORT || "3100";
let server;
let output = "";
try {
  if (!process.env.BASE_URL) {
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", port], { stdio: ["ignore", "pipe", "pipe"] });
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Server startup timed out: ${output}`)), 30000);
      const finish = (error) => { clearTimeout(timeout); if (error) reject(error); else resolve(); };
      server.on("error", finish);
      server.on("exit", (code) => finish(new Error(`Server exited (${code}): ${output}`)));
      server.stderr.on("data", (data) => { output += data; });
      server.stdout.on("data", (data) => { output += data; if (output.includes("Ready")) finish(); });
    });
    process.env.BASE_URL = `http://127.0.0.1:${port}`;
  }
  console.log(`Browser tests: ${process.env.BASE_URL}`);
  for (const suite of files) {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [`tests/${suite}.browser.mjs`], { stdio: "inherit", env: process.env });
      child.on("error", reject);
      child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${suite}: exit ${code}`)));
    });
  }
} finally {
  server?.kill();
  if (server) {
    await mkdir("test-results", { recursive: true });
    await writeFile("test-results/browser-server.log", output);
  }
}
