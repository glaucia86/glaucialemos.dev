# AGENTS.md

- Serviços (29/10/2026): `services.independent` (PT/EN/ES) no hero e acima da lista de espera; fontes de Serviços/contato/epílogo protegidas por `tests/services-copy.test.ts`. Preços removidos do catálogo/schema/UI; cards mantêm conversa e oferecem `#lista-de-espera`. `src/components/WaitlistForm.tsx`, `src/lib/waitlist-schema.ts`, `src/i18n/waitlist.ts`, `src/app/actions/waitlist.ts`: nome/e-mail, três interesses, LGPD, honeypot e Turnstile; `?interesse=` aceita `workshop-corporativo`, `mentoria-grupo-noite`, `curso-gravado`. Reusa `contactConfig()`, `verifyTurnstile` e o Resend de contato/depoimentos, sem novas variáveis. Dados só para aviso da modalidade escolhida, sem spam. Seção antes do contato com marcador `◇`, preservando os códigos dos capítulos existentes.
- Depoimentos: `src/data/depoimentos.json` = `[]`, `depoimentoSchema` em `src/lib/types.ts`, `getDepoimentos()` em `src/lib/data.ts`, componente server `src/components/services/Testimonials.tsx`. Adicionar somente relatos reais autorizados com `id`, `nome`, `cargo`, `texto: {pt,en,es}`, opcionais `empresa` e `url` HTTPS. Vazio não renderiza nada nem altera capítulos; com dados entra após Provas, com label e código próprios. Testes `tests/testimonials.test.ts` e `tests/services-page.test.ts`.

