import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isAllowedTurnstileHostname, verifyTurnstile } from '@/lib/contact-config';

const fetchMock = vi.fn();
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
beforeEach(() => { vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); vi.stubEnv('TURNSTILE_ALLOWED_HOSTNAMES', ''); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('hostnames do Turnstile', () => {
  it.each(['glaucialemos.dev', 'www.glaucialemos.dev', 'localhost', '127.0.0.1', 'glaucialemos.vercel.app', 'glaucialemos-preview-123.vercel.app'])('aceita %s', hostname => {
    expect(isAllowedTurnstileHostname(hostname)).toBe(true);
  });
  it.each(['glaucialemos.dev.evil.com', 'evilglaucialemos.dev', 'evilglaucialemos.vercel.app', 'glaucialemos-preview.vercel.app.evil.com', 'https://glaucialemos.dev', '', undefined, null, 12])('rejeita hostname falso ou inválido (%s)', hostname => {
    expect(isAllowedTurnstileHostname(hostname)).toBe(false);
  });
  it('permite hosts adicionais exatos sem aceitar sufixos', () => {
    expect(isAllowedTurnstileHostname('preview.example.com', ' local.example.com, PREVIEW.example.com ')).toBe(true);
    expect(isAllowedTurnstileHostname('preview.example.com.evil.com', 'preview.example.com')).toBe(false);
  });
});

describe('verificação do Turnstile', () => {
  it.each(['glaucialemos.dev', 'localhost', '127.0.0.1', 'glaucialemos-branch-123.vercel.app'])('valida hostname e ação (%s)', async hostname => {
    fetchMock.mockResolvedValue(response({ success: true, hostname, action: 'contact' }));
    expect(await verifyTurnstile('secret', 'token', { expectedAction: 'contact' })).toBe(true);
  });
  it('envia remoteip e consulta hosts adicionais do ambiente', async () => {
    vi.stubEnv('TURNSTILE_ALLOWED_HOSTNAMES', 'preview.example.com');
    fetchMock.mockResolvedValue(response({ success: true, hostname: 'preview.example.com', action: 'waitlist' }));
    expect(await verifyTurnstile('secret', 'token', { remoteIp: '2001:db8::1', expectedAction: 'waitlist' })).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ secret: 'secret', response: 'token', remoteip: '2001:db8::1' });
  });
  it('omite remoteip quando não há IP e permite widget sem ação configurada', async () => {
    fetchMock.mockResolvedValue(response({ success: true, hostname: 'glaucialemos.dev' }));
    expect(await verifyTurnstile('secret', 'token')).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty('remoteip');
  });
  it.each([
    { success: true, hostname: 'evil.example', action: 'contact' },
    { success: true, hostname: 'glaucialemos.dev', action: 'waitlist' },
    { success: true, hostname: 'glaucialemos.dev' },
    { success: true, hostname: 'glaucialemos.dev', action: null },
    { success: true, action: 'contact' },
    { success: 'true', hostname: 'glaucialemos.dev', action: 'contact' },
    null,
  ])('falha fechada para resposta inválida (%#)', async body => {
    fetchMock.mockResolvedValue(response(body));
    expect(await verifyTurnstile('secret', 'token', { expectedAction: 'contact' })).toBe(false);
  });
  it.each([null, '', ' ', 'x'.repeat(2049), new File(['token'], 'token')])('rejeita token inválido sem fetch (%#)', async token => {
    expect(await verifyTurnstile('secret', token)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
