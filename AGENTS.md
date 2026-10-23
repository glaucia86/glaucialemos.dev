# AGENTS.md

- Verificação: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Navegador: `npm run start -- --hostname 127.0.0.1 --port 3100` e depois
  `node tests/holonet.browser.mjs` (use `BASE_URL=http://127.0.0.1:<porta>` se a 3100 estiver ocupada).
- No Windows, encerrar o `npm run start` pode deixar o processo `node` do Next escutando
  na porta. Confira com `netstat -ano` antes de reiniciar.
- Motion: GSAP/Lenis via `src/lib/gsap.ts` e `src/lib/use-motion.ts`. Respeite `useMotionEnabled()`.
- Sons: `src/lib/sfx.ts`, sempre opt-in.
