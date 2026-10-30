// Only imported by the page (Server Component), Server Actions and server tests.
export function contactConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM?.trim();
  const to = process.env.CONTACT_TO?.trim();
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim();
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  return { apiKey, from, to, siteKey, secretKey, enabled: Boolean(apiKey && from && to && siteKey && secretKey) };
}

export function isAllowedTurnstileHostname(hostname: unknown, additionalHosts = ''): boolean {
  if (typeof hostname !== 'string' || !hostname) return false;
  const host = hostname.toLowerCase();
  return ['glaucialemos.dev', 'www.glaucialemos.dev', 'localhost', '127.0.0.1'].includes(host)
    || /^glaucialemos[a-z0-9-]*\.vercel\.app$/.test(host)
    || additionalHosts.split(',').some(value => value.trim().toLowerCase() === host);
}

// Cloudflare Turnstile server check; fails closed on any network or parsing problem.
export async function verifyTurnstile(secret: string, token: FormDataEntryValue | null, options: { remoteIp?: string; expectedAction?: string } = {}) {
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) return false;
  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ secret, response: token, ...(options.remoteIp ? { remoteip: options.remoteIp } : {}) }),
    });
    if (!verification.ok) return false;
    const result = await verification.json();
    // Our widgets configure an action, so a missing action must also fail closed.
    return result?.success === true
      && isAllowedTurnstileHostname(result.hostname, process.env.TURNSTILE_ALLOWED_HOSTNAMES)
      && (options.expectedAction === undefined || result.action === options.expectedAction);
  } catch {
    return false;
  }
}
