# Correção de responsividade

Base: `origin/main`, `5d5e378`; branch `fix/responsividade`. Plano: pedido da usuária nesta sessão.

## Execução

- Cabeçalho: altura compartilhada, navegação recolhida abaixo de 1440 px, preferências no painel.
- Heroes: texto antes da cena no modo compacto; sobreposição e pin apenas a partir de 1200 × 680 com mouse e hover.
- Conteúdo e diálogos: dimensionamento flexível e rolagem vertical acessível.
- Verificação: suíte de navegador integrada, lint, tipos, testes e build quando não houver dev ativo.

Decisão: a restrição explícita do AGENTS.md impede executar a suíte de navegador, inclusive para demonstrar a falha inicial. A validação visual permanece pendente; verificações estáticas não substituem essa evidência.

Interfaces compartilhadas: a condição de sobreposição precisa coincidir no CSS e nas quatro ilhas de movimento; o cabeçalho, avisos e âncoras precisam usar a mesma altura.

## Alterações e revisão

- Altura do cabeçalho compartilhada, controles de 44 px, painel rolável, foco ao abrir e retorno com Esc.
- Uma condição de sobreposição no GSAP; CSS usa as mesmas condições de tamanho, ponteiro e hover. `revertOnUpdate` preservado nas quatro cenas.
- A cena compacta reserva espaço com `aspect-ratio`, usando a largura real do hero. Isso evita diferenças entre `vw` e a área disponível quando há scrollbar.
- Correções de quebra de texto, dimensões mínimas, estatísticas, terminal, botões e diálogos. Diálogos acompanham `visualViewport` para responder ao teclado virtual.
- Revisão independente identificou e motivou ajustes de especificidade, coordenadas, foco e cobertura da suíte.

## Validação de navegador — execução pela usuária

Depois do build, execute em PowerShell:

```powershell
npm.cmd run test:browser -- responsiveness
$env:BROWSER_ENGINE = 'webkit'
npm.cmd run test:browser -- responsiveness
Remove-Item Env:BROWSER_ENGINE
```

O executor existente inicia o servidor de produção. Para reutilizar um servidor já aberto, defina `$env:BASE_URL = 'http://127.0.0.1:3100'`. Os binários Chromium e WebKit do Playwright precisam estar instalados. Capturas e falhas estruturadas ficam em `test-results/responsiveness/`.

A suíte cobre os três idiomas e sete páginas nas 11 larguras solicitadas, paisagem, notebook baixo, limites de 1200 × 680, perfis de celular e área equivalente ao reflow de 200%. Verifica cortes internos, sobreposições em grupos de UI, controles do cabeçalho, geometria da cena, menu, rádio, pesquisa, filtros, formulário (requisição interceptada), telescópio e redimensionamento com animações ativas. O envio do formulário nunca chega ao serviço externo.

**Ainda requer conferência manual:** zoom real de 200% no navegador; Chrome em Android e Safari em iOS reais; foco do rádio/formulário com teclado virtual aberto; close e ações alcançáveis com rolagem; leitura das capturas e alinhamento visual dos hotspots. Emulação Playwright não substitui dispositivos reais. A suíte não foi executada pelo agente, conforme AGENTS.md.

## Evidências desta execução

- `npm.cmd run lint`: passou, sem avisos.
- `npm.cmd run typecheck`: passou.
- `npm.cmd test`: 28 arquivos, 223 testes passaram (incluindo a sintaxe do novo CSS).
- `npm.cmd run build`: passou, 21 páginas geradas e `ƒ Middleware` presente. Processos e portas conferidos antes; nenhum dev estava ativo.
- `node --check tests/responsiveness.browser.mjs` e `git diff --check`: passaram.
- Sem commit, push ou publicação. Aceite visual pendente dos resultados de navegador.
