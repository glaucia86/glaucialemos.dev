# GALÁXIA ENCANTADA

## Dossiê de decisões, auditoria e plano executivo de migração autoral

**Projeto:** `glaucia86/glaucialemos.dev`  
**Site de referência:** https://glaucialemos-dev.vercel.app/pt  
**Proprietária e decisora:** Glaucia Lemos  
**Versão deste documento:** 2.0 — 24/10/2026 · Handoff Devin/Opus 5.5 + Prompts Grok Image  
**Estado:** direção criativa aprovada; especificação de implementação pronta para iniciar; **nenhuma alteração em código, branch, PR ou produção foi realizada durante esta elaboração**.  
**Público:** proprietária; Devin executando com Opus 5.5; Grok Image/Imagine para produção de assets; frontend, direção de arte, QA, acessibilidade e revisão jurídica.

> **Decisão de produto:** substituir a temática de *Star Wars* por **Galáxia Encantada**, um universo espacial autoral, cinematográfico, colorido e inteiramente em pixel art, com Glaucia e seu cachorro como personagens. Preservar a estrutura profissional, as sete experiências atuais, a divisão visual texto à esquerda/personagem à direita, os sistemas de animação e aproximadamente 24 easter eggs; adicionar um modo história opcional. A execução será incremental, verificável e reversível.

---

## Estado de implementação — 26/10/2026

Home/Observatório, Sobre/Nivéora, Projetos/Marte, Conteúdo/Lúmina e o epílogo já têm implementação autoral.
Serviços/Aurélia foi implementada em `feat/aurelia-servicos`, com seis segredos novos, ContactForm preservado e arte 06.
Lint, typecheck e 280 testes passaram. A validação visual e o build estão pendentes: nenhum servidor ou navegador foi iniciado. Detalhes em `HANDOFF.md`, seção “Retomada — Serviços/Aurélia”.
Eventos e 404 permanecem no tema anterior. As tabelas [C]/[P] abaixo são o snapshot/plano original, não o status atual.

## GUIA OPERACIONAL — COMO USAR ESTE MARKDOWN COM DEVIN E GROK IMAGE

**Fonte de verdade:** este documento v2 consolida decisões anteriores, auditoria e os prompts de arte. O `AGENTS.md` e o checkout atual prevalecem em detalhes técnicos de execução. As seções 18–22 foram adicionadas especificamente para criar os assets no Grok e integrá-los via Devin; a seção 16 contém prompts de kickoff e continuação prontos para copiar.

**Pipeline de duas ferramentas, sem misturar atribuições:**

1. **Devin / Opus 5.5**: receba este `.md`, acesse o repositório, execute baseline, planeje PRs, crie infraestrutura de cenas, migre código, integre assets recebidos e rode testes. **Não gere imagens sem autorização** nem dependa do Grok funcionar de dentro do Devin.
2. **Grok Image / Imagine**: a proprietária gera as artes usando os prompts autocontidos da seção 19; fornece fotografias autorizadas de Glaucia/cachorro quando for criar suas identidades; aprova visualmente cada arquivo antes da integração.
3. **Handoff de assets**: entregar PNGs finais + manifest em diretório/PR de assets; Devin valida resolução, proporções, alpha/croma, provenance e contraste, e então converte/comprime em WebP sem destruir pixels.
4. **Gates**: revisão dos três masters (Glaucia/cachorro/nave), aprovação do piloto Terra, aprovação das seis páginas restantes, auditoria autoral total, revisão do preview e autorização explícita para merge/deploy. Implementação independente de imagens pode começar imediatamente.

**Proibição de retrabalho:** não solicitar sete hero JPGs “completos” como único asset. A arquitetura precisa de **placa de fundo sem personagens** + **atores/sprites separados** + **props/FX**, para que as animações e os easter eggs funcionem sem retrabalhar as imagens a cada gesto.

---

## 0. Como interpretar este dossiê

**Legenda de evidência**

- **[A — APROVADO]**: decisão expressa na entrevista de 18 perguntas e nos refinamentos posteriores da proprietária.
- **[C — CÓDIGO]**: identificado na cópia textual Repomix recebida nesta conversa, sem suposição de que o deploy atual tenha exatamente o mesmo commit.
- **[V — VISUAL]**: observado nas sete artes anexadas e na captura da Home enviada pela proprietária.
- **[R — REFERÊNCIA]**: diretriz fundamentada em fonte externa identificada na seção 17.
- **[P — PROPOSTO]**: proposta operacional para execução, sujeita a validação quando envolver experiência visual, nova nomenclatura, dados ou trade-offs técnicos.
- **[N — NÃO VALIDADO]**: demanda comprovação posterior por execução, autorização ou inspeção independente.

**Regra de decisão:** um fato [C] não vira comportamento confirmado em produção sem [N] → teste dinâmico. Uma proposta [P] não substitui conteúdo [A] sem aceite humano. Os nomes e desfechos dos novos easter eggs são uma **especificação candidata**, não eventos já existentes.

### 0.1 Escopo da auditoria e sua limitação

Fontes primárias: (1) `repomix-output-glaucia86-glaucialemos.dev.txt` anexado; (2) o relatório anterior `auditoria-baseline-galaxia-encantada.md`; (3) o documento inicial `creative-direction-glaucia-atlas-espacial-v1.md`, que antecede decisões mais recentes; (4) sete artes de heróis atuais e screenshot da Home; (5) observações da proprietária durante a definição. O documento atual prevalece sobre o rascunho v1 quando há mudança de cenário, liberdade criativa ou navegação.

**Limitação material:** uma tentativa anterior de teste sobre o deployment público com Chromium/Playwright não conseguiu navegar por restrição do ambiente (`net::ERR_BLOCKED_BY_ADMINISTRATOR`). Portanto **não há relatório E2E ao vivo das sete rotas** e não se deve escrever “Playwright passou” a partir desta auditoria. Existem testes e capturas armazenados no repositório, mas sua presença não comprova execução sobre o deploy atual. A primeira fase da implementação deve validar o commit e executar a baseline em ambiente com rede autorizada.

## 1. Resumo executivo e resultado esperado

### 1.1 Problema

O portfólio atual combina marca pessoal, referências visuais e narrativa de uma franquia de terceiros. O código incorporou essa temática em imagens, nomes de cenas, traduções, aberturas, animações, comandos secretos e documentação. Há risco de propriedade intelectual e dependência criativa. A troca superficial de JPEGs **não resolve** a identidade do produto e pode quebrar animações acopladas às artes e aos hotspots.

### 1.2 Objetivo

Entregar uma experiência inteiramente identificável como **criação original de Glaucia Lemos**, capaz de demonstrar autoridade internacional, engenharia, IA, educação e comunidade por meio de uma expedição espacial. O visitante pode ler e contratar normalmente **sem jogar**, ou pode seguir uma **história opcional** com transições de nave, seis destinos principais e descoberta de segredos.

### 1.3 Princípios inegociáveis [A]

1. **Autoridade profissional antes do efeito:** currículo, projetos, conteúdos, eventos, serviços e CTAs são conteúdo prioritário e acessível.
2. **Pixel art 100%:** cenário, estrelas, fenômenos cósmicos, personagens, nave, plantas, cristais e objetos, com arestas de pixel definidas.
3. **Linguagem espacial rica:** alternar contemplação cósmica em escala monumental e locais exploráveis, inclusive neve, areia, florestas, jardins e bibliotecas imaginárias.
4. **Duas regiões compositivas no desktop:** texto, tipografia e botões à esquerda; Glaucia e/ou cachorro animados à direita; pano de fundo 16:9 full-bleed.
5. **Pessoas/personagens vivos:** animações `idle` e ao menos um easter egg vinculado ao personagem da direita **em cada uma das sete páginas**, incluindo 404.
6. **Identidade reconhecível:** Glaucia semirrealista, baseada em fotos próprias; cachorro reconhecível, com acessórios adaptados ao clima/aventura; roupas específicas para cada cenário.
7. **Modo história opt-in:** disponível sem substituir os seis links de navegação convencionais ou impor sequências de inicialização ao visitante.
8. **Reuso técnico prioritário:** preservar rotas, dados, integrações, acessibilidade, contratos comportamentais, testes e desempenho sem criar outro produto do zero.
9. **Idioma:** PT-BR, EN e ES continuam em todas as rotas, interações e metadados.
10. **Autoria independente:** não usar personagens, silhuetas distintivas, equipamentos, nomes, falas, trilhas ou convenções gráficas exclusivamente identificáveis de *Star Wars*; referências de *Project Hail Mary* são apenas moodboard para escala e luz, nunca assets ou cenas a reproduzir.

### 1.4 Resultado verificável [P]

- Sete rotas existentes, com visual novo, SSR/conteúdo funcional e preview aprovado.
- Sete composições 16:9 com área segura de texto, personagem(s) à direita e fallback estático.
- Pelo menos sete interações principais ligadas a personagens; **24 slots únicos de easter eggs**, progressão, replay e reset testados.
- Um sistema de navegação guiada discreto, reversível e opcional, com progressão acessível sem depender de animação.
- Ausência de materiais de franquia nos arquivos publicados e nas strings de produto (critério de varredura definido na seção 12).
- Validação de qualidade por suíte existente + testes novos, amostragem visual e auditoria de acessibilidade/performance.

## 2. Registro de decisões (ADR de produto e design)

| ID | Decisão | Justificativa | Estado |
|---|---|---|---|
| DEC-01 | Adotar **Galáxia Encantada** como direção criativa | Maior diferenciação, liberdade autoral, amplitude estética | [A] |
| DEC-02 | Posicionar como portfólio de engenheira de referência internacional, não jogo isolado | Conversão profissional e leitura clara | [A] |
| DEC-03 | Unir astronomia com mundos inventados, biomas e fenômenos de escala cinematográfica | A proprietária explicitamente ampliou a restrição inicial a planetas reais | [A] |
| DEC-04 | Utilizar **pixel art 100%** em todas as artes finais | Continuidade com a linguagem artística já construída | [A] |
| DEC-05 | Criar Glaucia semirrealista, fiel a fotografias, com trajes variáveis | Identidade pessoal, independência de personagens de terceiros | [A] |
| DEC-06 | Incluir cachorro reconhecível com acessórios próprios; variar o papel entre narrativa, descobertas e navegação | Elemento afetivo e interação não repetitiva | [A] |
| DEC-07 | Manter navegação comum e adicionar **modo história guiado** | Descoberta sem prejudicar consulta direta ao portfólio | [A] |
| DEC-08 | Manter texto à esquerda/personagens à direita no desktop | Layout validado visualmente pela proprietária | [A]/[V] |
| DEC-09 | Exigir personagem animado e easter egg em cada uma das sete experiências | Conservar a proposta de descoberta da interface | [A] |
| DEC-10 | Recriar **aproximadamente 24 segredos**, preservando mecânica e não as referências | Reuso da engenharia e redução da dependência temática | [A] |
| DEC-11 | Manter rotas `/[lang]`, `/sobre`, `/projetos`, `/conteudo`, `/eventos`, `/servicos` e 404 | Evitar quebra de SEO, links, bookmarks e dados | [A] |
| DEC-12 | Reutilizar animações e eventos de DOM, mas desacoplar `sceneByImage` do path do asset | Evitar nova arquitetura inteira; remover dependência de nomes da franquia | [C]/[P] |
| DEC-13 | Elaborar direção de arte, character sheet e protótipo antes da validação visual final | Evitar multiplicar um estilo inconsistente por sete páginas | [A] |
| DEC-14 | Migrar incrementalmente por PRs e preview, com rollback | Risco de regressão e possibilidade de revisão humana | [P] |
| DEC-15 | Fazer inventário de licença e proveniência de todos os assets novos | Autoria e segurança jurídica verificáveis | [R]/[P] |
| DEC-16 | Não migrar automaticamente conquistas antigas dos easter eggs renomeados | IDs antigos representam conteúdo diferente; evitar contagens falsas | [C]/[P] |

**Decisões já substituídas:** a diretriz antiga de usar *somente* planetas/luas reais e ambientes estritamente plausíveis foi revogada pela proprietária. A versão vigente combina destinos reais (Terra/Marte), mundo nevado e mundos/estações fictícios. O documento `creative-direction-...-v1.md` permanece como histórico da entrevista, **não** como roteiro final.

## 3. Universo autoral, personagens e linguagem visual

### 3.1 Premissa narrativa [A]/[P]

Uma engenheira transforma curiosidade, engenharia e conhecimento em uma expedição espacial. Cada mundo representa um aspecto da sua trajetória: origem, evolução, experimentação, ensino, comunidade e colaboração. O cachorro participa como amigo, curioso, detector de surpresas e, ocasionalmente, copiloto. As descobertas apresentam **evidências reais da carreira** sem apresentar feitos fictícios como fatos.

**Nome do produto:** Galáxia Encantada [A].  
**Nomes de trabalho dos lugares:** Observatório das Primeiras Luzes, Nivéora, Vale das Invenções, Lúmina, Atlas das Conexões, Aurélia e Maré Rubra [P]. Eles estão aprovados como mapa criativo de trabalho; antes de registrar marca, vender merchandising ou afirmar exclusividade é preciso verificar colisões de nome e identidade [N].

### 3.2 Bíblia de Glaucia — especificação de personagem [A]/[P]

- **Semirrealista:** características faciais, tom de pele, cabelo e proporções consistentes com fotografias cedidas pela titular. Não inferir atributos de imagens que ainda não foram fornecidas.
- **Identidade constante:** mesma base de rosto/corpo entre cenas; variação controlada de vestuário, acessórios, iluminação e pose. Proibida transformação em personagem já reconhecível de franquia.
- **Roupas por ambiente:** roupa de observadora na Terra; traje térmico selado em Nivéora; traje de exploração marciana; roupa de pesquisadora de Lúmina; uniforme de navegação; vestuário colaborativo orbital; proteção para emergência na 404.
- **Pacote mínimo proposto de estados:** `idle`, `blink`, `look`, `interact`, `react`, `celebrate` e, quando necessário, `walk` ou `operate`.
- **Ancoragem:** pés, escala e posição no sprite atlas devem ficar consistentes entre estados. Toda animação deve ter recuo/cancelamento e retorno ao estado `idle`.

### 3.3 Bíblia do cachorrinho [A]/[P]

- Usar fotografias da própria tutora para obter forma, pelagem e expressão reconhecíveis; não presumir raça, nome ou tamanho até existir referência [N].
- Acessórios exclusivos por destino: lenço de observatório; proteção térmica; peitoral de exploração; scanner de biblioteca; coleira de navegação; adereço botânico; sinalizador de resgate.
- Comportamentos especiais com efeito real na experiência, mas **nunca obrigatórios** para navegar, ler um artigo ou enviar formulário.
- Garantir estados equivalentes de interação por mouse, teclado e toque. Não depender de arrastar um animal na tela.

### 3.4 Nave original [P]

A mesma nave aparece na Home, nas transições, na ponte dos eventos e na Maré Rubra. Deve ter silhueta própria (proporções, propulsão, cockpit e geometria não derivadas de veículos de franquias); alguns detalhes de cor/sinalização reaparecem discretamente no design system. A nave é uma **ponte narrativa**, não uma simulação física complexa.

### 3.5 Direção visual unificada, sem tornar todos os mundos iguais

- **Camada global:** tipografia legível + tipografia pixel para metadados; estrutura de HUD; botões; estados de foco; grid e espaçamento; nomenclatura de cenas e ícones originais.
- **Camada por mundo:** paleta e iluminação autônomas, vegetação, atmosfera e ritmo das partículas; os tokens por cena substituem referências a sabres/Força.
- **Contemplação cósmica:** gás verde monumental, plasma coral/vermelho, mares de luz, partículas e escala humana pequena — inspirações de atmosfera extraídas das imagens do filme enviadas pela proprietária, **sem replicar planos ou composição reconhecível**.
- **Exploração física:** neve realçada por auroras, planícies marcianas, florestas e cristais inventados, arquitetura de estação orbital.
- **Originalidade:** não reproduzir símbolos, vestes, armas, naves, espécies, nomes próprios ou arquitetura característica de filmes existentes. Uma paleta ou a ideia genérica de “espaço” não são um problema por si; a combinação expressiva reconhecível é o risco a evitar.

### 3.6 Invariantes de composição [A]/[V]

| Área | Regra | Verificação |
|---|---|---|
| Desktop, esquerdo | H1, proposta de valor, subtítulo, CTAs; contraste preservado | Capturas 1280/1440/1920; legibilidade sem elementos sobrepostos |
| Desktop, direito | Protagonista + cachorro e/ou artefato narrativo animado | Personagem inteiro e hotspot alcançável |
| Fundo | 16:9 full-bleed, com profundidade; `cover` sem deslocar zona de texto | Comparar crop e pontos focais em 900/901px e widescreen |
| Celular | Ordem de leitura normal; texto e personagem visíveis em áreas distintas quando necessário | 320/390/768px, sem horizontais ou CTAs escondidos |
| Movimento | O ambiente tem vida, mas não atrapalha leitura; redução desativa efeitos não essenciais | Preferências sistema/manual, sem JS, aba oculta |
| CTA | Primário funcional desde o primeiro conteúdo útil; não preso ao modo história | Testes de navegação e formulário |

**Proporções numéricas candidatas [P]:** plano lógico 1280×720 para composições 16:9; área segura preferencial de texto até cerca de 44% da largura e ponto focal de personagens a partir de 60% da largura no desktop. Esses percentuais são **referências de direção de arte**, não medições do layout publicado; validar e ajustar em screenshots responsivos.

## 4. Storyboard final por rota e critérios de aceite

A navegação principal mantém seis páginas. A página 404 é uma experiência de exceção, não um passo obrigatório da jornada. Em cada item, “hero” significa **a composição acima da dobra; o conteúdo profissional existente abaixo do hero deve permanecer**.

### 4.1 `/[lang]` — Observatório das Primeiras Luzes (Terra)

**Cena:** observatório terrestre em local elevado; céu vívido, verde-aurora/rosa, constelações; nave preparada ao fundo. **À direita:** Glaucia ajustando telescópio, cachorro investigando um sinal. **À esquerda:** nome, engenharia/liderança/IA, proposta de valor e dois CTAs atuais (workshops/mentorias e projetos).

**Movimento contínuo:** piscar, respiração, brilhos do observatório, estrelas por planos, luzes suaves; entrada sem bloquear leitura. **Interação-mãe:** telescópio e sinal do cachorro; gatilho especial inicia contagem curta e mostra o lançamento da nave. **Reuso:** capítulos da Home, RAG didático, mapa de eventos, trajetória e CTA devem continuar. **Não copiar:** levitação pela Força ou X-wing; o motor de partículas/parallax pode ser reaproveitado com mecânica completamente nova.

**Aceite:** personagens à direita sem atingir H1; CTAs operantes em três idiomas; mínimo quatro segredos da Home (tabela da seção 8); navegação normal funciona mesmo quando modo história está desligado; fallback estático carrega sem JS.

### 4.2 `/[lang]/sobre` — Nivéora, o Mundo Nevado das Auroras

**Cena:** planeta fictício gelado, penhascos de gelo, neve, auroras turquesa/lilás e estação científica própria. **À direita:** Glaucia com roupa térmica e cachorro protegido; pegadas e reação ao vento. **À esquerda:** introdução à carreira, CTA para trajetória, dados profissionais verdadeiros.

**Movimento contínuo:** neve em vários planos, rajadas sincronizadas, iluminação polar e respiração; reuso conceitual de `EchoBaseScene`, coreografia e `LeiaActor`, sem arte ou falas de Leia. **Easter egg principal:** o cachorro localiza uma cápsula que revela um registro da trajetória; ativação não congela conteúdo. **Reuso:** mapa de carreira, anos, conquistas e dados de experiência.

**Aceite:** nenhuma arma/blaster, personagem/espaçonave de franquia; quatro segredos acessíveis; neve pausa fora do viewport; trajetória mantém dados e fontes; experiência sem JS funcional.

### 4.3 `/[lang]/projetos` — Marte, Vale das Invenções

**Cena:** vale marciano, cânions em cobre/vermelho, laboratórios modulares e rovers originais com pontos ciano. **À direita:** Glaucia operando rover e cachorro examinando amostras. **À esquerda:** engenharia e CTA para projetos/GitHub. **Camada de produto:** arquivo de repositórios, ranking, filtros, contribuidores e informações reais.

**Movimento contínuo:** poeira, hologramas técnicos originais, iluminação do rover e sinais de telemetria. **Interação-mãe:** rover descobre dados de um repositório real ou um módulo de experimento; nunca inventar estrelas, forks ou contribuição. **Reuso:** `R2Telemetry` apenas como lógica genérica de estatísticas, `RepoArchive`, categorias e dados do GitHub. **Remover:** Jawa, sandcrawler, droides de franquia, dois sóis de Tatooine como citação, bordões e referências de personagens.

