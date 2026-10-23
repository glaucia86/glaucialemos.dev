# Retrato Jedi e progresso — execução

Plano: aprovado na conversa; substituir DOCX pela atualização do Design System.
Base: checkout existente, branch feat/editorial-pixel-portfolio. Preservar alterações anteriores.

- [x] Medição da versão atual e testes que falham antes dos efeitos.
- [x] Retrato com plano de recorte comum, estados e ciclo de movimento.
- [x] Progresso com atualização por frame e limpeza ao desmontar.
- [x] Tokens, contratos e documentação do Design System.
- [x] Lint, tipos, testes, build, navegadores, capturas e comparação de desempenho.

Decisão: continuar no checkout atual conforme o plano aprovado; sem novo worktree, commits, push ou publicação.
Interfaces compartilhadas: ambos os efeitos consomem os tokens Jedi e respeitam a preferência do sistema e html.reduce-motion.
Decisão: a imagem e o SVG usam o mesmo plano CSS com proporção 3:4 e recorte em 50% 23%; não medir o recorte em JavaScript.
Decisão: comparações de desempenho em arquivos performance-jedi-before/after, preservando os relatórios anteriores.

## Implementação e validação

A home mantém seus Server Components e usa duas ilhas cliente: JediPortraitMotion
para o ciclo da intensificação e ReadingProgress para o indicador. O retrato tem
recorte CSS compartilhado; a rolagem altera somente o scaleY do preenchimento.
Sistema e controle manual de movimento reduzido têm precedência sobre os efeitos.

O teste de navegador falhou na base por ausência do indicador antes da implementação.
Os novos testes unitários passaram após implementar cálculo e agendamento do progresso.
O sandbox bloqueou a leitura de configuração do esbuild; a suíte rodou fora dele.

Validação concluída:

- `npm run lint` e `npm run typecheck`: sem erros.
- `npm test`: 61 testes em 9 arquivos, todos passando.
- `npm run build`: 21 páginas estáticas; home com aproximadamente 113kB de First Load JS, contra 112kB da base.
- `node tests/jedi-effects.browser.mjs`: cinco larguras × três idiomas, alinhamento,
  hover/saída, foco por teclado, pulso único após 50%, progresso nos extremos e meio,
  retorno, resize e mudanças de altura; sem sobreposição ou bloqueio de cliques.
- Movimento reduzido pelo sistema e controle manual: sem intensificação; progresso
  simplificado ativo. Cancelar um pulso em andamento e reativar movimento não o repete.
- Voltar à home restaura o indicador com o valor da posição de rolagem restaurada.
- `node tests/hero-scenes.browser.mjs`, `node tests/hero-ctas.browser.mjs` e
  `node tests/editorial.browser.mjs`: todos passaram, incluindo navegação, CTAs,
  imagens, preferências, filtros, menu, apresentação sem JavaScript e ausência de erros.
- Revisão independente de código: nenhum achado crítico ou importante. As duas
  sugestões de cobertura (cancelar pulso e restaurar progresso) foram incorporadas.
- Revisão visual dos recortes em 390, 900, 1100, 1280 e 1920px e dos estados de
  interação; 26 capturas em `docs/screenshots/jedi/`, incluindo a home completa em 1100px.

## Desempenho

Comparação sintética local: três contextos Chromium novos por conjunto, 390×844,
DPR1, CPU 4x, latência 40ms, download 10Mbps, build de produção. O percurso de
rolagem tem 61 frames descendo e subindo a página. Os tempos de script/layout são
totais durante esse percurso, em milissegundos.

| Mediana | Base | Com efeitos |
| --- | ---: | ---: |
| LCP | 616ms | 668ms |
| CLS | 0,00002136 | 0,00002136 |
| Scripts transferidos, bytes codificados | 126.743 | 127.668 |
| Script durante rolagem | 20,652ms | 35,313ms |
| Layout durante rolagem | 1,671ms | 2,365ms |

O acréscimo de scripts é 925 bytes (aproximadamente 0,73%). A diferença de tempo
de script equivale a cerca de 0,24ms por frame amostrado, sob CPU 4x. Não houve
novo deslocamento de layout mensurável. O LCP aumentou 52ms nesta comparação;
uma medição anterior do resultado tinha mediana de 728ms e foi repetida para
investigar a variação, sem mudanças no produto. Não se infere equivalência ou
melhoria de desempenho em produção a partir dessas amostras pequenas.

Os relatórios completos estão em `performance-jedi-before.json` e
`performance-jedi-after.json`; os relatórios do redesign anterior foram preservados.
A primeira amostra da base coincidiu com o teste negativo de ausência do indicador;
as duas seguintes determinaram sua mediana. A medição final rodou sem outros testes
de navegador em paralelo. O cache de imagens do servidor estava aquecido.

## Preview e observações locais

Preview atualizado: http://127.0.0.1:3100/pt, também disponível em /en e /es.
Os processos temporários de 3101 e 3102 foram encerrados. Sem commit, push,
merge, novas dependências ou publicação. Os arquivos da ilustração original
não foram alterados.

Durante a revisão, duas variantes WebP de 1200px do hero ficaram pendentes no
otimizador do preview local. Os arquivos originais, conversão direta e versões
JPEG respondiam. As duas entradas do cache local foram geradas com o otimizador
nativo do Next e o processo foi reiniciado. A validação final aguardou o carregamento
completo da home em 1100px e confirmou as imagens. Nenhuma configuração ou arquivo
do produto foi alterado para contornar essa condição do preview.
