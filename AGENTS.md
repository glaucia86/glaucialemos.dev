# AGENTS.md

- Verificação: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Navegador: `npm run start -- --hostname 127.0.0.1 --port 3100` e depois
  `node tests/holonet.browser.mjs` (use `BASE_URL=http://127.0.0.1:<porta>` se a 3100 estiver ocupada).
- No Windows, encerrar o `npm run start` pode deixar o processo `node` do Next escutando
  na porta. Confira com `netstat -ano` antes de reiniciar.
- Motion: GSAP/Lenis via `src/lib/gsap.ts` e `src/lib/use-motion.ts`. Respeite `useMotionEnabled()`.
- Sons: `src/lib/sfx.ts`, sempre opt-in.
- Middleware fica em `src/middleware.ts`: com `src/app`, o Next ignora um `middleware.ts` na raiz.
  Confira que o build lista `ƒ Middleware`.
- Repositórios: `getTopRepos` (`src/lib/github.ts`) busca o ranking por estrelas no GitHub, revalidado a cada 30 dias;
  `src/data/projetos.json` é só a reserva. `GITHUB_TOKEN` (opcional, só servidor) aumenta o limite da API.
- CI: `.github/workflows/ci.yml` roda lint, typecheck, testes e build em push/PR.
- Yoda na pose da Força: arte-fonte em `docs/art/segments-yoda`; regenere as camadas com
  `node scripts/build-yoda-force.mjs`. Estágios do hero em `data-force-stage` (idle/charging/force/xwing).