**Aceite:** cinco segredos; GitHub/fallback offline preservado; filtros e links externos corretos; ausência de nova dependência de backend ou inferência de IA para efeitos decorativos.

### 4.4 `/[lang]/conteudo` — Lúmina, a Biblioteca Viva

**Cena:** mundo totalmente inventado, arquitetura cristalina, árvores e rios bioluminescentes; cromia violeta/ciano/magenta. **À direita:** Glaucia pesquisadora e cachorro com pequeno scanner de cristais. **À esquerda:** artigos, tutoriais e conteúdos, com CTA e filtros existentes.

**Movimento contínuo:** refratação pixelada discreta, partículas e luz refletida. **Interação-mãe:** Glaucia toca um cristal; o cachorro revela outro arquivo escondido. **Reuso:** `ContentFilter`, dados de `artigos.json`, roteamento de links. Hoje esta rota usa `PageHero` e `HeroScene`, mas não tem personagem com poses independentes no mesmo grau de Leia/Yoda [C].

**Aceite:** três segredos; filtros não dependem da cena; textos e URLs íntegros; interação por teclado, toque e mouse.

### 4.5 `/[lang]/eventos` — Atlas das Conexões (órbita da Terra)

**Cena:** sala de navegação original com grande janela para a Terra; rastros luminosos e estrelas. **À direita:** Glaucia operando um globo; cachorro revela um ponto no painel. **À esquerda:** histórico e convite para eventos. **Camada de produto:** preservar `EventGlobe`, histórico filtrável, contagens e países representados de acordo com o dataset.

**Regra factual importante:** um país sede de evento remoto **não significa país visitado fisicamente**. Não transformar apresentações remotas em viagens inventadas. **Interação-mãe:** conexões do mapa formam um desenho luminoso ou sinal de missão, sem distorcer geolocalização dos eventos.

**Aceite:** três segredos; globo arrastável; filtro e lista completos mesmo sem JavaScript; datasets e estatísticas corretos; legenda sobre participações remotas mantida.

### 4.6 `/[lang]/servicos` — Aurélia, os Jardins Suspensos

**Implementação (26/10/2026):** página migrada na branch `feat/aurelia-servicos`; seis segredos concretos:
`garden-bloom`, `beacon-relay`, `ring-alignment`, `seed-vault`, `greenhouse-dusk`, `pollination`.
Substituem as sugestões `collaboration-beacon`/`garden-seed` da seção 8.3; `epilogue-signal` permanece como ponte.
Validação visual/execução completa pendentes; consultar a Retomada no handoff.

**Cena:** estação orbital fictícia com jardins e plantas emissoras de luz, vista para um planeta de anéis inventado. **À direita:** Glaucia recebe uma transmissão; cachorro aciona um sinalizador. **À esquerda:** serviços, oficinas, mentorias e CTA de contato.

**Movimento contínuo:** folhas/luzes, vapor suave e reflexos; sem distração do formulário. **Interação-mãe:** ativação de canal de mensagem especial, com acesso claro ao contato. **Reuso:** `ContactForm`, pré-preenchimentos por assunto, validação e serviços existentes. **Regra:** o easter egg nunca envia formulário nem cria pedido real automaticamente.

**Aceite:** dois segredos; nenhum envio sem consentimento; teclado, validações, sucesso/erro do formulário preservados.

### 4.7 404 — Maré Rubra, Coordenadas Perdidas

**Cena:** região cósmica fictícia, ondas de plasma vermelho/coral e partículas brilhantes, nave com sistema de navegação comprometido. **À direita:** Glaucia ajusta painel; cachorro localiza rota de volta. **À esquerda:** texto de erro claro e CTA sempre visível para Início.

**Movimento contínuo:** campo visual de plasma em pixel art; densidade reduzida sob `prefers-reduced-motion`. **Interação-mãe:** cachorro descobre coordenadas e ativa sequência curta de retorno. **Reuso:** rota 404, status HTTP adequado e CTA. A Maré Rubra é uma exceção narrativa; não inventar links quebrados para forçar visita.

**Aceite:** dois segredos; resposta efetiva 404; CTA funciona independentemente de animação; sem referência visual direta a filme ou personagem reconhecível.

## 5. Modo história: contrato de navegação [A]/[P]

**Fluxo proposto:** Terra → Nivéora → Marte → Lúmina → Atlas → Aurélia. 404 ocorre somente para rota inexistente. A sequência não muda os caminhos `/pt`, `/en`, `/es` nem os slugs existentes. O modo história é ativado por ação explícita na Home e apresenta um controle discreto de continuar/pular/sair.

- **Estado mínimo:** `storyMode` (ativo/inativo), `chapter` (rota corrente), `seenIntro` opcional em sessão; persistência conservadora (preferir `sessionStorage` para estado da jornada, sem dados pessoais).
- **Sem dependência de animação:** os links são âncoras/links normais; a transição da nave é enriquecimento progressivo. `prefers-reduced-motion` oferece corte estático imediato.
- **Sem prisão de navegação:** usuário pode clicar Projetos diretamente a qualquer momento, navegar para trás e abrir deep links.
- **Não confundir narrativas:** a Home já possui cinco episódios internos no código. A jornada entre seis páginas é uma **camada externa opcional**, não obrigação de reescrever os capítulos internos.
- **Acessibilidade:** foco e título da página corretos após navegação; som desligado por padrão; permitir desativar a jornada; mudanças de cena não removem controls do DOM.
- **Simplicidade:** implementar primeiro como progressão por links/estado pequeno; rejeitar um “game engine”, roteador customizado ou processamento 3D pesado sem evidência de necessidade.

## 6. Auditoria técnica — inventário de referência

### 6.1 Rotas, cenas, assets e risco de substituição [C]

| Rota | Arte/cena atual no snapshot | Arquivos de entrada principais | Diagnóstico |
|---|---|---|---|
| Home | Dagobah/Yoda, energia/rochas e retrato Jedi | `src/app/[lang]/page.tsx`, `home/DagobahScene.tsx`, `home/HeroMotion.tsx`, `public/pixel/home-yoda.jpg`, `public/pixel/jedi-glaucia.jpg`, `public/pixel/dagobah-background.webp` | Alto acoplamento visual e comportamental |
| Sobre | Hoth/Leia, neve, poses, sonda, dossiê | `src/app/[lang]/sobre/page.tsx`, `about/{EchoBaseScene,LeiaActor,EchoEggs,RebelDossier}.tsx`, `public/pixel/sobre-leia.jpg`, `public/pixel/leia/*` | Alto acoplamento de poses/hotspots; excelente base técnica |
| Projetos | Tatooine/R2, dois sóis, personagens/veículos, telemetria | `src/app/[lang]/projetos/page.tsx`, `projects/{R2Telemetry,TatooineEggs,RepoArchive,AllianceSquadrons}.tsx`, `public/pixel/projetos-r2d2.jpg` | Alto acoplamento no hero; dados de projetos reutilizáveis |
| Conteúdo | Floresta/Chewbacca | `src/app/[lang]/conteudo/page.tsx`, `ContentFilter.tsx`, `public/pixel/conteudo-chewbacca.jpg` | Hero substituível; animação de ator ainda a introduzir |
| Eventos | Grogu + globo | `src/app/[lang]/eventos/page.tsx`, `{EventGlobe,GlobeLoader,EventHistory}.tsx`, `public/pixel/eventos-grogu.jpg` | Hero substituível; globo/dados devem ficar intactos |
| Serviços | Vader + clima | `src/app/[lang]/servicos/page.tsx`, `ContactForm.tsx`, `public/pixel/servicos-vader.jpg` | Hero substituível; formulário deve ficar intacto |
| 404 | Stormtrooper + alarmes | `src/app/[lang]/not-found.tsx`, `public/pixel/404-stormtrooper.jpg` | Hero simples; requer primeiro comportamento próprio de ator |

### 6.2 Fatos confirmados sobre a arquitetura [C]

- `package.json` informa **Next.js 15 (`^15.5.6`)**, React 19, TypeScript, GSAP 3, Lenis, cobe, Zod, Vitest e Playwright. Não tratar números dinâmicos das dependências com `^` como versão instalada; verificar lockfile/ambiente antes de trabalhar.
- `src/components/HeroScene.tsx` usa `sceneByImage` que mapeia **paths de imagens para nomes de planetas/franquia**. Substituir por `sceneId` explícito: o path do asset não deve ser a chave de comportamento.
- `PageHero.tsx` já encapsula imagem `fill`, layer de efeitos, overlay, títulos e CTA. Preservar sua API ou evoluí-la de modo compatível; não convertê-lo inteiro para client sem necessidade.
- `SceneMotion.tsx` observa viewport, visibilidade da aba, preferências de movimento e ponteiro, realizando cleanup. Este contrato é um patrimônio técnico a ser mantido.
- `src/components/about/LeiaActor.tsx` demonstra carregamento de sprite layers sob demanda e lógica de poses com retorno; conceito reutilizável, nunca sprites/armas/falas da personagem.
- `src/components/SiteChrome.tsx` centraliza navegação, idioma, som, redução de animação, comando global, rodapé e `Comlink`. O texto de interface ainda menciona HoloNet.
- `src/lib/eggs.ts` mantém o catálogo tipado, `pageOf`, `matchPhrase`, `readFound`, `discover`, `emitEgg` e `onEgg`. Há tipos de página para **global/home/about/projects** apenas, o que demanda extensão para conteúdo, eventos, serviços e 404.
- `src/lib/boot.ts` usa `holonet-boot`, `echo-boot`, `r2-boot` e `holonet:boot-done`. A migração não deve expor sessões antigas com lógica semanticamente incompatível.
- `src/components/Comlink.tsx` exibe contador global, lista de segredos por página, replay e confirmação de reset. Depende do registro tipado e das traduções da experiência atual.
- `src/lib/data.ts` valida registros JSON por Zod; `src/lib/github.ts` consulta GitHub com fallback local. Não substituir dados reais por conteúdo fictício da narrativa.
- As bibliotecas de CSS incluem `home.css`, `about.css`, `tatooine.css`, `hero-scenes.css`, `jedi-effects.css`, `tokens.css`, `comlink.css` e `pixel-ui.css`, exigindo pesquisa de tokens e seletores temáticos, não apenas troca de URL das imagens.

### 6.3 Auditoria visual [V]

As sete artes anexadas têm composição widescreen com personagem ou objeto visual privilegiado à direita. O screenshot da Home confirma uma zona escura/menos ocupada à esquerda para nome, títulos e CTAs, e a zona de personagem/rochas à direita. O novo hero deve **reproduzir essa hierarquia funcional**, mas com novos traços, objetos, cenário e personagem. Esta observação é evidência da captura, não um teste de crop em todos os breakpoints.

### 6.4 Cobertura disponível vs. verificação faltante [C]/[N]

O repositório contém `tests/holonet.browser.mjs`, `hero-scenes.browser.mjs`, `echo-base.browser.mjs`, `tatooine.browser.mjs`, `events-page.browser.mjs`, `scene-lifecycle.browser.mjs`, `hero-ctas.browser.mjs`, `journey.browser.mjs`, `journey-accessibility.browser.mjs`, `eggs.test.ts` e outras. Há scripts `npm run test`, `npm run test:browser`, `npm run lint`, `npm run typecheck` e `npm run build`.

**Não validado:** o resultado dessas suítes sobre o deploy publicado, interações por toque reais, estado de produção por commit, consoles sem erro, dados vitais de campo, acessibilidade real em sete páginas, fidelidade das poses sob novos assets.

## 7. Matriz de migração — preservar, adaptar, substituir

| Artefato | Ação | Por quê / contrato |
|---|---|---|
| `src/app/[lang]/layout.tsx`, `middleware.ts`, config `i18n` | **PRESERVAR** | SEO/idiomas/rotas; editar só vocabulário/metadata necessários |
| `PageHero.tsx` | **ADAPTAR LEVEMENTE** | Passar `sceneId`/config; manter Server Component onde possível |
| `HeroScene.tsx`, `SceneMotion.tsx` | **REFATORAR CONFIG/REUTILIZAR LIFECYCLE** | Desacoplar mapa por nome da imagem; manter pausa e cleanup |
| `home/HeroMotion.tsx`, `home/DagobahScene.tsx` | **REUTILIZAR MECÂNICAS, REESCREVER ATUAÇÃO** | Converter interação de rochas/Força em telescópio/lançamento, não copiar o espetáculo original |
| `about/LeiaActor.tsx`, `about/EchoEggs.tsx` | **REUTILIZAR PADRÕES, REAUTORAR** | Atlas/poses/vento/neve; sem personagens protegidos |
| `projects/TatooineEggs.tsx` | **REUTILIZAR EVENTOS/HOTSPOTS, REAUTORAR** | Rover/exploração substituem droides/mercado/nomes temáticos |
| `R2Telemetry.tsx` | **RENOMEAR/APRESENTAÇÃO** | Reusar números de GitHub, não a identidade do droide |
| `RepoArchive.tsx`, `AllianceSquadrons.tsx` | **PRESERVAR LÓGICA E DADOS, REBRAND** | Manter registros e filtros, revisar só rotulagem/ícones |
| `ContentFilter.tsx`, `EventGlobe.tsx`, `EventHistory.tsx`, `ContactForm.tsx`, `RagDemo.tsx` | **PRESERVAR** | Subprodutos já úteis e não dependentes visualmente da franquia |
| `SiteChrome.tsx`, `Comlink.tsx`, `src/lib/eggs.ts` | **MANTER CONTRATO, REBRAND E EXPANDIR** | 24 segredos em todas as páginas; comandos, contador, reset e replay |
| `src/lib/sfx.ts` | **AUDITAR E RECOMPOR SONS** | Synth Web Audio pode permanecer; remover sons que imitem assinatura sonora reconhecível |
| `src/i18n/holonet.ts`, `echo-base.ts`, `tatooine.ts`, `comlink.ts`, dicionários PT/EN/ES | **REESCREVER COPY TEMÁTICA** | Evitar vazamento de falas, locais, personagens e trocadilhos |
| `public/pixel/*.jpg`, `public/pixel/{leia,yoda-force}/**`, fontes de arte `docs/art/**` | **CRIAR SUBSTITUTOS E RETIRAR DO DEPLOY** | Não construir nova arte copiando/cobrindo personagem existente |
| `scripts/build-leia-layers.mjs`, `scripts/build-yoda-force.mjs` | **ADAPTAR COMO REFERÊNCIA TÉCNICA** | Criar script genérico de atlas/sprite; não executar antigas fontes protegidas para arte nova |
| `README*.md`, `DESIGN-SYSTEM.md`, `DECISOES.md`, metadados, testes antigos | **ATUALIZAR** | Fonte pública do projeto deve representar o produto autoral final |

**Regra anti-overengineering:** uma configuração de cenas e componentes pequenos de ator/hotspot são suficientes para este domínio. Não introduzir ECS, engine de jogo, serviço de IA na renderização, microserviços ou sistema genérico de plugins sem problema mensurável.

### 7.1 Contrato mínimo candidato da configuração de cenas [P]

```ts
// Apenas interface de design (não implementada neste documento)
type SceneId =
  | "earth-observatory" | "niveora" | "mars-lab"
  | "lumina" | "earth-orbit" | "aurelia" | "red-tide";

type SceneDefinition = {
  id: SceneId;
  background: string;              // arte com proveniência registrada
  actorAtlas?: string;              // Glaucia (poses consistentes)
  dogAtlas?: string;                // cachorro (quando narrativamente presente)
  palette: { base: string; accent: string; foreground: string };
  focalPoint: { x: number; y: number }; // percentuais para crop responsivo
  hotspots: readonly string[];     // IDs autorais, não paths de imagem
};
```

**Importante:** evitar passar objetos pesados do servidor a clientes sem necessidade; manter os dados editoriais/SEO na renderização do servidor e criar fronteiras client apenas para animação e eventos.

## 8. Plano de remapeamento dos 24 easter eggs

### 8.1 Inventário comprovado [C]

`src/lib/eggs.ts` define exatamente 24 registros: 1 global, 3 Home, 9 Sobre, 11 Projetos e nenhum específico de Conteúdo/Eventos/Serviços/404. **Este é o catálogo estático, não o número de segredos efetivamente acionados em produção.**

### 8.2 Distribuição proposta [P]

| Área | Slots novos | Tipo de descoberta principal |
|---|---:|---|
| Global | 1 | Mapa estelar secreto |
| Home | 4 | Telescópio, preparação da nave, sinal do cachorro |
| Sobre | 4 | Neve, aurora, cápsula de memória |
| Projetos | 5 | Rover, experimentos, telemetria real |
| Conteúdo | 3 | Biblioteca, cristais, arquivos |
| Eventos | 3 | Atlas, rotas e cachorro navegador |
| Serviços | 2 | Jardim orbital e canal de colaboração |
| 404 | 2 | Resgate da nave e retorno |
| **Total** | **24** | **Todos sem referências de franquia** |

### 8.3 Migração um-para-um: ID legado → ID candidato [P]

A tabela conserva **24 slots**, mas não exige reutilizar o nome original ou a associação antiga à página. O critério de preservação é experiência, progressão, replay e rastreabilidade. A equipe deve documentar o gatilho exato e teste de cada resultado.

| # | ID no snapshot [C] | Novo ID [P] | Página nova | Novo gatilho / desfecho proposto |
|---:|---|---|---|---|
| 01 | `konami` | `star-map` | Global | Sequência por teclado/toque abre um mapa estelar autoral |
| 02 | `force-push` | `focus-lens` | Home | Clique no telescópio ajusta o foco e revela estrela |
| 03 | `force-hold` | `launch-charge` | Home | Pressionar/segurar inicia pré-lançamento da nave |
| 04 | `deflect` | `dog-signal` | Home | Cachorro reage a pulso luminoso e revela coordenada |
| 05 | `ion` | `hangar-check` | Home | Engenheira ativa sistema da nave e ilumina hangar |
| 06 | `holo` | `memory-capsule` | Sobre | Glaucia encontra registro de carreira na neve |
| 07 | `iknow` | `paw-tracks` | Sobre | Pegadas do cachorro conduzem a pista escondida |
| 08 | `blizzard` | `whiteout` | Sobre | Nevasca temporária com possibilidade de cancelar |
| 09 | `ice` | `aurora-prism` | Sobre | Interação altera reflexão da aurora no gelo |
| 10 | `probe` | `rover-scan` | Projetos | Rover escaneia e destaca um projeto verdadeiro |
| 11 | `tauntaun` | `sample-cache` | Projetos | Cachorro indica amostra mineral / descrição de projeto |
| 12 | `threepio-arm` | `rover-greeting` | Projetos | Robô próprio executa animação cômica e sinaliza dado |
| 13 | `settle` | `dust-fall` | Projetos | Poeira assenta e expõe um dispositivo de pesquisa |
| 14 | `npx` | `terminal-launch` | Projetos | Terminal mostra comando público real da autora |
| 15 | `utinni` | `crystal-whisper` | Conteúdo | Cristal vibra e revela artigo escondido |
| 16 | `plans` | `prism-align` | Conteúdo | Glaucia alinha feixes de luz para abrir arquivo |
| 17 | `sunset` | `library-dusk` | Conteúdo | Luz da biblioteca muda e mostra coleção especial |
| 18 | `podrace` | `orbital-trail` | Eventos | Trilha orbital destaca um conjunto real de eventos |
| 19 | `mindtrick` | `constellation-route` | Eventos | Mapa conecta pontos do globo em um desenho original |
| 20 | `cantina` | `dog-navigation` | Eventos | Cachorro aciona visor e destaca uma origem de evento |
| 21 | `artoo` | `collaboration-beacon` | Serviços | Sinal de colaboração ilumina o botão de contato |
| 22 | `sand` | `garden-seed` | Serviços | Planta luminosa cresce sem interferir no formulário |
| 23 | `hellothere` | `signal-recovered` | 404 | Glaucia recupera frequência e visualiza rota de volta |
| 24 | `bb8` | `paw-rescue` | 404 | Cachorro encontra o sinal que conclui resgate |

**Obrigações de engenharia:**

- Estender o tipo `EggPage`, `pageOf`, a seleção de `eggsFor` e a tradução `comlink.pages` para quatro novas áreas.
- Atualizar `EGGS`, nomes, pistas, aliases, mensagens e testes em PT/EN/ES.
- Manter pelo menos um hotspot associado a **Glaucia ou cachorro à direita** por página; em telas pequenas, habilitar botão equivalente.
- Auditar colisões entre palavras de comando e campos de formulário; não capturar teclado ao digitar em inputs/textarea.
- Definir um novo namespace de persistência, por exemplo `galaxia-encantada:eggs:v2`, sem transportar conquistas antigas por homonímia. Registrar opção clara de zerar/começar a jornada.
- Corrigir comportamento de `Comlink` para `404` (a rota atualmente cai em `global` no `pageOf`).
- **Sem efeitos irreversíveis:** nenhum segredo envia formulários, modifica repositórios, publica dados ou abre produtos pagos.

