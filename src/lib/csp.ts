// Pure builder: next.config.ts supplies NODE_ENV; tests need no process mutation.
export function buildCsp(environment: string): string {
  const development = environment === 'development';
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // SSG boot.ts scripts and Next hydration are inline. Per-request nonces would
    // require dynamic rendering; unsafe-inline preserves SSG. Only next dev needs eval.
    // ContactTurnstile loads its script from this exact Cloudflare origin.
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ''} https://challenges.cloudflare.com`,
    // Turnstile challenges and the click-to-play RetroTV/TalkVideo embeds.
    'frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com',
    // RetroTV thumbnails; CSS noise/cursors use data SVGs. All other art is local,
    // including copies of photos whose source metadata names raw.githubusercontent.com.
    "img-src 'self' data: https://i.ytimg.com",
    // music.ts and episode/ambience videos use local files; sfx.ts fetches local
    // samples for Web Audio. No media blob/data URLs or browser capture APIs.
    "media-src 'self'",
    // React style attributes and GSAP set styles at runtime.
    "style-src 'self' 'unsafe-inline'",
    // next/font/local serves bundled fonts; allow embedded font data too.
    "font-src 'self' data:",
    // Turnstile verification traffic; GitHub, Luma, YouTube RSS and mail APIs are
    // server-side only. Local WebSocket ports are exclusively for next dev HMR.
    `connect-src 'self' https://challenges.cloudflare.com${development ? ' ws://localhost:*' : ''}`,
    // No Worker/blob creation in src/ or public/; keep workers same-origin only.
    "worker-src 'self'",
  ];
  if (environment === 'production') directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}
