import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactForm } from "@/components/ContactForm";
import pt from "@/i18n/dictionaries/pt";
import en from "@/i18n/dictionaries/en";
import es from "@/i18n/dictionaries/es";
import { contactCopy } from "@/i18n/contact";
import { contactServiceId } from "@/lib/contact-schema";

describe("mensagem inicial do contato", () => {
  it.each([
    [pt, 'Gostaria de planejar um workshop para o meu time.', 'Gostaria de conversar sobre mentoria.'],
    [en, 'I would like to plan a workshop for my team.', 'I would like to discuss mentoring.'],
    [es, 'Me gustaría planear un taller para mi equipo.', 'Me gustaría conversar sobre mentoría.'],
  ] as const)("preenche workshop e mentoria com mensagens editáveis (%#)", (dictionary, workshop, mentoring) => {
    for (const [subject, message] of [["workshop", workshop], ["mentoria", mentoring]]) {
      const html = renderToStaticMarkup(createElement(ContactForm, { copy: dictionary.services, lang: "pt", enabled: true, siteKey: "test", subject }));
      expect(html).toContain(`>${message}</textarea>`);
      expect(html).not.toMatch(/<textarea[^>]*(disabled|readonly)/);
    }
  });
  it.each([pt, en, es])("preenche o convite no idioma da página (%#)", (dictionary) => {
    const html = renderToStaticMarkup(createElement(ContactForm, { copy: dictionary.services, lang: "pt", subject: "palestra" }));
    expect(html).toContain(`>${dictionary.services.talkMessage}</textarea>`);
    expect(html).toContain('id="contato"');
  });

  it.each(["", "assunto=desconhecido"])("deixa a mensagem vazia para '%s'", (value) => {
    const html = renderToStaticMarkup(createElement(ContactForm, { copy: pt.services, lang: "pt", subject: new URLSearchParams(value).get("assunto") }));
    expect(html).toMatch(/<textarea[^>]*><\/textarea>/);
  });
});


describe("contato SSR e configuração", () => {
  it.each([["pt", pt], ["en", en], ["es", es]] as const)("oferece LinkedIn e finalidade em %s sem configuração", (lang, dictionary) => {
    const html = renderToStaticMarkup(createElement(ContactForm, { copy: dictionary.services, lang, subject: "consultoria" }));
    expect(html).toContain('data-contact-enabled="false"');
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled/);
    expect(html).toContain('href="https://www.linkedin.com/in/glaucialemos" target="_blank" rel="noopener"');
    expect(html).toContain(contactCopy[lang].linkedin);
    expect(html).toContain(contactCopy[lang].purpose);
    expect(html).toContain(contactCopy[lang].consultancyMessage);
    expect(html).not.toContain('challenges.cloudflare.com');
    expect(html).not.toContain('name="email"');
  });
  it.each(['workshop', 'mentoria', 'palestra', 'consultoria'])('seleciona %s e mantém o formulário sem script externo no SSR', subject => {
    const html = renderToStaticMarkup(createElement(ContactForm, { copy: pt.services, lang: 'pt', enabled: true, siteKey: 'public-test', subject }));
    expect(html).toContain(`value="${contactServiceId(subject)}" selected=""`);
    expect(html).toMatch(/<input[^>]*id="contact-consent"[^>]*required=""/);
    expect(html).toContain('aria-describedby="contact-purpose"');
    expect(html).toContain('<noscript>');
    expect(html).not.toContain('challenges.cloudflare.com');
  });
});
