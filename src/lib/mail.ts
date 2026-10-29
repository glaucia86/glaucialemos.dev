import { createHash } from 'node:crypto';

export const RESEND_URL = 'https://api.resend.com/emails';

// Server only (Server Actions). Plain-text email to the site owner through the Resend REST API; the idempotency key is
// derived from the content, so a double click never delivers twice. Never returns or logs the key or the visitor's data.
export async function sendMail(config: { apiKey: string; from: string; to: string }, subject: string, text: string) {
  try {
    const response = await fetch(RESEND_URL, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json',
        'Idempotency-Key': createHash('sha256').update(`${subject}\n${text}`).digest('hex'),
      },
      body: JSON.stringify({ from: config.from, to: [config.to], subject, text }),
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
