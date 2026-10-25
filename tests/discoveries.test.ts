import { afterEach, expect, it, vi } from 'vitest';
import { discover, forget, FOUND_KEY, getFoundSnapshot, subscribeFound } from '@/lib/eggs';

afterEach(() => { forget({ removeItem: () => {} }); vi.unstubAllGlobals(); });

it('shares discoveries, deduplicates them and broadcasts reset even when storage is blocked', () => {
  const target = new EventTarget();
  vi.stubGlobal('window', Object.assign(target, { localStorage: {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
    removeItem: () => { throw new Error('blocked'); },
  } }));
  const updates: string[] = [];
  const stop = subscribeFound(() => updates.push(getFoundSnapshot()));
  discover('whiteout'); discover('whiteout'); discover('paw-tracks');
  expect(getFoundSnapshot().split(',')).toEqual(['paw-tracks', 'whiteout']);
  expect(updates).toHaveLength(2);
  forget(); expect(getFoundSnapshot()).toBe('');
  expect(updates).toHaveLength(3); stop();
});

it('reads persisted discoveries and synchronizes cross-tab changes and storage clears', () => {
  let stored = '["whiteout"]';
  vi.stubGlobal('window', Object.assign(new EventTarget(), { localStorage: {
    getItem: () => stored, setItem: (_key: string, value: string) => { stored = value; }, removeItem: () => { stored = '[]'; },
  } }));
  expect(getFoundSnapshot()).toBe('whiteout');
  const updates: string[] = [];
  const stop = subscribeFound(() => updates.push(getFoundSnapshot()));
  stored = '["star-map","paw-tracks"]';
  window.dispatchEvent(Object.assign(new Event('storage'), { key: FOUND_KEY }));
  expect(updates.at(-1)).toBe('star-map,paw-tracks');
  stored = '[]'; window.dispatchEvent(Object.assign(new Event('storage'), { key: null }));
  expect(updates.at(-1)).toBe(''); stop();
});
