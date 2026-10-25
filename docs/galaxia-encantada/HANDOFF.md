# Handoff — Migração Galáxia Encantada

Estado em 25/10/2026. Leia este arquivo, depois o `AGENTS.md` e o `docs/galaxia-encantada/PLANO-MIGRACAO.md`.

## Onde estamos
- **Branch de trabalho:** `feat/galaxia-encantada`. Último commit: `54cfaf0 feat: migrate home to Galáxia Encantada observatory`. Árvore limpa, sem push.
- **Backup do Star Wars:** `archive/star-wars` (= `main` em `8adb94b`), já enviada ao GitHub. A `main` e a produção continuam em Star Wars.
- **Página concluída e aprovada pela Glaucia:** Home (`/[lang]`): Observatório das Primeiras Luzes.
- **Próxima página:** Sobre (`/[lang]/sobre`), Nivéora, o Mundo Nevado das Auroras (seção 4.2 do plano).
- **Depois:** Projetos/Marte → Conteúdo/Lúmina → Eventos/Atlas → Serviços/Aurélia → 404/Maré Rubra → modo história → auditoria final.

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
- Contador de segredos com 27 no momento (global 1 + Home 6 + Sobre 9 + Projetos 11). Deve fechar perto de 27 com as páginas novas.
- Rodapé ainda diz "sem afiliação com Disney/Lucasfilm": trocar na auditoria final.
- Nomes internos legados (`holonet`, `holo-card`, `stellar`, `jedi-effects.css`, `HeroScene`/`PageHero` com mapa por imagem) ficam para a auditoria final. A seção 7.1 do plano pede desacoplar `sceneByImage` → `sceneId` ao migrar Conteúdo, Eventos e Serviços.
- Os testes de navegador da Home (`tests/holonet.browser.mjs`) foram atualizados, mas ainda não rodaram.

## Prompt para abrir a nova sessão
> Continue a migração Galáxia Encantada na branch `feat/galaxia-encantada`. Leia `docs/galaxia-encantada/HANDOFF.md`, `AGENTS.md` e `docs/galaxia-encantada/PLANO-MIGRACAO.md`. A Home está pronta e aprovada. Agora vamos migrar a página Sobre para Nivéora (mundo nevado das auroras), seguindo o mesmo padrão da Home e incluindo a variação do efeito de rolagem. Comece pelo modo de planejamento.
