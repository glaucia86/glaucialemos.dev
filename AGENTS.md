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
- Execução: não suba o servidor nem rode testes de navegador por conta própria; peça para a usuária executar e compartilhar o resultado.
- Sobre (Base Eco/Hoth): `src/app/[lang]/sobre/page.tsx` + `src/app/about.css` (reusa `home.css` e `HomeChoreography` via
  `className="home-page about-page"`). Textos em `src/i18n/echo-base.ts`. Trajetória calculada por `src/lib/career.ts`
  (ordem, faixas paralelas, eras). Intro usa `BootSequence` com a chave de sessão `echo-boot`. Teste: `tests/echo-base.browser.mjs`.
  Easter eggs em `src/components/about/EchoEggs.tsx`: "help me"/"obiwan" (holomensagem), "eu te amo"/"i love you"
  ("Eu sei."), "hoth" (nevasca), clique na sonda (autodestruição), clique na neve (tauntaun), neve acumulando após 6 s parado.
- Segredos (easter eggs): registro único em `src/lib/eggs.ts` (`emitEgg`/`onEgg`/`discover`, salvo em
  `localStorage["holonet-secrets"]`). Gatilhos (teclado, gestos, Comlink) só emitem o id; quem executa o efeito chama
  `discover`. O Comlink (`src/components/Comlink.tsx`, textos em `src/i18n/comlink.ts`) fica no `SiteChrome` e torna
  todo segredo acessível no celular. "Apagar memória" no Comlink (dois cliques) chama `forget()` e zera o progresso.
  Janelas `showModal()` ficam acima da mira (`.fx-cursor`): enquanto há uma aberta, o `pixel-ui.css` devolve o cursor nativo.
  Ao criar um segredo novo: registre em `EGGS`, adicione nome/dica nos 3 idiomas e um gesto de toque equivalente.
- Leia viva (Fase 3B): briefing, prompts e montagem em `docs/leia-art.md`. Arte-fonte em `docs/art/segments-leia`.
  Regenere com `node scripts/build-leia-layers.mjs [--debug]`, que gera `public/pixel/leia/*.webp` e `src/components/about/leia.json`.
  `LeiaActor.tsx` carrega as camadas (`data-leia="idle|blaster|shiver"` e `data-blink` no hero). `leiaShoot` é o disparo
  na sonda, usado por `EchoEggs.destroyProbe`.
- Projetos (Tatooine/R2-D2): `src/app/[lang]/projetos/page.tsx` + `src/app/tatooine.css` (reusa `home.css` e `HomeChoreography`
  via `className="home-page projects-page"`). Textos em `src/i18n/tatooine.ts`. Componentes em `src/components/projects/`
  (`R2Telemetry`, `RepoArchive`, `AllianceSquadrons`, `TatooineEggs`). Intro usa `BootSequence variant="astromech"` com a chave `r2-boot`.
  Dados: `getAllRepos`, `getGithubTelemetry` e `getMergedPrs` (`src/lib/github.ts`), categorias e ordenação em `src/lib/repos.ts`.
  Reservas offline: `src/data/projetos.json` e `src/data/github-stats.json`, regeneradas por `node scripts/snapshot-github.mjs` (Node 23.6+).
  Contribuições (Microsoft, Azure, Node.js, comunidade) em `src/data/contribuicoes.json`, agrupadas em esquadrões pelo dono do repo.
  Os hotspots do hero (R2, sóis, sandcrawler) ficam em `.tatooine-plane`, com a mesma projeção cover da arte (`--scene-x: 72%`).
  Easter eggs (página `projects`): npx, utinni, plans, sunset, podrace, mindtrick, cantina, artoo, sand, hellothere, bb8. Teste: `tests/tatooine.browser.mjs`.
  O teste `social.test.ts` proíbe menções à Twitch em `src`. Tons do `sfx.ts` têm no máximo 0,6 s cada.
- Yoda na pose da Força: arte-fonte em `docs/art/segments-yoda`; regenere as camadas com
  `node scripts/build-yoda-force.mjs`. Estágios do hero em `data-force-stage` (idle/charging/force/xwing).
