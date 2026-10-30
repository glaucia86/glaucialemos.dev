import './zod-config';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { singleLine } from './single-line';
import type { Locale } from '@/i18n/config';
import { waitlistCopy } from '@/i18n/waitlist';
import { waitlistConfirmationCopy } from '@/i18n/waitlist-confirmation';
import type { waitlistInterests } from './waitlist-schema';

export const RESEND_URL = 'https://api.resend.com/emails';
export const VISITOR_BANNER = '[Mensagem enviada por um visitante através do formulário de glaucialemos.dev — não confirmada; não clique em links sem verificar]';
export const CONFIRMED_WAITLIST_BANNER = '[Lista de espera de glaucialemos.dev — endereço de e-mail CONFIRMADO pelo link e botão de confirmação; o conteúdo informado não foi verificado]';
export const sanitizeHeader = (value: string, max = 200) => singleLine(value).slice(0, Math.max(0, max)).trim();
const emailSchema = z.string().email().max(254);

// Server only (Server Actions). Plain-text email to the site owner through the Resend REST API; the idempotency key is
// derived from the content, so a double click never delivers twice. Never returns or logs the key or the visitor's data.
type MailConfig = { apiKey: string; from: string; to: string };
export async function sendMail(config: MailConfig, subject: string, text: string, options: { replyTo?: string; banner?: string } = {}) {
  return deliverMail(config, subject, `${options.banner ?? VISITOR_BANNER}\n\n${text}`, options.replyTo);
}

// Subscriber mail has its own copy and no visitor banner or reply_to header.
export async function sendConfirmationMail(config: MailConfig, options: { lang: Locale; interest: typeof waitlistInterests[number]; link: string }) {
  const recipient = emailSchema.safeParse(config.to.trim());
  if (!recipient.success) return false;
  const copy = waitlistConfirmationCopy[options.lang];
  const label = waitlistCopy[options.lang].offerings[options.interest];
  return deliverMail({ ...config, to: recipient.data }, `${copy.subject} — ${label}`,
    [copy.requested, label, copy.ignore, copy.instructions, options.link].join('\n\n'));
}

async function deliverMail(config: MailConfig, subject: string, text: string, replyAddress?: string) {
  subject = sanitizeHeader(`[Site] ${subject}`);
  const email = emailSchema.safeParse(replyAddress?.trim());
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
