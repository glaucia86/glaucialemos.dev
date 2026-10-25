# Nivéora — Etapa B: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** integrar as três sheets novas, obter aprovação da composição e então animar frio, vento e a busca da cápsula.

**Architecture:** normalizar as sheets extras no pipeline existente, preservando a escala de referência consumida por `poseBox`. Separar a entrega dos assets e da prévia da ativação das poses em `NiveoraScene`/`NiveoraMotion`, com aprovação visual entre elas.

**Tech Stack:** Node.js, sharp, TypeScript, React/Next.js, GSAP, CSS e Vitest; testes de navegador executados pela usuária.

**Spec:** `docs/galaxia-encantada/HANDOFF.md`, seção “Artes pendentes (Etapa B)”; `docs/galaxia-encantada/PLANO-MIGRACAO.md`, seções 4.2 e 20; `AGENTS.md`. O handoff atual prevalece sobre propostas antigas do plano geral.

## Restrições globais

- Trabalhar na `feat/niveora-sobre`, preservando mudanças staged, unstaged e arquivos novos. Não fazer commit, push, merge, reset ou stash.
- Preservar fontes aprovadas; usar as três PNGs indicadas. Há também uma JPG da Glaucia: não substituir a PNG nem excluir a JPG.
- Gerar somente Nivéora; preservar os assets da Home já modificados.
- Manter `grid: 1`, `plateGrid: 0`, 160 cores para atores e 128 para props, sem dithering; nenhuma alteração da placa aprovada.
- Preservar enquadramento 16:9, posições iniciais, conteúdo profissional, cinco segredos da Sobre e contagem atual de 23. “Degelo total” fica fora desta etapa.
- Não ligar animações novas antes da aprovação explícita da prévia composta pela Glaucia.
- Abanar espontaneamente continua desativado. Abanar por hover/foco e durante a interação está no escopo.
- Respeitar `useMotionEnabled()`, movimento reduzido, som opt-in e cleanup.
- Não subir servidor nem executar testes de navegador. Não executar build com dev aberto. Preservar CRLF ao editar arquivos existentes.

## Pontos de revisão

1. Variação de escala entre sheets: comparar referência e pose equivalente no mesmo palco (tarefa 1).
2. Flocos e vento separados: conferir contagem, associação por quadro e limites de recorte (tarefas 1–2).
3. Mudanças de roupa/visor e `shake-b` olhando para cima: mostrar explicitamente na prévia, sem considerar aprovados por estarem no diretório de fontes (tarefa 2).
4. Sobreposição de rajada, tempestade e busca: impedir disputa de poses e garantir retorno ao estado correto (tarefa 3).
5. Replay, movimento reduzido e desmontagem durante a caminhada: manter cápsula acessível, evitar timers pendentes e poses presas (tarefa 4).

## Tarefa 1 — Escala, nomes e âncoras

**Arquivos:** `scripts/build-galaxia-assets.mjs`, `src/data/galaxia/niveora.json`, `public/galaxia/actors/{glaucia,prince}/niveora/`, `tests/scenes.test.ts`; manifest em `docs/art/galaxia-encantada/approved-source/manifest.json`.

**Interface:** conservar metadados `src`, `w`, `h`, `feetX`, `px` e o contrato de `poseBox(scene, actor, pose)`. A escala lógica das poses extras passa a corresponder à sheet original.

- [ ] Registrar status/diff inicial e hashes das fontes; inspecionar as três PNGs e as duas sheets originais, incluindo alpha e dimensões reais.
- [ ] Medir a altura do corpo, excluindo partículas soltas, para os pares `cold-a`/`idle`, `walk-1`/`sniff` e `wag-a`/`stand`. Registrar medidas e fatores por sheet; não inventar fatores antes da medição.
- [ ] Aplicar um único fator uniforme por sheet extra, em memória e antes do recorte definitivo, com nearest-neighbor. Preservar variações naturais de postura entre quadros, sem esticar cada pose para a mesma altura.
- [ ] Nomear `glaucia:B`: `cold-a`, `cold-b`, `brace`, `warm-hands`.
- [ ] Nomear `prince:B`: `walk-1` a `walk-4`, `sniff-down-a`, `sniff-down-b`, `dig-a`, `dig-b`, `walk-slow-1` a `walk-slow-4`, em ordem de leitura. Reservar caminhada lenta, sem ativá-la nesta etapa.
- [ ] Nomear `prince:C`: `cold`, `shake-a`, `shake-b`, `wag-a`, `wag-b`, `sit-up`, `wind`. Reservar `sit-up`.
- [ ] Conferir 4/12/7 quadros. Caso componentes conectados falhem por partículas, usar regiões explícitas apenas nas sheets afetadas; não alterar silenciosamente o recorte das demais cenas.
- [ ] Ajustar `ANCHORS` no espaço normalizado: quadris da Glaucia e centro de apoio das patas do Prince. Evitar flocos abaixo das patas deslocando o chão lógico.
- [ ] Regenerar com `node scripts/build-galaxia-assets.mjs niveora --debug` e atualizar hashes com `node scripts/build-galaxia-assets.mjs --manifest`, conferindo o diff.
- [ ] Ampliar `tests/scenes.test.ts`: todas as novas poses existem, dimensões são positivas, caixas estão dentro da placa e âncoras permanecem na neve; comparações de altura dos pares de referência admitem apenas arredondamento de rasterização. Rodar `npm.cmd test -- tests/scenes.test.ts`.

