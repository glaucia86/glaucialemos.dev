"use client";

import { gsap, ScrollTrigger, SplitText, useGSAP, FINE_POINTER, SCRAMBLE_CHARS } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { play } from "@/lib/sfx";

const enter = (trigger: Element, start = "top 82%") => ({ trigger, start, once: true });

// Saber line in the portrait's 864 × 1152 space, and where each bolt meets it.
const HILT = { x: 211, y: 583 };
const TIP = { x: 130, y: 123 };
const HITS = [.32, .58, .82];
const SVG_NS = "http://www.w3.org/2000/svg";

function svgElement(tag: string, attributes: Record<string, string | number>) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
  return element;
}

function spark(layer: SVGSVGElement, at: { x: number; y: number }) {
  const flash = svgElement("circle", { class: "jedi-spark__flash", cx: at.x, cy: at.y, r: 8 });
  layer.append(flash);
  gsap.to(flash, { attr: { r: 110 }, autoAlpha: 0, duration: .35, ease: "power2.out", onComplete: () => flash.remove() });
  for (let index = 0; index < 10; index++) {
    const angle = Math.random() * Math.PI * 2; const distance = gsap.utils.random(60, 170);
    const pixel = svgElement("rect", { class: index % 3 ? "jedi-spark" : "jedi-spark jedi-spark--hot", x: at.x - 9, y: at.y - 9, width: 18, height: 18 });
    layer.append(pixel);
    gsap.to(pixel, { attr: { x: at.x - 9 + Math.cos(angle) * distance, y: at.y - 9 + Math.sin(angle) * distance }, autoAlpha: 0, duration: gsap.utils.random(.3, .55), ease: "power2.out", onComplete: () => pixel.remove() });
  }
}

