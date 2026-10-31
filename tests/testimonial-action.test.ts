import { resetRateLimits } from '@/lib/rate-limit';
import { VISITOR_BANNER } from '@/lib/mail';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitTestimonial } from '@/app/actions/testimonial';
import { testimonialCopy } from '@/i18n/testimonial';
import { testimonials } from '@/data/prova-social';

vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-vercel-forwarded-for': '203.0.113.7' }) }));

const fetchMock = vi.fn();
function form(overrides: Record<string, string | null> = {}) {
  const data = new FormData();
  const base: Record<string, string | null> = { name: 'Ana', role: 'Tech Lead · Acme', linkedin: '', context: 'workshop', quote: 'O workshop mudou a forma como o time usa IA no dia a dia.', consent: 'on', lang: 'pt', website: '', 'cf-turnstile-response': 'test-token', ...overrides };
  for (const [key, value] of Object.entries(base)) if (value !== null) data.set(key, value);
  return data;
}
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
beforeEach(() => {
  resetRateLimits();
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
    fetchMock.mockResolvedValueOnce(response({ success: true, hostname: 'glaucialemos.dev', action: 'testimonial' })).mockResolvedValueOnce(response({ id: 'email-2' }));
    expect(await submitTestimonial(null, form({ linkedin: 'https://www.linkedin.com/in/ana' }))).toEqual({ status: 'ok' });
    const [url, request] = fetchMock.mock.calls[1];
    expect(url).toBe('https://api.resend.com/emails');
    const body = JSON.parse(request.body);
    expect(body.text.startsWith(`${VISITOR_BANNER}\n\n`)).toBe(true);
    expect(body).not.toHaveProperty('reply_to');
    expect(body.subject).toBe('[Site] Depoimento para aprovar — Ana');
    expect(body.to).toEqual(['private-inbox@example.com']);
    for (const value of ['Cargo e empresa: Tech Lead · Acme', 'Contexto: Workshop', 'Autorizou publicar: sim', 'LinkedIn: https://www.linkedin.com/in/ana', 'O workshop mudou']) expect(body.text).toContain(value);
    expect(testimonials).toEqual([]);
  });
  it('erro do Resend preserva o texto e não vaza chaves', async () => {
    fetchMock.mockResolvedValueOnce(response({ success: true, hostname: 'glaucialemos.dev', action: 'testimonial' })).mockResolvedValueOnce(response({ message: 'invalid' }, 422));
    const result = await submitTestimonial(null, form());
    expect(result.status).toBe('error');
    if (result.status === 'error') expect(result.values?.quote).toContain('O workshop');
    expect(JSON.stringify(result)).not.toContain('private-');
  });
});


describe('limite de envios de testimonial', () => {
  it('limita antes do Turnstile e não faz fetch ao exceder a cota', async () => {
    fetchMock.mockImplementation((url: string) => Promise.resolve(response(url.includes('resend')
      ? { id: 'mail-id' } : { success: true, hostname: 'glaucialemos.dev', action: 'testimonial' })));
    for (let i = 0; i < 3; i++) expect((await submitTestimonial(null, form())).status).toBe('ok');
    fetchMock.mockClear();
    expect(await submitTestimonial(null, form())).toEqual({ status: 'rate-limited' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('campos inválidos, honeypot e configuração desativada não consomem a cota', async () => {
    for (let i = 0; i < 4; i++) {
      const invalid = form(); invalid.delete('consent');
      expect((await submitTestimonial(null, invalid)).status).toBe('invalid');
      const bot = form(); bot.set('website', 'bot');
      expect((await submitTestimonial(null, bot)).status).toBe('ok');
      vi.stubEnv('RESEND_API_KEY', '');
      expect((await submitTestimonial(null, form())).status).toBe('unavailable');
      vi.stubEnv('RESEND_API_KEY', 'private-resend');
    }
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockResolvedValue(response({ success: false }));
    for (let i = 0; i < 3; i++) expect((await submitTestimonial(null, form())).status).toBe('captcha');
    expect((await submitTestimonial(null, form())).status).toBe('rate-limited');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it.each([
    { success: true, hostname: 'evil.example', action: 'testimonial' },
    { success: true, hostname: 'glaucialemos.dev', action: 'other-form' },
    { success: true, hostname: 'glaucialemos.dev' },
  ])('rejeita verificação sem vínculo com o formulário (%#)', async verification => {
    fetchMock.mockResolvedValue(response(verification));
    expect((await submitTestimonial(null, form())).status).toBe('captcha');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

it('sanitiza nome e cargo sem permitir injeção no assunto e nos rótulos', async () => {
  fetchMock.mockResolvedValueOnce(response({ success: true, hostname: 'glaucialemos.dev', action: 'testimonial' }))
    .mockResolvedValueOnce(response({ id: 'mail-id' }));
  const data = form({ name: 'Ana\r\nBcc: evil@example.com\u2028', role: 'Dev\r\nOutra linha' });
  data.set('email', 'attacker@example.com');
  expect(await submitTestimonial(null, data)).toEqual({ status: 'ok' });
  const body = JSON.parse(fetchMock.mock.calls[1][1].body);
  expect(body.subject).toBe('[Site] Depoimento para aprovar — AnaBcc: evil@example.com');
  expect(body.text).toContain('Nome: AnaBcc: evil@example.com\nCargo e empresa: DevOutra linha\n');
  expect(body).not.toHaveProperty('reply_to');
});
