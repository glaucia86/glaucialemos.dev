"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, FINE_POINTER } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { play, uiSound, setSoundWorld } from "@/lib/sfx";

const INTERACTIVE = "a, button, [role='button'], summary, select, label[for]";

// One delegated layer for the targeting cursor, magnetic controls and UI blips.
export function FxLayer() {
  const pathname = usePathname();
  const motion = useMotionEnabled();
  const fine = useMediaQuery(FINE_POINTER);
  const cursor = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLDivElement>(null);

  // Audio follows the page, including reduced motion. Do not put this behind the cursor's motion gate.
  useEffect(() => {
    let page: HTMLElement | null = null;
    let soundWorld: string | undefined;
    const intersection = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.target === page) setSoundWorld(page?.dataset.soundWorld, entry.isIntersecting);
    });
    const bind = () => {
      const next = document.querySelector<HTMLElement>("main");
      if (next === page && next?.dataset.soundWorld === soundWorld) return;
      intersection.disconnect();
      page = next;
      soundWorld = page?.dataset.soundWorld;
      setSoundWorld(soundWorld, false);
      if (page) intersection.observe(page);
    };
    // Also covers a streamed <main> and client-side route replacement.
    const mutations = new MutationObserver(bind);
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-sound-world"] });
    bind();
    return () => { mutations.disconnect(); intersection.disconnect(); setSoundWorld(undefined, false); };
  }, [pathname]);

  useEffect(() => {
    let last: Element | null = null;
    // Each world has its own hover and click voice (data-sound-world on <main>); a slight detune keeps it alive.
    const world = () => document.querySelector<HTMLElement>("main")?.dataset.soundWorld;
    const vary = () => ({ detune: (Math.random() - .5) * 80 });
    const over = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest(INTERACTIVE) ?? null;
      if (target && target !== last) play(uiSound(world(), "hover"), vary());
      last = target;
    };
    const click = (event: MouseEvent) => { if ((event.target as Element | null)?.closest(INTERACTIVE)) play(uiSound(world(), "click"), vary()); };
    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("click", click, { passive: true });
    return () => { document.removeEventListener("pointerover", over); document.removeEventListener("click", click); };
  }, []);

  useEffect(() => {
    const reticle = cursor.current;
    const tail = trail.current;
    if (!motion || !fine || !reticle || !tail) return;
    const root = document.documentElement;
    root.classList.add("has-fx-cursor");
    const moveX = gsap.quickTo(reticle, "x", { duration: .12, ease: "power3" });
    const moveY = gsap.quickTo(reticle, "y", { duration: .12, ease: "power3" });
    const dots = [...tail.children] as HTMLElement[];
    const dotX = dots.map((dot, index) => gsap.quickTo(dot, "x", { duration: .18 + index * .07, ease: "power3" }));
    const dotY = dots.map((dot, index) => gsap.quickTo(dot, "y", { duration: .18 + index * .07, ease: "power3" }));
    let magnet: HTMLElement | null = null;
    const release = () => { if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: .5, ease: "elastic.out(1, .4)" }); magnet = null; };
    const move = (event: PointerEvent) => {
      moveX(event.clientX); moveY(event.clientY);
      dots.forEach((_, index) => { dotX[index](event.clientX); dotY[index](event.clientY); });
      const target = event.target as Element | null;
      const interactive = target?.closest(INTERACTIVE);
      const text = target?.closest("input, textarea, [contenteditable='true']");
      reticle.dataset.state = text ? "text" : interactive ? "lock" : "idle";
      const next = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (next !== magnet) release();
      magnet = next;
      if (magnet) {
        const box = magnet.getBoundingClientRect();
        gsap.to(magnet, { x: (event.clientX - box.left - box.width / 2) * .25, y: (event.clientY - box.top - box.height / 2) * .35, duration: .35, ease: "power3" });
      }
    };
    const down = () => { reticle.dataset.pressed = "true"; };
    const up = () => { delete reticle.dataset.pressed; };
    const leave = () => { reticle.dataset.state = "hidden"; release(); };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("has-fx-cursor"); release();
      removeEventListener("pointermove", move); removeEventListener("pointerdown", down); removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [motion, fine]);

  return <>
    <div className="fx-grain" aria-hidden="true" />
    <div className="fx-scanlines" aria-hidden="true" />
    {motion && fine && <>
      <div ref={trail} className="fx-trail" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <i key={index} />)}</div>
      <div ref={cursor} className="fx-cursor" data-state="hidden" aria-hidden="true"><span /><span /><span /><span /></div>
    </>}
  </>;
}
