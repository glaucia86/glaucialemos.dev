"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { play } from "@/lib/sfx";
import { buzz } from "@/lib/eggs";
import type { NiveoraCopy } from "@/i18n/niveora";

export const FREEZE_EVENT = "niveora:freeze";
export const STORM_END_EVENT = "niveora:storm-end";
const TARGETS = ".log-card__frame, .log-copy .char-sheet, .log-stats, .badge-list > li, .ops-chart";
const HITS = 3;
const CELL = 4; // screen px per frost pixel
const CLEAR = .7; // share of frost scraped off that breaks the ice
const BRUSH = 5; // scraping radius, in frost pixels
const MELT_MS = 45000; // safety thaw after the storm
const CRACKS = ["M52 0 47 28 58 47 49 71 55 100M47 28 22 36", "M58 47 84 40 100 46M49 71 24 80 0 74M22 36 0 30M84 40 92 18"];

// Pixel frost: a light veil, brighter crystals and a thicker rim, so the card stays readable underneath.
function paintFrost(canvas: HTMLCanvasElement) {
  const width = Math.max(1, Math.round(canvas.clientWidth / CELL)); const height = Math.max(1, Math.round(canvas.clientHeight / CELL));
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return { width, height };
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const rim = Math.max(0, 1 - Math.min(x, y, width - 1 - x, height - 1 - y) / 6);
    const v = Math.random();
    context.fillStyle = v > .93 ? "rgba(255,255,255,.9)" : v > .72 ? `rgba(207,233,251,${.5 + rim * .3})` : `rgba(160,205,236,${.36 + rim * .35})`;
    context.fillRect(x, y, 1, 1);
  }
  // Feather-like crystals growing from the corners.
  context.fillStyle = "rgba(255,255,255,.85)";
  for (let branch = 0; branch < 10; branch++) {
    let x = branch % 2 ? 0 : width - 1; let y = Math.random() * height;
    const dx = branch % 2 ? 1 : -1;
    for (let step = 0; step < Math.min(width, 18); step++) { context.fillRect(Math.round(x), Math.round(y), 1, 1); if (step % 3 === 1) context.fillRect(Math.round(x), Math.round(y) - 1, 1, 1); x += dx; y += (Math.random() - .5) * 1.4; }
  }
  return { width, height };
}

// Cards freeze during the blizzard. On a computer the ice is scraped off with the cursor or broken with three clicks;
// on touch screens three taps break it; Enter works from the keyboard. Whatever is left melts on its own after a while.
export function FrozenCards({ copy }: { copy: NiveoraCopy["ice"] }) {
  const status = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".about-page");
    if (!page) return;
    const blocks = new Set<HTMLElement>();
    let melt: ReturnType<typeof setTimeout> | undefined;
    const coarse = () => matchMedia("(pointer: coarse)").matches;
    const announce = (text: string) => { if (status.current) status.current.textContent = text; };

    const release = (target: HTMLElement, block: HTMLElement) => { block.remove(); blocks.delete(block); target.classList.remove("is-frozen"); };
    const shatter = (target: HTMLElement, block: HTMLElement) => {
      if (block.dataset.shattered) return;
      block.dataset.shattered = "true";
      play("ice"); buzz([20, 30, 40]); announce(copy.done);
      for (let index = 0; index < 16; index++) {
        const shard = Object.assign(document.createElement("i"), { className: "ice-shard" });
        shard.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%`;
        block.append(shard);
        gsap.to(shard, { x: gsap.utils.random(-90, 90), y: gsap.utils.random(30, 160), rotation: gsap.utils.random(-180, 180), autoAlpha: 0, duration: gsap.utils.random(.5, .9), ease: "power2.in" });
      }
      gsap.to(block.querySelector(".ice-block__frost"), { autoAlpha: 0, duration: .25, ease: "steps(3)" });
      setTimeout(() => release(target, block), 950);
    };

    const freeze = (target: HTMLElement) => {
      if (target.classList.contains("is-frozen")) return;
      target.classList.add("is-frozen");
      const block = document.createElement("span");
      block.className = "ice-block";
      block.tabIndex = 0;
      block.setAttribute("role", "button");
      block.innerHTML = `<canvas class="ice-block__frost"></canvas><svg class="ice-block__cracks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${CRACKS.map((d, index) => `<path class="ice-block__crack ice-block__crack--${index + 1}" d="${d}"/>`).join("")}</svg><span class="ice-block__hint" aria-hidden="true"></span>`;
      target.append(block); blocks.add(block);
      const canvas = block.querySelector("canvas")!;
      const hint = block.querySelector<HTMLElement>(".ice-block__hint")!;
      hint.textContent = coarse() ? copy.touch : copy.desktop;
      const { width, height } = paintFrost(canvas);
      const context = canvas.getContext("2d");
      const cleared = new Uint8Array(width * height);
      let scraped = 0; let hits = 0;
      const label = () => block.setAttribute("aria-label", copy.label.replace("{n}", String(HITS - hits)));
      label();
      gsap.fromTo(block, { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, ease: "steps(6)" });

      const hit = () => {
        if (block.dataset.shattered) return;
        hits++; block.dataset.hits = String(hits); label();
        play("ice"); buzz(18);
        gsap.fromTo(target, { x: 0 }, { keyframes: { x: [-3, 3, -2, 0] }, duration: .2, ease: "none" });
        if (hits >= HITS) shatter(target, block);
      };
      // Scraping with a mouse or pen clears the frost where it passes.
      const scrape = (event: PointerEvent) => {
        if (event.pointerType === "touch" || block.dataset.shattered || !context) return;
        const box = canvas.getBoundingClientRect();
        const cx = Math.floor((event.clientX - box.left) / box.width * width); const cy = Math.floor((event.clientY - box.top) / box.height * height);
        for (let y = cy - BRUSH; y <= cy + BRUSH; y++) for (let x = cx - BRUSH; x <= cx + BRUSH; x++) {
          if (x < 0 || y < 0 || x >= width || y >= height || (x - cx) ** 2 + (y - cy) ** 2 > BRUSH * BRUSH || cleared[y * width + x]) continue;
          cleared[y * width + x] = 1; scraped++; context.clearRect(x, y, 1, 1);
        }
        hint.hidden = true;
        if (scraped / cleared.length >= CLEAR) shatter(target, block);
      };
      const key = (event: KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); hit(); } };
      block.addEventListener("click", hit);
      block.addEventListener("pointermove", scrape);
      block.addEventListener("keydown", key);
    };

    const onFreeze = () => { clearTimeout(melt); page.querySelectorAll<HTMLElement>(TARGETS).forEach(freeze); };
    // Safety: whatever is still frozen melts away some time after the storm.
    const onStormEnd = () => {
      clearTimeout(melt);
      melt = setTimeout(() => blocks.forEach((block) => {
        block.dataset.melting = "true";
        setTimeout(() => release(block.parentElement as HTMLElement, block), 1500);
      }), MELT_MS);
    };
    addEventListener(FREEZE_EVENT, onFreeze);
    addEventListener(STORM_END_EVENT, onStormEnd);
    return () => {
      removeEventListener(FREEZE_EVENT, onFreeze); removeEventListener(STORM_END_EVENT, onStormEnd);
      clearTimeout(melt);
      blocks.forEach((block) => release(block.parentElement as HTMLElement, block));
    };
  }, [copy]);

  return <p ref={status} className="sr-only" role="status" aria-live="polite" />;
}
