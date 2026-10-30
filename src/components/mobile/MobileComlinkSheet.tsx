"use client";

import { useEffect, useRef, useState } from "react";
import type { MobileEggCopy } from "@/i18n/mobile-eggs";
import { MOBILE_REVEAL_EVENT, sessionHintOrder, type MobileWorld } from "@/lib/mobile-eggs";

// Mounted only in MOBILE_EGG_QUERY. No discovery subscription or found-state input.
export function MobileComlinkSheet({ world, copy, open, onDismiss }: {
  world: MobileWorld; copy: MobileEggCopy; open: boolean; onDismiss: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [hints] = useState(() => {
    let storage: Storage | undefined;
    try { storage = sessionStorage; } catch { /* Private browsing can deny storage. */ }
    return sessionHintOrder(world, storage);
  });

  useEffect(() => {
    const sheet = dialog.current;
    if (!sheet || !open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    sheet.showModal();
    sheet.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    return () => {
      sheet.close();
      if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
    };
  }, [open]);

  return <dialog ref={dialog} className="mobile-comlink-sheet" aria-labelledby="mobile-comlink-title" data-lenis-prevent=""
    onCancel={event => { event.preventDefault(); onDismiss(); }}
    onClick={event => { if (event.target === event.currentTarget) onDismiss(); }}
    onKeyDown={event => {
      if (event.key !== "Tab") return;
      const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
      const target = event.shiftKey ? buttons.at(-1) : buttons[0];
      if (document.activeElement === (event.shiftKey ? buttons[0] : buttons.at(-1))) {
        event.preventDefault(); target?.focus();
      }
    }}>
    <div className="mobile-comlink-sheet__panel">
      <header className="mobile-comlink-sheet__head"
        onPointerDown={event => {
          if (!event.isPrimary || (event.target as Element).closest("button")) return;
          swipe.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { swipe.current = null; }}
        onPointerUp={event => {
          const start = swipe.current; swipe.current = null;
          if (start && event.clientY - start.y > 55 && event.clientY - start.y > Math.abs(event.clientX - start.x)) onDismiss();
        }}>
        <span className="mobile-comlink-sheet__handle" aria-hidden="true" />
        <h2 id="mobile-comlink-title">{copy.ui.sheetTitle}</h2>
        <button type="button" aria-label={copy.ui.sheetClose} onClick={onDismiss}>×</button>
      </header>
      <ul className="mobile-comlink-sheet__hints">{hints.map(h => <li key={h.id}>
        <button type="button" onClick={() => {
          // Release the modal and return focus before revealing the panorama; no tooltip or PLAY event.
          dialog.current?.close();
          onDismiss();
          window.dispatchEvent(new CustomEvent(MOBILE_REVEAL_EVENT, { detail: h.id }));
        }}>{copy.hints[h.id]}</button>
      </li>)}</ul>
    </div>
  </dialog>;
}
