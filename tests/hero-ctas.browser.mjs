// Run against a running app: node tests/hero-ctas.browser.mjs
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage();
// The Atlas intro covers the hero for a few seconds; this suite clicks its CTA, so it starts with the intro seen.
await page.addInitScript(() => sessionStorage.setItem("atlas-boot", "done"));
const baseURL = process.env.BASE_URL || "http://127.0.0.1:3100";
const github = "https://github.com/glaucia86";
const linkedin = "https://www.linkedin.com/in/glaucialemos";
const youtube = "https://www.youtube.com/@GlauciaLemos";
const socials = [
  ["YouTube", youtube],
  ["X", "https://x.com/glaucia_lemos86"],
  ["LinkedIn", linkedin],
  ["Instagram", "https://www.instagram.com/glaucia.lemos.dev"],
];
const youtubeLabels = { pt: "Assistir no YouTube", en: "Watch on YouTube", es: "Ver en YouTube" };
const messages = {
  pt: "Gostaria de convidar você para palestrar.",
  en: "I would like to invite you to speak at an event.",
  es: "Me gustaría invitarte a dar una charla.",
};

try {
  for (const lang of ["pt", "en", "es"]) {
    const routes = [
      ["", `/${lang}/servicos`, "#projetos"],
      ["/servicos", "#contato", `/${lang}/eventos`],
      ["/sobre", "#trajetoria", linkedin],
      ["/projetos", github, "#projetos"],
      ["/conteudo", "#artigos", youtube],
      ["/eventos", `/${lang}/servicos?assunto=palestra#contato`, "#diario"],
      ["/pagina-inexistente", `/${lang}`, null],
    ];
    for (const [route, primary, secondary] of routes) {
      await page.goto(`${baseURL}/${lang}${route}`);
      const footerLinks = page.locator("footer .socials a");
      await expect(footerLinks).toHaveCount(4);
      for (const [index, [name, href]] of socials.entries()) {
        const link = footerLinks.nth(index);
        await expect(link).toHaveAttribute("href", href);
        await expect(link).toHaveAttribute("aria-label", `${name} ${lang === "en" ? "by" : "de"} Glaucia Lemos`);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
        await expect(link.locator('svg[aria-hidden="true"]')).toHaveCount(1);
      }
      const links = page.locator(".page-hero .actions a");
      await expect(links).toHaveCount(secondary ? 2 : 1);
      if (route === "") {
        await expect(links.nth(1)).toHaveAttribute("href", "#projetos");
        await footerLinks.first().focus();
        await page.keyboard.press("Tab");
        await expect(footerLinks.nth(1)).toBeFocused();
        assert.ok(await footerLinks.nth(1).evaluate((link) => {
          const style = getComputedStyle(link);
          return link.matches(":focus-visible") && style.outlineStyle === "solid" && parseFloat(style.outlineWidth) >= 3;
        }));
      }
      if (route === "/conteudo") await expect(links.nth(1)).toContainText(youtubeLabels[lang]);
      if (route === "/servicos") await expect(page.locator("#contato > a")).toHaveAttribute("href", linkedin);
      for (const [index, href] of [primary, secondary].filter(Boolean).entries()) {
        const link = links.nth(index);
        await expect(link).toHaveAttribute("href", href);
        if (href.startsWith("https://")) {
          await expect(link).toHaveAttribute("target", "_blank");
          await expect(link).toHaveAttribute("rel", "noopener noreferrer");
        } else {
          assert.equal(await link.getAttribute("target"), null);
        }
        if (href.startsWith("#")) await expect(page.locator(href)).toHaveCount(1);
      }
      if (route === "/eventos") {
        await links.first().click();
        await expect(page).toHaveURL(`${baseURL}/${lang}/servicos?assunto=palestra#contato`);
        await expect(page.locator("#contato textarea")).toHaveValue(messages[lang]);
      }
    }
    for (const query of ["", "?assunto=desconhecido"]) {
      await page.goto(`${baseURL}/${lang}/servicos${query}`);
      await expect(page.locator("#contato textarea")).toHaveValue("");
    }
  }

  for (const width of [320, 390, 640]) {
    await page.setViewportSize({ width, height: 900 });
    // Atlas das Conexões on small screens: the copy first, then the whole 16:9 plate with the crew and the hologram.
    for (const lang of ["pt", "en", "es"]) {
      await page.goto(`${baseURL}/${lang}/eventos`);
      await page.locator(".page-hero__image").evaluate((image) => image.decode());
      const eventsComposition = await page.locator(".page-hero").evaluate((hero) => {
        const box = hero.querySelector(".page-hero__image").getBoundingClientRect();
        const text = hero.querySelector(".page-hero__content").getBoundingClientRect();
        const frame = hero.getBoundingClientRect();
        return {
          belowText: box.top >= text.bottom - 1,
          wholePlate: Math.abs(box.width / box.height - 16 / 9) < .02 && box.left >= frame.left - 1 && box.right <= frame.right + 1,
          noOverflow: document.documentElement.scrollWidth <= window.innerWidth,
        };
      });
      assert.ok(eventsComposition.belowText && eventsComposition.wholePlate && eventsComposition.noOverflow, `Eventos ${lang}, ${width}px: ${JSON.stringify(eventsComposition)}`);
    }
  }
  console.log("PASS: hero CTAs, social footer and keyboard focus in pt/en/es, external link attributes, localized contact prefill, 404 and Projects/Events mobile scenes at 320/390/640px.");
} finally {
  await browser.close();
}
