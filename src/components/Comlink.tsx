"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import type { ComlinkCopy } from "@/i18n/comlink";
import { EGGS, FOUND_EVENT, discover, emitEgg, eggsFor, forget, getFoundSnapshot, matchPhrase, matchTail, normalizePhrase, onEgg, pageOf, remainingDiscoveries, subscribeReset, type EggId } from "@/lib/eggs";
import { useDiscoveries } from "@/lib/use-discoveries";
import { epilogueRemaining } from "@/lib/epilogue";
import { play } from "@/lib/sfx";


// The secret channel: every Easter egg is reachable from here on any device, by typing or by tapping replay.
// The toggle lives in the site header (slot); the dialog and the toast stay at the page root.
const HINT_KEY = "comlink-hint-seen";
// Secrets needed before the radio reveals where the second secret page (the 404) hides.
export const LOST_UNLOCK = 5;
// Any page can open the radio (e.g. the Home's guide button).
export const COMLINK_OPEN_EVENT = "comlink:open";
const markHintSeen = () => { try { localStorage.setItem(HINT_KEY, "1"); } catch { /* Session only. */ } };

// `hintReady`: the chrome says when nothing else is asking for attention (intro and sound invitation are over).
export function Comlink({ copy, pathname, slot, hintReady = false }: { copy: ComlinkCopy; pathname: string; slot: HTMLElement | null; hintReady?: boolean }) {
  const page = pageOf(pathname);
  const list = eggsFor(page);
  const dialog = useRef<HTMLDialogElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const scrollContent = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const letter = useRef<HTMLDialogElement>(null);
  const letterScroll = useRef<HTMLDivElement>(null);
  const letterContent = useRef<HTMLDivElement>(null);
  const letterOpener = useRef<HTMLElement | null>(null);
  const replayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const found = useDiscoveries();
  const [fresh, setFresh] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [hint, setHint] = useState(false);
  // First visit only: the radio blinks once with a one-line explanation, so nobody misses that the site has secrets.
  useEffect(() => {
    if (!hintReady) return;
    let seen = true;
    try { seen = localStorage.getItem(HINT_KEY) === "1"; } catch { /* Without storage the hint is skipped. */ }
    if (seen) return;
    const show = setTimeout(() => setHint(true), 900);
    const hide = setTimeout(() => { setHint(false); markHintSeen(); }, 12_000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [hintReady]);
  function dismissHint() { setHint(false); markHintSeen(); }
  useEffect(() => {
    const cleanups = [[scroll.current, scrollContent.current], [letterScroll.current, letterContent.current]].map(([viewport, content]) => {
      const frame = viewport?.parentElement;
      const bar = frame?.querySelector<HTMLDivElement>(".comlink__mini-bar");
      if (!viewport || !content || !frame || !bar) return;
      const update = () => {
        const { clientHeight, scrollHeight, scrollTop } = viewport;
        const trackH = frame.clientHeight;
        const overflow = scrollHeight > clientHeight && clientHeight > 0;
        bar.hidden = !overflow;
        frame.toggleAttribute("data-more", overflow && scrollHeight > clientHeight + scrollTop + 1);
        if (!overflow) {
          bar.style.removeProperty("--thumb-h");
          bar.style.removeProperty("--thumb-t");
          return;
        }
        const ratio = clientHeight / scrollHeight;
        const thumbH = Math.min(trackH, Math.max(24, ratio * trackH));
        const progress = Math.max(0, Math.min(1, scrollTop / (scrollHeight - clientHeight || 1)));
        bar.style.setProperty("--thumb-h", `${thumbH}px`);
        bar.style.setProperty("--thumb-t", `${progress * (trackH - thumbH)}px`);
      };
      // Catch dialog opening, viewport resizing, fonts and discoveries in both dialogs.
      const observer = new ResizeObserver(update);
      observer.observe(frame);
      observer.observe(viewport);
      observer.observe(content);
      viewport.addEventListener("scroll", update, { passive: true });
      update();
      return () => { observer.disconnect(); viewport.removeEventListener("scroll", update); };
    });
    return () => cleanups.forEach(cleanup => cleanup?.());
  }, []);
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
      if (event.ctrlKey || event.altKey || event.metaKey || event.key?.length !== 1 || (event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true'], dialog")) return;
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
    const onOpen = () => open();
    addEventListener(FOUND_EVENT, onFound);
    addEventListener("keydown", onKey);
    addEventListener(COMLINK_OPEN_EVENT, onOpen);
    return () => { clearTimeout(timer); removeEventListener(FOUND_EVENT, onFound); removeEventListener("keydown", onKey); removeEventListener(COMLINK_OPEN_EVENT, onOpen); };
  }, []);

  useEffect(() => { if (dialog.current?.open) dialog.current.close(); }, [pathname]);

  function open() { setHint(false); markHintSeen(); setFeedback(""); setConfirming(false); dialog.current?.showModal(); input.current?.focus({ preventScroll: true }); play("blip"); }
  const wipe = () => {
    if (!confirming) { setConfirming(true); play("error"); return; }
    forget(); setConfirming(false); setFeedback(copy.resetDone); play("push");
    input.current?.focus();
  };
  const run = (id: EggId) => {
    const missing = remainingDiscoveries(id, getFoundSnapshot().split(","));
    if (missing) { setFeedback((id === "epilogue-signal" ? copy.epilogue.signalLocked : copy.letter.locked).replace("{n}", String(missing))); return; }
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
  const lang = pathname.split("/")[1] || "pt";
  const remaining = epilogueRemaining(found);
  const lostFound = EGGS.some(egg => egg.page === "notfound" && found.includes(egg.id));

  return <>
    {slot && createPortal(<button type="button" className="comlink-toggle" aria-label={copy.open} aria-haspopup="dialog" title={`${copy.open} (\`)`} data-fresh={fresh || undefined} onClick={open}>
      <svg viewBox="0 0 12 20" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        <path fill="#5b6478" d="M8 0h1v6H8z" /><path className="comlink-toggle__tip" fill="#ff4d5e" d="M8 0h1v1H8z" />
        <path fill="#2b3142" d="M2 6h8v13H2z" /><path fill="#8d96ab" d="M3 7h6v4H3z" /><path className="comlink-toggle__screen" fill="#7cf29a" d="M4 8h4v2H4z" />
        <path fill="#c9cfdb" d="M3 12h2v1H3zM7 12h2v1H7zM3 14h2v1H3zM7 14h2v1H7zM3 16h6v1H3z" />
      </svg>
      <span className="comlink-toggle__count" aria-hidden="true">{count}/{total}</span>
    </button>, slot)}
    {slot && hint && createPortal(<p className="comlink-hint" role="status">{copy.guide.hint} <button type="button" onClick={dismissHint}>{copy.guide.hintClose}</button></p>, slot)}
    <p className="comlink-fresh" role="status" aria-live="polite" data-show={fresh || undefined}>{fresh ? copy.fresh : ""}</p>
    <dialog ref={dialog} className="comlink" data-lenis-prevent="" aria-labelledby="comlink-title" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
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
        <p className="comlink__intro">{copy.guide.intro}</p>
        <section className="comlink__pages" aria-labelledby="comlink-pages">
          <h3 id="comlink-pages">{copy.guide.pages}</h3>
          <ul>
            <li data-found={found.includes("epilogue-signal") || undefined}>
              <span className="comlink__icon" aria-hidden="true">{found.includes("epilogue-signal") ? "✦" : remaining ? "◌" : "✧"}</span>
              <span className="comlink__text"><b>{copy.guide.epilogue}</b><small>{found.includes("epilogue-signal") ? copy.guide.epilogueOpen : remaining ? copy.guide.epilogueLocked.replace("{n}", String(remaining)) : copy.guide.epilogueReady}</small></span>
              {found.includes("epilogue-signal") && <Link href={`/${lang}/alem-da-ultima-orbita`} onClick={() => dialog.current?.close()}>{copy.epilogue.revisit}</Link>}
            </li>
            <li data-found={lostFound || undefined}>
              <span className="comlink__icon" aria-hidden="true">{lostFound ? "✦" : "?"}</span>
              <span className="comlink__text"><b>{copy.guide.lost}</b><small>{lostFound ? copy.guide.lostFound : count < LOST_UNLOCK ? copy.guide.lostLocked.replace("{n}", String(LOST_UNLOCK - count)) : copy.guide.lostHidden}</small></span>
            </li>
          </ul>
        </section>
        <form className="comlink__terminal" onSubmit={submit}>
          <label className="sr-only" htmlFor="comlink-input">{copy.placeholder}</label>
          <span aria-hidden="true">&gt;</span>
          <input ref={input} id="comlink-input" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="send" placeholder={copy.placeholder} />
          <button type="submit">{copy.send}</button>
        </form>
        <p className="comlink__feedback" role="status" aria-live="polite">{feedback}</p>
        <div className="comlink__scroll-frame">
          <div ref={scroll} className="comlink__scroll" data-lenis-prevent="" tabIndex={0} role="region" aria-labelledby="comlink-title">
            <div ref={scrollContent} className="comlink__scroll-content">
              {remainingDiscoveries("curious-letter", found) === 0 && <button type="button" className="comlink__envelope" onClick={() => run("curious-letter")}><span aria-hidden="true">✉</span> {copy.letter.open}</button>}
              {count > 0 && <button type="button" className="comlink__reset" data-confirming={confirming || undefined} onClick={wipe}>
                <span aria-hidden="true">{confirming ? "!" : "⟲"}</span>{confirming ? copy.resetConfirm.replace("{n}", String(count)) : copy.reset}
              </button>}
              <ul className="comlink__list">{list.map(({ id }) => {
                const known = found.includes(id);
                return <li key={id} data-found={known || undefined}>
                  <span className="comlink__icon" aria-hidden="true">{known ? "✦" : "?"}</span>
                  <span className="comlink__text"><b>{known ? copy.eggs[id].name : copy.hidden}</b><small>{copy.eggs[id].hint}</small></span>
                  {known && <button type="button" onClick={() => run(id)}>{copy.play}<span className="sr-only">: {copy.eggs[id].name}</span></button>}
                </li>;
              })}</ul>
            </div>
          </div>
          <div className="comlink__mini-bar" aria-hidden="true" hidden><i /></div>
        </div>
      </div>
    </dialog>
    <dialog ref={letter} className="curious-letter" data-lenis-prevent="" aria-labelledby="curious-letter-title" onClose={() => { if (letterOpener.current?.isConnected) letterOpener.current.focus({ preventScroll: true }); }}>
      <div className="comlink__scroll-frame curious-letter__scroll-frame">
        <div ref={letterScroll} className="comlink__scroll" data-lenis-prevent="" tabIndex={0} role="region" aria-labelledby="curious-letter-title">
          <div ref={letterContent} className="curious-letter__paper">
            <span className="curious-letter__seal" aria-hidden="true">✦</span>
            <h2 id="curious-letter-title">{copy.letter.title}</h2>
            <p>{copy.letter.body}</p><p className="curious-letter__signature">{copy.letter.signature}</p>
            <button type="button" autoFocus onClick={() => letter.current?.close()}>{copy.letter.close}</button>
          </div>
        </div>
        <div className="comlink__mini-bar" aria-hidden="true" hidden><i /></div>
      </div>
    </dialog>
  </>;
}
