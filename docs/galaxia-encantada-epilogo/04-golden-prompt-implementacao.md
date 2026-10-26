# GOLDEN PROMPT — Implementar o epílogo secreto da Galáxia Encantada

Você é um **Principal Software Engineer, Creative Developer, Pixel Art Technical Artist e UX/A11y Engineer** atuando no projeto [glaucia86/glaucialemos.dev](https://github.com/glaucia86/glaucialemos.dev).

Crie uma vertical slice de produção para a nova experiência autoral **“Além da Última Órbita”**, o **Epílogo Secreto / Capítulo 08** da Galáxia Encantada.

**Objetivo narrativo:** duas figuras familiares — Glaucia e seu cachorro Prince, **ambos vistos de costas** — contemplam uma nebulosa gigantesca e original, enquanto o visitante descobre a mensagem **“To be continued…”**. A sensação deve ser contemplativa, profundamente cinematográfica e esperançosa, não uma imitação de uma cena de filme.

**Não implemente um redesign do portfólio.** Preserve todo o conteúdo e os assets aprovados. A nova página deve ter identidade própria, integrando-se ao mundo e à arquitetura atual.

## A. Inspeção obrigatória

1. Execute `git status` e identifique branch, mudanças locais e trabalho em andamento. Não sobreponha nada.
2. Leia `AGENTS.md`, `DESIGN-SYSTEM.md`, `DECISOES.md`, `docs/galaxia-encantada/HANDOFF.md`, `docs/galaxia-encantada/PLANO-MIGRACAO.md` e `docs/galaxia-encantada/RESPONSIVIDADE.md`.
3. Examine `src/lib/eggs.ts`, `src/components/Comlink.tsx`, `src/i18n/comlink.ts`, `src/lib/use-discoveries.ts`, `src/lib/scenes.ts`, `src/data/galaxia/layout.json`, `scripts/build-galaxia-assets.mjs`, `src/components/home/ObservatoryMotion.tsx`, `src/components/about/NiveoraScene.tsx`, `src/components/home/BootSequence.tsx` e `src/app/[lang]/servicos/page.tsx`.
4. Verifique os estados reais de Serviços/Aurélia e do repositório, pois o trabalho de migração pode ter avançado desde a última documentação.
5. Examine os testes existentes para seguir a nomenclatura e os contratos vigentes.
6. Use os arquivos anexos `01-conceito-especificacao.md`, `02-copy-pt-en-es.md` e `03-prompts-arte.md` como especificações de produto e arte.

O repositório analisado já possuía 29 descobertas (`EGGS`), `useDiscoveries()` com `useSyncExternalStore`, persistência na chave `galaxia-encantada:eggs:v2`, comando de rádio e mapas de idioma. **Não crie um segundo registro de progresso.**

## B. UX e roteiro aprovados para a implementação

**Rota fixa nos três idiomas:** `src/app/[lang]/alem-da-ultima-orbita/page.tsx`.

- Português: `/pt/alem-da-ultima-orbita`.
- English: `/en/alem-da-ultima-orbita`.
- Español: `/es/alem-da-ultima-orbita`.

**Scene ID:** `beyond-orbit`.

**Condição de desbloqueio:** uma ou mais descobertas em **três mundos diferentes** dentre `home`, `about`, `projects` e `content`. Três descobertas concentradas num mesmo mundo **não** bastam.

**Gatilho narrativo:** depois da seção principal de Serviços/Aurélia, mostrar um sinal estrelado sutil e acessível quando a regra for cumprida; oferecer botão **Seguir o sinal**. Comlink também aceita `alemdaultimaorbita` na página Serviços, respeitando a mesma regra e com mensagens localizadas de progresso. Ao acionar, marcar `discover('epilogue-signal')` e navegar à rota localizada.

**Revisita:** após encontrar `epilogue-signal`, oferecer link **Revisitar o epílogo** no Comlink. Não adicionar o epílogo à barra de navegação nem ao sitemap.

**URL direto:** permitir acesso mesmo sem progresso. Não usar autenticação ou pretenso bloqueio de segurança baseado em localStorage. O desbloqueio controla somente a descoberta dentro do site. Marcar o `epilogue-signal` apenas após o gesto efetivo de seguir o sinal, não por navegar diretamente à URL.

**Easter egg final:** registrar `last-light`, vinculado à página `epilogue`, acionável por estrela acessível ou comando no Comlink. Ao ativar, mostrar **To be continued…** e depois uma frase pequena opcional. Persistir a descoberta, permitir replay e reset pela função existente `forget()`.

## C. Cena e direção visual

- Cenário 16:9 com **Véu das Possibilidades**, nebulosa inédita, não esférica, de filamentos verde-âmbar e poeira coral.
- Grande escala; Glaucia e Prince muito menores que a nebulosa e **de costas**.
- Pequeno terraço orbital original no terço inferior direito, plano firme para os personagens, estrelas remotas e espaço escuro à esquerda para copy.
- Componentes de arte separados: `GE-PL-08-beyond-orbit.png`, `GE-GL-08-beyond-orbit.png` e `GE-DOG-08-beyond-orbit.png`.
- Não redesenhar nem derivar os sprites já aprovados; novas sheets devem manter as identidades dos masters originais.
- Manter o nível de pixel art fino do projeto (`grid: 1` atores/props e `plateGrid: 0` para a placa, quando aplicável), não blocos grossos.
- A referência emocional vem de duas capturas de *Project Hail Mary* fornecidas pela usuária: **somente cores, escala e sensação**, não copiar geometria, enquadramento reconhecível, figurinos, nave, efeitos específicos ou qualquer frame.
- Não incluir texto na arte: toda copy deve ser renderizada via HTML semântico.
- Não criar trilha sonora automática, nem bloquear o scroll/controles durante a entrada.

**Ordem da experiência:** entrada estática legível → atmosfera sutil (opcional) → gesto do visitante sobre uma estrela → breve resposta ambiental e de personagens → revelação “To be continued…” → retorno fácil ao Observatório.

## D. Entregas técnicas

Implemente com atenção especial a:

1. **SSR-first e progressive enhancement.** Páginas e copy renderizadas no servidor, animações isoladas em Client Components. Ausência de JavaScript não oculta texto nem navegação.
2. **i18n tipado.** Usar o copy anexo. Manter “To be continued…” em inglês nas três línguas. Ajustar `ComlinkCopy` e `pages` para a nova categoria `epilogue`.
3. **Catálogo único.** Adicionar duas entradas: `epilogue-signal` (`page: 'services'`) e `last-light` (`page: 'epilogue'`). Estender `EggPage`, `pageOf`, os hints, comandos e mensagens em todos os idiomas. Reusar `emitEgg`/`onEgg`/`discover`, `getFoundSnapshot`, `useDiscoveries`, `remainingDiscoveries` e reset existentes conforme cabível.
4. **Regra pura testável.** Criar `src/lib/epilogue.ts`, que conta mundos distintos descobertos com base em IDs de `EGGS`; não contar entradas globais nem segredos da própria página. Evitar um novo localStorage.
5. **Estado previsível.** Gatilho de Serviços inscrito apenas quando elegível; listeners limpos; navegação `router.push` após interação real; prevenir cliques duplos. Deep link não compromete SSR.
6. **Pipeline dos assets.** Integrar `beyond-orbit` no `src/lib/scenes.ts`, `src/data/galaxia/layout.json`, script gerador, manifesto e nomes de poses, **depois da aprovação humana das fontes artísticas**. Não fabricar poses ausentes por CSS de forma inconsistente com o sistema existente.
7. **Acessibilidade.** Hotspot representado por `<button>`, foco visível, nome acessível, alvo 44×44 px, Escape quando houver modal, navegação sem hover, sem temporizador obrigatório. `prefers-reduced-motion` e opção manual deixam a cena estática e toda a copy visível.
8. **Performance.** Evitar dependências novas; animar transform/opacity; particles somente se houver orçamento, desativadas fora da viewport e com aba oculta; limitar DPR; medir em desktop/mobile; priorizar fundo LCP e adiar efeitos não essenciais.
9. **SEO.** Criar título e descrição por idioma; configurar `robots: { index: false, follow: false }` para o epílogo; não adicioná-lo ao sitemap.
10. **Verificação.** Testes para 0/1/2/3 mundos distintos, falso positivo no mesmo mundo, persistência, múltiplas abas, reset, rotas localizadas, Comlink, link direto, SSR sem JS, reduced motion, viewport 390 e 1440, foco/teclado, disposição dos sprites, teardown de animações e erros de console.

## E. Arquivos propostos

**Novos**:
- `src/app/[lang]/alem-da-ultima-orbita/page.tsx`
- `src/app/beyond-orbit.css`
- `src/components/epilogue/BeyondOrbitScene.tsx`
- `src/components/epilogue/BeyondOrbitMotion.tsx`
- `src/components/epilogue/EpilogueSignal.tsx`
- `src/lib/epilogue.ts`
- `src/i18n/beyond-orbit.ts`
- `tests/epilogue.test.ts`
- `tests/epilogue.browser.mjs`

**Existentes para adaptação mínima**:
- `src/lib/eggs.ts`
- `src/components/Comlink.tsx`
- `src/i18n/comlink.ts`
- `src/app/[lang]/servicos/page.tsx`
- `src/lib/scenes.ts`
- `src/data/galaxia/layout.json`
- `scripts/build-galaxia-assets.mjs`
- Documentação e testes existentes pertinentes.

**Arte-fonte, sujeita a aprovação visual**: os três arquivos `GE-*-08` descritos no kit.

Não alterar o menu principal (`SiteChrome`) para adicionar a rota. Não substituir o formulário nem provocar regressões em Serviços.

## F. Vertical slices e gates

**Fase 0 — Diagnóstico:** confirme estado do Git, branch e migração de Aurélia; identifique dependências e contratos. Liste impedimentos concretos, sem pedir detalhes já fornecidos.

**Fase 1 — Página estática:** implemente rota, metadata, semântica, copy PT/EN/ES e responsividade sobre um fundo original aprovado ou fallback neutro. Não bloquear por ausência dos assets finais.

**Fase 2 — Segredos:** implemente `epilogue-signal`, regra de três mundos, trigger em Aurélia/Serviços, Comlink, revisita, `last-light`, persistência e unit tests.

**Fase 3 — Cena:** somente após existir arte 08 aprovada, integrar backgrounds e sprites pelo pipeline com âncoras e verificações. Não gerar ou modificar a arte aprovada sem autorização.

**Fase 4 — Motion:** ambientação contemplativa, sutil, com resposta à estrela e posicionamento estável dos personagens; no reduced motion, mostrar tudo sem animação.

**Fase 5 — Quality gate:** typecheck, lint, testes, build e teste de navegador **conforme permissões de AGENTS.md**. Não rodar servidor/teste de browser se proibido; fornecer comando e evidências pendentes à usuária. Comparar capturas desktop/mobile e métricas reais.

## G. Restrições

- Não executar push, merge, release ou deploy sem aprovação.
- Não apagar ou sobrescrever trabalho em branches existentes.
- Não quebrar Aurélia/Serviços se ainda estiver em migração; se necessário manter integração sinalizada por flag/arquivo isolado até estabilizar a rota.
- Não recriar sistemas já presentes, especialmente easter eggs, locale e motion.
- Não adicionar referências visuais, frases ou personagens protegidos de *Project Hail Mary* ou Star Wars.
- Não inventar assets, resultados de testes, scores de performance ou permissões inexistentes.
- Não ocultar conteúdo fundamental atrás de experiências não acessíveis.

## H. Critérios de aceite

- O epílogo é uma página autoral espetacular, mas sóbria, com Glaucia e Prince de costas olhando a imensidão.
- O fluxo de descoberta funciona sem exigir todos os easter eggs.
- O Comlink integra desbloqueio e revisita, sem novo registro paralelo.
- O texto está completo nos três idiomas.
- “To be continued…” aparece por interação acessível e também permanece disponível nos fallbacks.
- Não existem regressões relevantes em rotas atuais.
- Performance e a11y são verificadas ou explicitamente marcadas como pendentes.
- O código segue os padrões do repositório, com testes adequados e diferenciação honesta entre verificado e não verificado.

## I. Formato da entrega

Responda em português brasileiro com: (1) achados reais da inspeção; (2) decisões de UX/arquitetura; (3) plano em vertical slices; (4) arquivos modificados e contratos; (5) resultados de testes efetivamente executados; (6) pendências e critérios de revisão artística. **Avance na implementação somente na extensão permitida pelas instruções do projeto, sem inventar progresso.**

**Princípio final:** *Make it magical. Make it original. Make it accessible. Prove it works.*
