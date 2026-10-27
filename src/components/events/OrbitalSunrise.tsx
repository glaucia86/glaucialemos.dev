"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { play } from "@/lib/sfx";

const PIXEL = 3;
const GOLD = "#f7c36c"; const CYAN = "#4bdfff"; const TEAL = "#50ddbf"; const ICE = "#dff8ff";
function random(seed: number) { let state = seed; return () => (state = (state * 16807) % 2147483647) / 2147483647; }

// An orbital sunrise in pixels, driven by the scroll: stars fade, the Earth's limb glows from cyan to gold, the city lights
// on the night side go out with the dawn, aurora ribbons dance and fade, and the Sun breaks over the limb with rotating rays
// and a diamond flare. Pure function of (progress, time): scrolling back sets the night again.
export function createSunrise(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  const next = random(1983);
  const stars = Array.from({ length: 160 }, () => ({ x: next(), y: next() * .7, p: next() * 6.3 }));
  const lights = Array.from({ length: 90 }, () => ({ a: (next() - .5) * 1.2, d: .01 + next() * .12, p: next() * 6.3 }));
  let width = 0; let height = 0; let progress = 0; let time = 0;
  const dot = (x: number, y: number, color: string, alpha: number, size = 1) => {
    if (!context || alpha <= 0) return; context.globalAlpha = Math.min(1, alpha); context.fillStyle = color; context.fillRect(Math.round(x), Math.round(y), size, size);
  };
  const render = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    const dawn = Math.min(1, Math.max(0, (progress - .15) / .7));
    // Sky: deep night to a cobalt dawn.
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#040a18"); sky.addColorStop(1, `rgba(${Math.round(16 + dawn * 40)}, ${Math.round(38 + dawn * 50)}, ${Math.round(80 + dawn * 60)}, 1)`);
    context.globalAlpha = 1; context.fillStyle = sky; context.fillRect(0, 0, width, height);
    for (const star of stars) dot(star.x * width, star.y * height, ICE, (1 - dawn * 1.2) * (.4 + .4 * Math.sin(time * 1.5 + star.p)));
    // The limb: a huge circle whose top crosses the frame low.
    const cx = width / 2; const r = width * 1.4; const cy = height * .78 + r;
    for (let x = 0; x < width; x++) {
      const top = cy - Math.sqrt(Math.max(0, r * r - (x - cx) ** 2));
      context.globalAlpha = 1; context.fillStyle = "#06142b"; context.fillRect(x, Math.round(top), 1, height);
      const edge = 1 - Math.abs(x - cx) / (width * .6);
      dot(x, top - 1, dawn > .5 ? GOLD : CYAN, .5 + edge * .5 * (.4 + dawn));
      dot(x, top - 3, TEAL, .25 + edge * .3 * dawn);
      dot(x, top - 5, CYAN, .15 * edge);
    }
    // City lights on the night side go out as the dawn reaches them.
    for (const light of lights) {
      const x = cx + light.a * width; const top = cy - Math.sqrt(Math.max(0, r * r - (x - cx) ** 2));
      const off = dawn * 1.6 - Math.abs(light.a) * 1.4;
      dot(x, top + light.d * height, GOLD, (1 - Math.max(0, off)) * (.5 + .5 * Math.sin(time * 2 + light.p)));
    }
    // Aurora ribbons, fading with the light.
    for (let ribbon = 0; ribbon < 3; ribbon++) for (let x = 0; x < width; x += 1) {
      const y = height * (.3 + ribbon * .08) + Math.sin(x / width * 9 + time * .6 + ribbon) * height * .04;
      dot(x, y, ribbon % 2 ? TEAL : CYAN, (1 - dawn) * .22);
    }
    // The Sun breaks over the limb.
    const rise = Math.min(1, Math.max(0, (progress - .35) / .5));
    if (rise > 0) {
      const sx = cx; const sy = height * .78 - rise * height * .06;
      const glow = context.createRadialGradient(sx, sy, 0, sx, sy, width * (.08 + rise * .35));
      glow.addColorStop(0, `rgba(255, 246, 220, ${.9 * rise})`); glow.addColorStop(.25, `rgba(247, 195, 108, ${.45 * rise})`); glow.addColorStop(1, "rgba(247, 195, 108, 0)");
      context.globalAlpha = 1; context.fillStyle = glow; context.fillRect(0, 0, width, height);
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2 + time * .05; const length = width * (.06 + rise * .3) * (i % 2 ? .6 : 1);
        for (let s = 4; s < length; s += 2) dot(sx + Math.cos(a) * s, sy + Math.sin(a) * s * .7, i % 2 ? GOLD : ICE, rise * .5 * (1 - s / length));
      }
      // The diamond flare when the disc clears the limb.
      const flare = Math.max(0, 1 - Math.abs(progress - .62) / .08);
      for (let s = 0; s < width * .45 * flare; s += 1) { dot(sx + s, sy, ICE, flare * (1 - s / (width * .45))); dot(sx - s, sy, ICE, flare * (1 - s / (width * .45))); }
      dot(sx - 2, sy - 2, "#ffffff", rise, 5);
    }
    context.globalAlpha = 1;
  };
  const resize = () => { width = Math.max(1, Math.round(canvas.clientWidth / PIXEL)); height = Math.max(1, Math.round(canvas.clientHeight / PIXEL)); canvas.width = width; canvas.height = height; render(); };
  resize();
  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
  observer?.observe(canvas);
  return {
    set(value: number) { progress = Math.min(1, Math.max(0, value)); render(); },
    tick(seconds: number) { time += seconds; render(); },
    destroy() { observer?.disconnect(); },
  };
}

// The final chapter's sky. The section's content (Glaucia seen from behind, the invitation, the next connections) is server
// markup; this island paints the sunrise behind it. Reduced motion: the dawn is already complete.
export function OrbitalSunrise() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const motion = useMotionEnabled();
  useGSAP(() => {
    const element = canvas.current;
    if (!element) return;
    const sunrise = createSunrise(element);
    if (!motion) { sunrise.set(1); return () => sunrise.destroy(); }
    const section = element.closest("section")!;
    let flared = false;
    const trigger = ScrollTrigger.create({ trigger: section, start: "top bottom", end: "bottom bottom", scrub: .6, onUpdate: (self) => {
      sunrise.set(self.progress);
      if (self.progress > .6 && !flared) { flared = true; play("bloom"); } else if (self.progress < .5) flared = false;
    } });
    let raf = 0; let last = 0;
    const loop = (now: number) => { sunrise.tick(last ? Math.min(.1, (now - last) / 1000) : 0); last = now; raf = requestAnimationFrame(loop); };
    const stop = observeMotionActivity(element, (on) => { cancelAnimationFrame(raf); last = 0; if (on) raf = requestAnimationFrame(loop); });
    gsap.fromTo(section.querySelector(".orbit-watchers"), { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 80%", end: "center center", scrub: true } });
    return () => { trigger.kill(); stop(); cancelAnimationFrame(raf); sunrise.destroy(); };
  }, { dependencies: [motion], revertOnUpdate: true });
  return <canvas ref={canvas} className="orbit-sunrise" aria-hidden="true" />;
}
