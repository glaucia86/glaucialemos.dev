"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { motionAllowed } from "@/lib/use-motion";
import { play } from "@/lib/sfx";
import { bringIntoView, buzz, discover, onEgg } from "@/lib/eggs";
import type { MarteCopy } from "@/i18n/marte";
import { CARD_2018, CARD_NOW, type CardLine } from "@/lib/mars-records";

type Sprite = { src: string; w: number; h: number };
type Stage = "idle" | "digging" | "found" | "inserting" | "on";
type Year = "2018" | "now";
const COMMAND = "npx glaucia_lemos86";
const LABEL = 11;
const DIG_MS = 1100;
const INSERT_MS = 700;
const linesOf = (year: Year) => year === "2018" ? CARD_2018 : CARD_NOW;
// A mechanical key, never twice at the same pitch.
const key = () => play("type", { detune: (Math.random() - .5) * 500, gain: .7 + Math.random() * .4 });

function Card({ lines, shown }: { lines: CardLine[]; shown: number }) {
  const width = Math.max(...lines.map((line) => (line.label ? LABEL + 2 : 0) + line.value.length)) + 4;
  const row = (line: CardLine, index: number) => {
    const text = (line.label ? `${line.label}:`.padStart(LABEL + 1) + " " : "") + line.value;
    return <span key={index}>║  {line.label && <b>{`${line.label}:`.padStart(LABEL + 1)}</b>}{line.label ? " " + line.value : line.value}{" ".repeat(Math.max(0, width - 4 - text.length))}  ║{"\n"}</span>;
  };
  return <pre className="crt__card">{`╔${"═".repeat(width)}╗\n`}{lines.slice(0, shown).map(row)}{shown >= lines.length && `╚${"═".repeat(width)}╝`}</pre>;
}

export type RetroArt = { computerOff: Sprite; computerOn: Sprite; floppyFlat: Sprite; floppyUpright: Sprite };
type Props = { copy: MarteCopy["retro"]; career: string; prince: { stand: Sprite; sniff: Sprite }; art: RetroArt };

