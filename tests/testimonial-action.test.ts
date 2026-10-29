import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitTestimonial } from '@/app/actions/testimonial';
import { testimonialCopy } from '@/i18n/testimonial';
import { testimonials } from '@/data/prova-social';

const fetchMock = vi.fn();
function form(overrides: Record<string, string | null> = {}) {
  const data = new FormData();
  const base: Record<string, string | null> = { name: 'Ana', role: 'Tech Lead · Acme', linkedin: '', context: 'workshop', quote: 'O workshop mudou a forma como o time usa IA no dia a dia.', consent: 'on', lang: 'pt', website: '', 'cf-turnstile-response': 'test-token', ...overrides };
  for (const [key, value] of Object.entries(base)) if (value !== null) data.set(key, value);
  return data;
}
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
beforeEach(() => {
  vi.stubEnv('RESEND_API_KEY', 'private-resend');
  vi.stubEnv('CONTACT_FROM', 'Site <contato@mail.glaucialemos.dev>');
  vi.stubEnv('CONTACT_TO', 'private-inbox@example.com');
  vi.stubEnv('TURNSTILE_SITE_KEY', 'public-site-key');
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'private-turnstile');
  vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('Server Action de depoimentos', () => {
  it('honeypot finge sucesso e não envia nada', async () => {
    expect(await submitTestimonial(null, form({ website: 'bot' }))).toEqual({ status: 'ok' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('fica indisponível sem as chaves', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    expect(await submitTestimonial(null, form())).toEqual({ status: 'unavailable' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['pt', 'en', 'es'] as const)('valida no servidor em %s: autorização obrigatória, texto curto, LinkedIn inválido', async lang => {
    const result = await submitTestimonial(null, form({ lang, consent: null, quote: 'curto', linkedin: 'https://example.com' }));
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(result.errors.consent).toEqual([testimonialCopy[lang].errors.consent]);
      expect(result.errors.quote).toEqual([testimonialCopy[lang].errors.quote]);
      expect(result.errors.linkedin).toEqual([testimonialCopy[lang].errors.linkedin]);
      expect(result.values.name).toBe('Ana');
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('rejeita contexto desconhecido e falha fechada no Turnstile', async () => {
    expect((await submitTestimonial(null, form({ context: 'hack' }))).status).toBe('invalid');
    fetchMock.mockResolvedValueOnce(response({ success: false }));
    expect((await submitTestimonial(null, form())).status).toBe('captcha');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('envia para revisão pelo Resend e nunca publica sozinho', async () => {
    fetchMock.mockResolvedValueOnce(response({ success: true })).mockResolvedValueOnce(response({ id: 'email-2' }));
    expect(await submitTestimonial(null, form({ linkedin: 'https://www.linkedin.com/in/ana' }))).toEqual({ status: 'ok' });
    const [url, request] = fetchMock.mock.calls[1];
    expect(url).toBe('https://api.resend.com/emails');
    const body = JSON.parse(request.body);
    expect(body.subject).toBe('Depoimento para aprovar — Ana');
    expect(body.to).toEqual(['private-inbox@example.com']);
    for (const value of ['Cargo e empresa: Tech Lead · Acme', 'Contexto: Workshop', 'Autorizou publicar: sim', 'LinkedIn: https://www.linkedin.com/in/ana', 'O workshop mudou']) expect(body.text).toContain(value);
    expect(testimonials).toEqual([]);
  });
  it('erro do Resend preserva o texto e não vaza chaves', async () => {
    fetchMock.mockResolvedValueOnce(response({ success: true })).mockResolvedValueOnce(response({ message: 'invalid' }, 422));
    const result = await submitTestimonial(null, form());
    expect(result.status).toBe('error');
    if (result.status === 'error') expect(result.values?.quote).toContain('O workshop');
    expect(JSON.stringify(result)).not.toContain('private-');
  });
});
