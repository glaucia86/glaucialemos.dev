# Handoff — Migração Galáxia Encantada

## Retomada — Serviços/Aurélia (26/10/2026)

- **Branch:** `feat/aurelia-servicos`, sem commit/push/merge/deploy. `/[lang]/servicos` migrou para Aurélia em PT/EN/ES. Eventos e 404 continuam no tema anterior.
- **Estrutura:** quatro capítulos no padrão de Lúmina: hero com `AureliaScene`/`AureliaMotion`, anéis orbitais, canteiros com os serviços reais e canal de colaboração. `home.css`, `HomeChoreography`, `ChapterTag`/`ChapterJump`, `BootSequence variant="aurelia"` (`aurelia-boot`), `ReadingProgress variant="aurelia"`, `data-sound-world="aurelia"` e copy `d.aurelia`. Nenhuma dependência nova.
- **Contratos preservados:** `ContactForm.tsx` e `EpilogueSignal.tsx` não foram alterados. Metadata, `formId`, validação, estados de sucesso/erro, links `?assunto=workshop|mentoria|palestra#contato`, CTAs `#contato`/Eventos e regra dos três mundos continuam. Os dados vêm de `getServicos()`: títulos, descrições e preço sob consulta. Nada foi inventado sobre clientes, entregas, resultados ou depoimentos.
- **Arte:** executado `node scripts/build-galaxia-assets.mjs aurelia --debug`. Placa `GE-PL-06-aurelia.png` preservada, grid 1, 160 cores de ator/128 de props. A sheet da Glaucia tem fundo magenta e poses reais `idle` (mão no quadril), `relaxed`, `side`, `back` + quatro retratos. Não contém regador/gesto de transmissão. O pipeline faz key exclusivo da 06 e deriva uma pequena camada de pálpebras para `blink`. Prince: `front`, `stand`, `paw` + retratos. Sem inventar poses de regar/tocar. Estufa e sinalizador são props aprovados já presentes na pasta da cena.
- **Composição:** Glaucia (88;93;h47), Prince (77;93;h14); estufa (69;92), sinalizador (74,5;93). Prévia raster examinada em `/tmp/aurelia-composition.png` e `/tmp/aurelia-mobile.png`; **não são screenshots do site**. Frente da Glaucia segue a arte recebida; perfil entra brevemente na floração. O sinalizador fica na frente da pata do Prince.
- **Movimento:** `garden-engine.ts` usa canvas 2D pixelado (pétalas, esporos, vapor e reflexos; pixel 2; até 160 partículas), pausa via `observeMotionActivity` fora de tela/aba e destrói RAF/observer. `petal-jump.ts` desenha uma espiral apenas quando a rolagem muda. Pin/zoom só no `HERO_OVERLAY` (1200×680 + hover/fine pointer); compacto empilha texto e placa 16:9. Respiração/piscar CSS pausados com a cena. Movimento reduzido mantém o resultado estático; troca de preferência durante a interação conserva o desfecho.
- **Seis segredos novos:** catálogo total 37; Serviços tem sete IDs contando `epilogue-signal`. O atlas do epílogo usa a placa/paleta de Aurélia e seis luas próprias; a ponte não conta como lua nem amplia a elegibilidade do epílogo.

| ID | Mouse/toque | Teclado | Frases PT / EN / ES (também no Comlink) |
|---|---|---|---|
| `garden-bloom` | Glaucia ou estufa do hero; revela um serviço, replay alterna os três | Tab até Glaucia, Enter/Espaço; “Outra possibilidade” para replay | `florescer` / `garden bloom` / `florecer` |
| `beacon-relay` | Prince, sinalizador do hero ou botão do canal; pata aciona luz, rola até contato e foca o título | Tab até o botão, Enter/Espaço | `sinalizador` / `beacon` / `baliza` |
| `ring-alignment` | Girar cada anel até marca no alto; início [1,2,3], 3/2/1 cliques respectivamente | Tab/Enter/Espaço nos três botões | `anéis` / `rings` / `anillos` |
| `seed-vault` | Abrir o `<details>` “Cofre de sementes” sob os cards; botão/replay alterna serviço | Tab até summary, Enter/Espaço | `sementes` / `seeds` / `semillas` |
| `greenhouse-dusk` | Slider de luz ≤20%; botão restaura | Tab até slider, Home/setas; Esc restaura | `estufa` / `greenhouse` / `invernadero` |
| `pollination` | Botões dos cards 01→02→03; fora de ordem reinicia | Tab/Enter/Espaço na mesma ordem | `polinizar` / `pollinate` / `polinizar jardín` |

- Em telas ≤640 px, os hotspots duplicados de estufa/sinalizador ficam ocultos; Glaucia/Prince oferecem as mesmas ações com alvos de toque separados. Frases ignoram input, textarea, select, contenteditable, diálogos, composição IME e boot pendente. Registro/replay/reset usam apenas o store existente. Nenhum segredo escreve em campos, envia formulário ou cria pedido. Os links de serviço são ações explícitas de pré-preenchimento.
- **Revisão estática:** corrigidos conflito de especificidade do título (coluna de 44%) e retomada de timeline iniciada com a cena inativa. Controles puros em `aurelia-controls.ts` evitam importar datasets/dictionaries nos componentes de anéis/cards. Sons opt-in novos com gain ≤0,08 e duração total por tom ≤0,6s.
- **Verificação:** `npm run lint`, `npm run typecheck`, `npm test` passaram (33 arquivos, 280 testes). `tests/aurelia.test.ts` cobre records, SSR dos serviços, preço/assuntos, catálogo/i18n, assets alpha/croma, layout, motor/cancelamento de RAF e progresso do salto. Testes de contagem/atlas/sons atualizados. Sintaxe de `aurelia.browser.mjs`, `hero-scenes.browser.mjs`, `epilogue.browser.mjs` verificada com `node --check`.
- **Ambiente:** no início faltavam GSAP/Lenis já declarados; não se usou rede nem mocks para contornar isso. As versões corretas passaram a estar disponíveis no ambiente (`gsap 3.15.0`, `@gsap/react 2.1.2`, `lenis 1.3.23`), e as verificações completas foram reexecutadas com sucesso. `package.json`/lockfile intactos.
- **Pendente para a Glaucia:** build (com dev parado) e navegador. Não foi iniciado servidor nem executado Playwright. Rodar `node tests/aurelia.browser.mjs` contra o servidor escolhido (`BASE_URL`, padrão 3100). O script cobre PT/EN/ES, mouse/teclado/toque, rádio/frases, reduced motion, no-JS, pin/resize, pausa fora da cena, retorno de rota, assuntos e gate do epílogo. Formspree é interceptado; casos de validação/sucesso/erro precisam de `NEXT_PUBLIC_FORMSPREE_ID` configurado no build e são explicitamente pulados se ausente.
- Conferir no site: recorte/piscar, tamanho/posição de props, enquadramento em 390/768/1280/1440, foco/leitor de tela, comportamento em aba oculta, ritmo e áudio, LCP/CLS/INP. Nada disso foi medido no navegador. Resumo completo em `/tmp/aurelia-summary.md`.


## Retomada — Auditoria Playwright do epílogo (26/10/2026)

- **Como:** a Glaucia subiu o `npm run dev`; o agente rodou Playwright contra `localhost:3000` (1920×1080, 1440×900, 1366×768, 1280×720, 768×1024, 390×844; antes/depois de `last-light`). Capturas em `%TEMP%/bo-audit*`.
- **Causas-raiz:** (1) `main { overflow: hidden }` global tornava o `<main>` contêiner de rolagem e quebrava todo `position: sticky` (carta, céu e créditos vazios) → `.beyond-orbit { overflow: clip }`. (2) `PageEffects` animava toda `section` com `editorial-enter` (`transform`, `fill: both`), anulando o `translate` do pin ao terminar (~1800 px vazios) → exclui `main.beyond-orbit`.
- **Enquadramento:** `.beyond-orbit__frame` (container `size`) mostra o palco 16:9 `.beyond-orbit__scene` como *cover* (`--sw/--sh/--sl/--st`, foco `--fx`). Desktop ≥ 1200×680: tela inteira abaixo do menu (`--bo-header` medido), pin em `top top+=menu`. Retrato (`max-aspect-ratio: 3/4`): 4:5 com foco 0,92 (constelação desloca 52 % e só aparece no final). Demais: 16:9 inteiro. Vinheta, grão, clarão, barras, rolo, pista e "Pular" passaram para a moldura.
- **Visual/console:** clarão do mergulho e gases com gradiente radial; fios contínuos e mais discretos; cruz das estrelas de 1 px; brilho dos trajes menor; anel e luas dos planetas refinados; mundos futuros com chiado. Cópias da placa viraram `background-image` (sem aviso de LCP) e `gsap.set([])` foi evitado (sem "target not found"). Carta: a rolagem escolhe a frase e a troca é um crossfade de 0,7 s, então parada há sempre uma frase nítida. Reauditoria: sem rolagem horizontal, sem avisos no console.

## Retomada — "A Viagem" abaixo da cena (26/10/2026)

- **Pedido:** "quando faço scroll para baixo não tem nada". Decisão: atlas + carta + convite + viagem contínua, **só depois da estrela**; antes dela, apenas a pista `starHint` com seta.
- **Entregue:** `src/lib/voyage.ts` (mundos, `worldReport`, `paletteAt`), `voyage-engine.ts` (céu sticky, dobra pela velocidade, gás colorido, convergência final), `EpilogueVoyage.tsx` (carta com SplitText, atlas de planetas com luas, créditos, próxima estrela que reexecuta a sequência). A viagem fica fora do hero (pins não aninhados); hero com `refreshPriority: 1`. Carta é rascunho para a Glaucia revisar (PT/EN/ES).
- **Verificação:** lint, typecheck, `npm test` (32 arquivos / 268). `node --check` no teste de navegador, ampliado com a viagem; **build e navegador não executados**.
- **Ajustes (vazio antes da carta, responsividade, créditos):** a carta virou palco sticky (`data-cinema`, uma frase por vez com crossfade/desfoque, palavras acendendo, contador `01/08`), sem pin; já aparece ao entrar na seção e cabe em qualquer tela (fonte limitada por `vw` e `svh`). O hero não passa da altura da tela (`max-width` por `100svh × 16/9`; o ambilight cobre as laterais). Créditos: título de filme, retratos em pixel da Glaucia e do Prince, faixa com um ponto por segredo, insígnias dos mundos explorados, rolo guiado pela rolagem dentro de um projetor (`--focus` no crédito central, faixas de película); pós-créditos como monitor com scanlines, REC piscando e texto embaralhado. Atlas em duas colunas no tablet.

