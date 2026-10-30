# Decisões — Fases 1 e 2

- O valor `Global` permanece intacto em `eventos.json`, mas é excluído de `getEventStats().paises`, pois representa alcance e não um país. Valores `null` também não entram nessa contagem.
- O campo `publico` é validado como texto e não é agregado nas estatísticas.
- Os serviços usam `titulo` e `descricao` localizados em `pt`, `en` e `es`; `preco` permanece literalmente `sob consulta`, conforme solicitado.
- Dados JSON são importados e validados com Zod na carga do módulo. Qualquer registro inválido impede a inicialização e expõe o erro de validação.
- A consulta ao GitHub tem timeout de cinco segundos por projeto e usa os valores do JSON diante de timeout, falha HTTP, rede ou resposta inesperada.
- A raiz respeita os pesos (`q`) do cabeçalho `Accept-Language`, escolhe o idioma suportado de maior preferência e usa português como fallback.
- O App Router contém somente uma página mínima para viabilizar a validação da Fase 1; conteúdo visual ficou fora deste escopo.

## Fase 2

- A implementação é server-first; somente controles interativos, canvas e globo usam Client Components.
- A preferência de movimento combina `prefers-reduced-motion` com um override persistido no navegador, aplicado pela classe `reduce-motion` no elemento `<html>`.
- O globo usa apenas eventos com latitude e longitude e é carregado dinamicamente exclusivamente em Eventos.
- Os números de público permanecem informativos em cada fonte e nunca são agregados, pois podem se sobrepor e contêm intervalos textuais.
- A troca de idioma substitui apenas o primeiro segmento da URL, preservando a página atual.
- Envio pelo Resend no servidor (o Web3Forms gratuito recusa envio vindo do servidor). Sem qualquer uma de `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO`, `TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY`, o formulário comunica a indisponibilidade e bloqueia o envio; nenhum email pessoal é incluído.
- Como o sandbox não possui rede, fontes do Google não podem ser baixadas no build. Foi usado `next/font/local` com Geist e Geist Mono livres já presentes no Next.js instalado; a mono cria a linguagem de títulos pixel sem recorrer a fontes oficiais de franquias.

## Redesign editorial + pixel art — outubro de 2026

- Mantido Next.js com TypeScript. O App Router já entrega páginas estáticas/server-first,
  internacionalização, integração GitHub com revalidação e componentes interativos isolados.
  Astro atende bem sites de conteúdo e permite ilhas React, mas não há nova necessidade
  funcional nem ganho medido que justifique reescrever rotas, imagens e testes nesta entrega.
  Fontes: https://docs.astro.build/en/concepts/islands/ e
  https://nextjs.org/docs/app/getting-started/server-and-client-components.
- Preview publicado e checkout local tinham tratamentos diferentes de superfícies; a nova
  direção aprovada usa editorial claro para leitura e cenas/contato escuros.
- O hero mantém Yoda e Dagobah. Fundo editado por image_gen; personagem usa os pixels
  originais com máscara CSS. Origem, prompt e conversão documentados em docs/dagobah-art.md.
- A home exibe os três projetos com mais estrelas; o indicador continua somando os quatro
  principais, com formato numérico do idioma atual. Nenhum schema de dados foi alterado.
- A navegação não aguarda efeitos. O antigo crawl de encerramento cede lugar ao contato
  final, conforme a composição aprovada. O easter egg de teclado permanece.
- Preferência do sistema e opção manual reduzem movimento. As cenas ficam estáticas e
  visíveis. O observador acompanha a ilustração, não a área de texto do hero, para que uma
  cena abaixo da dobra no celular não execute animações antes de aparecer.
- Sem novas dependências de produção. Não houve migração, alteração de APIs públicas,
  configuração de serviços externos nem publicação em produção.

## HoloNet — redesign imersivo da Home (outubro de 2026)

- Direção aprovada: imersão total no escuro, UI em pixel art e a Home narrada em cinco
  episódios ("transmissão da HoloNet"). As ilustrações atuais foram mantidas.
- Revertida a decisão "sem biblioteca de animação": entram `gsap@3.15.0` (ScrollTrigger,
  SplitText, ScrambleText, DrawSVG, todos gratuitos), `@gsap/react@2.1.2` e `lenis@1.3.23`,
  com versões fixas publicadas há mais de 7 dias. Os efeitos de scroll pinado, scrub e
  texto embaralhado seriam frágeis em CSS puro e não funcionam no Safari/Firefox atuais.
- Revertidos "sem som" e "sem partículas": os sons são sintetizados via Web Audio
  (`src/lib/sfx.ts`), ficam **desligados por padrão** e só tocam após opt-in persistido.
  As partículas da Força rodam em canvas de baixa resolução e pausam fora da tela.
- Boot de terminal: um script inline marca `<html data-boot="pending">` antes da pintura,
  somente na primeira visita da sessão e sem movimento reduzido. Sem JavaScript o overlay
  nunca aparece. A duração é de ~2,2s, e ESC, qualquer tecla ou um clique pulam a abertura.
