import { EGGS, type EggId } from "./egg-catalog";

// Reuse verbatim in matchMedia and the mobile CSS comment when the UI is integrated.
// The short-landscape clause matches responsive.css and excludes fine-pointer desktops.
export const MOBILE_EGG_QUERY = "(orientation: portrait) and (max-width: 820px), (pointer: coarse) and (max-width: 820px), (pointer: coarse) and (orientation: landscape) and (max-height: 520px)";

export type MobileWorld = "home" | "about" | "projects" | "content" | "events" | "services" | "notfound" | "epilogue";
export type MobileHotspot = { id: EggId; x: number; y: number; size: number; kind: "tap" | "hold"; gated?: boolean };

export const MIN_HOTSPOT_PX = 60;
// size is diameter in plate-width percent. The spec supplies centers but no diameters;
// use 64px on its reference 1280px plate. Rendering must clamp to MIN_HOTSPOT_PX.
const spot = (id: EggId, x: number, y: number, kind: MobileHotspot["kind"] = "tap", gated?: boolean): MobileHotspot =>
  ({ id, x, y, size: 5, kind, ...(gated ? { gated } : {}) });

export const MOBILE_HOTSPOTS: Record<MobileWorld, readonly MobileHotspot[]> = {
  home: [
    spot("focus-lens", 82.5, 56), spot("dog-signal", 79, 84), spot("hangar-check", 91.8, 36),
    spot("dark-sky", 72.8, 77), spot("wish", 44, 34), spot("launch-charge", 62.5, 47, "hold"),
    spot("meteor-shower", 30, 35), spot("star-map", 56, 37),
  ],
  about: [
    spot("paw-tracks", 75.9, 72.7), spot("memory-capsule", 84.4, 46), spot("whiteout", 95, 84),
    spot("aurora-prism", 69, 70.7), spot("snowdrift", 38, 72), spot("between-lines", 52, 35),
    spot("borrowed-star", 40, 42), spot("deep-night", 18, 38),
  ],
  projects: [
    spot("rover-scan", 75.5, 57), spot("sample-cache", 77.4, 86), spot("terminal-launch", 95.5, 89),
    spot("first-sprout", 82, 38), spot("before-pretty", 63, 52), spot("lost-bug", 50, 78),
    spot("dust-fall", 70, 67), spot("lost-commit", 38, 84),
  ],
  content: [
    spot("crystal-whisper", 82.5, 75), spot("first-page", 73.5, 80), spot("prism-align", 68, 48),
    spot("crystal-echo", 94, 60), spot("series-constellation", 33, 36), spot("library-dusk", 88, 34),
    spot("retro-tv", 58, 72), spot("curious-letter", 47, 56, "tap", true),
  ],
  events: [
    spot("orbital-trail", 75.5, 58), spot("constellation-route", 92, 58), spot("dog-navigation", 84.4, 78.7),
    spot("prince-antenna", 35, 36), spot("paw-stamp", 62, 80), spot("runaway-satellite", 56, 36),
    spot("orbital-selfie", 58, 48, "hold"),
  ],
  services: [
    spot("garden-bloom", 87, 65), spot("beacon-relay", 77, 83), spot("pollination", 52, 86),
    spot("seed-vault", 70, 66), spot("greenhouse-dusk", 55, 36, "hold"), spot("ring-alignment", 36, 58),
    spot("epilogue-signal", 20, 60, "tap", true), spot("proposal-harvest", 92, 40),
  ],
  notfound: [spot("signal-recovered", 93.5, 64), spot("paw-rescue", 68, 85.5)],
  epilogue: [spot("last-light", 72, 41)],
};

