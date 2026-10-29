"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import { discover, emitEgg, matchTail, normalizePhrase, onEgg, type EggId } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import { motionAllowed } from "@/lib/use-motion";

// The five secrets that close the catalogue at 50. Triggers only emit the id (typing, Comlink, gestures); each
// component here plays its effect and marks the discovery. All of them work by touch and respect reduced motion.
const COPY = {
  pt: { close: "Fechar", meteors: "Cada meteoro é um encontro real", commit: "Disquete recuperado: primeiro commit", open: "Ver no GitHub", floppy: "Disquete perdido", selfie: "Selfie orbital", selfieStats: "{events} eventos · {countries} países", harvest: "Proposta desbloqueada! Vamos conversar sobre o seu time?", harvestCta: "Pedir uma proposta", night: "Noite profunda: só a sua lanterna ilumina o site. Esc ou o botão voltam ao dia.", nightExit: "Voltar ao dia" },
  en: { close: "Close", meteors: "Every meteor is a real encounter", commit: "Floppy recovered: first commit", open: "See on GitHub", floppy: "Lost floppy disk", selfie: "Orbital selfie", selfieStats: "{events} events · {countries} countries", harvest: "Proposal unlocked! Shall we talk about your team?", harvestCta: "Request a proposal", night: "Deep night: only your flashlight lights the site. Esc or the button bring the day back.", nightExit: "Back to day" },
  es: { close: "Cerrar", meteors: "Cada meteoro es un encuentro real", commit: "Disquete recuperado: primer commit", open: "Ver en GitHub", floppy: "Disquete perdido", selfie: "Selfie orbital", selfieStats: "{events} eventos · {countries} países", harvest: "¡Propuesta desbloqueada! ¿Hablamos de tu equipo?", harvestCta: "Pedir una propuesta", night: "Noche profunda: solo tu linterna ilumina el sitio. Esc o el botón traen el día.", nightExit: "Volver al día" },
} as const;

function useEgg(id: EggId, run: () => void) {
  const action = useRef(run);
  useEffect(() => { action.current = run; });
  useEffect(() => onEgg(id, () => { discover(id); action.current(); }), [id]);
}

// Home · "chuva": three clicks (or taps) on the events map title rain the real encounters as meteors.
export function MeteorShower({ lang, events }: { lang: Locale; events: { nome: string; cidade?: string; ano: number }[] }) {
  const [active, setActive] = useState(false);
  useEgg("meteor-shower", () => { play("comet"); setActive(true); setTimeout(() => setActive(false), motionAllowed() ? 7000 : 5000); });
  useEffect(() => {
    const title = document.querySelector<HTMLElement>("#galaxy-title");
    if (!title) return;
    let clicks: number[] = [];
    const click = () => { const now = Date.now(); clicks = [...clicks.filter(t => now - t < 1500), now]; if (clicks.length >= 3) { clicks = []; emitEgg("meteor-shower"); } };
    title.addEventListener("click", click);
    return () => title.removeEventListener("click", click);
  }, []);
  if (!active) return null;
  // One meteor per city (its most recent visit), so the shower shows the breadth of the encounters.
  const picks = [...new Map(events.filter(event => event.cidade && !/^online$/i.test(event.cidade)).map(event => [event.cidade, event] as const)).values()].slice(0, 14);
  return <div className="egg-meteors" role="status" aria-label={COPY[lang].meteors}>
    <p className="egg-meteors__title">{COPY[lang].meteors}</p>
    {picks.map((event, index) => <span key={`${event.nome}-${index}`} className="egg-meteors__meteor" style={{ "--i": index, "--x": `${(index * 37) % 90 + 5}%` } as CSSProperties}>
      <i aria-hidden="true" />{event.cidade} · {event.ano}
    </span>)}
  </div>;
}

