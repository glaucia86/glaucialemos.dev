import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OpeningCrawl } from "@/components/OpeningCrawl";
import { getDictionary } from "@/i18n/dictionaries";

describe.each(["pt", "en", "es"] as const)("opening crawl in %s", (locale) => {
  it("keeps the full story readable without JavaScript and the modal closed until motion preferences are known", () => {
    const copy = getDictionary(locale).home;
    const html = renderToStaticMarkup(<OpeningCrawl copy={copy} />);
    const story = html.match(/<section\b[^>]*>([\s\S]*?)<\/section>/)?.[1];
    expect(story).toContain(copy.crawlTitle);
    for (const paragraph of copy.crawl) expect(story).toContain(paragraph);
    const dialog = html.match(/<dialog\b([^>]*)>/)?.[1];
    expect(dialog).toBeDefined();
    expect(dialog).not.toMatch(/\bopen(?:=|\s|$)/);
    expect(html).toContain(copy.crawlOpening);
    expect(html).toContain(copy.crawlSkip);
  });
});
