# Atualização comercial da Home e de Serviços

Base: `main` em `1899358`. Branch: `feat/prova-social-ofertas`.
Plano e decisões: mensagem da Glaucia nesta sessão, 27/10/2026.

Correção posterior da Glaucia: as logos devem ficar em Sobre ou Serviços. Mantidas somente em Serviços e retiradas da Home; Sobre não foi alterada. O retrato pessoal continua preparado para a abertura da Home e de Serviços, ainda pendente de escolha explícita.

Decisão de escopo (31/10/2026): Itaú aparece somente no contexto profissional/de carreira em Sobre e na trajetória da Home. Não aparece em Serviços nem nos demais textos da Home ou de Projetos; a entrada da faixa e o logo público foram removidos.

- [x] Git conferido; branch criada da main; dois prompts não rastreados preservados.
- [x] Histórico confirma Microsoft, Zup Innovation, Packt, Pagar.me e GlobalLogic LATAM em `experiencia.json`, empresas exibidas na faixa de Serviços.
- [ ] Seleção final das fotos pela Glaucia; candidatos em `SELECAO.md`.
- [x] Copy e ofertas PT/EN/ES; componentes de servidor; CSS restrito às duas páginas.
- [x] 496 testes unitários passaram (45 arquivos), incluindo 8 novos testes comerciais e regressões do contato.
- [x] Typecheck e lint passaram sem avisos na verificação final.
- [x] Roteiro `tests/commercial.browser.mjs` preparado e sintaxe conferida, sem executar navegador.
- [x] Verificação após revisão: lint/typecheck sem avisos, 496 testes em 45 arquivos, sintaxe do roteiro e `git diff --check` passaram.
- [ ] Revisão visual e build pela Glaucia, com dev parado antes do build.

Decisão: usar a branch solicitada no checkout atual. Os únicos arquivos prévios não rastreados são prompts de arte; não há mudanças rastreadas a isolar.
Decisão: fotos só entram na renderização depois da escolha explícita. Enquanto pendentes, nenhuma moldura vazia ou fotografia de reserva é exibida.
Contratos: os links de ofertas preservam `?assunto=palestra|workshop|mentoria#contato`; `ContactForm`, portal, cenas, segredos e seus controladores não serão alterados.
Sem commit, push, merge, servidor, build ou execução de navegador nesta sessão.

Cobertura: ofertas renderizadas sem JS nos três idiomas, preço e assuntos dos CTAs, menu/metadata/apresentação, vínculo das empresas exibidas com o histórico, assets locais e bloqueio de publicação de candidatos pendentes. A suíte nova falhou antes da implementação; a primeira execução também encontrou a copy PT antiga, corrigida na origem.

Revisão final: avaliar o diff não commitado e os arquivos novos em `src/components/credibility/`, `src/data/prova-social.ts`, `src/i18n/commercial.ts`, `src/app/credibility.css`, `tests/commercial*` e `docs/prova-social/`. O intervalo de commits é vazio porque a usuária reservou commits/integração para depois da avaliação visual.

Revisão independente concluída: nenhum defeito crítico/importante. Ajustados os dois pontos menores encontrados: especificidade do nome no desktop (agora a regra da composição vence `responsive.css`) e verificações do portal também com movimento reduzido. O roteiro cobre ainda o contato nativo sem JS. Não há achados de código conhecidos adiados.

Limites da revisão: enquadramento/obstrução reais e antes/depois são reservados à validação de navegador da Glaucia; nenhuma foto foi integrada sem escolha; a entrada pela animação já existente de Aurélia preserva seu controlador; envio real não foi exercitado (implementação intacta, testes interceptam mensagens).

## Rodada 2 — feedback do X e da Mariana (28/10/2026)

- [x] Fotos aprovadas pela Glaucia: `portrait-sdd` (Home e Serviços) e `talk-archive` (galeria de Serviços), WebP em `public/prova-social/`.
- [x] Logos só em Serviços (decisão da Glaucia) + "Onde já palestrei" com nomes de eventos reais e link para a fonte (`speakingVenues`).
- [x] "Temas de palestra" aprovados, baseados no histórico de `eventos.json`, dentro de `OfferFormats` (Home e Serviços).
- [x] Depoimentos: formulário próprio (Turnstile + Resend), chegam por e-mail com autorização; publicação manual em `testimonials`.
- [x] Contato voltou a enviar: Resend no lugar do Web3Forms (que recusa envio do servidor no plano gratuito).
- [ ] Conta Resend, domínio `mail.glaucialemos.dev` e variáveis (`RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO`) — Glaucia.
- [ ] Envio real e validação visual no navegador — Glaucia.
