# Design System — editorial + pixel art

O portfólio prioriza autoridade e contratação de workshops, mentorias e palestras.
Pixel art é a assinatura visual; a leitura e os caminhos de contato permanecem claros.

## Fundamentos

- Cores em `src/app/tokens.css`: roxo #5a3d7e, magenta #893866 e laranja #e07828.
  Amarelo fica reservado a detalhes; superfícies editoriais são brancas ou lilás suave.
- Hero e contato usam superfície escura; conteúdo alterna branco e superfície editorial.
- Geist para títulos e texto; Geist Mono apenas em rótulos, contagens e metadados.
- Conteúdo limitado a 1180px; gutters e espaçamento vertical fluidos. Títulos usam
  clamp, balanceamento e espaçamento entre letras; textos têm entrelinha confortável.
- Tokens de duração: 180ms, 300ms e 600ms, com curva de saída. Novos componentes devem
  consumir cores semânticas e esses tokens em vez de criar paletas isoladas. A entrada
  luminosa Jedi tem token específico de 220ms; sua saída e pulso reutilizam 300ms e 600ms.

## Componentes

- CTA laranja com texto escuro, altura mínima de 48px, foco visível e estados hover,
  pressed e disabled. Links editoriais usam texto e seta, com sublinhado no hover.
- Cards têm borda lilás, raio de 1rem e elevação discreta ao interagir. Não há clique
  artificial na superfície inteira: títulos e ações são links semânticos.
- Navegação com aria-current, menu mobile, seletor de idioma e controle de movimento.
  Transições não atrasam a navegação e a rolagem é nativa.
- Filtros usam aria-pressed e alvos de 44px. Formulário mantém labels, avisos acessíveis,
  estado de envio e bloqueio quando Formspree não está configurado.
- Serviços mantêm preço sob consulta e os dados existentes. Não há métricas inventadas.

## Home e cenas

A home segue apresentação, números, trajetória, projetos selecionados, serviços e contato.
Projetos usam a mesma fonte validada do catálogo e são ordenados por estrelas. Os números
respeitam o idioma atual. Os novos textos estão nos dicionários pt/en/es.

Dagobah usa fundo reconstituído, personagem original com máscara CSS, pedras SVG em três
planos, névoa, luz e folhagem. Origem e prompt em `docs/dagobah-art.md`.
O parallax responde somente a ponteiros precisos acima de 900px; nunca desloca texto ou CTA.
As outras cenas preservam as ilustrações e recebem os tratamentos compartilhados.

## Retrato Jedi e indicador de leitura

Os dois efeitos pertencem exclusivamente à home de pt/en/es. O azul acompanha a
lâmina da ilustração; não substitui a paleta de marca, cores de links ou pigmentos
das outras cenas. Não há som, partículas adicionais, alteração de cursor ou novos
estados nos cards.

### Tokens semânticos

Todos os valores ficam em `src/app/tokens.css`. As cores claras existentes da
paleta neutra fornecem o metal e as ranhuras do cabo.

| Token | Valor | Uso |
| --- | --- | --- |
| `--jedi-blue` | `#08a9fa` | Azul da lâmina e progresso simples |
| `--jedi-core` | `#efffff` | Núcleo luminoso |
| `--jedi-halo-opacity` | `.38` | Halo contido da sobreposição |
| `--jedi-reflection-opacity` | `.65` | Pico do reflexo durante o pulso |
| `--jedi-duration-in` | `220ms` | Entrada de hover e foco |
| `--jedi-duration-out` | `--duration-normal` (`300ms`) | Saída de hover e foco |
| `--jedi-duration-pulse` | `--duration-enter` (`600ms`) | Pulso único no toque |
| `--progress-height` | `168px` | Altura total do sabre |
| `--progress-blade-height` / `--progress-hilt-height` | `144px` / `24px` | Lâmina e cabo |
| `--progress-gutter` | `36px` | Faixa reservada na margem desktop |
| `--progress-simple-height` / `--progress-simple-width` | `112px` / `3px` | Linha simplificada |
| `--progress-simple-gutter` | `8px` | Faixa reservada na margem simplificada |

### Anatomia, estados e responsividade

