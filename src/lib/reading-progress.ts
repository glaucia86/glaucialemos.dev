export function getReadingProgress(y: number, height: number, viewport: number) {
  const extent = height - viewport;
  return extent > 0 ? Math.min(1, Math.max(0, y / extent)) : 0;
}

// Read once per scheduled frame; scroll never changes React state or layout.
export function observeReadingProgress(fill: HTMLElement) {
  let frame: number | null = null;
  const update = () => {
    frame = null;
    fill.style.transform = `scaleY(${getReadingProgress(scrollY, document.documentElement.scrollHeight, innerHeight)})`;
  };
  const schedule = () => { if (frame === null) frame = requestAnimationFrame(update); };
  const size = new ResizeObserver(schedule);
  size.observe(document.documentElement);
  size.observe(document.body);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("pageshow", schedule);
  schedule();
  return () => {
    if (frame !== null) cancelAnimationFrame(frame);
    size.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("pageshow", schedule);
  };
}
