# Galáxia Encantada — Epílogo Secreto: Além da Última Órbita

## Status e escopo

Especificação e prompts de trabalho; **nenhuma alteração de código ou asset foi aplicada** ao repositório. Base conferida na `main` (`a3225ab9c48e6a84118b38b3a33b02fb9f7085be`). A cena é autoral: as capturas de *Project Hail Mary* enviadas pela usuária servem apenas como referência de sentimento (escala, cor e contemplação), não de desenho, composição reproduzida ou licença.

## Conceito

- Título: **Além da Última Órbita**.
- Slug em todos os idiomas: `alem-da-ultima-orbita`.
- Scene ID: `beyond-orbit`.
- Fenômeno fictício original: **Véu das Possibilidades**, uma nebulosa de filamentos ramificados, verde-âmbar nas extremidades e coral luminoso no centro, diferente da Petrova Line.
- Local: pequeno terraço de observação flutuante e original, ligado ao universo Galáxia Encantada.
- Personagens: Glaucia e Prince, ambos de costas e pequenos diante da nebulosa.
- Atmosfera: silêncio, assombro, escala cósmica, continuidade e curiosidade. Sem áudio automático.
- Identidade visual: pixel art com pixels finos e nítidos, no padrão aprovado. Sem texto embutido nas imagens.

## Endereços

- `/pt/alem-da-ultima-orbita`
- `/en/alem-da-ultima-orbita`
- `/es/alem-da-ultima-orbita`

A rota fica **fora do menu principal e do sitemap** e usa `noindex`; isso é segredo narrativo, não controle de acesso. Um URL direto deve funcionar e ser compartilhável. O backend não deve depender de localStorage, nem apresentar 403/404 por falta de progresso.

## Condição de desbloqueio e descoberta

1. Somar **uma ou mais descobertas em pelo menos três mundos distintos** entre `home`, `about`, `projects` e `content`, usando somente IDs já presentes no catálogo central `src/lib/eggs.ts`.
2. Ao visitar o final de `/[lang]/servicos` (Aurélia, após a migração), aparece uma estrela discreta no terminal de comunicação; ativação por clique, toque e Enter/Espaço.
3. Também aceitar o comando `alemdaultimaorbita` no Comlink **nessa página**, respeitando a mesma elegibilidade, com resposta localizada quando ainda faltarem mundos.
4. Ao acionar, executar `discover('epilogue-signal')` e navegar para `/${lang}/alem-da-ultima-orbita`.
5. Quando o sinal estiver descoberto, mostrar no Comlink um link para **Revisitar o epílogo**, sem colocá-lo no menu principal.
6. Um segundo segredo `last-light`, na página epílogo, é revelado ao acionar uma estrela acessível, deixando aparecer **To be continued…**. Deve poder ser reexecutado.
7. Se alguém souber o link direto, permitir o acesso; isso não marca automaticamente `epilogue-signal` como concluído.
8. O reset existente no Comlink deve remover também os dois novos segredos. Não criar um armazenamento paralelo.

### Lógica pura proposta

```ts
import { EGGS, type EggId, type EggPage } from '@/lib/eggs';

const WORLDS = new Set<EggPage>(['home', 'about', 'projects', 'content']);
export function discoveredWorldCount(found: readonly EggId[]): number {
  const ids = new Set(found);
  return new Set(
    EGGS.filter(egg => ids.has(egg.id) && WORLDS.has(egg.page))
        .map(egg => egg.page)
  ).size;
}
export const epilogueRemaining = (found: readonly EggId[]) =>
  Math.max(0, 3 - discoveredWorldCount(found));
export const epilogueUnlocked = (found: readonly EggId[]) =>
  epilogueRemaining(found) === 0;
```

Estender `remainingDiscoveries` para `epilogue-signal` ou centralizar a regra neste helper com testes, sem conflitar com o gate de `curious-letter`. A mensagem de bloqueio do Comlink deve mencionar **mundos**, não apenas descobertas.

## Sequência de experiência

- Entrada: transição leve, céu amplo e personagens imóveis sobre o terraço (não criar outra abertura obrigatória `BootSequence`).
- Ambiente: estrelas com paralaxe discreta, brilho verde-âmbar de borda e filamentos coral, densidade limitada de partículas. A nebulosa **não** deve piscar rapidamente nem cobrir o texto.
- Na primeira interação com a estrela, a iluminação da nebulosa respira uma única vez; Glaucia inclina sutilmente a cabeça e Prince abana a cauda.
- Revelação: aparece `To be continued…` com transição lenta; o texto também deve existir no DOM desde o SSR e permanecer disponível sem JS e com redução de movimento.
- Saída: `Voltar ao Observatório` e um link secundário opcional para `Explorar os mundos`.
- Revisita: animação curta sem bloquear navegação; visitante pode repetir o segredo no Comlink.

## Acessibilidade, comportamento e performance

