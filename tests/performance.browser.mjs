import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const label = process.argv[2] || "after";
if (!["before", "after"].includes(label)) throw new Error("Use before or after");
const prefix = process.env.REPORT_PREFIX ? `${process.env.REPORT_PREFIX}-` : "";
const browser = await chromium.launch();
const results = [];
try {
  for (let run = 0; run < 3; run++) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 40, downloadThroughput: 1_250_000, uploadThroughput: 625_000 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.metrics = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.metrics.lcp = entry.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.metrics.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(process.env.BASE_URL || "http://127.0.0.1:3100/pt");
    await page.waitForTimeout(3000);
    const metrics = await page.evaluate(() => ({ ...window.metrics, jsBytes: performance.getEntriesByType("resource").filter((entry) => entry.initiatorType === "script").reduce((sum, entry) => sum + entry.encodedBodySize, 0) }));
    await cdp.send("Performance.enable");
    const beforeScroll = await cdp.send("Performance.getMetrics");
    await page.evaluate(async () => {
      const extent = document.documentElement.scrollHeight - innerHeight;
      for (let step = 0; step <= 60; step++) {
        scrollTo(0, extent * (step <= 30 ? step / 30 : (60 - step) / 30));
        await new Promise(requestAnimationFrame);
      }
    });
    const afterScroll = await cdp.send("Performance.getMetrics");
    for (const key of ["ScriptDuration", "LayoutDuration"]) {
      metrics[key] = afterScroll.metrics.find((item) => item.name === key).value - beforeScroll.metrics.find((item) => item.name === key).value;
    }
    results.push(metrics);
    if (run === 0) await page.screenshot({ path: `docs/screenshots/home-${prefix}${label}.png`, fullPage: true });
    await context.close();
  }
  const median = (key) => results.map((result) => result[key]).sort((a, b) => a - b)[1];
  const report = { environment: "Chromium headless; production build; cold contexts; 390x844 DPR1; CPU 4x; latency 40ms; download 10Mbps; local server; 61-frame scroll round trip", runs: results, median: Object.fromEntries(["lcp", "cls", "jsBytes", "ScriptDuration", "LayoutDuration"].map((key) => [key, median(key)])) };
  await fs.writeFile(`docs/performance-${prefix}${label}.json`, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
