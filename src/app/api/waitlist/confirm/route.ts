import { preferredLocale, type Locale } from '@/i18n/config';
import { waitlistCopy } from '@/i18n/waitlist';
import { waitlistConfirmationCopy } from '@/i18n/waitlist-confirmation';
import { contactConfig } from '@/lib/contact-config';
import { CONFIRMED_WAITLIST_BANNER, mailLines, sendMail } from '@/lib/mail';
import { clientIp, consumeGlobalRateLimit, consumeRateLimit } from '@/lib/rate-limit';
import { MAX_WAITLIST_TOKEN_LENGTH, verifyWaitlistToken } from '@/lib/waitlist-confirmation';

export const runtime = 'nodejs';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
function page(lang: Locale, message: string, status = 200, confirmation?: { token: string; name: string; email: string; label: string }) {
  const copy = waitlistConfirmationCopy[lang];
  const form = confirmation ? `<p>${escapeHtml(confirmation.name)} — ${escapeHtml(confirmation.email)}</p><p>${escapeHtml(confirmation.label)}</p>
    <form method="post" action="/api/waitlist/confirm"><input type="hidden" name="t" value="${escapeHtml(confirmation.token)}"><button type="submit">${escapeHtml(copy.button)}</button></form>` : '';
  return new Response(`<!doctype html><html lang="${escapeHtml(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><meta name="referrer" content="no-referrer"><title>${escapeHtml(copy.title)}</title>
    <style>body{font:1.1rem/1.6 system-ui,sans-serif;max-width:38rem;margin:4rem auto;padding:0 1rem;color:#17233b;background:#f6f8fc;overflow-wrap:anywhere}button{font:inherit;padding:.7rem 1.2rem;cursor:pointer}a{color:#153e91}a:focus-visible,button:focus-visible{outline:3px solid #153e91;outline-offset:4px}</style></head>
    <body><main><h1>${escapeHtml(copy.title)}</h1><p role="status">${escapeHtml(message)}</p>${form}<p><a href="/${escapeHtml(lang)}/servicos#lista-de-espera">${escapeHtml(copy.back)}</a></p></main></body></html>`, {
    status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('t');
  const payload = verifyWaitlistToken(token, contactConfig().waitlistSecret ?? '');
  const lang = payload?.lang ?? preferredLocale(request.headers.get('accept-language'));
  if (!payload) return page(lang, waitlistConfirmationCopy[lang].invalid, 400);
  return page(lang, waitlistConfirmationCopy[lang].prompt, 200, {
    token: token!, name: payload.name, email: payload.email, label: waitlistCopy[lang].offerings[payload.interest],
  });
}

// Native HTML forms use URL encoding. Bound the stream, including chunked requests,
// before parsing so a forged Content-Length cannot bypass the token/body limit.
async function postedToken(request: Request): Promise<string | null> {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/x-www-form-urlencoded') return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > MAX_WAITLIST_TOKEN_LENGTH + 256) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const fields = new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
    return fields.getAll('t').length === 1 ? fields.get('t') : null;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const config = contactConfig();
  const payload = verifyWaitlistToken(await postedToken(request), config.waitlistSecret ?? '');
  const lang = payload?.lang ?? preferredLocale(request.headers.get('accept-language'));
  const copy = waitlistConfirmationCopy[lang];
  if (!payload) return page(lang, copy.invalid, 400);
  if (!config.enabled) return page(lang, copy.unavailable, 503);
  if (!consumeRateLimit(await clientIp(), 'waitlist-confirm') || !consumeGlobalRateLimit()) return page(lang, copy.unavailable, 429);
  const { name, email, interest } = payload;
  const label = waitlistCopy[lang].offerings[interest];
  const sent = await sendMail({ apiKey: config.apiKey!, from: config.from!, to: config.to! },
    `Lista de espera (confirmada) — ${label}`,
    mailLines([
      ['Nome', name], ['E-mail', email], ['Interesse', `${label} (${interest})`], ['Idioma', lang],
      ['Consentimento LGPD', 'sim'], ['Finalidade', 'avisar somente quando a modalidade escolhida estiver disponível'],
    ]), { replyTo: email, banner: CONFIRMED_WAITLIST_BANNER });
  return page(lang, sent ? copy.success : copy.unavailable, sent ? 200 : 502);
}
