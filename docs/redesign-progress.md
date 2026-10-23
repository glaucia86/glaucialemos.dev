# Editorial + pixel art — execução

Plano aprovado na conversa: autoridade e negócios; manter Next.js e TypeScript,
pt/en/es, funções atuais, Yoda e Dagobah. Implementar no checkout atual em branch
`feat/editorial-pixel-portfolio`, sem publicar em produção.

- [x] Base e medições iniciais
- [x] Sistema visual e home
- [x] Cena em camadas e ciclo de movimento
- [x] Páginas internas e acessibilidade
- [x] Testes, build e revisão visual

Decisão: manter o checkout compartilhado e usar uma branch dedicada; não criar
um segundo checkout nem alterar a main.
Decisão: a cena terá um fundo reconstituído e um recorte transparente independente,
preservando os arquivos originais. Elementos do primeiro plano serão SVG/CSS.
Revisão: a geração do recorte não produziu um arquivo utilizável. O personagem foi
preservado por máscara CSS sobre seus pixels originais, como camada independente.
Decisão: não adicionar biblioteca de animação; usar CSS e APIs nativas do navegador.
Decisão: a preferência do sistema sempre reduz movimento, mesmo com opção manual ativa.
Fontes de arquitetura: https://docs.astro.build/en/concepts/islands/ e
https://nextjs.org/docs/app/getting-started/server-and-client-components.

Validação: lint, TypeScript, build de 21 páginas estáticas e 53 testes unitários verdes.
Os três scripts de navegador validam idiomas, rotas, CTAs, imagens, foco, filtros,
menu, composição responsiva, preferências de movimento, pausa fora da tela/aba
oculta e apresentação sem JavaScript. Capturas selecionadas em docs/screenshots/editorial.

Revisão independente encontrou um problema de pausa em telas baixas: observar o
hero completo permitia animar a ilustração abaixo da dobra. Corrigido para observar
a própria camada, com teste que falhou no build anterior e passou no build final.
Não foram encontradas outras regressões confirmadas na revisão.

Durante a validação, a otimização WebP local teve requisições pendentes em alguns
tamanhos no processo restrito. O preview foi reiniciado fora do sandbox; as imagens
passaram a carregar, sem alteração de configuração do produto.

Entrega: alterações locais na branch dedicada e preview http://127.0.0.1:3100/pt.
Sem push, merge ou publicação em produção. Evidências de desempenho before/after
acompanham o repositório; as amostras são sintéticas e o cache do servidor pode estar quente.