## Retomada — Epílogo cinematográfico "A Última Luz" (26/10/2026)

- **Pedido:** página secreta "extremamente criativa", com efeitos de cinema. Decisões da Glaucia: placa 16:9 sempre inteira + ambilight; pin + câmera na rolagem; constelação da jornada, créditos, pós-créditos, texto de poeira estelar com zoom in/out; usar `float-b/c/d`; luz de contorno; sons opt-in de impacto. O número de segredos não é fixo (`EGGS.length`); mundos ainda sem segredos aparecem como "???" e no pós-créditos.
- **Arquivos novos:** `src/lib/journey-constellation.ts`, `src/components/epilogue/{veil-engine,veil-jump,stardust-text}.ts`, `{JourneyConstellation,EpilogueCredits}.tsx`, `public/galaxia/scenes/beyond-orbit/ambient.webp` (64×36; `AMBIENT` no pipeline gera o mesmo arquivo), `tests/journey-constellation.test.ts`. Reescritos: `BeyondOrbitScene`, `BeyondOrbitMotion`, `beyond-orbit.css`; ampliados: i18n, `sfx.ts` (11 sons, gain ≤ 0,08 por tom), `beyond-orbit.ts` (`STAR`, `CORE`, `DEPTH`, `BEATS`, `CUES`, `poseStyle`).
- **Contratos mantidos:** `.beyond-orbit__star`, `#epilogue-finale` (WAAPI no início da sequência), `data-floating`, `data-orbit-actor` (um único `span` por ator; brilho é `<i>`, coração é `<b>`), `data-cable` (o pulso de luz também), 16:9 e texto acima da cena no compacto. A estrela foi para o núcleo (72; 41).
- **Verificação:** lint, typecheck e `npm test` (31 arquivos / 262 testes). Teste de transparência dos sprites ficou mais rápido (contagem em vez de `expect` por pixel; estourava 5 s). `node --check tests/epilogue.browser.mjs` passou, com caso novo de modo cinema/pular/Esc/pin. **Build e navegador não executados** (dev ativo na 3000; navegador só pela Glaucia).
- **Pendente com a Glaucia:** ver e ouvir a sequência (ligar o som no cabeçalho), volume dos graves, ritmo dos `BEATS`, legibilidade da constelação no celular, desempenho real (blend modes/máscaras) e console.

## Retomada — Epílogo com Glaucia e Prince flutuando (26/10/2026)

- **Direção aprovada na conversa:** a Glaucia trocou o terraço por exploração em gravidade zero; os dois usam capacetes e trajes claros, com cabos. Aceitou as poses levemente laterais e pediu um de cada lado, olhando para o centro. Glaucia fica à esquerda, espelhada horizontalmente; Prince à direita, na orientação original. Essa decisão substitui o terraço e as poses estritamente de costas do kit inicial.
- **Fontes recebidas:** `GE-GL-08-beyond-orbit.png` e `GE-DOG-08-beyond-orbit.png`, ambas 1792×1008 com transparência real. O fundo sem plataforma veio com o nome `GE-PL-01-earth-observatory.jpg`; foi copiado intacto para `GE-PL-08-beyond-orbit.jpg`. O PNG aprovado do Observatório e todos os arquivos recebidos foram preservados. Manifest atualizado somente com as três novas fontes canônicas (86 entradas).
- **Pipeline:** `node scripts/build-galaxia-assets.mjs beyond-orbit --debug`. Placa inteira sem repixelização (WebP 240.052 bytes), 4 poses por ator, grid 1 e 160 cores. Nomes `float-idle/b/c/d`: não inventar `reach`/`look-up`, pois a folha não contém esses gestos claros. Só `float-idle` aparece na página; as demais são reserva. `FLOAT_ANCHORS` usa o ponto de conexão da mochila. `Sprite.anchorY` e `Stage.flip` estendem `poseBox` sem alterar as cenas antigas.
- **Composição:** `layout.json` registra Glaucia (63;64), altura 29% da placa; Prince (81;65), altura 15%. As coordenadas são pivôs de mochila, não pés. Nebulosa intacta em 16:9. Texto acima em compacto, sobreposto somente no desktop; final abaixo da área visual para não competir com os atores. Descrição acessível atualizada em PT/EN/ES.
- **Movimento:** `BeyondOrbitMotion` usa `useGSAP`, `useMotionEnabled`, IntersectionObserver, ResizeObserver e Page Visibility. Dois ritmos suaves, deslocamentos <1% da placa e rotação ≤1,3°. Cabos SVG acompanham exatamente os pivôs e seguem para fora do canto inferior direito; não há nave desenhada. Tudo pausa fora da tela/aba e limpa no unmount. Sem JS/reduced motion: mesma composição estática, final visível. Sem áudio novo, partículas, pin ou bloqueio de rolagem. Interação da estrela continua revelando o final, sem simular gestos ausentes nas folhas.
- **Prévia inspecionada:** `node scripts/preview-beyond-orbit.mjs` gera composição estática com cabos em `%TEMP%/beyond-orbit-preview/`, larguras 1792/1440/390. O agente conferiu 1440 e 390: recortes sem retângulo branco, direções convergentes e trajes claros. É prova de arte, **não captura do site nem teste de navegador**.
- **Verificação desta etapa:** lint, typecheck e `npm test` passaram (30 arquivos / 249 testes), incluindo transparência dos 8 sprites, preservação de cores claras, âncoras, orientação, limites de flutuação, continuidade do ciclo e cabos. `node --check tests/epilogue.browser.mjs` passou. Suíte de navegador ampliada com flutuação, pausa fora da tela, fallback estático e cabos após resize; **não executada**.
- **Build desta etapa pendente:** `npm run dev` está ativo na porta 3000 (processo Next 33208 na conferência). Não foi encerrado nem concorreu com build. Depois de parar o dev, executar `npm run build`; depois `npm run start -- --hostname 127.0.0.1 --port 3100` e `node tests/epilogue.browser.mjs`. Para conferir agora no dev: `/pt/alem-da-ultima-orbita`.
- **Pendente com a Glaucia:** revisão visual/velocidade/tamanho dos atores no site, foco/leitor de tela, console e métricas reais. Sem commit, push, merge ou deploy.

## Retomada — Epílogo funcional, arte pendente (26/10/2026)

- Branch `feat/epilogo-ultima-orbita`, criada da `main` (`a3225ab`) com `--no-track`. Sem commit, push, merge ou deploy. O kit em `docs/galaxia-encantada-epilogo/` e seu ZIP foram preservados.
- `/[lang]/alem-da-ultima-orbita` estática em PT/EN/ES, com metadata localizada e `noindex, nofollow`; fora do menu principal. Não existe sitemap no projeto. Copy tipada do kit em `src/i18n/beyond-orbit.ts`.
- **Entrega funcional, não composição artística:** fundo escuro neutro, sem imagens ou personagens emprestados. Texto acima da área 16:9 em telas compactas; sobreposição somente em 1200×680 ou maior. Sem pin, salto, intro obrigatória ou scroll lock. Retorno ao Observatório.
- **31 segredos:** `epilogue-signal` em Serviços e `last-light` no epílogo. Catálogo declarativo extraído para `src/lib/egg-catalog.ts`, reexportado por `eggs.ts` para preservar os consumidores e evitar ciclo com `epilogue.ts`. A regra de `curious-letter` permanece igual.
- `discoveredWorldCount`, `epilogueRemaining` e `epilogueUnlocked`: uma descoberta em três mundos distintos entre Home/Sobre/Projetos/Conteúdo. Duplicatas, IDs inválidos, globais e segredos novos não contam. A própria função `discover` também valida o gate do sinal.
- `EpilogueSignal` aparece depois do formulário de Serviços, que ainda usa o tema anterior. Listener somente quando elegível; handler revalida o snapshot e impede duplo acionamento antes de `router.push`. Clique/toque/teclado e rádio convergem via `emitEgg`.
- Comlink: comandos `alemdaultimaorbita`, `beyondthelastorbit`, `masalladelaultimaorbita`; bloqueio localizado conta mundos e fora de Serviços orienta a página correta. Link de revisita após descobrir o sinal. Link direto não registra o sinal.
- `BeyondOrbitScene` fornece o final no HTML do servidor; `BeyondOrbitMotion` só o oculta após hidratação quando há movimento habilitado e `last-light` ainda não foi descoberto. A estrela de 48×48 revela e permite replay por opacity (1,2 s), sem novo progresso. Sem JS/reduced motion/manual: copy visível. Revisita e reset usam exclusivamente o store existente, incluindo sincronização entre abas e fallback em memória.
- Verificação: lint, typecheck, suíte unitária (29 arquivos / 241 testes) e build passaram; o build lista as três rotas e `ƒ Middleware`. Testes do epílogo incluem 0–4 mundos, comandos/idiomas, SSR, persistência, storage bloqueado, reset e sincronização. Uma verificação adicional de copy detectou acentos corrompidos durante edição; corrigidos e retestados. Revisão independente estática sem defeitos críticos/importantes; teste de replay reforçado conforme a revisão.
- **Navegador não executado:** `tests/epilogue.browser.mjs` preparado e verificado apenas quanto à sintaxe. A Glaucia executa `npm run start -- --hostname 127.0.0.1 --port 3100` e, em outro terminal, `node tests/epilogue.browser.mjs`. Se mudar a porta, usar `$env:BASE_URL='http://127.0.0.1:PORTA'`. Capturas em `docs/screenshots/epilogue/`. Inclui fluxo Serviços → epílogo, rádio nos três idiomas, revisita/replay/reset, abas, teclado/toque, no-JS, reduced motion/manual, 390/1440 px e resize.
- **Pendências reais:** validar capturas, foco/legibilidade, anúncio por leitor de tela, console e métricas LCP/CLS/INP no navegador. Nenhum score ou resultado visual foi medido. Aprovar no Grok as três fontes `GE-PL-08`, `GE-GL-08`, `GE-DOG-08`; depois integrar `beyond-orbit` ao pipeline, transparência, poses de costas, âncoras, composição, resposta dos personagens e atmosfera. O pipeline e os assets aprovados existentes não foram alterados.

