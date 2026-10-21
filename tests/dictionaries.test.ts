import { describe, expect, it } from "vitest";
import en from "@/i18n/dictionaries/en";
import es from "@/i18n/dictionaries/es";
import pt from "@/i18n/dictionaries/pt";

function keys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === "object" && child !== null ? keys(child, path) : path;
  });
}

describe("dicionários", () => {
  it.each([
    [pt, "Assistir no YouTube", "de Glaucia Lemos"],
    [en, "Watch on YouTube", "by Glaucia Lemos"],
    [es, "Ver en YouTube", "de Glaucia Lemos"],
  ] as const)("traduz o CTA do YouTube e os rótulos sociais (%#)", (dictionary, cta, owner) => {
    expect(dictionary.content.secondaryCta).toBe(cta);
    expect(dictionary.footer.socialLabels).toEqual({
      youtube: `YouTube ${owner}`,
      x: `X ${owner}`,
      linkedin: `LinkedIn ${owner}`,
      instagram: `Instagram ${owner}`,
    });
  });

  it("têm as mesmas chaves", () => {
    expect(keys(en)).toEqual(keys(pt));
    expect(keys(es)).toEqual(keys(pt));
  });

  it.each([
    [pt, ["Conheça minha trajetória", "Ver no GitHub", "Ver projetos", "Ler artigos", "Convide para palestrar", "Ver eventos"]],
    [en, ["Explore my journey", "View on GitHub", "View projects", "Read articles", "Invite me to speak", "View events"]],
    [es, ["Conoce mi trayectoria", "Ver en GitHub", "Ver proyectos", "Leer artículos", "Invítame a dar una charla", "Ver eventos"]],
  ] as const)("traduz os CTAs de cada página (%#)", (dictionary, labels) => {
    expect([
      dictionary.about.primaryCta,
      dictionary.projects.primaryCta,
      dictionary.projects.secondaryCta,
      dictionary.content.primaryCta,
      dictionary.events.primaryCta,
      dictionary.events.secondaryCta,
    ]).toEqual(labels);
    expect(dictionary.about.secondaryCta).toBe("LinkedIn");
    expect(dictionary.services.talkMessage).not.toBe("");
  });
});
