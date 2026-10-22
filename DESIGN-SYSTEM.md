# Design system

Fonte: cores extraídas do banner da marca (k-means). `src/app/tokens.css`, importado
por `globals.css`, concentra os tokens e o `@theme` do Tailwind 4. Sem dependências
novas. A identidade padrão é espacial e escura em todas as rotas e idiomas,
incluindo os dois caminhos de 404.

- **Paleta:** roxo `#5a3d7e`, magenta `#893866`, vinho `#a73457` e ameixa escura
  `#3d293b` formam `--gradient-brand`. Laranja `#e07828` continua exclusivo do
  CTA principal e pequenos acentos; amarelo `#f8e838` destaca estatísticas e foco.
  Escalas 50–950 e neutros arroxeados continuam disponíveis, mas não são pares
  de texto/fundo automaticamente acessíveis.
- **Fundo:** `--surface-space` é a base, com `color-scheme: dark` inclusive nos
  controles nativos. `body::before` fixa três padrões CSS de estrelas quadradas
  de 1–2 px e duas nebulosas radiais. `--star-color`, `--nebula-purple` e
  `--nebula-wine` limitam a intensidade. Sem imagens, canvas, listeners, filtros
  ou animação para esse fundo; ele é estático também com reduced motion.
- **Superfícies:** os aliases existentes `--surface-light` e `--surface-soft`
  agora significam painel escuro e painel roxo, respectivamente; “light” é
  apenas compatibilidade de nome. `--surface-dark` protege a leitura dos heros,
  `--surface-raised` representa a ameixa do header/footer, `--surface-active`
  indica hover/expansão e `--surface-tag` serve para chips.
- **Profundidade:** `--gradient-card` combina superfícies com 94% de opacidade;
  `--texture-scanline` adiciona linhas de 1 px com tinta a 2%. Cards de projetos,
  serviços, artigos, métricas, formulário e botões da timeline compartilham
  esse tratamento. Cantos em L, bordas roxas e sombras com brilho discreto
  reforçam a linguagem pixel sem recortar conteúdo ou contornos de foco.
  Painéis abertos da timeline usam a mesma textura e uma moldura em degraus.
  Stats e footer usam `--gradient-header`; os heros recebem a régua de marca.
- **Texto e interação:** use `--text-body/heading/muted`, `--link/link-hover`
  e `--text-inverse/inverse-muted`. Links na bio e timeline são sublinhados.
  `--border` é decorativo; `--border-control` identifica campos e controles.
  O foco usa amarelo ou `--focus-inverse` claro. Campos desabilitados mantêm
  texto legível e ganham borda tracejada, sem reduzir a opacidade do conteúdo.
  Estados `--color-success/warning/danger/info` têm versões `-text` claras para
  estes fundos escuros. O CTA usa `--text-on-accent` sobre `--color-accent`.
- **Tailwind 4:** `text-body bg-surface`, `text-muted bg-surface-soft`,
  `text-link hover:text-link-hover`, `bg-surface-active`, `border-border-control`
  e `bg-accent text-neutral-950` resolvem os mesmos tokens do CSS. Para painéis
  com profundidade, reutilize `--gradient-card`, `--texture-scanline` e as
  sombras existentes, sem introduzir cores locais.
- **Tipografia e medidas:** Geist e Geist Mono via `--font-sans/mono`;
  `--text-xs` a `--text-8xl`, raios `--radius-sm/md/lg/full`, sombras
  `--shadow-sm/md`, base `--spacing` de 4 px e aliases `--space-1` a `--space-24`.
- **Cenas e conteúdo:** composição, ilustrações e bio aprovada foram preservadas.
  Dagobah mantém coordenadas lógicas 1024×576, mão (620,285), pedras 30% maiores
  e três planos. Desktop reserva a coluna de texto; mobile reserva a ilustração
  abaixo do texto e CTA. As regras existentes de reduced motion e easter eggs
  continuam valendo para as cenas.

| Par sólido | Contraste |
| --- | ---: |
| Texto / painel base; painel roxo | 15,62:1; 13,25:1 |
| Texto secundário / painel base; painel ativo | 10,14:1; 7,41:1 |
| Título / painel base | 16,47:1 |
| Texto hero e 404 / escuro | 18,04:1 |
| Texto secundário header e footer / ameixa | 9,59:1 |
| Estatísticas amarelas / ameixa | 10,51:1 |
| Texto CTA / laranja | 6,05:1 |
| Link / painel base; painel ativo | 12,24:1; 8,95:1 |
| Link hover / painel base; painel ativo | 12,06:1; 8,82:1 |
| Filtro selecionado / roxo | 8,74:1 |
| Success; warning; danger; info / painel roxo | 9,79:1; 11,00:1; 8,78:1; 10,39:1 |
| Foco; borda de controle / painel ativo | 10,42:1; 4,18:1 |

`tests/contrast.test.ts` resolve aliases diretamente dos tokens e calcula
luminância sRGB/WCAG: mínimo 4,5:1 para texto e 3:1 para foco/bordas de controles.
Além dos pares sólidos, verifica as duas pontas dos cards translúcidos com
scanlines sobre branco (limite conservador) e texto sobre nebulosas com as três
camadas de estrelas sobrepostas. `npm test` imprime as razões dos pares sólidos.
Fotos e overlays das cenas ainda precisam de revisão visual: nesta execução,
a inicialização do Chromium foi bloqueada pelo sandbox (`Operation not permitted`).