## Tarefa 2 — Prévia composta e aprovação

**Arquivos:** script temporário de composição na raiz, usando sharp; imagens de revisão em `%TEMP%`; registro das medidas e caminhos no handoff.

**Interface:** compor os WebPs gerados usando os mesmos cálculos de `poseBox` e coordenadas de palco da aplicação.

- [ ] Gerar prancha rotulada de todas as poses, referências originais lado a lado, linha do chão e âncoras.
- [ ] Gerar composições sobre a placa de Nivéora: repouso, frio, vento, sacudir neve, farejar/cavar e quadros de caminhada/abanar. Incluir versão limpa e versão com caixas de hotspots.
- [ ] Inspecionar bordas em fundos contrastantes, recortes, apoio das patas, tamanho corporal e área do texto. Conferir enquadramento em largura desktop e mobile sem iniciar servidor.
- [ ] Destacar na entrega a jaqueta azul-marinho da sheet B versus violeta da C/original, o visor da Glaucia e a limitação de `shake-b`. Não recolorir nem redesenhar as fontes automaticamente.
- [ ] Remover apenas o script temporário criado nesta tarefa, preservando imagens para revisão.
- [ ] Entregar as prévias e aguardar aprovação visual explícita, conforme pedido da usuária. Se algum quadro for rejeitado, ajustar o processamento ou solicitar regeneração específica; não compensar deformações com animação.

## Tarefa 3 — Atuação após aprovação

**Arquivos:** `src/components/about/NiveoraScene.tsx`, `src/components/about/NiveoraMotion.tsx`, `src/app/niveora.css`; `snow-engine.ts` somente se necessário para sincronizar partículas.

**Interface:** ampliar os valores de `data-pose` e `data-prince`; conservar `data-stage`, eventos de nevasca e IDs dos segredos.

- [ ] Renderizar as poses aprovadas, mantendo só uma pose corporal visível por ator e blink exclusivamente sobre idle. Posicionar neve e vapor de acordo com a pose.
- [ ] Centralizar a escolha de pose: interação explícita em andamento tem prioridade, seguida de nevasca, rajada e repouso. Hover só atua no repouso. Ao terminar uma ação, reavaliar o clima atual.
- [ ] Nas rajadas, usar `brace`/`wind`; na nevasca, alternar `cold-a`/`cold-b` e usar `cold` do Prince. Remover `niv-lean` e sua atuação via `data-gust`; manter tremor de 1 px e neve acumulada.
- [ ] Ao encerrar nevasca, executar sequência curta de sacudir neve, condicionada à aprovação dos quadros e sem interromper uma interação explícita. Limpar a neve acumulada sincronizada com a sacudida.
- [ ] Substituir a busca atual por farejar → caminhada até a cápsula → cavar → revelar cápsula → abanar → caminhar de volta. Sincronizar pegadas com contato das patas, usando `TRACKS`, e inverter a orientação horizontal no retorno sem mudar a altura.
- [ ] Garantir que o hotspot acompanhe o Prince durante deslocamento; bloquear duplicação da sequência por cliques ou replay repetidos.
- [ ] Abanar por hover e foco; toque/Enter executam a busca completa. Não criar loop espontâneo. `warm-hands`, `sit-up` e caminhada lenta ficam disponíveis, sem novos gatilhos inventados.

## Tarefa 4 — Verificação e handoff

**Arquivos:** `tests/scenes.test.ts`, `tests/niveora.browser.mjs`, `tests/snow-engine.test.ts` se o motor mudar, `docs/galaxia-encantada/HANDOFF.md` e `AGENTS.md` quando o comportamento final exigir atualização.

- [ ] Atualizar testes de navegador para poses de vento/frio, busca e retorno, sacudida, hover/foco, replay e sequência interrompida. A usuária executa essa suíte.
- [ ] Cobrir nevasca durante busca, Esc, navegação durante caminhada, aba oculta/fora do viewport e toggle de movimento. Cancelar timelines/timers e restabelecer posições sem efeitos tardios após desmontagem.
- [ ] Verificar que movimento reduzido permite revelar a cápsula diretamente, sem depender do término de uma animação; conferir toque, teclado e rádio.
- [ ] Rodar `npm.cmd run lint`, `npm.cmd run typecheck` e `npm.cmd test`. Rodar `npm.cmd run build` apenas após verificar que não há dev usando `.next`; confirmar `ƒ Middleware` no resultado.
- [ ] Entregar comandos de servidor e `tests/niveora.browser.mjs` para execução pela usuária, incluindo `BASE_URL` se necessário. Registrar resultados recebidos; testes não executados permanecem pendentes.
- [ ] Revisar diff contra o estado inicial, confirmar preservação das mudanças prévias e atualizar handoff com aprovação visual, fatores de escala, poses ativas/reservadas e verificações reais. Sem commit automático.
