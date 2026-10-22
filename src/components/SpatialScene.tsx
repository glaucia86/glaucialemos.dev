"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { shouldReduceMotion } from "@/lib/motion";
import { advanceStory, cameraMotion, clamp, smooth, showOrientationPermission, type OrientationPermission, type StoryClock } from "@/lib/spatial-motion";
import { Atmosphere, Character, Foreground, SceneLighting, characterFor, position, spatialScenes } from "./SpatialSceneArt";

export type SpatialSceneLabels = { enable3d: string; dismiss3d: string };
type OrientationAPI = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

export function SpatialScene({ image, imageAlt, labels }: { image: string; imageAlt: string; labels: SpatialSceneLabels }) {
  const config = spatialScenes[image as keyof typeof spatialScenes];
  const ref = useRef<HTMLDivElement>(null);
  const requestedBeat = useRef(false);
  const timeline = useRef({ config, elapsed: 0, story: { until: 0, next: 0 } as StoryClock });
  const [permission, setPermission] = useState<OrientationPermission>("prompt");
  const [dismissed, setDismissed] = useState(false);
  const [capabilities, setCapabilities] = useState({ mobile: false, supported: false, requiresPermission: false, reduced: true });

  useEffect(() => {
    const root = ref.current;
    const hero = root?.closest<HTMLElement>(".page-hero");
    if (!root || !hero || !config) return;
    const cameras = [...root.querySelectorAll<HTMLElement>("[data-camera]")];
    const depths = [...root.querySelectorAll<HTMLElement>("[data-depth]")];
    const target = root.querySelector<HTMLButtonElement>(".scene-target")!;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    const orientationAPI = window.DeviceOrientationEvent as OrientationAPI | undefined;
    const supported = Boolean(orientationAPI);
    const requiresPermission = typeof orientationAPI?.requestPermission === "function";
    let reduced = true;
    let visible = false;
    let frame = 0;
    let previous = 0;
    if (timeline.current.config !== config) {
      timeline.current = { config, elapsed: 0, story: { until: 0, next: 0 } };
    }
    const clock = timeline.current;
    const fog = [...root.querySelectorAll<HTMLElement>("[data-fog]")];
    const foreground = root.querySelector<HTMLElement>(".scene-foreground")!;
    // Randomize once after hydration; never introduce server/client markup drift.
    root.querySelectorAll<HTMLElement>("[data-particle]").forEach((particle) => {
      particle.style.setProperty("--delay", `${-Math.random() * 20}s`);
    });
    let x = 0;
    let y = 0;
    let pointer: { x: number; y: number } | null = null;
    let gyro: { x: number; y: number } | null = null;
    let baseline: { beta: number; gamma: number } | null = null;
    let listening = false;
    let measure = true;
    let box = root.getBoundingClientRect();
    let granted = permission === "granted";
    try {
      setDismissed(sessionStorage.getItem("spatial-dismissed") === "true");
      granted ||= sessionStorage.getItem("spatial-permission") === "granted";
      if (granted) setPermission("granted");
    } catch { /* Storage is optional, including private browsing. */ }

    const orient = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
      baseline ??= { beta: event.beta, gamma: event.gamma };
      const angle = (screen.orientation?.angle ?? (window as Window & { orientation?: number }).orientation ?? 0) * Math.PI / 180;
      const horizontal = event.gamma - baseline.gamma;
      const vertical = event.beta - baseline.beta;
      // Event handlers only capture input; the one animation loop smooths it.
      gyro = {
        x: clamp((horizontal * Math.cos(angle) + vertical * Math.sin(angle)) / 25, -1, 1),
        y: clamp((vertical * Math.cos(angle) - horizontal * Math.sin(angle)) / 25, -1, 1),
      };
    };
    const resetOrientation = () => { baseline = null; gyro = null; };
    const syncSensor = () => {
      const enabled = !reduced && visible && !document.hidden && coarse.matches && supported && (!requiresPermission || granted);
      if (enabled === listening) return;
      listening = enabled;
      if (enabled) window.addEventListener("deviceorientation", orient, { passive: true });
      else { window.removeEventListener("deviceorientation", orient); resetOrientation(); }
    };
    const tick = (now: number) => {
      const dt = previous ? clamp(now - previous, 0, 64) : 16;
      previous = now;
      clock.elapsed += dt;
      const elapsed = clock.elapsed;
      if (measure) { box = root.getBoundingClientRect(); measure = false; }
      const scroll = clamp(-box.top / Math.max(box.height, 1), -1, 1);
      const input = coarse.matches ? gyro : pointer;
      const driftX = Math.sin(elapsed / 6500) * .25;
      const driftY = Math.sin(elapsed / 8300) * .18;
      x = smooth(x, input?.x ?? driftX, dt);
      y = smooth(y, (input?.y ?? driftY) + scroll * .7, dt);
      // Keep traced pixels registered while separate fog/rock/foreground planes
      // travel at their own depths. Camera movement continues during pointer input.
      const cameraPose = cameraMotion(elapsed, config.camera);
      for (const camera of cameras) camera.style.transform = `translate3d(${cameraPose.pan + x * 10 * config.layers.background}px, ${y * 8 * config.layers.background}px, 0) scale(${cameraPose.scale})`;
      for (const layer of depths) {
        if (layer === foreground) continue;
        const depth = Number(layer.dataset.depth);
        layer.style.transform = `translate3d(${(x * 10 + cameraPose.pan) * depth}px, ${y * 8 * depth}px, 0)`;
      }
      foreground.style.transform = `translate3d(${(x * 10 + cameraPose.pan * 2.2) * config.layers.foreground}px, ${y * 8 * config.layers.foreground}px, 0) scale(${cameraPose.foregroundScale})`;
      for (const [index, layer] of fog.entries()) {
        layer.style.transform = `translate3d(${-cameraPose.pan * (2 + index) + Math.sin(elapsed / 9000) * 5}px, 0, 0)`;
      }
      clock.story = advanceStory(clock.story, elapsed, config.story.duration, requestedBeat.current);
      requestedBeat.current = false;
      if (elapsed < clock.story.until) {
        if (root.dataset.story !== config.story.beat) root.dataset.story = config.story.beat;
      } else if (root.dataset.story) delete root.dataset.story;
      frame = requestAnimationFrame(tick);
    };
    const syncLoop = () => {
      const active = !reduced && visible && !document.hidden;
      root.dataset.active = String(active);
      syncSensor();
      if (active && !frame) { previous = 0; measure = true; frame = requestAnimationFrame(tick); }
      if (!active) { cancelAnimationFrame(frame); frame = 0; }
    };
    const syncMotion = () => {
      let saved = false;
      try { saved = localStorage.getItem("reduce-motion") === "true"; } catch { /* Storage is optional. */ }
      reduced = shouldReduceMotion(media.matches, document.documentElement.classList.contains("reduce-motion") || saved);
      root.dataset.reduced = String(reduced);
      target.disabled = reduced;
      setCapabilities({ mobile: coarse.matches, supported, requiresPermission, reduced });
      if (reduced) {
        cameras.forEach((camera) => camera.style.removeProperty("transform"));
        depths.forEach((layer) => layer.style.removeProperty("transform"));
        fog.forEach((layer) => layer.style.removeProperty("transform"));
        delete root.dataset.story;
        requestedBeat.current = false;
        clock.elapsed = 0;
        clock.story = { until: 0, next: 0 };
        x = y = 0;
        pointer = null;
      }
      syncLoop();
    };
    const move = (event: PointerEvent) => {
      if (reduced || event.pointerType === "touch") return;
      pointer = { x: clamp((event.clientX - box.left) / box.width * 2 - 1, -1, 1), y: clamp((event.clientY - box.top) / box.height * 2 - 1, -1, 1) };
    };
    const leave = () => { pointer = null; };
    const invalidate = () => { measure = true; };
    const observer = new MutationObserver(syncMotion);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncLoop(); });
    intersection.observe(root);
    const resize = new ResizeObserver(invalidate);
    resize.observe(hero);
    media.addEventListener("change", syncMotion);
    coarse.addEventListener("change", syncMotion);
    window.addEventListener("storage", syncMotion);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    window.addEventListener("orientationchange", resetOrientation);
    document.addEventListener("visibilitychange", syncLoop);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", leave);
    syncMotion();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("deviceorientation", orient);
      observer.disconnect();
      intersection.disconnect();
      resize.disconnect();
      media.removeEventListener("change", syncMotion);
      coarse.removeEventListener("change", syncMotion);
      window.removeEventListener("storage", syncMotion);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("orientationchange", resetOrientation);
      document.removeEventListener("visibilitychange", syncLoop);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
    };
  }, [config, permission]);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem("spatial-dismissed", "true"); } catch { /* Optional. */ }
  };
  const enableOrientation = async () => {
    if (capabilities.reduced || permission !== "prompt") return;
    const api = window.DeviceOrientationEvent as OrientationAPI | undefined;
    if (!api?.requestPermission) return;
    setPermission("pending");
    try {
      // Call synchronously from this click, before awaiting, for iOS activation.
      const result = await api.requestPermission();
      setPermission(result);
      if (result === "granted") {
        try { sessionStorage.setItem("spatial-permission", "granted"); } catch { /* Optional. */ }
      } else dismiss();
    } catch {
      setPermission("denied");
      dismiss();
    }
  };
  const react = () => {
    const root = ref.current;
    if (!root || root.dataset.reduced !== "false" || root.dataset.story) return;
    requestedBeat.current = true;
  };

  if (!config) return <><Image className="page-hero__image" src={image} alt={imageAlt} fill priority sizes="100vw" /><div className="page-hero__shade" aria-hidden="true" /></>;
  const { scene, Details, Environment, layers, color } = config;
  const character = characterFor(scene);
  const [cx, cy, cw, ch] = character.bounds;
  return <div ref={ref} className={`spatial-scene spatial-scene--${scene}`} data-active="false" style={{ "--scene-color": color, "--story-duration": `${config.story.duration}ms` } as CSSProperties}>
    <div className="scene-frame">
      <div className="scene-camera" data-camera>
        <div className="scene-image-plane">
          <Image className="scene-background" src={image} alt={imageAlt} fill priority sizes="100vw" />
          <SceneLighting scene={scene} />
        </div>
      </div>
      <div className="page-hero__shade" aria-hidden="true" />
    </div>
    <div className="scene-mid-camera" data-camera>
      <div className="scene-image-plane">
        <div className="scene-mid" data-depth={layers.mid - layers.background}>
          <div className="scene-art" aria-hidden="true">
            <div className="scene-character" style={{ "--character-origin": `${(cx + cw / 2) / 1024 * 100}% ${(cy + ch) / 576 * 100}%` } as CSSProperties}>
              <Character scene={scene} image={image} />
              {Details && <Details />}
            </div>
            {Environment && <Environment />}
            <Atmosphere />
          </div>
          <button className="scene-target" type="button" aria-label={character.name} title={character.name}
            style={position(...character.bounds)} onPointerEnter={react} onFocus={react} onClick={react} />
        </div>
      </div>
    </div>
    <div className="scene-foreground" data-depth={layers.foreground}><Foreground /></div>
    {showOrientationPermission({ ...capabilities, permission, dismissed }) && <div className="scene-permission">
      <button type="button" onClick={enableOrientation}>{labels.enable3d}</button>
      <button type="button" onClick={dismiss} aria-label={labels.dismiss3d}>×</button>
    </div>}
  </div>;
}