## 9. Design system e pipeline autoral de assets

### 9.1 Sistema visual por cena [A]/[P]

| Cena | Paleta candidata | Atmosfera / mecanismo | Foco |
|---|---|---|---|
| Terra | índigo, verde-aurora, rosa, dourado | estrelas, telescópio, lançamento | curiosidade e propósito |
| Nivéora | azul-glacial, lilás, turquesa | neve, vento, aurora, reflexos | evolução e superação |
| Marte | cobre, terracota, laranja, ciano | poeira, rovers, telemetria | engenharia e execução |
| Lúmina | magenta, violeta, ciano | cristais, partículas, luz refratada | ensino e criatividade |
| Atlas | azul-cobalto, dourado, verde-água | globo e rotas reais | comunidades e alcance |
| Aurélia | coral, verde-menta, rosa | vegetação luminosa e órbita | colaboração e contato |
| Maré Rubra | coral, vermelho, preto, dourado | plasma e poeira estelar | humor, escala e recuperação |

A paleta é por **cenário**, não sete temas sem parentesco: layout, espaçamento, componentes, tipografia, níveis de contraste e interação pertencem ao sistema global. A customização usa tokens semânticos (`--scene-bg`, `--scene-accent`, `--scene-glow`, etc.).

### 9.2 Etapas do asset pipeline [P] — detalhes e prompts na seção 19

1. **Referências legítimas:** fotografias autorizadas da própria Glaucia e do cachorro; registrar fonte de imagens/arquivos astronômicos usados como estudo.
2. **Character sheet:** vistas frontal/¾/perfil e poses `idle/interact`; definir roupas específicas antes das sete cenas.
3. **Nave original:** silhueta e cockpit inéditos; guia de proporção para escalas distante/média/próxima.
4. **Environment sheet por mundo:** tela 16:9, ponto focal à direita, zona segura de texto à esquerda, chão/pé consistente, profundidade por layers.
5. **Separação:** placa sem personagem; Glaucia e cachorro com transparência; efeitos em layers; evitar extrair/adaptar sprites de personagens de franquia.
6. **Animação:** atlas de poses; cada cena especifica estados, duração, gatilho, reversão e fallback estático.
7. **Compressão:** exportar versões WebP/AVIF quando apropriadas e testar pixel fidelity; `image-rendering: pixelated` apenas onde preservar contornos, sem degradar texto/interface.
8. **Proveniência:** salvar por arte `creator`, fonte, prompt/brief, modelo/ferramenta se houver, intervenções humanas, data, direitos/licença, aprovações e eventual referência externa.
9. **Aceite visual:** revisão do frame inicial, 1 ciclo `idle` e 1 easter egg por página, em desktop e celular; comparar com screenshots, não com lembranças.

**Alvo técnico preliminar, não medido [P]:** limitar assets acima da dobra por orçamento de bytes definido após baseline; carregar poses adicionais após entrada no viewport; preferir CSS transform/opacity e sprites localizados a re-renderizações completas de React; proibir loops pesados sem pausa/cleanup. Não impor tamanho fixo sem medir o formato final.

### 9.3 Mídias astronômicas e referências cinematográficas

Referências NASA podem auxiliar precisão factual, mas **não atribuem automaticamente licença ampla a qualquer imagem encontrada na internet**. A orientação da NASA indica que grande parte de seu conteúdo está fora de copyright nos EUA, com exceções (terceiros, logotipos, marcas, pessoas e possíveis restrições promocionais). O uso final do portfólio deve usar assets criados/autorizados, com fonte e eventual licença documentada. **Não incorporar frames de *Project Hail Mary* nem fundos de Star Wars como textura ou composição base.**

## 10. Risco autoral, marcas e higiene do repositório

### 10.1 Fundamento [R]

A **Lei 9.610/1998**, especialmente os arts. 7º, 28 e 29, trata das obras protegidas e da necessidade, em regra, de autorização prévia e expressa para reprodução, adaptação e outras formas de utilização. O fato de ser portfólio pessoal, tributo, gratuito ou ter sido gerado/alterado com IA **não é licença automática**. A substituição reduz riscos, mas este documento **não é parecer jurídico nem garantia de inexistência de violação**. Para lançamento público de alto alcance, realizar revisão de direitos autorais e marcas.

**Autoria pretendida ≠ autoria juridicamente certificada:** registrar contribuições criativas humanas no briefing, seleção, edição, montagem, código e narrativa; manter a proveniência das imagens geradas por IA. Não atribuir proteção exclusiva de saída puramente automatizada sem avaliação aplicável.

### 10.2 Matriz de triagem dos materiais publicados

| Categoria | Situação atual | Ação necessária antes da release |
|---|---|---|
| Imagens de herói com personagens reconhecíveis | Alto risco no snapshot | Substituir arquivos efetivamente servidos; não apenas mascarar, cortar ou recolorir |
| Sprites e camadas (`leia`, `yoda-force`) | Alto risco no snapshot | Retirar do build de produção e substituí-los por atlas autorais |
| Vocabulário público (`HoloNet`, Jedi, Força, Tatooine, Hoth etc.) | Amplamente presente | Reescrever textos, metadados, dicas e labels em três idiomas |
| Sounds / efeitos distintivos | Necessita ouvir/verificar | Criar paisagem sonora original; manter Web Audio opt-in sem imitação reconhecível |
| Símbolos, veículos e arquitetura icônicos | Múltiplos elementos no snapshot | Recriar nave/rover/objetos com silhueta autoral independente |
| Documentação e screenshots no repositório | Material legado público | Atualizar README, galerias, descrições, alt text, docs e amostras no estado de release |
| Identificadores internos e classes | Termos legados em código | Renomear sem provocar regressão, varrer e documentar exceções justificadas em logs históricos |
| Git history / previews externos | Potencial persistência | Avaliar histórico e previews públicos; trocar produção não apaga commits antigos nem caches automaticamente |
| Fontes e bibliotecas de terceiros | Licenças próprias | Manter notices/condições (ex.: Departure Mono usa SIL OFL) |

**Não usar um simples “disclaimer de fã” como substituto de autorização.** Depois da mudança, o README deixa de descrever o projeto como homenagem a Star Wars.

### 10.3 Varredura proposta (não executada)

Buscar referências a termos relacionados à franquia em `src`, `public`, `docs`, `README*`, metadados e testes, incluindo variações em inglês/português/espanhol e identificadores internos. O resultado pode conter referências históricas legítimas em documentação de migração, que devem ser **separadas das páginas, assets e bundles publicados**. Validar também screenshots, Open Graph, favicon, fontes e arquivos ignorados pelo Repomix. **Não executar deleção em massa por regex**; primeiro classificar cada correspondência e confirmar dependências.

## 11. Sequência operacional para migrar imediatamente sem perder qualidade

### Fase P0 — Congelar e comprovar a baseline (primeira ação)

- Registrar `git rev-parse HEAD`, branch, `git status --porcelain`, lockfile e URL/commit do deployment; comparar com Repomix e confirmar ausência de mudanças não commitadas que precisem ser preservadas.
- Em ambiente com navegador/rede autorizada, executar as suítes de browser atuais e capturar **seis rotas principais + página 404** no desktop 1440×900 e mobile 390×844, com vídeo/screenshot dos easter eggs existentes onde possível.
- Executar `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`. Rodar as condições reais do projeto, não forçar atualização de framework como parte da migração de tema.
- Criar branch de trabalho específica somente quando iniciar efetivamente a implementação (nome sugerido `feat/galaxia-encantada`); nunca sobrescrever alterações existentes.
- Produzir planilha/matriz com os 24 legados, triggers, estado, screenshot, caminho de código e correlação proposta; marcar as lacunas não reproduzíveis.

**Gate P0:** commit, build e baseline documentados; ao falhar E2E por ambiente, registrar impedimento, executar cenários locais disponíveis e **não afirmar cobertura inexistente**.

### Fase P1 — Identidade independente e infraestrutura pequena

- Aprovar fotos da Glaucia/cachorro como referências, character sheet da protagonista/cachorro e desenho da nave; criar paletas/tokens por cena.
- Implementar `SceneId` e dados de cena, mantendo APIs atuais como adaptadores temporários; introduzir componente de ator independente para 1 página piloto.
- Reescrever UI compartilhada: identidade visual, HoloNet/boot/Comlink, rodapé, mensagens e textos em PT/EN/ES; manter URLs atuais.
- Desenvolver helper leve de hotspots com teclado/toque, sem duplicar o sistema de eventos `eggs.ts`.

**Gate P1:** layout compartilhado preservado, nenhuma regressão de navegação, copy tri-idioma e novo ator independente validado no preview.

### Fase P2 — Home piloto: maior densidade visual, maior retorno

- Implementar **Observatório** com placa, Glaucia/cachorro, telescópio e nave; reautorizar as animações `idle`, clique/hold e sequência de lançamento.
- Manter abaixo da dobra demos, projetos, linha do tempo, mapa e CTAs reais.
- Criar os 4 segredos propostos da Home, screenshot dos principais estados e validação em mobile/reduced motion.

**Gate P2:** aprovação humana do look-and-feel e da atuação da personagem; nenhum CTA bloqueado; nenhuma referência publicada da franquia na Home.

### Fase P3 — Sobre e Projetos: converter os casos de interação mais complexos

- **Nivéora:** portar tempestade de neve, camadas, reação e quatro segredos; reconectar dados de carreira e fontes.
- **Marte:** portar o motor de hotspots, terminal/estatísticas/filtros, rover e cinco segredos; reconectar dados reais do GitHub.
- Renomear componentes e nomes de estados temáticos após validar contratos; preservar testes existentes adaptando intenção, não apagando casos.

**Gate P3:** os 9 segredos dessas páginas disparam, descobrem, reproduzem e zeram corretamente; dados não mudaram indevidamente.

### Fase P4 — Conteúdo, Eventos, Serviços e 404: preencher a lacuna de atuação

- Substituir imagens e adicionar **atores de fato animáveis**, não apenas efeitos ambientais; criar 3 + 3 + 2 + 2 segredos nessas páginas.
- Manter filtros de conteúdo, globo, histórico, estatísticas, serviços e contato; 404 real e navegação de retorno.
- Evitar “cópia visual” de uma mesma animação em todos os cenários; cada mundo terá gesto e resposta específicos.

**Gate P4:** sete páginas com `idle` + interação principal + fallback reduzido/estático; todas as funções profissionais preservadas.

### Fase P5 — Modo história e sistema global de descobertas

- Conectar seis etapas de modo história por links, com skip/exit e controles acessíveis.
- Migrar o catálogo tipado para as sete experiências (seis rotas principais e 404) + global; trocar chave `FOUND_KEY`; manter contador 24/24, replay, reset e preferências.
- Criar testes de jornada E2E e contador em três idiomas; não deixar conclusão de história alterar estado de dados profissionais.

**Gate P5:** modo normal e guiado funcionando sem regressões; 24 IDs novos únicos e sem aliases protegidos.

### Fase P6 — Revisão autoral, QA final e publicação controlada

- Auditar `src/public/docs/README`, strings, screenshots, OG/SEO, assets, sons, avisos, licenças e históricos acessíveis; classificar qualquer referência residual.
- Executar matriz completa de testes e capturas, medir desempenho em build de produção e comparar com baseline em ambiente igual.
- Revisar com a proprietária **cena, personagem, animação, hotspot, CTA e texto** em todas as rotas.
- Abrir PRs revisáveis, executar CI e usar preview para validação; publicar apenas com aprovação explícita e plano de rollback.

**Gate P6:** checklists de qualidade/autorais concluídos, documentação e evidências anexadas ao PR; rollback por redeploy do último commit saudável, se necessário.

### 11.1 Ordem sugerida de PRs [P]

1. `chore/creative-baseline-and-inventory` — documentação e testes baseline (sem UI).
2. `feat/scene-foundation` — SceneId, tokens e identidade compartilhada.
3. `feat/earth-observatory` — Home piloto + atores.
4. `feat/niveora-and-mars` — Sobre/Projetos.
5. `feat/lumina-atlas-aurelia-red-tide` — quatro experiências restantes.
6. `feat/story-mode-and-easter-eggs` — 24 slots e jornada guiada.
7. `chore/originality-qa-and-release` — documentação, assets residuais, auditoria e release.

PRs pequenos adicionais são aceitáveis. **Evitar big bang de sete páginas**; integrar por fases com preview e regressão.

## 12. QA: matriz de aceite, Playwright e performance

### 12.1 Mínimo obrigatório por página

- [ ] URL e metadados corretos em `/pt`, `/en`, `/es`; 404 retorna erro verdadeiro.
- [ ] H1, descrição profissional, CTA e conteúdo existentes; links externos preservados.
- [ ] Hero 16:9 / full-width no desktop; personagens à direita e texto à esquerda; sem colisão.
- [ ] Glaucia e cachorro com arte autoral e consistência de proporções; cenário sem marcas/personagens terceiros.
- [ ] `idle` visível quando permitido e uma ação especial acessível por mouse, teclado e toque.
- [ ] Sprites/efeitos carregam sem quebrar fundo estático; fallback sem JavaScript e motion reduzido válido.
- [ ] Listener/timer/observer removido no unmount e animação pausada fora da tela/aba oculta.
- [ ] Três idiomas sem strings de franquia; traduções completas de comandos/segredos/alt text.
- [ ] Conclusão de easter egg atualiza descoberta uma única vez, replay funciona e reset é claro.
- [ ] Som opcional; nenhum áudio disparado automaticamente.
- [ ] Não há travamento ao pular abertura, voltar no navegador ou sair do modo história.

### 12.2 Matriz de execução E2E [P]

| Dimensão | Cobertura de regressão |
|---|---|
| Rotas | 6 rotas × 3 idiomas + 404; links profundos e voltar |
| Viewports | 320, 390, 768, 900, 901, 1280, 1440 e 1920 px (amostragem conforme cena) |
| Motion | padrão, preferência do sistema reduzida, preferência manual reduzida, troca durante sessão |
| Interações | foco/Enter/Espaço, mouse, clique, hold, toque, gesto, popup e tecla ESC |
| Easter eggs | 24 novos, 1 por 1, repetição, contador, storage privado/bloqueado, reset |
| Ciclo de vida | navegar para outra página, aba oculta, viewport fora da cena, retorno, unmount |
| Conteúdo | GitHub real/fallback, artigos, filtros, globo e fontes, serviços e formulário |
| A11y | `axe` A/AA, contraste com overlay real, leitura sem JS, teclado, foco visível, hit targets |
| Performance | LCP/CLS em laboratório comparável + INP/dados de campo quando disponíveis |
| Legal/compliance | grep/classificação manual de marcas/nomes, licença dos assets, alt/metadata/OG |

### 12.3 Orçamentos mensuráveis [R]/[P]

Métricas **Core Web Vitals** recomendadas pelo Google para dados de campo no percentil 75: LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1. Esses alvos **não são resultados medidos** do novo site. Medir em condições comparáveis à baseline; executar também avaliações 390px/desktop com cache frio e CPU limitada, observando estabilidade visual e tempo de CPU nas interações.

Um **guardrail interno inicial** [P] pode ser: evitar regressão mediana superior a 10% no LCP de laboratório no mesmo ambiente, salvo decisão explícita sobre o trade-off artístico. Ajustar orçamento de assets e limites de partículas depois da medição; não tratar relatórios locais antigos de `docs/performance-*.json` como dados de campo atuais.

Normas relevantes: WCAG 2.2 A/AA, em especial 2.2.2 para animação automática (mecanismo de pausar/parar/ocultar) e 2.3.3 (nível AAA, adotado aqui como qualidade voluntária) para desabilitar animações de interação não essenciais. A qualidade real depende do teste da página, não da mera presença de botão “Reduzir animações”.

### 12.4 Comandos de referência (ambiente do repositório)

```bash
# Pré-condição: ambiente de Node compatível com o projeto/CI, lockfile intacto
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser

# Inventário de revisão antes de alterar arquivos
git status --short
git rev-parse HEAD
git branch --show-current
```

O runner Playwright pode usar `BASE_URL` e outras variáveis já documentadas no README e testes; validar como a suíte inicializa `next start` em `tests/run-browser.mjs`. **Não prometer que a rede do ambiente de execução permitirá acesso ao deployment público.**

## 13. Riscos, severidades e mitigação

| Risco | Nível | Sintoma / causa | Controle |
|---|---|---|---|
| Referências protegidas ainda exibidas/servidas | **P0** | arte legada, sprites, textos, metadados | inventário/licença, substituição completa e auditoria antes de publicar |
| Mismatch Repomix × deploy × branch | **P0** | testes baseados em código errado | captura commit/branch e versão do preview em P0 |
| Quebra de CTAs, conteúdo ou rotas | **P0** | reescrita de componentes compartilhados | preservar contrato e regressões/links em três idiomas |
| Personagem invade título ou desaparece no crop | **P0** | foco/`object-fit:cover` inadequados | composição por breakpoint e screenshot em 900/901px |
| Legado oculto no catálogo dos eggs | **P1** | strings, aliases e storage antigos | catálogo v2, grep e reset consciente |
| Scroll, CPU ou memória com loops | **P1** | listeners e partículas fora do viewport | `SceneMotion`/cleanup, throttling e testes de ciclo de vida |
| Imagens/IA sem proveniência | **P1** | licenças e originalidade incertas | ledger de assets, revisão humana e restrição de referências |
| Hero bonito mas sem conversão | **P1** | CTA encoberto, animação obrigatória | revisão profissional de primeira dobra e sem-JS |
| Problemas de contraste/motion | **P1** | brilho, flash, transição intensa | WCAG, toggle manual/sistema, overlays e controle da animação |
| Diferenças PT/EN/ES | **P1** | copy e slug de história divergentes | teste de paridade e snapshots internacionais |
| Nome fictício já usado por terceiro | **P2** | marca/portfólio semelhante | clearance antes de publicidade/registro comercial |
| Trabalho de arte sem consistência | **P2** | sprites mudam de identidade entre páginas | character sheets, atlas, revisão por poses |

## 14. Critérios finais de Done e gatilhos de publicação

A migração está **concluída** somente quando **TODOS** forem verdadeiros:

- [ ] Sete experiências visualmente originais, com personagens à direita e copy/CTAs à esquerda em desktop.
- [ ] Glaucia e cachorro reconhecíveis, com identidade consistente e comportamento de cada cenário aprovado pela proprietária.
- [ ] 24 easter eggs recriados e localizáveis em todas as áreas previstas; ao menos um do personagem por página.
- [ ] Navegação convencional preservada e jornada guiada opcional com controle de saída.
- [ ] PT/EN/ES, SEO, portfólio, contatos, estatísticas, dados reais, fontes e fallback continuam corretos.
- [ ] Varredura autoral completa sobre arte, texto, som, código de produto, imagens OG, READMEs e documentação pública; fontes novas têm proveniência.
- [ ] Testes unitários, lint, TypeScript, build, Playwright e cenários manuais críticos aprovados em ambiente autorizado; falhas documentadas e resolvidas.
- [ ] Acessibilidade e performance dentro dos gates explicitamente validados.
- [ ] Preview aprovado por revisão humana; PRs aprovados; publicação autorizada; rollback possível.

**Definition of Ready para iniciar hoje:** este dossiê + Repomix são suficientes para iniciar fase P0 e fundamentos genéricos de P1. A arte final **fiel** de Glaucia e do cachorro depende de fotografias autorizadas e revisão de character sheets [N]. Isso não bloqueia auditoria, desacoplamento técnico, traduções de UI, registro de cenas ou testes.

## 15. Itens ainda não determinados (não inventar)

| Item | Estado | Como tratar sem interromper a migração |
|---|---|---|
| Fotos-base da Glaucia e do cachorro | [N] | solicitar no checkpoint de arte; não inventar fisionomia/pelagem |
| Nome e características do cachorro | [N] | usar identificador neutro nos wireframes até confirmação |
| Nomes finais e marca de planetas/nave | [P]/[N] | usar nomes de trabalho e checar colisões antes de lançamento |
| Quadro visual final das sete páginas | [P] | comparar piloto Terra + Nivéora/Marte e iterar antes da produção em lote |
| Commit exato correspondente ao Repomix/deploy | [N] | registrar em P0, não afirmar equivalência |
| Desempenho de produção e resultado de testes ao vivo | [N] | capturar em ambiente autorizado antes e depois |
| Retorno de eventual autorização da Disney | [N] | direção autoral não depende dessa autorização; evitar alegar aceite/recusa não recebido |
| Conclusão de revisão de propriedade intelectual | [N] | checklist autoral + consulta a profissional habilitado quando necessário |

## 16. Prompt de kickoff para Devin com Opus 5.5 — pronto para copiar

