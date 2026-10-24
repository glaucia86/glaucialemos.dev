"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { motionAllowed, useMotionEnabled } from "@/lib/use-motion";
import { play } from "@/lib/sfx";
import { bringIntoView, buzz, discover, emitEgg, matchTail, normalizePhrase, onEgg } from "@/lib/eggs";
import type { EchoCopy } from "@/i18n/echo-base";
import { isInside, isNear, isSceneClick } from "./hit";
import { freeze } from "./ice";
import { THREEPIO_EVENT, type ThreepioReaction } from "./Threepio";
import { PixelSprite, PROBE, TAUNTAUN_A, TAUNTAUN_B, spriteMarkup } from "./sprites";
import { leiaShoot } from "./LeiaActor";

const IDLE_MS = 5000;
const HOLD_MS = 600;
const STORM_MS = 10000;
const FROZEN = ".dossier-card__frame, .dossier-copy .char-sheet, .dossier-stats, .medal-list > li, .ops-chart";
const TAUNTAUN = spriteMarkup(TAUNTAUN_A, "echo-tauntaun__frame echo-tauntaun__frame--a") + spriteMarkup(TAUNTAUN_B, "echo-tauntaun__frame echo-tauntaun__frame--b");
const react = (kind: ThreepioReaction) => window.dispatchEvent(new CustomEvent(THREEPIO_EVENT, { detail: kind }));
const coarse = () => matchMedia("(pointer: coarse)").matches;

