# AGENTS.md

- Handoff da migração: `docs/galaxia-encantada/HANDOFF.md`.
- Migração Galáxia Encantada (Home já na `main`; Sobre na branch `feat/niveora-sobre`; o tema Star Wars está congelado em
  `archive/star-wars`). Plano completo em `docs/galaxia-encantada/PLANO-MIGRACAO.md`. Migração página a página:
  Home (Observatório) e Sobre (Nivéora) migradas; Projetos, Conteúdo, Eventos, Serviços e 404 ainda usam Star Wars.
- Arte-fonte aprovada (Grok) em `docs/art/galaxia-encantada/approved-source` (`GE-PL-0X` placas, `GE-GL-0X` Glaucia,
  `GE-DOG-0X` Prince, `GE-MASTER-*`, `props/<cena>`). `manifest.json` com sha256: `node scripts/build-galaxia-assets.mjs --manifest`.
  Assets web por cena: `node scripts/build-galaxia-assets.mjs <scene-id> [--debug]` gera `public/galaxia/**` e
  `src/data/galaxia/<cena>.json` (poses recortadas, piscar como camada sobre `idle`, âncora dos quadris em `ANCHORS`;
  props passam por `keyDark`, que tira a margem preta da folha original). Pixel art no estilo das imagens do Star Wars (referência:
  `public/pixel/servicos-vader.jpg`, pixels finos de 1–2 px): `src/data/galaxia/layout.json` guarda por cena `grid: 1` (atores e
  props reduzidos para 1 pixel de arte por pixel da placa, borda dura), `plateGrid: 0` (placa aprovada intocada), `colors`
  (160 atores / 128 props, sem dithering), os palcos e a escala dos props. A Glaucia rejeitou G = 3 ("pixelado demais").
  Os JSON mantêm o tamanho lógico (`w`/`h`) e o real em `px`; atores e props usam `image-rendering: pixelated`, a placa não.
  `--preview` gera no `%TEMP%` as variantes A (layout), B (grade 1,5) e C (grade 2). Sheets extras de pose: `GE-GL-0XB-<cena>.png`,
  `GE-DOG-0XC-<cena>.png` (nomes em `POSES[cena]["glaucia:B"]` etc.).
- Cenas: `src/lib/scenes.ts` (`SceneId`, `poseBox`, `propBox`, palco do ator em % da placa). Home: `ObservatoryScene.tsx`
  (camadas, `HOTSPOTS`, `SPOTS`, `LANTERNS`), `ObservatoryMotion.tsx` (ações em `data-stage`/`data-pose`/`data-sky`/`data-dawn`,
  personagem fixo: só respiração e piscar), `sky-engine.ts` (dois canvas em pixel na coordenada da placa: estrelas, aurora, meteoros
  caçáveis, Via Láctea, rastro da nave, partículas) e `CareerTelescope.tsx` (dialog com os marcos reais da carreira).
  Enquadramento ancorado no chão (`--scene-y: 100%`). Testes: `tests/scenes.test.ts`, `tests/sky-engine.test.ts`.
- Segredos da Home: `focus-lens` (Glaucia → telescópio de carreira), `dog-signal` (Prince), `hangar-check` (hangar/console),
  `launch-charge` (segurar o céu → voo sobre o terraço até o horizonte), `dark-sky` (apagar as 4 lanternas; vidro escuro cobre a chama),
  `wish` (pegar 3 estrelas cadentes encostando o cursor, clicando ou tocando); card do capítulo 2 = `CrewPortrait` (retrato vivo, CSS); global `star-map` (Konami). Frases dos segredos da Home
  também funcionam digitadas direto na página. Memória em `localStorage["galaxia-encantada:eggs:v2"]`; boot na chave `galaxia-boot`.
- O rádio estelar (Comlink) fica no cabeçalho: `SiteChrome` passa um slot e o botão entra por portal (`createPortal`).
- Home aprovada pela Glaucia. Pedido para as próximas páginas: repetir o efeito de rolagem da Home (hero fixado, zoom na cena e
  salto com rastros brilhantes via `hyperspace.ts` + `.hero-jump`), mas com uma variação própria por mundo
  (ex.: nevasca em Nivéora, poeira em Marte, cristais em Lúmina), sem copiar o mesmo visual.