- Epílogo funcional em `/[lang]/alem-da-ultima-orbita` (PT/EN/ES), `noindex`, fora do menu: `src/app/beyond-orbit.css`,
  `src/components/epilogue/*`, copy em `src/i18n/beyond-orbit.ts`. Arte 08 integrada: nebulosa sem terraço, Glaucia à esquerda
  espelhada, Prince à direita, ambos flutuando e olhando para o centro (ângulo levemente lateral aceito). Fontes: placa
  `GE-PL-08-beyond-orbit.jpg`, atores PNG com alpha. Pipeline `beyond-orbit`, `FLOAT_ANCHORS` na conexão das mochilas;
  `anchorY` e `flip` em `poseBox`. Flutuação GSAP/ritmos distintos + cabos SVG em `src/lib/beyond-orbit.ts`, pausa fora da
  tela/aba e respeita movimento reduzido. `float-idle` em repouso; `float-b/c/d` só em trocas raras e na reação do final
  (`poseStyle` mantém o pivô da mochila). Prévia de arte: `node scripts/preview-beyond-orbit.mjs` (TEMP, não é navegador).
  Versão cinematográfica: abertura só em CSS (íris, letterbox, copy subindo); ambilight `ambient.webp` 64×36 (pipeline,
  `AMBIENT`); camadas `[data-depth]` com câmera por ponteiro (`DEPTH`); correntes de luz/raios/brilho e contorno nos trajes;
  `veil-engine.ts` (estrelas, fios de possibilidade, cometas, poeira, cursor, implosão, onda de choque). Pin + mergulho
  (`veil-jump.ts`) só em `HERO_OVERLAY`. Estrela `last-light` no núcleo (`STAR`) toca "A Última Luz" (`BEATS`/`CUES` em
  `src/lib/beyond-orbit.ts`, ~28 s, `data-theater`/`data-beat` no `.beyond-orbit__experience`): implosão → silêncio →
  supernova → véu → reação → constelação da jornada (`src/lib/journey-constellation.ts`, uma estrela por egg de `EGGS`,
  mundos sem segredos = "???") → "To be continued…" de poeira estelar (`stardust-text.ts`) com zoom in/out → créditos
  (`EpilogueCredits`, cópia aria-hidden rola na cena) → pós-créditos com os mundos não mapeados. Pular: botão, Esc, roda,
  toque; sempre termina no estado estático. Sons novos no `sfx.ts` (gain ≤ 0,08 por tom, ≤ 0,6 s; peso por camadas).
  Antes da estrela, só a pista `starHint` abaixo da cena. Depois dela, "A Viagem" (`EpilogueVoyage.tsx`, fora do hero para
  não aninhar pins, `data-waiting` até `last-light`): céu `voyage-engine.ts` sticky (dobra pela velocidade da rolagem, gás
  na paleta do mundo via `paletteAt`), carta da tripulação (`copy.letter`, palavras por SplitText), atlas (`src/lib/voyage.ts`:
  um planeta por destino com a placa do mundo, luas = segredos achados, dicas do Comlink em `<details>`, mundos sem
  segredos = "sinal fraco"; trilha horizontal só com `data-flight` em `HERO_OVERLAY`), créditos e `.beyond-orbit__next-star`
  (reexecuta "A Última Luz"). O diretor clona créditos/pós-créditos do `<main>` sem estilos inline.
  Armadilhas encontradas com Playwright: o `main { overflow: hidden }` global quebra `position: sticky` (o epílogo usa
  `overflow: clip`), e o `PageEffects` anima `section`s com `transform` (anula pins; o epílogo fica fora do seletor).
  Enquadramento: `.beyond-orbit__frame` mostra o palco 16:9 `.beyond-orbit__scene` como cover (tela inteira abaixo do menu
  no desktop, 4:5 em retrato, 16:9 nos demais); sobreposições de tela (vinheta, barras, rolo, pista, "Pular") ficam na moldura.
  `epilogue-signal` em Serviços exige descobertas em três mundos distintos
  (Home/Sobre/Projetos/Conteúdo), helpers em `src/lib/epilogue.ts`. Catálogo (37) em `src/lib/egg-catalog.ts`, reexportado
  por `eggs.ts`. `last-light` revela o final e permite replay; SSR/no-JS/reduced motion mantêm copy visível. Comlink tem
  comandos PT/EN/ES e revisita; persistência/reset continuam únicos. Testes: `tests/epilogue.test.ts` e
  `tests/beyond-orbit.test.ts` e `tests/epilogue.browser.mjs` (navegador somente pela usuária). Retomada atual no início do handoff.
  Episódio narrado (desenho, 74 s, narração em PT; fonte `approved-source/GE-EP-08-beyond-orbit.mp4`): `BeyondOrbitEpisode.tsx`, mesmo
  molde do da 404 (botão com miniatura → `<dialog>` com TV CRT, `preload="none"`, sem autoplay, legendas `episode.{pt,en,es}.vtt` com
  `default` no idioma). Fica logo depois do `.beyond-orbit__post`, fora dele (o diretor clona só o post), em `.beyond-orbit__episode-slot`;
  enquanto a viagem espera a `last-light` (`data-waiting`, oculta) ele vai para `.beyond-orbit__episode-dock`, fora da viagem. Aberto,
  silencia o site sem tocar no `sfx.ts`: tira `data-sound-world` do `<main>` (o `FxLayer` sai do mundo: para música/ambiente),
  `blockMusic("episode")` e barra hover/clique de dentro do diálogo. Web em `public/galaxia/scenes/beyond-orbit/`: `episode.mp4`
  (H.264 960 px CRF 31, AAC 80k, faststart, ~7,2 MB), `episode.webm` (VP9 2 passes 720k + Opus 80k, ~7,5 MB), `episode-poster.webp`
  (quadro de 26,5 s). Legendas medidas pelo áudio (voz bem acima da trilha) e pelos quadros; a 5ª parte (60–74 s) fica sem
  legenda por decisão da Glaucia.