O retrato preserva o arquivo original, texto alternativo, legenda, posição e
rotação da moldura. Um viewport com o raio existente recorta um plano de proporção
3:4, comum à imagem e ao SVG (`viewBox="0 0 864 1152"`). Esse plano reproduz o
recorte cover em `50% 23%` com unidades de container; ambos os elementos recebem a
mesma escala, posição e rotação. O SVG desenha apenas a lâmina existente e a
moldura recebe um reflexo interno. Nenhum desses elementos captura interação.

| Entrada | Resposta | Encerramento |
| --- | --- | --- |
| Hover do retrato, com hover e ponteiro preciso | Núcleo, halo e reflexo entram por opacidade em 220ms | Saída em 300ms ao retirar o ponteiro |
| Foco visível no link de trajetória | Mesma intensificação, preservando o contorno de foco do link | Saída em 300ms ao sair do link |
| Toque, com pelo menos 50% do retrato visível | Um pulso de 600ms, iniciando e terminando sem intensificação | Não repete na mesma montagem |
| Movimento reduzido pelo sistema ou controle do site | Ilustração original estática; intensificação desligada | Cancelamento imediato do pulso |

O foco e o hover podem coexistir: a intensificação permanece enquanto qualquer
um dos estados aplicáveis estiver ativo. O retrato não adiciona parada de teclado.
O pulso depende da capacidade de hover/ponteiro principal e observa a moldura.
Uma mudança de preferência durante o pulso o cancela sem permitir repetição.

O indicador fica fixo na borda direita e centralizado na janela. Em telas a partir
de 1100px com hover e ponteiro preciso, apresenta lâmina e cabo de 168px no total.
Em telas menores, toque ou movimento reduzido, usa apenas uma linha de 3 × 112px,
sem cabo, halo ou transição. As faixas de 36px e 8px cabem no gutter existente;
conteúdo e largura editorial não se deslocam. O halo desktop fica dentro da faixa.

A lâmina cresce da base para o topo pelo valor limitado entre 0 e 1 de
`scrollY / (document.documentElement.scrollHeight - innerHeight)`. Sem área rolável,
o preenchimento é zero. Ao subir, a lâmina recolhe. A altura total inclui cabeçalho
e rodapé. Não há suavização artificial; apenas o `scaleY` do preenchimento muda.

### Arquitetura e contratos internos

A página continua como Server Component. Imagem, SVG, legenda, textos e link são
renderizados no servidor. `JediPortraitMotion({ children })` hidrata somente o ciclo
de interação e recebe a figura pronta por composição. `ReadingProgress()` é montado
pela home e removido com ela. Nenhuma API pública ou estrutura de dados muda.

`JediPortraitMotion` usa `IntersectionObserver` com threshold de `.5`, `matchMedia`
para movimento e ponteiro, e `MutationObserver` limitado à classe do elemento html
para acompanhar o controle manual. Uma ref guarda o consumo do pulso por montagem.
O observer de interseção desconecta após o primeiro disparo; `animationend` encerra
o estado. Ao desmontar, todos os observers e listeners são removidos.

`observeReadingProgress(fill)` devolve sua função de limpeza. Scroll passivo,
resize, pageshow e `ResizeObserver` do documento e body compartilham um agendador
com no máximo um frame pendente. O frame lê posição e altura atuais e escreve
somente o transform, sem atualizar estado React. A limpeza cancela o frame e
desconecta os eventos e observer. `getReadingProgress` trata limites, overscroll e
documentos menores que a janela.

Os estados `data-motion-ready`, `data-pulse` e `data-ready` são internos. Sem
JavaScript, o conteúdo e o recorte permanecem visíveis e o indicador fica oculto,
evitando representar um progresso congelado. SVGs decorativos têm `aria-hidden`
e `focusable="false"`; o indicador não usa semântica de progressbar nem aria-live.

CSS controla opacidade e escala; APIs nativas controlam ciclo e observação. Uma
biblioteca de animação aumentaria a hidratação sem oferecer uma capacidade
necessária aqui. Não são necessários serviços, persistência, endpoints ou novas
dependências para esses efeitos.

## Movimento e acessibilidade

