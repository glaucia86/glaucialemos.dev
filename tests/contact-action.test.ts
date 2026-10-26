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
  vi.stubEnv('WEB3FORMS_ACCESS_KEY', 'private-web3forms');
  vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'public-site-key');
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'private-turnstile');
  vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset();
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Server Action de contato', () => {
  it('honeypot retorna sucesso falso mesmo com campos inválidos e nunca envia', async () => {
    const data = new FormData(); data.set('website', 'bot');
    expect(await submitContact(null, data)).toEqual({ status: 'ok' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['WEB3FORMS_ACCESS_KEY', 'NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'])('desabilita se falta %s', async key => {
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
  ])('falha fechada no Turnstile sem chegar ao Web3Forms (%#)', async failure => {
    fetchMock.mockImplementationOnce(failure);
    expect((await submitContact(null, form())).status).toBe('captcha'); expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('envia só campos validados e não devolve as chaves', async () => {
    fetchMock.mockResolvedValueOnce(response({ success: true })).mockResolvedValueOnce(response({ success: true }));
    const data = form(); data.set('access_key', 'attacker'); data.set('subject', 'attacker'); data.set('from_name', 'attacker');
    expect(await submitContact(null, data)).toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [verifyUrl, verify] = fetchMock.mock.calls[0];
    expect(verifyUrl).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(JSON.parse(verify.body)).toEqual({ secret: 'private-turnstile', response: 'test-token' });
    const [url, request] = fetchMock.mock.calls[1];
    expect(url).toBe('https://api.web3forms.com/submit'); expect(request.method).toBe('POST'); expect(request.cache).toBe('no-store');
    expect(JSON.parse(request.body)).toEqual({ access_key: 'private-web3forms', subject: 'Contato glaucialemos.dev — Consultoria', from_name: 'glaucialemos.dev', name: 'Ana', company: 'Acme', service: 'Consultoria', service_id: 'consultoria', message: 'Vamos conversar.', linkedin: 'https://linkedin.com/in/ana', consent: true, lang: 'pt' });
  });
  it.each([
    () => Promise.resolve(response({ success: false })),
    () => Promise.resolve(response({ success: 'true' })),
    () => Promise.resolve(response({ success: true }, 500)),
    () => Promise.resolve(new Response('invalid-json')),
    () => Promise.reject(new Error('network')),
  ])('trata falha Web3Forms e preserva os campos (%#)', async failure => {
    fetchMock.mockResolvedValueOnce(response({ success: true })).mockImplementationOnce(failure);
    const result = await submitContact(null, form());
    expect(result.status).toBe('error');
    if (result.status === 'error') expect(result.values?.message).toBe('Vamos conversar.');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(result)).not.toContain('private-');
  });
});
