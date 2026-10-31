import { afterEach, describe, expect, it, vi } from 'vitest';
import nextConfig from '../next.config';
import { buildCsp } from '@/lib/csp';

const directives = (policy: string) => Object.fromEntries(policy.split('; ').map(part => {
  const [name, ...sources] = part.split(' ');
  return [name, sources];
}));

afterEach(() => vi.unstubAllEnvs());

describe('enforcing CSP', () => {
  it('restricts production sources without eval or wildcards', () => {
    const policy = buildCsp('production');
    const csp = directives(policy);
    expect(csp['default-src']).toEqual(["'self'"]);
    expect(csp['base-uri']).toEqual(["'self'"]);
    expect(csp['form-action']).toEqual(["'self'"]);
    expect(csp['frame-ancestors']).toEqual(["'none'"]);
    expect(csp['object-src']).toEqual(["'none'"]);
    expect(policy).not.toContain('*');
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).not.toContain('ws:');
    expect(csp).toHaveProperty('upgrade-insecure-requests');
    expect(csp['script-src']).toEqual(["'self'", "'unsafe-inline'", 'https://challenges.cloudflare.com']);
    expect(csp['frame-src']).toEqual(['https://challenges.cloudflare.com', 'https://www.youtube-nocookie.com']);
    expect(csp['connect-src']).toEqual(["'self'", 'https://challenges.cloudflare.com']);
    expect(csp['img-src']).toEqual(["'self'", 'data:', 'https://i.ytimg.com']);
    expect(csp['media-src']).toEqual(["'self'"]);
    expect(csp['worker-src']).toEqual(["'self'"]);
    expect(csp['style-src']).toEqual(["'self'", "'unsafe-inline'"]);
    expect(csp['font-src']).toEqual(["'self'", 'data:']);
  });

  it('allows eval and localhost HMR only in development', () => {
    const csp = directives(buildCsp('development'));
    expect(csp['script-src']).toContain("'unsafe-eval'");
    expect(csp['connect-src']).toContain('ws://localhost:*');
    expect(csp).not.toHaveProperty('upgrade-insecure-requests');
    // The only wildcard exception is the local development port, never a host.
    expect(Object.values(csp).flat().filter(source => source.includes('*'))).toEqual(['ws://localhost:*']);
    expect(buildCsp('test')).not.toContain("'unsafe-eval'");
    expect(buildCsp('test')).not.toContain('upgrade-insecure-requests');
  });

  it.each(['production', 'development'])('permits Turnstile script, frame and connections in %s', environment => {
    const csp = directives(buildCsp(environment));
    for (const directive of ['script-src', 'frame-src', 'connect-src']) {
      expect(csp[directive]).toContain('https://challenges.cloudflare.com');
    }
  });
});

describe('Next security headers', () => {
  it.each(['production', 'development'])('sets all headers on every path in %s', async environment => {
    vi.stubEnv('NODE_ENV', environment);
    expect(nextConfig.poweredByHeader).toBe(false);
    expect(nextConfig.headers).toBeTypeOf('function');
    const rules = await nextConfig.headers!();
    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe('/:path*');
    const headers = Object.fromEntries(rules[0].headers.map(({ key, value }) => [key, value]));
    expect(headers).toEqual({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
      'X-Frame-Options': 'DENY',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Content-Security-Policy': buildCsp(environment),
    });
    expect(headers).not.toHaveProperty('Content-Security-Policy-Report-Only');
  });
});
