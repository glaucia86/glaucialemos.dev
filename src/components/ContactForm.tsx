'use client';

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Dictionary } from '@/i18n/dictionaries/pt';
import type { Locale } from '@/i18n/config';
import { contactCopy } from '@/i18n/contact';
import { submitContact } from '@/app/actions/contact';
import { contactFields, contactOptions, contactSchema, contactServiceId, contactStepOf, contactSteps, contactValues, validateContactStep, type ContactErrors, type ContactField, type ContactState, type ContactValues } from '@/lib/contact-schema';
import { ContactTurnstile } from './ContactTurnstile';

export function ContactForm({ copy, lang, enabled = false, siteKey = '', subject = null }: Readonly<{
  copy: Dictionary['services']; lang: Locale; enabled?: boolean; siteKey?: string; subject?: string | null;
}>) {
  // Remount only on an explicit change of subject; eggs never write into this form.
  return <ContactFields key={subject} copy={copy} lang={lang} enabled={enabled && Boolean(siteKey)} siteKey={siteKey} subject={subject} />;
}

const LAST = contactSteps.length - 1;

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
  // Server HTML (and no-JS) is one complete form; after hydration it walks the same fields in three steps.
  const [staged, setStaged] = useState(false);
  const [step, setStep] = useState(0);
  const [reachedLast, setReachedLast] = useState(false);
  const [flaw, setFlaw] = useState(0);
  const [focus, setFocus] = useState<{ target: ContactField | number; at: number } | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const errors = clientErrors ?? (state?.status === 'invalid' ? state.errors : {});
  const unavailable = !enabled || state?.status === 'unavailable';
  const stepped = staged && !unavailable;
  const firstError = (fields: ContactErrors, among: readonly ContactField[] = contactFields) => among.find(field => fields[field]?.length);
  const go = (next: number) => { setStep(next); if (next === LAST) setReachedLast(true); };
  const reject = (fields: ContactErrors, among?: readonly ContactField[]) => {
    const first = firstError(fields, among);
    if (first) { go(contactStepOf(first)); setFocus({ target: first, at: Date.now() }); }
    setFlaw(value => value + 1);
  };

  useEffect(() => setStaged(true), []);
  useEffect(() => {
    if (!state) return;
    setClientErrors(null); setCaptchaError(false);
    if (state.status === 'ok') { setValues({ name: '', company: '', service: '', message: '', linkedin: '', consent: false }); setStep(0); }
    else if (state.values) setValues(state.values);
    if (state.status === 'invalid') reject(state.errors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  useEffect(() => {
    const root = form.current;
    if (!focus || !root) return;
    const scope = typeof focus.target === 'number' ? root.querySelector(`[data-step="${focus.target}"]`) : root;
    const fields = typeof focus.target === 'number' ? 'input:not([type=hidden]), select, textarea' : `[name="${focus.target}"]`;
    // A radio group takes focus on its checked seed, like the browser's own arrow-key model.
    (scope?.querySelector<HTMLElement>(`:is(${fields})[type=radio]:checked`) ?? scope?.querySelector<HTMLElement>(fields))?.focus();
  }, [focus]);

  function advance() {
    const found = validateContactStep(lang, step, values);
    if (firstError(found, contactSteps[step])) { setClientErrors(found); reject(found, contactSteps[step]); return; }
    setClientErrors(null); go(step + 1); setFocus({ target: step + 1, at: Date.now() });
  }
  function back() { setClientErrors(null); go(step - 1); setFocus({ target: step - 1, at: Date.now() }); }
  function validate(event: FormEvent<HTMLFormElement>) {
    if (unavailable || pending) { event.preventDefault(); return; }
    // Enter on an earlier step moves forward instead of submitting a half-filled form.
    if (stepped && step < LAST) { event.preventDefault(); advance(); return; }
    const data = new FormData(event.currentTarget);
    const parsed = contactSchema(lang).safeParse(contactValues(data));
    setCaptchaError(false);
    if (!parsed.success) {
      event.preventDefault();
      const fields = parsed.error.flatten().fieldErrors;
      setClientErrors(fields); reject(fields);
      return;
    }
    setClientErrors({});
    if (!data.get('cf-turnstile-response')) { event.preventDefault(); setCaptchaError(true); setFlaw(value => value + 1); }
  }
  const attributes = (field: ContactField) => ({
    id: `contact-${field}`, name: field, required: true, disabled: unavailable || pending,
    'aria-invalid': errors[field]?.length ? true as const : undefined,
    'aria-describedby': [field === 'consent' ? 'contact-purpose' : '', errors[field]?.length ? `contact-${field}-error` : ''].filter(Boolean).join(' ') || undefined,
  });
  const error = (field: ContactField) => errors[field]?.length ? <span className="contact-error" id={`contact-${field}-error`}>{errors[field]![0]}</span> : null;
  const update = (field: Exclude<ContactField, 'consent'>, value: string) => setValues(previous => ({ ...previous, [field]: value }));
  const legend = (index: number) => <legend><span className="contact-step__count">{c.stepOf.replace('{n}', String(index + 1)).replace('{total}', String(contactSteps.length))}</span> {c.steps[index]}</legend>;
  const nav = (index: number) => stepped && <div className="contact-step__nav">
    {index > 0 && <button type="button" className="button secondary contact-step__back" onClick={back} disabled={pending}>{c.back}</button>}
    {index < LAST && <button type="button" className="button primary contact-step__next" onClick={advance}>{c.next}</button>}
  </div>;

  return <div id="contato" className="contact-panel" data-contact-enabled={!unavailable} data-contact-status={pending ? 'pending' : state?.status ?? 'idle'}
    data-contact-staged={stepped || undefined} data-contact-step={stepped ? step : undefined} data-contact-flaw={flaw || undefined}>
    <h2 id="contact-title">{copy.formTitle}</h2>
    {unavailable && <p className="form-notice" role="status">{copy.missing}</p>}
    <form ref={form} action={action} onSubmit={validate} noValidate aria-busy={pending}>
      <input type="hidden" name="lang" value={lang} />
      <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      {stepped && <ol className="contact-seeds" aria-hidden="true">{contactSteps.map((_, index) =>
        <li key={index} data-state={index < step ? 'bloom' : index === step ? 'sprout' : 'seed'}><i /></li>)}</ol>}
      <fieldset className="contact-step" data-step="0" hidden={stepped && step !== 0}>
        {legend(0)}
        <div className="contact-needs">{contactOptions(lang).map(option => <label key={option.value} className="contact-need" htmlFor={`contact-service-${option.value}`}>
          <input {...attributes('service')} id={`contact-service-${option.value}`} type="radio" value={option.value} checked={values.service === option.value} onChange={() => update('service', option.value)} />
          <i className="contact-need__seed" aria-hidden="true" /><span>{option.label}</span>
        </label>)}</div>
        {error('service')}
        {nav(0)}
      </fieldset>
      <fieldset className="contact-step" data-step="1" hidden={stepped && step !== 1}>
        {legend(1)}
        <label htmlFor="contact-name">{copy.name}<input {...attributes('name')} autoComplete="name" maxLength={120} value={values.name} onChange={e => update('name', e.target.value)} />{error('name')}</label>
        <label htmlFor="contact-company">{c.company}<input {...attributes('company')} autoComplete="organization" maxLength={160} value={values.company} onChange={e => update('company', e.target.value)} />{error('company')}</label>
        <label htmlFor="contact-linkedin">{c.linkedinUrl}<input {...attributes('linkedin')} type="url" autoComplete="url" maxLength={300} value={values.linkedin} onChange={e => update('linkedin', e.target.value)} />{error('linkedin')}</label>
        {nav(1)}
      </fieldset>
      <fieldset className="contact-step" data-step="2" hidden={stepped && step !== 2}>
        {legend(2)}
        <label htmlFor="contact-message">{copy.message}<textarea {...attributes('message')} rows={6} maxLength={5000} value={values.message} onChange={e => update('message', e.target.value)} />{error('message')}</label>
        <p id="contact-purpose">{c.purpose}</p>
        <label htmlFor="contact-consent" className="contact-consent"><input {...attributes('consent')} type="checkbox" checked={values.consent} onChange={e => setValues(previous => ({ ...previous, consent: e.target.checked }))} /><span>{c.consent}</span></label>
        {error('consent')}
        {!unavailable && (!stepped || reachedLast) && <ContactTurnstile action="contact" siteKey={siteKey} lang={lang} result={state} />}
        <div className="contact-step__nav">
          {stepped && <button type="button" className="button secondary contact-step__back" onClick={back} disabled={pending}>{c.back}</button>}
          <button className="button primary" type="submit" disabled={unavailable || pending}>{pending ? copy.sending : copy.send}</button>
        </div>
      </fieldset>
      {Object.keys(errors).length > 0 && <p role="alert">{c.invalid}</p>}
      {(captchaError || state?.status === 'captcha') && <p role="alert">{c.captcha}</p>}
      {state?.status === 'ok' && <p role="status">{copy.success}</p>}
      {state?.status === 'rate-limited' && <p role="alert">{c.rateLimited}</p>}
      {state?.status === 'error' && <p role="alert">{copy.error}</p>}
    </form>
    <a className="button secondary" href="https://www.linkedin.com/in/glaucialemos" target="_blank" rel="noopener">{c.linkedin}</a>
  </div>;
}