> **Enviar ao Devin junto com este Markdown completo (v2) e acesso ao repositório.** As imagens serão produzidas externamente no Grok Image/Imagine e entregues depois; Devin não deve gerá-las ou fingir que existem.

```text
Você é o agente de engenharia que executará a migração autoral do repositório
https://github.com/glaucia86/glaucialemos.dev usando o modelo Opus 5.5 selecionado
pelo operador no Devin. Leia TODO o arquivo PLANO-MIGRACAO-GALAXIA-ENCANTADA-DEVIN-OPUS55-GROK-IMAGE.md
antes de editar qualquer arquivo. Leia AGENTS.md, DECISOES.md, DESIGN-SYSTEM.md, README.pt-BR.md,
os scripts npm e o código existente. O código checkout é a fonte de verdade quando divergir do Repomix.

OBJETIVO: substituir a tematização de Star Wars pelo universo autoral Galáxia Encantada,
preservando arquitetura, URLs, conteúdo profissional, 3 idiomas, acessibilidade,
interações e a infraestrutura existente de 24 easter eggs. Navegação convencional
sempre funciona; o modo história é opcional. Em desktop: copy/CTAs à esquerda,
Glaucia e cachorro animáveis à direita, fundo 16:9 full-bleed. Em mobile: composição
reorganizada sem ocultar copy/personagens.

MODO DE EXECUÇÃO:
1. P0: audite status/HEAD/branch, diferenças com o Repomix, dependências e baseline.
   Execute npm ci, lint, typecheck, unit, build e Playwright onde permitido; capture
   6 rotas principais, página 404, screenshots e os triggers atuais. Declare bloqueios honestamente.
2. Crie branch de trabalho isolada após verificar alterações existentes; não sobrescreva
   trabalho não commitado. Faça PRs pequenos/revisáveis com testes e evidências.
3. Implemente a fundação independente de arte: SceneId tipado, configuração de cenas,
   cena independente de path de imagem, tokens por mundo, suporte de atores e hotspots,
   estado novo de easter eggs e novos testes. Preserve Server Components quando apropriado.
4. Trate os arquivos listados no Asset Manifest da seção 18 como CONTRATOS. Não suponha
   que uma imagem foi gerada até ela existir em path verificável; não use imagem placeholder
   derivada de personagens da franquia nem crie versões improvisadas da face/cachorro.
5. Integre o piloto Terra quando PL-01 + GL-01 + DOG-01 + PROP-01 e masters
   estiverem aprovados. Depois migre Nivéora, Marte, Lúmina, Atlas, Aurélia e 404,
   reaproveitando efeitos CSS/SVG/GSAP e reescrevendo o comportamento visual autoral.
6. O catálogo de eggs terá 24 IDs novos conforme a seção 8, com progressão, reset,
   replay, suporte PT/EN/ES, mouse/teclado/toque; cada página exige pelo menos um
   egg ligado a Glaucia ou cachorro à direita.
7. Audite e substitua os elementos de Star Wars em arte servida, tradução,
   textos, boot, HUD, sprites, alt text, Open Graph, favicon, README e testes.
   Preserve a lógica útil, mas não a identidade antiga. Não faça reescrita do histórico Git.
8. Valide cada fase: unit, lint, tipos, build, Playwright, sem JS, reduzido,
   responsividade, segurança de formulário, links e performance. Relate valores reais.
9. Não faça merge na main, force-push, deploy em produção nem publicação de imagens
   não aprovadas. Pare SOMENTE nos gates de aceitação visual que requerem aprovação
   da proprietária; continue em paralelo nas tarefas independentes e documente bloqueios.

PRIMEIRA ENTREGA: relatório P0 (baseline e divergências), matriz de arquivos reais,
plano de PRs e PR de fundação P1 testado; não inicie substituições visuais finais
com assets inexistentes. Ao receber imagens aprovadas, execute a integração por página.

A cada PR: explique alteração, evidência executada, screenshots, regressões,
status dos 24 eggs, autoralidade pendente, risco residual e rollback.
```

### 16.1 Prompt de continuação, após a entrega dos assets pelo Grok

```text
Continue a implementação da Galáxia Encantada usando o dossiê v2. Os assets
aprovados pelo proprietário estão disponíveis no diretório indicado pelo usuário
ou no PR específico de assets. Confira paths reais e manifest antes de prosseguir.
NÃO altere identidade facial, pelagem ou composição à sua discrição. Primeiro
integre uma cena piloto como layers separadas: background, Glaucia, cachorro,
props/hotspots, FX CSS/SVG. Capture idle, interação, easter egg, reduced-motion,
mobile, keyboard e tela sem JS. Registre o que precisou de intervenção manual.
Não declare nenhum asset/QA aprovado sem evidência e mantenha produção intacta.
```

## 17. Fontes, bibliografia e rastreabilidade

### 17.1 Fontes primárias do projeto (fornecidas pela proprietária)

1. **Repomix integral**: `repomix-output-glaucia86-glaucialemos.dev.txt` (cópia agregada de 179 arquivos de texto do projeto, contando entradas `File:`; podem faltar binários e arquivos ignorados). Material-base para caminhos/componentes/contratos. **Snapshot sem hash de commit verificado nesta auditoria**.
2. **Auditoria anterior**: `auditoria-baseline-galaxia-encantada.md` — inventário de rotas, 24 IDs, limites do Playwright, observações de composição.
3. **Direção criativa inicial**: `creative-direction-glaucia-atlas-espacial-v1.md` — registro da entrevista de 18 perguntas; **cenários e restrição astronômica posteriores prevalecem**.
4. **Imagens fornecidas**: sete artes atuais (`home-yoda`, `sobre-leia`, `projetos-r2d2`, `conteudo-chewbacca`, `eventos-grogu`, `servicos-vader`, `404-stormtrooper`) e screenshot da Home com layout desktop.
5. **Referências de atmosfera**: quatro frames enviados de *Project Hail Mary* para análise de cor/escala/partículas (uso de referência; não copiar/republicar como asset final).
6. **Conversa de aprovação**: 18 respostas às três rodadas do `grill-me` e refinamentos posteriores (liberdade para mundos inventados, espaço colorido e pousos com neve, imagem 16:9, posição dos personagens, interações por página).

### 17.2 Fontes externas oficiais consultadas

