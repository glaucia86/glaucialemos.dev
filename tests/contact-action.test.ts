import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitContact } from '@/app/actions/contact';
import { contactConfig } from '@/lib/contact-config';
import { contactCopy } from '@/i18n/contact';

const fetchMock = vi.fn();
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: 'Ana', company: 'Acme', service: 'consultoria', message: 'Vamos conversar.', linkedin: 'https://linkedin.com/in/ana', consent: 'on', lang: 'pt', website: '', 'cf-turnstile-response': 'test-token' })) data.set(key, value);
  return data;
}
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
beforeEach(() => {
  vi.stubEnv('RESEND_API_KEY', 'private-resend');
  vi.stubEnv('CONTACT_FROM', 'Site <contato@mail.glaucialemos.dev>');
  vi.stubEnv('CONTACT_TO', 'private-inbox@example.com');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubEnv('TURNSTILE_SITE_KEY', 'public-site-key');
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'private-turnstile');
  vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset();
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('Server Action de contato', () => {
  it('honeypot retorna sucesso falso mesmo com campos inválidos e nunca envia', async () => {
    const data = new FormData(); data.set('website', 'bot');
    expect(await submitContact(null, data)).toEqual({ status: 'ok' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['RESEND_API_KEY', 'CONTACT_FROM', 'CONTACT_TO', 'TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'])('desabilita se falta %s', async key => {
    for (const value of [undefined, '', '   ']) {
      vi.stubEnv(key, value);
      expect(contactConfig().enabled).toBe(false);
      expect(await submitContact(null, form())).toEqual({ status: 'unavailable' });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['pt', 'en', 'es'] as const)('valida novamente no servidor em %s', async lang => {
    const data = form(); data.set('lang', lang); data.set('linkedin', 'https://example.com'); data.delete('consent');
    const result = await submitContact(null, data);
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(result.errors.linkedin).toEqual([contactCopy[lang].errors.linkedin]);
      expect(result.errors.consent).toEqual([contactCopy[lang].errors.consent]);
      expect(result.values.company).toBe('Acme');
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['', 'x'.repeat(2049)])('rejeita token vazio ou grande sem fetch', async token => {
    const data = form(); data.set('cf-turnstile-response', token);
    expect((await submitContact(null, data)).status).toBe('captcha'); expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    () => Promise.resolve(response({ success: false })),
    () => Promise.resolve(response({ success: 'true' })),
    () => Promise.resolve(response({ success: true }, 503)),
    () => Promise.resolve(new Response('invalid-json')),
    () => Promise.reject(new Error('network')),
    () => Promise.reject(new DOMException('timeout', 'TimeoutError')),
  ])('falha fechada no Turnstile sem chegar ao Resend (%#)', async failure => {
    fetchMock.mockImplementationOnce(failure);
    expect((await submitContact(null, form())).status).toBe('captcha'); expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('envia pelo Resend só os campos validados, em texto, sem devolver as chaves', async () => {
    fetchMock.mockResolvedValueOnce(response({ success: true })).mockResolvedValueOnce(response({ id: 'email-1' }));
    const data = form(); data.set('access_key', 'attacker'); data.set('subject', 'attacker'); data.set('to', 'attacker@example.com');
    const result = await submitContact(null, data);
    expect(result).toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [verifyUrl, verify] = fetchMock.mock.calls[0];
    expect(verifyUrl).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(JSON.parse(verify.body)).toEqual({ secret: 'private-turnstile', response: 'test-token' });
    const [url, request] = fetchMock.mock.calls[1];
    expect(url).toBe('https://api.resend.com/emails'); expect(request.method).toBe('POST'); expect(request.cache).toBe('no-store');
    expect(request.headers.Authorization).toBe('Bearer private-resend');
    expect(request.headers['Idempotency-Key']).toMatch(/^[0-9a-f]{64}$/);
    const body = JSON.parse(request.body);
    expect(body).toMatchObject({ from: 'Site <contato@mail.glaucialemos.dev>', to: ['private-inbox@example.com'], subject: 'Contato glaucialemos.dev — Consultoria' });
    expect(Object.keys(body).sort()).toEqual(['from', 'subject', 'text', 'to']);
    for (const value of ['Nome: Ana', 'Empresa: Acme', 'LinkedIn: https://linkedin.com/in/ana', 'Interesse: Consultoria (consultoria)', 'Idioma: pt', 'Vamos conversar.']) expect(body.text).toContain(value);
    expect(body.text).not.toContain('attacker');
    expect(JSON.stringify(result)).not.toContain('private-');
  });
  it('o mesmo conteúdo gera a mesma chave de idempotência (clique duplo não duplica)', async () => {
    fetchMock.mockImplementation((url: string) => Promise.resolve(url.includes('resend') ? response({ id: 'email-1' }) : response({ success: true })));
    await submitContact(null, form()); await submitContact(null, form());
    const keys = fetchMock.mock.calls.filter(([url]) => String(url).includes('resend')).map(([, request]) => request.headers['Idempotency-Key']);
    expect(keys).toHaveLength(2); expect(keys[0]).toBe(keys[1]);
  });
  it.each([
    () => Promise.resolve(response({ message: 'The domain is not verified' }, 403)),
    () => Promise.resolve(response({ id: '' })),
    () => Promise.resolve(response({ name: 'rate_limit_exceeded' }, 429)),
    () => Promise.resolve(response({ id: 'x' }, 500)),
    () => Promise.resolve(new Response('invalid-json')),
    () => Promise.reject(new Error('network')),
  ])('trata falha do Resend e preserva os campos (%#)', async failure => {
    fetchMock.mockResolvedValueOnce(response({ success: true })).mockImplementationOnce(failure);
    const result = await submitContact(null, form());
    expect(result.status).toBe('error');
    if (result.status === 'error') expect(result.values?.message).toBe('Vamos conversar.');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(result)).not.toContain('private-');
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toMatch(/private-|Ana|Acme/);
  });
});