- Rodada de CX (feedback do X + Mariana, `docs/feedback.txt`, 28/10/2026):
  - Contato e depoimentos enviam pelo **Resend** (REST, `src/lib/mail.ts`; o Web3Forms gratuito recusa envio do servidor). Variáveis:
    `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (todas obrigatórias, só servidor);
    `verifyTurnstile` em `contact-config.ts`; `Idempotency-Key` = hash do conteúdo; nada de dado pessoal no log. Testes: `contact-action` e
    `testimonial-action`. Domínio `mail.glaucialemos.dev` (DNS na Vercel → "Auto configure"); antes disso, remetente `onboarding@resend.dev`.
  - Menu (`routes` em `SiteChrome.tsx`): 01 Início · 02 Tripulante (/sobre) · 03 Projetos · 04 Eventos · 05 Workshops e mentorias · 06 Conteúdo.
  - Home linear: um único `OfferFormats` (`#formatos`, capítulo 5, formatos + `speakingTopics`); Tripulante com LinkedIn e `CareerDialog`
    (o `CareerMap` com `embedded`, sem `?era=`/rolagem; CSS do mapa em `src/app/career-map.css`, compartilhado com Sobre). Títulos literais
    (`holonet.episodes`, `galaxy.title/intro`, `holocron.archive`, `journey.demo.context`); Sobre literal (`niveora` chapters/log/map, `aurora.title`).
  - `StickyCta.tsx` (barra após a 1ª tela, vira convite "Chegou até aqui?" no rodapé; não aparece em Serviços/páginas secretas).
    `#contato` pula a intro (`skipsBoot`, script de boot e `armOnNavigation`) e o portal abre direto; X do portal à direita (pedido do CX);
    formulário centralizado e os dois retratos (`.contact-crew`) no canto superior esquerdo do painel.
  - Comlink: introdução + "Páginas secretas (2)" (`copy.guide`, `epilogueRemaining`); dica da 1ª visita (`comlink-hint-seen`). Som no cabeçalho
    (`.sound-control`, também no celular) e convite da 1ª visita (`sound-invite-seen`), que só liga com clique. CSS em `src/app/site-guides.css`.
  - Prova social: retrato SDD e foto palestrando aprovados (`public/prova-social/glaucia-*.webp`); "Onde já palestrei" (`speakingVenues` →
    `venueSources(eventos.json)`) no hero de Serviços; depoimentos (`Testimonials`/`TestimonialForm`, `submitTestimonial`) chegam por e-mail
    para aprovação e só aparecem após entrar em `testimonials` (`src/data/prova-social.ts`). Testes: `tests/cx-flow.test.ts`.
  - Galeria de Serviços: foto + palestra da BrazilJS 2024 (`talkVideos`, `TalkVideo.tsx`, pôster local, player youtube-nocookie só após clique).
  - CTA principal "Pedir uma proposta para o meu time" + `ctaNote` (2 dias úteis). Formatos e temas com `PixelGlyph`/`CardGlow` (cor por card).
    Experiência: + Packt, Pagar.me e GlobalLogic LATAM (sem logo oficial: iniciais). Epílogo: episódio à esquerda no texto do topo, só depois da
    `last-light`; a sequência da estrela não rola mais os créditos (BEATS post 13,4 / end 19,4). Rádio: "Coordenadas perdidas" só dá a pista
    com 5 segredos (`LOST_UNLOCK`); `COMLINK_OPEN_EVENT` abre o rádio (botão `SecretsGuide` no hero do Início).
  - Catálogo fechado em 50 segredos: `meteor-shower` (Início, 3 cliques no título de Eventos), `lost-commit` (Projetos, disquete fixo),
    `orbital-selfie` (Eventos, segurar o hero 2 s), `proposal-harvest` (Serviços, formatos 01→02→03), `deep-night` (global, "lua"; Esc sai).
    Todos em `src/components/eggs/ExtraEggs.tsx` (CSS no fim de `site-guides.css`).
  - "Salto pelos 7 mundos" (`WorldsWarp.tsx` + `WorldsWarpMotion.tsx`, CSS `src/app/worlds-warp.css`) entre o capítulo 5 e o convite final do
    Início: em `HERO_OVERLAY` com movimento, pin + hiperespaço + 7 portais (placas reais; o epílogo aparece como "Uma estrela fora do mapa",
    sem link) e clarão; sai pulsando o botão de proposta. Celular/movimento reduzido/sem JS: fileira estática com links.
  - LinkedIn em tempo real ficou fora (API de leitura `r_member_social` fechada). Linha do hero da Home: "Liderança • IA • Engenharia".
  - Assets e componentes do tema Star Wars removidos (`public/pixel`, Yoda/Leia/Dagobah, `jedi-effects`, regras antigas de `hero-scenes.css`,
    10 sons sem uso do `sfx.ts` e 4 testes de navegador antigos); seguem na branch `archive/star-wars`. Nomes internos (`holonet`, `--jedi-*`)
    ficaram porque fazem parte do tema atual. Atenção: o antigo `jedi-effects.css` também tinha regras do tema atual (`.portrait-viewport`,
    `.reading-progress`), agora em `src/app/reading-progress.css`; sem elas o SVG do progresso vira uma tela preta gigante na Home.
