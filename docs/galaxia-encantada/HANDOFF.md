# Handoff — Migração Galáxia Encantada

Estado em 25/10/2026. Leia este arquivo, depois o `AGENTS.md` e o `docs/galaxia-encantada/PLANO-MIGRACAO.md`.

## Onde estamos
- **Home** (`/[lang]`, Observatório das Primeiras Luzes): aprovada e mesclada na `main` (PR #6).
- **Sobre** (`/[lang]/sobre`, Nivéora, o Mundo Nevado das Auroras): migrada na branch `feat/niveora-sobre` (saiu da `main` em `470799e`). Tudo ainda **sem commit** (cerca de 85 arquivos alterados/novos). Lint, typecheck, 146 testes e build passam. Os testes de navegador (`tests/niveora.browser.mjs`) ainda não rodaram. Não faça commit nem push sem a Glaucia aprovar.
- **Em andamento:** Etapa B de Nivéora. As três sheets novas foram normalizadas e recortadas em **23 poses adicionais**; prévias compostas geradas. **Composição aprovada pela Glaucia**, com ambos na plataforma superior. Atuação implementada; validação visual e testes de navegador pendentes (ver registro abaixo).
- **Decisões pendentes da Glaucia:** (1) 6º segredo "Degelo total" (`thaw`, quebrar todo o gelo à mão → rádio com 24); (2) Prince abanar o rabo sozinho de vez em quando (desligado por padrão; ela recusou "vida própria" na Home).
- **Erro de hidratação no `<body>`** (`cz-shortcut-listen`): vem da extensão ColorZilla; resolvido com `suppressHydrationWarning` no `<body>` de `src/app/[lang]/layout.tsx`.
- **Backup do Star Wars:** `archive/star-wars` (= `main` em `8adb94b`), já enviada ao GitHub.
- **Próxima página:** Projetos (`/[lang]/projetos`), Marte, o Vale das Invenções (seção 4.3 do plano).
- **Depois:** Conteúdo/Lúmina → Eventos/Atlas → Serviços/Aurélia → 404/Maré Rubra → modo história → auditoria final.

## Como a Sobre (Nivéora) ficou
- **Cena:** Glaucia (parca térmica; poses `idle`, `blink`, `capsule` ajoelhada, `cheer`) em x=84 %, pés em y=80 % e Prince de corpo inteiro (`stand`, `sniff`) em x=76 %, pés em y=80 %, na plataforma superior de neve. Cristal prismático na saliência de gelo, estação (o `aurora-beacon`) à direita, cápsula enterrada em x=64 %, y=80 %.
- **Motor:** `snow-engine.ts` (neve em 3 planos, rajadas, aurora que segue o cursor, modos nevasca e prisma). Pausa fora da tela.
- **Rolagem:** `blizzard-jump.ts`, com túnel de neve com vento, cortinas de aurora descendo e fim num branco de nevasca com geada (`.hero-jump--niveora`).
- **Segredos (5):** `paw-tracks`, `memory-capsule`, `whiteout`, `aurora-prism`, `snowdrift`. Os 9 do Star Wars saíram. O rádio agora conta 23 (1 + 6 + 5 + 11).
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
- Contador de segredos com 23 no momento (global 1 + Home 6 + Sobre 5 + Projetos 11). Deve fechar perto de 27 com as páginas novas.
- `tests/scene-lifecycle.browser.mjs` ainda espera o `SceneMotion` antigo na Home (`data-motion="running"`); a Sobre saiu da lista. Revisar na auditoria final.
- Rodapé ainda diz "sem afiliação com Disney/Lucasfilm": trocar na auditoria final.
- Nomes internos legados (`holonet`, `holo-card`, `stellar`, `jedi-effects.css`, `HeroScene`/`PageHero` com mapa por imagem) ficam para a auditoria final. A seção 7.1 do plano pede desacoplar `sceneByImage` → `sceneId` ao migrar Conteúdo, Eventos e Serviços.
- Os testes de navegador da Home (`tests/holonet.browser.mjs`) foram atualizados, mas ainda não rodaram.

## Prompt para abrir a nova sessão
> Continue a migração Galáxia Encantada na branch `feat/niveora-sobre` (há mudanças sem commit; não descarte nada). Leia `docs/galaxia-encantada/HANDOFF.md`, `AGENTS.md` e `docs/galaxia-encantada/PLANO-MIGRACAO.md`. Vamos fazer a Etapa B de Nivéora (página Sobre): as três sheets novas do Grok (`GE-GL-02B-niveora.png`, `GE-DOG-02B-niveora.png`, `GE-DOG-02C-niveora.png`) já estão em `docs/art/galaxia-encantada/approved-source/`. Integre essas poses seguindo a seção "Artes pendentes (Etapa B)": normalizar a escala de cada sheet, nomear as poses, gerar a prévia composta para eu aprovar e depois animar (Glaucia com frio e protegendo o rosto do vento; Prince com vento, frio, sacudindo a neve, andando pela trilha, farejando, cavando e abanando o rabo). Comece pelo modo de planejamento.

Depois da Etapa B aprovada (e do commit da Sobre), a próxima página é Projetos/Marte, numa branch nova, com variação própria do efeito de rolagem (poeira e telemetria).
