# Design system

## Direção

Portfólio de engenharia, educação e liderança com cenas em pixel art e acabamento
cinematográfico. A identidade roxa, magenta e laranja, as ilustrações e os três
idiomas permanecem. A evolução trabalha hierarquia, profundidade, leitura e
navegação, sem mudar URLs, nomes de navegação ou dados históricos.

Referências de intensidade: `DESIGN_VARIANCE: 6`, `MOTION_INTENSITY: 7`,
`VISUAL_DENSITY: 4`. São critérios de composição, não controles do produto.
CSS nativo, Tailwind 4 e Geist; nenhuma biblioteca visual adicional.

## Tokens

`src/app/tokens.css` centraliza cores, tipografia, raios, espaçamento e movimento.

- Marca: primary `#5a3d7e`, secondary `#893866`, accent `#e07828`.
- Superfícies: `--surface-light` (base), `--surface-soft`, `--surface-raised`,
  `--surface-tag` e `--surface-dark` (cenas). Os nomes históricos são preservados;
  no tema escuro, `--surface-light` representa a base escura da página.
- Texto: `--text-body`, `--text-heading`, `--text-muted`, inversos e links.
- Os temas seguem `prefers-color-scheme`, com overrides semânticos próprios.
- Raios: 8 px para controles; 16 px para cards; 24 px para painéis e retratos.
- Conteúdo: até 1180 px, margens responsivas. Header: 72 px.
- Ritmo: `--section-gap`, de 72 a 128 px. Tipografia fluida, com escala menor
  para títulos extensos; texto de apoio limitado para preservar a ilustração.
- Movimento: `--duration-fast`, `--duration-enter` e `--ease-out`.

`tests/contrast.test.ts` mede contraste dos temas claro e escuro em 20 pares de
uso real por tema, incluindo cards, avisos e tags. Texto exige 4,5:1 e título
accent grande exige 3:1. Sobre imagens, a revisão visual complementa os tokens.

## Componentes e páginas

- Header: estado atual com `aria-current`, controles de 44 px, foco visível,
  menu com entrada por teclado e retorno de foco ao fechar com Escape.
- Idiomas: preservam rota, consulta e âncora, inclusive o convite para palestra.
- Hero: título, descrição e ações; informações complementares ficam no conteúdo.
  No mobile, todas as cenas têm uma área própria abaixo do texto.
- Home: estatísticas legíveis, retrato com moldura tonal, serviços e narrativa.
- Sobre: título equilibrado e trajetória com ritmo vertical e marcadores pixel.
- Projetos: primeiro projeto em destaque, cards com hierarquia e estados de hover.
- Conteúdo: cards, filtros acessíveis e lotes de 12 artigos com contador anunciado.
- Eventos: globo em painel com órbitas, legenda e coordenadas deduplicadas;
  barras proporcionais por idioma/formato e histórico expansível. O globo tem
  representação geométrica estática com movimento reduzido ou quando WebGL/JavaScript
  não estão disponíveis. A legenda estática direciona ao histórico de eventos.
  Contadores entregam o valor real no HTML e aos leitores de tela; a animação
  visual começa ao entrar na tela, sem atualizar o estado React a cada frame.
- Serviços: linhas editoriais, preços e descrições; formulário com estados claros.
- 404: mantém o idioma e o universo visual. O documento global usa as mesmas fontes.

## Cenas e movimento

`CinematicScene` move a imagem e os efeitos juntos para preservar as coordenadas.
O deslocamento é limitado a 8 px na horizontal e 5 px na vertical em dispositivos
com ponteiro preciso. A margem de 10 px impede vazamentos nas bordas.

- Dagobah: três planos de pedras, corrente de força e ondas luminosas.
- Hoth: neve pixel distribuída em diferentes velocidades e tamanhos.
- Tatooine: luz dos sóis, areia e sinais de R2-D2.
- Kashyyyk: folhas, vaga-lumes e atmosfera florestal.
- Nevarro: anéis de projeção em perspectiva e feixe holográfico.
- Bespin: nuvens, luz ambiente e sabre ancorado ao emissor da imagem.
- Estrela da Morte: iluminação de alerta na página 404.

Entradas escalonadas orientam a leitura do hero. Revelações de seções usam
`animation-timeline: view()` com conteúdo visível nos navegadores sem suporte.
Não há interceptação de scroll. O controlador usa IntersectionObserver, eventos
de ponteiro e atualização por requestAnimationFrame, sem estado React por frame.

Cenas pausam fora da tela e em abas ocultas. Preferência do sistema e controle
manual desativam profundidade e efeitos. Conteúdo permanece legível. Em mobile,
não há parallax de ponteiro; a ilustração é separada do texto.

Camadas: cena -1, conteúdo 1, header 40, transição 80, modal 90, skip link 100.
O globo também pausa fora da tela, em abas ocultas e com movimento reduzido.
A rotação usa tempo decorrido, mantendo a velocidade em telas com diferentes
frequências. A resolução acompanha o tamanho renderizado, limitada a DPR 2.

Observers, eventos e frames são removidos na desmontagem.

## Validação

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright inicia seu próprio servidor na porta 3100. Para um servidor existente,
use `BASE_URL`. Para Chromium do sistema, use
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`.
Os testes cobrem redirecionamento, 404, idiomas, teclado, biblioteca, pausa de
cenas, redução de movimento, fallback do globo sem WebGL/JavaScript e as seis páginas em 320 px.

A implementação usa `experimental.globalNotFound` do Next.js 15.5 para o documento
404 global, pois a raiz HTML é definida pelo segmento de idioma. Rever essa opção
quando atualizar o Next.js.
