// Easter egg registry shared by every page. Triggers (keyboard, touch gestures, the Comlink) only emit an id;
// the component that owns the effect listens, plays it and marks it as discovered.
import { EGGS, type EggId, type EggPage } from "./egg-catalog";
import { epilogueRemaining } from "./epilogue";
import { MOBILE_EGG_QUERY } from "./mobile-eggs";
export { EGGS, type EggId, type EggPage } from "./egg-catalog";

export function remainingDiscoveries(id: EggId, found: readonly string[]): number {
  if (id === "epilogue-signal") return epilogueRemaining(found);
  if (id !== "curious-letter") return 0;
  const count = EGGS.filter(egg => egg.id !== "curious-letter" && found.includes(egg.id)).length;
  return Math.max(0, 3 - count);
}

// v2: Galáxia Encantada. Discoveries from the previous theme are not carried over.
export const FOUND_KEY = "galaxia-encantada:eggs:v2";
export const PLAY_EVENT = "egg:play";
export const FOUND_EVENT = "egg:found";
export const RESET_EVENT = "egg:reset";

// Letters only, accents removed: "Eu te amo!" → "euteamo", "Canhão" → "canhao".
export const normalizePhrase = (text: string) => text.normalize("NFD").replace(/[^a-zA-Z]/g, "").toLowerCase();

const PAGES: Record<string, EggPage> = { sobre: "about", projetos: "projects", conteudo: "content", eventos: "events", servicos: "services", "alem-da-ultima-orbita": "epilogue" };

export function pageOf(pathname: string): EggPage {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return "home";
  return parts.length === 2 ? PAGES[parts[1]] ?? "notfound" : "notfound";
}

export const eggsFor = (page: EggPage) => EGGS.filter((egg) => egg.page === "global" || egg.page === page);

// Exact phrase, as typed in the Comlink terminal.
export function matchPhrase(text: string, ids: readonly EggId[] = EGGS.map((egg) => egg.id)) {
  const phrase = normalizePhrase(text);
  return EGGS.find((egg) => ids.includes(egg.id) && (egg.phrases as readonly string[]).includes(phrase))?.id ?? null;
}

// Phrase at the end of a running keyboard buffer, for typing straight onto the page.
export function matchTail(buffer: string, ids: readonly EggId[]) {
  return EGGS.find((egg) => ids.includes(egg.id) && egg.phrases.some((phrase) => buffer.endsWith(phrase)))?.id ?? null;
}

export function readFound(storage: Pick<Storage, "getItem"> | undefined): EggId[] {
  try {
    const value: unknown = JSON.parse(storage?.getItem(FOUND_KEY) ?? "[]");
    return Array.isArray(value) ? EGGS.map((egg) => egg.id).filter((id) => value.includes(id)) : [];
  } catch { return []; }
}

function store() { try { return window.localStorage; } catch { return undefined; } }

// In-memory fallback keeps this visit usable if reading/writing storage is denied.
let volatileFound: EggId[] | undefined;
export function getFoundSnapshot(): string {
  if (typeof window === "undefined") return "";
  return (volatileFound ?? readFound(store())).join(",");
}

export function subscribeFound(notify: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== FOUND_KEY) return;
    volatileFound = undefined; notify();
  };
  window.addEventListener(FOUND_EVENT, notify);
  window.addEventListener(RESET_EVENT, notify);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(FOUND_EVENT, notify);
    window.removeEventListener(RESET_EVENT, notify);
    window.removeEventListener("storage", storage);
  };
}

// A reset is explicit, never inferred from an unrelated discovery event.
export function subscribeReset(run: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === null || (event.key === FOUND_KEY && readFound({ getItem: () => event.newValue }).length === 0)) run();
  };
  window.addEventListener(RESET_EVENT, run); window.addEventListener("storage", storage);
  return () => { window.removeEventListener(RESET_EVENT, run); window.removeEventListener("storage", storage); };
}

export function discover(id: EggId) {
  if (typeof window === "undefined") return;
  const found = getFoundSnapshot().split(",").filter(Boolean) as EggId[];
  if (found.includes(id) || remainingDiscoveries(id, found) > 0) return;
  const next = EGGS.map(egg => egg.id).filter(key => key === id || found.includes(key));
  volatileFound = next;
  try {
    const storage = store();
    if (storage) { storage.setItem(FOUND_KEY, JSON.stringify(next)); volatileFound = undefined; }
  } catch { /* Keep the in-memory fallback. */ }
  window.dispatchEvent(new CustomEvent(FOUND_EVENT, { detail: id }));
}

export function forget(storage: Pick<Storage, "removeItem"> | undefined = typeof window === "undefined" ? undefined : store()) {
  volatileFound = [];
  try { if (storage) { storage.removeItem(FOUND_KEY); volatileFound = undefined; } } catch { /* Reset this visit even if storage is blocked. */ }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(RESET_EVENT));
}

export const emitEgg = (id: EggId) => window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }));

export function onEgg(ids: EggId | EggId[], run: (id: EggId) => void) {
  const wanted = Array.isArray(ids) ? ids : [ids];
  const listener = (event: Event) => { const id = (event as CustomEvent<EggId>).detail; if (wanted.includes(id)) run(id); };
  window.addEventListener(PLAY_EVENT, listener);
  return () => window.removeEventListener(PLAY_EVENT, listener);
}

// Konami for touch screens: swipe up, up, down, down, left, right, left, right, then tap twice.
export type Gesture = "up" | "down" | "left" | "right" | "tap";
export const KONAMI_GESTURES: Gesture[] = ["up", "up", "down", "down", "left", "right", "left", "right", "tap", "tap"];

export function gestureOf(dx: number, dy: number, ms: number): Gesture | null {
  const distance = Math.hypot(dx, dy);
  if (distance < 12 && ms < 300) return "tap";
  if (distance < 40 || ms > 700) return null;
  if (Math.abs(dx) > Math.abs(dy) * 1.6) return dx > 0 ? "right" : "left";
  if (Math.abs(dy) > Math.abs(dx) * 1.6) return dy > 0 ? "down" : "up";
  return null;
}

// Returns the new position in the sequence; equal to the length when complete.
export function konamiStep(position: number, gesture: Gesture) {
  if (KONAMI_GESTURES[position] === gesture) return position + 1;
  return gesture === KONAMI_GESTURES[0] ? 1 : 0;
}

export function buzz(pattern: number | number[]) {
  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion")) return;
    navigator.vibrate?.(pattern);
  } catch { /* Vibration is a bonus. */ }
}

// Smoothly brings an element into view before replaying an effect from the Comlink.
export function bringIntoView(element: Element | null) {
  return new Promise<void>((resolve) => {
    if (!element) return resolve();
    // Mobile hero copy extends below the art. Centering the entire section hides
    // its scene and pauses the owner before it can play the requested effect.
    if (matchMedia(MOBILE_EGG_QUERY).matches && element.matches(".page-hero")) {
      element = element.querySelector(".mobile-eggs") ?? element;
    }
    const box = element.getBoundingClientRect();
    if (box.top >= 0 && box.bottom <= innerHeight) return resolve();
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(element as HTMLElement, { offset: -100, onComplete: () => resolve() });
    else { element.scrollIntoView({ block: "center" }); setTimeout(resolve, 60); }
    setTimeout(resolve, 1600);
  });
}