## Lúmina — TV antiga com o último vídeo (25/10/2026)
- **Novo segredo `retro-tv` (7º de Conteúdo; catálogo 29).** TV de tubo em pixel (CSS/SVG) no capítulo 5. Liga por clique, toque, Enter, rádio ou comando digitado (`tv`, `play`, `assistir`, `watch`, `televisao`, `television`, `mirar`). Ao ligar: o tubo abre, chia por 0,6 s e o player `youtube-nocookie` entra na tela 4:3. Abaixo da TV ficam "Desligar" e "Abrir no YouTube". Com movimento reduzido, liga direto. Sem JS, a tela é a miniatura com link para o YouTube.
- **Vídeo:** RSS público do canal, sem chave de API, lido a cada 24 h. Os Shorts são pulados; hoje toca "Build in Public: Melhorias no Repo Doctor… #02" (`I_TlmQ1T3Ok`). Reserva em `src/data/youtube.json`.
- **Constelação:** a dica no rádio agora fala em losangos e traz o comando ("Transmissão: série").
- **Verificação:** lint, typecheck e `npm test` (28 arquivos / 222 testes) passaram; `node --check` em `tests/lumina.browser.mjs` (casos novos da TV). **Build não rodado:** a porta 3000 estava ocupada pelo dev.

## Lúmina — Etapas B e C: página e atuação (25/10/2026, branch `feat/lumina-conteudo`)

A Glaucia aprovou as poses da 04B. A `main` local foi atualizada com o PR #8 (Marte, `e765e02`) e a branch foi avançada para esse ponto, sem commit de merge. Sem commit, push ou publicação.

- **Página `/conteudo`:** cinco capítulos, mapeados em `AGENTS.md`:
  1. Biblioteca Viva (hero);
  2. Anéis de cristal (números + um cristal por ano + veios por plataforma);
  3. Estantes (`#artigos`, filtros, busca, ordem, ecos, portal prismático);
  4. Coleções (4 séries);
  5. Próximo capítulo (CTA Serviços/YouTube, última página escrita, luz da biblioteca).

  A `PageHero` + `HeroScene` (kashyyyk) e o `ContentFilter` saíram, junto com o CSS de folhas e vaga-lumes do `hero-scenes.css`. O `alt` do hero deixou de citar o Chewbacca. `public/pixel/conteudo-chewbacca.jpg` e o CSS genérico `.filter`/`.article-list` ficam para a auditoria final.
- **Atuação:**
  - Glaucia: `touch` → `listen` → `cheer`. O monólito sobe até o dedo (`CRYSTAL_LIFT`), vibra 1 px e solta ondas em losango.
  - Prince: `sniff-a`/`sniff-b` ×2 → `scan`, com o feixe ciano da mochila até os livros; a pilha abre e ele termina em `wag-b`. Hover ou foco no Prince abana em repouso.
  - Sem vida própria: personagens fixos, só piscando.
- **Sons:** `chime`, `page`, `prism`, `scanner`, `echo`, `link`, `dusk`, `refract`, `facet`, `hover/click-lumina`, todos ≤ 0,6 s.
- **Catálogo:** 28 segredos (2 globais + 6 Home + 7 Sobre + 7 Projetos + 6 Conteúdo).
- **Verificação:**
  - lint, typecheck, `npm test` (27 arquivos / 217 testes) e `npm run build` com `ƒ Middleware` passaram.
  - `node --check` passou em `tests/lumina.browser.mjs`, `scene-lifecycle` e `editorial`: os dois últimos deixaram de tratar `/conteudo` como Star Wars, e o `editorial` usa `.shelves__filter`/`.shelf-card`.
  - Nada no navegador foi executado nem visto pelo agente.
- **Para a Glaucia validar:** `npm run start -- --hostname 127.0.0.1 --port 3100` e `node tests/lumina.browser.mjs` (capturas em `docs/screenshots/lumina/`). Conferir:
  - o cristal chegando ao dedo;
  - a leitura do texto sobre a placa em 1440 px;
  - o salto de cristal;
  - o véu do entardecer;
  - os prismas no celular;
  - o volume dos sons.

## Lúmina — Etapas 0 e A (25/10/2026, branch `feat/lumina-conteudo`)

Plano aprovado pela Glaucia: branch nova a partir de `feat/marte-projetos` (78b9fa6), sheets extras para as ações, correção dos idiomas de `artigos.json` com aprovação item a item, 6 segredos (`crystal-whisper`, `first-page`, `prism-align`, `crystal-echo`, `series-constellation`, `library-dusk`). Sem commit/push.

- **Assets processados:** `node scripts/build-galaxia-assets.mjs lumina` gera `public/galaxia/**/lumina/**` e `src/data/galaxia/lumina.json`.
  - Glaucia: `idle`, `blink` (camada limpa) e as reservas `touch-duo`/`cheer-duo`, que trazem o Prince colado com outro peitoral e não vão para o palco. `SEAMS.lumina.glaucia = [655, 1083]`.
  - Prince: `stand`, `side`, `look` (os dois com a mochila-scanner), `face-*`.
  - Props: `PROP_CLEANUP.lumina` amplia o `keyDark` (halo azul-marinho) e passa `despeck`, que tira a lasca ao lado do portal e os ciscos sob o monólito. Não muda as outras cenas.
- **Composição candidata (`layout.json`):** Glaucia (88; 84; h 47), Prince (78; 84,5; h 14). Prévias em `%TEMP%/lumina-etapa-a/`:
  - `0A`: monólito entre os dois, em (82,5; 82,5), e pilha de livros em (73,5; 84,5);
  - `0D`: monólito flutuando à altura do ombro, em (81,8; 64);
  - `0E`: pedestal em (82,2; 84);
  - cada uma em `-composicao`, `-debug` (caixas e área de texto até 47 %), `-zoom` e `-mobile-390`;
  - também `poses.png`, `props-3x.png` e `blink-check.png`.
  - **A Glaucia escolheu a A.**
