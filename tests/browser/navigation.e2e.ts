import { expect, test } from "@playwright/test";

test("a entrada respeita o idioma e preserva os parâmetros", async ({ request }) => {
  for (const [language, locale] of [["en-US", "en"], ["es", "es"], ["fr", "pt"]]) {
    const response = await request.get("/?origem=convite", {
      headers: { "accept-language": language },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(307);
    const target = new URL(response.headers().location);
    expect(target.pathname).toBe(`/${locale}`);
    expect(target.searchParams.get("origem")).toBe("convite");
  }
});

test("URLs desconhecidas retornam 404 sem interromper as páginas válidas", async ({ page, request }) => {
  for (const path of ["/fr", "/fr/inexistente", "/pt/pagina-inexistente"]) {
    const missing = await request.get(path);
    expect(missing.status(), path).toBe(404);
    // Next can deliver a streamed error boundary that renders after hydration.
    await page.goto(path);
    await expect(page.locator(".page-hero__image")).toHaveAttribute("src", /404-stormtrooper/);
    await expect(page.locator("h1")).toContainText("Esta não é a");
    const valid = await request.get("/pt/servicos");
    expect(valid.status()).toBe(200);
  }
});

test("a troca de idioma mantém convite e âncora do formulário", async ({ page }) => {
  await page.goto("/pt/servicos?assunto=palestra#contato");
  await page.locator("#locale").selectOption("en");
  await expect(page).toHaveURL(/\/en\/servicos\?assunto=palestra#contato$/);
  await expect(page.locator("#contato textarea")).toHaveValue("I would like to invite you to speak at an event.");
  await expect(page.locator('nav a[aria-current="page"]')).toHaveAttribute("href", "/en/servicos");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("o menu mobile permite abrir, navegar e sair usando o teclado", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pt/servicos");
  const toggle = page.locator(".menu-toggle");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#primary-navigation a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  for (const control of [toggle, page.locator("#locale"), page.locator(".motion-toggle")]) {
    const box = await control.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
