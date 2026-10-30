// Only imported by the page (Server Component), Server Actions and server tests.
export function contactConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM?.trim();
  const to = process.env.CONTACT_TO?.trim();
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim();
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  return { apiKey, from, to, siteKey, secretKey, enabled: Boolean(apiKey && from && to && siteKey && secretKey) };
}

// Cloudflare Turnstile server check; fails closed on any network or parsing problem.
export async function verifyTurnstile(secret: string, token: FormDataEntryValue | null) {
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) return false;
  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ secret, response: token }),
    });
    if (!verification.ok) return false;
    return (await verification.json())?.success === true;
  } catch {
    return false;
  }
}
