"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { ComlinkCopy } from "@/i18n/comlink";
import { EGGS, FOUND_EVENT, discover, emitEgg, eggsFor, forget, getFoundSnapshot, matchPhrase, matchTail, normalizePhrase, onEgg, pageOf, remainingDiscoveries, subscribeReset, type EggId } from "@/lib/eggs";
import { useDiscoveries } from "@/lib/use-discoveries";
import { play } from "@/lib/sfx";


// The secret channel: every Easter egg is reachable from here on any device, by typing or by tapping replay.
// The toggle lives in the site header (slot); the dialog and the toast stay at the page root.
export function Comlink({ copy, pathname, slot }: { copy: ComlinkCopy; pathname: string; slot: HTMLElement | null }) {
  const page = pageOf(pathname);
  const list = eggsFor(page);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const letter = useRef<HTMLDialogElement>(null);
  const letterOpener = useRef<HTMLElement | null>(null);
  const replayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const found = useDiscoveries();
  const [fresh, setFresh] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (remainingDiscoveries("curious-letter", found) > 0) letter.current?.close();
  }, [found]);

  useEffect(() => {
    const openLetter = () => {
      const missing = remainingDiscoveries("curious-letter", getFoundSnapshot().split(","));
      if (missing) {
        setFeedback(copy.letter.locked.replace("{n}", String(missing)));
        if (!dialog.current?.open) dialog.current?.showModal();
        return;
      }
      if (!letter.current || letter.current.open) return;
      dialog.current?.close();
      letterOpener.current = document.activeElement as HTMLElement;
      letter.current.showModal(); discover("curious-letter"); play("letter");
    };
    const stop = onEgg("curious-letter", openLetter);
    const reset = () => { clearTimeout(replayTimer.current); letter.current?.close(); };
    let buffer = "";
    const typed = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1 || (event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true'], dialog")) return;
      buffer = (buffer + normalizePhrase(event.key)).slice(-32);
      if (matchTail(buffer, ["curious-letter"])) { buffer = ""; openLetter(); }
    };
    const stopReset = subscribeReset(reset);
    addEventListener("keydown", typed);
    return () => { stop(); reset(); stopReset(); removeEventListener("keydown", typed); };
  }, [copy.letter, pathname]);

  // Wiping takes two clicks; the confirmation expires on its own.
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(timer);
  }, [confirming]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onFound = () => {
      setFresh(true); play("success");
      clearTimeout(timer); timer = setTimeout(() => setFresh(false), 2600);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "`" || (event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      if (dialog.current?.open) dialog.current.close(); else open();
    };
    addEventListener(FOUND_EVENT, onFound);
    addEventListener("keydown", onKey);
    return () => { clearTimeout(timer); removeEventListener(FOUND_EVENT, onFound); removeEventListener("keydown", onKey); };
  }, []);

  useEffect(() => { if (dialog.current?.open) dialog.current.close(); }, [pathname]);

  function open() { setFeedback(""); setConfirming(false); dialog.current?.showModal(); play("blip"); }
  const wipe = () => {
    if (!confirming) { setConfirming(true); play("error"); return; }
    forget(); setConfirming(false); setFeedback(copy.resetDone); play("push");
    input.current?.focus();
  };
  const run = (id: EggId) => {
    const missing = remainingDiscoveries(id, getFoundSnapshot().split(","));
    if (missing) { setFeedback(copy.letter.locked.replace("{n}", String(missing))); return; }
    dialog.current?.close(); clearTimeout(replayTimer.current);
    replayTimer.current = setTimeout(() => emitEgg(id), 280);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const id = matchPhrase(input.current?.value ?? "");
    const egg = EGGS.find((item) => item.id === id);
    if (!id || !egg) { setFeedback(copy.unknown); play("error"); return; }
    if (!list.some((item) => item.id === id)) { setFeedback(copy.elsewhere.replace("{page}", copy.pages[egg.page === "global" ? "home" : egg.page])); play("error"); return; }
    setFeedback(copy.sent);
    if (input.current) input.current.value = "";
    run(id);
  };
  const total = EGGS.length;
  const count = found.length;

  return <>
    {slot && createPortal(<button type="button" className="comlink-toggle" aria-label={copy.open} aria-haspopup="dialog" title={`${copy.open} (\`)`} data-fresh={fresh || undefined} onClick={open}>
      <svg viewBox="0 0 12 20" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        <path fill="#5b6478" d="M8 0h1v6H8z" /><path className="comlink-toggle__tip" fill="#ff4d5e" d="M8 0h1v1H8z" />
        <path fill="#2b3142" d="M2 6h8v13H2z" /><path fill="#8d96ab" d="M3 7h6v4H3z" /><path className="comlink-toggle__screen" fill="#7cf29a" d="M4 8h4v2H4z" />
        <path fill="#c9cfdb" d="M3 12h2v1H3zM7 12h2v1H7zM3 14h2v1H3zM7 14h2v1H7zM3 16h6v1H3z" />
      </svg>
      <span className="comlink-toggle__count" aria-hidden="true">{count}/{total}</span>
    </button>, slot)}
    <p className="comlink-fresh" role="status" aria-live="polite" data-show={fresh || undefined}>{fresh ? copy.fresh : ""}</p>
    <dialog ref={dialog} className="comlink" aria-labelledby="comlink-title" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="comlink__panel">
        <header className="comlink__head">
          <p className="comlink__channel" aria-hidden="true"><span className="comlink__rec" />{copy.channel}</p>
          <h2 id="comlink-title">{copy.title}</h2>
          <button type="button" className="comlink__close" onClick={() => dialog.current?.close()} aria-label={copy.close}>×</button>
        </header>
        <p className="comlink__progress">
          <span>{copy.counter}: <b>{count}/{total}</b>{count === total && <em> · {copy.master}</em>}</span>
          <span className="comlink__bar" aria-hidden="true"><i style={{ transform: `scaleX(${count / total})` }} /></span>
        </p>
        {remainingDiscoveries("curious-letter", found) === 0 && <button type="button" className="comlink__envelope" onClick={() => run("curious-letter")}><span aria-hidden="true">✉</span> {copy.letter.open}</button>}
        {count > 0 && <button type="button" className="comlink__reset" data-confirming={confirming || undefined} onClick={wipe}>
          <span aria-hidden="true">{confirming ? "!" : "⟲"}</span>{confirming ? copy.resetConfirm.replace("{n}", String(count)) : copy.reset}
        </button>}
        <form className="comlink__terminal" onSubmit={submit}>
          <label className="sr-only" htmlFor="comlink-input">{copy.placeholder}</label>
          <span aria-hidden="true">&gt;</span>
          <input ref={input} id="comlink-input" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="send" placeholder={copy.placeholder} />
          <button type="submit">{copy.send}</button>
        </form>
        <p className="comlink__feedback" role="status" aria-live="polite">{feedback}</p>
        <ul className="comlink__list">{list.map(({ id }) => {
          const known = found.includes(id);
          return <li key={id} data-found={known || undefined}>
            <span className="comlink__icon" aria-hidden="true">{known ? "✦" : "?"}</span>
            <span className="comlink__text"><b>{known ? copy.eggs[id].name : copy.hidden}</b><small>{copy.eggs[id].hint}</small></span>
            {known && <button type="button" onClick={() => run(id)}>{copy.play}<span className="sr-only">: {copy.eggs[id].name}</span></button>}
          </li>;
        })}</ul>
      </div>
    </dialog>
    <dialog ref={letter} className="curious-letter" aria-labelledby="curious-letter-title" onClose={() => { if (letterOpener.current?.isConnected) letterOpener.current.focus({ preventScroll: true }); }}>
      <div className="curious-letter__paper">
        <span className="curious-letter__seal" aria-hidden="true">✦</span>
        <h2 id="curious-letter-title">{copy.letter.title}</h2>
        <p>{copy.letter.body}</p><p className="curious-letter__signature">{copy.letter.signature}</p>
        <button type="button" autoFocus onClick={() => letter.current?.close()}>{copy.letter.close}</button>
      </div>
    </dialog>
  </>;
}
