export const BOOT_KEY = "holonet-boot";
export const BOOT_DONE_EVENT = "holonet:boot-done";

export function shouldBoot({ seen, systemReduced, manualReduced }: { seen: boolean; systemReduced: boolean; manualReduced: boolean }) {
  return !seen && !systemReduced && !manualReduced;
}

// Runs before the home paints. Without JavaScript the overlay is never shown.
export const bootScript = `(function(){try{var d=document.documentElement;var seen=sessionStorage.getItem("${BOOT_KEY}")==="done";var manual=localStorage.getItem("reduce-motion")==="true";var system=matchMedia("(prefers-reduced-motion: reduce)").matches;if(!seen&&!manual&&!system){d.dataset.boot="pending";}}catch(e){}})();`;

export function finishBoot() {
  const root = document.documentElement;
  try { sessionStorage.setItem(BOOT_KEY, "done"); } catch { /* Private browsing can still finish the boot. */ }
  if (root.dataset.boot === "done") return;
  root.dataset.boot = "done";
  window.dispatchEvent(new Event(BOOT_DONE_EVENT));
}

export function whenBootDone(callback: () => void) {
  if (document.documentElement.dataset.boot !== "pending") { callback(); return () => {}; }
  window.addEventListener(BOOT_DONE_EVENT, callback, { once: true });
  return () => window.removeEventListener(BOOT_DONE_EVENT, callback);
}