// Echo Base Easter eggs. Every trigger (keyboard, touch gesture, Comlink) emits an egg id; the handlers here play it.
// Typed phrases and dialogs work for everyone; purely visual gags need motion.
export function EchoEggs({ copy }: { copy: EchoCopy["eggs"] }) {
  const motion = useMotionEnabled();
  const dialog = useRef<HTMLDialogElement>(null);
  const holding = useRef(false);
  const [toast, setToast] = useState<{ text: string; sign?: string; id: number } | null>(null);
  const say = useCallback((text: string, sign?: string) => setToast({ text, sign, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(id);
  }, [toast]);

  // Triggers and the effects that do not depend on motion.
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".about-page");
    const hero = page?.querySelector<HTMLElement>("[data-echo-hero]");
    if (!page || !hero) return;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (run: () => void, ms: number) => { const id = setTimeout(() => { timers.delete(id); run(); }, ms); timers.add(id); return id; };
    let thaw: (() => void) | undefined;

    const holo = () => { if (dialog.current && !dialog.current.open) { dialog.current.showModal(); play("holo"); discover("holo"); } };
    const iKnow = () => { say(copy.iKnow, copy.iKnowSign); play("blip"); discover("iknow"); };
    const blizzard = () => {
      if (!motionAllowed() || page.dataset.blizzard === "true") return;
      discover("blizzard"); page.dataset.blizzard = "true"; say(copy.blizzard); react("doomed"); buzz([60, 80, 60]);
      [0, 700, 1500, 2600].forEach((delay) => later(() => play("wind"), delay));
      // Cards freeze while the storm rages and wait to be broken in three hits each.
      later(() => {
        const targets = [...page.querySelectorAll<HTMLElement>(FROZEN)].filter((target) => !target.classList.contains("is-frozen"));
        if (!targets.length) return;
        thaw?.();
        thaw = freeze(targets, {
          label: (left) => copy.iceLabel.replace("{n}", String(left)),
          onBreak: (broken, total) => say(copy.iceCount.replace("{n}", String(broken)).replace("{total}", String(total))),
          onClear: () => {
            discover("ice"); say(copy.iceDone); react("relief"); play("success");
            hero.dataset.warmth = String(Number(hero.dataset.warmth ?? 0) + 10);
            hero.dispatchEvent(new Event("echo:warm"));
            page.dataset.thaw = "true"; later(() => delete page.dataset.thaw, 5000);
          },
        });
      }, 2500);
      later(() => { page.dataset.blizzard = "ending"; later(() => delete page.dataset.blizzard, 1600); }, STORM_MS);
    };
    const stopEggs = [
      onEgg("holo", holo), onEgg("iknow", iKnow), onEgg("blizzard", blizzard),
      onEgg("ice", () => emitEgg("blizzard")),
    ];

    // Typing straight onto the page.
    let buffer = "";
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
      if ((event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true']")) return;
      buffer = (buffer + normalizePhrase(event.key)).slice(-12);
      const id = matchTail(buffer, ["holo", "iknow", "blizzard"]);
      if (id) { buffer = ""; emitEgg(id); }
    };
    addEventListener("keydown", onKey);

    // Touch-friendly twins: hold Leia, tap the thermometer three times, double-tap the dossier title.
    const leia = hero.querySelector(".echo-leia");
    let hold: ReturnType<typeof setTimeout> | undefined; let start: { x: number; y: number } | null = null;
    const cancelHold = () => { clearTimeout(hold); start = null; hero.removeAttribute("data-holding"); };
    const down = (event: PointerEvent) => {
      holding.current = false;
      if (!isSceneClick(event) || !isInside(leia, event, coarse() ? 16 : 0)) return;
      start = { x: event.clientX, y: event.clientY }; hero.dataset.holding = "leia";
      hold = setTimeout(() => { holding.current = true; cancelHold(); buzz(25); emitEgg("holo"); }, HOLD_MS);
    };
    const move = (event: PointerEvent) => { if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) cancelHold(); };
    const noMenu = (event: Event) => { if (start || holding.current) event.preventDefault(); };
    hero.addEventListener("pointerdown", down);
    hero.addEventListener("pointermove", move, { passive: true });
    ["pointerup", "pointercancel", "pointerleave"].forEach((type) => hero.addEventListener(type, cancelHold));
    hero.addEventListener("contextmenu", noMenu);

    const taps = (element: Element | null | undefined, count: number, windowMs: number, run: () => void) => {
      let times: number[] = [];
      const tap = () => {
        const now = performance.now();
        times = [...times.filter((time) => now - time < windowMs), now];
        if (times.length >= count) { times = []; run(); }
      };
      element?.addEventListener("click", tap);
      return () => element?.removeEventListener("click", tap);
    };
    const stopTaps = [
      taps(hero.querySelector(".echo-hud__readout"), 3, 1400, () => emitEgg("blizzard")),
      taps(page.querySelector("#dossier-title"), 2, 450, () => emitEgg("iknow")),
    ];

    return () => {
      stopEggs.forEach((stop) => stop()); stopTaps.forEach((stop) => stop());
      removeEventListener("keydown", onKey);
      hero.removeEventListener("pointerdown", down); hero.removeEventListener("pointermove", move);
      ["pointerup", "pointercancel", "pointerleave"].forEach((type) => hero.removeEventListener(type, cancelHold));
      hero.removeEventListener("contextmenu", noMenu);
      cancelHold(); timers.forEach(clearTimeout); thaw?.();
      delete page.dataset.blizzard; delete page.dataset.thaw;
    };
  }, [copy, say]);

  // Scene gags: tauntaun, probe self-destruct, frost wiping and settling snow.
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".about-page");
    const hero = page?.querySelector<HTMLElement>("[data-echo-hero]");
    if (!motion || !page || !hero) return;
    const probe = hero.querySelector<HTMLElement>(".echo-probe");
    const beacon = hero.querySelector<HTMLElement>(".echo-beacon");
    const frost = hero.querySelector<HTMLElement>(".echo-frost");
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (run: () => void, ms: number) => { const id = setTimeout(() => { timers.delete(id); run(); }, ms); timers.add(id); };
    const local = (event: { clientX: number; clientY: number }) => { const box = hero.getBoundingClientRect(); return { x: event.clientX - box.left, y: event.clientY - box.top }; };
    let runs = 0;

    const explode = (at: { x: number; y: number }) => {
      const flash = Object.assign(document.createElement("span"), { className: "echo-blast" });
      flash.style.cssText = `left:${at.x}px;top:${at.y}px`;
      hero.append(flash);
      gsap.fromTo(flash, { scale: .2, autoAlpha: 1 }, { scale: 3, autoAlpha: 0, duration: .5, ease: "power2.out", onComplete: () => flash.remove() });
      for (let index = 0; index < 18; index++) {
        const bit = Object.assign(document.createElement("span"), { className: index % 3 ? "echo-debris" : "echo-debris echo-debris--hot" });
        bit.style.cssText = `left:${at.x}px;top:${at.y}px`;
        hero.append(bit);
        const angle = Math.random() * Math.PI * 2; const distance = gsap.utils.random(40, 140);
        gsap.to(bit, { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance + 30, autoAlpha: 0, duration: gsap.utils.random(.5, .9), ease: "power2.out", onComplete: () => bit.remove() });
      }
    };

    // Leia shoots it down (LeiaActor); the blast lands where the probe is when the bolt arrives.
    let cancelShot: (() => void) | undefined;
    const destroyProbe = () => {
      if (!probe || probe.dataset.destroyed || probe.dataset.targeted) return;
      cancelShot = leiaShoot(hero, probe, () => {
        const box = probe.getBoundingClientRect(); const origin = hero.getBoundingClientRect();
        explode({ x: box.left + box.width / 2 - origin.left, y: box.top + box.height / 2 - origin.top });
        probe.dataset.destroyed = "true"; play("probe"); say(copy.probe); buzz([40, 30, 80]); discover("probe"); react("maker");
        hero.dataset.warmth = String(Number(hero.dataset.warmth ?? 0) + 1);
        hero.dispatchEvent(new Event("echo:warm"));
        gsap.fromTo(hero, { x: 0 }, { keyframes: { x: [-4, 4, -2, 0] }, duration: .3, ease: "none" });
        later(() => delete probe.dataset.destroyed, 25000);
      });
    };

    const tauntaun = (y: number) => {
      runs++; discover("tauntaun");
      const rider = Object.assign(document.createElement("span"), { className: "echo-tauntaun", innerHTML: TAUNTAUN });
      rider.setAttribute("aria-hidden", "true");
      rider.style.top = `${Math.min(Math.max(y, hero.clientHeight * .55), hero.clientHeight * .9)}px`;
      hero.append(rider);
      play("tauntaun");
      const width = hero.clientWidth;
      const run = gsap.timeline({ onComplete: () => rider.remove() }).fromTo(rider, { x: -80 }, { x: width + 80, duration: 3.2, ease: "none" });
      if (runs % 3 === 0) {
        run.clear().fromTo(rider, { x: -80 }, { x: width * .55, duration: 1.6, ease: "none" })
          .to(rider, { rotation: 90, y: 18, duration: .25, ease: "power2.in" })
          .call(() => { rider.classList.add("is-down"); say(copy.tauntaun); })
          .to(rider, { autoAlpha: 0, duration: .4, delay: 1.4 });
      }
    };

    const click = (event: MouseEvent) => {
      if (holding.current) { holding.current = false; return; }
      if (!isSceneClick(event)) return;
      if (isNear(probe, event, 2.2, coarse() ? 70 : 36) && !probe?.dataset.destroyed) destroyProbe();
      else if (!isNear(beacon, event, 5)) tauntaun(local(event).y);
    };
    hero.addEventListener("click", click);
    const stopEggs = [
      onEgg("probe", () => void bringIntoView(hero).then(() => { if (probe?.dataset.destroyed) delete probe.dataset.destroyed; destroyProbe(); })),
      onEgg("tauntaun", () => void bringIntoView(hero).then(() => tauntaun(hero.clientHeight * .8))),
    ];

    // Frost clears where the cursor or the finger passes.
    const wipe = (event: PointerEvent) => {
      if (!frost || (event.pointerType === "touch" && !event.isPrimary)) return;
      const { x, y } = local(event);
      frost.style.setProperty("--fx", `${x}px`); frost.style.setProperty("--fy", `${y}px`);
    };
    const unwipe = () => { frost?.style.removeProperty("--fx"); frost?.style.removeProperty("--fy"); };
    hero.addEventListener("pointermove", wipe, { passive: true }); hero.addEventListener("pointerleave", unwipe);

    // Stay still and the snow piles up at the bottom of the screen and on the cards; any movement shakes it off.
    let idle: ReturnType<typeof setTimeout> | undefined;
    let lastY = scrollY;
    let graceUntil = 0;
    const settle = () => { page.dataset.settled = "true"; discover("settle"); };
    const wake = () => {
      if (performance.now() < graceUntil) return;
      if (page.dataset.settled) {
        delete page.dataset.settled;
        page.querySelectorAll<HTMLElement>(".snowcap").forEach((cap) => {
          const box = cap.getBoundingClientRect();
          if (box.bottom < 0 || box.top > innerHeight) return;
          for (let index = 0; index < 6; index++) {
            const flake = Object.assign(document.createElement("span"), { className: "echo-flake" });
            flake.style.cssText = `left:${box.left + Math.random() * box.width}px;top:${box.top}px`;
            document.body.append(flake);
            gsap.to(flake, { y: gsap.utils.random(40, 120), x: gsap.utils.random(-20, 20), autoAlpha: 0, duration: gsap.utils.random(.6, 1.1), ease: "power1.in", onComplete: () => flake.remove() });
          }
        });
      }
      clearTimeout(idle); idle = setTimeout(settle, IDLE_MS);
    };
    const onScroll = () => { if (Math.abs(scrollY - lastY) > 2) { lastY = scrollY; wake(); } };
    const activity = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel"] as const;
    activity.forEach((type) => addEventListener(type, wake, { passive: true }));
    addEventListener("scroll", onScroll, { passive: true });
    stopEggs.push(onEgg("settle", () => { graceUntil = performance.now() + 2500; settle(); }));
    wake();

    return () => {
      stopEggs.forEach((stop) => stop());
      hero.removeEventListener("click", click);
      hero.removeEventListener("pointermove", wipe); hero.removeEventListener("pointerleave", unwipe); unwipe();
      activity.forEach((type) => removeEventListener(type, wake)); removeEventListener("scroll", onScroll);
      clearTimeout(idle); timers.forEach(clearTimeout); cancelShot?.();
      delete page.dataset.settled; if (probe) delete probe.dataset.destroyed; delete hero.dataset.warmth;
      hero.querySelectorAll(".echo-tauntaun, .echo-blast, .echo-debris, .echo-laser, .echo-muzzle").forEach((node) => node.remove());
    };
  }, [motion, copy, say]);

  return <>
    <dialog ref={dialog} className="echo-holo" aria-labelledby="echo-holo-title" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="echo-holo__projection" aria-hidden="true"><span className="echo-holo__figure" /><span className="echo-holo__beam" /></div>
      <p className="echo-holo__title" id="echo-holo-title">{copy.holoTitle}</p>
      <p className="echo-holo__body">{copy.holoBody}</p>
      <button type="button" className="echo-holo__close" autoFocus onClick={() => dialog.current?.close()}>{copy.holoClose}</button>
    </dialog>
    <p className="echo-toast" role="status" aria-live="polite" data-show={toast ? "true" : undefined}>
      {toast && <span key={toast.id}>{toast.text}{toast.sign && <b> {toast.sign}</b>}</span>}
    </p>
    <div className="echo-blizzard" aria-hidden="true">
      <span className="echo-blizzard__fog" />
      <span className="echo-blizzard__streaks" />
      <span className="echo-blizzard__snow echo-blizzard__snow--far" />
      <span className="echo-blizzard__snow echo-blizzard__snow--mid" />
      <span className="echo-blizzard__snow echo-blizzard__snow--near" />
      <span className="echo-blizzard__frost" />
    </div>
    <div className="echo-drift" aria-hidden="true"><span className="echo-drift__back" /><span className="echo-drift__front" /></div>
    <div className="echo-scanner" aria-hidden="true"><span className="echo-probe__beam" /><PixelSprite {...PROBE} /></div>
  </>;
}