- O GSAP lê `visibility: hidden` como `autoAlpha: 0`. Por isso o boot não oculta o hero
  por CSS (o overlay já cobre tudo), e as timelines de scroll usam `fromTo` explícito.
- O tema escuro é global por tokens semânticos (`--surface-*`, `--text-*`, `--link`).
  As páginas internas herdam superfícies, botões e molduras pixel até o redesign próprio.
- Fonte Departure Mono (Helena Zhang, SIL OFL 1.1) servida localmente em `src/app/fonts/`.
- Os testes de navegador da Home anterior (`editorial`, `hero-scenes`, `hero-ctas`,
  `jedi-effects`, `journey*`) validam a estrutura antiga. O novo `tests/holonet.browser.mjs`
  cobre a Home atual; as páginas internas continuam cobertas pelos testes anteriores.

## Personagens, RAG, currículo e eventos (outubro de 2026)

- Yoda: clique curto (< 450 ms) dispara o Force push no `pointerup`; segurar levita todas as
  pedras até soltar. Se o ponteiro se mover mais de 10 px, o gesto é cancelado, para não
  disputar com a rolagem no toque. A Jedi rebate disparos de blaster desenhados num SVG
  separado no mesmo viewBox do retrato (864 × 1152), para acertar a linha do sabre sem
  redesenhar a arte. O botão "Rebater disparos" só aparece com movimento ativo e JavaScript.
- O terminal do Ep. III mostra um trecho real de `chats-post.ts` do
  Azure-Samples/serverless-chat-langchainjs (2ª maior contribuidora, 81 commits). Como o código
  atual também foi refatorado pelo mantenedor, o texto fala em coautoria. O resultado
  descreve o comportamento exigido pelo system prompt, sem inventar o conteúdo dos documentos.
- Contribuições em repositórios de terceiros ficam em `contribuicoes.json`, separadas de
  `projetos.json`. As estrelas usam o dono real derivado da URL (`repoPath`).
- Experiência alinhada ao currículo/LinkedIn de outubro de 2026. "atual" é traduzido em
  `formatExperiencePeriod`. Telefone e email do currículo não são publicados e
  `docs/curriculo.pdf` não é versionado.
- Eventos: entram os 11 registros da `feat/cinematic-home` (incluindo a correção do país do
  NodeJsOne) e 18 registros realizados com fonte pública (inclui IEEE CS80 Rio e o Codex Meetup Rio de
  19/09, confirmados no site do evento e no perfil público do Luma). Ficam de fora futuros, convites,
  inscrições, recusas, a mentoria PrograMaria (tipo inexistente) e eventos comprovados só por
  email privado. Episódios de séries continuam como registros separados, como já era feito.

## Ranking ao vivo de repositórios e CI (outubro de 2026)

- O Arquivo de holocrons (6 itens) e a página Projetos (12) usam o ranking por estrelas de uma
  única chamada à busca do GitHub (`user:glaucia86 fork:false`), sem exclusões. O ISR (hoje de 30 dias; antes 1h) mantém
  a lista praticamente em tempo real sem commits automáticos nem deploys. Um GitHub Action que
  regravasse o JSON só atualizaria a lista no ritmo do agendamento, e cada execução viraria commit
  e deploy.
- `projetos.json` é a reserva para timeout, limite de requisições (403) ou resposta inválida.
  `GITHUB_TOKEN` é opcional: só aumenta o limite da busca e nunca chega ao cliente.
- Descrições traduzidas ficam em `journey.projects`; um repositório novo no ranking mostra a
  descrição do GitHub até ganhar tradução.
- CI de qualidade em `.github/workflows/ci.yml`: Node 22, `npm ci`, lint, typecheck, testes e
  build, só com permissão de leitura e sem secrets.

## Yoda na pose da Força e X-wing do pântano (outubro de 2026)

- Segurar a cena: carga (0–450 ms) → pose da Força (flash de silhueta, aura, orelhas e manto
  animados, câmera 1,05×, texto do hero em foco reduzido) → em 2s um X-wing em pixel art sobe do
  pântano pingando água. Ao soltar, Yoda empurra, as pedras são lançadas, o X-wing cai com
  respingo e a pose original volta. O estado fica em `data-force-stage` na seção do hero.
- O foco do texto usa `filter`, e o zoom usa a propriedade `scale`, para não conflitar com os
  estilos inline do GSAP (intro e scroll pinado), que controlam `opacity` e `transform`.
- O sprite novo (gerado por IA pela Glaucia) é posicionado sobre o fundo sem Yoda já existente,
  e não substitui a imagem cheia: o enquadramento da cena gerada é diferente.
- As camadas carregam sob demanda. Com movimento reduzido nenhuma é baixada.
- Estrelas do GitHub: `revalidate` de 30 dias, a pedido. Com uma requisição por mês, o
  `GITHUB_TOKEN` deixa de ser necessário (continua opcional).