- **Registros:** `src/lib/lumina-records.ts` (curadoria por URL, que dá erro se a URL sumir) + `tests/lumina.test.ts`.
- **Idiomas:** a Glaucia pediu algo mais simples do que aprovar item a item. Corrigi pelo idioma claro do título 25 rótulos de `artigos.json`: 23 viraram `pt-BR` e 2 viraram `es` (#68 e #86). O #63 ("Curso Gratuito - Bootcamp…") ficou como estava, por ser ambíguo.
- **Sheets 04B integradas** (os hashes entraram no manifest):
  - Glaucia B: `touch`, `listen`, `cheer`, `read`. Normalizada por `read` → `idle` (0,8746). O contorno cinza-claro fora do traço escuro sai com `LIGHT_FRINGE`/`peelLightFringe`. O livro do `read` saiu com a palavra "TOUCH" escrita: fica de reserva.
  - Prince B: `sniff-a`, `sniff-b`, `scan`, `wag-a`, `wag-b`, `sit-up`. Normalizado por `sniff-a` → `side` (1,7386). O `wag-a` vinha maior e é reduzido a 0,88 (`POSE_SCALE`).
  - Prévias em `%TEMP%/lumina-etapa-c/` (`00-composicoes.png`, `glaucia-poses.png`, `prince-poses.png`).
  - O dedo do `touch` fica em ≈ (78,5; 55), acima do monólito (topo ≈ 68 %). Proposta: o cristal se ergue até a mão dela.
- **Pendente:** aprovação das poses pela Glaucia; depois, Etapa B.

**Prompt GE-GL-04B-lumina** (anexar `GE-MASTER-GL`, `GE-GL-04-lumina`, `GE-PL-04-lumina`):
```text
Create a production-ready 2D PIXEL ART ACTOR SPRITE SHEET of GLÁUCIA in Lúmina, the EXACT same woman, costume, colours, proportions and art style as the attached Lúmina sheet (GE-GL-04): long navy researcher coat with glowing crystal patches and lilac lining, violet jumpsuit, crystal wrist device, dark boots, long dark wavy hair. FOUR equally sized full-body panels in one row, identical character scale, feet on the SAME baseline, facing three-quarter-left, and NO DOG in any panel: (1) TOUCH: leaning slightly forward, right arm reaching forward-left and down, index finger touching the top of an invisible waist-high crystal (do NOT draw the crystal), curious smile; (2) LISTEN: same body pose as panel 1, eyes closed, soft smile, as if hearing the crystal hum; (3) CHEER: one fist raised, eyes happily closed, the other hand at the chest; (4) READING: holding an open book at chest height with both hands, looking down at the pages. Crisp square pixels, limited palette, no smooth gradients, no blur, no 3D. Complete hands and boots inside each panel with margin; panels must not touch. No background, no ground, no sparkles, no text, no logos. True transparent PNG.
```

**Prompt GE-DOG-04B-lumina** (anexar `GE-MASTER-DOG`, `GE-DOG-04-lumina`, `GE-PL-04-lumina`):
```text
Create a production-ready 2D PIXEL ART DOG SPRITE SHEET of PRINCE, the EXACT same cream Pomeranian from the attached Lúmina sheet (GE-DOG-04): same fur, ears, muzzle, eyes, violet crystal harness with teal straps and the small backpack crystal scanner, same scale and art style. SIX equally sized full-body panels in one row, SIDE VIEW FACING LEFT, paws on the SAME baseline, identical scale, panels not touching: (1) SNIFF A: nose down close to the floor, tail up; (2) SNIFF B: nose moved slightly forward, one front paw lifted; (3) SCAN: head raised and alert, ears up, the backpack crystal glowing brighter cyan; (4) TAIL WAG A: standing happy, mouth open, tail curled to the left; (5) TAIL WAG B: same pose, tail curled to the right; (6) SIT LOOKING UP: sitting, head tilted up and to the right as if looking at a person beside him. Natural dog anatomy, no human gestures. Crisp square pixels, limited palette, dark outline, no smooth gradients, no blur, no 3D. No background, no floor, no sparkles, no text. True transparent PNG.
```

## Retomada — próxima página: Conteúdo/Lúmina, a Biblioteca Viva

**Estado conferido (25/10/2026):** branch `feat/marte-projetos`, criada da `main` (que já contém Home e Sobre, PR #7). Projetos/Marte está no commit `78b9fa6`, feito e enviado pela Glaucia para `origin/feat/marte-projetos`. Ainda não há PR para a `main`. Depois desse commit, só `AGENTS.md` e este handoff têm alterações. O agente não tem autorização para fazer commit, push, merge ou publicação.

**Última verificação:** lint, typecheck, `npm test` (26 arquivos / 197 testes) e `npm run build` com `ƒ Middleware` passaram. `tests/marte.browser.mjs` foi escrito e **não foi executado**. Validação visual e auditiva de Marte e de Nivéora continuam pendentes com a Glaucia.

### Marte em uma tela (detalhes nos registros abaixo e no `AGENTS.md`)
- **Hero:** Glaucia (87; 93), Prince de três quartos (75,5; 93) pela sheet `GE-DOG-03B`, rover, console, beacon, maleta. Poeira em pixel (`dust-engine.ts`) e salto da rolagem (`dust-jump.ts`: rajada lateral, varredura com os números reais, estática âmbar).
- **Seções:**
  - Telemetria do laboratório: GitHub regerado a cada 24 h, selo de leitura, amostras minerais, terminal antigo, colônia que cresce.
  - Arquivo de invenções: filtros, busca, ordenação e carcaças com o primeiro commit; bancada do site com comparação antes/depois.
  - Estações parceiras: contribuições, com o inseto vermelho do PR #555.
  - Próxima missão: painel de poeira com o último push.
- **Segredos (7):** `rover-scan`, `sample-cache`, `terminal-launch`, `first-sprout`, `before-pretty`, `lost-bug`, `dust-fall`. Catálogo: 22 (2 globais + 6 Home + 7 Sobre + 7 Projetos).
- **Sons:** paleta por mundo via `data-sound-world` no `<main>`. Digitação, disquete e CRT no terminal. Tudo opt-in, até 0,6 s, sem loops.
- **Correções gerais nesta etapa:** abertura das páginas (lag smoothing do GSAP durante o `BootSequence`), centralização dos `<dialog>` (`margin: auto`), teste de sintaxe dos CSS (`tests/css-syntax.test.ts`).

### Pendências de Marte (não bloqueiam Lúmina)
- A Glaucia validar no navegador: `npm run start -- --hostname 127.0.0.1 --port 3100` e `node tests/marte.browser.mjs` (capturas em `docs/screenshots/marte/`).
- Conferir:
  - o encaixe do disquete no drive (`.retro__slot` em `marte.css`);
  - o volume dos sons;
  - a leitura do console em 390 px;
  - o texto público da decisão "pixelada demais".
- PR de `feat/marte-projetos` para a `main`: decisão da Glaucia.

### Ponto de partida para Lúmina
- **Base:** combinar com a Glaucia se Lúmina sai de `feat/marte-projetos` (Marte já está no commit `78b9fa6`) ou da `main`, depois do PR de Marte. Não trocar de branch carregando alterações sem combinar.
- **Ler:** seção 4.4 do `PLANO-MIGRACAO.md`. Lúmina é um mundo inventado com arquitetura cristalina, árvores e rios bioluminescentes, em violeta, ciano e magenta. À direita, Glaucia pesquisadora e Prince com scanner de cristais; à esquerda, artigos e conteúdos com o CTA e os filtros atuais. Aceite: três segredos (plano 8.3: `crystal-whisper`, `prism-align`, `library-dusk`), filtros independentes da cena, URLs íntegras, teclado/toque/mouse.
- **Página atual:** `src/app/[lang]/conteudo/page.tsx` usa `PageHero` + `HeroScene` (Chewbacca/Kashyyyk) e `ContentFilter` com `artigos.json`. A seção 7.1 do plano pede trocar `sceneByImage` por `sceneId` nesta migração.
- **Arte aprovada:** `GE-PL-04-lumina.png`, `GE-GL-04-lumina.png`, `GE-DOG-04-lumina.png` e `props/lumina/` (`archive-book-open/closed`, `crystal-archive-platform`, `crystal-display-pedestal`, `crystal-monolith`, `prismatic-gate-open/closed`). Ainda não processada: `node scripts/build-galaxia-assets.mjs lumina --debug`, nomear `POSES`/`ANCHORS`, palcos em `layout.json` e prévias compostas para aprovação **antes** de qualquer atuação. Conferir na sheet do Prince se há poses sem capacete ou acessório, como aconteceu em Marte.
- **Repetir o padrão de Marte:**
  - `BootSequence` com variante e chave próprias;
  - `ReadingProgress` com variante própria;
  - `data-sound-world="lumina"` com paleta sonora nova (cristais, páginas, prismas);
  - salto da rolagem próprio (túnel de cristais);
  - segredos distribuídos pelo conteúdo, não só no hero, sempre com registros reais e fonte;
  - movimento reduzido, toque, teclado e versão sem JS desde a proposta.
- **Começar em planejamento:** propor narrativa, seções, rolagem e segredos antes de implementar.

**Operação:** não iniciar servidor nem rodar a suíte de navegador pelo agente. Não rodar build com o `npm run dev` aberto (conferir as portas 3000/3100 com `netstat -ano`). Escrever para a Glaucia em PT-BR.

## Sons de 2026-10-25 — digitação no terminal e paleta por mundo

- `src/lib/sfx.ts`: timbre de ruído filtrado (`wave: "noise"`), `play(kind, { detune, gain })`, intervalo mínimo por som (`MIN_GAP`/`allowed`), nada toca com a aba oculta. Tudo continua opt-in, ≤ 0,6 s e sem loops (`tests/sfx.test.ts`, `tests/holonet.test.ts`).
- Terminal de Marte: `dig`, `disk-in`, `crt-on`, uma tecla `type` por caractere do prompt, rajada de teclas + `return` por linha do cartão, `disk-out` ao ejetar.
- Hover/clique por mundo: `data-sound-world` no `<main>` (Home `observatory`, Sobre `niveora`, Projetos `mars`), lido pelo `FxLayer` via `uiSound`. Páginas não migradas mantêm `blip`/`key`.
- Sobre: eras do mapa, fio do `BetweenLines` (`thread`), passos e estrela do `BorrowedStar`, acorde por idioma no `BorderlessAurora`, neve do `SnowDrift` (`snow`), carta curiosa (`letter`).
- Projetos: rajada (`gust-dust`, só com a cena ativa), salto da rolagem (`scan-sweep` e `static`, uma vez por passagem), colônia (`build`, uma vez por lote por visita), painel de poeira (`brush`), inseto no hover/foco.
- Verificação: lint, typecheck, 197 testes e build passaram. Escuta pendente com a Glaucia.

## Ajustes de 2026-10-25 — terminal antigo, colônia e bancada do site

- **Telemetria:** continua lida da API do GitHub no servidor, agora a cada 24 h (`REVALIDATE_SECONDS = 86_400`; `revalidate = 86400` em Home e Projetos). Sem rota nova nem custo extra; `GITHUB_TOKEN` segue opcional. Selo "Leitura do GitHub em {data}" na seção.
- **Diálogos centralizados:** o reset `* { margin: 0 }` anulava a centralização do `<dialog>`; `.mars-dialog` e `.crt` usam `margin: auto`.
- **Terminal antigo (`RetroTerminal.tsx`, segredo `terminal-launch`):** Prince sentado ao lado do computador; clicar/tocar/Enter nele desenterra um disquete; arrastar até o drive, tocar ou Enter insere; o computador liga e abre a tela CRT verde centralizada com `A:\> npx glaucia_lemos86`, o cartão de 2018, a nota de 2013 e "Atualizar para hoje"/"Ejetar". Rádio e frase executam a cadeia. Arte final: folha `GE-PROP-03B-mars-lab.png` (aprovada), recortada por `PROP_SHEETS` em `retro-computer-off/on`, `floppy-flat`, `floppy-upright`; a tela verde translúcida do Grok fica opaca com `fillHoles`.
- **A colônia que cresceu (`ColonyGrowth.tsx`):** substitui os Estratos; módulos por ano via `colonyLots` (`src/lib/mars-records.ts`), construção por rolagem, estufa com o broto (`first-sprout`) no lote mais novo.
- **Bancada do site refeita:** três estações + comparação antes/depois (`BeforeAfter.tsx`, range nativo) com a pose do Grok × sprite na placa e botão para a versão 3 × 3 recusada. O script gera `public/galaxia/bench/mars-lab/{raw-idle,plate,grid-3}.webp` (sai `sheet.webp`).
- Verificação: lint, typecheck e 181 testes passaram. Build não rodado (dev aberto). `tests/marte.browser.mjs` atualizado (CRT centralizado, disquete por teclado, colônia, comparação), não executado.

**Prompt GE-PROP-03B-mars-lab** (anexar GE-PROP-03 e GE-PL-03):
```text
Create a clean pixel-art GAME PROPS ASSET SHEET for Marte — Vale das Invenções, matching the attached GE-PROP-03 props (same crisp pixel size, palette and lighting: iron red #743A31, rust #BD5632, copper #D27A43, golden orange #F3AE62, cyan #42CFE0). Original objects, each separated with generous empty space, front three-quarter view: (1) RETRO LAB COMPUTER OFF: a chunky 1980s-style desktop computer customised for a Mars lab, beige-copper casing with small cyan status LEDs, a dark curved CRT monitor (screen off, deep green-black glass), a separate keyboard, and a visible empty 3.5-inch floppy drive slot on the base unit; (2) THE SAME COMPUTER ON: identical object and position, CRT screen glowing soft phosphor green with faint scanlines but NO text, drive LED lit; (3) A 3.5-inch FLOPPY DISK lying flat, dusty with a little red Mars dust, blank paper label, metal shutter; (4) the same floppy disk upright, clean. Crisp square pixels, limited palette, no smooth gradients, no blur, no 3D, no text, no logos, no brand names. True transparent PNG background.
```

## Entrega de 2026-10-25 — Projetos/Marte, Vale das Invenções

**Estado:** a `feat/niveora-sobre` já estava mesclada na `main` (PR #7). Marte foi implementado na branch nova `feat/marte-projetos`, criada da `main`, sem commit, push ou publicação. A validação visual de Nivéora e de Marte continua pendente com a Glaucia.

- **Assets:** composição aprovada (Glaucia 87; 93; h 47 · Prince 75,5; 93; h 14 · rover 75,5; 63,6 · beacon 61,8; 61,5 · console 96; 93,5 · maleta 67; 93,5). A Glaucia pediu o Prince mais de frente: a sheet `GE-DOG-03B-mars-lab.png` (stand, gaze, watch, sniff, três quartos com capacete) foi normalizada pela pose `side` e virou a referência do palco. A pose de frente da `GE-DOG-03` está sem capacete e não é usada. Costuras novas: `SEAMS` (Glaucia, x = 702) e costura da 03B (x = 1274); a mesclagem por caixa agora respeita costuras (saída de Nivéora conferida, sem mudança). O broto verde da pose `sniff` virou prop (`DERIVED_PROPS`) e o 7º segredo, por pedido dela.
- **Página:** hero com poeira em pixel e salto de rolagem próprio (rajada lateral, varredura com grade/osciloscópio e os números reais, estática âmbar “SINAL ADQUIRIDO”); Telemetria (amostras minerais, estratos do tempo, console npx); Arquivo (filtros, busca, ordenação, destaque e carcaças); Estações parceiras (contribuições); Próxima missão. Tatooine removido (CSS, textos, componentes, sprites, teste de navegador, mapeamento no `HeroScene`).
- **Segredos (7, todos com registros reais e fonte):** ver `AGENTS.md`. Catálogo total: 22 (2 globais + 6 Home + 7 Sobre + 7 Projetos). Primeiros commits em `src/data/marte-registros.json` (snapshot de 25/10/2026). Nota da Glaucia aplicada: o cartão npx é de 2018, mas a carreira começa em dez/2013 (TopDown Sistemas, de `experiencia.json`).
- **Verificação:** lint, typecheck, `npm test` (24 arquivos / 179 testes) e build com `ƒ Middleware` passaram; `node --check` nas suítes de navegador alteradas. `tests/marte.browser.mjs` foi escrito e **não foi executado**; `hero-ctas` e `scene-lifecycle` deixaram de checar Projetos como cena Star Wars.
- **Correção (abertura curta):** o `SmoothScroll` desliga o lag smoothing do GSAP para o Lenis; ao navegar para Projetos (página pesada, ainda mais no `npm run dev`), a montagem bloqueava a thread e o GSAP pulava para o fim da abertura. O `BootSequence` agora liga `lagSmoothing(500, 33)` enquanto a abertura toca (o Lenis está parado), restaura `0` ao fechar e só começa a timeline depois de dois frames. Vale para todas as páginas.
- **Para a Glaucia validar:** `npm run start -- --hostname 127.0.0.1 --port 3100` e `node tests/marte.browser.mjs` (capturas em `docs/screenshots/marte/`). Conferir: texto público da decisão “pixelada demais”, leitura do console no desktop e no celular, alvo de toque dos atores em 390 px, poeira/rajadas, salto, carcaças e circuito do bug.

## Entrega de 2026-10-25 — histórias além da cena

Três novos segredos implementados sobre a branch e as alterações existentes, sem modificar placa, hero, insígnias ou aurora. Sem dependências novas, commit, push ou publicação.

Verificação final desta entrega: `npm run lint`, `npm run typecheck`, `npm test` (**23 arquivos / 166 testes**), `npm run build` (com `ƒ Middleware`), `node --check tests/niveora.browser.mjs` e `git diff --check` passaram. Processos conferidos antes do build, sem Next dev ativo. Para validar no navegador, iniciar produção na porta 3100 e executar `node tests/niveora.browser.mjs` em outro terminal.

- **`between-lines` (Sobre):** fio acionável depois do mapa abre uma anotação com três conexões documentadas — Udemy desde novembro/2017, internacionalização do Node.js desde dezembro/2018, exemplos TypeScript/tradução portuguesa no Generative AI for Beginners. Curadoria em `src/lib/niveora-stories.ts` usa fontes dos datasets. `BetweenLines` oferece detalhes nativos sem JS, foco ao fechar e desenho do fio por 1,2 s quando movimento está habilitado. Filtros do mapa não afetam a anotação.
- **`borrowed-star` (Sobre):** pegada após os idiomas do diário chama Prince por 2,4 s, reutilizando as quatro poses de caminhada e uma estrela SVG separada. A estrela do convite final fica disponível imediatamente; a descoberta acontece ao abrir o bilhete. Rádio vai direto ao bilhete. Nenhuma interação com a atuação do hero. Movimento reduzido dispensa caminhada; RAF/GSAP pausam fora da tela/aba; cliques repetidos não reiniciam a sequência. Preferência de movimento cancela a solicitação pendente, evitando caminhada invisível ao reativar.
- **`curious-letter` (global):** após três IDs válidos distintos, excluindo a própria carta, o rádio mostra um envelope. Diálogo abre somente por ação do visitante. A regra `remainingDiscoveries` é compartilhada por comando, botão, execução e descoberta; carta bloqueada informa quantos segredos faltam. Textos PT/EN/ES em `src/i18n/niveora-stories.ts`, com fallback nativo sem JS na Sobre.
- **Memória:** mesma chave v2 e mesmas APIs de descoberta; Sobre tem 7 segredos e catálogo tem 26. `subscribeReset` distingue reset explícito/remoção via storage de novas descobertas. Reset local ou em outra aba fecha histórias, recolhe estrela/carta, cancela caminhada e callbacks. Nenhuma voz ou som adicional.
- **Verificação:** testes unitários novos para elegibilidade, deduplicação, persistência, reset entre abas e curadoria/traduções; suíte de navegador atualizada para teclado/toque, PT/EN/ES, foco, rádio, recarga, pausa, preferência de movimento, reset e fallback sem JS. Navegador/servidor não executados pelo agente, conforme AGENTS.md. Reflow em 720 CSS px permanece na suíte; zoom real de 200% e revisão visual ficam com a Glaucia.

## Correção de runtime — timers de FrozenCards (2026-10-25)

Corrigido `Cannot read properties of null (reading 'classList')` no encerramento do gelo: a remoção por quebra/cleanup podia ocorrer antes do callback de derretimento, tornando `parentElement` nulo. `ice-blocks.ts` agora guarda o card dono, cancela o timer anterior e torna a remoção idempotente. O cleanup libera todos os blocos/timers e cancela os tweens do gelo. Três testes de regressão cobrem timers concorrentes, desmontagem e recongelamento. Lint, typecheck e 162 testes (22 arquivos) passaram. Build não repetido porque o Next dev está ativo; servidor e navegador não foram operados pelo agente.

## Entrega de 2026-10-25 — vento, Prince e aurora sem fronteiras

Implementação do plano nesta sessão, sobre as alterações anteriores da `feat/niveora-sobre`. Sem commit, push, publicação, dependências ou alteração da placa aprovada. Este registro substitui **apenas a descrição do mapa** da entrega abaixo; insígnias, contador, progresso de gelo e textos aprovados foram preservados.

- **Vento:** `createSnow.onGust(active)` informa início e fim real da dissipação (intensidade menor que 12%). `brace`/`wind` acompanham esse estado; frio prevalece na nevasca, caminhada e cápsula mantêm prioridade. O relógio do motor pausa junto à cena.
- **Prince:** primeira busca continua com 8.760 ms; `paw-tracks` só é descoberto aos 4.920 ms, quando a cápsula surge. `paw-tracks` ou `memory-capsule` restauram a cápsula na hidratação. Novo clique chama `greetingSample`: 840 ms de sacudidas + 2.160 ms abanando, sem caminhada/pegadas nem reinício por cliques repetidos. A saudação também registra `paw-tracks` quando a Glaucia revelou a cápsula primeiro. Sem movimento, apenas texto e cápsula. Reset explícito pelo rádio aguarda o encerramento da interação; outras descobertas não contam como reset. Atrasos da atuação da cápsula/prisma usam o relógio ativo, pausando fora da tela/aba.
- **Mapa:** markup e visual recuperados de `d657c1ddc3eb8647c9bbfdf996cb4a8e7ca8e02a`, limitados ao mapa. Trilhas paralelas, durações proporcionais, bandas e nave ligada à rolagem. Detalhes junto às barras por hover, foco ou botão; lado de abertura considera o filtro ampliado. Sem coluna de experiências, cartão persistente ou seletor mapa/lista. `?era=`, `popstate`, fallback desconhecido e lista até 900 px/sem JS preservados.
- **Aurora:** `BorderlessAurora.tsx`, textos em `src/i18n/aurora.ts`, curadoria explícita por URL em `src/lib/aurora.ts`. Lago, aurora refletida e sinais em SVG de coordenadas inteiras/CSS. Seleção local PT/EN/ES, conteúdo imediato, onda de 1,6 s substituída a cada escolha, pausa fora da tela/aba; três registros no HTML sem JS. A seção não acrescenta segredo. Um sinal segue até a nave ao rolar e acende os motores; decolagem preservada sem exigir todos os idiomas.
- **Ritmo:** intervalos de Nivéora limitados por `--niveora-gap`; fechamento sem mínimo de 80svh e sem dependência de reveal para ficar visível. Mudanças do mapa, artigo selecionado e dimensões da página recalculam ScrollTrigger.

Verificação local: lint, typecheck, suíte unitária (21 arquivos / 159 testes) e build de produção com `ƒ Middleware`. Revisão independente corrigiu reset indevido na nevasca, descoberta após Glaucia, posição de tooltip filtrado e espaço acima das insígnias. `tests/niveora.browser.mjs` foi atualizado; **não foi executado**, conforme AGENTS.md. Validação visual, toque, zoom real de 200% e execução da suíte continuam com a Glaucia. Com dev parado, iniciar `npm run start -- --hostname 127.0.0.1 --port 3100` e executar `node tests/niveora.browser.mjs`; compartilhar resultado e capturas.

## Entrega de 2026-10-25 — trajetória legível e identidade de Nivéora

Plano executado nesta sessão: os cinco ajustes pedidos, na branch `feat/niveora-sobre`, sem dependências novas, commit, push ou publicação.

- **Mapa:** `CareerMap` agora é client e concentra filtro, seleção e apresentação. Cada experiência tem uma linha e uma coluna de texto que quebra; barras continuam proporcionais. Seleção inicial mais recente, preservada ao trocar etapa quando aplicável e ao alternar mapa/lista. Detalhe persistente com cargo completo, empresa, período, vínculo atual e fonte. `?era=` e `popstate` sincronizados; valor desconhecido abre todas. Até 900 px e sem JS, lista completa; botões nativos respondem a Enter/Espaço/toque. Etapas e lista em ordem recente. A nave só anima com eixo visível, aba ativa e movimento permitido. Controles antigos removidos de `AboutChoreography`.
- **Insígnias:** `CrystalBadges` com estrela, terminal, engrenagem e livro em SVG pixel art; IDs e destinos centralizados em `BADGES`, rótulos PT/EN/ES. Botão independente vira/volta sem aninhar link; face oculta usa `hidden`, foco fica no botão. Sem movimento, sem rotação. Sem JS, faces empilhadas e links disponíveis. Os alvos de `FrozenCards` foram preservados.
- **Descobertas:** contador junto à cena, fora do HUD decorativo; total derivado apenas de `EGGS.page === "about"`. `useDiscoveries` usa snapshot/assinatura compartilhados com Comlink; `egg:reset` em `forget()`, storage entre abas, deduplicação e fallback em memória quando storage falha.
- **Identidade/textos:** progresso `variant="niveora"` com gelo/ciano/cristal apenas na Sobre; CTA de workshops e mentorias com destino localizado preservado; aviso pessoal independente/opiniões próprias no rodapé dos três idiomas.

Decisões de implementação: fallback sem JS mostra todas as etapas, independentemente da query, para manter HTML estático completo. A contagem SSR começa em zero e sincroniza na hidratação. O efeito da nave fica restrito à visibilidade do eixo; detalhes de carreira não dependem de animação. Sem alteração das demais páginas além do aviso global do rodapé.

Verificações: `npm run lint`, `npm run typecheck`, `npm test` (20 arquivos, 156 testes) passaram; `node --check tests/niveora.browser.mjs` e `git diff --check` passaram. Build de produção passou com `ƒ Middleware`; processos Node conferidos antes, sem dev ativo. Testes novos cobrem seleção, traduções/modelo das insígnias, deduplicação, storage bloqueado, persistência, evento entre abas e reset. Revisão de código independente encontrou sobreposição do fallback sem JS das insígnias, corrigida com faces empilhadas e assert de geometria na suíte de navegador.

**Pendente de execução pela Glaucia:** `tests/niveora.browser.mjs` foi ampliado, mas não executado nesta sessão, conforme AGENTS.md. Executar servidor de produção e suíte; conferir visual PT/EN/ES, mapa com nomes longos/Cume, teclado/toque, descongelamento e zoom real de 200%. A suíte verifica reflow em 720 CSS px (equivalente à largura útil de 1440 px a 200%), mas não substitui a conferência de zoom do navegador. Capturas em `docs/screenshots/niveora/`.

```powershell
npm run start -- --hostname 127.0.0.1 --port 3100
# Em outro terminal:
node tests/niveora.browser.mjs
```

Estado em 25/10/2026. Leia este arquivo, depois o `AGENTS.md` e o `docs/galaxia-encantada/PLANO-MIGRACAO.md`.

## Onde estamos
- **Home** (`/[lang]`, Observatório das Primeiras Luzes): aprovada e mesclada na `main` (PR #6).
- **Sobre** (`/[lang]/sobre`, Nivéora, o Mundo Nevado das Auroras): implementada na branch `feat/niveora-sobre`, com alterações e arquivos novos ainda sem commit. Última entrega: lint, typecheck, 166 testes e build passaram; validação visual e execução de `tests/niveora.browser.mjs` pendentes. Não faça commit nem push sem a Glaucia autorizar.
- **Em andamento:** Etapa B de Nivéora. As três sheets novas foram normalizadas e recortadas em **23 poses adicionais**; prévias compostas geradas. **Composição aprovada pela Glaucia**, com ambos na plataforma superior. Atuação implementada; validação visual e testes de navegador pendentes (ver registro abaixo).
- **Ideias antigas não implementadas:** “Degelo total” (`thaw`) e Prince abanar sozinho. Não estão aprovadas para execução; a numeração antiga foi superada pelos novos segredos narrativos.
- **Erro de hidratação no `<body>`** (`cz-shortcut-listen`): vem da extensão ColorZilla; resolvido com `suppressHydrationWarning` no `<body>` de `src/app/[lang]/layout.tsx`.
- **Backup do Star Wars:** `archive/star-wars` (= `main` em `8adb94b`), já enviada ao GitHub.
- **Projetos:** Marte implementado em `feat/marte-projetos` (ver o registro no topo); validação visual pendente.
- **Depois:** Conteúdo/Lúmina → Eventos/Atlas → Serviços/Aurélia → 404/Maré Rubra → modo história → auditoria final.

## Como a Sobre (Nivéora) ficou
- **Cena:** Glaucia (parca térmica; poses `idle`, `blink`, `capsule` ajoelhada, `cheer`) em x=84 %, pés em y=80 % e Prince de corpo inteiro (`stand`, `sniff`) em x=76 %, pés em y=80 %, na plataforma superior de neve. Cristal prismático na saliência de gelo, estação (o `aurora-beacon`) à direita, cápsula enterrada em x=64 %, y=80 %.
- **Motor:** `snow-engine.ts` (neve em 3 planos, rajadas, aurora que segue o cursor, modos nevasca e prisma). Pausa fora da tela.
- **Rolagem:** `blizzard-jump.ts`, com túnel de neve com vento, cortinas de aurora descendo e fim num branco de nevasca com geada (`.hero-jump--niveora`).
- **Segredos (7):** `paw-tracks`, `memory-capsule`, `whiteout`, `aurora-prism`, `snowdrift`, `between-lines`, `borrowed-star`. A carta `curious-letter` é global. Catálogo atual: 26 (2 globais + 6 Home + 7 Sobre + 11 Projetos).
- **Abaixo do hero:** Diário de expedição (retrato vivo + gelo que quebra + insígnias de cristal), Mapa da travessia (eras Primeira neve/Travessia/Cume, ids `foundation`/`advocacy`/`leadership`), Chamado da expedição (a nave da Galáxia decola).
- **Removidos:** `EchoBaseScene`, `LeiaActor`, `EchoEggs`, `RebelDossier`, `Threepio`, `ice.ts`, `hit.ts`, `about.css`, `echo-base.ts`, `build-leia-layers.mjs`, `leia.test.ts`, `echo-base.browser.mjs` e a variante de abertura `echo`.
- **Pipeline:** o script agora limpa a margem preta dos props (`keyDark`). Se a Home for regenerada, os props dela também passam por essa limpeza.
- **Pixel art (Home e Nivéora):** a primeira versão (G = 3, 40 cores) ficou pixelada demais e foi rejeitada. Ficou a opção A, no estilo do Vader de Serviços: placa aprovada intocada; Glaucia, Prince e props reduzidos para a resolução da placa (1 px de arte = 1 px da placa), borda dura, 160/128 cores (`layout.json` + script).
- **Frio e gelo:** cards congelam na nevasca (raspar/3 cliques/3 toques/Enter, degelo automático em 45 s); rajadas inclinam Glaucia e Prince; na nevasca tremem e acumulam neve; vapor da respiração.

## Artes pendentes (Etapa B)
### Integração dos assets — 25/10/2026
- `POSES.niveora` agora nomeia `glaucia:B` (4), `prince:B` (12) e `prince:C` (7). Os WebPs e `src/data/galaxia/niveora.json` foram regenerados somente para Nivéora; o manifest recebeu os hashes das três PNGs.
- Normalização uniforme por sheet em memória, antes do recorte final, com nearest-neighbor: Glaucia B = **830/889 = 0,933633** (`cold-a` → `idle`); Prince B = **468/264 = 1,772727** (`walk-1` → `sniff`); Prince C = **473/343 = 1,379009** (`wag-a` → `stand`). Alturas medidas sem os 2 px de margem do recorte. Metadados continuam no espaço lógico original, `px` guarda a resolução web.
- A cauda de `wag-b` toca `sit-up` na sheet C: separação explícita em **x = 1302** na fonte, transformada junto com a escala. Contagem 4/12/7 validada antes e depois da normalização. Âncoras novas em `ANCHORS`: quadris da Glaucia e apoio anatômico do Prince, sem deixar a neve das patas definir a posição de cavar.
- Prévias em `%TEMP%/niveora-etapa-b-review/`: `00-composicoes.png` (9 composições), `glaucia-poses.png`, `prince-poses.png`, imagens individuais `01-referencia` até `09-abanar`, variantes `-debug` com caixas/âncoras e `mobile-390.png`. São composições estáticas dos assets, não screenshots do navegador. Posições deslocadas da caminhada/cápsula são estudos para a animação futura.
- Revisar: visor/capuz nas poses novas da Glaucia; diferenças de jaqueta e proporção do Prince; `shake-b` olhando para cima, não sacudindo; patas traseiras sem botas em `wag-a`/`wag-b` na própria fonte. Flocos isolados fora do corpo em `shake-a` seguem o descarte de componentes pequenos do pipeline; partículas da sacudida ficam para a atuação após aprovação.
- Validação: lint, typecheck e **148 testes passaram** (11 testes de cenas, incluindo 2 novos). Comparação de 62 hashes confirmou fontes e assets anteriores intactos. Build não executado porque a porta 3000 estava ocupada; nenhum servidor ou teste de navegador foi iniciado.
- Revisão independente: sem problemas críticos/importantes. Pendência menor: `sit-up` (pose reservada) contém um fragmento isolado de 4 pixels à esquerda, em (1,45) no WebP de 82×130; revisar o recorte antes de ativar essa pose.
- Ainda pendente: aprovação visual e toda a atuação da Etapa B. Não remover `niv-lean`/`data-gust` antes de implementar `brace`/`wind`. `warm-hands`, caminhada lenta e `sit-up` estão disponíveis como assets, sem gatilhos novos. Sem commit/push.

### Ajuste de composição após revisão da Glaucia
- Prince estava perto da fenda/precipício: movido de (72,5; 94) para **(76; 80)** na plataforma superior, mantendo a escala. Trilha refeita nessa faixa (y=79,4–80); cápsula movida para (64; 80). Hotspot e pontos do Prince acompanham o layout compartilhado.
- Prévias atualizadas em **%TEMP%/niveora-etapa-b-safe-ground/**, mesmos nomes de arquivo. Esta pasta substitui a composição anterior para aprovação; a pasta anterior foi preservada para comparação. Os 11 testes de cena passaram após o ajuste. Animações novas continuam pendentes.

- Segundo ajuste solicitado: Glaucia recuada de (84; 93) para **(84; 80)**, na mesma plataforma do Prince, sem mudar escala nem a posição aprovada dele. Prévias mais recentes: **%TEMP%/niveora-etapa-b-crew-safe-ground/**. Os 11 testes de cena passaram.

### Atuação após aprovação da composição
- A Glaucia aprovou explicitamente a composição final: Glaucia (84; 80), Prince (76; 80). Escalas mantidas.
- `niveora-acting.ts` define a sequência amostrada por tempo ativo (8,76 s): farejar → caminhar → cavar → revelar cápsula → abanar → voltar andando, com inversão horizontal ancorada nas patas. A atuação e o hotspot acompanham a posição na plataforma; pegadas surgem sob a pata dianteira.
- Rajadas usam `brace`/`wind`; nevasca usa `cold-a`/`cold-b` e `cold`; ao acalmar, Prince alterna `shake-a`/`shake-b` com partículas. `niv-lean` e `data-gust` foram removidos. Tremor de 1 px e neve permanecem; as camadas de neve acompanham a pose.
- Busca explícita tem prioridade sobre o clima para Prince; cápsula tem prioridade para Glaucia. Sacudida espera o fim da interação; hover/foco de teclado abana apenas em repouso. Não há abanar espontâneo. `warm-hands`, caminhada lenta e `sit-up` continuam reservados.
- RAF da atuação pausa fora do viewport/aba e é cancelado no cleanup. O retorno restaura a posição aprovada. Callback assíncrono do rádio verifica desmontagem antes de agir.
- Movimento reduzido mantém hotspots e rádio funcionais: revela cápsula/pegadas sem caminhada, abre os registros diretamente e comunica os outros segredos sem tempestade/partículas. Trocar a preferência durante a busca cancela a animação e preserva acesso à cápsula.
- Revisão independente detectou instabilidade no hover por mudança da caixa ao abanar; corrigida com união estável de stand/wag-a/wag-b em repouso, mantendo caixa dinâmica durante a busca. Teste de regressão falhou antes e passou depois.
- Validação automática: lint, typecheck e 152 testes passaram. `tests/niveora.browser.mjs` atualizado (busca/retorno, frio/sacudida, foco, redução de movimento no meio da busca e pausa fora da tela); sintaxe validada, execução pendente pela usuária. Build omitido com porta 3000 ocupada. Sem commit/push.

### Referência das sheets e próxima etapa
As três sheets foram geradas e salvas em `docs/art/galaxia-encantada/approved-source/` (todas 1792×1008, com alpha). Conferi visualmente:
- `GE-GL-02B-niveora.png`: 4 quadros, como pedido: `cold-a`, `cold-b`, `brace` (cabelo voando, com riscos de vento azuis ao redor), `warm-hands`. Capuz com visor nos 3 quadros de frio (o `idle` não tem visor).
- `GE-DOG-02B-niveora.png`: veio com **12 quadros em 3 linhas de 4** (pedi 8). Linha 1: `walk-1..4`. Linha 2: `sniff-down-a`, `sniff-down-b`, `dig-a`, `dig-b`. Linha 3: mais 4 quadros de caminhada mais lenta (`walk-slow-1..4`, opcionais). Vista lateral, virado para a esquerda.
- `GE-DOG-02C-niveora.png`: 7 quadros em uma linha: `cold`, `shake-a`, `shake-b` (saiu olhando para cima, não torcido), `wag-a`, `wag-b`, `sit-up`, `wind`. O quadro 2 tem flocos soltos em volta.

**Cuidados ao integrar:**
- **Escala diferente entre sheets.** O `poseBox` usa a mesma escala para todas as poses de um ator, calculada pela pose de referência (`idle` da Glaucia, `stand` do Prince, das sheets originais). As sheets novas têm outro tamanho de pixel, então o script precisa **normalizar cada sheet extra** antes de recortar. Use uma pose equivalente como referência de altura: `cold-a` ≈ `idle` da Glaucia; `walk-1` ≈ `sniff` (lateral) do `GE-DOG-02`; `wag-a` ≈ `stand`. Confira com `--debug` e uma prévia composta.
- **Cor da jaqueta do Prince:** a `02B` saiu num azul-marinho com mochila de floco de neve e a `02C` em roxo-violeta. Compare com `GE-DOG-02` na prévia; se destoar demais, pedir à Glaucia para regerar.
- **Riscos de vento e flocos soltos** podem virar componentes pequenos: o recorte descarta partes menores que 5 % da maior, a não ser que estejam dentro da caixa da pose.
- **Âncoras (`ANCHORS`)** para as poses novas: quadris da Glaucia; patas do Prince (centro entre as patas da frente e de trás na vista lateral).
- Depois de integrar, **remover a inclinação CSS** (`niv-lean`/`data-gust`), substituída por `brace`/`wind`. Manter o tremor de 1 px e a neve nos ombros.

Nomes das poses: `POSES.niveora["glaucia:B"]`, `["prince:B"]`, `["prince:C"]` (ordem de leitura: linhas de cima para baixo, da esquerda para a direita). Depois: regenerar (`node scripts/build-galaxia-assets.mjs niveora --debug`), conferir a prévia e animar.
- Glaucia: `brace` nas rajadas; `cold-a`/`cold-b` alternando na nevasca.
- Prince: `wind` nas rajadas; `cold` na nevasca; `shake` no fim da nevasca.
- A inclinação atual (CSS, 1,8° por ~2 s a cada 7–13 s) é sutil demais; as poses `brace`/`wind` substituem esse efeito.
- Toque no Prince: fareja, anda pela trilha (pegada surge sob a pata), cava, a cápsula aparece, abana o rabo, volta andando.
- Mouse sobre o Prince: abana o rabo.

O "abanar sozinho de vez em quando" só entra se a Glaucia aprovar (ela recusou "vida própria" na Home).

Anexar em todos os prompts: `GE-MASTER-GL` ou `GE-MASTER-DOG`, a sheet atual de Nivéora (`GE-GL-02-niveora` ou `GE-DOG-02-niveora`) e `GE-PL-02-niveora`.

**GE-GL-02B-niveora**
```text
Create a production-ready 2D PIXEL ART ACTOR SPRITE SHEET of GLÁUCIA in Nivéora, the EXACT same woman, costume, colours, proportions and art style as the attached Nivéora sheet (GE-GL-02): insulated white and glacier-blue parka with violet fur hood, navy trousers, white thermal boots, dark navy outline pixels. FOUR equally sized full-body panels in one row, identical character scale, feet on the SAME baseline, facing three-quarter-left: (1) COLD A: hugging herself with both arms crossed tight over the chest, shoulders raised, hood up, eyes squinting, small visible breath vapour; (2) COLD B: same pose as panel 1 but shoulders and arms shifted one or two pixels (a shiver frame that alternates with panel 1); (3) BRACING AGAINST WIND blowing from the RIGHT: body leaning slightly into the wind, right forearm raised to shield the face, hair and hood fur blown to the left; (4) WARMING HANDS: gloved hands cupped in front of the mouth, breath vapour between them. Crisp square pixels, limited palette, no smooth gradients, no blur, no 3D. Complete hands and boots inside each panel with margin. No background, no ground, no text, no logos. True transparent PNG, or flat pure white #FFFFFF background not used on the character.
```

**GE-DOG-02B-niveora**
```text
Create a production-ready 2D PIXEL ART DOG SPRITE SHEET of PRINCE, the EXACT same cream Pomeranian from the attached Nivéora sheet (GE-DOG-02): same fur, ears, muzzle, eyes, violet insulated jacket with snowflake sensor, fur collar and little paw boots, same scale and art style. EIGHT equally sized full-body panels in TWO rows of four, all in SIDE VIEW FACING LEFT, paws on the SAME baseline, identical scale: row 1 = WALK CYCLE frames 1 to 4 (a natural trotting loop: contact, down, passing, up; tail up, ears forward); row 2 = (5) SNIFF GROUND A, nose touching the snow, tail up; (6) SNIFF GROUND B, nose moved slightly forward, one front paw lifted; (7) DIG A, both front paws scraping snow backwards, head low; (8) DIG B, front paws in the opposite position, small clumps of snow flying behind. Natural dog anatomy, no human gestures. Crisp square pixels, limited palette, dark outline, no smooth gradients, no blur, no 3D. No background, no ground, no text. True transparent PNG, or flat pure white #FFFFFF background not used on the dog.
```

**GE-DOG-02C-niveora**
```text
Create a production-ready 2D PIXEL ART DOG SPRITE SHEET of PRINCE, the EXACT same cream Pomeranian, jacket, boots, scale and art style as the attached Nivéora sheet (GE-DOG-02). SEVEN equally sized full-body panels in one row, paws on the SAME baseline, identical scale, three-quarter view facing left: (1) COLD: crouched low, ears flat back, tail tucked, eyes half closed, shivering; (2) SHAKE A: shaking snow off, head and fur twisted to the left, fur fanned out, snow flakes flying; (3) SHAKE B: same shake twisted to the right; (4) TAIL WAG A: standing happy, mouth open, tail curled to the left; (5) TAIL WAG B: same pose, tail curled to the right; (6) SIT LOOKING UP: sitting, head tilted up and to the right as if looking at a person beside him; (7) WIND: standing braced against a strong wind blowing from the RIGHT, head lowered, eyes squinting, ears and fur blown to the left. Natural dog anatomy. Crisp square pixels, limited palette, dark outline, no smooth gradients, no blur, no 3D. No background, no ground, no text. True transparent PNG, or flat pure white #FFFFFF background not used on the dog.
```

## Como a Home foi feita (repetir o padrão por página)
1. **Assets:** fontes aprovadas em `docs/art/galaxia-encantada/approved-source/`:
   - `GE-PL-0X-<cena>.png`: placa de fundo sem personagens.
   - `GE-GL-0X-<cena>.png`: sheet de poses da Glaucia. A da Home inclui o Prince sentado junto. As 05–07 têm fundo branco, sem alpha; o script recorta.
   - `GE-DOG-0X-<cena>.png`: sheet do Prince sozinho. O peitoral muda entre sheets, então na Home só o rosto do Prince foi usado, no balão.
   - `props/<cena>/*.png`: props já recortados com alpha.
   - Cenas: `earth-observatory`, `niveora`, `mars-lab`, `lumina`, `earth-orbit`, `aurelia`, `red-tide` (01–07).
2. **Gerar a web:** `node scripts/build-galaxia-assets.mjs niveora --debug`. As prévias saem no `%TEMP%`. Depois:
   - nomeie as poses em `POSES` (em ordem de leitura);
   - ajuste a âncora dos quadris em `ANCHORS`;
   - rode de novo.
   
   Saídas: `public/galaxia/**` e `src/data/galaxia/<cena>.json`. O `blink` vira uma camada só com os olhos sobre o `idle`.
3. **Cena:** registrar em `src/lib/scenes.ts` (`SCENES[...]` com `stages` do ator). Criar `XxxScene.tsx` (server: camadas e `HOTSPOTS`) e `XxxMotion.tsx` (client: ações em `data-stage`/`data-pose`), no molde de `src/components/home/Observatory*.tsx`.
4. **Enquadramento:** plano com a mesma projeção cover da placa e ancorado no chão (`--scene-x`, `--scene-y: 100%`), para nunca cortar os pés.
5. **Conferir a composição antes de pedir revisão:** gerar prévias compondo placa, sprite e caixas dos hotspots com `sharp`, num script temporário na raiz do repositório (o `sharp` só resolve ali). Apague o script depois.
6. **Segredos:** catálogo em `src/lib/eggs.ts` + nomes/dicas em `src/i18n/comlink.ts` (PT/EN/ES). Cada um com `discover`, replay pelo rádio, equivalente por toque e frase digitável. Os segredos antigos da página migrada saem junto (Sobre hoje tem 9 do Star Wars; o plano prevê 4: `memory-capsule`, `paw-tracks`, `whiteout`, `aurora-prism`; veja a seção 8.3 do plano).
7. **Remover o Star Wars da página migrada:** componentes, textos (`src/i18n/echo-base.ts`), CSS (`about.css`), testes (`tests/echo-base.browser.mjs`, `tests/leia.test.ts`). O backup fica na `archive/star-wars`. Assets em `public/pixel/**` só saem na auditoria final.

## Preferências da Glaucia (importante)
- Pixel art total, criativo, efeito "WOW", mas **nada amador**. Ela rejeitou e mandou remover:
  - "vida própria" (troca de pose automática);
  - "respiração" (sobe e desce);
  - nave escrevendo "GL" no céu;
  - amanhecer com sol e pássaros;
  - botão "Acender constelação";
  - balão do Prince no card.
- **Personagem fixo** como era no Star Wars: só piscar. Troca de pose apenas quando faz sentido numa interação (ex.: telescópio).
- Segredos precisam dar **retorno visual claro** e ser **fáceis de acionar**. Lanternas e estrelas cadentes falharam na 1ª versão por falta disso.
- **Efeito de rolagem da Home** (hero fixado + zoom + salto com rastros, `hyperspace.ts` + `.hero-jump`): ela quer **o mesmo tipo de efeito em cada página, mas com visual próprio do mundo**. Ideias já sugeridas: nevasca e aurora (Nivéora), poeira e telemetria (Marte), túnel de cristais (Lúmina), rotas orbitais (Atlas), pétalas e esporos (Aurélia), plasma (404).
- **Abertura (intro card) por página:** cada página terá o seu `BootSequence` (`src/components/home/BootSequence.tsx`), como no Star Wars. A Home já usa `variant="observatory"` (brasão de cúpula com estrela, cores da aurora, chave `galaxia-boot`). Para cada mundo novo:
  - criar uma variante com brasão em pixel 15×15 próprio, cores do mundo e frase final (ex.: Nivéora: cristal de gelo e "AURORA ESTÁVEL"; Marte: rover e "SOLO FIRME");
  - textos PT/EN/ES e chave de sessão própria em `src/lib/boot.ts`;
  - aposentar as variantes `echo` e `astromech` quando Sobre e Projetos forem migradas.
- **Sem "gratuito/free/gratis"** nos textos dela. Ficaram de fora, de propósito, os títulos de artigos publicados (`artigos.json`) e as descrições do GitHub (`projetos.json`).
- Migração **página a página**, com revisão dela antes de seguir. Escreva para ela em PT-BR.

## Regras operacionais
- **Não suba servidor nem rode testes de navegador por conta própria.** Peça para ela rodar e mandar o resultado.
- **Não rode `npm run build` com o `npm run dev` aberto**: os dois usam `.next` e geram erro de hidratação. Confira a porta 3000 com `netstat -ano`.
- Verificação: `npm run lint`, `npm run typecheck`, `npm test`. O build só roda com o dev parado.
- Testes de navegador (ela roda): `npm run build && npm run start -- --hostname 127.0.0.1 --port 3100` e depois `node tests/<suite>.browser.mjs`.
- Não faça commit, push nem merge sem ela pedir ou aprovar.
- Os arquivos estão em CRLF no working tree (autocrlf). Ao editar por script, normalize `\r\n`.

## Pendências conhecidas
- Catálogo atual com 22 segredos (2 globais + Home 6 + Sobre 7 + Projetos 7). O total final será recalculado ao substituir os segredos legados das próximas páginas; não perseguir a estimativa antiga como meta.
- `tests/scene-lifecycle.browser.mjs` ainda espera o `SceneMotion` antigo na Home (`data-motion="running"`); a Sobre saiu da lista. Revisar na auditoria final.
- Aviso do rodapé atualizado em 2026-10-25: site pessoal independente e opiniões próprias (PT/EN/ES).
- Nomes internos legados (`holonet`, `holo-card`, `stellar`, `jedi-effects.css`, `HeroScene`/`PageHero` com mapa por imagem) ficam para a auditoria final. A seção 7.1 do plano pede desacoplar `sceneByImage` → `sceneId` ao migrar Conteúdo, Eventos e Serviços.
- Os testes de navegador da Home (`tests/holonet.browser.mjs`) foram atualizados, mas ainda não rodaram.

## Prompt para abrir a nova sessão
> Leia `AGENTS.md`, `docs/galaxia-encantada/HANDOFF.md` (comece por “Retomada — próxima página: Conteúdo/Lúmina”) e a seção 4.4 de `docs/galaxia-encantada/PLANO-MIGRACAO.md`. Quero iniciar a migração de Conteúdo para Lúmina, a Biblioteca Viva. A branch atual é `feat/marte-projetos`, com Marte no commit `78b9fa6`: preserve tudo e não refaça Marte nem a Sobre. Inspecione a página atual de Conteúdo, os dados de `artigos.json`, o `ContentFilter` e as artes aprovadas de `lumina`; apresente uma proposta de narrativa, seções, rolagem com variação própria (cristais), paleta sonora e segredos distribuídos pelo conteúdo, com registros reais. Pixel art fina, celular, teclado e movimento reduzido desde o início. Não inicie servidor nem testes de navegador; não faça commit, push ou publicação. Comece em planejamento.