// Projects · "commit": a floppy disk lies in the corner of the lab; bringing it back reveals a real first commit.
export function LostCommit({ lang, records }: { lang: Locale; records: { repo: string; date: string; message: string; url: string }[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [record, setRecord] = useState(records[0]);
  useEgg("lost-commit", () => { play("disk-in"); setRecord(records[Math.floor(Math.random() * records.length)]); dialog.current?.showModal(); });
  const copy = COPY[lang];
  return <>
    <button type="button" className="egg-floppy" aria-label={copy.floppy} title={copy.floppy} onClick={() => emitEgg("lost-commit")}>
      <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true" focusable="false"><path fill="#1f2a44" d="M2 2h11l1 1v11H2z" /><path fill="#c9cfdb" d="M4 2h7v4H4z" /><path fill="#1f2a44" d="M9 3h1v2H9z" /><path fill="#ffb36b" d="M4 9h8v4H4z" /></svg>
    </button>
    <dialog ref={dialog} className="egg-dialog" data-lenis-prevent="" aria-labelledby="egg-commit-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <p className="egg-dialog__kicker">{copy.floppy}</p>
      <h2 id="egg-commit-title">{copy.commit}</h2>
      {record && <p><b>{record.repo}</b> · {record.date}<br /><code>{record.message}</code></p>}
      <div className="egg-dialog__actions">{record && <a href={record.url} target="_blank" rel="noopener noreferrer">{copy.open} ↗</a>}<button type="button" onClick={() => dialog.current?.close()}>{copy.close}</button></div>
    </dialog>
  </>;
}

// Events · "selfie": holding the orbit image for 2 s takes a souvenir photo of the crew with the real numbers.
export function OrbitalSelfie({ lang, events, countries, glaucia, prince }: { lang: Locale; events: number; countries: number; glaucia: string; prince: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEgg("orbital-selfie", () => { play("lens"); document.documentElement.dataset.eggFlash = "on"; setTimeout(() => { delete document.documentElement.dataset.eggFlash; }, 500); dialog.current?.showModal(); });
  useEffect(() => {
    // Listen on the window: the hero has layered canvases and hotspots above the image.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const down = (event: PointerEvent) => {
      const hero = document.querySelector<HTMLElement>("main .page-hero")?.getBoundingClientRect();
      if (!hero || event.clientY < hero.top || event.clientY > hero.bottom || (event.target as Element).closest("a, button, input, textarea, select")) return;
      timer = setTimeout(() => emitEgg("orbital-selfie"), 2000);
    };
    const cancel = () => clearTimeout(timer);
    const types = ["pointerup", "pointercancel", "scroll"] as const;
    addEventListener("pointerdown", down); types.forEach(type => addEventListener(type, cancel));
    return () => { cancel(); removeEventListener("pointerdown", down); types.forEach(type => removeEventListener(type, cancel)); };
  }, []);
  const copy = COPY[lang];
  return <dialog ref={dialog} className="egg-dialog egg-selfie" data-lenis-prevent="" aria-labelledby="egg-selfie-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <div className="egg-selfie__photo" aria-hidden="true">
      <i style={{ backgroundImage: `url(${glaucia})` }} /><i style={{ backgroundImage: `url(${prince})` }} />
    </div>
    <h2 id="egg-selfie-title">{copy.selfie}</h2>
    <p>{copy.selfieStats.replace("{events}", String(events)).replace("{countries}", String(countries))}</p>
    <div className="egg-dialog__actions"><button type="button" onClick={() => dialog.current?.close()}>{copy.close}</button></div>
  </dialog>;
}

// Services · "colheita": visiting the three formats in order (01 → 02 → 03) makes a proposal bloom.
const ORDER = ["palestra", "workshop", "mentoria"];
export function ProposalHarvest({ lang }: { lang: Locale }) {
  const [open, setOpen] = useState(false);
  useEgg("proposal-harvest", () => { play("bloom"); setOpen(true); });
  useEffect(() => {
    const cards = [...document.querySelectorAll<HTMLElement>("#formatos [data-offer]")];
    let step = 0;
    const visit = (event: Event) => {
      const offer = (event.currentTarget as HTMLElement).dataset.offer;
      step = offer === ORDER[step] ? step + 1 : offer === ORDER[0] ? 1 : 0;
      if (step === ORDER.length) { step = 0; emitEgg("proposal-harvest"); }
    };
    cards.forEach(card => { card.addEventListener("pointerenter", visit); card.addEventListener("focusin", visit); });
    return () => cards.forEach(card => { card.removeEventListener("pointerenter", visit); card.removeEventListener("focusin", visit); });
  }, []);
  if (!open) return null;
  const copy = COPY[lang];
  return <aside className="egg-harvest" role="status">
    <span className="egg-harvest__flower" aria-hidden="true">✿</span>
    <p>{copy.harvest}</p>
    <div className="egg-dialog__actions"><Link className="button primary" href={`/${lang}/servicos#contato`} onClick={() => setOpen(false)}>{copy.harvestCta}</Link><button type="button" onClick={() => setOpen(false)}>{copy.close}</button></div>
  </aside>;
}

// Global · "lua": the whole site goes dark and only a flashlight that follows the pointer lights it.
export function DeepNight({ lang }: { lang: Locale }) {
  const [on, setOn] = useState(false);
  useEgg("deep-night", () => { play("hush"); setOn(true); });
  useEffect(() => {
    let buffer = "";
    const typed = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOn(false); return; }
      if (event.ctrlKey || event.altKey || event.metaKey || event.key?.length !== 1 || (event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true'], dialog")) return;
      buffer = (buffer + normalizePhrase(event.key)).slice(-24);
      if (matchTail(buffer, ["deep-night"])) { buffer = ""; emitEgg("deep-night"); }
    };
    addEventListener("keydown", typed);
    return () => removeEventListener("keydown", typed);
  }, []);
  useEffect(() => {
    if (!on) return;
    const root = document.documentElement;
    const move = (event: PointerEvent) => { root.style.setProperty("--night-x", `${event.clientX}px`); root.style.setProperty("--night-y", `${event.clientY}px`); };
    root.dataset.deepNight = "on";
    addEventListener("pointermove", move);
    return () => { delete root.dataset.deepNight; removeEventListener("pointermove", move); };
  }, [on]);
  if (!on) return null;
  return <div className="egg-night" role="status">
    <p>{COPY[lang].night}</p>
    <button type="button" onClick={() => setOn(false)}>{COPY[lang].nightExit}</button>
  </div>;
}