- [Lei 9.610/1998 — texto oficial (Planalto)](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm) — proteção da obra e autorização para reproduzir/adaptar (arts. 7º, 28–29).
- [NASA — Guidelines for using NASA Images and Media](https://www.nasa.gov/nasa-brand-center/images-and-media/) — uso de mídia NASA, ressalvas para marcas, pessoas, promoções e materiais de terceiros.
- [W3C — WCAG 2.2, tradução PT-BR](https://www.w3.org/Translations/WCAG22-pt-BR/) — acessibilidade, movimento e controles.
- [W3C — Understanding 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) — pausa de conteúdo que se move automaticamente.
- [W3C — Understanding 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions) — redução de animação de interação (nível AAA).
- [web.dev — Core Web Vitals](https://web.dev/articles/vitals) — LCP, INP, CLS e interpretação dos dados de campo.
- [Google Search Central — JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=pt-BR) — pré-renderização, descoberta de links e status HTTP.

### 17.3 Avisos de metodologia

- A fonte jurídica e os padrões são referências; aplicação ao caso concreto pode exigir orientação especializada.
- Descrições de cenários e novas mecânicas são **briefings autorais a implementar**, não prova de assets já existentes.
- As estatísticas e URLs profissionais do site devem ser recuperadas/validadas no repositório/deploy no momento da implementação; não congelar números de eventos, estrelas ou países no roteiro visual.
- Este dossiê é a **especificação de produto/engenharia para começar**, não um atestado de auditoria E2E concluída nem uma autorização para publicar sem gates.

---

**Registro final de escopo:** o resultado pretendido é um portfólio que represente a própria Glaucia — uma experiência autoral, vibrante e tecnicamente criteriosa, cuja história e seus easter eggs reforcem (não substituam) a evidência da sua engenharia, liderança e atuação internacional.

---

## 18. Contrato de produção de assets: Grok Image → Devin (NOVO)

### 18.1 Quantidade, sequência e economia de retrabalho

O **mínimo de produção proposto** é **31 imagens-fonte/prompt**: 3 masters (`GE-MASTER-GL`, `GE-MASTER-DOG`, `GE-MASTER-SHIP`), 7 placas sem personagem (`GE-PL-01` a `07`), 7 pose sheets de Glaucia (`GE-GL-01` a `07`), 7 pose sheets do cachorro (`GE-DOG-01` a `07`) e 7 sheets de props/hotspots (`GE-PROP-01` a `07`). Cada *pose sheet* é uma imagem-fonte da qual podem ser exportados diversos sprites; isso **não garante** que o modelo produza quadros consistentes em uma tentativa. As seções 19.5 e 19.6 trazem **3 imagens opcionais**, reparos e iterações.

**Ordem recomendada:** primeiro masters (com fotos pessoais autorizadas) e **um piloto Terra** (`PL-01`, `GL-01`, `DOG-01`, `PROP-01`). Enquanto isso, Devin desenvolve P0/P1 sem dependências visuais. Validar pixel art/sprite alignment e interações no preview antes de pedir as outras 24 imagens-fonte. Produzir os 6 mundos restantes em lotes de 1–2, não em uma única tentativa massiva.

**Devin não tem obrigação de chamar Grok Image** e não deve pressupor integração/credenciais. A proprietária usa a interface do Grok Image ou uma API autorizada, baixa os resultados e entrega os PNGs aprovados a Devin. Sem fotos: gerar **placas, nave e props**, mas não inventar traços da pessoa nem raça/pelagem do cão.

### 18.2 Parâmetros e qualidade de saída (verificar disponibilidade no Grok usado)

| Categoria | Instrução | Observação |
|---|---|---|
| Placas de fundo | 16:9, qualidade mais alta disponível, preferir 2K | O alvo lógico web será 1280×720, mas **não se deve distorcer** a saída caso o formato nativo seja diferente |
| Character sheets / prop sheets | 1:1 ou 4:3, qualidade alta | Quatro vistas/poses separadas, escala idêntica e chão comum; cortar quadros em etapa posterior |
| Referências | Usar exclusivamente fotos autorizadas, master aprovado e placa original | A API Imagine suporta múltiplas referências, mas a capacidade da UI pode variar; validar seu fluxo antes de depender disso |
| Arestas | Pixels quadrados e nítidos, shading por blocos controlados | Não aceitar soft focus, airbrush ou sensação de pintura digital borrada |
| Transparência | Pedir PNG com alpha verdadeiro; validar canal alpha | Se o Grok não entregar alpha, usar chroma sólido de cor ausente do personagem e recortar/limpar manualmente |
| Arte base | **Sem títulos, letras, logos, UI, legendas ou diálogos** | Todo texto permanece HTML acessível e localizável |
| Coreografia | Personagens, objetos animáveis e FX **em camadas diferentes** | Grok gera quadros estáticos; Devin cria animação com sprites, CSS/SVG, event handlers e lifecycles |
| Export | Salvar cada imagem-fonte com ID e hash no ledger | Registrar prompt completo, referências, tamanho, data, revisões e aprovação |

**Sobre recursos atuais:** xAI documenta `grok-imagine-image-2.0`, geração e edição, proporções configuráveis, resolução 1K/2K e edição com até cinco imagens de referência na API. Isso não significa que todos os controles estarão disponíveis no Grok Image de interface gráfica. As instruções abaixo são independentes do SDK. Referências oficiais: https://docs.x.ai/developers/model-capabilities/imagine e https://docs.x.ai/developers/model-capabilities/images/prompting-guide .

**Dados pessoais:** fotografias de Glaucia e do cachorro usadas como referência não devem ser publicadas no repositório sem consentimento específico, nem colocadas em URLs abertas. Usar upload privado na ferramenta escolhida; se for utilizar o serviço xAI, conferir as opções atuais de dados e privacidade antes de enviar fotos.

### 18.3 Identidade visual invariável

- **Plano 16:9 integral:** background cobre todo o hero. A **zona esquerda aproximada x=0–47%** deve estar menos ocupada, com tonalidade mais escura e apropriada à sobreposição de texto. **O conteúdo HTML é posicionado pelo site, não desenhado pelo Grok.**
- **Personagens no lado direito:** personagem principal em x≈68–86%, cachorro em x≈82–94%; ambos apoiados numa superfície coerente, nunca flutuando arbitrariamente. Esses percentuais são guias de prompt **e devem ser validados no browser**. Em mobile, layout próprio preserva os atores, em vez de usar apenas crop.
- **Originalidade:** roupas, tecnologias, naves, cenários, logotipos e silhuetas não podem imitar personagens/veículos de Star Wars nem composições de *Project Hail Mary*. As referências são inspiração de escala, luz e variedade cromática, não base de imagem.
- **Consistência:** mestre do rosto/cabelo, cachorro (cor/orelhas/pelagem), nave (silhueta/cores), escala e direção de luz aprovados são preservados em todos os destinos. Cada bioma tem cromia única.
- **Padrão de atuação:** no mínimo `idle`, `blink` (pode ser derivado da arte aprovada), `interact`, `react` por personagem conforme a cena; props com estados idle/ativado; easter egg reprodutível por pointer, touch e keyboard.

### 18.4 Manifest de produção e paths candidatos

| ID | Rota | Cena | Background Grok | Glaucia atlas | Cachorro atlas | Props sheet |
|---|---|---|---|---|---|---|
| 01 | `/[lang]` | Observatório das Primeiras Luzes | `GE-PL-01` | `GE-GL-01` | `GE-DOG-01` | `GE-PROP-01` |
| 02 | `/[lang]/sobre` | Nivéora — Mundo das Auroras | `GE-PL-02` | `GE-GL-02` | `GE-DOG-02` | `GE-PROP-02` |
| 03 | `/[lang]/projetos` | Marte — Vale das Invenções | `GE-PL-03` | `GE-GL-03` | `GE-DOG-03` | `GE-PROP-03` |
| 04 | `/[lang]/conteudo` | Lúmina — Biblioteca Viva | `GE-PL-04` | `GE-GL-04` | `GE-DOG-04` | `GE-PROP-04` |
| 05 | `/[lang]/eventos` | Atlas das Conexões | `GE-PL-05` | `GE-GL-05` | `GE-DOG-05` | `GE-PROP-05` |
| 06 | `/[lang]/servicos` | Aurélia — Jardins Suspensos | `GE-PL-06` | `GE-GL-06` | `GE-DOG-06` | `GE-PROP-06` |
| 07 | `404` | Maré Rubra — Coordenadas Perdidas | `GE-PL-07` | `GE-GL-07` | `GE-DOG-07` | `GE-PROP-07` |


**Estrutura de arquivos proposta** (não existente até Devin criar/receber os assets):

```text
docs/art/galaxia-encantada/
  manifest.json                    # ID, caminho, estado, prompt, proveniência, hash, dimensões, aprovação
  prompts/                         # Opcional: cópias dos prompts deste documento
  approved-source/                 # Somente fontes geradas aprovadas; sem fotos pessoais brutas
public/galaxia/
  scenes/<scene-id>/background.webp
  actors/glaucia/<scene-id>/idle.webp, interact.webp, react.webp, blink.webp
  actors/dog/<scene-id>/idle.webp, interact.webp, react.webp
  props/<scene-id>/*.webp
  ship/*.webp
```

O `manifest.json` é um contrato de rastreabilidade, **não uma lista de imagens presumidamente geradas**. Propor estes campos: `id`, `status` (`requested|generated|approved|rejected|integrated`), `file`, `sceneId`, `sourcePrompt`, `referenceAssets`, `nativeWidth`, `nativeHeight`, `format`, `sha256`, `generationDate`, `reviewer`, `approvalDate`, `notes`. O `sourcePrompt` pode ser o ID da seção 19 + cópia versionada do texto. Nunca expor fotos pessoais como `referenceAssets` publicáveis: salvar apenas identificação privada não resolvível publicamente.

**Regra de integração:** quando a saída do Grok vier com pose inconsistente, sombra incorporada, bordas sujas, baixa legibilidade ou geometria quebrada, marque `rejected`/`needs-edit` e gere/edite novamente. Não use uma imagem defeituosa apenas para marcar a tarefa como concluída. Recortes precisam ser verificados em dimensões reais; `image-rendering:pixelated` não corrige pixel art de baixa qualidade.

## 19. PROMPTS GROK IMAGE — TODOS PRONTOS PARA COPIAR (NOVO)

**Uso:** abrir Grok Image/Imagine, fornecer os arquivos de referência indicados para o prompt, colar **somente o bloco em inglês** e gerar. Selecionar a proporção indicada quando o recurso estiver disponível. Cada bloco contém diretrizes completas, para funcionar sem concatenação de “prompt-base”. Não enviar frames ou personagens de Star Wars ao gerador; as imagens legadas serviram para análise interna de **layout**, não como origem visual para um resultado derivativo. Não usar frames de *Project Hail Mary* para image-to-image.

**Critérios universais de rejeição:** personagem parecido com franquia, rosto/pelagem inconsistente, cartoon 3D, blur, texto inventado, mão com dedos extras, personagem flutuando, borda direita cortada, lado esquerdo poluído, objeto que deveria animar preso ao fundo, sprites com poses em escala diferente e imagens com marcas d'água.

### 19.1 Os três masters — gerar/validar ANTES dos atores por cena

#### GE-MASTER-GL — Glaucia — identidade canônica

**Arquivo-fonte:** `glaucia-master-sheet.png` · **Formato:** 1:1 ou 4:3, alta resolução.

**Insumos:** Referências necessárias: 2–3 fotografias pessoais autorizadas de Glaucia (rosto frontal/3/4 e corpo inteiro, se disponíveis). Sem essas fotos, NÃO gerar um rosto genérico como definitivo.

```text
Create a premium original 2D pixel art CHARACTER REFERENCE SHEET of the exact adult woman in the attached authorized personal photographs. Preserve recognizable face geometry, complexion, hairstyle, eyes, proportions and distinguishing features from those photographs; do not beautify, de-age or change her identity. Depict a professional aerospace engineer and technology leader, confident, warm and intelligent. Use sophisticated 16-bit-inspired pixel art with deliberate clusters of crisp square pixels, subtle controlled 32-bit era color depth, strong readable silhouette and consistent natural anatomy. Render FOUR full-body views in aligned separate panels on one uniform solid chroma-key background (pure #FF00FF, used nowhere in clothing): front, 3/4, side, rear. Neutral expedition jacket in graphite teal with coral detail and functional dark trousers, practical boots. Add a small face-expression row: neutral smile, blink, thoughtful, curious. Every view depicts the SAME real woman, constant face/hair/height/body and non-chibi realistic proportions adapted to pixel art. Uniform scale and same feet baseline within each full-body view, no perspective distortion. Lighting simple and uniform, no scenery, no cast shadows beyond a tiny removable grounding reference. No logos, lettering, typographic annotations, brand marks, costumes or silhouettes recognizable from existing sci-fi intellectual property. Output a clean high-resolution sprite-authoring master image, 1:1 or 4:3. Hard pixel edges only; no airbrush, vector smoothness, 3D render, photorealism or blurry antialiasing.
```

#### GE-MASTER-DOG — Cachorrinho — identidade canônica

**Arquivo-fonte:** `dog-master-sheet.png` · **Formato:** 1:1 ou 4:3, alta resolução.

**Insumos:** Referências necessárias: 2–3 fotografias autorizadas do cachorro mostrando rosto, corpo/pelagem e perfil. Não presumir raça, cor nem tamanho.

```text
Create a premium ORIGINAL 2D PIXEL ART DOG CHARACTER REFERENCE SHEET using ONLY the attached authorized photos of the actual family dog. Preserve its exact recognizable breed/mix appearance, muzzle geometry, ear shapes, eye placement, coat colors, patches, fur length, tail shape and proportions. Do not replace it with a generic puppy or anthropomorphic mascot. Sophisticated 16-bit-inspired pixel art, elegant readable clusters, crisp square pixel borders and subtly shaded real fur. Render FOUR aligned panels at a consistent scale: frontal standing, side standing, 3/4 sitting, looking up curiously. Include three compact facial expressions: idle, excited, inquisitive. Add a simple original lightweight teal/coral explorer harness in one reference panel, removable in the other poses; this is a real-looking dog, not a humanoid. Every pose retains the same exact dog identity. Solid pure chroma-key #FF00FF backdrop (never on dog/harness), no background, no scenery, no floor texture, no readable text, no logo. Keep full body and tail inside frame, with no clipping and consistent paws baseline. Suitable for cut-out sprites and later animation. Aspect ratio 1:1 or 4:3. No blurred edges, painterly lighting, excessive cute chibi exaggeration, famous movie creature likeness or fictional canine replacement.
```

#### GE-MASTER-SHIP — Nave — silhueta e vistas originais

**Arquivo-fonte:** `ship-master-sheet.png` · **Formato:** 1:1 ou 4:3, alta resolução.

**Insumos:** Referências necessárias: nenhuma franquia; pode usar uma paleta aprovada da Galáxia Encantada, mas não fotos/frames de filmes.

```text
Design an entirely ORIGINAL one-of-a-kind civilian scientific exploration spacecraft for an award-quality 2D PIXEL ART adventure portfolio called Galáxia Encantada. Its silhouette must be recognizably new and distinct from famous film spacecraft: an elongated petal-shaped expedition hull, asymmetrically offset small transparent scientific observatory dome, two slim separate nacelles mounted below the hull, a narrow luminous teal navigation ring around a non-circular midsection and subtle coral/gold identifiers expressed as geometry only, not text. The craft must look safe, livable and plausible as a far-future research ship, capable of orbital travel and landing in stylized fictional worlds. Create FOUR views of the SAME ship: precise side profile, front three-quarter, top-down and small distant silhouette for a hero background. Keep all engineering details and color scheme consistent: pearl graphite, deep navy, cyan-teal propulsion, coral navigation lights. Render on plain solid pure chroma-key #FF00FF background with consistent pixel scale, crisp square pixels, no motion blur, no cast shadows, no typography/logos/watermarks. 1:1 or 4:3 character-model-sheet layout, isolated views clearly spaced for individual extraction. No X-shaped fighter wings, saucer freighter shape, huge triangular star destroyer body, recognizable space-opera spacecraft or matching shot from any existing movie.
```

### 19.2 Sete background plates (7 prompts) — SEM personagens

**Referências:** inicialmente nenhuma imagem de franquia. Se estiver editando uma versão gerada aqui, use apenas a própria placa aprovada. Para criar fundos sem personagens, gerar direto um environment plate **sem Glaucia, cachorro, nave interativa, palavras ou objetos animáveis destacados**. O Grok não deve incorporar as poses nas placas. Cada placa é a camada estática de cenário do `HeroScene`, e os protagonistas serão compostos via React/CSS com sprites independentes. **Ratio: 16:9**.

#### GE-PL-01 — Home: Observatório das Primeiras Luzes

**Arquivo-fonte:** `GE-PL-01-earth-observatory.png` → web: `public/galaxia/scenes/earth-observatory/background.webp`  
**Anexos no Grok:** nenhum na primeira geração; nas revisões, somente esta própria arte.

```text
Create an ORIGINAL cinematic 2D PIXEL ART BACKGROUND PLATE for a premium software engineer portfolio page: Observatório das Primeiras Luzes (Terra). SCENE DESIGN: An original high-altitude Earth observatory complex on a lush coastal mountain ridge at blue hour. A futuristic telescope platform on the RIGHT, suspended lanterns with warm amber light, distant unique spacecraft hangar on a ridge to the far right, distant coast and layered mountains. A spectacular vast sky with turquoise and pink-green aurora ribbons, stars of varied intensity, and physically coherent clouds. Original botanic flora, delicate fireflies, foreground stone platform with open safe ground at x 62-93 percent for characters; a telescope mount with NO moving telescope, because the telescope will be a separate interactive sprite. Deep quiet negative space on the LEFT. COLOR DIRECTION: deep indigo #11172C, twilight violet #3B285B, luminous turquoise #41E6D5, aurora green #70E8A5, subtle golden amber #F5BF77. COMPOSITION CONTRACT: wide 16:9 landscape, full bleed. Keep the LEFT 0-47 percent visually quiet and slightly darker with low-detail shapes and gentle contrast so long HTML heading, professional copy and CTA buttons can be overlaid outside this picture. Keep the RIGHT 56-94 percent visually majestic and richly detailed; reserve natural free ground near the lower-right for two independently composited actors and clickable props. The strongest focal details are on the right and do not interfere with the first 47 percent. Framing is a steady medium-wide cinematic scene with far, mid and near layers, distinct parallaxable elements and clear foreground silhouette. ART QUALITY: handcrafted refined 16-bit/32-bit era game background with precise integer-like pixel clusters, sophisticated shading, readable terrain textures and deliberately crisp edges; vivid bioluminescence and atmospheric depth where relevant. NOT smooth illustration, NOT blurry pixelation filter, NOT voxel 3D, NOT an image of a video-game screenshot with UI. STRICT PROHIBITIONS: absolutely NO characters, NO people, NO dogs, NO spaceships foreground, NO key interactive prop in front of the standing area, NO words, NO pseudo-text, NO logos, NO HUD, NO titles, NO watermarks, NO Star Wars iconography, NO copied film compositions. This is a CLEAN BACKGROUND PLATE that must remain compatible with overlay animation layers. Output one widescreen 16:9 image, preferably high-resolution 2K.
```

#### GE-PL-02 — Sobre: Nivéora — Mundo das Auroras

**Arquivo-fonte:** `GE-PL-02-niveora.png` → web: `public/galaxia/scenes/niveora/background.webp`  
**Anexos no Grok:** nenhum na primeira geração; nas revisões, somente esta própria arte.

```text
Create an ORIGINAL cinematic 2D PIXEL ART BACKGROUND PLATE for a premium software engineer portfolio page: Nivéora — Mundo das Auroras (Planeta fictício nevado). SCENE DESIGN: An original alien snow world with monumental jagged pale-blue ice mountains, a broad windswept valley, crystalline frozen waterfalls, an expedition shelter and research antennas unique in silhouette on the RIGHT, physically readable snowfall deposited over rock terraces. Dynamic-feeling glowing lavender and teal polar auroras span the night sky; faint pink light reflects on ice and snow. The LEFT is darker, with broad atmospheric snow-covered low relief and sky as quiet copy-safe area. Include a firm snow platform in lower RIGHT where two characters could stand. Do not include artificial footprints; tracks are later interactive overlays. COLOR DIRECTION: midnight blue #0D2342, glacier blue #88CBE9, vivid arctic cyan #55E9E8, lavender #B89DFC, soft pink aurora #F3A5D8. COMPOSITION CONTRACT: wide 16:9 landscape, full bleed. Keep the LEFT 0-47 percent visually quiet and slightly darker with low-detail shapes and gentle contrast so long HTML heading, professional copy and CTA buttons can be overlaid outside this picture. Keep the RIGHT 56-94 percent visually majestic and richly detailed; reserve natural free ground near the lower-right for two independently composited actors and clickable props. The strongest focal details are on the right and do not interfere with the first 47 percent. Framing is a steady medium-wide cinematic scene with far, mid and near layers, distinct parallaxable elements and clear foreground silhouette. ART QUALITY: handcrafted refined 16-bit/32-bit era game background with precise integer-like pixel clusters, sophisticated shading, readable terrain textures and deliberately crisp edges; vivid bioluminescence and atmospheric depth where relevant. NOT smooth illustration, NOT blurry pixelation filter, NOT voxel 3D, NOT an image of a video-game screenshot with UI. STRICT PROHIBITIONS: absolutely NO characters, NO people, NO dogs, NO spaceships foreground, NO key interactive prop in front of the standing area, NO words, NO pseudo-text, NO logos, NO HUD, NO titles, NO watermarks, NO Star Wars iconography, NO copied film compositions. This is a CLEAN BACKGROUND PLATE that must remain compatible with overlay animation layers. Output one widescreen 16:9 image, preferably high-resolution 2K.
```

#### GE-PL-03 — Projetos: Marte — Vale das Invenções

**Arquivo-fonte:** `GE-PL-03-mars-lab.png` → web: `public/galaxia/scenes/mars-lab/background.webp`  
**Anexos no Grok:** nenhum na primeira geração; nas revisões, somente esta própria arte.

```text
Create an ORIGINAL cinematic 2D PIXEL ART BACKGROUND PLATE for a premium software engineer portfolio page: Marte — Vale das Invenções (Marte). SCENE DESIGN: Wide original Martian engineering valley: layered mineral red canyons, dry dust, distant volcanic ridges and a modular human research installation on RIGHT with visually unique domes and scientific instruments. Low-profile photovoltaic arrays and antennas. Coherent amber late-afternoon sunlight and faint cyan emission in equipment windows, fine dust in the air; sandy quiet LEFT with darker orange haze behind text. Solid rocky ground shelf on lower RIGHT for the explorers and an empty parking pad for rover sprite. Realistic Mars natural terrain with fictional but non-iconic technology; no twin suns. COLOR DIRECTION: iron red #743A31, warm rust #BD5632, copper #D27A43, golden orange #F3AE62, contrasting cyan #42CFE0. COMPOSITION CONTRACT: wide 16:9 landscape, full bleed. Keep the LEFT 0-47 percent visually quiet and slightly darker with low-detail shapes and gentle contrast so long HTML heading, professional copy and CTA buttons can be overlaid outside this picture. Keep the RIGHT 56-94 percent visually majestic and richly detailed; reserve natural free ground near the lower-right for two independently composited actors and clickable props. The strongest focal details are on the right and do not interfere with the first 47 percent. Framing is a steady medium-wide cinematic scene with far, mid and near layers, distinct parallaxable elements and clear foreground silhouette. ART QUALITY: handcrafted refined 16-bit/32-bit era game background with precise integer-like pixel clusters, sophisticated shading, readable terrain textures and deliberately crisp edges; vivid bioluminescence and atmospheric depth where relevant. NOT smooth illustration, NOT blurry pixelation filter, NOT voxel 3D, NOT an image of a video-game screenshot with UI. STRICT PROHIBITIONS: absolutely NO characters, NO people, NO dogs, NO spaceships foreground, NO key interactive prop in front of the standing area, NO words, NO pseudo-text, NO logos, NO HUD, NO titles, NO watermarks, NO Star Wars iconography, NO copied film compositions. This is a CLEAN BACKGROUND PLATE that must remain compatible with overlay animation layers. Output one widescreen 16:9 image, preferably high-resolution 2K.
```

#### GE-PL-04 — Conteúdo: Lúmina — Biblioteca Viva

**Arquivo-fonte:** `GE-PL-04-lumina.png` → web: `public/galaxia/scenes/lumina/background.webp`  
**Anexos no Grok:** nenhum na primeira geração; nas revisões, somente esta própria arte.

```text
Create an ORIGINAL cinematic 2D PIXEL ART BACKGROUND PLATE for a premium software engineer portfolio page: Lúmina — Biblioteca Viva (Planeta cristalino fictício). SCENE DESIGN: A wholly original alien library grown through monumental translucent mineral arches and bioluminescent trees. Beautiful layered crystal formations and an illuminated river, suspended original geometric glass bridges, a few carefully spaced book vaults carved into luminous stone on the RIGHT. The LEFT has deep-violet foliage silhouettes and subdued star-lit mist for legible text; vivid color contrast lives primarily on the RIGHT. A small level crystal terrace lower RIGHT provides clear standing area. Fantasy science with sophisticated visual logic; absolutely no recognizable fantasy-film architecture. COLOR DIRECTION: deep aubergine #221435, crystal pink #E474C7, electric purple #AA78F4, luminous cyan #53E0E8, opaline white #F7E6FF. COMPOSITION CONTRACT: wide 16:9 landscape, full bleed. Keep the LEFT 0-47 percent visually quiet and slightly darker with low-detail shapes and gentle contrast so long HTML heading, professional copy and CTA buttons can be overlaid outside this picture. Keep the RIGHT 56-94 percent visually majestic and richly detailed; reserve natural free ground near the lower-right for two independently composited actors and clickable props. The strongest focal details are on the right and do not interfere with the first 47 percent. Framing is a steady medium-wide cinematic scene with far, mid and near layers, distinct parallaxable elements and clear foreground silhouette. ART QUALITY: handcrafted refined 16-bit/32-bit era game background with precise integer-like pixel clusters, sophisticated shading, readable terrain textures and deliberately crisp edges; vivid bioluminescence and atmospheric depth where relevant. NOT smooth illustration, NOT blurry pixelation filter, NOT voxel 3D, NOT an image of a video-game screenshot with UI. STRICT PROHIBITIONS: absolutely NO characters, NO people, NO dogs, NO spaceships foreground, NO key interactive prop in front of the standing area, NO words, NO pseudo-text, NO logos, NO HUD, NO titles, NO watermarks, NO Star Wars iconography, NO copied film compositions. This is a CLEAN BACKGROUND PLATE that must remain compatible with overlay animation layers. Output one widescreen 16:9 image, preferably high-resolution 2K.
```

#### GE-PL-05 — Eventos: Atlas das Conexões

**Arquivo-fonte:** `GE-PL-05-earth-orbit.png` → web: `public/galaxia/scenes/earth-orbit/background.webp`  
**Anexos no Grok:** nenhum na primeira geração; nas revisões, somente esta própria arte.

```text
Create an ORIGINAL cinematic 2D PIXEL ART BACKGROUND PLATE for a premium software engineer portfolio page: Atlas das Conexões (Órbita da Terra). SCENE DESIGN: Interior of a completely original small expedition ship navigation observatory. Sweeping panoramic window to the RIGHT frames a huge, awe-inspiring realistic-looking Earth in blue and white pixel art from orbit, stars, delicate auroral band on horizon, subtle nebula coloration. Curving ergonomic railings with original geometry in foreground, lower-right platform for explorers, open uncluttered zone LEFT with subdued dark spacecraft wall and no readable displays. Leave one empty central-right circular projection plinth so the REAL interactive globe can be rendered later in WebGL/Canvas/HTML, not drawn into the background. COLOR DIRECTION: near-black space #071022, cobalt #205FAD, bright cyan #4BDFFF, turquoise #50DDBF, signal gold #F7C36C. COMPOSITION CONTRACT: wide 16:9 landscape, full bleed. Keep the LEFT 0-47 percent visually quiet and slightly darker with low-detail shapes and gentle contrast so long HTML heading, professional copy and CTA buttons can be overlaid outside this picture. Keep the RIGHT 56-94 percent visually majestic and richly detailed; reserve natural free ground near the lower-right for two independently composited actors and clickable props. The strongest focal details are on the right and do not interfere with the first 47 percent. Framing is a steady medium-wide cinematic scene with far, mid and near layers, distinct parallaxable elements and clear foreground silhouette. ART QUALITY: handcrafted refined 16-bit/32-bit era game background with precise integer-like pixel clusters, sophisticated shading, readable terrain textures and deliberately crisp edges; vivid bioluminescence and atmospheric depth where relevant. NOT smooth illustration, NOT blurry pixelation filter, NOT voxel 3D, NOT an image of a video-game screenshot with UI. STRICT PROHIBITIONS: absolutely NO characters, NO people, NO dogs, NO spaceships foreground, NO key interactive prop in front of the standing area, NO words, NO pseudo-text, NO logos, NO HUD, NO titles, NO watermarks, NO Star Wars iconography, NO copied film compositions. This is a CLEAN BACKGROUND PLATE that must remain compatible with overlay animation layers. Output one widescreen 16:9 image, preferably high-resolution 2K.
```

#### GE-PL-06 — Serviços: Aurélia — Jardins Suspensos

**Arquivo-fonte:** `GE-PL-06-aurelia.png` → web: `public/galaxia/scenes/aurelia/background.webp`  
**Anexos no Grok:** nenhum na primeira geração; nas revisões, somente esta própria arte.

```text
Create an ORIGINAL cinematic 2D PIXEL ART BACKGROUND PLATE for a premium software engineer portfolio page: Aurélia — Jardins Suspensos (Estação-jardim orbital fictícia). SCENE DESIGN: An entirely original orbiting botanical collaboration station with suspended luminous hanging gardens, flowing glass walkways and intricate hydroponic terraces on RIGHT. Immense panoramic view of a uniquely invented turquoise planet with graceful thin rings in the distance. Warm coral highlights, mint vegetation, pink reflections and softly animated-feeling water features; peaceful technologically refined greenhouse architecture. Keep dark teal tranquil organic negative space on the LEFT for text and contact CTA. Wide stable deck on lower RIGHT, with empty spot for a small original communication terminal sprite. COLOR DIRECTION: deep teal #113A48, botanical mint #8FE9BC, warm coral #F49D86, rose pink #F6B2CC, soft celestial blue #86D6EF. COMPOSITION CONTRACT: wide 16:9 landscape, full bleed. Keep the LEFT 0-47 percent visually quiet and slightly darker with low-detail shapes and gentle contrast so long HTML heading, professional copy and CTA buttons can be overlaid outside this picture. Keep the RIGHT 56-94 percent visually majestic and richly detailed; reserve natural free ground near the lower-right for two independently composited actors and clickable props. The strongest focal details are on the right and do not interfere with the first 47 percent. Framing is a steady medium-wide cinematic scene with far, mid and near layers, distinct parallaxable elements and clear foreground silhouette. ART QUALITY: handcrafted refined 16-bit/32-bit era game background with precise integer-like pixel clusters, sophisticated shading, readable terrain textures and deliberately crisp edges; vivid bioluminescence and atmospheric depth where relevant. NOT smooth illustration, NOT blurry pixelation filter, NOT voxel 3D, NOT an image of a video-game screenshot with UI. STRICT PROHIBITIONS: absolutely NO characters, NO people, NO dogs, NO spaceships foreground, NO key interactive prop in front of the standing area, NO words, NO pseudo-text, NO logos, NO HUD, NO titles, NO watermarks, NO Star Wars iconography, NO copied film compositions. This is a CLEAN BACKGROUND PLATE that must remain compatible with overlay animation layers. Output one widescreen 16:9 image, preferably high-resolution 2K.
```

#### GE-PL-07 — 404: Maré Rubra — Coordenadas Perdidas

**Arquivo-fonte:** `GE-PL-07-red-tide.png` → web: `public/galaxia/scenes/red-tide/background.webp`  
**Anexos no Grok:** nenhum na primeira geração; nas revisões, somente esta própria arte.

```text
Create an ORIGINAL cinematic 2D PIXEL ART BACKGROUND PLATE for a premium software engineer portfolio page: Maré Rubra — Coordenadas Perdidas (Fenômeno cósmico fictício). SCENE DESIGN: Inside an original expedition spacecraft at the boundary of an immense invented cosmic dust and ionized gas field. Through an immense RIGHT viewport, elegant enormous undulating coral-red luminous ribbons and thousands of tiny glowing particles reveal epic depth; avoid resembling a particular movie frame. The interior lower-right navigation console appears with blank dark screens, subtle red alert reflections, sturdy walkable floor for two separate sprite actors. Maintain the LEFT as low-brightness dark maroon-black negative space with a calm sparse star background for the 404 copy; no visual obstruction. Remarkable sense of scale and quiet wonder, not a disaster or explosion. COLOR DIRECTION: near black #0D0612, plasma crimson #9B2E48, coral glow #F07072, hot rose #F6A0A5, ember gold #FFBC78. COMPOSITION CONTRACT: wide 16:9 landscape, full bleed. Keep the LEFT 0-47 percent visually quiet and slightly darker with low-detail shapes and gentle contrast so long HTML heading, professional copy and CTA buttons can be overlaid outside this picture. Keep the RIGHT 56-94 percent visually majestic and richly detailed; reserve natural free ground near the lower-right for two independently composited actors and clickable props. The strongest focal details are on the right and do not interfere with the first 47 percent. Framing is a steady medium-wide cinematic scene with far, mid and near layers, distinct parallaxable elements and clear foreground silhouette. ART QUALITY: handcrafted refined 16-bit/32-bit era game background with precise integer-like pixel clusters, sophisticated shading, readable terrain textures and deliberately crisp edges; vivid bioluminescence and atmospheric depth where relevant. NOT smooth illustration, NOT blurry pixelation filter, NOT voxel 3D, NOT an image of a video-game screenshot with UI. STRICT PROHIBITIONS: absolutely NO characters, NO people, NO dogs, NO spaceships foreground, NO key interactive prop in front of the standing area, NO words, NO pseudo-text, NO logos, NO HUD, NO titles, NO watermarks, NO Star Wars iconography, NO copied film compositions. This is a CLEAN BACKGROUND PLATE that must remain compatible with overlay animation layers. Output one widescreen 16:9 image, preferably high-resolution 2K.
```

### 19.3 Sete pose sheets de Glaucia (7 prompts)

**Pré-requisito:** `GE-MASTER-GL` aprovado, fotografias **privadas e autorizadas** se necessário, e `GE-PL-NN` correspondente. Usar ambos como referência **de identidade/iluminação**, mas não aceitar fundo embutido. Pedir quatro quadros (`idle`, `blink`, `interact`, `react`) com mesmo pé/base/escala. Mesmo que Grok retorne sprite sheet, a equipe deve conferir quadros individualmente; se não conseguir consistência, gerar/reparar poses uma a uma por edição sobre `idle`, com prompts de reparo ao final.

#### GE-GL-01 — Glaucia em Observatório das Primeiras Luzes

**Arquivo-fonte:** `GE-GL-01-earth-observatory.png` → web: `public/galaxia/actors/glaucia/earth-observatory/...`  
**Anexos no Grok:** fotos privadas autorizadas (se necessárias), `GE-MASTER-GL` aprovado e `GE-PL-01`.

```text
Create a four-pose, production-ready 2D PIXEL ART ACTOR SPRITE SHEET for GLÁUCIA, using the approved Glaucia master character image and her authorized personal reference photographs provided alongside this request. The CHARACTER IDENTITY MUST BE EXACTLY THE SAME woman in all panels and the approved master: face, hair, complexion, adult proportions, body height and features must not drift. Page world: Observatório das Primeiras Luzes (Terra). COSTUME: Contemporary Earth aerospace engineer-explorer: dark teal utilitarian jacket with amber stitching, practical trousers, dark hiking boots, small astronomy patch shaped as an original abstract four-point star. No helmet. Glaucia looks toward a telescope and can point to the sky. ACTION CONTEXT: turn the telescope toward one star; dog sniffs an anomalous transmitter; engineered launch console glows and the ship departs off-screen. Create FOUR clean, equally sized full-body panels, left to right: (1) idle with relaxed natural standing pose, (2) blink with same exact pose and closed eyes for a minimal blink overlay, (3) a clearly different but physically coherent interaction gesture appropriate for the scene, (4) a reaction/success gesture appropriate for the easter egg. Every pose with identical character scale, feet anchored on the SAME vertical baseline and facing mostly left or three-quarter-left (toward the HTML text) while the character is placed at the RIGHT side of the website scene. Keep complete extremities, hands and boots within each separate panel, enough margin for a sprite slicer. LIGHTING: match environmental light direction of the approved Observatório das Primeiras Luzes plate; do not paint ground or background onto character. Colors coordinated with deep indigo #11172C, twilight violet #3B285B, luminous turquoise #41E6D5, aurora green #70E8A5, subtle golden amber #F5BF77. STYLE: refined premium hand-crafted pixel art, crisp square pixel edges, logical clothing folds, readable face, no 3D, no airbrush, no excessive smoothing. Transparent PNG alpha if reliably supported, otherwise EXACT uniform pure #FF00FF chroma background that is absent from the character palette. Strictly NO scene/background, no floor, no shadow halos, no text or labels, no UI, no logos, no known sci-fi franchise props, no weapons. Sheet aspect ratio 4:3 or 1:1; high resolution for accurate cropping and alpha cleanup.
```

#### GE-GL-02 — Glaucia em Nivéora — Mundo das Auroras

**Arquivo-fonte:** `GE-GL-02-niveora.png` → web: `public/galaxia/actors/glaucia/niveora/...`  
**Anexos no Grok:** fotos privadas autorizadas (se necessárias), `GE-MASTER-GL` aprovado e `GE-PL-02`.

```text
Create a four-pose, production-ready 2D PIXEL ART ACTOR SPRITE SHEET for GLÁUCIA, using the approved Glaucia master character image and her authorized personal reference photographs provided alongside this request. The CHARACTER IDENTITY MUST BE EXACTLY THE SAME woman in all panels and the approved master: face, hair, complexion, adult proportions, body height and features must not drift. Page world: Nivéora — Mundo das Auroras (Planeta fictício nevado). COSTUME: Original insulated snow exploration parka with glacier-blue panels, violet hood, bright teal seam accents, weatherproof gloves, thermal boots, small clear-faced protective visor. Hair and facial identity must stay identifiable as approved master. Idle has visible breath; interaction kneels to inspect a capsule in ice. ACTION CONTEXT: dog tracks appear in snow; Glaucia uncovers personal career capsule; aurora intensifies for short dramatic beat; blizzard reversible and accessible. Create FOUR clean, equally sized full-body panels, left to right: (1) idle with relaxed natural standing pose, (2) blink with same exact pose and closed eyes for a minimal blink overlay, (3) a clearly different but physically coherent interaction gesture appropriate for the scene, (4) a reaction/success gesture appropriate for the easter egg. Every pose with identical character scale, feet anchored on the SAME vertical baseline and facing mostly left or three-quarter-left (toward the HTML text) while the character is placed at the RIGHT side of the website scene. Keep complete extremities, hands and boots within each separate panel, enough margin for a sprite slicer. LIGHTING: match environmental light direction of the approved Nivéora — Mundo das Auroras plate; do not paint ground or background onto character. Colors coordinated with midnight blue #0D2342, glacier blue #88CBE9, vivid arctic cyan #55E9E8, lavender #B89DFC, soft pink aurora #F3A5D8. STYLE: refined premium hand-crafted pixel art, crisp square pixel edges, logical clothing folds, readable face, no 3D, no airbrush, no excessive smoothing. Transparent PNG alpha if reliably supported, otherwise EXACT uniform pure #FF00FF chroma background that is absent from the character palette. Strictly NO scene/background, no floor, no shadow halos, no text or labels, no UI, no logos, no known sci-fi franchise props, no weapons. Sheet aspect ratio 4:3 or 1:1; high resolution for accurate cropping and alpha cleanup.
```

#### GE-GL-03 — Glaucia em Marte — Vale das Invenções

**Arquivo-fonte:** `GE-GL-03-mars-lab.png` → web: `public/galaxia/actors/glaucia/mars-lab/...`  
**Anexos no Grok:** fotos privadas autorizadas (se necessárias), `GE-MASTER-GL` aprovado e `GE-PL-03`.

```text
Create a four-pose, production-ready 2D PIXEL ART ACTOR SPRITE SHEET for GLÁUCIA, using the approved Glaucia master character image and her authorized personal reference photographs provided alongside this request. The CHARACTER IDENTITY MUST BE EXACTLY THE SAME woman in all panels and the approved master: face, hair, complexion, adult proportions, body height and features must not drift. Page world: Marte — Vale das Invenções (Marte). COSTUME: Mars EVA exploration suit designed for mobility: copper and cream panels, dark graphite joints, cyan status diodes; clear bubble visor through which Glaucia face/hair identity remains visible. Scientific wrist controller for a little rover. Boots anchored on red rock. ACTION CONTEXT: Glaucia remotely directs rover; rover scans, dust disperses to reveal real project link as HTML overlay; dog indicates research sample; terminal displays actual GitHub data. Create FOUR clean, equally sized full-body panels, left to right: (1) idle with relaxed natural standing pose, (2) blink with same exact pose and closed eyes for a minimal blink overlay, (3) a clearly different but physically coherent interaction gesture appropriate for the scene, (4) a reaction/success gesture appropriate for the easter egg. Every pose with identical character scale, feet anchored on the SAME vertical baseline and facing mostly left or three-quarter-left (toward the HTML text) while the character is placed at the RIGHT side of the website scene. Keep complete extremities, hands and boots within each separate panel, enough margin for a sprite slicer. LIGHTING: match environmental light direction of the approved Marte — Vale das Invenções plate; do not paint ground or background onto character. Colors coordinated with iron red #743A31, warm rust #BD5632, copper #D27A43, golden orange #F3AE62, contrasting cyan #42CFE0. STYLE: refined premium hand-crafted pixel art, crisp square pixel edges, logical clothing folds, readable face, no 3D, no airbrush, no excessive smoothing. Transparent PNG alpha if reliably supported, otherwise EXACT uniform pure #FF00FF chroma background that is absent from the character palette. Strictly NO scene/background, no floor, no shadow halos, no text or labels, no UI, no logos, no known sci-fi franchise props, no weapons. Sheet aspect ratio 4:3 or 1:1; high resolution for accurate cropping and alpha cleanup.
```

#### GE-GL-04 — Glaucia em Lúmina — Biblioteca Viva

**Arquivo-fonte:** `GE-GL-04-lumina.png` → web: `public/galaxia/actors/glaucia/lumina/...`  
**Anexos no Grok:** fotos privadas autorizadas (se necessárias), `GE-MASTER-GL` aprovado e `GE-PL-04`.

```text
Create a four-pose, production-ready 2D PIXEL ART ACTOR SPRITE SHEET for GLÁUCIA, using the approved Glaucia master character image and her authorized personal reference photographs provided alongside this request. The CHARACTER IDENTITY MUST BE EXACTLY THE SAME woman in all panels and the approved master: face, hair, complexion, adult proportions, body height and features must not drift. Page world: Lúmina — Biblioteca Viva (Planeta cristalino fictício). COSTUME: Original knowledge explorer wardrobe: long asymmetric indigo field coat over practical violet suit, thin luminous cyan seam tracing, subtle wrist-mounted crystal scanner, sturdy boots. Glaucia identifiable by face/hair. Gesture reaches toward a floating crystal archive. ACTION CONTEXT: Glaucia touches crystal to reveal an actual article link; dog discovers secret passage; prismatic beams briefly align and unlock hidden archive. Create FOUR clean, equally sized full-body panels, left to right: (1) idle with relaxed natural standing pose, (2) blink with same exact pose and closed eyes for a minimal blink overlay, (3) a clearly different but physically coherent interaction gesture appropriate for the scene, (4) a reaction/success gesture appropriate for the easter egg. Every pose with identical character scale, feet anchored on the SAME vertical baseline and facing mostly left or three-quarter-left (toward the HTML text) while the character is placed at the RIGHT side of the website scene. Keep complete extremities, hands and boots within each separate panel, enough margin for a sprite slicer. LIGHTING: match environmental light direction of the approved Lúmina — Biblioteca Viva plate; do not paint ground or background onto character. Colors coordinated with deep aubergine #221435, crystal pink #E474C7, electric purple #AA78F4, luminous cyan #53E0E8, opaline white #F7E6FF. STYLE: refined premium hand-crafted pixel art, crisp square pixel edges, logical clothing folds, readable face, no 3D, no airbrush, no excessive smoothing. Transparent PNG alpha if reliably supported, otherwise EXACT uniform pure #FF00FF chroma background that is absent from the character palette. Strictly NO scene/background, no floor, no shadow halos, no text or labels, no UI, no logos, no known sci-fi franchise props, no weapons. Sheet aspect ratio 4:3 or 1:1; high resolution for accurate cropping and alpha cleanup.
```

#### GE-GL-05 — Glaucia em Atlas das Conexões

**Arquivo-fonte:** `GE-GL-05-earth-orbit.png` → web: `public/galaxia/actors/glaucia/earth-orbit/...`  
**Anexos no Grok:** fotos privadas autorizadas (se necessárias), `GE-MASTER-GL` aprovado e `GE-PL-05`.

```text
Create a four-pose, production-ready 2D PIXEL ART ACTOR SPRITE SHEET for GLÁUCIA, using the approved Glaucia master character image and her authorized personal reference photographs provided alongside this request. The CHARACTER IDENTITY MUST BE EXACTLY THE SAME woman in all panels and the approved master: face, hair, complexion, adult proportions, body height and features must not drift. Page world: Atlas das Conexões (Órbita da Terra). COSTUME: Original starship navigation uniform with navy jacket, gold stitch lines, teal utility wristband, dark trousers. No EVA helmet because cabin pressurized; Glaucia turns toward a projection plinth, identifiable face/hair. ACTION CONTEXT: Glaucia operates orbiting Earth data map; dog activates a factual event marker; constellations connect ONLY real recorded locations, and remote events are not mislabeled as trips. Create FOUR clean, equally sized full-body panels, left to right: (1) idle with relaxed natural standing pose, (2) blink with same exact pose and closed eyes for a minimal blink overlay, (3) a clearly different but physically coherent interaction gesture appropriate for the scene, (4) a reaction/success gesture appropriate for the easter egg. Every pose with identical character scale, feet anchored on the SAME vertical baseline and facing mostly left or three-quarter-left (toward the HTML text) while the character is placed at the RIGHT side of the website scene. Keep complete extremities, hands and boots within each separate panel, enough margin for a sprite slicer. LIGHTING: match environmental light direction of the approved Atlas das Conexões plate; do not paint ground or background onto character. Colors coordinated with near-black space #071022, cobalt #205FAD, bright cyan #4BDFFF, turquoise #50DDBF, signal gold #F7C36C. STYLE: refined premium hand-crafted pixel art, crisp square pixel edges, logical clothing folds, readable face, no 3D, no airbrush, no excessive smoothing. Transparent PNG alpha if reliably supported, otherwise EXACT uniform pure #FF00FF chroma background that is absent from the character palette. Strictly NO scene/background, no floor, no shadow halos, no text or labels, no UI, no logos, no known sci-fi franchise props, no weapons. Sheet aspect ratio 4:3 or 1:1; high resolution for accurate cropping and alpha cleanup.
```

#### GE-GL-06 — Glaucia em Aurélia — Jardins Suspensos

**Arquivo-fonte:** `GE-GL-06-aurelia.png` → web: `public/galaxia/actors/glaucia/aurelia/...`  
**Anexos no Grok:** fotos privadas autorizadas (se necessárias), `GE-MASTER-GL` aprovado e `GE-PL-06`.

```text
Create a four-pose, production-ready 2D PIXEL ART ACTOR SPRITE SHEET for GLÁUCIA, using the approved Glaucia master character image and her authorized personal reference photographs provided alongside this request. The CHARACTER IDENTITY MUST BE EXACTLY THE SAME woman in all panels and the approved master: face, hair, complexion, adult proportions, body height and features must not drift. Page world: Aurélia — Jardins Suspensos (Estação-jardim orbital fictícia). COSTUME: Glaucia as collaborative scientific explorer: elegant practical coral-lined navy coat, mint technology accents, neutral trousers, comfortable boots, original small comms wearable. Uncovered recognizable face and hair. ACTION CONTEXT: Glaucia receives a creative collaboration signal; dog triggers a tiny luminous bloom; interactive contact CTA highlights but never sends form automatically. Create FOUR clean, equally sized full-body panels, left to right: (1) idle with relaxed natural standing pose, (2) blink with same exact pose and closed eyes for a minimal blink overlay, (3) a clearly different but physically coherent interaction gesture appropriate for the scene, (4) a reaction/success gesture appropriate for the easter egg. Every pose with identical character scale, feet anchored on the SAME vertical baseline and facing mostly left or three-quarter-left (toward the HTML text) while the character is placed at the RIGHT side of the website scene. Keep complete extremities, hands and boots within each separate panel, enough margin for a sprite slicer. LIGHTING: match environmental light direction of the approved Aurélia — Jardins Suspensos plate; do not paint ground or background onto character. Colors coordinated with deep teal #113A48, botanical mint #8FE9BC, warm coral #F49D86, rose pink #F6B2CC, soft celestial blue #86D6EF. STYLE: refined premium hand-crafted pixel art, crisp square pixel edges, logical clothing folds, readable face, no 3D, no airbrush, no excessive smoothing. Transparent PNG alpha if reliably supported, otherwise EXACT uniform pure #FF00FF chroma background that is absent from the character palette. Strictly NO scene/background, no floor, no shadow halos, no text or labels, no UI, no logos, no known sci-fi franchise props, no weapons. Sheet aspect ratio 4:3 or 1:1; high resolution for accurate cropping and alpha cleanup.
```

#### GE-GL-07 — Glaucia em Maré Rubra — Coordenadas Perdidas

**Arquivo-fonte:** `GE-GL-07-red-tide.png` → web: `public/galaxia/actors/glaucia/red-tide/...`  
**Anexos no Grok:** fotos privadas autorizadas (se necessárias), `GE-MASTER-GL` aprovado e `GE-PL-07`.

```text
Create a four-pose, production-ready 2D PIXEL ART ACTOR SPRITE SHEET for GLÁUCIA, using the approved Glaucia master character image and her authorized personal reference photographs provided alongside this request. The CHARACTER IDENTITY MUST BE EXACTLY THE SAME woman in all panels and the approved master: face, hair, complexion, adult proportions, body height and features must not drift. Page world: Maré Rubra — Coordenadas Perdidas (Fenômeno cósmico fictício). COSTUME: Glaucia as space navigator in original functional graphite-and-coral jacket with clear-face emergency headset and compact navigation gloves; face/hair identifiable, puzzled then relieved expression. ACTION CONTEXT: Glaucia recalibrates navigation; dog finds missing route beacon; visual signal returns and the HTML link leads back home. Actual 404 status is preserved. Create FOUR clean, equally sized full-body panels, left to right: (1) idle with relaxed natural standing pose, (2) blink with same exact pose and closed eyes for a minimal blink overlay, (3) a clearly different but physically coherent interaction gesture appropriate for the scene, (4) a reaction/success gesture appropriate for the easter egg. Every pose with identical character scale, feet anchored on the SAME vertical baseline and facing mostly left or three-quarter-left (toward the HTML text) while the character is placed at the RIGHT side of the website scene. Keep complete extremities, hands and boots within each separate panel, enough margin for a sprite slicer. LIGHTING: match environmental light direction of the approved Maré Rubra — Coordenadas Perdidas plate; do not paint ground or background onto character. Colors coordinated with near black #0D0612, plasma crimson #9B2E48, coral glow #F07072, hot rose #F6A0A5, ember gold #FFBC78. STYLE: refined premium hand-crafted pixel art, crisp square pixel edges, logical clothing folds, readable face, no 3D, no airbrush, no excessive smoothing. Transparent PNG alpha if reliably supported, otherwise EXACT uniform pure #FF00FF chroma background that is absent from the character palette. Strictly NO scene/background, no floor, no shadow halos, no text or labels, no UI, no logos, no known sci-fi franchise props, no weapons. Sheet aspect ratio 4:3 or 1:1; high resolution for accurate cropping and alpha cleanup.
```

### 19.4 Sete pose sheets do cachorro (7 prompts)

**Pré-requisito:** `GE-MASTER-DOG` aprovado a partir de fotos reais. O cachorro **não deve ficar necessariamente visível em todas as cenas**, mas cada página precisa prever sua interação principal quando aparecer; com no máximo uma aparição discreta na cena inicial quando a composição profissional exigir. Preserve anatomia canina. `idle`, `look/sniff`, `interact`, `react` podem ser quadro a quadro ou derivados de um sheet **aprovado**.

#### GE-DOG-01 — Cachorro em Observatório das Primeiras Luzes

**Arquivo-fonte:** `GE-DOG-01-earth-observatory.png` → web: `public/galaxia/actors/dog/earth-observatory/...`  
**Anexos no Grok:** fotos privadas autorizadas do cão (quando necessário), `GE-MASTER-DOG` e `GE-PL-01`.

```text
Create a four-pose ORIGINAL 2D PIXEL ART DOG sprite sheet for the EXACT real family dog from the approved dog master sprite sheet and attached authorized dog photos. No changes to ear geometry, coat colors/markings, muzzle length, body silhouette, fur texture or eye shapes. The same exact non-anthropomorphic dog in all four panels. Destination: Observatório das Primeiras Luzes (Terra). DOG COSTUME: Lightweight explorer harness with teal straps and a small amber sensor on the side, no helmet on Earth; visibly the same dog as master. SCENARIO PURPOSE: turn the telescope toward one star; dog sniffs an anomalous transmitter; engineered launch console glows and the ship departs off-screen. FOUR evenly spaced complete full-body panels at identical scale and matching paws baseline: (1) calm idle posture, (2) looking or sniffing in an inquisitive way, (3) clear action to trigger scene secret, (4) delighted/reactive pose. Adapt movement to natural dog anatomy, no human hands or upright human body. Keep the animal oriented slightly left or toward Glaucia, with clear eyes and readable facial expression. Make the dog significantly smaller than Glaucia while retaining recognizable body size relative to her approved character master. Luminance/palette: subtle reflected environment light, colors coordinated with deep indigo #11172C, twilight violet #3B285B, luminous turquoise #41E6D5, aurora green #70E8A5, subtle golden amber #F5BF77. Art direction: polished hand-drawn 2D pixel art with crisp square pixels, no smooth brushwork, no fake blur, no 3D, no generic puppy substitution. Separate subjects only, NO environmental background, no floor texture, no words, no labels, no logos, no movie references, no watermarks. True transparent alpha PNG if available; otherwise solid pure #FF00FF chroma key not used on the harness or animal. 4:3 or 1:1 high-resolution sprite sheet. Everything must be properly separated for slicing and compositing.
```

#### GE-DOG-02 — Cachorro em Nivéora — Mundo das Auroras

**Arquivo-fonte:** `GE-DOG-02-niveora.png` → web: `public/galaxia/actors/dog/niveora/...`  
**Anexos no Grok:** fotos privadas autorizadas do cão (quando necessário), `GE-MASTER-DOG` e `GE-PL-02`.

```text
Create a four-pose ORIGINAL 2D PIXEL ART DOG sprite sheet for the EXACT real family dog from the approved dog master sprite sheet and attached authorized dog photos. No changes to ear geometry, coat colors/markings, muzzle length, body silhouette, fur texture or eye shapes. The same exact non-anthropomorphic dog in all four panels. Destination: Nivéora — Mundo das Auroras (Planeta fictício nevado). DOG COSTUME: Original insulated dog jacket with a small temperature sensor, little cold-weather paw boots, clear unobtrusive environmental visor adapted to dog anatomy, the exact dog fur and facial markings from approved master. SCENARIO PURPOSE: dog tracks appear in snow; Glaucia uncovers personal career capsule; aurora intensifies for short dramatic beat; blizzard reversible and accessible. FOUR evenly spaced complete full-body panels at identical scale and matching paws baseline: (1) calm idle posture, (2) looking or sniffing in an inquisitive way, (3) clear action to trigger scene secret, (4) delighted/reactive pose. Adapt movement to natural dog anatomy, no human hands or upright human body. Keep the animal oriented slightly left or toward Glaucia, with clear eyes and readable facial expression. Make the dog significantly smaller than Glaucia while retaining recognizable body size relative to her approved character master. Luminance/palette: subtle reflected environment light, colors coordinated with midnight blue #0D2342, glacier blue #88CBE9, vivid arctic cyan #55E9E8, lavender #B89DFC, soft pink aurora #F3A5D8. Art direction: polished hand-drawn 2D pixel art with crisp square pixels, no smooth brushwork, no fake blur, no 3D, no generic puppy substitution. Separate subjects only, NO environmental background, no floor texture, no words, no labels, no logos, no movie references, no watermarks. True transparent alpha PNG if available; otherwise solid pure #FF00FF chroma key not used on the harness or animal. 4:3 or 1:1 high-resolution sprite sheet. Everything must be properly separated for slicing and compositing.
```

#### GE-DOG-03 — Cachorro em Marte — Vale das Invenções

**Arquivo-fonte:** `GE-DOG-03-mars-lab.png` → web: `public/galaxia/actors/dog/mars-lab/...`  
**Anexos no Grok:** fotos privadas autorizadas do cão (quando necessário), `GE-MASTER-DOG` e `GE-PL-03`.

```text
Create a four-pose ORIGINAL 2D PIXEL ART DOG sprite sheet for the EXACT real family dog from the approved dog master sprite sheet and attached authorized dog photos. No changes to ear geometry, coat colors/markings, muzzle length, body silhouette, fur texture or eye shapes. The same exact non-anthropomorphic dog in all four panels. Destination: Marte — Vale das Invenções (Marte). DOG COSTUME: Safe fictional dog EVA suit with transparent small protective dome and integrated backpack, dog face fully visible, no humanized limbs; copper/cyan details and recognizable fur markings. SCENARIO PURPOSE: Glaucia remotely directs rover; rover scans, dust disperses to reveal real project link as HTML overlay; dog indicates research sample; terminal displays actual GitHub data. FOUR evenly spaced complete full-body panels at identical scale and matching paws baseline: (1) calm idle posture, (2) looking or sniffing in an inquisitive way, (3) clear action to trigger scene secret, (4) delighted/reactive pose. Adapt movement to natural dog anatomy, no human hands or upright human body. Keep the animal oriented slightly left or toward Glaucia, with clear eyes and readable facial expression. Make the dog significantly smaller than Glaucia while retaining recognizable body size relative to her approved character master. Luminance/palette: subtle reflected environment light, colors coordinated with iron red #743A31, warm rust #BD5632, copper #D27A43, golden orange #F3AE62, contrasting cyan #42CFE0. Art direction: polished hand-drawn 2D pixel art with crisp square pixels, no smooth brushwork, no fake blur, no 3D, no generic puppy substitution. Separate subjects only, NO environmental background, no floor texture, no words, no labels, no logos, no movie references, no watermarks. True transparent alpha PNG if available; otherwise solid pure #FF00FF chroma key not used on the harness or animal. 4:3 or 1:1 high-resolution sprite sheet. Everything must be properly separated for slicing and compositing.
```

#### GE-DOG-04 — Cachorro em Lúmina — Biblioteca Viva

**Arquivo-fonte:** `GE-DOG-04-lumina.png` → web: `public/galaxia/actors/dog/lumina/...`  
**Anexos no Grok:** fotos privadas autorizadas do cão (quando necessário), `GE-MASTER-DOG` e `GE-PL-04`.

```text
Create a four-pose ORIGINAL 2D PIXEL ART DOG sprite sheet for the EXACT real family dog from the approved dog master sprite sheet and attached authorized dog photos. No changes to ear geometry, coat colors/markings, muzzle length, body silhouette, fur texture or eye shapes. The same exact non-anthropomorphic dog in all four panels. Destination: Lúmina — Biblioteca Viva (Planeta cristalino fictício). DOG COSTUME: Comfortable small exploration harness with a detachable opaline light gem, paws and silhouette identical to reference, playful investigative expression. SCENARIO PURPOSE: Glaucia touches crystal to reveal an actual article link; dog discovers secret passage; prismatic beams briefly align and unlock hidden archive. FOUR evenly spaced complete full-body panels at identical scale and matching paws baseline: (1) calm idle posture, (2) looking or sniffing in an inquisitive way, (3) clear action to trigger scene secret, (4) delighted/reactive pose. Adapt movement to natural dog anatomy, no human hands or upright human body. Keep the animal oriented slightly left or toward Glaucia, with clear eyes and readable facial expression. Make the dog significantly smaller than Glaucia while retaining recognizable body size relative to her approved character master. Luminance/palette: subtle reflected environment light, colors coordinated with deep aubergine #221435, crystal pink #E474C7, electric purple #AA78F4, luminous cyan #53E0E8, opaline white #F7E6FF. Art direction: polished hand-drawn 2D pixel art with crisp square pixels, no smooth brushwork, no fake blur, no 3D, no generic puppy substitution. Separate subjects only, NO environmental background, no floor texture, no words, no labels, no logos, no movie references, no watermarks. True transparent alpha PNG if available; otherwise solid pure #FF00FF chroma key not used on the harness or animal. 4:3 or 1:1 high-resolution sprite sheet. Everything must be properly separated for slicing and compositing.
```

#### GE-DOG-05 — Cachorro em Atlas das Conexões

**Arquivo-fonte:** `GE-DOG-05-earth-orbit.png` → web: `public/galaxia/actors/dog/earth-orbit/...`  
**Anexos no Grok:** fotos privadas autorizadas do cão (quando necessário), `GE-MASTER-DOG` e `GE-PL-05`.

```text
Create a four-pose ORIGINAL 2D PIXEL ART DOG sprite sheet for the EXACT real family dog from the approved dog master sprite sheet and attached authorized dog photos. No changes to ear geometry, coat colors/markings, muzzle length, body silhouette, fur texture or eye shapes. The same exact non-anthropomorphic dog in all four panels. Destination: Atlas das Conexões (Órbita da Terra). DOG COSTUME: Original navigator harness with small star-chart badge of geometric non-branded symbols and comfortable padded collar, dog anatomy real and face recognizable. SCENARIO PURPOSE: Glaucia operates orbiting Earth data map; dog activates a factual event marker; constellations connect ONLY real recorded locations, and remote events are not mislabeled as trips. FOUR evenly spaced complete full-body panels at identical scale and matching paws baseline: (1) calm idle posture, (2) looking or sniffing in an inquisitive way, (3) clear action to trigger scene secret, (4) delighted/reactive pose. Adapt movement to natural dog anatomy, no human hands or upright human body. Keep the animal oriented slightly left or toward Glaucia, with clear eyes and readable facial expression. Make the dog significantly smaller than Glaucia while retaining recognizable body size relative to her approved character master. Luminance/palette: subtle reflected environment light, colors coordinated with near-black space #071022, cobalt #205FAD, bright cyan #4BDFFF, turquoise #50DDBF, signal gold #F7C36C. Art direction: polished hand-drawn 2D pixel art with crisp square pixels, no smooth brushwork, no fake blur, no 3D, no generic puppy substitution. Separate subjects only, NO environmental background, no floor texture, no words, no labels, no logos, no movie references, no watermarks. True transparent alpha PNG if available; otherwise solid pure #FF00FF chroma key not used on the harness or animal. 4:3 or 1:1 high-resolution sprite sheet. Everything must be properly separated for slicing and compositing.
```

#### GE-DOG-06 — Cachorro em Aurélia — Jardins Suspensos

**Arquivo-fonte:** `GE-DOG-06-aurelia.png` → web: `public/galaxia/actors/dog/aurelia/...`  
**Anexos no Grok:** fotos privadas autorizadas do cão (quando necessário), `GE-MASTER-DOG` e `GE-PL-06`.

```text
Create a four-pose ORIGINAL 2D PIXEL ART DOG sprite sheet for the EXACT real family dog from the approved dog master sprite sheet and attached authorized dog photos. No changes to ear geometry, coat colors/markings, muzzle length, body silhouette, fur texture or eye shapes. The same exact non-anthropomorphic dog in all four panels. Destination: Aurélia — Jardins Suspensos (Estação-jardim orbital fictícia). DOG COSTUME: Lightweight rose-coral and mint visitor harness with an original tiny botanical sensor; dog looks curious but calm and remains true to reference coat/ears. SCENARIO PURPOSE: Glaucia receives a creative collaboration signal; dog triggers a tiny luminous bloom; interactive contact CTA highlights but never sends form automatically. FOUR evenly spaced complete full-body panels at identical scale and matching paws baseline: (1) calm idle posture, (2) looking or sniffing in an inquisitive way, (3) clear action to trigger scene secret, (4) delighted/reactive pose. Adapt movement to natural dog anatomy, no human hands or upright human body. Keep the animal oriented slightly left or toward Glaucia, with clear eyes and readable facial expression. Make the dog significantly smaller than Glaucia while retaining recognizable body size relative to her approved character master. Luminance/palette: subtle reflected environment light, colors coordinated with deep teal #113A48, botanical mint #8FE9BC, warm coral #F49D86, rose pink #F6B2CC, soft celestial blue #86D6EF. Art direction: polished hand-drawn 2D pixel art with crisp square pixels, no smooth brushwork, no fake blur, no 3D, no generic puppy substitution. Separate subjects only, NO environmental background, no floor texture, no words, no labels, no logos, no movie references, no watermarks. True transparent alpha PNG if available; otherwise solid pure #FF00FF chroma key not used on the harness or animal. 4:3 or 1:1 high-resolution sprite sheet. Everything must be properly separated for slicing and compositing.
```

#### GE-DOG-07 — Cachorro em Maré Rubra — Coordenadas Perdidas

**Arquivo-fonte:** `GE-DOG-07-red-tide.png` → web: `public/galaxia/actors/dog/red-tide/...`  
**Anexos no Grok:** fotos privadas autorizadas do cão (quando necessário), `GE-MASTER-DOG` e `GE-PL-07`.

```text
Create a four-pose ORIGINAL 2D PIXEL ART DOG sprite sheet for the EXACT real family dog from the approved dog master sprite sheet and attached authorized dog photos. No changes to ear geometry, coat colors/markings, muzzle length, body silhouette, fur texture or eye shapes. The same exact non-anthropomorphic dog in all four panels. Destination: Maré Rubra — Coordenadas Perdidas (Fenômeno cósmico fictício). DOG COSTUME: Original graphite dog emergency harness with a small coral beacon light, dog face/coat fully recognizable, perched safely on navigation deck. SCENARIO PURPOSE: Glaucia recalibrates navigation; dog finds missing route beacon; visual signal returns and the HTML link leads back home. Actual 404 status is preserved. FOUR evenly spaced complete full-body panels at identical scale and matching paws baseline: (1) calm idle posture, (2) looking or sniffing in an inquisitive way, (3) clear action to trigger scene secret, (4) delighted/reactive pose. Adapt movement to natural dog anatomy, no human hands or upright human body. Keep the animal oriented slightly left or toward Glaucia, with clear eyes and readable facial expression. Make the dog significantly smaller than Glaucia while retaining recognizable body size relative to her approved character master. Luminance/palette: subtle reflected environment light, colors coordinated with near black #0D0612, plasma crimson #9B2E48, coral glow #F07072, hot rose #F6A0A5, ember gold #FFBC78. Art direction: polished hand-drawn 2D pixel art with crisp square pixels, no smooth brushwork, no fake blur, no 3D, no generic puppy substitution. Separate subjects only, NO environmental background, no floor texture, no words, no labels, no logos, no movie references, no watermarks. True transparent alpha PNG if available; otherwise solid pure #FF00FF chroma key not used on the harness or animal. 4:3 or 1:1 high-resolution sprite sheet. Everything must be properly separated for slicing and compositing.
```

### 19.5 Sete object/easter-egg prop sheets (7 prompts)

Esses objetos NÃO substituem toda a animação. Sprites detalhados são estáticos; **Devin implementará o movimento, disparos, realces, partículas e transições** por CSS/SVG/GSAP e estados em React onde necessário. Cortar cada elemento do sheet em assets separados, com nomes sem ambiguidade e `alpha` correto. Nunca rasterizar nomes de projeto, estrelas GitHub, rótulos de eventos nem botões: esses dados continuam HTML.

#### GE-PROP-01 — Props de Observatório das Primeiras Luzes

**Arquivo-fonte:** `GE-PROP-01-earth-observatory.png` → web: `public/galaxia/props/earth-observatory/...`  
**Anexos no Grok:** `GE-PL-01` e, se houver veículo em cena, `GE-MASTER-SHIP`.

```text
Create a clean pixel-art GAME PROPS ASSET SHEET with original separate objects for Observatório das Primeiras Luzes in the Galáxia Encantada portfolio. Objects to render, each spatially separated and large enough to cut out into independent transparent sprites: an original compact observatory telescope on swivel tripod in idle position; telescope tilted upward; little receiver emitting cyan pulses; a freestanding low launch console with orange lights; the same proprietary spacecraft at very small distant scale. Narrative mechanics: turn the telescope toward one star; dog sniffs an anomalous transmitter; engineered launch console glows and the ship departs off-screen. Scene-compatible colors: deep indigo #11172C, twilight violet #3B285B, luminous turquoise #41E6D5, aurora green #70E8A5, subtle golden amber #F5BF77. Show simple variants of the two most important interactive props (inactive and activated). Make geometric perspective suitable for a 2D side/front three-quarter website hero where sprites are placed on the RIGHT side near the lower 20 percent of the scene. All designs must be truly original engineering/scientific fantasy, distinct from famous franchises and no copied cinematic vehicles. Keep clear negative spacing between every object, and show full objects with no clipping. 2D premium pixel art, disciplined square-pixel clusters, high contrast and crisp hard edges, no blur/no depth-of-field/no voxel 3D. Transparent alpha PNG if supported, otherwise solid single-color #FF00FF chroma background absent from props. No scenery, no characters, no text or pseudo-text on screens, no logos, no watermarks. Prefer 4:3 or 1:1 asset atlas image.
```

#### GE-PROP-02 — Props de Nivéora — Mundo das Auroras

**Arquivo-fonte:** `GE-PROP-02-niveora.png` → web: `public/galaxia/props/niveora/...`  
**Anexos no Grok:** `GE-PL-02` e, se houver veículo em cena, `GE-MASTER-SHIP`.

```text
Create a clean pixel-art GAME PROPS ASSET SHEET with original separate objects for Nivéora — Mundo das Auroras in the Galáxia Encantada portfolio. Objects to render, each spatially separated and large enough to cut out into independent transparent sprites: sealed scientific memory capsule partly buried in snow; open capsule with amber archive light; a small prismatic ice specimen; a tiny aurora measurement sensor; six original snow-paw tracks as separate graphics. Narrative mechanics: dog tracks appear in snow; Glaucia uncovers personal career capsule; aurora intensifies for short dramatic beat; blizzard reversible and accessible. Scene-compatible colors: midnight blue #0D2342, glacier blue #88CBE9, vivid arctic cyan #55E9E8, lavender #B89DFC, soft pink aurora #F3A5D8. Show simple variants of the two most important interactive props (inactive and activated). Make geometric perspective suitable for a 2D side/front three-quarter website hero where sprites are placed on the RIGHT side near the lower 20 percent of the scene. All designs must be truly original engineering/scientific fantasy, distinct from famous franchises and no copied cinematic vehicles. Keep clear negative spacing between every object, and show full objects with no clipping. 2D premium pixel art, disciplined square-pixel clusters, high contrast and crisp hard edges, no blur/no depth-of-field/no voxel 3D. Transparent alpha PNG if supported, otherwise solid single-color #FF00FF chroma background absent from props. No scenery, no characters, no text or pseudo-text on screens, no logos, no watermarks. Prefer 4:3 or 1:1 asset atlas image.
```

#### GE-PROP-03 — Props de Marte — Vale das Invenções

**Arquivo-fonte:** `GE-PROP-03-mars-lab.png` → web: `public/galaxia/props/mars-lab/...`  
**Anexos no Grok:** `GE-PL-03` e, se houver veículo em cena, `GE-MASTER-SHIP`.

```text
Create a clean pixel-art GAME PROPS ASSET SHEET with original separate objects for Marte — Vale das Invenções in the Galáxia Encantada portfolio. Objects to render, each spatially separated and large enough to cut out into independent transparent sprites: a unique six-wheel field rover in idle state; rover arm extended scanning rock; compact holographic mineral analysis module with blank screen; sealed sample box; modular data beacon with cyan signal. Narrative mechanics: Glaucia remotely directs rover; rover scans, dust disperses to reveal real project link as HTML overlay; dog indicates research sample; terminal displays actual GitHub data. Scene-compatible colors: iron red #743A31, warm rust #BD5632, copper #D27A43, golden orange #F3AE62, contrasting cyan #42CFE0. Show simple variants of the two most important interactive props (inactive and activated). Make geometric perspective suitable for a 2D side/front three-quarter website hero where sprites are placed on the RIGHT side near the lower 20 percent of the scene. All designs must be truly original engineering/scientific fantasy, distinct from famous franchises and no copied cinematic vehicles. Keep clear negative spacing between every object, and show full objects with no clipping. 2D premium pixel art, disciplined square-pixel clusters, high contrast and crisp hard edges, no blur/no depth-of-field/no voxel 3D. Transparent alpha PNG if supported, otherwise solid single-color #FF00FF chroma background absent from props. No scenery, no characters, no text or pseudo-text on screens, no logos, no watermarks. Prefer 4:3 or 1:1 asset atlas image.
```

#### GE-PROP-04 — Props de Lúmina — Biblioteca Viva

**Arquivo-fonte:** `GE-PROP-04-lumina.png` → web: `public/galaxia/props/lumina/...`  
**Anexos no Grok:** `GE-PL-04` e, se houver veículo em cena, `GE-MASTER-SHIP`.

```text
Create a clean pixel-art GAME PROPS ASSET SHEET with original separate objects for Lúmina — Biblioteca Viva in the Galáxia Encantada portfolio. Objects to render, each spatially separated and large enough to cut out into independent transparent sprites: four original levitating crystal archive objects with separate idle and activated glow states; an elegant unlabeled library terminal; tiny prismatic gate closed and open; small set of floating pixel motes. Narrative mechanics: Glaucia touches crystal to reveal an actual article link; dog discovers secret passage; prismatic beams briefly align and unlock hidden archive. Scene-compatible colors: deep aubergine #221435, crystal pink #E474C7, electric purple #AA78F4, luminous cyan #53E0E8, opaline white #F7E6FF. Show simple variants of the two most important interactive props (inactive and activated). Make geometric perspective suitable for a 2D side/front three-quarter website hero where sprites are placed on the RIGHT side near the lower 20 percent of the scene. All designs must be truly original engineering/scientific fantasy, distinct from famous franchises and no copied cinematic vehicles. Keep clear negative spacing between every object, and show full objects with no clipping. 2D premium pixel art, disciplined square-pixel clusters, high contrast and crisp hard edges, no blur/no depth-of-field/no voxel 3D. Transparent alpha PNG if supported, otherwise solid single-color #FF00FF chroma background absent from props. No scenery, no characters, no text or pseudo-text on screens, no logos, no watermarks. Prefer 4:3 or 1:1 asset atlas image.
```

#### GE-PROP-05 — Props de Atlas das Conexões

**Arquivo-fonte:** `GE-PROP-05-earth-orbit.png` → web: `public/galaxia/props/earth-orbit/...`  
**Anexos no Grok:** `GE-PL-05` e, se houver veículo em cena, `GE-MASTER-SHIP`.

```text
Create a clean pixel-art GAME PROPS ASSET SHEET with original separate objects for Atlas das Conexões in the Galáxia Encantada portfolio. Objects to render, each spatially separated and large enough to cut out into independent transparent sprites: an empty circular globe pedestal with power-down and illuminated states, small navigation dial, two original slim radar arcs, captain tablet with blank screen; NO pre-rendered Earth globe on the pedestal (real interactive globe will be code). Narrative mechanics: Glaucia operates orbiting Earth data map; dog activates a factual event marker; constellations connect ONLY real recorded locations, and remote events are not mislabeled as trips. Scene-compatible colors: near-black space #071022, cobalt #205FAD, bright cyan #4BDFFF, turquoise #50DDBF, signal gold #F7C36C. Show simple variants of the two most important interactive props (inactive and activated). Make geometric perspective suitable for a 2D side/front three-quarter website hero where sprites are placed on the RIGHT side near the lower 20 percent of the scene. All designs must be truly original engineering/scientific fantasy, distinct from famous franchises and no copied cinematic vehicles. Keep clear negative spacing between every object, and show full objects with no clipping. 2D premium pixel art, disciplined square-pixel clusters, high contrast and crisp hard edges, no blur/no depth-of-field/no voxel 3D. Transparent alpha PNG if supported, otherwise solid single-color #FF00FF chroma background absent from props. No scenery, no characters, no text or pseudo-text on screens, no logos, no watermarks. Prefer 4:3 or 1:1 asset atlas image.
```

#### GE-PROP-06 — Props de Aurélia — Jardins Suspensos

**Arquivo-fonte:** `GE-PROP-06-aurelia.png` → web: `public/galaxia/props/aurelia/...`  
**Anexos no Grok:** `GE-PL-06` e, se houver veículo em cena, `GE-MASTER-SHIP`.

```text
Create a clean pixel-art GAME PROPS ASSET SHEET with original separate objects for Aurélia — Jardins Suspensos in the Galáxia Encantada portfolio. Objects to render, each spatially separated and large enough to cut out into independent transparent sprites: small original communication beacon, idle/unlocked/active states; delicate three-stage bioluminescent plant growth; soft pixel light particles; a subtle unbranded contact icon geometry without lettering. Narrative mechanics: Glaucia receives a creative collaboration signal; dog triggers a tiny luminous bloom; interactive contact CTA highlights but never sends form automatically. Scene-compatible colors: deep teal #113A48, botanical mint #8FE9BC, warm coral #F49D86, rose pink #F6B2CC, soft celestial blue #86D6EF. Show simple variants of the two most important interactive props (inactive and activated). Make geometric perspective suitable for a 2D side/front three-quarter website hero where sprites are placed on the RIGHT side near the lower 20 percent of the scene. All designs must be truly original engineering/scientific fantasy, distinct from famous franchises and no copied cinematic vehicles. Keep clear negative spacing between every object, and show full objects with no clipping. 2D premium pixel art, disciplined square-pixel clusters, high contrast and crisp hard edges, no blur/no depth-of-field/no voxel 3D. Transparent alpha PNG if supported, otherwise solid single-color #FF00FF chroma background absent from props. No scenery, no characters, no text or pseudo-text on screens, no logos, no watermarks. Prefer 4:3 or 1:1 asset atlas image.
```

#### GE-PROP-07 — Props de Maré Rubra — Coordenadas Perdidas

**Arquivo-fonte:** `GE-PROP-07-red-tide.png` → web: `public/galaxia/props/red-tide/...`  
**Anexos no Grok:** `GE-PL-07` e, se houver veículo em cena, `GE-MASTER-SHIP`.

```text
Create a clean pixel-art GAME PROPS ASSET SHEET with original separate objects for Maré Rubra — Coordenadas Perdidas in the Galáxia Encantada portfolio. Objects to render, each spatially separated and large enough to cut out into independent transparent sprites: an original navigation coordinate console in offline and restored states with completely blank screen areas, blinking loose signal beacon, directional star pointer, tiny spacecraft warning light; no readable text. Narrative mechanics: Glaucia recalibrates navigation; dog finds missing route beacon; visual signal returns and the HTML link leads back home. Actual 404 status is preserved. Scene-compatible colors: near black #0D0612, plasma crimson #9B2E48, coral glow #F07072, hot rose #F6A0A5, ember gold #FFBC78. Show simple variants of the two most important interactive props (inactive and activated). Make geometric perspective suitable for a 2D side/front three-quarter website hero where sprites are placed on the RIGHT side near the lower 20 percent of the scene. All designs must be truly original engineering/scientific fantasy, distinct from famous franchises and no copied cinematic vehicles. Keep clear negative spacing between every object, and show full objects with no clipping. 2D premium pixel art, disciplined square-pixel clusters, high contrast and crisp hard edges, no blur/no depth-of-field/no voxel 3D. Transparent alpha PNG if supported, otherwise solid single-color #FF00FF chroma background absent from props. No scenery, no characters, no text or pseudo-text on screens, no logos, no watermarks. Prefer 4:3 or 1:1 asset atlas image.
```

### 19.6 Prompts opcionais de transições e identidade (3 imagens)

Estes prompts são **opcionais**. Começar com transições em CSS/SVG/gradientes pixelados antes de acrescentar mais raster ao LCP. Se usar camadas extras de efeitos, fazer lazy-load e pausar fora da tela.

#### GE-OPT-T01 — Transição — Correntes Esmeralda

**Arquivo-fonte:** `cosmic-green-current.png` · **Anexos:** somente masters/placas autorais quando aplicável.

```text
Create a wholly original colossal cosmic scene for a 2D pixel art space exploration website transition: enormous luminous emerald and turquoise braided gaseous currents winding through black space with subtle amber molecular filaments, tiny restrained golden stars and a distant tiny original scientific exploration ship silhouette to communicate scale. Unique composition with oblique bands, physically fluid texture, rich parallax-friendly separate near/far layers and crisp 16-bit-inspired pixel clusters. Left half subdued enough for a brief accessible transition label rendered later in HTML; most visual detail right. The result must feel vast and mysterious, not like a movie screenshot or copied planet/vessel from any existing film. No people, no words, no HUD, no logos, no watermark, no photorealism or blur. 16:9 panoramic, high-resolution.
```

#### GE-OPT-T02 — Transição — Marés de Coral

**Arquivo-fonte:** `cosmic-coral-current.png` · **Anexos:** somente masters/placas autorais quando aplicável.

```text
Create a never-before-seen surreal 2D cinematic PIXEL ART visualization of coral-orange and pink cosmic plasma streams flowing across a deep midnight starfield. Layers of thin luminous waves, clustered stardust dots and deep dark interstitial spaces provide perspective and extraordinary scale. Include no central character, spacecraft, or recognizable cinematic staging; this is original abstract space weather for a gentle and optional website scene transition. Keep crisp hard-edged pixels, sophisticated warm light gradients made from pixel clusters, no smooth photographic blur, no UI/text, no real movie still frame, no watermarks. Wide 16:9.
```

#### GE-OPT-OG — Social/Open Graph — capa autoral

**Arquivo-fonte:** `galaxia-encantada-og.png` · **Anexos:** somente masters/placas autorais quando aplicável.

```text
Design a premium original 2D PIXEL ART OPEN GRAPH social sharing background for a personal software engineer space exploration portfolio. A beautiful tiny original petal-shaped research spacecraft near the RIGHT of a richly colored starfield containing one icy lavender world, one coral-tinted red planet and a lush teal world in layered depth. Spectacular but clean cosmic lights; LEFT half dark blue and intentionally spacious for HTML or programmatic text overlay. Palette blends mint/coral/violet with careful professional restraint. No humans or dogs needed. It must NOT contain any letters, logos, slogans, title, text, trademark, watermark, franchise visuals or imitation of cinematic poster art. Crisp square-pixel edges at wide 16:9; the developer can later crop to 1200x630 after checking safe zones for social previews.
```

### 19.7 Prompts curtos para REPARO (edição de imagens já geradas)

Usar **modo de edição** com a imagem produzida originalmente, não gerar outra do zero para corrigir detalhes. Se o modelo mudar o enquadramento, reverter ao arquivo aprovado e tentar uma edição menor. Para scripts com atlas, inspecionar alinhamento num preview antes de confiar no resultado.

**R1 — limpar plate sem deslocar pixels importantes:**

```text
Edit ONLY this original environment plate. Keep identical aspect ratio, exact camera angle, focal points, lighting, palette and landscape geometry. Remove any accidental people, animals, vehicles, letters or UI in the LEFT 0-47% copy-safe area and reconstruct the quiet background naturally. Preserve every other scene element and the lower-right actor landing platform. Keep genuine crisp handcrafted pixel art; do not sharpen by creating noisy outlines, do not blur, no crop, no zoom.
```

**R2 — corrigir deriva facial da Glaucia:**

```text
Edit this Glaucia sprite sheet using the approved character master reference photos. Correct ONLY face identity, hair, eye placement, body scale and any hands with anatomy defects to match the same real woman in every pose. Preserve all four panels, outfits, camera, exact feet baseline, pose progression, background transparency/chroma and hard pixel edges. Do not alter destination theme, palette, panel sizes or character position. No text or scenery.
```

**R3 — corrigir pelagem e anatomia do cachorro:**

```text
Edit this dog sprite sheet to match EXACTLY the authorized dog photographs and approved master reference: coat markings, ear shapes, muzzle size, paws, tail and body proportions. Preserve the four poses and exploration accessories, and keep all paws on one consistent baseline. Remove unintended anthropomorphic gestures. Preserve transparent or chroma-key background and crisp 2D pixel art. No scene or text.
```

**R4 — extrair/reconstruir transparência onde falta:**

```text
Without changing ANY pixel of the subject, isolate each original sprite from this pose sheet on a truly transparent PNG background. Preserve the exact silhouette, color pixels, pixel-art staircase edges, lighting, proportions and character costume. Do not redraw faces, clothing, paws or any geometry. If transparency is not supported, replace ONLY the background with uniform pure #FF00FF and avoid halos or antialiased fringes.
```

**R5 — alinhar uma nova pose na base aprovada:**

```text
Edit the approved idle sprite into ONE interaction pose only, using the attached approved sprite as the unchangeable identity and scale reference. Keep EXACT same head shape, face identity, outfit, left-to-right orientation, canvas size, crop, pixel grid and feet anchoring. Change only the minimum relevant limbs and expression needed for [DESCRIBE ACTION]. Transparent background if supported; otherwise clean single chroma color. No new props attached unless explicitly specified.
```

## 20. Handoff operacional: imagens do Grok para Devin (NOVO)

### 20.1 Protocolo de entrega (um pacote por cena)

Para cada `sceneId` entregue ao Devin, fornecer os **arquivos reais** — não apenas links temporários de geração — e este checklist:

```text
SCENE ID: earth-observatory
BACKGROUND: GE-PL-01-earth-observatory.png [APPROVED]
GLAUCIA: GE-GL-01-earth-observatory.png [APPROVED]
DOG: GE-DOG-01-earth-observatory.png [APPROVED]
PROPS: GE-PROP-01-earth-observatory.png [APPROVED]
MASTER REFS: GE-MASTER-GL / GE-MASTER-DOG / GE-MASTER-SHIP [APPROVED]
AUTHORISATION TO INTEGRATE: yes, only preview/work branch; no production deploy
REVIEW NOTES: [observações visuais, se houver]
```

**Sem os arquivos concretos, Devin deve parar somente as tarefas que dependem deles.** Nenhum `https://...` temporário do Grok deve ser usado no site em produção. Evitar base64 embutido em componentes; converter arquivos em assets locais otimizados.

### 20.2 Processamento para integração

1. Preservar fontes aprovadas; validar dimensões com `sharp` ou ferramenta equivalente e registrar `sha256`.
2. Se os sprites vieram em grade, extrair quadros identificados manualmente e inspecionar cada recorte; frames deformados/regenerados são rejeitados, nunca normalizados à força para “caber”.
3. Converter chroma em alpha quando necessário, inspecionando bordas em fundos preto, cinza e magenta oposta. Evitar halo, alpha premultiplicado incorreto ou `bilinear` que destrói pixels.
4. Compor as placas e atores com o mesmo plano de coordenadas. Manter o personagem à direita; em desktop a área de copy à esquerda não recebe efeitos de alto contraste. Em mobile reorganizar a estrutura, não só recortar o herói desktop.
5. Exportar WebP/PNG local; lazy-load dos quadros secundários e hotspots fora da primeira dobra; preload apenas o necessário ao LCP.
6. Ligar prop à interação sem embutir link real em arte raster. Nome do projeto, estrela, evento, contato e dado de carreira são HTML/JSON existentes.
7. Registrar cada arte no manifest, com aceite da proprietária e referência do PR de integração.

### 20.3 Estado de animação por cena (contrato sugerido)

| SceneId | Glaucia idle → interação | Cachorro idle → interação | Props/FX → easter egg |
|---|---|---|---|
| `earth-observatory` | respira/observa → ajusta telescópio → aponta | fareja → encontra rádio | foco do telescópio → estrela/sinal → lançamento |
| `niveora` | respira no frio → ajoelha e encontra cápsula | reage à neve → deixa pegadas | neve/aurora → cápsula e prisma |
| `mars-lab` | observa rover → aciona controle | investiga amostra | escaneamento rover/dados GitHub e poeira |
| `lumina` | observa biblioteca → toca cristal | examina cristais → passagem secreta | luz prismática e arquivo de conteúdo |
| `earth-orbit` | conduz projeção do mapa → destaca evento | aciona painel | globo REAL existente, constelações/rotas de eventos |
| `aurelia` | recebe sinal → confirma colaboração | observa planta → ativa florescimento | mensagem original e destaque do CTA sem envio |
| `red-tide` | checa console → restabelece rota | encontra sinal → celebra | painel recupera coordenadas, link para Home |

### 20.4 Requisitos de interação e acessibilidade

- Cada interação principal deve ser um botão/hotspot semanticamente nomeado, com `aria-label`, foco visível, ação equivalente por mouse e toque, e fallback de teclado. Não depender só de hover, arraste, som ou vídeo.
- `prefers-reduced-motion` e o toggle existente devem prevalecer sobre animação automática; sempre oferecer caminho funcional para executar o easter egg sem animação.
- Pausar timers, observers, requestAnimationFrame e CSS animation fora da aba/viewport. `SceneMotion` já demonstra esse contrato e deve ser mantido/refatorado, não removido.
- Efeito sonoro opt-in, volume com limite seguro e nenhum sample imitativo de IP reconhecível. Conteúdo profissional não espera o término das animações.
- Se o dog não aparece no estado inicial de determinada página por intenção artística, o ator Glaucia continua à direita e a aparição do cão pode integrar o easter egg sem alterar o layout.

## 21. Plano de execução Devin: PRs, dependências e checkpoints (NOVO)

| Etapa/PR candidato | Pode começar sem artes? | Escopo | Gate |
|---|---|---|---|
| `PR-00 baseline` | **Sim** | branch/status, commit, baseline, screenshots, matriz de risco | resultados reais e impedimentos registrados |
| `PR-01 scene-kernel` | **Sim** | `SceneId` explícito, contratos SSR/client, tokens, layout, tests | lint/types/unit/build/compat |
| `PR-02 eggs-v2` | **Sim** | 24 IDs novos, storage, terminal, i18n, testes; manter hooks existentes em adaptadores | replay/reset/contagem/locale |
| `PR-03 hero-earth` | **Após 4 assets + masters** | 1 hero completo, Glaucia/cachorro, telescópio e 4 secrets | **aprovação visual da proprietária** |
| `PR-04 niveora-mars` | **Após assets respectivos** | hero e atores novos, 4+5 segredos, carreira/GitHub | QA funcional e visual |
| `PR-05 lumina-atlas` | **Após assets respectivos** | 3+3 secrets, filtros e globo preservados | dados reais e interação |
| `PR-06 aurelia-red-tide` | **Após assets respectivos** | 2+2 secrets, contato e 404 | formulário e HTTP 404 |
| `PR-07 story-ip-release` | **Após todos** | nave/mode story, fontes/OG/docs/varredura autoral, regressões cross-site | aprovação final preview, merge/deploy **manual** |

PRs podem ser reagrupados quando o repositório atual mostrar dependências diferentes; preservar comportamento e separação de decisões. Se migrations dos IDs antigos exigirem deploy conjunto para não quebrar segredos durante PR intermediário, agrupar em feature flag ou branch fechada. Não deixar preview de produção com estado misto de franquia/autoria divulgado como migração concluída.

### 21.1 Definição de pronto por página

- [ ] Arte com provenance `approved`, sem elementos terceiros; fundo pixel art widescreen; ator à direita; texto/CTAs à esquerda.
- [ ] Pelo menos `idle` e uma interação especial de personagem; cachorro integrado ao menos em narrativa/interação quando previsto.
- [ ] Hotspot atingível por pointer, touch e teclado; feedback visual; replay seguro; global total permanece 24.
- [ ] Composição conferida em 320, 390, 768, 900, 901, 1280, 1440 e 1920 px; mobile e zoom de 200%; nenhum recorte de rosto/CTA.
- [ ] Conteúdo e links reais anteriores continuam corretos em PT/EN/ES; 404 com status 404.
- [ ] Sem JS, reduzido, som desligado, foco, WCAG 2.2 AA, contrastes e preferências manuais.
- [ ] Página com cleanup ao sair/entrar; sem loops pesados; LCP/INP/CLS e regressão comparados ao baseline disponível.
- [ ] Testes executados com evidência e screenshots; os bloqueados explicitamente identificados.

### 21.2 Política de bloqueios

**Pode seguir mesmo sem fotos:** auditoria, isolamentos de cena, i18n, manifest, remapeamento de eggs, testes, CSS sem assets finais. **Não pode concluir sem fotos:** character sheet fiel, poses finais da pessoa/cão e aprovação artística; **não substituir** por rosto inventado. **Pode seguir sem Playwright remoto:** Playwright local sobre `next start` onde possível; não usar resultado local como prova da produção. **Não pode publicar sem autorização:** deploy de produção ou preview externo de assets ainda não revisados; preview privado em ambiente controlado é permitido para validação.

## 22. Critérios de qualidade/controle de mudanças e referências específicas (NOVO)

### 22.1 Matriz de aceitação da arte (revisão humana)

Em cada um dos 31 assets-fonte, avaliar de 1 a 5 e registrar no manifest:

| Dimensão | Critério | Regra de aceite |
|---|---|---|
| Originalidade | não lembra personagens/veículos/arquitetura distintiva de franquias | ausência de sinais de derivação óbvia |
| Fidelidade pessoal | Glaucia/cachorro reconhecíveis pelas fotos | proprietária aprova |
| Pixel craft | blocos intencionais, contornos nítidos, cores coerentes | sem blur/falso pixel art |
| Composição | espaço de texto à esquerda e personagens/props à direita | sem colisão em desktop/mobile |
| Produção de sprite | recorte limpo, frames coerentes, pés alinhados | integração e estado idempotentes |
| Performance | LCP aceitável e carga sob demanda | medido no preview |
| Interatividade | no mínimo um comportamento autoral e egg por página | Playwright + revisão humana |

O conjunto de dimensões varia conforme o asset (plates sem rosto; character sheet sem texto etc.); nenhum score substitui aprovação visual explícita.

### 22.2 Limiares e medições de referência

- **Métricas Web Vitals recomendadas:** LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 no percentil 75 de dados de usuários reais, quando houver instrumentação; não declarar conformidade com medições sintéticas apenas.
- **Regressão interna proposta:** comparar bundle, transfer, CPU de scroll, LCP e CLS com baseline local nas mesmas condições. Investigar degradações maiores que 10% do LCP ou aumento significativo de scripts; decisões de performance devem vir de medição reproduzível.
- **Verificação de ativos:** nenhuma requisição 404 para sprite, backgrounds comprimidos, SSR sem arte por trás de H1, legibilidade durante partículas mais densas.
- **Risco autoral:** varrer JS/HTML/CSS/JSON, strings localizadas, mídias servidas, páginas OG e README; inspecionar com a proprietária os falsos positivos de nomes históricos. O histórico Git continua histórico, não promessa de remoção total de cópias públicas.

### 22.3 Fontes adicionais sobre Grok Imagine e processamento de imagens

1. xAI Imagine Overview (modelos, geração, edição, referências): https://docs.x.ai/developers/model-capabilities/imagine
2. xAI Image Prompting Guide (qualidade, proporções, edição): https://docs.x.ai/developers/model-capabilities/images/prompting-guide
3. xAI Image Generation Tool (uso conversacional da ferramenta): https://docs.x.ai/developers/tools/image-generation
4. xAI Image Editing (edição com imagem-fonte): https://docs.x.ai/developers/model-capabilities/images/editing
5. xAI Multi-Image Editing (até 5 referências em API): https://docs.x.ai/developers/model-capabilities/images/multi-image-editing
6. xAI Files input (armazenamento privado de referências via Files API quando disponível): https://docs.x.ai/developers/model-capabilities/imagine/files/inputs

**Documentação técnica útil:** `https://nextjs.org/docs/app`, `https://playwright.dev/docs/intro`, `https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering`, `https://www.w3.org/WAI/WCAG22/quickref/`. A implementação deve usar a versão e o lockfile do checkout, não números inferidos apenas da documentação pública.

---

**STATUS FINAL DO HANDOFF V2:** especificação técnica pronta para Devin, 31 prompts obrigatórios e 3 opcionais para Grok, 24 eggs remapeados, regras de composição/arte/teste definidas. **Nenhum asset novo foi gerado neste ato e nenhum arquivo do GitHub/deploy foi modificado.** O trabalho de engenharia pode começar imediatamente pelo baseline e núcleo de cenas; a integração final dos personagens depende de assets aprovados pela proprietária.
