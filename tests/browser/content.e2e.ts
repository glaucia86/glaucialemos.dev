import { expect, test } from "@playwright/test";

test("a biblioteca revela artigos em lotes e reinicia o lote ao filtrar", async ({ page }) => {
  await page.goto("/pt/conteudo");
  const articles = page.locator(".article-list article");
  await expect(articles).toHaveCount(12);
  await page.getByRole("button", { name: "Mostrar mais artigos" }).click();
  await expect(articles).toHaveCount(24);
  await page.getByRole("button", { name: "DEV Community", exact: true }).click();
  await expect(articles).toHaveCount(12);
  await expect(articles.locator(".tag")).toHaveText(Array(12).fill("DEV Community"));
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  await expect(articles).toHaveCount(12);
});
