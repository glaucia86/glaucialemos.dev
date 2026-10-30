import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getDictionary } from '@/i18n/dictionaries';
import { waitlistCopy } from '@/i18n/waitlist';

function files(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]);
}
const leaves = (value: unknown): string[] => value !== null && typeof value === 'object'
  ? Object.entries(value).flatMap(([key, child]) => leaves(child).map(path => `${key}.${path}`)) : [''];
describe('services copy guard', () => {
  it('keeps services/contact/epilogue sources free of employer and banking references', () => {
    const sources = [
      ...files('src/components/services'), ...files('src/components/epilogue'),
      ...files('src/i18n').filter(path => /\/(aurelia[^/]*|contact|waitlist|beyond-orbit)\.ts$/.test(path)),
      'src/data/servicos.json', 'src/data/depoimentos.json', 'src/components/ContactForm.tsx', 'src/components/ContactTurnstile.tsx', 'src/components/WaitlistForm.tsx',
      'src/app/[lang]/servicos/page.tsx', 'src/app/[lang]/alem-da-ultima-orbita/page.tsx',
      'src/app/actions/contact.ts', 'src/app/actions/waitlist.ts', 'src/lib/aurelia-records.ts', 'src/lib/contact-schema.ts', 'src/lib/waitlist-schema.ts',
    ];
    for (const path of sources) expect(readFileSync(path, 'utf8'), path).not.toMatch(/ita[uú]|banco|bank/i);
    for (const lang of ['pt', 'en', 'es'] as const) expect(JSON.stringify(getDictionary(lang).services)).not.toMatch(/ita[uú]|banco|bank/i);
  });
  it.each([
    ['pt', 'Serviços prestados de forma independente, sem vínculo com meu empregador.'],
    ['en', 'Services provided independently, with no affiliation with my employer.'],
    ['es', 'Servicios prestados de forma independiente, sin vínculo con mi empleador.'],
  ] as const)('contains the exact independence statement in %s', (lang, statement) => {
    expect(getDictionary(lang).services.independent).toBe(statement);
  });
  it('has matching dictionary and waitlist keys in all languages', () => {
    for (const lang of ['pt', 'en', 'es'] as const) {
      expect(leaves(getDictionary(lang).services).sort()).toEqual(leaves(getDictionary('pt').services).sort());
      expect(leaves(waitlistCopy[lang]).sort()).toEqual(leaves(waitlistCopy.pt).sort());
      expect(getDictionary(lang).services.waitlist).toBe(waitlistCopy[lang].submit);
    }
  });
  it.each([
    ['pt', 'Confira sua caixa de entrada e a pasta de spam. Abra o link do e-mail e confirme sua inscrição na lista de espera.'],
    ['en', 'Check your inbox and spam folder. Open the email link and confirm your waitlist registration.'],
    ['es', 'Revisa tu bandeja de entrada y la carpeta de spam. Abre el enlace del correo y confirma tu inscripción en la lista de espera.'],
  ] as const)('asks for email confirmation before registration in %s', (lang, message) => {
    expect(waitlistCopy[lang].success).toBe(message);
  });
  it('has no obsolete pricing phrases anywhere in src', () => {
    for (const path of files('src').filter(path => /\.(ts|tsx|css|json)$/.test(path))) {
      expect(readFileSync(path, 'utf8'), path).not.toMatch(/sob consulta|on request|a consultar/i);
    }
  });
});
