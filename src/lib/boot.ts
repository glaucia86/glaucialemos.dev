export const BOOT_KEY = "galaxia-boot";
export const NIVEORA_BOOT_KEY = "niveora-boot";
export const MARTE_BOOT_KEY = "marte-boot";
export const BOOT_DONE_EVENT = "holonet:boot-done";

export function shouldBoot({ seen, systemReduced, manualReduced }: { seen: boolean; systemReduced: boolean; manualReduced: boolean }) {
  return !seen && !systemReduced && !manualReduced;
}

// Runs before the page paints. Without JavaScript the overlay is never shown.
export const bootScriptFor = (key: string) => `(function(){try{var d=document.documentElement;var seen=sessionStorage.getItem("${key}")==="done";var manual=localStorage.getItem("reduce-motion")==="true";var system=matchMedia("(prefers-reduced-motion: reduce)").matches;if(!seen&&!manual&&!system){d.dataset.boot="pending";}}catch(e){}})();`;
export const bootScript = bootScriptFor(BOOT_KEY);

export function bootSeen(key = BOOT_KEY) {
  try { return sessionStorage.getItem(key) === "done"; } catch { return false; }
}

export function finishBoot(key = BOOT_KEY) {
  const root = document.documentElement;
  try { sessionStorage.setItem(key, "done"); } catch { /* Private browsing can still finish the boot. */ }
  if (root.dataset.boot === "done") return;
  root.dataset.boot = "done";
  window.dispatchEvent(new Event(BOOT_DONE_EVENT));
}

export function whenBootDone(callback: () => void) {
  if (document.documentElement.dataset.boot !== "pending") { callback(); return () => {}; }
  window.addEventListener(BOOT_DONE_EVENT, callback, { once: true });
  return () => window.removeEventListener(BOOT_DONE_EVENT, callback);
}
