"use client";

import { useEffect, useState } from "react";
import { MOBILE_EGG_QUERY } from "@/lib/mobile-eggs";
import { defaultLocale, isLocale } from "@/i18n/config";
import { mobileEggOutcomes } from "@/i18n/mobile-eggs";
import { gsap } from "@/lib/gsap";
import { useMediaQuery, useMotionEnabled } from "@/lib/use-motion";
import { discover, onEgg } from "@/lib/eggs";
import { play } from "@/lib/sfx";

const IDLE_MS = 6000;
const GRACE_MS = 2500;

// Stay still on Nivéora and snow piles up at the bottom of the screen and on the cards; any movement shakes it off.
export function SnowDrift() {
  const motion = useMotionEnabled();
  const mobile = useMediaQuery(MOBILE_EGG_QUERY);
  const [narrative, setNarrative] = useState("");

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".about-page");
    if (!page) return;
    if (!motion) {
      if (!mobile) return;
      let timer = 0;
      const stop = onEgg("snowdrift", () => {
        discover("snowdrift");
        const lang = document.documentElement.lang.split("-")[0];
        setNarrative(mobileEggOutcomes[isLocale(lang) ? lang : defaultLocale].snowdrift);
        clearTimeout(timer); timer = window.setTimeout(() => setNarrative(""), 4000);
      });
      return () => { stop(); clearTimeout(timer); setNarrative(""); };
    }
    let idle: ReturnType<typeof setTimeout> | undefined;
    let lastY = scrollY;
    let graceUntil = 0;
    const settle = () => { page.dataset.settled = "true"; discover("snowdrift"); play("snow"); };
    const shake = () => { if (page.dataset.settled) play("snow", { detune: 400 }); shakeCaps(); };
    const shakeCaps = () => page.querySelectorAll<HTMLElement>(".snowcap").forEach((cap) => {
      const box = cap.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) return;
      for (let index = 0; index < 6; index++) {
        const flake = Object.assign(document.createElement("span"), { className: "niveora-flake" });
        flake.style.cssText = `left:${box.left + Math.random() * box.width}px;top:${box.top}px`;
        document.body.append(flake);
        gsap.to(flake, { y: gsap.utils.random(40, 120), x: gsap.utils.random(-20, 20), autoAlpha: 0, duration: gsap.utils.random(.6, 1.1), ease: "power1.in", onComplete: () => flake.remove() });
      }
    });
    const wake = () => {
      if (performance.now() < graceUntil) return;
      if (page.dataset.settled) { delete page.dataset.settled; shake(); }
      clearTimeout(idle); idle = setTimeout(settle, IDLE_MS);
    };
    const onScroll = () => { if (Math.abs(scrollY - lastY) > 2) { lastY = scrollY; wake(); } };
    const activity = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel"] as const;
    activity.forEach((type) => addEventListener(type, wake, { passive: true }));
    addEventListener("scroll", onScroll, { passive: true });
    const stopEgg = onEgg("snowdrift", () => { graceUntil = performance.now() + GRACE_MS; settle(); });
    wake();
    return () => {
      stopEgg(); clearTimeout(idle);
      activity.forEach((type) => removeEventListener(type, wake)); removeEventListener("scroll", onScroll);
      delete page.dataset.settled;
      document.querySelectorAll(".niveora-flake").forEach((node) => node.remove());
    };
  }, [motion, mobile]);

  return <><div className="niveora-drift" aria-hidden="true"><span className="niveora-drift__back" /><span className="niveora-drift__front" /></div>
    {narrative && <p className="mobile-egg-narrative mobile-egg-narrative--fixed" role="status">{narrative}</p>}</>;
}
