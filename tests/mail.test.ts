import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESEND_URL, sanitizeHeader, sendMail, VISITOR_BANNER } from '@/lib/mail';

const config = { apiKey: 'secret', from: 'Site <sender@example.com>', to: 'owner@example.com' };
const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ id: 'mail-id' }))));
});
afterEach(() => { vi.unstubAllGlobals(); });

describe('sanitização de cabeçalhos', () => {
  it('remove C0, DEL e separadores Unicode', () => {
    const controls = Array.from({ length: 32 }, (_, index) => String.fromCharCode(index)).join('');
    expect(sanitizeHeader(`Ana${controls}\u007f\u2028\u2029 Silva`)).toBe('Ana Silva');
    expect(sanitizeHeader(' Ana\r\nBcc: x@example.com ')).toBe('AnaBcc: x@example.com');
  });
  it('reduz espaços, apara e limita o tamanho', () => {
    expect(sanitizeHeader('  Ana   Maria\u00a0 Silva  ')).toBe('Ana Maria Silva');
    expect(sanitizeHeader('x'.repeat(201))).toHaveLength(200);
    expect(sanitizeHeader('abcdef', 3)).toBe('abc');
    expect(sanitizeHeader('abc', 0)).toBe('');
  });
});

describe('mensagens de visitantes via Resend', () => {
  it('protege todos os cabeçalhos e deriva idempotência do assunto e corpo finais', async () => {
    expect(await sendMail({ apiKey: 'sec\r\nret', from: 'Site\r\n <sender@example.com>', to: 'owner@\u2028example.com' }, 'Ana\r\nBcc: other@example.com' + 'x'.repeat(210), 'Olá\nMundo')).toBe(true);
    const [url, request] = fetchMock.mock.calls[0];
    const body = JSON.parse(request.body);
    expect(url).toBe(RESEND_URL);
    expect(body).toEqual({ from: config.from, to: [config.to], subject: sanitizeHeader('[Site] AnaBcc: other@example.com' + 'x'.repeat(210)), text: `${VISITOR_BANNER}\n\nOlá\nMundo` });
    expect(body.subject).toHaveLength(200);
    expect(request.headers.Authorization).toBe('Bearer secret');
    expect(request.headers['Idempotency-Key']).toBe(createHash('sha256').update(`${body.subject}\n${body.text}`).digest('hex'));
    expect(body).not.toHaveProperty('html');
  });
  it('sanitizações equivalentes geram a mesma chave', async () => {
    await sendMail(config, 'Ana\r\n Silva', 'Mensagem');
    await sendMail(config, 'Ana Silva', 'Mensagem');
    expect(fetchMock.mock.calls[0][1].headers['Idempotency-Key']).toBe(fetchMock.mock.calls[1][1].headers['Idempotency-Key']);
  });
  it('inclui reply_to somente para e-mail válido', async () => {
    await sendMail(config, 'Lista de espera', 'Mensagem', { replyTo: '  ana+site@example.com  ' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).reply_to).toBe('ana+site@example.com');
  });
  it.each([undefined, '', 'invalid', 'Ana <ana@example.com>', 'ana@example.com\r\nBcc: evil@example.com', 'ana\u2028@example.com', 'ana\n@example.com', `${'x'.repeat(255)}@example.com`])('omite reply_to inválido (%#)', async replyTo => {
    await sendMail(config, 'Assunto', 'Mensagem', { replyTo });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty('reply_to');
  });
});
