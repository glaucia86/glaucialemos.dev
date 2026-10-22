# Home — concentração e levitação

A imagem original continua sendo a composição principal. As pedras, a energia junto à palma e os pequenos detritos compartilham uma frase de 12 segundos, em vez de vários movimentos sem relação entre si.

| Intervalo | Direção de movimento |
| --- | --- |
| 0–1,44 s | Repouso; pedras estáveis e luz baixa. |
| 1,44–3,36 s | A energia cresce; começa o esforço de elevação. |
| 3,36–5,04 s | Os três planos sobem, com deslocamento maior no primeiro plano. |
| 5,04–6,96 s | Sustentação; pequena rotação em passos nos sprites SVG. |
| 6,96–10,08 s | Acomodação, redução da energia e retorno à pose inicial. |
| 10,08–12 s | Repouso antes de repetir. |

## Geometria e renderização

- Coordenadas mantidas em 1024 × 576, com a palma em (620, 285).
- Dez pedras, três planos e a margem de segurança à direita de x=430. Até 900px, seis pedras visíveis e ilustração abaixo do texto.
- A mesma projeção de `object-fit: cover` é usada pelo fundo e pelos efeitos. Projetos e Eventos agora também usam essa projeção, inclusive na faixa de 641–900px.
- Folhas e vagalumes têm grupos separados, evitando colisões de `nth-of-type`. O mobile mantém quatro vagalumes em posições distintas.
- Nenhuma biblioteca de renderização, imagem de fundo ou dependência de produção nova.

## Movimento e acessibilidade

`HeroScene` e `PageHero` continuam no servidor. `SceneMotion` é uma fronteira client pequena que recebe a marcação pronta e pausa os relógios CSS quando a cena sai da tela ou a aba fica oculta. Não há loop JavaScript para renderizar a cena. Os observadores e listeners são removidos no unmount; a animação retoma do ponto pausado.

`useMotionPreference` combina preferência do sistema **OU** escolha manual, acompanha alterações durante a sessão e entre abas, e grava apenas escolhas explícitas. Com redução imposta pelo sistema, o botão informa isso nos três idiomas. Se o armazenamento estiver bloqueado, a escolha permanece funcional durante a sessão.

Sem JavaScript ou sem `IntersectionObserver`, a cena fica estática. Com movimento reduzido, os efeitos são ocultados e o fundo original continua visível, seguindo o comportamento anterior.

## Verificação

```sh
npm ci
npx playwright install chromium
npm test
npm run lint
npm run typecheck
npm run build
npm run test:browser
```

O runner inicia e encerra um servidor de produção local em 3100. `BASE_URL` reutiliza um servidor existente; `BROWSER_PORT` troca a porta local; `BROWSER_EXECUTABLE_PATH` e `BROWSER_ARGS` permitem um Chromium já instalado. Capturas opcionais: `npm run test:browser -- scene-preview`.

Ao reconstruir uma pasta usada anteriormente por `next start`, faça um build limpo, com o servidor parado, para não validar respostas antigas do cache de rotas de Next 15.5.28:

```sh
node -e 'require("node:fs").rmSync(".next", { recursive: true, force: true })'
npm run build
npm run test:browser
```

Os testes verificam CTAs e formulário nos três idiomas, limites 900/901px, alinhamento dos efeitos, margem do texto, preferências manual/sistema, armazenamento indisponível, pausa/retomada, desmontagem na navegação, Easter egg e fallback sem JavaScript.

## Limite desta entrega

O quadro de olhos fechados solicitado ao gerador foi recusado automaticamente pelo serviço (`moderation_blocked`). Nenhum asset novo de personagem foi gerado ou incorporado. O piscar e a expressão de concentração dependem de um atlas facial aprovado e alinhado à imagem original. A cena está animada; o personagem permanece estático.

As imagens existentes de franquia foram preservadas. Este trabalho não acrescenta uma licença nem estabelece a procedência dessas imagens; isso depende dos arquivos/fontes originais da proprietária.

## Atmospheric depth follow-up

Home now layers moving canopy light, two independently drifting mist banks,
pixel spores, a synchronized force field and water ripples. Rock lift reaches
3/5/7 percent by depth. Mouse pointer movement offsets rocks and spores without
React renders; pointer exit, reduced motion, visibility changes and unmount
reset the effect. Touch retains the automatic scene. Existing mobile particle
limits remain in effect. No dependencies or raster assets were added.

This is an environmental animation upgrade. The original character remains
static; character acting still requires authored animation assets.

Validation: lint, typecheck, production build, hero geometry at five widths,
scene lifecycle and the new scene-depth browser suite. Desktop/mobile screenshots
are captured from the local production build, not the Vercel deployment.
