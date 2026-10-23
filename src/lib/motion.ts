export function shouldReduceMotion(systemPreference: boolean, manualPreference: boolean) {
  return systemPreference || manualPreference;
}

// A single lifecycle for canvas loops: no frames while hidden, offscreen or reduced.
export function observeMotionActivity(element: Element, onChange: (active: boolean) => void) {
  const system = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  const update = () => onChange(visible && !document.hidden && !shouldReduceMotion(system.matches, document.documentElement.classList.contains("reduce-motion")));
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
  intersection.observe(element);
  const preference = new MutationObserver(update);
  preference.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("visibilitychange", update);
  system.addEventListener("change", update);
  update();
  return () => { intersection.disconnect(); preference.disconnect(); document.removeEventListener("visibilitychange", update); system.removeEventListener("change", update); };
}
