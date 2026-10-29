import 'server-only';

export async function verifyTurnstile(token: FormDataEntryValue | null, secretKey: string | undefined): Promise<boolean> {
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ secret: secretKey, response: token }),
    });
    return response.ok && (await response.json())?.success === true;
  } catch {
    return false;
  }
}
