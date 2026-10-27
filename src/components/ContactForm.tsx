'use client';

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Dictionary } from '@/i18n/dictionaries/pt';
import type { Locale } from '@/i18n/config';
import { contactCopy } from '@/i18n/contact';
import { submitContact } from '@/app/actions/contact';
import { contactFields, contactOptions, contactSchema, contactServiceId, contactValues, type ContactErrors, type ContactField, type ContactState, type ContactValues } from '@/lib/contact-schema';
import { ContactTurnstile } from './ContactTurnstile';

export function ContactForm({ copy, lang, enabled = false, siteKey = '', subject = null }: {
  copy: Dictionary['services']; lang: Locale; enabled?: boolean; siteKey?: string; subject?: string | null;
}) {
  // Remount only on an explicit change of subject; eggs never write into this form.
  return <ContactFields key={subject} copy={copy} lang={lang} enabled={enabled && Boolean(siteKey)} siteKey={siteKey} subject={subject} />;
}

function ContactFields({ copy, lang, enabled, siteKey, subject }: {
  copy: Dictionary['services']; lang: Locale; enabled: boolean; siteKey: string; subject: string | null;
}) {
  const c = contactCopy[lang];
  const [state, action, pending] = useActionState<ContactState | null, FormData>(submitContact, null);
  const initialMessage = subject === 'palestra' ? copy.talkMessage
    : subject === 'workshop' ? copy.workshopMessage : subject === 'mentoria' ? copy.mentoringMessage
      : subject === 'consultoria' ? c.consultancyMessage : '';
  const [values, setValues] = useState<ContactValues>(() => state && 'values' in state && state.values ? state.values : {
    name: '', company: '', service: contactServiceId(subject), message: initialMessage, linkedin: '', consent: false,
  });
  const [clientErrors, setClientErrors] = useState<ContactErrors | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const errors = clientErrors ?? (state?.status === 'invalid' ? state.errors : {});
  const unavailable = !enabled || state?.status === 'unavailable';

  useEffect(() => {
    if (!state) return;
    setClientErrors(null); setCaptchaError(false);
    if (state.status === 'ok') setValues({ name: '', company: '', service: '', message: '', linkedin: '', consent: false });
    else if (state.values) setValues(state.values);
    if (state.status === 'invalid') {
      const first = contactFields.find(field => state.errors[field]?.length);
      if (first) (form.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
    }
  }, [state]);

  function validate(event: FormEvent<HTMLFormElement>) {
    if (unavailable || pending) { event.preventDefault(); return; }
    const data = new FormData(event.currentTarget);
    const parsed = contactSchema(lang).safeParse(contactValues(data));
    setCaptchaError(false);
    if (!parsed.success) {
      event.preventDefault();
      const fields = parsed.error.flatten().fieldErrors;
      setClientErrors(fields);
      const first = contactFields.find(field => fields[field]?.length);
      if (first) (event.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setClientErrors({});
    if (!data.get('cf-turnstile-response')) { event.preventDefault(); setCaptchaError(true); }
  }
  const attributes = (field: ContactField) => ({
    id: `contact-${field}`, name: field, required: true, disabled: unavailable || pending,
    'aria-invalid': errors[field]?.length ? true as const : undefined,
    'aria-describedby': [field === 'consent' ? 'contact-purpose' : '', errors[field]?.length ? `contact-${field}-error` : ''].filter(Boolean).join(' ') || undefined,
  });
  const error = (field: ContactField) => errors[field]?.length ? <span className="contact-error" id={`contact-${field}-error`}>{errors[field]![0]}</span> : null;
  const update = (field: Exclude<ContactField, 'consent'>, value: string) => setValues(previous => ({ ...previous, [field]: value }));

  return <div id="contato" className="contact-panel" data-contact-enabled={!unavailable} data-contact-status={pending ? 'pending' : state?.status ?? 'idle'}>
    <h2>{copy.formTitle}</h2>
    {unavailable && <p className="form-notice" role="status">{copy.missing}</p>}
    <form ref={form} action={action} onSubmit={validate} noValidate aria-busy={pending}>
      <input type="hidden" name="lang" value={lang} />
      <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <label htmlFor="contact-name">{copy.name}<input {...attributes('name')} autoComplete="name" maxLength={120} value={values.name} onChange={e => update('name', e.target.value)} />{error('name')}</label>
      <label htmlFor="contact-company">{c.company}<input {...attributes('company')} autoComplete="organization" maxLength={160} value={values.company} onChange={e => update('company', e.target.value)} />{error('company')}</label>
      <label htmlFor="contact-service">{c.service}<select {...attributes('service')} value={values.service} onChange={e => update('service', e.target.value)}>
        <option value="">{c.choose}</option>{contactOptions(lang).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>{error('service')}</label>
      <label htmlFor="contact-message">{copy.message}<textarea {...attributes('message')} rows={6} maxLength={5000} value={values.message} onChange={e => update('message', e.target.value)} />{error('message')}</label>
      <label htmlFor="contact-linkedin">{c.linkedinUrl}<input {...attributes('linkedin')} type="url" autoComplete="url" maxLength={300} value={values.linkedin} onChange={e => update('linkedin', e.target.value)} />{error('linkedin')}</label>
      <p id="contact-purpose">{c.purpose}</p>
      <label htmlFor="contact-consent" className="contact-consent"><input {...attributes('consent')} type="checkbox" checked={values.consent} onChange={e => setValues(previous => ({ ...previous, consent: e.target.checked }))} /><span>{c.consent}</span></label>
      {error('consent')}
      {!unavailable && <ContactTurnstile siteKey={siteKey} lang={lang} result={state} />}
      <button className="button primary" type="submit" disabled={unavailable || pending}>{pending ? copy.sending : copy.send}</button>
      {Object.keys(errors).length > 0 && <p role="alert">{c.invalid}</p>}
      {(captchaError || state?.status === 'captcha') && <p role="alert">{c.captcha}</p>}
      {state?.status === 'ok' && <p role="status">{copy.success}</p>}
      {state?.status === 'error' && <p role="alert">{copy.error}</p>}
    </form>
    <a className="button secondary" href="https://www.linkedin.com/in/glaucialemos" target="_blank" rel="noopener">{c.linkedin}</a>
  </div>;
}
