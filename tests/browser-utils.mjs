import { chromium } from "@playwright/test";

export const baseURL = process.env.BASE_URL || "http://127.0.0.1:3100";
export const launchBrowser = () => chromium.launch({
  executablePath: process.env.BROWSER_EXECUTABLE_PATH || undefined,
  args: process.env.BROWSER_ARGS ? JSON.parse(process.env.BROWSER_ARGS) : undefined,
});