- Não rode `npm run build` com o `npm run dev` aberto: os dois usam `.next` e geram erro de hidratação.

- Verificação: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Navegador: `npm run start -- --hostname 127.0.0.1 --port 3100` e depois
  `node tests/holonet.browser.mjs` (use `BASE_URL=http://127.0.0.1:<porta>` se a 3100 estiver ocupada).
- No Windows, encerrar o `npm run start` pode deixar o processo `node` do Next escutando
  na porta. Confira com `netstat -ano` antes de reiniciar.
- Motion: GSAP/Lenis via `src/lib/gsap.ts` e `src/lib/use-motion.ts`. Respeite `useMotionEnabled()`.
- Sons: `src/lib/sfx.ts`, sempre opt-in, curtos (≤ 0,6 s) e sem loops; ruído filtrado (`wave: "noise"`), `play(kind, { detune, gain })` e `MIN_GAP`.
  Hover/clique por mundo via `data-sound-world` no `<main>` (`observatory`, `niveora`, `mars`), lido pelo `FxLayer`.
- Middleware fica em `src/middleware.ts`: com `src/app`, o Next ignora um `middleware.ts` na raiz.
  Confira que o build lista `ƒ Middleware`.
- Repositórios: `getTopRepos` (`src/lib/github.ts`) busca o ranking por estrelas no GitHub, revalidado a cada 24 h (sem custo extra; `GITHUB_TOKEN` opcional);
  `src/data/projetos.json` é só a reserva. `GITHUB_TOKEN` (opcional, só servidor) aumenta o limite da API.
- CI: `.github/workflows/ci.yml` roda lint, typecheck, testes e build em push/PR.
- Execução: não suba o servidor nem rode testes de navegador por conta própria; peça para a usuária executar e compartilhar o resultado.
- Sobre (Nivéora): `src/app/[lang]/sobre/page.tsx` + `src/app/niveora.css` (reusa `home.css` e `HomeChoreography` via
  `className="home-page about-page"`). Textos em `src/i18n/niveora.ts` (`d.niveora`). Hero: `NiveoraScene.tsx` (camadas, `HOTSPOTS`,
  `SPOTS`, `TRACKS`; Glaucia em x=84 %, pés em y=80 % e Prince de corpo inteiro em x=76 %, pés em y=80 % (plataforma superior)) e `NiveoraMotion.tsx` (`data-stage`/`data-pose`/`data-prince`/
  `data-aurora`, `data-whiteout` no `main`). Neve e aurora em pixel: `snow-engine.ts`; salto da rolagem: `blizzard-jump.ts`
  (túnel de neve + cortinas de aurora + branco de nevasca). Abaixo: `ExpeditionLog` (retrato vivo `NiveoraPortrait`, gelo que quebra,
  insígnias de cristal), `CareerMap` (eras `foundation`/`advocacy`/`leadership` em `src/lib/career.ts`, `?era=`), chamado da expedição.
  Intro `BootSequence variant="niveora"` com a chave `niveora-boot`. Segredos: `paw-tracks` (Prince → pegadas → cápsula),
  `memory-capsule` (Glaucia/cápsula → `MemoryCapsule`, registros reais com fonte), `whiteout` (estação ou 3 toques no termômetro;
  botão e Esc acalmam), `aurora-prism` (cristal), `snowdrift` (`SnowDrift.tsx`, neve acumulando após 6 s parada).
  Na nevasca os cards congelam (`FrozenCards.tsx`, eventos `niveora:freeze`/`niveora:storm-end`): raspar com mouse/caneta ou
  3 cliques; 3 toques no toque; Enter no teclado; derrete sozinho 45 s após a nevasca. Atuação: `niveora-acting.ts` + `NiveoraMotion.tsx`; rajadas usam `brace`/`wind`, nevasca alterna `cold-a`/`cold-b` + `cold`.
  Prince fareja, caminha, cava, revela a cápsula, abana e retorna (8,76 s); sacode neve ao acalmar. RAF pausa fora da tela/aba.
  Hotspot acompanha o Prince; hover/foco de teclado abana em repouso. Movimento reduzido revela a cápsula sem animação.
  Na nevasca os dois tremem 1 px e acumulam neve (`.niveora-snowcap`);
  `snow.breath` solta vapor da boca da Glaucia.
  Enquadramento: a placa aparece sempre inteira em 16:9. Com `(min-width: 1200px) and (min-height: 680px)` o hero tem a altura
  da placa (limitada pela tela), o texto fica sobre o lado esquerdo e há pin + salto; abaixo disso o texto vem antes e a cena
  ocupa a largura toda em `aspect-ratio: 16 / 9`, sem pin (`OVERLAY` em `NiveoraMotion.tsx` usa o mesmo breakpoint do CSS).
  Testes: `tests/scenes.test.ts`, `tests/snow-engine.test.ts`, `tests/niveora.browser.mjs`.
