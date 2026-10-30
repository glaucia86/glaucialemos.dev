import { createHash } from 'node:crypto';
import { z } from 'zod';
import { singleLine } from './single-line';

export const RESEND_URL = 'https://api.resend.com/emails';
export const VISITOR_BANNER = '[Mensagem enviada por um visitante através do formulário de glaucialemos.dev — não confirmada; não clique em links sem verificar]';
export const sanitizeHeader = (value: string, max = 200) => singleLine(value).slice(0, Math.max(0, max)).trim();
const emailSchema = z.string().email().max(254);

// Server only (Server Actions). Plain-text email to the site owner through the Resend REST API; the idempotency key is
// derived from the content, so a double click never delivers twice. Never returns or logs the key or the visitor's data.
export async function sendMail(config: { apiKey: string; from: string; to: string }, subject: string, text: string, options: { replyTo?: string } = {}) {
  subject = sanitizeHeader(`[Site] ${subject}`);
  text = `${VISITOR_BANNER}\n\n${text}`;
  const email = emailSchema.safeParse(options.replyTo?.trim());
  const replyTo = email.success ? sanitizeHeader(email.data, 254) : undefined;
  try {
    const response = await fetch(RESEND_URL, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${sanitizeHeader(config.apiKey)}`, 'Content-Type': 'application/json',
        'Idempotency-Key': createHash('sha256').update(`${subject}\n${text}`).digest('hex'),
      },
      body: JSON.stringify({
        from: sanitizeHeader(config.from, 320), to: [sanitizeHeader(config.to, 254)], subject, text,
        ...(replyTo && emailSchema.safeParse(replyTo).success ? { reply_to: replyTo } : {}),
      }),
    });
    const result = response.ok ? await response.json() : null;
    if (typeof result?.id === 'string' && result.id) return true;
    console.error(`[mail] Resend recusou o envio (HTTP ${response.status})`);
  } catch (error) {
    console.error(`[mail] Falha ao falar com o Resend: ${error instanceof Error ? error.name : 'erro'}`);
  }
  return false;
}

export const mailLines = (rows: [string, string][]) => rows.map(([label, value]) => `${label}: ${value}`).join('\n');
