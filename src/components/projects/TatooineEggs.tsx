"use client";

import { useEffect, useRef, useState } from "react";
import { motionAllowed } from "@/lib/use-motion";
import { play } from "@/lib/sfx";
import { bringIntoView, buzz, discover, eggsFor, emitEgg, matchTail, normalizePhrase, onEgg, type EggId } from "@/lib/eggs";
import type { TatooineCopy } from "@/i18n/tatooine";
import { PixelSprite } from "@/components/about/sprites";
import { OBIWAN } from "./sprites";
import { SAY_EVENT, say, type Line } from "./toast";

const HOLD_MS = 600;
const STORM_MS = 9000;
const ZAP_AT = 5;
const PAGE_EGGS = eggsFor("projects").filter((egg) => egg.page === "projects").map((egg) => egg.id) as EggId[];

type CardLine = { label?: string; value: string; color?: string };
// The real card from github.com/glaucia86/glaucia_lemos86 (bin/card.js, 2018), then today's version.
const CARD_2018: CardLine[] = [
  { value: "Glaucia Lemos / glaucia_lemos86" }, { value: "" },
  { label: "Open Source", value: "Node.Js Foundation | React Community", color: "#80ff80" },
  { label: "Work", value: "Regional Cloud Developer at Microsoft", color: "#ff4040" },
  { label: "Twitter", value: "https://twitter.com/glaucia_lemos86", color: "#6b6bff" },
  { label: "GitHub", value: "https://github.com/glaucia86", color: "#fdf505" },
  { label: "LinkedIn", value: "https://www.linkedin.com/in/glaucialemos/", color: "#00ffff" },
  { label: "Youtube", value: "https://www.youtube.com/user/l32759", color: "#ff1919" },
  { label: "Instagram", value: "https://www.instagram.com/glaucia.lemos.dev/", color: "#bfffb3" },
  { label: "Medium", value: "https://medium.com/@glaucia86", color: "#b07a3c" },
  { label: "Web", value: "https://code4coders.wordpress.com/", color: "#ff884d" },
  { value: "" }, { label: "Card", value: "npx glaucia_lemos86", color: "#f00df0" },
];
const CARD_2026: CardLine[] = [
  { value: "Glaucia Lemos / glaucia_lemos86" }, { value: "" },
  { label: "Work", value: "Principal Software Engineer · AI Transformation Lead @ Itaú", color: "#ff4040" },
  { label: "Badges", value: "Microsoft MVP · OpenAI Codex Ambassador · Devin Ambassador", color: "#80ff80" },
  { label: "Book", value: "Packt co-author", color: "#ff884d" },
  { label: "YouTube", value: "https://www.youtube.com/@GlauciaLemos", color: "#ff1919" },
  { label: "X", value: "https://x.com/glaucia_lemos86", color: "#6b6bff" },
  { label: "LinkedIn", value: "https://www.linkedin.com/in/glaucialemos", color: "#00ffff" },
  { label: "GitHub", value: "https://github.com/glaucia86", color: "#fdf505" },
  { label: "Instagram", value: "https://www.instagram.com/glaucia.lemos.dev", color: "#bfffb3" },
  { value: "" }, { label: "Card", value: "npx glaucia_lemos86", color: "#f00df0" },
];
const LABEL = 11;
const linesOf = (year: 2018 | 2026) => year === 2018 ? CARD_2018 : CARD_2026;
const startCard = (year: 2018 | 2026) => ({ year, shown: motionAllowed() ? 1 : linesOf(year).length });

function TerminalCard({ lines, shown }: { lines: CardLine[]; shown: number }) {
  const width = Math.max(...lines.map((line) => (line.label ? LABEL + 2 : 0) + line.value.length)) + 4;
  const row = (line: CardLine, index: number) => {
    const text = (line.label ? `${line.label}:`.padStart(LABEL + 1) + " " : "") + line.value;
    return <span key={index}>║  {line.label && <b style={{ color: line.color }}>{`${line.label}:`.padStart(LABEL + 1)}</b>}{line.label ? " " + line.value : line.value}{" ".repeat(Math.max(0, width - 4 - text.length))}  ║{"\n"}</span>;
  };
  return <pre className="npx-card">{`╔${"═".repeat(width)}╗\n`}{lines.slice(0, shown).map(row)}{shown >= lines.length && `╚${"═".repeat(width)}╝`}</pre>;
}

