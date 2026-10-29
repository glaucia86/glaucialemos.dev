'use client';

import { useActionState, useEffect, useState, type FormEvent } from 'react';
import type { Locale } from '@/i18n/config';
import { testimonialCopy } from '@/i18n/testimonial';
import { submitTestimonial } from '@/app/actions/testimonial';
import { QUOTE_MAX, TESTIMONIAL_CONTEXTS, testimonialSchema, testimonialValues, type TestimonialErrors, type TestimonialField, type TestimonialState } from '@/lib/testimonial-schema';
import { ContactTurnstile } from '@/components/ContactTurnstile';

// Same protections as the contact form (honeypot, Zod on both sides, Turnstile); works as a plain form without JS.
// `heading`: false when the section itself is the invitation (no approved testimonial yet).
export function TestimonialForm({ lang, enabled, siteKey, heading = true }: { lang: Locale; enabled: boolean; siteKey: string; heading?: boolean }) {
  const c = testimonialCopy[lang];
  const [state, action, pending] = useActionState<TestimonialState | null, FormData>(submitTestimonial, null);
  const [clientErrors, setClientErrors] = useState<TestimonialErrors | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [length, setLength] = useState(0);
  const errors = clientErrors ?? (state?.status === 'invalid' ? state.errors : {});
  const unavailable = !enabled || !siteKey || state?.status === 'unavailable';
  useEffect(() => { if (state) { setClientErrors(null); setCaptchaError(false); } }, [state]);
  const values = state && 'values' in state ? state.values : undefined;

  function validate(event: FormEvent<HTMLFormElement>) {
    if (unavailable || pending) { event.preventDefault(); return; }
    const data = new FormData(event.currentTarget);
    const parsed = testimonialSchema(lang).safeParse(testimonialValues(data));
    setCaptchaError(false);
    if (!parsed.success) { event.preventDefault(); setClientErrors(parsed.error.flatten().fieldErrors); return; }
    setClientErrors({});
    if (!data.get('cf-turnstile-response')) { event.preventDefault(); setCaptchaError(true); }
  }
  const attributes = (field: TestimonialField, required = true) => ({
    id: `testimonial-${field}`, name: field, required, disabled: unavailable || pending,
    'aria-invalid': errors[field]?.length ? true as const : undefined,
    'aria-describedby': errors[field]?.length ? `testimonial-${field}-error` : undefined,
  });
  const error = (field: TestimonialField) => errors[field]?.length ? <span className="contact-error" id={`testimonial-${field}-error`}>{errors[field]![0]}</span> : null;

  return <div className="testimonial-form contact-panel" data-contact-status={pending ? 'pending' : state?.status ?? 'idle'}>
    {heading ? <><h3 id="testimonial-form-title">{c.title}</h3><p>{c.intro}</p></> : <span id="testimonial-form-title" hidden>{c.title}</span>}
    {unavailable && <p className="form-notice" role="status">{c.unavailable}</p>}
    {state?.status === 'ok' ? <p role="status" className="testimonial-form__done">{c.success}</p> :
      <form action={action} onSubmit={validate} noValidate aria-busy={pending} aria-labelledby="testimonial-form-title">
        <input type="hidden" name="lang" value={lang} />
        <div hidden aria-hidden="true"><label htmlFor="testimonial-website">Website</label><input id="testimonial-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <label htmlFor="testimonial-name">{c.name}<input {...attributes('name')} autoComplete="name" maxLength={120} defaultValue={values?.name} />{error('name')}</label>
        <label htmlFor="testimonial-role">{c.role}<input {...attributes('role')} autoComplete="organization-title" maxLength={160} defaultValue={values?.role} />{error('role')}</label>
        <label htmlFor="testimonial-linkedin">{c.linkedin}<input {...attributes('linkedin', false)} type="url" autoComplete="url" maxLength={300} defaultValue={values?.linkedin} />{error('linkedin')}</label>
        <fieldset className="testimonial-form__contexts" aria-describedby={errors.context?.length ? 'testimonial-context-error' : undefined}>
          <legend>{c.context}</legend>
          {TESTIMONIAL_CONTEXTS.map(context => <label key={context} htmlFor={`testimonial-context-${context}`}>
            <input {...attributes('context')} id={`testimonial-context-${context}`} type="radio" value={context} defaultChecked={values?.context === context} />{c.contexts[context]}
          </label>)}
          {error('context')}
        </fieldset>
        <label htmlFor="testimonial-quote">{c.quote}<textarea {...attributes('quote')} rows={5} maxLength={QUOTE_MAX} defaultValue={values?.quote} onChange={event => setLength(event.target.value.length)} />
          <small aria-live="polite">{length}/{QUOTE_MAX}</small>{error('quote')}</label>
        <p id="testimonial-purpose">{c.purpose}</p>
        <label htmlFor="testimonial-consent" className="contact-consent"><input {...attributes('consent')} type="checkbox" aria-describedby="testimonial-purpose" defaultChecked={values?.consent} /><span>{c.consent}</span></label>
        {error('consent')}
        {!unavailable && <ContactTurnstile siteKey={siteKey} lang={lang} result={state} />}
        <button className="button primary" type="submit" disabled={unavailable || pending}>{pending ? c.sending : c.send}</button>
        {Object.keys(errors).length > 0 && <p role="alert">{c.invalid}</p>}
        {(captchaError || state?.status === 'captcha') && <p role="alert">{c.captcha}</p>}
        {state?.status === 'error' && <p role="alert">{c.error}</p>}
      </form>}
  </div>;
}
