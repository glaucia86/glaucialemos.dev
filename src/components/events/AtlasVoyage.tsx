"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger, CustomEase, useGSAP, SCRAMBLE_CHARS } from "@/lib/gsap";
import { useMotionEnabled } from "@/lib/use-motion";
import { play } from "@/lib/sfx";
import { anglesOf } from "@/lib/atlas-records";
import type { AtlasCopy } from "@/i18n/atlas";
import { ACTS, createVoyagePixels, span, viewAt, yearAt } from "./voyage-engine";

type City = { lat: number; lon: number; first: number; count: number };
type Year = { year: number; names: string[]; cities: number; remote: number };
type Sprite = { src: string; style: CSSProperties };
type Props = { plate: string; crew: Sprite[]; cities: City[]; years: Year[]; copy: AtlasCopy["voyage"]; locale: string };

const TOUCH = "(hover: none), (pointer: coarse), (max-width: 900px)";
const CRACKS = ["M78 30 L64 12 L58 4", "M78 30 L92 14 L99 9", "M78 30 L96 38 L100 47", "M78 30 L70 46 L63 58", "M78 30 L84 52 L88 63", "M78 30 L60 30 L52 26", "M64 12 L70 8", "M70 46 L76 50", "M92 14 L94 24"];

// The camera voyage between the hero and the Atlas: a sticky frame driven by the scroll, the same on every device (shorter
// and lighter on touch). Acts: approach (parallax push into the window) → glass (cracks, shards) → the real 3D globe turning
// Brazil → North America → the Caribbean → Athens → Rio while the in-person cities light up year by year, with the names of
// that year's gatherings → warp → landing on the Atlas. Remote participations ride an orbit, never the ground.
// Without JavaScript or with reduced motion, a static log of the years stands in.
export function AtlasVoyage({ plate, crew, cities, years, copy, locale }: Props) {
  const root = useRef<HTMLElement>(null);
  const motion = useMotionEnabled();
  const format = new Intl.NumberFormat(locale);
  const first = years[0].year; const last = years.at(-1)!.year;

  useGSAP(() => {
    const section = root.current;
    if (!section || !motion) return;
    const touch = matchMedia(TOUCH).matches;
    section.dataset.live = "true";
    const q = <T extends Element = HTMLElement>(selector: string) => section.querySelector<T>(selector)!;
    const globeCanvas = q<HTMLCanvasElement>(".atlas-voyage__globe");
    const yearEl = q(".atlas-voyage__year"); const countEl = q(".atlas-voyage__count"); const marquee = q(".atlas-voyage__marquee");
    const pixels = createVoyagePixels(q<HTMLCanvasElement>(".atlas-voyage__pixels"), { light: touch });
    let globe: { update: (state: Record<string, unknown>) => void; destroy: () => void } | null = null;
    let disposed = false; let shownYear = 0; let progress = 0; let phase = -1;
    const remoteBy = new Map(years.map((year) => [year.year, year.remote]));
    const byYear = new Map(years.map((year) => [year.year, year]));

    const markersFor = (year: number) => cities.filter((city) => city.first <= year).map((city) => ({
      location: [city.lat, city.lon] as [number, number],
      size: (city.count >= 10 ? .07 : city.count >= 3 ? .05 : .035) * (city.first === year ? 1.6 : 1),
    }));
    const mount = async () => {
      if (globe || disposed) return;
      const { default: createGlobe } = await import("cobe");
      if (disposed) return;
      const dpr = Math.min(devicePixelRatio || 1, touch ? 1.25 : 2);
      const size = globeCanvas.getBoundingClientRect().width * dpr;
      try {
        globe = createGlobe(globeCanvas, {
          devicePixelRatio: dpr, width: size, height: size, phi: 0, theta: 0, dark: 1, diffuse: 1.6,
          mapSamples: touch ? 9000 : 18000, mapBrightness: 7, mapBaseBrightness: .03,
          baseColor: [.1, .28, .5], markerColor: [1, .78, .35], glowColor: [.2, .6, .95], markers: [], markerElevation: .02,
        }) as unknown as typeof globe;
        render();
      } catch { globe = null; }
    };
    const unmount = () => { globe?.destroy(); globe = null; shownYear = 0; };
    const near = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) void mount(); else unmount(); }, { rootMargin: "60% 0px" });
    near.observe(section);
    const resize = new ResizeObserver(() => { const dpr = Math.min(devicePixelRatio || 1, touch ? 1.25 : 2); const size = globeCanvas.getBoundingClientRect().width * dpr; globe?.update({ width: size, height: size }); });
    resize.observe(globeCanvas);

    function render() {
      const t = span(progress, ACTS.globe);
      const year = yearAt(t, first, last);
      const view = viewAt(t);
      const [phi, theta] = anglesOf(view.lat, view.lon);
      globe?.update({ phi, theta: theta * .6 });
      if (globe && year !== shownYear) {
        globe.update({ markers: markersFor(year) });
        const info = byYear.get(year);
        gsap.to(yearEl, { duration: .5, scrambleText: { text: String(year), chars: "0123456789", speed: .8 }, overwrite: true });
        countEl.textContent = copy.count.replace("{cities}", format.format(info?.cities ?? 0)).replace("{remote}", format.format(info?.remote ?? 0));
        gsap.to(marquee, { duration: .6, scrambleText: { text: info?.names.length ? info.names.join("  ·  ") : copy.onlySignals, chars: SCRAMBLE_CHARS, speed: 1 }, overwrite: true });
        if (shownYear && t > 0 && t < 1) play("citylights", { detune: (year - first) * 40, gain: .7 });
        shownYear = year;
      }
      pixels.set(progress, Math.round((remoteBy.get(year) ?? 0) * Math.min(1, t * 1.4)));
      // One sound per act, once per pass in either direction.
      const next = progress < .02 ? -1 : progress < ACTS.glass[0] + .06 ? 0 : progress < ACTS.globe[0] ? 1 : progress < ACTS.warp[0] ? 2 : 3;
      const ACT_SOUNDS = ["descent", "ice", "orbit", "warp"] as const;
      if (next > phase && next >= 0) play(ACT_SOUNDS[next as 0 | 1 | 2 | 3]);
      phase = next;
    }

    CustomEase.create("voyage-push", "M0,0 C0.25,0 0.32,0.12 0.45,0.34 0.6,0.6 0.72,1 1,1");
    const plane = q(".atlas-voyage__plane"); const crewEl = q(".atlas-voyage__crew");
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: q(".atlas-voyage__track"), start: "top top", end: "bottom bottom", scrub: touch ? .4 : .7, onUpdate: (self) => { progress = self.progress; render(); } },
    })
      .fromTo(plane, { scale: 1 }, { scale: touch ? 1.8 : 2.3, transformOrigin: "78% 30%", ease: "voyage-push", duration: .3 }, 0)
      .fromTo(crewEl, { yPercent: 0, scale: 1, autoAlpha: 1 }, { yPercent: 45, scale: 1.7, autoAlpha: 0, transformOrigin: "88% 100%", duration: .2 }, 0)
      .fromTo(".atlas-voyage__shine", { xPercent: -120, autoAlpha: 0 }, { xPercent: 120, autoAlpha: 1, duration: .1 }, .12)
      .to(".atlas-voyage__shine", { autoAlpha: 0, duration: .03 }, .22)
      .fromTo(".atlas-voyage__cracks path", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", stagger: .008, duration: .08 }, .18)
      .to(".atlas-voyage__cracks", { autoAlpha: 0, duration: .04 }, .28)
      .to(plane, { autoAlpha: 0, filter: "brightness(1.6)", duration: .06 }, .26)
      .fromTo(globeCanvas, { autoAlpha: 0, scale: .45 }, { autoAlpha: 1, scale: 1, duration: .1, ease: "power2.out" }, .28)
      .fromTo(".atlas-voyage__hud", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .04 }, .32)
      .to(".atlas-voyage__hud", { autoAlpha: 0, duration: .04 }, .8)
      .to(globeCanvas, { scale: 2.8, autoAlpha: 0, duration: .14, ease: "power2.in" }, .8)
      .fromTo(".atlas-voyage__land", { autoAlpha: 0, letterSpacing: ".1em" }, { autoAlpha: 1, letterSpacing: ".6em", duration: .08 }, .86)
      .fromTo(".atlas-voyage__flash", { autoAlpha: 0 }, { autoAlpha: 1, duration: .03 }, .94)
      .to(".atlas-voyage__flash", { autoAlpha: 0, duration: .03 }, .97);
    ScrollTrigger.refresh();

    return () => {
      disposed = true; tl.scrollTrigger?.kill(); tl.kill(); near.disconnect(); resize.disconnect(); unmount(); pixels.destroy();
      delete section.dataset.live;
    };
  }, { scope: root, dependencies: [motion], revertOnUpdate: true });

  return <section ref={root} className="atlas-voyage" aria-labelledby="atlas-voyage-title">
    <h2 id="atlas-voyage-title" className="sr-only">{copy.label}</h2>
    <div className="atlas-voyage__track" aria-hidden="true">
      <div className="atlas-voyage__frame">
        <div className="atlas-voyage__scene">
          <div className="atlas-plane atlas-voyage__plane" style={{ backgroundImage: `url(${plate})` }}>
            <span className="atlas-voyage__crew">{crew.map((sprite) => <i key={sprite.src} style={{ ...sprite.style, backgroundImage: `url(${sprite.src})` }} />)}</span>
          </div>
          <span className="atlas-voyage__shine" />
        </div>
        <svg className="atlas-voyage__cracks" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">{CRACKS.map((path) => <path key={path} d={path} />)}</svg>
        <canvas className="atlas-voyage__globe" />
        <canvas className="atlas-voyage__pixels" />
        <div className="atlas-voyage__hud">
          <p className="atlas-voyage__year">{first}</p>
          <p className="atlas-voyage__count" />
          <p className="atlas-voyage__marquee" />
        </div>
        <p className="atlas-voyage__land">{copy.land}</p>
        <span className="atlas-voyage__flash" />
      </div>
    </div>
    <ol className="atlas-voyage__static">
      {years.map((year) => <li key={year.year}><b>{year.year}</b><span>{copy.count.replace("{cities}", format.format(year.cities)).replace("{remote}", format.format(year.remote))}</span></li>)}
    </ol>
  </section>;
}
