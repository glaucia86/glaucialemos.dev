"use client";

import { useRef } from "react";
import type { NiveoraCopy } from "@/i18n/niveora";
import type { CareerRole } from "@/lib/career";
import { CareerMap } from "@/components/about/CareerMap";

type Copy = { more: string; title: string; intro: string; close: string };

// The Home keeps the short timeline; the detailed crossing map opens on top of it, so the visitor never leaves the
// reading flow. Native modal: Esc, close button and a click on the backdrop close it; focus returns to the button.
export function CareerDialog({ copy, roles, map, locale, source, ship }: { copy: Copy; roles: CareerRole[]; map: NiveoraCopy["map"]; locale: string; source: string; ship: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const close = () => dialog.current?.close();
  return <>
    <button ref={opener} type="button" className="text-link career-dialog__open" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
      {copy.more}<span aria-hidden="true"> ⤢</span>
    </button>
    <dialog ref={dialog} className="career-dialog" aria-labelledby="career-dialog-title" data-lenis-prevent=""
      onClose={() => opener.current?.focus({ preventScroll: true })}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="career-dialog__panel">
        <header className="career-dialog__head">
          <button type="button" className="career-dialog__close" onClick={close}><span aria-hidden="true">✕</span> {copy.close}</button>
          <div><h2 id="career-dialog-title">{copy.title}</h2><p>{copy.intro}</p></div>
        </header>
        <CareerMap roles={roles} copy={map} locale={locale} source={source} ship={ship} embedded />
      </div>
    </dialog>
  </>;
}