// Declarative chapter choreography: server markup opts in with data attributes.
export function HomeChoreography() {
  const motion = useMotionEnabled();
  const fine = useMediaQuery(FINE_POINTER);

  useGSAP(() => {
    const page = document.querySelector<HTMLElement>(".home-page");
    if (!page || !motion) return;
    const all = <T extends Element = HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector, page);
    const locale = document.documentElement.lang;
    const cleanups: (() => void)[] = [];

    all("[data-reveal='lines']").forEach((heading) => {
      SplitText.create(heading, { type: "lines", mask: "lines", linesClass: "reveal-line", autoSplit: true, onSplit: (split) =>
        gsap.from(split.lines, { yPercent: 110, duration: .9, stagger: .09, ease: "expo.out", scrollTrigger: enter(heading) }) });
    });
    all("[data-reveal='up']").forEach((element) => gsap.from(element, { y: 32, autoAlpha: 0, duration: .9, ease: "power3.out", scrollTrigger: enter(element) }));
    all("[data-reveal='stagger']").forEach((group) => gsap.from(group.children, { y: 48, autoAlpha: 0, duration: .8, stagger: .12, ease: "power3.out", scrollTrigger: enter(group) }));
    all("[data-scramble]").forEach((element) => gsap.to(element, { duration: 1, scrambleText: { text: "{original}", chars: SCRAMBLE_CHARS, speed: .6, revealDelay: .2 }, scrollTrigger: enter(element, "top 88%") }));
    all("[data-count]").forEach((element) => {
      const target = Number(element.dataset.count); const counter = { value: 0 }; const format = new Intl.NumberFormat(locale);
      gsap.to(counter, { value: target, duration: 1.6, ease: "power2.out", scrollTrigger: enter(element, "top 92%"), onUpdate: () => { element.textContent = format.format(Math.round(counter.value)); } });
      cleanups.push(() => { element.textContent = format.format(target); });
    });
    all("[data-scramble-hover]").forEach((element) => {
      const text = element.textContent ?? "";
      const run = () => { if (!gsap.isTweening(element)) gsap.to(element, { duration: .6, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: .9 } }); };
      const host = element.closest("article") ?? element;
      host.addEventListener("pointerenter", run); element.addEventListener("focus", run);
      cleanups.push(() => { host.removeEventListener("pointerenter", run); element.removeEventListener("focus", run); });
    });

    // Episode II: the saber ignites from the hilt the first time the card is seen.
    const blade = page.querySelector(".holo-card .jedi-blade");
    const ignition = blade && gsap.timeline({ scrollTrigger: enter(blade, "top 70%"), onComplete: () => blade.classList.add("is-lit") })
      .set(blade, { autoAlpha: 1 })
      .call(() => play("saber"))
      .fromTo(blade.querySelectorAll("path"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: .55, ease: "power4.out", stagger: .03 });

    // Episode II action: blaster bolts fly in and the saber deflects each one.
    const card = page.querySelector<HTMLElement>(".holo-card");
    const bolts = card?.querySelector<SVGSVGElement>(".jedi-bolts");
    const deflectButton = card?.querySelector<HTMLButtonElement>(".jedi-deflect");
    if (blade && ignition && card && bolts && deflectButton) {
      const frame = card.querySelector(".holo-card__frame");
      const halo = blade.querySelector(".jedi-blade__halo");
      let volley: gsap.core.Timeline | null = null;
      const deflect = () => {
        if (volley?.isActive()) return;
        if (ignition.progress() < 1) ignition.progress(1);
        volley = gsap.timeline();
        HITS.forEach((t, index) => {
          const hit = { x: HILT.x + (TIP.x - HILT.x) * t, y: HILT.y + (TIP.y - HILT.y) * t };
          const from = { x: 940, y: hit.y + gsap.utils.random(-140, 140) };
          const to = { x: hit.x + gsap.utils.random(120, 420) * (Math.random() > .5 ? 1 : -1), y: hit.y - gsap.utils.random(260, 520) };
          const bolt = svgElement("g", { class: "jedi-bolt" });
          bolt.append(svgElement("rect", { x: -64, y: -12, width: 128, height: 24 }), svgElement("rect", { class: "jedi-bolt__core", x: -52, y: -5, width: 104, height: 10 }));
          bolts.append(bolt);
          const position = { ...from };
          const place = (target: { x: number; y: number }) => () => bolt.setAttribute("transform", `translate(${position.x} ${position.y}) rotate(${Math.atan2(target.y - position.y, target.x - position.x) * 180 / Math.PI})`);
          place(hit)();
          const start = index * .3;
          volley!
            .set(bolt, { autoAlpha: 1 }, start)
            .to(position, { ...hit, duration: .3, ease: "none", onUpdate: place(hit) }, start)
            .call(() => spark(bolts, hit), undefined, start + .3)
            .call(() => play("deflect"), undefined, start + .3)
            .fromTo(halo, { strokeWidth: 90 }, { strokeWidth: 44, duration: .35, ease: "power2.out", immediateRender: false }, start + .3)
            .fromTo(frame, { x: 0 }, { keyframes: { x: [-6, 3, 0] }, duration: .22, ease: "none", immediateRender: false }, start + .3)
            .to(position, { ...to, duration: .45, ease: "power1.out", onUpdate: place(to) }, start + .3)
            .to(bolt, { autoAlpha: 0, duration: .2 }, start + .55)
            .call(() => bolt.remove(), undefined, start + .75);
        });
      };
      const fromCard = (event: Event) => { if (!(event.target as Element).closest("a, button")) deflect(); };
      deflectButton.hidden = false;
      deflectButton.addEventListener("click", deflect);
      frame?.addEventListener("click", fromCard);
      cleanups.push(() => { deflectButton.hidden = true; deflectButton.removeEventListener("click", deflect); frame?.removeEventListener("click", fromCard); volley?.kill(); bolts.replaceChildren(); });
    }
    const route = page.querySelector<HTMLElement>("[data-route]");
    if (route) {
      const stops = gsap.utils.toArray<HTMLElement>(".route__stop", route);
      gsap.fromTo(route.querySelector(".route__trail"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", ease: "none", scrollTrigger: {
        trigger: route, start: "top 75%", end: "bottom 55%", scrub: .6,
        onUpdate: ({ progress }) => stops.forEach((stop, index) => { stop.dataset.lit = String(progress >= index / Math.max(1, stops.length - 1) - .02); }),
      } });
      gsap.from(stops, { y: 40, autoAlpha: 0, stagger: .15, duration: .8, ease: "power3.out", scrollTrigger: enter(route) });
    }

    // Short hyperspace cuts between chapters, scrubbed by the scroll.
    all("[data-jump]").forEach((jump) => {
      gsap.timeline({ scrollTrigger: { trigger: jump, start: "top bottom", end: "bottom top", scrub: .4 } })
        .fromTo(jump.querySelectorAll(".chapter-jump__streaks i"), { scaleX: .05, xPercent: -60 }, { scaleX: 1, xPercent: 60, stagger: .02, ease: "power2.in" }, 0)
        .fromTo(jump.querySelector(".chapter-jump__label"), { letterSpacing: ".1em", autoAlpha: 0 }, { letterSpacing: ".5em", autoAlpha: 1, ease: "power1.inOut", duration: .5 }, 0);
    });

    all(".chapter--credits .credits").forEach((credits) => gsap.from(credits, { scale: .92, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: enter(credits, "top 85%") }));

    if (fine) {
      all("[data-tilt]").forEach((card) => {
        const rotateX = gsap.quickTo(card, "rotationX", { duration: .5, ease: "power3" });
        const rotateY = gsap.quickTo(card, "rotationY", { duration: .5, ease: "power3" });
        gsap.set(card, { transformPerspective: 900 });
        const move = (event: PointerEvent) => {
          const box = card.getBoundingClientRect();
          const x = (event.clientX - box.left) / box.width; const y = (event.clientY - box.top) / box.height;
          rotateY((x - .5) * 12); rotateX((.5 - y) * 10);
          card.style.setProperty("--mx", `${x * 100}%`); card.style.setProperty("--my", `${y * 100}%`);
        };
        const leave = () => { rotateX(0); rotateY(0); };
        card.addEventListener("pointermove", move); card.addEventListener("pointerleave", leave);
        cleanups.push(() => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", leave); });
      });
      all(".mission").forEach((card) => {
        const move = (event: PointerEvent) => { const box = card.getBoundingClientRect(); card.style.setProperty("--mx", `${event.clientX - box.left}px`); card.style.setProperty("--my", `${event.clientY - box.top}px`); };
        const ignite = () => play("saber");
        card.addEventListener("pointermove", move); card.addEventListener("pointerenter", ignite);
        cleanups.push(() => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerenter", ignite); });
      });
    }
    requestAnimationFrame(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, { dependencies: [motion, fine], revertOnUpdate: true });

  return null;
}
