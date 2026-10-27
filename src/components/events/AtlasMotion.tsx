"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, Draggable, useGSAP } from "@/lib/gsap";
import { useMotionEnabled } from "@/lib/use-motion";
import { observeMotionActivity } from "@/lib/motion";
import { whenBootDone } from "@/lib/boot";
import { play } from "@/lib/sfx";
import { bringIntoView, buzz, discover, emitEgg, onEgg, type EggId } from "@/lib/eggs";
import type { AtlasCopy } from "@/i18n/atlas";
import type { Evento } from "@/lib/types";
import type { Format } from "@/lib/atlas-records";
import { createOrbit, GOLD, CYAN, type UV } from "./orbit-engine";
import type { Holo, HoloMarker } from "./holo-globe";
import { SPOTS, atlasScene, type GlauciaPose, type PrincePose } from "./AtlasScene";
import { eventAnchor, findEvent } from "./atlas-events";

export type VisorEvent = Pick<Evento, "nome" | "ano" | "cidade" | "pais" | "lat" | "lon" | "idioma" | "tipo" | "fonte"> & { id: string; formato: Format };
export type StarCity = { cidade: string; pais: string | null; lat: number; lon: number; first: number };
type Reading = { kind: "visor"; event: VisorEvent } | { kind: "constellation" } | { kind: "postcard"; event: VisorEvent };

const HERO_EGGS: EggId[] = ["constellation-route", "dog-navigation"];
const CLEAR_CONSTELLATION = "atlas:clear-constellation";
const pct = (spot: { u: number; v: number }): UV => ({ u: spot.u / 100, v: spot.v / 100 });
// The flat projection unfolds around the hologram (plate fractions; 150° × 98° of longitude × latitude, a crop).
// It sits low enough to stay clear of the readout card, which floats over the top of the window.
const PROJECTION = { u0: .585, v0: .44, u1: .925, v1: .84 };
const FACES = ["face-idle", "face-tongue", "face-joy"] as const;
const faces = atlasScene.assets.actors.prince as Record<string, { src: string }>;

type Props = {
  children: ReactNode; labelledBy: string; locale: string;
  copy: Pick<AtlasCopy, "status" | "readout" | "formats" | "languages" | "prince" | "tablet" | "dock"> & { touch: string };
  types: Record<Evento["tipo"], string>;
  events: VisorEvent[]; queue: string[]; stars: StarCity[]; markers: HoloMarker[]; yearMarkers: { year: number; markers: HoloMarker[] }[];
};

