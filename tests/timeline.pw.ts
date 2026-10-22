import { expect, test } from "@playwright/test";

for (const lang of ["pt", "en", "es"]) {
  test(`${lang}: disclosures support click, Enter, Space, and independent panels`, async ({ page }) => {
    await page.goto(`/${lang}/sobre`);
    const buttons = page.locator(".timeline__trigger");
    await expect(buttons).toHaveCount(12);
    // Exercise every aria-controls relationship, not only the first entry.
    for (const button of await buttons.all()) {
      const panel = page.locator(`#${await button.getAttribute("aria-controls")}`);
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(panel).toBeHidden();
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(panel).toBeVisible();
      await expect(panel).toHaveAttribute("aria-labelledby", await button.getAttribute("id") as string);
      await button.press("Enter");
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(panel).toBeHidden();
      await button.press("Space");
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(panel).toBeVisible();
      await expect(button).toBeFocused();
    }
    await expect(page.locator('.timeline__trigger[aria-expanded="true"]')).toHaveCount(12);
    await buttons.first().press("Space");
    await expect(page.locator('.timeline__trigger[aria-expanded="true"]')).toHaveCount(11);
  });
}

test("saber progresses on scroll and respects live system/manual motion preferences", async ({ page }) => {
  await page.goto("/pt/sobre");
  const timeline = page.locator(".experience-timeline");
  const blade = page.locator(".timeline-saber__blade");
  const progress = () => timeline.evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--saber-progress")));
  await timeline.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - innerHeight * .55, behavior: "instant" }));
  await expect.poll(progress).toBeGreaterThan(0);
  const start = await progress();
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: "instant" }));
  await expect.poll(progress).toBeGreaterThan(start);
  await timeline.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().bottom + window.scrollY - innerHeight * .7, behavior: "instant" }));
  await expect.poll(progress).toBe(1);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(blade).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await page.locator("#experience-packt").click();
  await expect(page.locator("#experience-packt-panel")).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Reduzir animações" }).click();
  await expect(blade).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await expect(page.locator("#experience-packt-panel")).toHaveCSS("animation-name", "none");
});

test("mobile panels fit the viewport and show a visible keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/es/sobre");
  const button = page.locator("#experience-microsoft-ai");
  await button.focus();
  await button.press("Space");
  await expect(button).toHaveCSS("outline-style", "solid");
  const box = await page.locator("#experience-microsoft-ai-panel").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
});
