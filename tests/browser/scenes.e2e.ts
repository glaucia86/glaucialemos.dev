import { expect, test } from "@playwright/test";

test("a cena reage ao ponteiro e pausa fora da tela", async ({ page }) => {
  await page.goto("/pt/servicos");
  const scene = page.locator(".scene-world");
  await expect(scene).toHaveAttribute("data-active", "true");
  const initialTransform = await scene.evaluate((node) => getComputedStyle(node).transform);
  await page.mouse.move(1100, 300);
  await expect.poll(() => scene.evaluate((node) => node.style.getPropertyValue("--scene-x"))).not.toBe("");
  await expect.poll(() => scene.evaluate((node) => getComputedStyle(node).transform)).not.toBe(initialTransform);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-active", "false");
  expect(await page.locator(".saber-blade").evaluate((node) => getComputedStyle(node).animationPlayState)).toBe("paused");
});

test("redução de movimento desativa profundidade e efeitos sem esconder conteúdo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pt/servicos");
  await expect(page.locator(".scene-world")).toHaveAttribute("data-active", "false");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".page-hero .button.primary")).toBeVisible();
  expect(await page.locator(".scene-world").evaluate((node) => getComputedStyle(node).transform)).toBe("none");
});

for (const route of ["", "/sobre", "/projetos", "/conteudo", "/eventos", "/servicos"]) {
  test(`texto e ilustração separados no mobile: /pt${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`/pt${route}`);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    const text = await page.locator(".page-hero__content").boundingBox();
    const art = await page.locator(".page-hero__image").boundingBox();
    expect(art!.y, route).toBeGreaterThanOrEqual(text!.y + text!.height - 1);
  });
}
