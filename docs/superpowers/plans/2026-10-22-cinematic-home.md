# Home: concentração e levitação

**Goal:** dar à cena existente uma sequência legível de repouso, concentração, elevação e acomodação, mantendo o portfólio profissional.
**Architecture:** CSS/SVG existentes e uma pequena fronteira client para o ciclo de vida das cenas. Conteúdo e geometria continuam no servidor.
**Tech Stack:** Next.js 15, React 19, TypeScript, CSS, SVG, Vitest e Playwright; sem dependências de produção novas.
**Spec:** missão fornecida pela proprietária, auditoria da conversa e autorização “implemente agora mesmo”. Base: `25b6684c6c895e13af4c528c484dc835fdaa1ec2`.

## Global Constraints

- Preservar rotas, conteúdo, traduções, SEO, Easter egg, marca e imagens originais.
- Manter coordenadas 1024 × 576, mão (620, 285), pedras além de x=430, dez pedras em três planos e seis no mobile até 900px.
- Sistema OU escolha manual reduzem movimento; a preferência do sistema não é gravada como escolha manual.
- Sem loop JS de renderização; pausar cenas fora da tela/aba oculta e liberar observadores/listeners no unmount.
- Sem deploy ou merge automático.

## Tasks

1. **Baseline e infraestrutura de testes.** Rodar testes, lint, tipos e build; corrigir expectativas de CTA para as rotas existentes; tornar a suíte de navegador reproduzível com servidor próprio.
2. **Preferências e ciclo de vida.** Testes primeiro para alteração de preferência do sistema, persistência manual, armazenamento indisponível, pausa/retomada e desmontagem. Implementar controle compartilhado, sem promover PageHero a client.
3. **Coreografia e correções visuais.** Ciclo de 12 segundos com repouso, impulso e retorno; energia e partículas sincronizadas; geometria de cover para Tatooine/Nevarro e distribuição independente de folhas/vagalumes. Testar limites, alinhamento e densidade mobile.
4. **Verificação e entrega.** Suítes unitária e browser, lint, tipos, build, screenshots desktop/mobile; revisão independente; registrar limitações e publicar branch/PR em rascunho.

## Review Focus

Preferências do sistema mudando durante a sessão; localStorage bloqueado; abas ocultas e retorno ao viewport; desmontagem em navegação; fallback sem JavaScript; crop perto de 900/901px; texto nos três idiomas; efeitos alinhados sem alterar imagens originais.

## Rulings e progresso

- A referência `writing-good-tests.md` da skill não estava disponível; seguir as regras de testes comportamentais publicadas no próprio SKILL.md.
- A geração do quadro de olhos fechados foi recusada pelo serviço de imagens (`moderation_blocked`). Preservar o personagem e não entregar um substituto improvisado; piscar/atlas facial fica pendente de um asset aprovado. Custo: esta entrega anima a cena, ainda não a expressão facial.
- Baseline: 53 testes passaram; lint, typecheck e build passaram. O download padrão do Chromium retornou arquivo inválido; buscar runtime de testes disponível sem alterar dependências da aplicação.

## Acceptance / verification

`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:browser`.
Browser: 320/390/640/900/901/1280/1920px conforme cenário; três idiomas nos CTAs; fallback estático, movimento reduzido, pausa/retomada, alinhamento e ausência de sobreposição com texto.

## Resultado da implementação

- Task 1: complete — baseline de 53 testes, lint, tipos e build; CTAs corrigidos no teste sem modificar a navegação; runner de produção com cleanup.
- Task 2: complete — testes de comportamento falharam antes das alterações e passaram depois: sistema/manual, armazenamento bloqueado, pausa fora da tela/aba oculta e retomada. Validados também observadores na navegação, Easter egg e fallback sem JavaScript.
- Task 3: complete — coreografia de 12s, limites de texto/pedras, três planos e alinhamento cover confirmados no Chromium. Vagalumes distribuídos e quatro visíveis no mobile. Asset facial pendente conforme limitação acima.
- Task 4: verification complete — 53 testes unitários, lint, TypeScript, build, suíte de CTAs pt/en/es, suíte de cenas em cinco larguras e sete cenários adicionais de ciclo de vida/fallback passaram. Capturas desktop/mobile inspecionadas em `docs/screenshots/home-cinematic-*.jpg`.
- Ambiente de navegador: Chromium 153.0.8010.0 instalado fora do projeto como alternativa ao download inválido do Playwright; nenhuma dependência adicionada à aplicação.
- Diagnóstico: a pasta gerada `.next/server/route-cache` continha respostas do build anterior. Limpeza dessa pasta confirmou a nova versão, e as instruções de build limpo foram documentadas. Os testes de preferência agora aguardam o evento assíncrono e seu efeito no CSS.
- Revisão independente concluída: nenhum problema crítico/importante nem ajuste opcional bloqueante identificado; código, testes e capturas revisados sem alterações pelo revisor.
