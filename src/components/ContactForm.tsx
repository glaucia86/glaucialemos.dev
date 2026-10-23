"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { socialLinks } from "@/data/social";

export function ContactForm({ copy, formId }: { copy: Dictionary["services"]; formId?: string }) {
  const searchParams = useSearchParams();
  const subject = searchParams.get("assunto");
  const initialMessage = subject === "palestra" ? copy.talkMessage
    : subject === "workshop" ? copy.workshopMessage
    : subject === "mentoria" ? copy.mentoringMessage : "";
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formId) return;
    setState("sending");
    const form = event.currentTarget;
    const response = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    }).catch(() => null);
    setState(response?.ok ? "success" : "error");
    if (response?.ok) form.reset();
  };

  return <div id="contato" className="contact-panel">
    <h2>{copy.formTitle}</h2>
    {!formId && <p className="form-notice" role="status">{copy.missing}</p>}
    <form onSubmit={submit}>
      <label>{copy.name}<input name="name" required autoComplete="name" disabled={!formId} /></label>
      <label>{copy.email}<input name="email" type="email" required autoComplete="email" disabled={!formId} /></label>
      <label>{copy.message}<textarea key={initialMessage} name="message" defaultValue={initialMessage} rows={6} required disabled={!formId} /></label>
      <button className="button primary" type="submit" disabled={!formId || state === "sending"}>{state === "sending" ? copy.sending : copy.send}</button>
      {state === "success" && <p role="status">{copy.success}</p>}
      {state === "error" && <p role="alert">{copy.error}</p>}
    </form>
    <a className="button secondary" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">{copy.linkedin}</a>
  </div>;
}