// Station readout for "the plans": this site's own architecture, drawn like the Death Star schematics.
function Blueprint({ legend }: { legend: string[] }) {
  const nodes = [[200, 52], [304, 112], [300, 196], [200, 250], [98, 192], [102, 108]];
  return <svg className="blueprint" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
    <circle cx="200" cy="150" r="118" className="blueprint__hull" />
    <circle cx="200" cy="150" r="86" className="blueprint__ring" />
    <path d="M82 150h236" className="blueprint__trench" />
    <circle cx="150" cy="104" r="26" className="blueprint__dish" /><circle cx="150" cy="104" r="6" className="blueprint__dish" />
    {nodes.map(([x, y], index) => <g key={index} className="blueprint__node"><path d={`M200 150L${x} ${y}`} /><rect x={x - 9} y={y - 9} width="18" height="18" /><text x={x} y={y + 4}>{index + 1}</text></g>)}
    <rect x="226" y="146" width="8" height="8" className="blueprint__port" />
    <path d="M234 150h40v40" className="blueprint__callout" /><text x="278" y="204" className="blueprint__warning">⚠ {legend.length + 1}</text>
  </svg>;
}

export function TatooineEggs({ copy }: { copy: TatooineCopy["eggs"] }) {
  const npx = useRef<HTMLDialogElement>(null);
  const plans = useRef<HTMLDialogElement>(null);
  const [toast, setToast] = useState<(Line & { id: number }) | null>(null);
  const [card, setCard] = useState<{ year: 2018 | 2026; shown: number }>({ year: 2018, shown: 0 });
  const [kenobi, setKenobi] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    const onSay = (event: Event) => setToast({ ...(event as CustomEvent<Line>).detail, id: Date.now() });
    addEventListener(SAY_EVENT, onSay);
    return () => removeEventListener(SAY_EVENT, onSay);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(id);
  }, [toast]);

  // The npx card types itself line by line, like a terminal.
  useEffect(() => {
    const lines = linesOf(card.year);
    if (card.shown >= lines.length || card.shown === 0) return;
    const id = setTimeout(() => setCard((current) => ({ ...current, shown: current.shown + 1 })), 70);
    return () => clearTimeout(id);
  }, [card]);

  useEffect(() => {
    if (!kenobi) return;
    const id = setTimeout(() => setKenobi(kenobi === 1 ? 2 : 0), kenobi === 1 ? 1600 : 2600);
    if (kenobi === 2) play("blip");
    return () => clearTimeout(id);
  }, [kenobi]);

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".projects-page");
    const hero = page?.querySelector<HTMLElement>("[data-tatooine-hero]");
    if (!page || !hero) return;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (run: () => void, ms: number) => { const id = setTimeout(() => { timers.delete(id); run(); }, ms); timers.add(id); };
    const listeners: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(element: Element | null | undefined, type: K, run: (event: HTMLElementEventMap[K]) => void) => {
      if (!element) return;
      element.addEventListener(type, run as EventListener);
      listeners.push(() => element.removeEventListener(type, run as EventListener));
    };
    const r2 = hero.querySelector<HTMLButtonElement>(".tatooine-hot--r2");
    const terminal = page.querySelector<HTMLButtonElement>("[data-npx]");
    const revealed = [...hero.querySelectorAll<HTMLButtonElement>(".tatooine-hot"), terminal].filter(Boolean) as HTMLButtonElement[];
    revealed.forEach((button) => { button.hidden = false; });

    // npx holocron.
    const openCard = () => { if (npx.current && !npx.current.open) { npx.current.showModal(); setCard(startCard(2018)); play("key"); discover("npx"); } };
    on(terminal, "click", () => emitEgg("npx"));

    // R2: tap to beep, the fifth tap zaps him; hold to project the plans.
    let beeps = 0; let held = false; let hold: ReturnType<typeof setTimeout> | undefined;
    const zap = () => {
      beeps = 0; play("zap"); buzz([50, 40, 90]); discover("artoo"); say(copy.artoo.zap);
      if (motionAllowed()) { hero.dataset.zap = "true"; later(() => delete hero.dataset.zap, 1800); }
    };
    const beep = () => {
      if (held) { held = false; return; }
      beeps++;
      if (beeps >= ZAP_AT) return zap();
      play("r2"); say(copy.artoo.lines[(beeps - 1) % copy.artoo.lines.length]);
      if (motionAllowed()) { hero.dataset.beep = String(beeps % 2); later(() => delete hero.dataset.beep, 500); }
    };
    const showPlans = () => { if (plans.current && !plans.current.open) { plans.current.showModal(); play("holo"); discover("plans"); } };
    const cancelHold = () => { clearTimeout(hold); delete hero.dataset.projecting; };
    on(r2, "click", beep);
    on(r2, "pointerdown", () => { held = false; hero.dataset.projecting = "true"; hold = setTimeout(() => { held = true; cancelHold(); buzz(25); emitEgg("plans"); }, HOLD_MS); });
    (["pointerup", "pointerleave", "pointercancel"] as const).forEach((type) => on(r2, type, cancelHold));
    on(r2, "contextmenu", (event) => event.preventDefault());

    // Binary sunset: the first sun, then the second.
    let firstSun = 0;
    on(hero.querySelector(".tatooine-hot--sun-a"), "click", () => { firstSun = performance.now(); play("blip"); });
    on(hero.querySelector(".tatooine-hot--sun-b"), "click", () => { if (performance.now() - firstSun < 3000) { firstSun = 0; emitEgg("sunset"); } else play("blip"); });
    const sunset = () => {
      if (page.dataset.sunset) { delete page.dataset.sunset; return; }
      page.dataset.sunset = "true"; play("sunset"); discover("sunset"); say(copy.sunset.text, copy.sunset.sign);
    };

    // Utinni: Jawas sneak up on R2 (the theft itself happens in the archive).
    on(hero.querySelector(".tatooine-hot--crawler"), "click", () => emitEgg("utinni"));
    const jawas = () => {
      if (!motionAllowed()) return;
      const box = hero.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) return;
      hero.dataset.jawas = "true"; later(() => { hero.dataset.zap = "true"; play("zap"); }, 1100);
      later(() => { delete hero.dataset.jawas; delete hero.dataset.zap; }, 3200);
    };

    // Sand: three taps on the dunes, then sweep it off with the pointer.
    const storm = page.querySelector<HTMLElement>(".tatooine-storm");
    let sandTaps: number[] = [];
    on(hero, "click", (event) => {
      if ((event.target as Element).closest("a, button, input, dialog, .tatooine-copy > *")) return;
      const now = performance.now();
      sandTaps = [...sandTaps.filter((time) => now - time < 1200), now];
      if (sandTaps.length >= 3) { sandTaps = []; emitEgg("sand"); }
    });
    const sand = () => {
      discover("sand"); say(copy.sand.text, copy.sand.sign); play("wind");
      if (!motionAllowed() || page.dataset.sandstorm) return;
      page.dataset.sandstorm = "true"; [700, 1600, 2600].forEach((delay) => later(() => play("wind"), delay));
      later(() => say(copy.sand.sweep), 4300);
      later(() => { page.dataset.sandstorm = "ending"; later(() => delete page.dataset.sandstorm, 1200); }, STORM_MS);
    };
    const sweep = (event: PointerEvent) => { if (!page.dataset.sandstorm || !storm) return; storm.style.setProperty("--sx", `${event.clientX}px`); storm.style.setProperty("--sy", `${event.clientY}px`); };
    addEventListener("pointermove", sweep, { passive: true });
    listeners.push(() => removeEventListener("pointermove", sweep));

    // Hello there: hold the market title.
    const title = page.querySelector("#archive-title");
    let titleHold: ReturnType<typeof setTimeout> | undefined;
    on(title, "pointerdown", () => { titleHold = setTimeout(() => { buzz(25); emitEgg("hellothere"); }, HOLD_MS); });
    (["pointerup", "pointerleave", "pointercancel"] as const).forEach((type) => on(title, type, () => clearTimeout(titleHold)));
    const hello = () => void bringIntoView(title).then(() => { setKenobi(1); play("holo"); discover("hellothere"); });

    // BB-8: a fast swipe across the dunes.
    const dunes = page.querySelector<HTMLElement>("[data-dunes]");
    let swipe: { x: number; t: number } | null = null;
    on(dunes, "pointerdown", (event) => { swipe = { x: event.clientX, t: performance.now() }; });
    on(dunes, "pointerup", (event) => { if (swipe && Math.abs(event.clientX - swipe.x) > 90 && performance.now() - swipe.t < 600) emitEgg("bb8"); swipe = null; });
    const roll = () => void bringIntoView(dunes).then(() => {
      discover("bb8"); play("r2"); say(copy.bb8);
      if (!dunes || !motionAllowed()) return;
      delete dunes.dataset.rolling; void dunes.offsetWidth; dunes.dataset.rolling = "true";
      later(() => delete dunes.dataset.rolling, 4200);
    });

    // Typing a phrase straight onto the page.
    let buffer = "";
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
      if ((event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true']")) return;
      buffer = (buffer + normalizePhrase(event.key)).slice(-20);
      const id = matchTail(buffer, PAGE_EGGS);
      if (id) { buffer = ""; emitEgg(id); }
    };
    addEventListener("keydown", onKey);

    const stops = [
      onEgg("npx", () => void bringIntoView(terminal).then(openCard)),
      onEgg("plans", showPlans),
      onEgg("artoo", () => void bringIntoView(hero).then(zap)),
      onEgg("sunset", () => void bringIntoView(hero).then(sunset)),
      onEgg("utinni", jawas),
      onEgg("sand", () => void bringIntoView(hero).then(sand)),
      onEgg("hellothere", hello),
      onEgg("bb8", roll),
    ];
    return () => {
      stops.forEach((stop) => stop()); listeners.forEach((stop) => stop());
      removeEventListener("keydown", onKey); timers.forEach(clearTimeout); clearTimeout(hold); clearTimeout(titleHold);
      revealed.forEach((button) => { button.hidden = true; });
      ["sunset", "sandstorm"].forEach((key) => delete page.dataset[key]);
      ["zap", "beep", "jawas", "projecting"].forEach((key) => delete hero.dataset[key]);
    };
  }, [copy]);

  const close = (dialog: React.RefObject<HTMLDialogElement | null>) => () => dialog.current?.close();
  const lines = linesOf(card.year);

  return <>
    <dialog ref={npx} className="tatooine-dialog npx-dialog" aria-labelledby="npx-title" onClick={(event) => { if (event.target === event.currentTarget) npx.current?.close(); }}>
      <p className="tatooine-dialog__title" id="npx-title"><span aria-hidden="true">$ </span>npx glaucia_lemos86 <small>· {card.year === 2018 ? copy.npx.title : "2026"}</small></p>
      <TerminalCard lines={lines} shown={card.shown} />
      {card.year === 2026 && card.shown >= lines.length && <p className="tatooine-dialog__note" role="status">{copy.npx.rebooted}</p>}
      <div className="tatooine-dialog__actions">
        {card.year === 2018 && <button type="button" onClick={() => { setCard(startCard(2026)); play("granted"); }}>{copy.npx.reboot}</button>}
        <button type="button" autoFocus onClick={close(npx)}>{copy.close}</button>
      </div>
    </dialog>
    <dialog ref={plans} className="tatooine-dialog plans-dialog" aria-labelledby="plans-title" onClick={(event) => { if (event.target === event.currentTarget) plans.current?.close(); }}>
      <p className="tatooine-dialog__title" id="plans-title">{copy.plans.title}</p>
      <p className="tatooine-dialog__note">{copy.plans.intro}</p>
      <Blueprint legend={copy.plans.legend} />
      <ol className="plans-legend">{copy.plans.legend.map((item) => <li key={item}>{item}</li>)}<li className="plans-legend__weak">{copy.plans.weak}</li></ol>
      <div className="tatooine-dialog__actions"><button type="button" autoFocus onClick={close(plans)}>{copy.close}</button></div>
    </dialog>
    <p className="tatooine-toast" role="status" aria-live="polite" data-show={toast ? "true" : undefined}>
      {toast && <span key={toast.id}>{toast.text}{toast.sign && <b> {toast.sign}</b>}</span>}
    </p>
    <div className="kenobi" data-show={kenobi || undefined} aria-live="polite">
      <PixelSprite className="kenobi__sprite" {...OBIWAN} />
      {kenobi > 0 && <p className="kenobi__bubble">{kenobi === 1 ? copy.hellothere.hello : <>{copy.hellothere.reply}</>}{kenobi === 1 && <b> {copy.hellothere.sign}</b>}</p>}
    </div>
    <div className="tatooine-storm" aria-hidden="true"><span className="tatooine-storm__haze" /><span className="tatooine-storm__grains tatooine-storm__grains--far" /><span className="tatooine-storm__grains tatooine-storm__grains--near" /></div>
  </>;
}

