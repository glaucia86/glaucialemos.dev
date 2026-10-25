"use client";

import { useEffect, useRef, useState } from "react";
import { FINE_POINTER } from "@/lib/gsap";
import { useMediaQuery, motionAllowed } from "@/lib/use-motion";
import { bringIntoView, buzz, discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import type { MarteCopy } from "@/i18n/marte";

const PIXEL = 4;
const BRUSH = 5;
const CLEAN_AT = .55;
const DUST = ["#743a31", "#8a4634", "#bd5632", "#d27a43", "#a8553a"];

type Props = { copy: MarteCopy["dust"]; repo: { nome: string; url: string; atualizado: string; linguagem: string | null }; locale: string };

// "Settled dust": the last panel of the valley is covered in dust. Wipe it with the pointer, tap it three times or press
// Enter, and it shows the archive's most recent push. Without JavaScript the panel is simply clean.
export function DustPanel({ copy, repo, locale }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"server" | "dusty" | "falling" | "clean">("server");
  const fine = useMediaQuery(FINE_POINTER);
  const dates = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  useEffect(() => { setState("dusty"); }, []);

  useEffect(() => {
    const element = canvas.current; const host = panel.current;
    if (state !== "dusty" || !element || !host) return;
    const context = element.getContext("2d");
    const width = Math.max(1, Math.round(host.clientWidth / PIXEL)); const height = Math.max(1, Math.round(host.clientHeight / PIXEL));
    element.width = width; element.height = height;
    const covered = new Uint8Array(width * height).fill(1);
    let left = width * height;
    let seed = 7;
    const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    if (context) for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      context.globalAlpha = .82 + next() * .18; context.fillStyle = DUST[Math.floor(next() * DUST.length)]; context.fillRect(x, y, 1, 1);
    }
    let taps = 0;
    const settle = () => { setState(motionAllowed() ? "falling" : "clean"); };
    const wipe = (cx: number, cy: number, radius: number) => {
      const before = left;
      for (let y = Math.max(0, cy - radius); y <= Math.min(height - 1, cy + radius); y++) for (let x = Math.max(0, cx - radius); x <= Math.min(width - 1, cx + radius); x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 > radius * radius || !covered[y * width + x]) continue;
        covered[y * width + x] = 0; left--; context?.clearRect(x, y, 1, 1);
      }
      if (left < before) play("brush", { detune: (Math.random() - .5) * 300 });
      if (left / (width * height) < 1 - CLEAN_AT) settle();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const box = element.getBoundingClientRect();
      wipe(Math.round((event.clientX - box.left) / PIXEL), Math.round((event.clientY - box.top) / PIXEL), BRUSH);
    };
    // Touch: each tap blows away a third of the dust, around the finger first.
    const tap = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      taps++; play("dust");
      if (taps >= 3) { settle(); return; }
      const box = element.getBoundingClientRect();
      wipe(Math.round((event.clientX - box.left) / PIXEL), Math.round((event.clientY - box.top) / PIXEL), Math.round(Math.max(width, height) * taps / 4));
    };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerdown", tap);
    return () => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerdown", tap); };
  }, [state]);

  useEffect(() => {
    if (state === "falling" || state === "clean") { discover("dust-fall"); play("dust"); buzz(30); }
    if (state !== "falling") return;
    const id = setTimeout(() => setState("clean"), 900);
    return () => clearTimeout(id);
  }, [state]);

  useEffect(() => onEgg("dust-fall", () => void bringIntoView(panel.current).then(() => setState((current) => current === "dusty" ? (motionAllowed() ? "falling" : "clean") : current))), []);

  const dusty = state === "dusty" || state === "falling";
  return <div ref={panel} className="dust-panel" data-state={state}>
    <div className="dust-panel__content" inert={state === "dusty" || undefined}>
      <p className="dust-panel__kicker">{copy.title}</p>
      <p className="dust-panel__name"><a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.nome}<span aria-hidden="true"> ↗</span></a></p>
      <p>{copy.body}</p>
      <p className="dust-panel__meta">{copy.pushed} {dates.format(new Date(`${repo.atualizado}T00:00:00Z`))}{repo.linguagem ? ` · ${repo.linguagem}` : ""}</p>
    </div>
    {dusty && <canvas ref={canvas} className="dust-panel__dust" aria-hidden="true" />}
    {/* Pointers wipe the canvas underneath (the label lets them through); keyboards and screen readers press it. */}
    {state === "dusty" && <button type="button" className="dust-panel__wipe" onClick={() => setState(motionAllowed() ? "falling" : "clean")}>
      <span>{copy.label}</span><small>{fine ? copy.fine : copy.touch}</small>
    </button>}
  </div>;
}