// The old terminal (secret `terminal-launch`): Prince digs a floppy disk out of the sand, the visitor drags, taps or presses
// Enter to insert it, and the computer boots a green phosphor screen with the real 2018 npx card.
export function RetroTerminal({ copy, career, prince, art }: Props) {
  const root = useRef<HTMLElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  const floppy = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const timers = useRef<number[]>([]);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [typed, setTyped] = useState(0);
  const [card, setCard] = useState<{ year: Year; shown: number }>({ year: "2018", shown: 0 });
  const [ready, setReady] = useState(false);

  const later = (run: () => void, ms: number) => { timers.current.push(window.setTimeout(run, ms)); };
  useEffect(() => { setReady(true); const pending = timers.current; return () => pending.forEach(clearTimeout); }, []);

  // The prompt types itself, then the card appears line by line.
  useEffect(() => {
    if (stage !== "on" || typed >= COMMAND.length) return;
    const id = setTimeout(() => { key(); setTyped((count) => count + 1); }, 45);
    return () => clearTimeout(id);
  }, [stage, typed]);
  useEffect(() => {
    const lines = linesOf(card.year);
    if (stage !== "on" || typed < COMMAND.length || card.shown >= lines.length) return;
    // Each card line types out as a short burst of keys and ends with a carriage return.
    const id = setTimeout(() => {
      [0, 14, 28, 42].forEach((delay) => window.setTimeout(key, delay));
      window.setTimeout(() => play("return", { gain: .8 }), 56);
      setCard((current) => ({ ...current, shown: current.shown + 1 }));
    }, 70);
    return () => clearTimeout(id);
  }, [stage, typed, card]);

  const boot = () => {
    setStage("on"); discover("terminal-launch"); play("crt-on"); buzz([20, 30, 40]);
    const instant = !motionAllowed();
    setTyped(instant ? COMMAND.length : 0);
    if (instant) play("return");
    setCard({ year: "2018", shown: instant ? CARD_2018.length : 0 });
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  };
  const insert = () => {
    if (stage !== "found") return;
    setOffset({ x: 0, y: 0 }); setStage("inserting"); play("disk-in");
    if (motionAllowed()) later(boot, INSERT_MS); else boot();
  };
  const dig = (then?: () => void) => {
    if (stage !== "idle") { if (stage === "found") then?.(); return; }
    setStage("digging"); play("woof"); play("dig");
    const found = () => { setStage("found"); play("beacon"); then?.(); };
    if (motionAllowed()) later(found, DIG_MS); else found();
  };
  const eject = () => dialog.current?.close();
  const onClose = () => { setStage("found"); play("disk-out"); requestAnimationFrame(() => floppy.current?.focus()); };

  // Replays from the star radio or the typed phrase: the whole chain on its own (dig, then insert once it is found).
  const auto = useRef(false);
  const chain = useRef(() => {});
  chain.current = () => { if (stage === "idle") { auto.current = true; dig(); } else if (stage === "found") insert(); };
  useEffect(() => onEgg("terminal-launch", () => void bringIntoView(root.current).then(() => chain.current())), []);
  useEffect(() => { if (stage === "found" && auto.current) { auto.current = false; insert(); } });

  // Dragging the floppy into the drive (mouse, pen or finger); a press without movement inserts it as well.
  const down = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (stage !== "found") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, moved: false };
  };
  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    const x = event.clientX - drag.current.x; const y = event.clientY - drag.current.y;
    if (Math.hypot(x, y) > 6) drag.current.moved = true;
    setOffset({ x, y });
  };
  const up = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const state = drag.current; drag.current = null;
    if (!state) return;
    const target = slot.current?.getBoundingClientRect(); const disk = event.currentTarget.getBoundingClientRect();
    const overlaps = !!target && disk.right > target.left - 12 && disk.left < target.right + 12 && disk.bottom > target.top - 12 && disk.top < target.bottom + 12;
    if (overlaps || !state.moved) insert(); else setOffset({ x: 0, y: 0 });
  };

  const lines = linesOf(card.year);
  const style = { "--fx": `${offset.x}px`, "--fy": `${offset.y}px` } as CSSProperties;
  return <figure ref={root} className="retro" data-stage={stage}>
    <div className="retro__desk">
      <span className="retro__computer" style={{ aspectRatio: `${art.computerOff.w} / ${art.computerOff.h}`, maxWidth: art.computerOff.w }}>
        <i className="retro__computer-off" style={{ backgroundImage: `url(${art.computerOff.src})` }} />
        <i className="retro__computer-on" style={{ backgroundImage: `url(${art.computerOn.src})`, width: `${art.computerOn.w / art.computerOff.w * 100}%` }} />
        <span ref={slot} className="retro__slot" aria-hidden="true" />
      </span>
      <span className="retro__spot">
      <button type="button" className="retro__prince" aria-label={copy.prince} title={copy.prince} hidden={!ready} disabled={stage === "inserting" || stage === "on"} onClick={() => dig()}>
        <i style={{ backgroundImage: `url(${prince.stand.src})`, aspectRatio: `${prince.stand.w} / ${prince.stand.h}` }} className="retro__prince-stand" />
        <i style={{ backgroundImage: `url(${prince.sniff.src})`, aspectRatio: `${prince.sniff.w} / ${prince.sniff.h}` }} className="retro__prince-sniff" />
      </button>
      <button ref={floppy} type="button" className="retro__floppy" style={style} hidden={!ready || stage === "idle" || stage === "digging"} aria-label={copy.insert} title={copy.floppy}
        onClick={(event) => { if (event.detail === 0) insert(); }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current = null; setOffset({ x: 0, y: 0 }); }}>
        <i className="retro__floppy-flat" style={{ backgroundImage: `url(${art.floppyFlat.src})`, aspectRatio: `${art.floppyFlat.w} / ${art.floppyFlat.h}` }} />
        <i className="retro__floppy-upright" style={{ backgroundImage: `url(${art.floppyUpright.src})`, aspectRatio: `${art.floppyUpright.w} / ${art.floppyUpright.h}` }} />
      </button>
      </span>
    </div>
    <figcaption><b>{copy.title}</b><span role="status">{stage === "found" ? copy.floppy : stage === "inserting" ? copy.booting : stage === "digging" ? copy.digging : copy.hint}</span></figcaption>
    <noscript><details className="retro__fallback"><summary>{copy.fallback}</summary><pre className="crt__card">{CARD_2018.map((line) => (line.label ? `${line.label}: ` : "") + line.value).join("\n")}</pre><p>{career}</p></details></noscript>

    <dialog ref={dialog} className="crt" aria-labelledby="crt-title" onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) eject(); }}>
      <div className="crt__bezel">
        <div className="crt__screen">
          <p className="crt__prompt" id="crt-title"><span aria-hidden="true">A:\&gt; </span>{COMMAND.slice(0, typed)}<span className="crt__cursor" aria-hidden="true" /><span className="sr-only">{typed < COMMAND.length ? COMMAND : ""}</span></p>
          <Card lines={lines} shown={card.shown} />
          {card.shown >= lines.length && <p className="crt__note">{card.year === "2018" ? career : copy.rebooted}</p>}
        </div>
        <div className="crt__controls">
          <span className="crt__led" aria-hidden="true" /><span className="crt__label">{card.year === "2018" ? copy.then : copy.now}</span>
          {card.year === "2018" && <button type="button" onClick={() => { setCard({ year: "now", shown: motionAllowed() ? 1 : CARD_NOW.length }); play("granted"); }}>{copy.reboot}</button>}
          <button type="button" autoFocus onClick={eject}>{copy.eject}</button>
        </div>
      </div>
    </dialog>
  </figure>;
}
