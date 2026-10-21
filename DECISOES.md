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
- Sem `NEXT_PUBLIC_FORMSPREE_ID`, o formulário comunica a indisponibilidade e bloqueia o envio; nenhum email pessoal é incluído.
- Como o sandbox não possui rede, fontes do Google não podem ser baixadas no build. Foi usado `next/font/local` com Geist e Geist Mono livres já presentes no Next.js instalado; a mono cria a linguagem de títulos pixel sem recorrer a fontes oficiais de franquias.
