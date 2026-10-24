// Scene sprites sit under the hero copy, so clicks are matched against their boxes instead of DOM targets.
export function isNear(element: Element | null | undefined, event: MouseEvent, scale = 2.5, min = 48) {
  if (!element) return false;
  const box = element.getBoundingClientRect();
  const reach = Math.max(min, Math.max(box.width, box.height) * scale / 2);
  return Math.hypot(event.clientX - (box.left + box.width / 2), event.clientY - (box.top + box.height / 2)) <= reach;
}

// Clicks on links, buttons or the copy itself never trigger scene effects.
export const isSceneClick = (event: MouseEvent) => !(event.target as Element).closest("a, button, input, textarea, .echo-copy > *, dialog, .echo-hud__readout, .ice-block");

export function isInside(element: Element | null | undefined, event: { clientX: number; clientY: number }, pad = 0) {
  if (!element) return false;
  const box = element.getBoundingClientRect();
  return event.clientX >= box.left - pad && event.clientX <= box.right + pad && event.clientY >= box.top - pad && event.clientY <= box.bottom + pad;
}
