// Easter egg registry shared by every page. Triggers (keyboard, touch gestures, the Comlink) only emit an id;
// the component that owns the effect listens, plays it and marks it as discovered.
export type EggPage = "global" | "home" | "about";
export const EGGS = [
  { id: "konami", page: "global", phrases: ["konami", "uuddlrlrba"] },
  { id: "force-push", page: "home", phrases: ["push", "empurrar", "empujar"] },
  { id: "force-hold", page: "home", phrases: ["forca", "force", "fuerza", "xwing"] },
  { id: "deflect", page: "home", phrases: ["deflect", "rebater", "desviar"] },
  { id: "ion", page: "about", phrases: ["ion", "ions", "iones", "canhao", "canon", "cannon"] },
  { id: "holo", page: "about", phrases: ["helpme", "obiwan", "ajudame", "ayudame"] },
  { id: "iknow", page: "about", phrases: ["euteamo", "iloveyou", "tequiero"] },
  { id: "blizzard", page: "about", phrases: ["hoth", "nevasca", "blizzard", "ventisca"] },
  { id: "ice", page: "about", phrases: ["degelo", "thaw", "deshielo"] },
  { id: "probe", page: "about", phrases: ["sonda", "probe"] },
  { id: "tauntaun", page: "about", phrases: ["tauntaun"] },
  { id: "threepio-arm", page: "about", phrases: ["cpo", "threepio", "droide", "droid"] },
  { id: "settle", page: "about", phrases: ["neve", "snow", "nieve"] },
] as const satisfies readonly { id: string; page: EggPage; phrases: readonly string[] }[];
export type EggId = (typeof EGGS)[number]["id"];

export const FOUND_KEY = "holonet-secrets";
export const PLAY_EVENT = "egg:play";
export const FOUND_EVENT = "egg:found";

// Letters only, accents removed: "Eu te amo!" → "euteamo", "Canhão" → "canhao".
export const normalizePhrase = (text: string) => text.normalize("NFD").replace(/[^a-zA-Z]/g, "").toLowerCase();

export function pageOf(pathname: string): EggPage {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length <= 1 ? "home" : parts[1] === "sobre" ? "about" : "global";
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

export function discover(id: EggId) {
  if (typeof window === "undefined") return;
  const found = readFound(store());
  if (found.includes(id)) return;
  try { store()?.setItem(FOUND_KEY, JSON.stringify([...found, id])); } catch { /* The secret still counts for this visit. */ }
  window.dispatchEvent(new CustomEvent(FOUND_EVENT, { detail: id }));
}

// Wipes every discovered secret (the Comlink's "wipe memory"), so the hunt starts over.
export function forget(storage: Pick<Storage, "removeItem"> | undefined = typeof window === "undefined" ? undefined : store()) {
  try { storage?.removeItem(FOUND_KEY); } catch { /* Nothing stored, nothing to wipe. */ }
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
    const box = element.getBoundingClientRect();
    if (box.top >= 0 && box.bottom <= innerHeight) return resolve();
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(element as HTMLElement, { offset: -100, onComplete: () => resolve() });
    else { element.scrollIntoView({ block: "center" }); setTimeout(resolve, 60); }
    setTimeout(resolve, 1600);
  });
}
