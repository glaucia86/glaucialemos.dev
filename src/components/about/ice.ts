import { gsap } from "@/lib/gsap";
import { buzz } from "@/lib/eggs";
import { play } from "@/lib/sfx";
import { CARD_CRACKS, iceShards } from "./ice-geometry";

const HITS = 3;
const SHARDS = iceShards(4, 4, 100, 100);
const markup = `<svg class="ice-block__art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
<g class="ice-block__shards">${SHARDS.map((points) => `<polygon points="${points}"/>`).join("")}</g>
${CARD_CRACKS.map((d, index) => `<path class="ice-block__crack ice-block__crack--${index + 1}" d="${d}"/>`).join("")}
</svg>`;

type Options = { label: (left: number) => string; onBreak: (broken: number, total: number) => void; onClear: () => void; meltMs?: number };

// Freezes each target under an ice button that breaks in three hits (click, tap, Enter or Space).
// Unbroken ice melts on its own so the page never stays locked.
export function freeze(targets: HTMLElement[], { label, onBreak, onClear, meltMs = 45000 }: Options) {
  const total = targets.length;
  let broken = 0;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const blocks = targets.map((target, index) => {
    const block = document.createElement("div");
    block.className = "ice-block";
    block.setAttribute("role", "button");
    block.tabIndex = 0;
    block.innerHTML = markup;
    block.dataset.hits = "0";
    block.setAttribute("aria-label", label(HITS));
    target.classList.add("is-frozen");
    target.append(block);
    gsap.from(block, { autoAlpha: 0, scale: 1.06, duration: .5, delay: index * .18, ease: "power2.out" });

    const release = () => { block.remove(); target.classList.remove("is-frozen"); };
    const hit = (event: Event) => {
      event.preventDefault(); event.stopPropagation();
      if (block.dataset.melting || block.dataset.shattered) return;
      const hits = Number(block.dataset.hits) + 1;
      block.dataset.hits = String(hits);
      block.setAttribute("aria-label", label(HITS - hits));
      play("ice"); buzz(hits < HITS ? 18 : [20, 30, 40]);
      gsap.fromTo(block, { x: 0 }, { keyframes: { x: [-5, 5, -3, 0] }, duration: .22, ease: "none" });
      if (hits < HITS) return;
      broken += 1;
      gsap.to(block.querySelectorAll("polygon"), {
        x: () => gsap.utils.random(-60, 60), y: () => gsap.utils.random(20, 110), rotation: () => gsap.utils.random(-160, 160),
        autoAlpha: 0, transformOrigin: "50% 50%", duration: () => gsap.utils.random(.5, .9), ease: "power2.in", stagger: { each: .008, from: "random" },
      });
      gsap.to(block.querySelectorAll(".ice-block__crack"), { autoAlpha: 0, duration: .15 });
      block.dataset.shattered = "true";
      gsap.delayedCall(.9, release);
      onBreak(broken, total);
      if (broken === total) onClear();
    };
    block.addEventListener("click", hit);
    block.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") hit(event); });
    timers.push(setTimeout(() => {
      if (!block.isConnected) return;
      block.dataset.melting = "true";
      timers.push(setTimeout(release, 1600));
    }, meltMs + index * 180));
    return { block, release };
  });
  return () => { timers.forEach(clearTimeout); blocks.forEach(({ block, release }) => { gsap.killTweensOf(block); release(); }); };
}
