import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/ContactForm";
import pt from "@/i18n/dictionaries/pt";
import en from "@/i18n/dictionaries/en";
import es from "@/i18n/dictionaries/es";

const { query } = vi.hoisted(() => ({ query: { value: "" } }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(query.value) }));

describe("mensagem inicial do contato", () => {
  it.each([
    [pt, 'Gostaria de planejar um workshop para o meu time.', 'Gostaria de conversar sobre mentoria.'],
    [en, 'I would like to plan a workshop for my team.', 'I would like to discuss mentoring.'],
    [es, 'Me gustaría planear un taller para mi equipo.', 'Me gustaría conversar sobre mentoría.'],
  ] as const)("preenche workshop e mentoria com mensagens editáveis (%#)", (dictionary, workshop, mentoring) => {
    for (const [subject, message] of [["workshop", workshop], ["mentoria", mentoring]]) {
      query.value = `assunto=${subject}`;
      const html = renderToStaticMarkup(createElement(ContactForm, { copy: dictionary.services, formId: "test" }));
      expect(html).toContain(`>${message}</textarea>`);
      expect(html).not.toMatch(/<textarea[^>]*(disabled|readonly)/);
    }
  });
  it.each([pt, en, es])("preenche o convite no idioma da página (%#)", (dictionary) => {
    query.value = "assunto=palestra";
    const html = renderToStaticMarkup(createElement(ContactForm, { copy: dictionary.services }));
    expect(html).toContain(`>${dictionary.services.talkMessage}</textarea>`);
    expect(html).toContain('id="contato"');
  });

  it.each(["", "assunto=desconhecido"])("deixa a mensagem vazia para '%s'", (value) => {
    query.value = value;
    const html = renderToStaticMarkup(createElement(ContactForm, { copy: pt.services }));
    expect(html).toMatch(/<textarea[^>]*><\/textarea>/);
  });
});
