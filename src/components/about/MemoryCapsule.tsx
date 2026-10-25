"use client";

import { useEffect, useRef } from "react";
import type { NiveoraCopy } from "@/i18n/niveora";

export const CAPSULE_OPEN = "niveora:capsule";
export const CAPSULE_CLOSED = "niveora:capsule-closed";
export type CapsuleRecord = { label: string; title: string; detail: string; source: string };

// The memory capsule: real career records thawing out of the ice, each with its source.
export function MemoryCapsule({ records, copy, art }: { records: CapsuleRecord[]; copy: NiveoraCopy["capsule"]; art: string }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const open = () => { if (!dialog.current?.open) dialog.current?.showModal(); };
    addEventListener(CAPSULE_OPEN, open);
    return () => removeEventListener(CAPSULE_OPEN, open);
  }, []);

  return <dialog ref={dialog} className="capsule" aria-labelledby="capsule-title" onClose={() => dispatchEvent(new Event(CAPSULE_CLOSED))} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <div className="capsule__art" aria-hidden="true"><i style={{ backgroundImage: `url(${art})` }} /><span className="capsule__light" /></div>
    <div className="capsule__panel">
      <h2 id="capsule-title">{copy.title}</h2>
      <p className="capsule__intro">{copy.intro}</p>
      <ol className="capsule__records">{records.map((record, index) => <li key={record.label} style={{ animationDelay: `${.25 + index * .18}s` }}>
        <span className="capsule__label">{record.label}</span>
        <b>{record.title}</b>
        <span className="capsule__detail">{record.detail}</span>
        <a href={record.source} target="_blank" rel="noopener noreferrer">{copy.source}<span aria-hidden="true"> ↗</span></a>
      </li>)}</ol>
      <button type="button" className="capsule__close" autoFocus onClick={() => dialog.current?.close()}>{copy.close}</button>
    </div>
  </dialog>;
}
