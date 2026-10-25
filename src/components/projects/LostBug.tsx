"use client";

import { useEffect, useRef, useState } from "react";
import { bringIntoView, buzz, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import type { MarteCopy } from "@/i18n/marte";
import { SWA_BUG } from "@/lib/mars-records";

// A 10 × 7 pixel red beetle: dark legs and antennae (l), red shell (#), a shine (h) and cyan eyes (*).
const BUG = ["..l....l..", "...l..l...", ".#hh#####.", "l#*####*#l", ".########.", "l.######.l", ".l.l..l.l."];
const PIXEL: Record<string, string> = { l: "lost-bug__leg", "#": "lost-bug__shell", h: "lost-bug__shine", "*": "lost-bug__eye" };

function Beetle() {
  return <svg className="lost-bug__art" viewBox="0 0 10 7" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    {BUG.flatMap((row, y) => [...row].map((pixel, x) => pixel === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" className={PIXEL[pixel]} />))}
  </svg>;
}

// "A bug lost in the lab": the beetle crawling on the Azure Static Web Apps CLI card opens the real circuit of PR #555.
// Two faulty parts in the generated Next.js configuration are swapped for the merged fix; nothing on the page breaks.
export function LostBug({ copy }: { copy: MarteCopy["bug"] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);
  const [fixed, setFixed] = useState<string[]>([]);
  const done = fixed.length === SWA_BUG.parts.length;

  const open = () => { setFixed([]); play("bug"); if (dialog.current && !dialog.current.open) dialog.current.showModal(); };
  useEffect(() => {
    setReady(true);
    return onEgg("lost-bug", () => void bringIntoView(button.current).then(open));
  }, []);
  useEffect(() => { if (done) { discover("lost-bug"); play("success"); buzz([30, 40, 60]); } }, [done]);
  const swap = (key: string) => { setFixed((current) => current.includes(key) ? current : [...current, key]); play("switch"); };

  return <>
    <button ref={button} type="button" className="lost-bug" onPointerEnter={() => play("bug")} onFocus={() => play("bug")} hidden={!ready} aria-label={copy.label} title={copy.label} onClick={open}><Beetle /></button>
    <noscript><p className="lost-bug__fallback">{copy.fallback} <a href={SWA_BUG.pr} target="_blank" rel="noopener noreferrer">{copy.source}</a></p></noscript>
    <dialog ref={dialog} className="mars-dialog circuit" aria-labelledby="circuit-title" data-done={done || undefined} onClose={() => button.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <p className="mars-dialog__title" id="circuit-title"><Beetle />{copy.title}</p>
      <p className="mars-dialog__note">{copy.intro}</p>
      <ol className="circuit__board">
        <li className="circuit__node"><b>{copy.input}</b><code>{SWA_BUG.input}</code><small>Next.js</small></li>
        <li className="circuit__wire" aria-hidden="true" />
        <li className="circuit__node"><b>{copy.process}</b><code>frameworks.ts</code><small>{SWA_BUG.process}</small></li>
        <li className="circuit__wire" aria-hidden="true" />
        <li className="circuit__node circuit__node--output"><b>{copy.output}</b>
          {SWA_BUG.parts.map((part) => {
            const ok = fixed.includes(part.key);
            return <span key={part.key} className="circuit__part" data-ok={ok || undefined}>
              <code>{part.key}:</code>
              {ok ? <code className="circuit__value circuit__value--ok">&quot;{part.fixed}&quot;</code>
                : <button type="button" className="circuit__value circuit__value--broken" onClick={() => swap(part.key)} aria-label={`${part.key}: "${part.broken}", ${copy.broken}. ${copy.pick} "${part.fixed}"`}>&quot;{part.broken}&quot; <small aria-hidden="true">{copy.pick} &quot;{part.fixed}&quot;</small></button>}
            </span>;
          })}
        </li>
      </ol>
      <p className="circuit__result" role="status">{done && <>{copy.fixed} <a href={SWA_BUG.pr} target="_blank" rel="noopener noreferrer">{copy.source} <span aria-hidden="true">↗</span></a></>}</p>
      <div className="mars-dialog__actions"><button type="button" autoFocus onClick={() => dialog.current?.close()}>{copy.close}</button></div>
    </dialog>
  </>;
}
