export function shouldReduceMotion(systemPreference: boolean, manualPreference: boolean) {
  return systemPreference || manualPreference;
}

/** Keeps canvas and numeric effects aligned with viewport and user preferences. */
export function observeMotion(
  element: Element,
  onChange: (state: { active: boolean; reduced: boolean; visible: boolean }) => void,
) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  const sync = () => {
    const reduced = shouldReduceMotion(preference.matches, document.documentElement.classList.contains("reduce-motion"));
    onChange({ active: visible && !document.hidden && !reduced, reduced, visible });
  };
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  const manual = new MutationObserver(sync);
  intersection.observe(element);
  manual.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  preference.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  sync();
  return () => {
    intersection.disconnect();
    manual.disconnect();
    preference.removeEventListener("change", sync);
    document.removeEventListener("visibilitychange", sync);
  };
}
