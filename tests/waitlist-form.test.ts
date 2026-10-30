import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WaitlistForm } from '@/components/WaitlistForm';
import { waitlistCopy } from '@/i18n/waitlist';
import { contactCopy } from '@/i18n/contact';
import { waitlistInterests, type WaitlistState } from '@/lib/waitlist-schema';

const actionState = vi.hoisted(() => ({ state: null as WaitlistState | null, pending: false }));
vi.mock('react', async importOriginal => ({
  ...await importOriginal<typeof import('react')>(),
  useActionState: () => [actionState.state, '/test-action', actionState.pending],
}));
afterEach(() => { actionState.state = null; actionState.pending = false; });
const render = (lang: 'pt' | 'en' | 'es' = 'pt', enabled = true, interest: string | null = null, siteKey = 'public-key') =>
  renderToStaticMarkup(createElement(WaitlistForm, { lang, enabled, siteKey, interest }));

describe.each(['pt', 'en', 'es'] as const)('waitlist markup (%s)', lang => {
  it('has exactly three offerings, bounded fields, consent, honeypot and no-JS fallback', () => {
    const html = render(lang);
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    for (const interest of waitlistInterests) {
      expect(html).toContain(`value="${interest}"`);
      expect(html).toContain(waitlistCopy[lang].offerings[interest]);
    }
    expect(html).toMatch(/id="waitlist-name"[^>]*maxLength="120"/);
    expect(html).toMatch(/id="waitlist-email"[^>]*type="email"[^>]*maxLength="254"/);
    expect(html).toMatch(/id="waitlist-consent"[^>]*required=""[^>]*aria-describedby="waitlist-purpose"/);
    expect(html).toMatch(/<input(?=[^>]*name="website")(?=[^>]*tabindex="-1")[^>]*>/);
    expect(html).toContain(waitlistCopy[lang].purpose);
    expect(html).toContain(waitlistCopy[lang].consent);
    expect(html).toContain('<noscript>'); expect(html).toContain(contactCopy[lang].noScript);
    expect(html).toContain('href="https://www.linkedin.com/in/glaucialemos" target="_blank" rel="noopener"');
    expect(html).not.toContain('challenges.cloudflare.com');
    expect(html).not.toMatch(/id="contact-/);
  });
  it('disables unavailable submission and keeps LinkedIn', () => {
    for (const html of [render(lang, false), render(lang, true, null, '')]) {
      expect(html).toContain('data-waitlist-enabled="false"');
      expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled/);
      expect(html).toContain(waitlistCopy[lang].unavailable);
      expect(html).toContain(contactCopy[lang].linkedin);
      expect(html).not.toContain('name="cf-turnstile-response"');
    }
  });
  it('shows returned errors and keeps entered values with accessible error spans', () => {
    actionState.state = { status: 'invalid', errors: { email: [waitlistCopy[lang].errors.email], consent: [waitlistCopy[lang].errors.consent] }, values: { name: 'Ana', email: 'invalid', interest: 'curso-gravado', consent: false } };
    const html = render(lang);
    expect(html).toContain('value="Ana"');
    expect(html).toMatch(/id="waitlist-email"[^>]*aria-invalid="true"[^>]*aria-describedby="waitlist-email-error"/);
    expect(html).toContain(`id="waitlist-email-error">${waitlistCopy[lang].errors.email}`);
    expect(html).toContain('aria-describedby="waitlist-purpose waitlist-consent-error"');
    expect(html).toContain(`role="alert">${contactCopy[lang].invalid}`);
  });
  it('announces a successful registration with decorative blooms', () => {
    actionState.state = { status: 'ok' };
    const html = render(lang);
    expect(html).toContain('class="waitlist-success" role="status"');
    expect(html).toContain(waitlistCopy[lang].success);
    expect(html).toContain('class="contact-seeds" aria-hidden="true"');
    expect(html.match(/data-state="bloom"/g)).toHaveLength(3);
  });
  it.each(['captcha', 'error', 'unavailable'] as const)('renders %s feedback', status => {
    actionState.state = { status };
    expect(render(lang)).toContain(status === 'captcha' ? contactCopy[lang].captcha : waitlistCopy[lang][status]);
  });
});
it.each(waitlistInterests)('preselects an explicit valid interest: %s', interest => {
  expect(render('pt', true, interest)).toMatch(new RegExp(`<input(?=[^>]*type="radio")(?=[^>]*checked="")[^>]*value="${interest}"`));
});
it.each([null, '', 'unknown'])('does not select unknown input (%s)', interest => {
  expect(render('pt', true, interest)).not.toContain('checked=""');
});
it('disables controls and announces pending delivery', () => {
  actionState.pending = true;
  const html = render();
  expect(html).toContain('aria-busy="true"');
  expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled/);
  expect(html).toContain(waitlistCopy.pt.sending);
});
