# glaucialemos.dev

Site pessoal de Glaucia Lemos (pt/en/es).

Stack: Next.js (App Router) + TypeScript estrito + Tailwind CSS 4, validação de dados com Zod, testes com Vitest.

## Rodar localmente

```bash
npm ci
npm run dev        # http://localhost:3000 (redireciona para /pt, /en ou /es)
npm run typecheck && npm run lint && npm test && npm run build
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local`.

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_FORMSPREE_ID` | ID do formulário no Formspree. O formulário de contato envia via `https://formspree.io/f/<id>`; o e-mail de destino fica configurado na conta Formspree, nunca no código. Sem a variável, o formulário mostra que o envio está indisponível. |

Mais detalhes: `DECISOES.md` e `DESIGN-SYSTEM.md`.

## Home cinematográfica

A direção de movimento, os controles de acessibilidade e as instruções da suíte de navegador estão em [docs/cinematic-home.md](docs/cinematic-home.md).
