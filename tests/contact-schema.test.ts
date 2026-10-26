import { describe, expect, it } from 'vitest';
import services from '@/data/servicos.json';
import { contactCopy } from '@/i18n/contact';
import { contactOptions, contactSchema, contactServiceId, contactValues } from '@/lib/contact-schema';

const valid = { name: 'Ana', company: 'Acme', service: services[0].id, message: 'Vamos conversar.', linkedin: 'https://www.linkedin.com/in/ana', consent: true };
describe('schema compartilhado de contato', () => {
  it.each(['https://linkedin.com/in/ana', 'https://www.linkedin.com/in/Ana-123_abc/', 'https://linkedin.com/in/ana%20silva'])('aceita perfil %s', linkedin => {
    expect(contactSchema('pt').safeParse({ ...valid, linkedin }).success).toBe(true);
  });
  it.each(['', 'http://linkedin.com/in/ana', 'https://linkedin.com/company/acme', 'https://linkedin.com/in/', 'https://linkedin.com/in/ana?x=1', 'https://linkedin.com/in/ana#about', 'https://linkedin.com.evil.test/in/ana', 'https://evil.test/linkedin.com/in/ana', 'https://br.linkedin.com/in/ana', 'https://www.linkedin.com/in/ana/extra', 'https://linkedin.com/in/ana.silva', ' https://linkedin.com/in/ana', 'https://linkedin.com/in/ana\n'])('rejeita perfil %s', linkedin => {
    expect(contactSchema('pt').safeParse({ ...valid, linkedin }).success).toBe(false);
  });
  it.each(['pt', 'en', 'es'] as const)('valida campos obrigatórios com erros em %s', lang => {
    const result = contactSchema(lang).safeParse({ name: ' ', company: '', service: 'inventado', message: '', linkedin: '', consent: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      for (const [field, message] of Object.entries(contactCopy[lang].errors)) expect(errors[field as keyof typeof errors]).toEqual([message]);
    }
    expect(contactSchema(lang).safeParse({ ...valid, consent: 'on' }).success).toBe(false);
    expect(contactSchema(lang).safeParse({}).success).toBe(false);
  });
  it.each([['name', 120], ['company', 160], ['message', 5000]] as const)('limita %s', (field, max) => {
    expect(contactSchema('pt').safeParse({ ...valid, [field]: 'a'.repeat(max) }).success).toBe(true);
    expect(contactSchema('pt').safeParse({ ...valid, [field]: 'a'.repeat(max + 1) }).success).toBe(false);
  });
  it('usa o catálogo e acrescenta consultoria sem confundi-la com mentoria', () => {
    for (const lang of ['pt', 'en', 'es'] as const) {
      expect(contactOptions(lang)).toEqual([...services.map(service => ({ value: service.id, label: service.titulo[lang] })), { value: 'consultoria', label: contactCopy[lang].consultancy }]);
      for (const kind of ['workshop', 'mentoria', 'palestra', 'consultoria']) expect(contactSchema(lang).safeParse({ ...valid, service: contactServiceId(kind) }).success).toBe(true);
    }
    expect(contactServiceId(null)).toBe('');
    expect(contactServiceId('inventado')).toBe('');
    expect(contactServiceId(services[0].id)).toBe(services[0].id);
  });
  it('normaliza texto e interpreta FormData sem aceitar consentimento forjado', () => {
    expect(contactSchema('en').parse({ ...valid, name: ' Ana ' }).name).toBe('Ana');
    const data = new FormData();
    data.set('name', 'x'.repeat(200)); data.set('consent', 'false');
    const values = contactValues(data);
    expect(values.name).toHaveLength(121); expect(values.consent).toBe(false);
    expect(contactSchema('pt').safeParse(values).success).toBe(false);
  });
});
