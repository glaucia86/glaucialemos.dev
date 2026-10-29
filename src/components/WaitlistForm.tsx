'use client';

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import { submitWaitlist } from '@/app/actions/waitlist';
import type { Locale } from '@/i18n/config';
import { contactCopy } from '@/i18n/contact';
import { waitlistCopy } from '@/i18n/waitlist';
import { waitlistFields, waitlistInterest, waitlistInterests, waitlistSchema, waitlistValues, type WaitlistErrors, type WaitlistField, type WaitlistState, type WaitlistValues } from '@/lib/waitlist-schema';
import { ContactTurnstile } from './ContactTurnstile';

type Props = { lang: Locale; enabled?: boolean; siteKey?: string; interest?: string | null };

export function WaitlistForm({ lang, enabled = false, siteKey = '', interest = null }: Props) {
  return <WaitlistFields key={interest} lang={lang} enabled={enabled && Boolean(siteKey)} siteKey={siteKey} interest={interest} />;
}

function WaitlistFields({ lang, enabled, siteKey = '', interest }: Props) {
  const copy = waitlistCopy[lang], contact = contactCopy[lang];
  const [state, action, pending] = useActionState<WaitlistState | null, FormData>(submitWaitlist, null);
  const [values, setValues] = useState<WaitlistValues>(() => state && 'values' in state && state.values ? state.values : {
    name: '', email: '', interest: waitlistInterest(interest ?? null), consent: false,
  });
  const [clientErrors, setClientErrors] = useState<WaitlistErrors | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const errors = clientErrors ?? (state?.status === 'invalid' ? state.errors : {});
  const unavailable = !enabled || state?.status === 'unavailable';

  function focusError(fields: WaitlistErrors) {
    const first = waitlistFields.find(field => fields[field]?.length);
    if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }
  useEffect(() => {
    if (!state) return;
    setClientErrors(null); setCaptchaError(false);
    if (state.status === 'ok') setValues({ name: '', email: '', interest: '', consent: false });
    else if (state.values) setValues(state.values);
    if (state.status === 'invalid') focusError(state.errors);
  }, [state]);

  function validate(event: FormEvent<HTMLFormElement>) {
    if (unavailable || pending) { event.preventDefault(); return; }
    const data = new FormData(event.currentTarget);
    const parsed = waitlistSchema(lang).safeParse(waitlistValues(data));
    setCaptchaError(false);
    if (!parsed.success) {
      event.preventDefault();
      const fields = parsed.error.flatten().fieldErrors;
      setClientErrors(fields); focusError(fields); return;
    }
    setClientErrors({});
    if (!data.get('cf-turnstile-response')) { event.preventDefault(); setCaptchaError(true); }
  }
  const attributes = (field: WaitlistField) => ({
    id: `waitlist-${field}`, name: field, required: true, disabled: unavailable || pending,
    'aria-invalid': errors[field]?.length ? true as const : undefined,
    'aria-describedby': [field === 'consent' ? 'waitlist-purpose' : '', errors[field]?.length ? `waitlist-${field}-error` : ''].filter(Boolean).join(' ') || undefined,
  });
  const error = (field: WaitlistField) => errors[field]?.length ? <span className="contact-error" id={`waitlist-${field}-error`}>{errors[field]![0]}</span> : null;
  const update = (field: Exclude<WaitlistField, 'consent'>, value: string) => setValues(previous => ({ ...previous, [field]: value }));

  return <div className="contact-panel waitlist-panel" data-waitlist-enabled={!unavailable} data-waitlist-status={pending ? 'pending' : state?.status ?? 'idle'}>
    {unavailable && <p className="form-notice" role="status">{copy.unavailable}</p>}
    <form ref={form} action={action} onSubmit={validate} noValidate aria-busy={pending} aria-labelledby="waitlist-title">
      <input type="hidden" name="lang" value={lang} />
      <div hidden aria-hidden="true"><label htmlFor="waitlist-website">{copy.website}</label><input id="waitlist-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <fieldset className="contact-step">
        <legend>{copy.details}</legend>
        <label htmlFor="waitlist-name">{copy.name}<input {...attributes('name')} autoComplete="name" maxLength={120} value={values.name} onChange={e => update('name', e.target.value)} />{error('name')}</label>
        <label htmlFor="waitlist-email">{copy.email}<input {...attributes('email')} type="email" autoComplete="email" maxLength={254} value={values.email} onChange={e => update('email', e.target.value)} />{error('email')}</label>
      </fieldset>
      <fieldset className="contact-step">
        <legend>{copy.interest}</legend>
        <div className="contact-needs">{waitlistInterests.map(value => <label key={value} className="contact-need" htmlFor={`waitlist-interest-${value}`}>
          <input {...attributes('interest')} id={`waitlist-interest-${value}`} type="radio" value={value} checked={values.interest === value} onChange={() => update('interest', value)} />
          <i className="contact-need__seed" aria-hidden="true" /><span>{copy.offerings[value]}</span>
        </label>)}</div>
        {error('interest')}
      </fieldset>
      <p id="waitlist-purpose">{copy.purpose}</p>
      <label htmlFor="waitlist-consent" className="contact-consent"><input {...attributes('consent')} type="checkbox" checked={values.consent} onChange={e => setValues(previous => ({ ...previous, consent: e.target.checked }))} /><span>{copy.consent}</span></label>
      {error('consent')}
      {!unavailable && <ContactTurnstile siteKey={siteKey} lang={lang} result={state} />}
      <button className="button primary" type="submit" disabled={unavailable || pending}>{pending ? copy.sending : copy.submit}</button>
      {Object.keys(errors).length > 0 && <p role="alert">{contact.invalid}</p>}
      {(captchaError || state?.status === 'captcha') && <p role="alert">{contact.captcha}</p>}
      {state?.status === 'ok' && <div className="waitlist-success" role="status">
        <ol className="contact-seeds" aria-hidden="true"><li data-state="bloom"><i /></li><li data-state="bloom"><i /></li><li data-state="bloom"><i /></li></ol>
        <p>{copy.success}</p>
      </div>}
      {state?.status === 'error' && <p role="alert">{copy.error}</p>}
    </form>
    <a className="button secondary" href="https://www.linkedin.com/in/glaucialemos" target="_blank" rel="noopener">{contact.linkedin}</a>
  </div>;
}
