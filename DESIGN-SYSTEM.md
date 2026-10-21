# Design system

Fonte: cores extraídas do banner da marca (k-means). `src/app/tokens.css`, importado por
`globals.css`, concentra CSS vars e `@theme` do Tailwind 4. Sem dependências novas.

- **Paleta:** primary roxo `#5a3d7e`, secondary magenta `#893866`, accent laranja
  `#e07828`, acento secundário amarelo `#f8e838`. Escalas 50–950 para as três
  paletas e neutros levemente arroxeados. Gradiente: `--gradient-brand`
  (90° roxo → magenta → vinho `#a73457`).
- **Semântica:** `--surface-light/soft/dark`, `--text-body/heading/muted`,
  `--text-inverse/inverse-muted`, `--link`, `--link-hover`, `--border` e `--focus`.
  Header e overlays usam roxos escuros; o foco em superfícies escuras usa accent
  claro. Hero limita a coluna de texto à parte opaca do gradiente.
- **Uso:** `color: var(--text-body)` ou `text-body bg-surface`;
  `bg-primary`, `text-secondary-700`, `bg-accent text-neutral-950`.
  CTA: `--text-on-accent` sobre `--color-accent`; título do hero: `--accent-light`.
  Estados `--color-success/warning/danger/info` têm versões `-text` para fundos
  claros. Use estas versões para texto; não presuma AA em toda a escala.
- **Tipografia:** Geist e Geist Mono existentes via `--font-sans/mono`;
  `--text-xs` a `--text-8xl`. Raios `--radius-sm/md/lg/full`, sombras
  `--shadow-sm/md`, espaçamento base `--spacing` (4 px) e aliases usuais entre
  `--space-1` e `--space-24`.
- **Cenas:** pigmentos `--rock-*`, `--force-*` e `--scene-*` também ficam nos tokens.
  Dagobah usa coordenadas lógicas 1024×576: mão (620,285), pedras 30% maiores,
  três planos e as mesmas fases, steps e parallax. Desktop reserva a coluna do
  texto; mobile reserva uma área de ilustração abaixo do texto e CTA.
  Reduced-motion e easter eggs foram mantidos.

| Par | Contraste |
| --- | ---: |
| Texto / claro | 12,64:1 |
| Texto secundário / suave | 6,66:1 |
| Título / claro | 15,31:1 |
| Texto hero / escuro | 18,04:1 |
| Texto secundário hero / escuro | 13,01:1 |
| Texto secundário header / marca escura | 9,59:1 |
| Título accent / escuro | 12,96:1 |
| Texto CTA / laranja | 6,05:1 |
| Link primary / claro; suave | 10,97:1; 10,39:1 |
| Link secondary / claro; suave | 9,66:1; 9,15:1 |
| Link / tag; seleção / primary | 9,02:1; 8,74:1 |
| Success; warning; danger; info / superfície clara utilizada | 7,29:1; 6,82:1; 8,57:1; 10,97:1 |

`tests/contrast.test.ts` resolve os aliases diretamente dos tokens e calcula
luminância sRGB/WCAG: mínimo 4,5:1; 3:1 para título grande. `npm test` imprime
as razões. Os pares de hero acima usam a superfície sólida; fotos e gradientes
compostos também exigem revisão visual. Neste ambiente, servidor e Chromium
foram bloqueados por `EPERM`; não houve validação visual no navegador.
