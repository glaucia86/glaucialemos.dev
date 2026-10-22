import { expect, test } from "@playwright/test";

test("globo para de renderizar com redução de movimento e fora da tela", async ({ page }) => {
  await page.addInitScript(() => {
    for (const Context of [WebGLRenderingContext, WebGL2RenderingContext]) {
      const draw = Context.prototype.drawArrays;
      Context.prototype.drawArrays = function (...args) {
        const canvas = this.canvas as HTMLCanvasElement;
        if (canvas.classList.contains("globe")) {
          canvas.dataset.draws = String(Number(canvas.dataset.draws || 0) + 1);
        }
        return draw.apply(this, args);
      };
    }
  });
  await page.goto("/pt/eventos");
  const globe = page.locator("canvas.globe");
  await globe.scrollIntoViewIfNeeded();
  await expect.poll(() => globe.getAttribute("data-draws")).not.toBeNull();
  const draws = () => globe.evaluate((canvas) => Number(canvas.dataset.draws));
  const initial = await draws();
  await expect.poll(draws).toBeGreaterThan(initial);

  await page.emulateMedia({ reducedMotion: "reduce" });
  // Let the preference event and any already queued frame settle.
  await page.waitForTimeout(150);
  const stopped = await draws();
  await page.waitForTimeout(250);
  expect(await draws()).toBe(stopped);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(draws).toBeGreaterThan(stopped);
  await page.getByRole("button", { name: "Reduzir animações" }).click();
  await page.waitForTimeout(150);
  const manual = await draws();
  await page.waitForTimeout(250);
  expect(await draws()).toBe(manual);
  await page.getByRole("button", { name: "Ativar animações" }).click();
  await expect.poll(draws).toBeGreaterThan(manual);
  await page.locator("h1").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const offscreen = await draws();
  await page.waitForTimeout(250);
  expect(await draws()).toBe(offscreen);
});

test("sem WebGL, mantém a composição e o histórico acessível", async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type, ...args) {
      if (type === "webgl" || type === "webgl2") return null;
      return getContext.call(this, type, ...args);
    } as typeof getContext;
  });
  await page.goto("/pt/eventos");
  await page.locator(".globe-stage").scrollIntoViewIfNeeded();
  await expect(page.locator(".globe-fallback")).toBeVisible();
  await expect(page.locator(".event-stats strong").first()).toHaveText(/105/);
  const year = page.locator(".event-history summary").first();
  await year.click();
  await expect(page.locator(".event-history details").first().locator("li").first()).toBeVisible();
});

test("sem JavaScript, os totais e a representação estática continuam visíveis", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/pt/eventos");
  await expect(page.locator(".event-stats strong").first()).toHaveText(/105/);
  await expect(page.locator(".globe-fallback")).toBeVisible();
  await context.close();
});

test("movimento reduzido desde a abertura usa a composição estática sem inicializar WebGL", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pt/eventos");
  await page.locator(".globe-stage").scrollIntoViewIfNeeded();
  const canvas = page.locator("canvas.globe");
  await expect(canvas).toHaveAttribute("data-reduced", "true");
  await expect(canvas).not.toHaveAttribute("data-ready", "true");
  await expect(page.locator(".globe-fallback")).toBeVisible();
  await expect(page.locator(".globe-caption--static")).toBeVisible();
  await expect(page.locator(".event-stats strong").first().locator("[aria-hidden]")).toHaveText("105");
});
