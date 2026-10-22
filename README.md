# glaucialemos.dev

Site pessoal de Glaucia Lemos (pt/en/es).

Stack: Next.js (App Router) + TypeScript estrito + Tailwind CSS 4, validação de dados com Zod, testes com Vitest.

## Rodar localmente

```bash
npm ci
npm run dev        # http://localhost:3000 (redireciona para /pt, /en ou /es)
npm run typecheck && npm run lint && npm test && npm run build
```

## Testes de navegador

```bash
npx playwright install chromium
npm run test:e2e
```

A suíte inicia um servidor de desenvolvimento na porta 3100. Para testar um
servidor existente, defina `BASE_URL`. No ambiente em nuvem, o Chromium já está
disponível: use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`.

O design system segue o tema claro/escuro do sistema. Animações respeitam a
preferência de movimento reduzido e o controle no cabeçalho.

## Variáveis de ambiente

Copie `.env.example` para `.env.local`.

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_FORMSPREE_ID` | ID do formulário no Formspree. O formulário de contato envia via `https://formspree.io/f/<id>`; o e-mail de destino fica configurado na conta Formspree, nunca no código. Sem a variável, o formulário mostra que o envio está indisponível. |

Mais detalhes: `DECISOES.md` e `DESIGN-SYSTEM.md`.
