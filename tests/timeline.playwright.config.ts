import { defineConfig } from "@playwright/test";
import path from "node:path";

// Run after npm run build: npx playwright test -c tests/timeline.playwright.config.ts
export default defineConfig({
  testDir: ".",
  testMatch: "timeline.pw.ts",
  outputDir: "../test-results/timeline",
  use: { baseURL: "http://127.0.0.1:3100", reducedMotion: "no-preference" },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    cwd: path.resolve(__dirname, ".."),
    url: "http://127.0.0.1:3100/pt/sobre",
  },
});
