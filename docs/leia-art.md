# Leia viva: briefing de arte (Fase 3B)

Coloque os arquivos em `docs/art/segments-leia/`. Todos devem partir de `public/pixel/sobre-leia.jpg`
(1280 × 720), com o **mesmo enquadramento, pixel art, paleta e a Leia no mesmo lugar e tamanho**.
Os recortes vão em PNG com fundo transparente.

| Arquivo | Uso | Prioridade |
| --- | --- | --- |
| `hoth-plate.png` | fundo sem a Leia; permite mover o corpo sem "fantasma" | fortemente recomendado |
| `leia-idle.png` | Leia parada (respiração, casaco ao vento, tremor) | obrigatório |
| `leia-blink.png` | olhos fechados (piscar) | obrigatório |
| `leia-blaster.png` | blaster erguida, mirando a sonda (x ≈ 640, y ≈ 150) | obrigatório |
| `leia-shiver.png` | abraçando o casaco de frio, durante a nevasca | opcional |

## Prompts

**hoth-plate.png**
> Edit target: attached 16:9 pixel art Hoth landscape from a personal portfolio. Create a clean background
> plate, preserving exactly the framing, layout, crisp pixel-art style and icy blue palette. Remove ONLY the
> small chibi Princess Leia (white coat, hair buns) standing on the right, and reconstruct the snowy ledge,
> the grey base building and the mountains behind her naturally. Keep the dome with the blue light, antennas,
> clouds, snow and empty dark sky on the left. No character, no typography. Same 16:9 composition, 1280×720.

**leia-idle.png**
> Using the attached 16:9 pixel art scene as reference, output ONLY the chibi Princess Leia exactly as she
> appears (same pose, size, position, pixels and colors) on a fully transparent background, 1280×720 canvas,
> everything else removed. Crisp pixel edges, no anti-aliasing halo, no shadow.

**leia-blink.png**
> Same as the idle cut-out (identical pose, size, position and canvas), but with her eyes closed in a calm
> blink: two short dark pixel lines where the eyes are. Transparent background, 1280×720, nothing else changed.

**leia-blaster.png**
> Same chibi Princess Leia, same scale, same feet position and the same 1280×720 transparent canvas, now in an
> action pose: right arm raised, holding a small black DL-44 style blaster pointing up and to the LEFT of the
> frame (towards the sky around x=640, y=150), left hand on the coat, determined expression. Same pixel-art
> style and palette. The pose must fully cover her original idle silhouette. Transparent background.

**leia-shiver.png (opcional)**
> Same chibi Princess Leia, same scale, same feet position and 1280×720 transparent canvas, hugging her white
> coat with both arms, shoulders raised, eyes squeezed, shivering from the cold. Same pixel-art style.

## Montagem (Fase 3B)

Rode `node scripts/build-leia-layers.mjs` (com `--debug`, grava prévias de cada pose em `%TEMP%/leia-preview-*.png`).
O script aceita PNG ou JPG em qualquer tamanho. O Grok entrega 1792 × 1008 com fundo magenta, e o script:

- recorta o chroma key magenta (ou verde) pelo eixo de "vazamento" da cor e remove o halo das bordas;
- registra a **placa** na arte pelo cenário, longe da Leia (escala + deslocamento; erro médio atual: 4/255);
- registra **idle** e **blink** pelos pixels da própria Leia;
- encaixa **blaster** e **shiver** pela largura da cabeça e pela altura, com os pés no mesmo ponto;
- exporta em `public/pixel/leia/` (WebP q92, ~75 KB no total):
  - `plate.webp`: só o recorte da placa atrás da Leia, com borda suavizada;
  - `idle`, `blink`, `blaster` e `shiver`: um quadro comum para todas as poses. O `blink` contém só os olhos;
- gera `src/components/about/leia.json` com quadro, patch, pés, cano da blaster, olhos e a qualidade de cada encaixe.

Em cena (`EchoBaseScene` + `LeiaActor`), as camadas só baixam quando o hero entra na tela e há movimento. Sem JS ou com
movimento reduzido, fica a Leia pintada em `sobre-leia.jpg`.

Atuação:
- respira em passos de 1px, pisca a cada 3–6 s e inclina com as rajadas (`leia-gust`, no mesmo ritmo do `echo-gust`);
- na nevasca, troca para `shiver` e treme;
- ao clicar na sonda, saca a blaster; a sonda mergulha na linha de tiro, o disparo vermelho a derruba e ela volta a ficar parada em ~1,25 s;
- ao segurar, brilha em azul.
