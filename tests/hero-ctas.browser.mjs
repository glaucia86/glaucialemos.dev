// Run against a running app: node tests/hero-ctas.browser.mjs
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage();
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
      ["", `/${lang}/servicos`, youtube],
      ["/servicos", "#contato", `/${lang}/eventos`],
      ["/sobre", "#trajetoria", linkedin],
      ["/projetos", github, "#projetos"],
      ["/conteudo", "#artigos", linkedin],
      ["/eventos", `/${lang}/servicos?assunto=palestra#contato`, "#eventos"],
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
        await expect(links.nth(1)).toContainText(youtubeLabels[lang]);
        await footerLinks.first().focus();
        await page.keyboard.press("Tab");
        await expect(footerLinks.nth(1)).toBeFocused();
        assert.ok(await footerLinks.nth(1).evaluate((link) => {
          const style = getComputedStyle(link);
          return link.matches(":focus-visible") && style.outlineStyle === "solid" && parseFloat(style.outlineWidth) >= 3;
        }));
      }
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
    await page.goto(`${baseURL}/pt/eventos`);
    await expect(page.locator(".hologram-globe")).toBeVisible();

    for (const lang of ["pt", "en", "es"]) {
      await page.goto(`${baseURL}/${lang}/projetos`);
      const composition = await page.locator(".page-hero").evaluate((hero) => {
        const text = hero.querySelector(".page-hero__content").getBoundingClientRect();
        const image = hero.querySelector(".page-hero__image").getBoundingClientRect();
        const plane = hero.querySelector(".scene-image-plane").getBoundingClientRect();
        const frame = hero.getBoundingClientRect();
        // R2-D2's center in the 1024 × 576 reference image.
        const r2 = { x: plane.x + plane.width * .78, y: plane.y + plane.height * .78 };
        return {
          belowText: image.top >= text.bottom,
          r2Visible: r2.x > frame.left && r2.x < frame.right && r2.y > text.bottom && r2.y < frame.bottom,
          shade: getComputedStyle(hero.querySelector(".page-hero__shade")).backgroundImage,
          noOverflow: document.documentElement.scrollWidth <= window.innerWidth,
        };
      });
      assert.ok(composition.belowText && composition.r2Visible && composition.noOverflow, `${lang}, ${width}px: ${JSON.stringify(composition)}`);
      assert.match(composition.shade, /28%/);

      await page.goto(`${baseURL}/${lang}/eventos`);
      await page.locator(".page-hero__image").evaluate((image) => image.decode());
      const eventsComposition = await page.locator(".page-hero").evaluate((hero) => {
        const image = hero.querySelector(".page-hero__image");
        const box = image.getBoundingClientRect();
        const text = hero.querySelector(".page-hero__content").getBoundingClientRect();
        const frame = hero.getBoundingClientRect();
        const scale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        const [x, y] = getComputedStyle(image).objectPosition.split(" ").map(parseFloat);
        const left = box.x + (box.width - width) * x / 100;
        const top = box.y + (box.height - height) * y / 100;
        // Bounds of the complete hologram and Grogu in the reference image.
        const sceneVisible = left + width * .585 >= frame.left && left + width * .92 <= frame.right
          && top + height * .31 >= text.bottom && top + height * .83 <= frame.bottom;
        return {
          belowText: box.top >= text.bottom,
          sceneVisible,
          shade: getComputedStyle(hero.querySelector(".page-hero__shade")).backgroundImage,
          noOverflow: document.documentElement.scrollWidth <= window.innerWidth,
        };
      });
      assert.ok(eventsComposition.belowText && eventsComposition.sceneVisible && eventsComposition.noOverflow, `Eventos ${lang}, ${width}px: ${JSON.stringify(eventsComposition)}`);
      assert.equal(eventsComposition.shade, composition.shade);
    }
  }
  console.log("PASS: hero CTAs, social footer and keyboard focus in pt/en/es, external link attributes, localized contact prefill, 404 and Projects/Events mobile scenes at 320/390/640px.");
} finally {
  await browser.close();
}
