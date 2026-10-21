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
