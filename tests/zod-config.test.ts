import { readdirSync, readFileSync } from 'node:fs';
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => { vi.unstubAllGlobals(); });
it('loads every library Zod consumer with JIT disabled and never probes Function', async () => {
  vi.resetModules();
  const dynamicCode = vi.fn(function () { throw new Error('CSP blocks eval'); });
  vi.stubGlobal('Function', dynamicCode);
  const files = readdirSync('src/lib').filter(file => file.endsWith('.ts') && file !== 'zod-config.ts'
    && /from ['"]zod['"]/.test(readFileSync(`src/lib/${file}`, 'utf8')));
  for (const file of files) {
    expect(readFileSync(`src/lib/${file}`, 'utf8').startsWith("import './zod-config';")).toBe(true);
    await import(`../src/lib/${file.slice(0, -3)}.ts`);
  }
  const { z } = await import('zod');
  expect(z.config().jitless).toBe(true);
  expect(z.object({ name: z.string() }).parse({ name: 'Ana' })).toEqual({ name: 'Ana' });
  expect(z.core.util.allowsEval.value).toBe(false);
  expect(dynamicCode).not.toHaveBeenCalled();
});
