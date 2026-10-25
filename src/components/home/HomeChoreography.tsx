"use client";

import { gsap, ScrollTrigger, SplitText, useGSAP, FINE_POINTER, SCRAMBLE_CHARS } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { play } from "@/lib/sfx";

const enter = (trigger: Element, start = "top 82%") => ({ trigger, start, once: true });

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
      cleanups.push(() => { host.removeEventListener("pointerenter", run); element.removeEventListener("focus", run); gsap.killTweensOf(element); element.textContent = text; });
    });

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
        const ignite = () => play("twinkle");
        card.addEventListener("pointermove", move); card.addEventListener("pointerenter", ignite);
        cleanups.push(() => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerenter", ignite); });
      });
    }
    requestAnimationFrame(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, { dependencies: [motion, fine], revertOnUpdate: true });

  return null;
}
