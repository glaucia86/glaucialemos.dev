import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContactForm } from '@/components/ContactForm';
import { ContactCinema } from '@/components/services/ContactCinema';
import { ContactCrew, CREW_FACES } from '@/components/services/AureliaScene';
import { crewReaction, portalTarget, PORTAL_HASH } from '@/components/services/contact-portal';
import { portalRadius } from '@/components/services/portal-sky';
import { contactFields, contactStepOf, contactSteps, validateContactStep, type ContactValues } from '@/lib/contact-schema';
import { contactCopy } from '@/i18n/contact';
import { aurelia } from '@/i18n/aurelia';
import pt from '@/i18n/dictionaries/pt';

const empty: ContactValues = { name: '', company: '', service: '', message: '', linkedin: '', consent: false };
const filled: ContactValues = { name: 'Ana', company: 'Equipe', service: 'palestras', message: 'Olá', linkedin: 'https://www.linkedin.com/in/ana', consent: true };

describe('formulário em três etapas', () => {
  it('cobre cada campo exatamente uma vez, na ordem necessidade → quem → mensagem', () => {
    expect(contactSteps.flat().sort()).toEqual([...contactFields].sort());
    expect(contactSteps[0]).toEqual(['service']);
    expect(contactStepOf('linkedin')).toBe(1);
    expect(contactStepOf('consent')).toBe(2);
  });
  it.each(['pt', 'en', 'es'] as const)('valida só os campos da etapa com as mensagens do idioma (%s)', lang => {
    const errors = contactCopy[lang].errors;
    expect(validateContactStep(lang, 0, empty)).toEqual({ service: [errors.service] });
    expect(Object.keys(validateContactStep(lang, 1, empty)).sort()).toEqual(['company', 'linkedin', 'name']);
    expect(validateContactStep(lang, 1, { ...filled, linkedin: 'https://example.com' })).toEqual({ linkedin: [errors.linkedin] });
    expect(Object.keys(validateContactStep(lang, 2, empty)).sort()).toEqual(['consent', 'message']);
    for (const step of [0, 1, 2]) expect(validateContactStep(lang, step, filled)).toEqual({});
  });
  it.each(['pt', 'en', 'es'] as const)('sem JS entrega um formulário único, completo e sem etapas escondidas (%s)', lang => {
    const html = renderToStaticMarkup(createElement(ContactForm, { copy: pt.services, lang, enabled: true, siteKey: 'test', subject: 'workshop' }));
    expect(html.match(/<fieldset/g)).toHaveLength(3);
    expect(html).not.toMatch(/<fieldset[^>]*hidden/);
    expect(html).not.toContain('contact-seeds');
    expect(html).not.toContain('contact-step__next');
    expect(html.match(/type="radio"/g)!.length).toBeGreaterThanOrEqual(3);
    expect(html.match(/type="submit"/g)).toHaveLength(1);
    for (const title of contactCopy[lang].steps) expect(html).toContain(title.replace(/'/g, '&#x27;'));
    expect(html).toContain('id="contact-title"');
  });
});

describe('portal do contato', () => {
  const here = { href: 'https://glaucialemos.dev/pt/servicos', pathname: '/pt/servicos', search: '' };
  it('abre para CTAs da própria página e navega antes quando o assunto muda', () => {
    expect(portalTarget(PORTAL_HASH, here)).toBe('open');
    expect(portalTarget('/pt/servicos#contato', here)).toBe('open');
    expect(portalTarget('/pt/servicos?assunto=workshop#contato', here)).toBe('navigate');
    expect(portalTarget('/pt/servicos?assunto=workshop#contato', { ...here, search: '?assunto=workshop', href: `${here.href}?assunto=workshop` })).toBe('open');
    expect(portalTarget('/pt/eventos#contato', here)).toBeNull();
    expect(portalTarget('#jardins', here)).toBeNull();
    expect(portalTarget('https://example.com/pt/servicos#contato', here)).toBeNull();
  });
  it('Glaucia e Prince reagem só com retratos aprovados', () => {
    const allowed = { glaucia: CREW_FACES.glaucia as readonly string[], prince: CREW_FACES.prince as readonly string[] };
    const cases = [
      [{ status: 'idle', step: '0', flaw: false }, 'face-smile', 'face-idle'],
      [{ status: 'idle', step: '1', flaw: false }, 'face-look', 'face-happy'],
      [{ status: 'idle', step: '2', flaw: false }, 'face-thoughtful', 'face-happy'],
      [{ status: 'idle', step: '1', flaw: true }, 'face-neutral', 'face-curious'],
      [{ status: 'pending', step: '2', flaw: false }, 'face-look', 'face-curious'],
      [{ status: 'ok', step: '0', flaw: false }, 'face-smile', 'face-joy'],
      [{ status: 'error', step: '2', flaw: false }, 'face-neutral', 'face-curious'],
    ] as const;
    for (const [input, glaucia, prince] of cases) {
      const faces = crewReaction(input);
      expect(faces).toEqual({ glaucia, prince });
      expect(allowed.glaucia).toContain(faces.glaucia);
      expect(allowed.prince).toContain(faces.prince);
    }
  });
  it('a íris cobre a tela inteira a partir de qualquer ponto', () => {
    expect(portalRadius(0, 0, 300, 400)).toBe(500);
    expect(portalRadius(150, 200, 300, 400)).toBe(250);
    expect(portalRadius(290, 390, 300, 400)).toBeGreaterThanOrEqual(Math.hypot(290, 390));
  });
  it.each(['pt', 'en', 'es'] as const)('SSR: portal fechado, decorações escondidas e retratos fora da árvore acessível (%s)', lang => {
    const html = renderToStaticMarkup(createElement(ContactCinema, { copy: aurelia[lang].contact.cinema, portal: aurelia[lang].contact.portal, crew: createElement(ContactCrew) },
      createElement(ContactForm, { copy: pt.services, lang, enabled: true, siteKey: 'test' })));
    expect(html).not.toMatch(/popover|role="dialog"|aria-modal/);
    expect(html).toMatch(/<button[^>]*class="contact-portal__close"[^>]*hidden=""/);
    expect(html).toContain(aurelia[lang].contact.portal.close);
    expect(html).toMatch(/<div class="contact-launch" aria-hidden="true">/);
    expect(html).toMatch(/<div class="contact-crew" aria-hidden="true">/);
    expect(html.match(/data-face=/g)).toHaveLength(8);
    expect(html).toContain('/galaxia/actors/prince/aurelia/face-joy.webp');
  });
});
