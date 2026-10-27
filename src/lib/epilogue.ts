import { EGGS, type EggPage } from "./egg-catalog";

const WORLDS = new Set<EggPage>(["home", "about", "projects", "content", "events"]);

export function discoveredWorldCount(found: readonly string[]): number {
  const ids = new Set(found);
  return new Set(EGGS.filter(egg => ids.has(egg.id) && WORLDS.has(egg.page)).map(egg => egg.page)).size;
}

export const epilogueRemaining = (found: readonly string[]) => Math.max(0, 3 - discoveredWorldCount(found));
export const epilogueUnlocked = (found: readonly string[]) => epilogueRemaining(found) === 0;
