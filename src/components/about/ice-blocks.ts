// Keep the owner even after an overlay is detached. Shattering, thawing and
// unmounting can all request its removal; only the first release does any work.
export function createIceBlocks(onRelease?: (block: HTMLElement, target: HTMLElement) => void) {
  const entries = new Map<HTMLElement, { target: HTMLElement; timer?: ReturnType<typeof setTimeout> }>();
  const release = (block: HTMLElement) => {
    const entry = entries.get(block);
    if (!entry) return;
    clearTimeout(entry.timer);
    entries.delete(block);
    onRelease?.(block, entry.target);
    block.remove();
    if (![...entries.values()].some(other => other.target === entry.target)) entry.target.classList.remove("is-frozen");
  };
  return {
    add(block: HTMLElement, target: HTMLElement) { entries.set(block, { target }); },
    forEach(run: (block: HTMLElement) => void) { entries.forEach((_, block) => run(block)); },
    release,
    releaseAfter(block: HTMLElement, delay: number) {
      const entry = entries.get(block);
      if (!entry) return;
      clearTimeout(entry.timer);
      entry.timer = setTimeout(() => release(block), delay);
    },
    dispose() { entries.forEach((_, block) => release(block)); },
  };
}