- Conteúdo existe no HTML e fica visível mesmo sem JavaScript.
- Entradas de seção acontecem uma vez, ao entrar no viewport, sem ocultar conteúdo abaixo.
- A preferência do sistema ou a escolha manual desliga animações. A cena continua visível
  em sua composição estática; não desaparece ao reduzir movimento.
- SceneMotion observa a própria região ilustrada e a visibilidade da aba para pausar CSS.
  O globo cancela seu loop de frames fora da tela, com aba oculta ou movimento reduzido.
- Observers e listeners são desconectados ao desmontar; preferência manual tolera storage
  indisponível. O easter egg de teclado não abre com movimento reduzido.
- Foco de 3px e tokens apropriados a superfícies claras/escuras. Contraste é calculado por
  tests/contrast.test.ts; misturas sobre imagens também recebem revisão visual.

## Validação reproduzível

npm run lint
npm run typecheck
npm test
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100

Com o build de produção em execução, executar individualmente:

node tests/editorial.browser.mjs
node tests/hero-scenes.browser.mjs
node tests/hero-ctas.browser.mjs
node tests/jedi-effects.browser.mjs
node tests/performance.browser.mjs after

O teste editorial percorre idiomas, home responsiva, rotas internas, imagem carregada,
redução de movimento e pausa fora da tela. Screenshots são produzidos em
`docs/screenshots/editorial/`. Os testes de cenas cobrem também 901px e 1920px;
o de CTAs cobre 320px, 390px e 640px, foco, links e preenchimento de contato.

Medições before/after em docs usam três contextos Chromium novos, 390×844, CPU 4x,
latência 40ms e download 10Mbps contra servidor local. Cache do servidor pode estar
quente. São amostras sintéticas, não dados de usuários nem uma garantia de produção.

O teste Jedi verifica os três idiomas em 390, 900, 1100, 1280 e 1920px, com
capturas em `docs/screenshots/jedi/`. Cobre alinhamento, hover, foco, pulso único,
movimento reduzido, progresso nos extremos e no meio, mudanças de altura, resize,
cliques através do indicador, navegação e apresentação sem JavaScript. Os testes
unitários do progresso cobrem limites e cancelamento de atualizações ao desmontar.

Para comparar esta entrega sem sobrescrever os relatórios anteriores, definir
`REPORT_PREFIX=jedi` e executar o script de desempenho com `before` ou `after`.
Além de LCP/CLS, registra bytes comprimidos dos scripts e duração de script/layout
em um percurso de 61 frames descendo e subindo a página. Comparar sob as mesmas
condições e sem outros testes de navegador em paralelo. Resultados e limitações
da entrega ficam em `docs/jedi-progress.md`.

## HoloNet (Home v2) — sistema imersivo

Superfícies espaciais (`--color-space-0…3`, `--color-space-line`), energias
(`--energy-blue/green/red/purple`) e `--font-pixel` (Departure Mono) ficam em `tokens.css`.
O kit pixel está em `pixel-ui.css`: molduras com quatro sombras deslocadas (cantos
recortados), `.button` pixel com brilho em `steps()`, header/footer HUD, grão, scanlines
e cursor-mira. A Home fica em `home.css`.

- Episódios: 0 boot · I Dagobah (decode do nome, rochas que reagem ao ponteiro, Force Push
  no clique, partículas, push-in pinado + hiperespaço no desktop) · II holo-card com sabre
  acendendo via DrawSVG e rota da carreira · III terminal R2 com glitch/compilação e
  holocrons · IV mapa galáctico em pontos com rotas cronológicas · V missões com borda de
  sabre (`@property --saber-angle`) · créditos.
- Coreografia declarativa (`HomeChoreography`): `data-reveal="lines|up|stagger"`,
  `data-scramble`, `data-scramble-hover`, `data-count`, `data-tilt`, `data-route`, `data-jump`.
- Movimento: `useMotionEnabled()` combina o sistema e o controle manual; os contextos GSAP o
  usam como dependência com `revertOnUpdate`, desmontando tudo ao reduzir. O pin e o
  hiperespaço só valem acima de 900px. No toque, a Força é acionada pelo tap.
- Sem JS ou com movimento reduzido: composição estática completa, sem boot, canvas, cursor
  ou dica de interação.

Validação adicional: `node tests/holonet.browser.mjs` (aceita `BASE_URL`) com o build de produção.