/** Throws on missing/duplicate/unknown ids, wrong worlds or invalid plate coordinates. */
export function assertMobileHotspots(hotspots: Record<MobileWorld, readonly MobileHotspot[]> = MOBILE_HOTSPOTS): void {
  const seen = new Set<EggId>();
  const globals = { "star-map": "home", "deep-night": "about", "curious-letter": "content" } as const;
  for (const [world, entries] of Object.entries(hotspots)) {
    for (const h of entries) {
      const egg = EGGS.find(egg => egg.id === h.id);
      if (!egg) throw new Error(`Unknown mobile egg: ${h.id}`);
      if (seen.has(h.id)) throw new Error(`Duplicate mobile egg: ${h.id}`);
      seen.add(h.id);
      const assigned = egg.page === "global" ? globals[egg.id] : egg.page;
      if (assigned !== world) throw new Error(`Wrong mobile world: ${h.id}`);
      if (!Number.isFinite(h.x) || !Number.isFinite(h.y) || h.x < 0 || h.x > 100 || h.y < 33 || h.y > 100) {
        throw new Error(`Invalid mobile coordinates: ${h.id}`);
      }
      if (!Number.isFinite(h.size) || h.size <= 0) throw new Error(`Invalid mobile size: ${h.id}`);
    }
  }
  for (const egg of EGGS) if (!seen.has(egg.id)) throw new Error(`Missing mobile egg: ${egg.id}`);
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const plateWidth = (cw: number, ch: number) => Math.max(cw, 16 / 9 * ch);

export type MobileEggProjection = "cover" | "custom" | "red-tide" | "beyond-orbit";

/** Normalize percentage anchors and the epilogue's unitless fraction for shared drag math. */
export function mobilePanBinding(projection: MobileEggProjection) {
  const fraction = projection === "beyond-orbit";
  return {
    property: fraction ? "--fx" : projection === "red-tide" ? "--red-tide-x" : "--scene-x",
    read: (value: string) => (parseFloat(value) || 0) * (fraction ? 100 : 1),
    write: (value: number) => fraction ? String(clamp(value) / 100) : `${clamp(value)}%`,
  };
}

/** dxPx is pointer displacement: dragging right moves the plate right, reducing sceneX. */
export function panStep(startSceneX: number, dxPx: number, containerW: number, containerH: number): number {
  const overflow = plateWidth(containerW, containerH) - containerW;
  return overflow > 0 ? clamp(startSceneX - dxPx / overflow * 100) : clamp(startSceneX);
}

/** Cover projection with the shared heroes' bottom anchor (--scene-y: 100%).
 * Special 404/epilogue frames must adapt their own vertical anchor at integration.
 */
export function hotspotScreenPoint(h: MobileHotspot, sceneX: number, cw: number, ch: number): { x: number; y: number } {
  const width = plateWidth(cw, ch);
  const height = Math.max(ch, 0.5625 * cw);
  return { x: width * h.x / 100 - (width - cw) * clamp(sceneX) / 100, y: height * h.y / 100 - (height - ch) };
}

/** Aim for the left-of-center reading position, respecting margins and physical pan limits. */
export function sceneXToReveal(h: MobileHotspot, cw: number, ch: number, marginPx: number): number {
  const width = plateWidth(cw, ch);
  if (width <= cw) return 50;
  const margin = clamp(marginPx, 0, cw / 2);
  const target = clamp(cw * 0.4, margin, cw - margin);
  return clamp((width * h.x / 100 - target) / (width - cw) * 100);
}

export function edgeCues(sceneX: number, cw: number, ch: number): { left: boolean; right: boolean } {
  const overflow = plateWidth(cw, ch) > cw;
  const x = clamp(sceneX);
  return { left: overflow && x > 0, right: overflow && x < 100 };
}

/** Discovery history deliberately does not affect glow selection. */
export function nextGlowId(world: MobileWorld, prevId: EggId | null, rand: () => number): EggId {
  const entries = MOBILE_HOTSPOTS[world];
  const choices = entries.length > 1 ? entries.filter(h => h.id !== prevId) : entries;
  const index = Math.floor(clamp(rand(), 0, 1) * choices.length);
  return choices[Math.min(index, choices.length - 1)].id;
}

export const ARM_WINDOW_MS = 6000;
export const HOLD_MS = 900;
export type MobileEggState = { armed: EggId | null; armedAt: number; holdStartedAt: number | null };
export type MobileEggEvent =
  | { type: "tap" | "holdStart"; id: EggId; now: number }
  | { type: "holdEnd"; now: number }
  | { type: "clear" };
export type MobileEggResult = { state: MobileEggState; effect: "hint" | "trigger" | "none" | "locked" };
export const INITIAL_MOBILE_EGG_STATE: Readonly<MobileEggState> = { armed: null, armedAt: 0, holdStartedAt: null };

const byId = new Map(Object.values(MOBILE_HOTSPOTS).flat().map(h => [h.id, h]));
const idle = (): MobileEggState => ({ ...INITIAL_MOBILE_EGG_STATE });

/** Returns intent only: callers emitEgg on trigger, never discover or persist here.
 * Use one monotonic clock. clear also cancels holds on drag, outside tap or pointer cancellation.
 * A hold begun inside the arm window may finish outside it.
 */
export function mobileEggReducer(
  state: MobileEggState, event: MobileEggEvent, locked: (id: EggId) => boolean = () => false,
): MobileEggResult {
  if (event.type === "clear") return { state: idle(), effect: "none" };
  const fresh = state.armed !== null && event.now >= state.armedAt && event.now - state.armedAt <= ARM_WINDOW_MS;
  const finish = (id: EggId): MobileEggResult => ({
    state: idle(), effect: byId.get(id)?.gated && locked(id) ? "locked" : "trigger",
  });

  if (event.type === "holdEnd") {
    if (state.armed && state.holdStartedAt !== null && byId.get(state.armed)?.kind === "hold"
      && state.holdStartedAt >= state.armedAt && state.holdStartedAt - state.armedAt <= ARM_WINDOW_MS
      && event.now - state.holdStartedAt >= HOLD_MS) return finish(state.armed);
    return { state: fresh ? { ...state, holdStartedAt: null } : idle(), effect: "none" };
  }

  const hotspot = byId.get(event.id);
  if (event.type === "holdStart") {
    if (!fresh || state.armed !== event.id) return { state: idle(), effect: "none" };
    return { state: hotspot?.kind === "hold" ? { ...state, holdStartedAt: state.holdStartedAt ?? event.now } : state, effect: "none" };
  }

  // The finale star is a visible CTA, explicitly exempt from the hidden-egg hint step.
  if (event.id === "last-light" || (fresh && state.armed === event.id && hotspot?.kind === "tap")) return finish(event.id);
  return { state: { armed: event.id, armedAt: event.now, holdStartedAt: null }, effect: "hint" };
}

export const SCAN_COOLDOWN_MS = 15000;
export const SCAN_HIGHLIGHT_MS = 1600;

/** null means never scanned; zero is a valid timestamp. Progress is for a ring, never a counter. */
export function scanState(now: number, lastScanAt: number | null): { ready: boolean; highlighted: boolean; cooldownProgress: number } {
  if (lastScanAt === null) return { ready: true, highlighted: false, cooldownProgress: 1 };
  const elapsed = now - lastScanAt;
  return {
    ready: elapsed >= SCAN_COOLDOWN_MS,
    highlighted: elapsed >= 0 && elapsed < SCAN_HIGHLIGHT_MS,
    cooldownProgress: clamp(elapsed / SCAN_COOLDOWN_MS, 0, 1),
  };
}
