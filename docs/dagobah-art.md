# Dagobah — composição e origem

Arte original preservada em `public/pixel/home-yoda.jpg`.
O fundo foi editado com a ferramenta integrada image_gen, usando a arte original
como entrada. Arquivo de trabalho: `public/pixel/dagobah-background.png`.
Entrega comprimida: `public/pixel/dagobah-background.webp` (79.364 bytes).

Prompt utilizado:

> Edit target: attached 16:9 pixel art Dagobah landscape from a personal portfolio.
> Create a clean background plate, preserving exactly the framing, layout, crisp
> pixel-art style and teal green palette. Remove ONLY Yoda (the small green
> character in brown robes on the right) and reconstruct the forest, distant trunks
> and mossy rock platform behind him naturally. Preserve the large foreground tree
> on the right, vines, mossy platform, reflective swamp, mist, lighting and dark
> empty left half for website text. No character, no floating rocks, no typography.
> Output the same 16:9 composition. This is the background layer for a faithful
> layered reconstruction of the original scene.

O personagem usa os pixels da imagem original dentro de uma máscara poligonal
CSS. A tentativa de gerar um recorte transparente separado não produziu um
arquivo utilizável; nenhuma imagem de personagem gerada foi incorporada.
Isso preserva sua aparência e evita duplicação sobre o fundo reconstituído.

Camadas: fundo WebP, personagem original mascarado, três planos de pedras SVG,
brilho da mão, névoa/partículas CSS e folhagem SVG em primeiro plano.
O plano lógico permanece em 1024×576, alinhado ao recorte da imagem por container
queries; no celular, a cena ocupa uma região independente abaixo dos CTAs.

## Pose da Força (outubro de 2026)

Glaucia gerou com IA a mesma cena com Yoda na pose da Força (`docs/art/segments-yoda/yoda-home.jpg`,
1792×1008) e os recortes por segmentação (`yoda.png`, `robe.png`, `pointy-ears/*`). Céu, cipós,
folhagem, água e rocha ficaram guardados como arte-fonte: o enquadramento dessa cena difere do
`home-yoda.jpg`, então eles não encaixam no fundo atual. Nada em `docs/art` vai para o deploy.

`node scripts/build-yoda-force.mjs` gera as camadas em `public/pixel/yoda-force/` (corpo, manto e
orelhas, webp sem perdas) e `src/components/home/yoda-force.json`. Orelhas e manto são localizados
no sprite pela menor diferença de cor e recortados dos pixels do próprio sprite. Escala 0,75
(equilíbrio entre a cabeça e a altura do Yoda original), com os pés ancorados em (873, 498) no
plano 1280×720. As camadas só são baixadas quando a pessoa interage com a cena.

O X-wing é um sprite SVG próprio de 48×22 pixels, desenhado no mesmo padrão das pedras.

As imagens originais não foram sobrescritas. A conversão de PNG para WebP pode
ser reproduzida com `node tests/prepare-assets.mjs` após `npm ci`.