- Handoff da migração: `docs/galaxia-encantada/HANDOFF.md` (comece pela seção “Retomada”).
- Eventos (Atlas das Conexões) está na branch `feat/atlas-eventos`, aguardando as folhas GE-GL-05B/GE-DOG-05B (prompts no HANDOFF).
- Migração Galáxia Encantada (Home, Sobre, Projetos, Conteúdo e o epílogo na `main`; o tema Star Wars está congelado em
  `archive/star-wars`). Plano completo em `docs/galaxia-encantada/PLANO-MIGRACAO.md`. Migração página a página: Home
  (Observatório), Sobre (Nivéora), Projetos (Marte), Conteúdo (Lúmina) e Eventos (Atlas) migradas; Serviços e 404 ainda usam Star Wars.
- Migração Galáxia Encantada (Home, Sobre e Projetos já na `main`; Conteúdo/Lúmina na branch `feat/lumina-conteudo`; o tema
  Star Wars está congelado em `archive/star-wars`). Plano completo em `docs/galaxia-encantada/PLANO-MIGRACAO.md`. Migração
  página a página: Home (Observatório), Sobre (Nivéora), Projetos (Marte), Conteúdo (Lúmina) e Serviços (Aurélia) migradas; Eventos e
  404 ainda usam Star Wars. Aurélia está em `feat/aurelia-servicos`, com validação de navegador pendente.