// Server markup arrives as children; this island brings the navigation room, the hologram and two of its secrets to life.
export function AtlasMotion({ children, labelledBy, locale, copy, types, events, queue, stars, markers, yearMarkers }: Props) {
  const hero = useRef<HTMLElement>(null);
  const readoutTitle = useRef<HTMLParagraphElement>(null);
  const visorAt = useRef(0);
  const [reading, setReading] = useState<Reading | null>(null);
  const [face, setFace] = useState(0);
  // Glaucia's navigation tablet: it drives the hologram (joystick, regions, a year) and launches two secrets.
  const [tablet, setTablet] = useState(false);
  const [tabletYear, setTabletYear] = useState("");
  const holoRef = useRef<Holo | null>(null);
  const controls = useRef<{ constellation: () => void; orbit: () => void } | null>(null);
  const pad = useRef<HTMLDivElement>(null);
  const motion = useMotionEnabled();
  const format = new Intl.NumberFormat(locale);

  useGSAP(() => {
    const section = hero.current;
    if (!section) return;
    let disposed = false;
    const q = <T extends Element = HTMLElement>(selector: string) => section.querySelector<T>(selector)!;
    const layer = q(".hero-scene-layer");
    const crew = q(".atlas-crew");
    const prince = q(".atlas-prince");
    const orb = q(".atlas-orb");
    const holoEl = q(".atlas-holo");
    const status = q(".atlas-status");
    const hotspots = gsap.utils.toArray<HTMLButtonElement>(".atlas-hot", section);
    const satellite = q<HTMLButtonElement>(".atlas-satellite");
    const cards = events.filter((event) => event.formato === "presencial");
    let cardAt = 0;
    const nextCard = () => cards[(cardAt++ * 7) % cards.length];
    satellite.hidden = false;
    const crewPoses = gsap.utils.toArray<HTMLElement>(".atlas-crew [data-actor-pose]", section);
    const princePoses = gsap.utils.toArray<HTMLElement>(".atlas-prince [data-actor-pose]", section);
    const byId = new Map(events.map((event) => [event.id, event]));
    let stage: "idle" | "trace" | "visor" | "orbit" = "idle";
    let statusTimer: number | undefined;
    let holo: Holo | null = null;
    let active = false;

    const showPose = (container: HTMLElement, elements: HTMLElement[], pose: string) => {
      container.dataset.acting = "true";
      elements.forEach((element) => { if (element.dataset.actorPose === pose) element.dataset.active = "true"; else delete element.dataset.active; });
    };
    const setPose = (pose: GlauciaPose) => { section.dataset.pose = pose; showPose(crew, crewPoses, pose); };
    const setPrince = (pose: PrincePose) => { section.dataset.prince = pose; showPose(prince, princePoses, pose); };
    const setStage = (next: typeof stage) => { stage = next; section.dataset.stage = next; };
    const say = (text: string, ms = 2800) => {
      clearTimeout(statusTimer);
      status.textContent = text;
      if (!motion) { status.style.opacity = "1"; status.style.visibility = "visible"; return; }
      gsap.fromTo(status, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .3, ease: "steps(3)", overwrite: true });
      statusTimer = window.setTimeout(() => gsap.to(status, { autoAlpha: 0, duration: .3, ease: "steps(3)", onComplete: () => { status.textContent = ""; } }), ms);
    };
    const nextEvent = () => byId.get(queue[visorAt.current++ % queue.length])!;
    let keyboard = false;
    const fromKeyboard = () => { keyboard = !!document.activeElement?.matches(".atlas-hot:focus-visible, .comlink *"); };
    const show = (next: Reading) => { setReading(next); setFace(0); if (keyboard) requestAnimationFrame(() => readoutTitle.current?.focus({ preventScroll: true })); };
    setPose("idle"); setPrince("front-bare"); setStage("idle");
    hotspots.forEach((button) => { button.hidden = false; });

    // The hologram loads cobe on demand; without WebGL the pedestal keeps its CSS glow.
    void import("./holo-globe").then(({ createHolo }) => {
      if (disposed) return;
      holo = createHolo(q<HTMLCanvasElement>(".atlas-holo__globe"), markers, { reduced: !motion });
      holoRef.current = holo;
      holoEl.dataset.ready = String(holo.available());
      if (active) holo.start();
    });
    const ids: Record<string, "constellation" | "visor" | "orbit" | "tablet"> = { glaucia: "tablet", prince: "visor", orb: "visor", holo: "orbit" };

    // Reduced motion: the same secrets, with the final state at once and no acting or particles.
    if (!motion) {
      const run = (kind: "constellation" | "visor" | "orbit" | "tablet") => {
        if (kind === "tablet") { setTablet(true); return; }
        fromKeyboard();
        if (kind === "orbit") { emitEgg("orbital-trail"); return; }
        if (kind === "constellation") { discover("constellation-route"); show({ kind: "constellation" }); say(copy.status.traced); return; }
        discover("dog-navigation");
        const event = nextEvent();
        orb.dataset.orb = "active";
        if (event.lat !== null && event.lon !== null) holo?.focus(event.lat, event.lon);
        show({ kind: "visor", event }); say(event.formato === "presencial" ? copy.status.locked : copy.status.signal);
      };
      const click = (event: Event) => run(ids[(event.currentTarget as HTMLElement).dataset.hot!]);
      hotspots.forEach((button) => button.addEventListener("click", click));
      controls.current = { constellation: () => { setTablet(false); run("constellation"); }, orbit: () => { setTablet(false); run("orbit"); } };
      // The satellite is parked in the sky and still catchable.
      gsap.set(satellite, { left: "88%", top: "12%" });
      const catchParked = () => { fromKeyboard(); discover("runaway-satellite"); show({ kind: "postcard", event: nextCard() }); say(copy.prince.caught); };
      satellite.addEventListener("click", catchParked);
      const stopSatellite = onEgg("runaway-satellite", () => void bringIntoView(section).then(catchParked));
      const stop = onEgg(HERO_EGGS, (id) => void bringIntoView(section).then(() => { if (!disposed) run(id === "constellation-route" ? "constellation" : "visor"); }));
      return () => {
        disposed = true; stop(); clearTimeout(statusTimer); holo?.destroy();
        hotspots.forEach((button) => { button.hidden = true; button.removeEventListener("click", click); });
        satellite.hidden = true; satellite.removeEventListener("click", catchParked); stopSatellite(); gsap.set(satellite, { clearProps: "left,top" });
        for (const key of ["stage", "pose", "prince"]) delete section.dataset[key];
        delete crew.dataset.acting; delete prince.dataset.acting; orb.dataset.orb = "idle"; holoEl.dataset.holo = "idle"; delete holoEl.dataset.ready;
        status.textContent = ""; status.style.removeProperty("opacity"); status.style.removeProperty("visibility");
      };
    }

    // One active clock: timers only advance while the scene is on screen and the tab is visible.
    let clock = 0; let previous = 0; let raf = 0;
    let timers: { due: number; run: () => void }[] = [];
    const later = (run: () => void, ms: number) => timers.push({ due: clock + ms, run });
    const tick = (now: number) => {
      if (!active || disposed) return;
      clock += previous ? Math.min(100, now - previous) : 0; previous = now;
      for (const timer of [...timers]) if (timer.due <= clock && timers.includes(timer)) { timers.splice(timers.indexOf(timer), 1); timer.run(); }
      raf = requestAnimationFrame(tick);
    };
    const orbit = createOrbit({ back: q(".atlas-sky--back"), front: q(".atlas-sky--front"), earthMask: atlasScene.assets.earthMask.src });
    const stopActivity = observeMotionActivity(layer, (on) => {
      active = on; layer.dataset.paused = String(!on);
      cancelAnimationFrame(raf); previous = 0;
      if (on) { orbit.start(); holo?.start(); raf = requestAnimationFrame(tick); } else { orbit.stop(); holo?.stop(); }
    });

    // At rest the crew lives: Glaucia turns toward the hologram now and then, Prince shifts his weight.
    let restTurn = 0;
    const idleLoop = () => {
      if (stage === "idle") {
        restTurn++;
        if (restTurn % 2) { setPose("profile"); later(() => { if (stage === "idle") setPose(restTurn % 4 === 1 ? "hip" : "idle"); }, 2600); }
        setPrince(restTurn % 3 === 0 ? "side" : "front-bare");
      }
      later(idleLoop, 6200);
    };
    later(idleLoop, 4200);
    const settle = () => { setPose("idle"); setPrince("front-bare"); orb.dataset.orb = "idle"; setStage("idle"); };

    const intro = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
      .from(".atlas-copy > *", { autoAlpha: 0, y: 24, duration: .8, stagger: .08 })
      .from(".hero-hud > *", { autoAlpha: 0, duration: .4, stagger: { each: .06, from: "random" }, ease: "steps(3)" }, "<")
      .fromTo([crew, prince, orb, holoEl], { filter: "brightness(3) saturate(0)" }, { filter: "brightness(1) saturate(1)", duration: .9, ease: "steps(6)", clearProps: "filter" }, "<");
    const cancelIntro = whenBootDone(() => intro.play());

    // ——— Glaucia turns to the hologram: it unfolds into a flat projection and the in-person cities link up ———
    const constellationRoute = () => {
      if (stage !== "idle") return;
      fromKeyboard(); setStage("trace"); discover("constellation-route");
      setPose("profile"); play("holo"); buzz([15, 30, 15]);
      say(copy.status.tracing, 4200);
      holoEl.dataset.holo = "unfold";
      orbit.beam(pct(SPOTS.hand), pct(SPOTS.holo), 1.2);
      orbit.constellation(PROJECTION, stars, 4400, (index) => play("star", { detune: index * 35 }));
      later(() => { setPose("hip"); say(copy.status.traced); play("citylights"); show({ kind: "constellation" }); orbit.sparks(pct(SPOTS.holo), 18); }, 4700);
      later(() => { setStage("idle"); setPose("idle"); }, 6400);
    };

    // ——— Prince sniffs a signal, the navigation orb lights up and the hologram turns to the event's origin ———
    const dogNavigation = () => {
      if (stage !== "idle") return;
      fromKeyboard(); setStage("visor"); discover("dog-navigation");
      orbit.clearConstellation(); holoEl.dataset.holo = "idle";
      const event = nextEvent();
      setPrince("side"); play("woof"); buzz([20, 30, 20]);
      say(copy.status.sniffing);
      later(() => { orb.dataset.orb = "active"; play("visor"); orbit.ring(pct(SPOTS.orb), 2, 10, CYAN); }, 450);
      later(() => orbit.beam(pct(SPOTS.orb), pct(SPOTS.holo), 1.8), 700);
      later(() => {
        if (event.lat !== null && event.lon !== null) {
          holo?.focus(event.lat, event.lon, () => { orbit.ring(pct(SPOTS.holo), 3, 12, GOLD); orbit.sparks(pct(SPOTS.holo), 14); });
          say(copy.status.locked); play("citylights");
        } else { orbit.ring(pct(SPOTS.orb), 4, 22, CYAN); say(copy.status.signal); play("radar"); }
        setPrince("side-b");
      }, 1200);
      later(() => show({ kind: "visor", event }), 1900);
      later(() => setFace(1), 2500);
      later(() => setFace(2), 3300);
      later(() => { holo?.rest(); settle(); }, 5200);
    };

    // ——— The hologram whirls a full orbit and hands over to the big globe, which closes the orbit of a year ———
    const holoOrbit = () => {
      if (stage !== "idle") return;
      setStage("orbit"); holoEl.dataset.holo = "whirl"; play("orbit");
      orbit.ring(pct(SPOTS.pedestal), 3, 16, CYAN);
      holo?.whirl();
      later(() => { holoEl.dataset.holo = "idle"; setStage("idle"); emitEgg("orbital-trail"); }, 1500);
    };

    const openTablet = () => { if (stage !== "idle") return; setPose("profile"); play("holo"); setTablet(true); };
    controls.current = { constellation: () => { setTablet(false); constellationRoute(); }, orbit: () => { setTablet(false); holoOrbit(); } };
    const actions: Record<string, () => void> = { glaucia: openTablet, prince: dogNavigation, orb: dogNavigation, holo: holoOrbit };
    const replays: Record<string, () => void> = { "constellation-route": constellationRoute, "dog-navigation": dogNavigation };
    const onHot = (event: Event) => actions[(event.currentTarget as HTMLElement).dataset.hot!]?.();
    hotspots.forEach((button) => button.addEventListener("click", onHot));
    // ——— The runaway satellite: it crosses the window now and then; catch it and the orb fetches a postcard ———
    const flight = gsap.timeline({ repeat: -1, repeatDelay: 12, delay: 6 })
      .set(satellite, { autoAlpha: 1, scale: 1, rotation: -12 })
      .fromTo(satellite, { left: "101%", top: "22%" }, { motionPath: { path: [{ left: "86%", top: "9%" }, { left: "68%", top: "6%" }, { left: "51%", top: "15%" }], curviness: 1.4 }, rotation: 14, duration: 11, ease: "none" })
      .set(satellite, { autoAlpha: 0 });
    const catchSatellite = () => {
      if (stage !== "idle") return;
      fromKeyboard(); setStage("visor"); discover("runaway-satellite");
      flight.pause();
      const at = { u: parseFloat(satellite.style.left) / 100, v: parseFloat(satellite.style.top) / 100 };
      play("catch"); play("woof"); buzz([25, 30, 25]);
      say(copy.prince.caught);
      setPrince("side"); orb.dataset.orb = "active";
      orbit.beam(pct(SPOTS.orb), at, 1.4); orbit.sparks(at, 18, GOLD); orbit.ring(at, 2, 10, GOLD);
      gsap.to(satellite, { scale: 0, rotation: 200, duration: .6, ease: "back.in(2)" });
      later(() => { setPrince("side-b"); show({ kind: "postcard", event: nextCard() }); play("citylights"); }, 1300);
      later(() => { settle(); flight.restart(true); }, 3600);
    };
    satellite.addEventListener("click", catchSatellite);
    const stopSatellite = onEgg("runaway-satellite", () => void bringIntoView(section).then(() => { gsap.set(satellite, { left: "80%", top: "8%", autoAlpha: 1, scale: 1 }); catchSatellite(); }));
    const stopFlight = observeMotionActivity(layer, (on) => { if (on) flight.resume(); else flight.pause(); });
    const stopEggs = onEgg(HERO_EGGS, (id) => void bringIntoView(section).then(() => { if (!disposed) replays[id]?.(); }));
    const clearConstellation = () => orbit.clearConstellation();
    addEventListener(CLEAR_CONSTELLATION, clearConstellation);

    // The camera voyage lives in its own sticky section right after the hero (AtlasVoyage): here the copy only drifts away.
    gsap.fromTo(".atlas-copy", { yPercent: 0, autoAlpha: 1 }, { yPercent: -10, autoAlpha: .2, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      disposed = true; active = false; cancelAnimationFrame(raf); timers = [];
      cancelIntro(); stopActivity(); orbit.destroy(); holo?.destroy(); stopEggs(); clearTimeout(statusTimer);
      removeEventListener(CLEAR_CONSTELLATION, clearConstellation);
      gsap.killTweensOf([status, crew, prince, orb, holoEl]);
      gsap.set([status, crew, prince, orb], { clearProps: "all" });
      gsap.set(holoEl, { clearProps: "filter,opacity,visibility" });
      status.textContent = "";
      for (const key of ["stage", "pose", "prince"]) delete section.dataset[key];
      delete crew.dataset.acting; delete prince.dataset.acting; delete holoEl.dataset.ready;
      [...crewPoses, ...princePoses].forEach((element) => { delete element.dataset.active; });
      orb.dataset.orb = "idle"; holoEl.dataset.holo = "idle";
      hotspots.forEach((button) => { button.hidden = true; button.removeEventListener("click", onHot); });
      flight.kill(); stopFlight(); stopSatellite(); satellite.removeEventListener("click", catchSatellite); satellite.hidden = true; gsap.set(satellite, { clearProps: "all" });
    };
  }, { scope: hero, dependencies: [motion], revertOnUpdate: true });

  // The tablet joystick: drag the knob (with a spring back) or use the arrow keys; Esc closes.
  useEffect(() => {
    if (!tablet || !pad.current) return;
    const knob = pad.current.querySelector(".atlas-tablet__knob")!;
    const [drag] = Draggable.create(knob, { type: "x,y", bounds: pad.current, onDrag() { holoRef.current?.nudge(this.deltaX * .03, this.deltaY * .015); }, onRelease() { gsap.to(knob, { x: 0, y: 0, duration: .35, ease: "back.out(2)" }); } });
    return () => { drag.kill(); };
  }, [tablet]);
  const tabletKey = (event: React.KeyboardEvent) => {
    const deltas: Record<string, [number, number]> = { ArrowLeft: [-.2, 0], ArrowRight: [.2, 0], ArrowUp: [0, -.1], ArrowDown: [0, .1] };
    if (event.key === "Escape") { setTablet(false); return; }
    if (deltas[event.key] && (event.target as HTMLElement).closest(".atlas-tablet__pad")) { event.preventDefault(); holoRef.current?.nudge(...deltas[event.key]); }
  };
  const pickYear = (value: string) => { setTabletYear(value); play("switch"); holoRef.current?.show(value ? yearMarkers.find((row) => row.year === Number(value))?.markers ?? [] : null); };
  const region = (lat: number, lon: number) => { play("click-atlas"); holoRef.current?.focus(lat, lon); };
  const close = () => {
    const kind = reading?.kind;
    setReading(null);
    const section = hero.current;
    if (!section) return;
    section.querySelector<HTMLElement>(".atlas-holo")!.dataset.holo = "idle";
    section.querySelector<HTMLElement>(".atlas-orb")!.dataset.orb = "idle";
    section.querySelector<HTMLButtonElement>(`.atlas-hot--${kind === "visor" ? "prince" : "glaucia"}`)?.focus({ preventScroll: true });
    window.dispatchEvent(new Event(CLEAR_CONSTELLATION));
  };
  const again = () => { setReading(null); emitEgg("dog-navigation"); };
  const event = reading?.kind === "visor" ? reading.event : null;
  const postcard = reading?.kind === "postcard" ? reading.event : null;
  const place = event && (event.formato === "presencial" ? copy.readout.origin.replace("{city}", [event.cidade, event.pais].filter(Boolean).join(", ")) : copy.readout.remoteOrigin);

  return <section ref={hero} className="page-hero home-hero-v2 atlas-hero" aria-labelledby={labelledBy} data-motion={motion}>
    {children}
    <span className="sky-vignette" aria-hidden="true" />
    <p className="atlas-status" role="status" aria-live="polite" />
    <p className="sky-touch-hint" aria-hidden="true"><span />{copy.touch}</p>
    {/* Touch and small screens: the scene's hotspots are tiny there, so the same actions live in a dock under it. */}
    <div className="atlas-dock" role="group" aria-label={copy.dock.label}>
      {([["glaucia", copy.dock.tablet], ["holo", copy.dock.holo], ["prince", copy.dock.prince]] as const).map(([hot, label]) => <button key={hot} type="button" data-dock={hot} onClick={() => hero.current?.querySelector<HTMLButtonElement>(`.atlas-hot--${hot}`)?.click()}>{label}</button>)}
      <button type="button" data-dock="satellite" onClick={() => emitEgg("runaway-satellite")}>{copy.dock.satellite}</button>
    </div>
    {tablet && <div className="atlas-tablet" role="dialog" aria-labelledby="atlas-tablet-title" onKeyDown={tabletKey}>
      <p className="atlas-tablet__title" id="atlas-tablet-title">{copy.tablet.title}</p>
      <div className="atlas-tablet__pad" ref={pad} tabIndex={0} role="application" aria-label={copy.tablet.rotate} title={copy.tablet.rotate}><i className="atlas-tablet__knob" /></div>
      <div className="atlas-tablet__row" role="group" aria-label={copy.tablet.regions}>
        <button type="button" onClick={() => region(-15, -50)}>{copy.tablet.brasil}</button>
        <button type="button" onClick={() => region(25, -85)}>{copy.tablet.americas}</button>
        <button type="button" onClick={() => region(42, 10)}>{copy.tablet.europa}</button>
      </div>
      <label className="atlas-tablet__year"><span>{copy.tablet.year}</span><select value={tabletYear} onChange={(event) => pickYear(event.target.value)}><option value="">{copy.tablet.all}</option>{yearMarkers.map((row) => <option key={row.year} value={row.year}>{row.year} · {row.markers.length}</option>)}</select></label>
      <div className="atlas-tablet__row">
        <button type="button" className="atlas-tablet__action" onClick={() => controls.current?.constellation()}>{copy.tablet.constellation}</button>
        <button type="button" className="atlas-tablet__action" onClick={() => controls.current?.orbit()}>{copy.tablet.orbit}</button>
      </div>
      <button type="button" className="atlas-tablet__close" onClick={() => { setTablet(false); pickYear(""); }} aria-label={copy.tablet.close}>×</button>
    </div>}
    <div className="atlas-readout" data-kind={reading?.kind} hidden={!reading} role="region" aria-labelledby="atlas-readout-title">
      {postcard && <>
        <p className="atlas-readout__kicker">{copy.prince.postcard.replace("{city}", [postcard.cidade, postcard.pais].filter(Boolean).join(", "))} · {postcard.ano}</p>
        <p className="atlas-readout__title" id="atlas-readout-title" ref={readoutTitle} tabIndex={-1}><a href={postcard.fonte} target="_blank" rel="noopener noreferrer">{postcard.nome}<span aria-hidden="true"> ↗</span></a></p>
        <p className="atlas-readout__note">{copy.prince.postcardNote}</p>
        <p className="atlas-readout__actions"><a href={`#${eventAnchor(postcard.id)}`} onClick={(click) => { if (findEvent(postcard.id)) click.preventDefault(); }}>{copy.readout.log}</a><button type="button" onClick={close}>{copy.readout.close}</button></p>
      </>}
      {event && <>
        <div className="atlas-readout__visor">
          <span className="atlas-readout__face" aria-hidden="true">{FACES.map((name, index) => <i key={name} data-on={face === index || undefined} style={{ backgroundImage: `url(${faces[name].src})` }} />)}</span>
          <div>
            <p className="atlas-readout__kicker">{copy.readout.visor}</p>
            <p className="atlas-readout__place" data-format={event.formato}>{place}</p>
          </div>
        </div>
        <p className="atlas-readout__title" id="atlas-readout-title" ref={readoutTitle} tabIndex={-1}><a href={event.fonte} target="_blank" rel="noopener noreferrer">{event.nome}<span aria-hidden="true"> ↗</span></a></p>
        <dl className="atlas-readout__data">
          <div><dt>{copy.readout.year}</dt><dd>{event.ano}</dd></div>
          <div><dt>{copy.readout.format}</dt><dd>{copy.formats[event.formato]}</dd></div>
          <div><dt>{copy.readout.type}</dt><dd>{types[event.tipo]}</dd></div>
          <div><dt>{copy.readout.language}</dt><dd>{copy.languages[event.idioma]}</dd></div>
        </dl>
        <p className="atlas-readout__actions">
          <a href={`#${eventAnchor(event.id)}`} onClick={(click) => { if (findEvent(event.id)) click.preventDefault(); }}>{copy.readout.log}</a>
          <button type="button" onClick={again}>{copy.readout.again}</button>
          <button type="button" onClick={close}>{copy.readout.close}</button>
        </p>
      </>}
      {reading?.kind === "constellation" && <>
        <p className="atlas-readout__kicker">{copy.readout.constellation}</p>
        <p className="atlas-readout__title" id="atlas-readout-title" ref={readoutTitle} tabIndex={-1}>{copy.readout.constellationName}</p>
        <p className="atlas-readout__note">{copy.readout.constellationNote}</p>
        <details className="atlas-readout__stars">
          <summary>{copy.readout.stars.replace("{n}", format.format(stars.length))}</summary>
          <ol>{stars.map((star) => <li key={`${star.cidade}-${star.pais}`}><span>{star.cidade}{star.pais ? `, ${star.pais}` : ""}</span><b>{star.first}</b></li>)}</ol>
        </details>
        <p className="atlas-readout__actions"><button type="button" onClick={close}>{copy.readout.close}</button></p>
      </>}
    </div>
  </section>;
}