- Segredos (easter eggs): registro único em `src/lib/eggs.ts` (`emitEgg`/`onEgg`/`discover`, salvo em
  `localStorage["galaxia-encantada:eggs:v2"]`). Gatilhos (teclado, gestos, Comlink) só emitem o id; quem executa o efeito chama
  `discover`. O Comlink (`src/components/Comlink.tsx`, textos em `src/i18n/comlink.ts`) fica no `SiteChrome` e torna
  todo segredo acessível no celular. "Apagar memória" no Comlink (dois cliques) chama `forget()` e zera o progresso.
  Janelas `showModal()` ficam acima da mira (`.fx-cursor`): enquanto há uma aberta, o `pixel-ui.css` devolve o cursor nativo.
  Ao criar um segredo novo: registre em `EGGS`, adicione nome/dica nos 3 idiomas e um gesto de toque equivalente.
- Projetos (Marte, Vale das Invenções): `src/app/[lang]/projetos/page.tsx` + `src/app/marte.css` (reusa `home.css` e
  `HomeChoreography` via `className="home-page projects-page"`). Textos em `src/i18n/marte.ts` (`d.marte`). Hero: `MarsScene.tsx`
  (camadas, `HOTSPOTS` glaucia/rover/prince/console, `SPOTS`; Glaucia (87; 93), Prince de três quartos (75,5; 93) pela sheet
  `GE-DOG-03B`) e `MarsMotion.tsx` (`data-stage`/`data-pose`/`data-prince`/`data-gust`, leitura `.mars-readout`). Poeira em pixel:
  `dust-engine.ts`; salto da rolagem: `dust-jump.ts` (rajada lateral + varredura/grade/osciloscópio + estática âmbar, com os números
  reais em `.hero-jump__readouts`). Mesmo breakpoint de Nivéora (`OVERLAY` 1200×680). Seções: `LabTelemetry` (amostras minerais,
  `RetroTerminal` com Prince + disquete + tela CRT, `ColonyGrowth`), `RepoArchive` (filtros/busca/ordenação; `marte:find-repo` limpa filtros e destaca o card),
  `Bench`/`BenchDetails` (carcaça em `<details>`; bancada do site com `BeforeAfter`), `PartnerStations` + `LostBug`, `DustPanel`, `MarsEggs` (frases digitadas). Intro `BootSequence variant="mars"`, chave `marte-boot`; `ReadingProgress variant="mars"`.
  Segredos (7): `rover-scan` (repositório real do top 5), `sample-cache` (original mais antigo), `terminal-launch` (cartão npx 2018 →
  hoje, com início da carreira de `experiencia.json`), `first-sprout` (estufa da colônia = original criado mais recentemente),
  `before-pretty` (primeiro commit real + estado atual; bancada do próprio site com a folha do Grok e a versão 3 × 3 recusada),
  `lost-bug` (circuito do PR #555 do SWA CLI: `npm dev`→`npm run dev`, `.`→`.next`), `dust-fall` (último push do arquivo).
  Registros em `src/lib/mars-records.ts`; primeiros commits em `src/data/marte-registros.json`, regenerados por
  `node scripts/snapshot-first-commits.mjs`. O script de assets também gera `public/galaxia/bench/mars-lab/` e o prop `sprout`
  (recortado da pose `sniff` por `DERIVED_PROPS`). Testes: `tests/mars.test.ts`, `tests/marte.browser.mjs`.
  O teste `social.test.ts` proíbe menções à Twitch em `src`. Tons do `sfx.ts` têm no máximo 0,6 s cada.
- Yoda na pose da Força: arte-fonte em `docs/art/segments-yoda`; regenere as camadas com
  `node scripts/build-yoda-force.mjs`. Estágios do hero em `data-force-stage` (idle/charging/force/xwing).
