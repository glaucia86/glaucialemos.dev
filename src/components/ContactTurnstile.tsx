'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { contactCopy } from '@/i18n/contact';
import type { ContactState } from '@/lib/contact-schema';

type Turnstile = {
  render: (container: HTMLElement, options: {
    sitekey: string; language: string; size: string; 'response-field': boolean;
    callback: (token: string) => void;
    'expired-callback': () => void; 'error-callback': () => void;
  }) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: Turnstile } }

export function ContactTurnstile({ siteKey, lang, result }: { siteKey: string; lang: Locale; result: ContactState | null }) {
  const copy = contactCopy[lang];
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [token, setToken] = useState('');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const form = container.current?.closest('form');
    if (!form) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!loaded || !container.current || !window.turnstile) return;
    const api = window.turnstile;
    const invalidate = () => { setToken(''); setFailed(true); };
    let id: string;
    try {
      id = api.render(container.current, {
        sitekey: siteKey, language: lang, size: 'compact', 'response-field': false,
        callback: value => { setToken(value); setFailed(false); },
        'expired-callback': invalidate, 'error-callback': invalidate,
      });
    } catch {
      invalidate();
      return;
    }
    widget.current = id;
    return () => { api.remove(id); widget.current = null; };
  }, [loaded, siteKey, lang, attempt]);

  useEffect(() => {
    if (!result) return;
    setToken('');
    if (widget.current !== null) window.turnstile?.reset(widget.current);
  }, [result]);

  function retry() {
    setToken(''); setFailed(false);
    if (widget.current !== null) window.turnstile?.reset(widget.current);
    else setAttempt(value => value + 1);
  }

  return <div className="contact-captcha">
    {visible && <Script key={attempt} id={`contact-turnstile-${attempt}`}
      src={`https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit${attempt ? `&retry=${attempt}` : ''}`}
      onReady={() => { setLoaded(true); setFailed(false); }} onError={() => setFailed(true)} />}
    <div ref={container} />
    <input type="hidden" name="cf-turnstile-response" value={token} />
    {!token && !failed && visible && <p role="status">{copy.captchaLoading}</p>}
    {failed && <><p role="alert">{copy.captcha}</p><button type="button" className="button secondary" onClick={retry}>{copy.retry}</button></>}
    <noscript><p>{copy.noScript}</p></noscript>
  </div>;
}