- Foco de teclado evidente; alvos de toque de no mínimo 44×44 CSS px.
- Não depender de hover, tempo de reação nem gestos específicos para revelar a mensagem.
- `prefers-reduced-motion` e controle manual anulam paralaxes e partículas, mas não escondem copy ou a ação.
- Sem JS: fundo estático, copy e navegação acessíveis.
- Sem WebGL: mesma experiência base.
- Sem som automático; qualquer som deve respeitar o opt-in já existente em `src/lib/sfx.ts`.
- `requestAnimationFrame` desligado fora da viewport e com aba oculta; limpar RAF, timers, event listeners e observers no unmount.
- Medir LCP, CLS, INP e peso real da rota antes/depois; não presumir FPS ou Lighthouse.
- Usar assets separados por camadas, evitando recompor fundos aprovados do restante do projeto.

## Integração aos arquivos reais

**Criar:**

- `src/app/[lang]/alem-da-ultima-orbita/page.tsx`
- `src/app/beyond-orbit.css`
- `src/components/epilogue/BeyondOrbitScene.tsx`
- `src/components/epilogue/BeyondOrbitMotion.tsx`
- `src/components/epilogue/EpilogueSignal.tsx`
- `src/lib/epilogue.ts`
- `src/i18n/beyond-orbit.ts`
- `tests/epilogue.test.ts`
- `tests/epilogue.browser.mjs`

**Integrar:**

- `src/lib/eggs.ts`: `EggPage` inclui `epilogue`; `epilogue-signal` vinculado a `services`; `last-light` vinculado a `epilogue`; mapear slug em `pageOf`; validar frases e progresso.
- `src/i18n/comlink.ts`: nomes, dicas, textos de desbloqueio PT/EN/ES; mapa de páginas expandido; contagem de segredos atualizada automaticamente.
- `src/components/Comlink.tsx`: comando e tratamento localizado de requisito de três mundos; link de revisita quando o sinal já tiver sido encontrado.
- `src/app/[lang]/servicos/page.tsx`: montar `EpilogueSignal` depois do conteúdo funcional, sem alterar ou bloquear formulário.
- `src/lib/scenes.ts`: adicionar assets/tipagem/cena `beyond-orbit` quando arte tiver sido aprovada.
- `src/data/galaxia/layout.json`: posição de Glaucia/Prince, mesma estratégia de pixel grid dos mundos atuais.
- `scripts/build-galaxia-assets.mjs`: adicionar cena 08 a `SCENES`, poses em `POSES`, nomes dos arquivos de fonte e pipeline de build, apenas quando os assets estiverem disponíveis.
- `AGENTS.md`, `docs/galaxia-encantada/HANDOFF.md` e documentação da migração com decisões e validação.

**Fontes propostas** (produzir e aprovar separadamente):

- `docs/art/galaxia-encantada/approved-source/GE-PL-08-beyond-orbit.png`
- `docs/art/galaxia-encantada/approved-source/GE-GL-08-beyond-orbit.png`
- `docs/art/galaxia-encantada/approved-source/GE-DOG-08-beyond-orbit.png`
- Saída web pelo pipeline: `public/galaxia/scenes/beyond-orbit/background.webp`, atores sob `public/galaxia/actors/*/beyond-orbit/` e manifesto de `src/data/galaxia/beyond-orbit.json`.

## Critérios de aceite

1. Três descobertas no mesmo mundo não desbloqueiam; uma em três mundos diferentes desbloqueia.
2. A página Serviços apresenta a interação somente com elegibilidade, com teclado e toque equivalentes.
3. Comlink aceita o comando elegível, retorna bloqueio localizado para não elegíveis e permite revisita após descoberta.
4. Link direto funciona sem autenticação e sem bloquear server render.
5. `last-light` revela a frase final uma vez, pode ser reexecutido, persiste e é removido com reset.
6. Todos os textos existem em PT, EN e ES; `To be continued…` permanece em inglês nas três versões por decisão criativa.
7. Sem JS e com reduce-motion, texto e links continuam visíveis e utilizáveis.
8. Mobile e desktop não cortam atores nem texto; sem scroll lock não solicitado.
9. Sem referências visuais derivativas de *Project Hail Mary* ou de Star Wars.
10. Testes unitários, tipagem, lint, build e testes de navegador quando autorizados; não afirmar que foram executados se não foram.

## Plano de vertical slices

- **M0:** Documentar contratos, copy, gate e arte; não alterar assets aprovados.
- **M1:** Criar route SSR com fundo temporário neutro, copy, metadata `noindex` e links, validando responsividade.
- **M2:** Integrar `epilogue-signal`, Comlink, persistência, reset e unit tests.
- **M3:** Produzir/validar artes 08, integrar o pipeline e a composição.
- **M4:** Adicionar movimentos suaves e segredo `last-light` com fallback estático.
- **M5:** Testes E2E, acessibilidade, imagens, performance e aprovação visual antes de PR/merge/deploy.

**Restrição do repositório:** consultar e respeitar `AGENTS.md`; não iniciar servidor nem rodar testes de navegador por conta própria se a instrução vigente os proibir. Não fazer push/merge/deploy sem autorização.