- Arte-fonte aprovada (Grok) em `docs/art/galaxia-encantada/approved-source` (`GE-PL-0X` placas, `GE-GL-0X` Glaucia,
  `GE-DOG-0X` Prince, `GE-MASTER-*`, `props/<cena>`). `manifest.json` com sha256: `node scripts/build-galaxia-assets.mjs --manifest`.
  Assets web por cena: `node scripts/build-galaxia-assets.mjs <scene-id> [--debug]` gera `public/galaxia/**` e
  `src/data/galaxia/<cena>.json` (poses recortadas, piscar como camada sobre `idle`, âncora dos quadris em `ANCHORS`;
  props passam por `keyDark`, que tira a margem preta da folha original). Pixel art no estilo das imagens do Star Wars (referência:
  pixels finos de 1–2 px): `src/data/galaxia/layout.json` guarda por cena `grid: 1` (atores e
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
  Hover/clique por mundo via `data-sound-world` no `<main>` (`observatory`, `niveora`, `mars`, `lumina`, `atlas`), lido pelo `FxLayer`.
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
- Conteúdo (Lúmina, a Biblioteca Viva): `src/app/[lang]/conteudo/page.tsx` + `src/app/lumina.css` (reusa `home.css` e
  `HomeChoreography` via `className="home-page content-page"`, `data-sound-world="lumina"`). Textos em `src/i18n/lumina.ts` (`d.lumina`).
  Registros reais em `src/lib/lumina-records.ts`: primeira e última página, anos, plataformas e ecos (mesmo título republicado) são
  calculados de `artigos.json`; sussurros (um por ano), pares de tradução, séries e coleção do entardecer são curados por URL e
  quebram o build se a URL sumir. Filtros das estantes na URL (`?plataforma=&idioma=&ano=&q=&ordem=antigos`) em `src/lib/lumina-shelves.ts`.
  Hero: `src/components/content/LuminaScene.tsx` (composição A: Glaucia (88; 84), Prince (78; 84,5), monólito (82,5; 82,5), livros
  (73,5; 84,5); `HOTSPOTS` glaucia/crystal/prince/books, `SPOTS`, `CRYSTAL_LIFT`) e `LuminaMotion.tsx` (`data-stage`/`data-pose`/`data-prince`,
  `data-crystal`, `data-books`). Luz em pixel: `prism-engine.ts` (esporos, brilhos dos cristais, reflexo, ondas, scanner); salto da rolagem:
  `crystal-jump.ts` (geodo fechando, refração, páginas em espiral, clarão opalino). Seções: `CrystalRings` (um cristal por ano filtra a
  estante), `LuminaShelves` (`#artigos`, ecos em `<details>`), `PrismGate`, `Collections`, `LibraryDusk` (véu `.dusk-veil`, `data-dusk` no `main`),
  `LuminaEggs`. Intro `BootSequence variant="lumina"`, chave `lumina-boot`; `ReadingProgress variant="lumina"`.
  Segredos (6): `crystal-whisper` (Glaucia/cristal → o cristal sobe até o dedo e sussurra um artigo do ano), `first-page` (Prince fareja,
  escaneia, livro abre no registro mais antigo), `prism-align` (3 prismas, um por idioma → pares de tradução), `crystal-echo` (eco de um card
  republicado), `series-constellation` (acender as partes de uma série em ordem), `library-dusk` (luz da biblioteca ≤ 20 %; Esc volta).
  Sheets extras `GE-GL-04B` (`touch`, `listen`, `cheer`, `read` com texto no livro, reserva) e `GE-DOG-04B` (`sniff-a/b`, `scan`, `wag-a` a 0,88 por
  `POSE_SCALE`, `wag-b`, `sit-up`); `LIGHT_FRINGE` tira o contorno claro da 04B; `PROP_CLEANUP.lumina` limpa halo e ciscos dos props.
  7º segredo `retro-tv`: TV de tubo em CSS/SVG (`RetroTV.tsx`, chiado em `tv-static.ts`) no capítulo 5 toca o último vídeo longo do canal.
  `src/lib/youtube.ts` lê o RSS público (`channel_id=UC2Qzw5aqCBk_z0lWJnumWQQ`, sem chave, revalidado em 24 h; `revalidate = 86400`
  em Conteúdo), pula Shorts (`HEAD /shorts/{id}`: 200 = Short; falhou → `#shorts`/`#YouTubeShorts`) e cai em `src/data/youtube.json`
  (`node scripts/snapshot-youtube.mjs`). O iframe `youtube-nocookie` só nasce depois de ligar (clique/toque/Enter, comando "tv"/"play"/"assistir").
  Testes: `tests/lumina.test.ts`, `tests/youtube.test.ts`, `tests/lumina.browser.mjs`.
- Eventos (Atlas das Conexões, órbita da Terra): `src/app/[lang]/eventos/page.tsx` + `src/app/atlas.css` (`className="home-page events-page"`,
  `data-sound-world="atlas"`; o antigo `events.css` saiu do `globals.css`). Textos em `src/i18n/atlas.ts` (`d.atlas`). **Regra factual**: formato
  derivado de `cidade === "Online"` (remoto, nunca tem lat/lon) em `src/lib/atlas-records.ts`; presencial = luz de cidade (ouro), remoto =
  anel de sinal (ciano), nunca ponto no mapa; sem arcos cidade→cidade. 134 eventos: 79 presenciais / 55 remotos, 20 cidades, 7 países com
  presença, 9 "representados" (África do Sul e França só por remoto). CloudOuest Virtual e Reactor Brasil Webinar (2020) foram corrigidos
  para remotos a pedido da Glaucia. Diário = formulário GET (`?ano=&formato=&tipo=&idioma=&q=`, `src/lib/atlas-filters.ts`), a página lê
  `searchParams` (é `ƒ`) e filtra sem JS; com JS filtra na hora e faz `replaceState`. Cena: `src/components/events/AtlasScene.tsx` (composição A
  aprovada: Glaucia (90; 87) de frente, Prince de perfil (64; 84), holograma `HOLO` sobre o pedestal da placa (75,5; 58), orbe de navegação
  (60; 66); `HOTSPOTS` glaucia/holo/prince/orb), `AtlasMotion.tsx`, `holo-globe.ts` (cobe a ½ resolução, pixelado, marcadores só presenciais),
  `orbit-engine.ts` (estrelas só em `inSky`, acima de `limb(u)`; satélites; aurora; brilhos de cidade; anéis; feixe; constelação no canvas de
  trás, em projeção equirretangular recortada `VIEW`), salto `night-dive.ts` (disco ortográfico, cidades por ano, remotos numa coroa orbital
  fora do disco). Capítulos: Atlas (`AtlasGlobe.tsx`: globo grande no prop `globe-pedestal`, odômetro de 32 marcas que só conta rotação
  manual), Diário (`EventLog.tsx`), Sinais (`SignalDeck.tsx`, links `?ano=#diario` com `data-log-year`), convite. Segredos: `orbital-trail`
  (uma volta manual = órbita de um ano, do mais recente; o holograma do hero gira e "lança" o globo via `emitEgg`), `constellation-route`
  (Glaucia de perfil, holograma se desdobra, 20 estrelas pela 1ª presença, "A Tecelã", legenda "não rotas de viagem"), `dog-navigation`
  (orbe idle→active, busto do Prince no visor `face-idle/tongue/joy`, holograma gira até a cidade ou radar para remoto; `visorQueue`).
  Eventos conta no `epilogue-signal`. Pipeline: GE-GL-05 tem fundo magenta → `keyBackground`/`keyChroma` (chave global + despill por excesso
  de magenta, preserva o coral); poses `bust-*`, `hip`, `idle`, `profile`, `back`; Prince `front-bare` (sem capacete, fora do palco), `side`,
  `side-b`, `face-*`. Sem piscar nem pose de ação até chegarem as 05B (não imitar com CSS). Boot `atlas-boot`, `ReadingProgress variant="atlas"`
  (satélite). Testes: `tests/atlas.test.ts`, `tests/atlas.browser.mjs` (capturas em `%TEMP%\atlas`), `tests/events-page.browser.mjs`.
  Rodada 2 (26/10/2026): composição I aprovada (Glaucia (92; 88) e Prince `front-bare` (84; 86,5) de frente para quem visita, à
  direita do holograma; o Prince vira `side`, que olha para o holograma, ao atuar; orbe em (79,5; 64,5)). Terra viva: o pipeline gera
  `earth-mask.webp` (`EARTH_MASK` no script) e o `orbit-engine` desenha nuvens, terminador e luzes só na máscara. O salto saiu do hero:
  `AtlasVoyage.tsx` + `voyage-engine.ts` formam uma seção sticky para todos os aparelhos (`main.events-page { overflow: clip }`; 320svh no
  desktop, 220svh no toque), em 5 atos (`ACTS`): aproximação com paralaxe → vidro (DrawSVG + estilhaços) → globo cobe girando por `WAYPOINTS`
  com cidades por ano e nomes reais → warp → pouso. Sem JS ou com movimento reduzido, entra uma lista estática de anos. Tablet da Glaucia
  (hotspot da Glaucia): joystick com Draggable, regiões, ano no holograma (`holo.show`), Constelação e Órbita. Doca de ações (`.atlas-dock`)
  numa faixa abaixo da cena no toque/telas pequenas. Segredos do Prince: `prince-antenna` (`PrinceAntenna.tsx` em Sinais, decodifica o
  primeiro sinal remoto), `paw-stamp` (Prince ao lado do globo, gira até a cidade com mais encontros e carimba), `runaway-satellite`
  (satélite DOM com MotionPath no céu do hero; a orbe busca um cartão-postal presencial real). Atlas = 6 segredos, catálogo = 37.
  `zero-gravity` só entra com a pose `float` da 05B. Final: `OrbitalSunrise.tsx` (céu de 100svh guiado pela rolagem, Glaucia `back` em
  silhueta, convite abaixo do horizonte, "Próximas conexões" do Luma). Luma: `src/lib/luma.ts` (endpoint público `events-hosting`,
  revalida em 24 h, cai em `src/data/luma.json`); `node scripts/snapshot-luma.mjs` atualiza o snapshot e só **relata** eventos que faltam
  no `eventos.json` (`LUMA_SAME_EVENT` trata a transmissão de SP como o mesmo evento). O Lenis ignora `dialog`/`[data-lenis-prevent]`
  (opção `prevent`), o que destrava a rolagem do rádio no site todo. Plugins GSAP registrados em `src/lib/gsap.ts`: MotionPath,
  Physics2D, Draggable, Inertia, CustomEase/Wiggle/Bounce, Text. Testes: `tests/luma.test.ts`.
- Serviços (Aurélia, os Jardins Suspensos): `src/app/[lang]/servicos/page.tsx` + `src/app/aurelia.css`,
  `className="home-page services-page"`, `data-sound-world="aurelia"`, copy PT/EN/ES em `src/i18n/aurelia.ts` (`d.aurelia`).
  Quatro capítulos: hero, órbitas, canteiros de serviços e colaboração/contato. `ContactForm` e `EpilogueSignal` intactos;
  metadata, `formId` e assuntos `workshop`/`mentoria`/`palestra` preservados. Registros em
  `src/lib/aurelia-records.ts` vêm de `getServicos()`; controles puros separados em `aurelia-controls.ts` para não levar
  datasets/dictionaries ao bundle dos controles. Nenhum segredo escreve ou envia o formulário; o sinalizador apenas
  rola até `#contato` e foca seu título. Pré-preenchimento continua por links explícitos com `?assunto=...#contato`.
  Pipeline: `node scripts/build-galaxia-assets.mjs aurelia --debug`; placa 06 intacta, grid 1, 160/128 cores. Glaucia tem
  fundo magenta (key exclusivo de Aurélia), retratos `face-*` e poses reais `idle` (mão no quadril), `relaxed`, `side`, `back`.
  Não há gesto de regar/receber transmissão na sheet; `blink` é uma pequena sobreposição de pálpebras derivada de `idle`,
  não uma pose nomeada incorretamente. Prince: `front`, `stand`, `paw`, retratos `face-*`. Palco: Glaucia (88;93;h47),
  Prince (77;93;h14); estufa em (69;92), sinalizador em (74,5;93). Repouso/SSR/reduced motion em `front`; `paw` espelhada só no relay (1,1 s), depois `front`; hotspot frontal, escala de `stand` preservada. `AureliaScene` usa `SCENES.aurelia` e caixas na placa.
  `AureliaMotion` usa `useGSAP`, `HERO_OVERLAY` 1200×680/fine pointer, `observeMotionActivity`, estado final estático no
  movimento reduzido, respiração/piscar pausados fora da tela/aba. `garden-engine.ts` (pétalas, esporos, vapor, reflexos;
  pixels 2, até 160 partículas); `petal-jump.ts` (espiral de pétalas guiada pela rolagem, sem RAF próprio).
  `BootSequence variant="aurelia"`, chave `aurelia-boot`; `ReadingProgress variant="aurelia"`; sons opt-in ≤0,08/≤0,6s.
  Seis segredos novos (37 no catálogo, 7 em Serviços contando a ponte): `garden-bloom` (Glaucia/estufa → serviço real),
  `beacon-relay` (Prince/sinalizador/botão do canal → contato), `ring-alignment` (três anéis, alinhar marcas no alto),
  `seed-vault` (`<details>` sob os cards; replay alterna serviço), `greenhouse-dusk` (luz ≤20%; botão/Esc restauram),
  `pollination` (conectar os cards em ordem). Todos no Comlink PT/EN/ES e `AureliaEggs`; campos editáveis/diálogos/IME
  não capturam frases. Em celular, os dois atores oferecem as ações dos props sem alvos pequenos sobrepostos.
  Atlas do epílogo agora usa a placa de Aurélia e seis luas; elegibilidade do sinal segue três dos quatro mundos anteriores.
  Portal do contato: `contact-portal.ts` (controlador) + `portal-sky.ts` (pétalas e sinal em pixel). O próprio `.contact-portal` (que envolve o
  palco e o `ContactForm`) sobe para a top layer via `popover="manual"` + `role="dialog"`/`aria-modal`: nada é clonado nem movido; o `.contact-cinema__dock`
  guarda a altura. Abre por clique em `a[href]` para `#contato` na mesma rota (captura em `window`; com outro `?assunto=` deixa navegar e o form novo
  abre ao montar) e ao chegar com `#contato` (depois do boot). Íris por `clip-path`, foco no `#contact-title`, Tab preso, Esc/botão fecham, devolvem o
  foco e tiram o hash. `html[data-contact-portal]` trava a rolagem (Lenis parado) e devolve o cursor nativo. Enviar com movimento abre o portal e
  lança o sinal (`.contact-launch[data-launch=charging|delivered|failed]`); movimento reduzido não abre nem lança. O `ContactForm` tem 3 etapas
  (`contactSteps`/`validateContactStep` em `contact-schema.ts`; necessidade em rádios) só depois da hidratação e com envio ativo; SSR/sem JS/desativado = formulário
  único. Turnstile só monta na 3ª etapa. Painel expõe `data-contact-step`/`data-contact-flaw`; `crewReaction` acende um retrato aprovado de cada
  (`ContactCrew` em `AureliaScene.tsx`, `data-glaucia`/`data-prince` no `.contact-cinema`). Testes: `tests/contact-portal.test.ts`.
  História da rolagem (7 capítulos, copy em `src/i18n/aurelia-story.ts`, CSS em `src/app/aurelia-story.css`): `OrbitRings` (planeta e 3 anéis
  em CSS 3D; a rolagem inclina, gira e acende Engenharia/Liderança/IA até as marcas se alinharem, `RING_CUES`/`ALIGN_CUE`), `ProofConstellation`
  (números reais de `proofStars()` em `aurelia-records.ts`: eventos, cidades, países presenciais, artigos, anos desde `careerStart`, estrelas do
  GitHub; contagem pelo `data-count` do `HomeChoreography`, linhas por DrawSVG), `GardenBloom` + `bloom-engine.ts` (uma flor em pixel por serviço,
  semente → caule → folhas → botão → pétalas; painel ativo, inativos `inert`), `WorkSteps` (Conversa → Proposta → Prática, texto a revisar pela
  Glaucia), `BeaconFinale` + `finale-sky.ts` (noite, feixe do sinalizador, 7 estrelas formam a flor de Aurélia, CTA `#contato` abre o portal,
  créditos, "Continua…" em poeira estelar via `createStardust`, estrela fora do mapa → `#sinal`) e `EpilogueTransmission` (sempre visível:
  sinal fraco com 3 luzes e os 5 mundos, ou o `EpilogueSignal` quando desbloqueado; o `EpilogueSignal` saiu da seção de colaboração).
  Palcos são `position: sticky` (não pins) e só ganham altura/animação com `data-live` (movimento ligado); sem JS/reduzido = conteúdo em lista.
  Testes: `tests/aurelia-story.test.ts`.
  Testes: `tests/aurelia.test.ts` e `tests/aurelia.browser.mjs` (somente a usuária executa). Ver resultados exatos e pendências
  de validação visual na seção “Retomada — Serviços/Aurélia” do handoff. Sem commit/build/servidor/navegador.
- 404 (Maré Rubra, Coordenadas Perdidas): `src/app/[lang]/not-found.tsx` e `src/app/not-found.tsx` renderizam `RedTide`
  (`src/components/notfound/RedTide.tsx`, idioma por `useParams`, `forcedLang` na raiz), CSS `src/app/red-tide.css`, copy `src/i18n/red-tide.ts`.
  Placa em vídeo: fonte `GE-PL-07-red-tide.mp4` (8 s, com áudio; Glaucia e Prince de costas já estão no vídeo, então não há sprites
  por cima). Web em `public/galaxia/scenes/red-tide/`: `background.webm`/`.mp4` (loop de 7 s, mudo, último segundo dissolvido em
  pixels no começo via ffmpeg `xfade=pixelize`) e `poster.webp` (movimento reduzido/sem JS). `plasma-engine.ts`: brasas, poeira de
  plasma na `WINDOW` e faixas de falha de sinal, mais `drawWarp` (salto para casa). Segredos (catálogo +2): `signal-recovered`
  (Glaucia/console: radar no console do vídeo e `nearestRoute` em `src/lib/red-tide-routes.ts`, só rotas reais, nunca o epílogo) e
  `paw-rescue` (Prince: o `lost-signal-beacon` sai da nebulosa até ele por MotionPath e o `navigation-portal-restored` abre; clicar
  faz o salto). Props/poses gerados por `node scripts/build-galaxia-assets.mjs red-tide` (`POSES["red-tide"]`, `layout.json`). Vídeo e
  plasma pausam fora da tela/aba. Testes: `tests/red-tide.test.ts`.
  Episódio narrado (desenho, 29 s, narração em PT): `RedTideEpisode.tsx` abre por clique num `<dialog>` com TV CRT, som, controles e
  legendas `episode.{pt,en,es}.vtt` (tempos estimados pelos silêncios do áudio; ajustar se preciso), `episode.webm/.mp4` (960 px, ~5 MB)
  e `episode-poster.webp` em `public/galaxia/scenes/red-tide/`. A fonte atual `approved-source/GE-PL-07-red-tide.mp4` é o episódio
  (sobrescreveu o clipe de 8 s do loop). Som da ponte: `ambience.ogg/.mp3` (áudio do clipe original, com a explosão, em loop com o
  mesmo cruzamento) toca baixo (`AMBIENCE_VOLUME`) só com o som do cabeçalho ligado (`isSoundEnabled`/`SOUND_EVENT`, sem mexer no
  `sfx.ts`), para em aba oculta e enquanto o `<dialog>` do episódio está aberto. Prompt do vídeo do epílogo: `docs/art/galaxia-encantada/prompts/GE-PL-08-beyond-orbit-video.md`.
