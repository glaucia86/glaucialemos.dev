// Only imported by the page (Server Component), Server Action and server tests.
export function contactConfig() {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim();
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  return { accessKey, siteKey, secretKey, enabled: Boolean(accessKey && siteKey && secretKey) };
}
