import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import About from "@/app/[lang]/sobre/page";

describe.each(["pt", "en", "es"])("bio em %s", (lang) => {
  it("renderiza os três programas como links externos seguros", async () => {
    const html = renderToStaticMarkup(await About({ params: Promise.resolve({ lang }) }));
    const anchors = [...html.matchAll(/<a\b([^>]*)>([^<]*)<\/a>/g)];

    for (const [label, href] of [
      ["Microsoft MVP", "https://mvp.microsoft.com/pt-BR/MVP/profile/d3200941-395d-423b-a0ec-eb0577d3bb86"],
      ["OpenAI Codex Ambassador", "https://developers.openai.com/community/codex-ambassadors/directory?site_locale=en&amp;ambassador=glaucia-lemos"],
      ["Devin Ambassador", "https://devin.ai/community"],
    ]) {
      const matches = anchors.filter((anchor) => anchor[2] === label);
      expect(matches, label).toHaveLength(1);
      expect(matches[0][1]).toContain(`href="${href}"`);
      expect(matches[0][1]).toContain('target="_blank"');
      expect(matches[0][1]).toContain('rel="noopener noreferrer"');
    }
  });

  it("renderiza quatro parágrafos e o título do livro em itálico", async () => {
    const html = renderToStaticMarkup(await About({ params: Promise.resolve({ lang }) }));
    const paragraphs = html.match(/<p class="page-hero__(?:subtitle|extra)">.*?<\/p>/g);

    expect(paragraphs).toHaveLength(4);
    expect(paragraphs?.[3]).toContain("<em>Building Agentic AI Apps with Next.js, TypeScript and MCP</em>");
  });
});
