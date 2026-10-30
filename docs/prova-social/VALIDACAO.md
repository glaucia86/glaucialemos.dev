# Revisão visual e navegador

Executar pela Glaucia. O agente não iniciou servidor, build ou navegador.

## Comandos

Com o servidor de desenvolvimento **parado**, executar `npm run build`. Conferir que o resultado ainda inclui `ƒ Middleware`. Em seguida, iniciar o servidor desejado, por exemplo:

```powershell
npm run start -- --hostname 127.0.0.1 --port 3100
```

Em outro terminal:

```powershell
$env:BASE_URL = 'http://127.0.0.1:3100'
# Somente depois da integração das fotografias escolhidas:
# $env:PHOTO_EXPECT = 'approved'
node tests/commercial.browser.mjs
```

O roteiro usa 1440×900 e 390×844 em PT/EN/ES, movimento normal, movimento reduzido e JavaScript desativado. Capturas em `%TEMP%\prova-social`. Envio e provedores do contato são interceptados; nenhum teste envia mensagem. `PHOTO_EXPECT` ausente verifica o estado atual, sem fotos aprovadas.

Para comparação com a main, se houver um servidor da versão anterior já disponível em outra porta, definir `BASELINE_URL` antes do roteiro. As capturas `before` e `after` usam as mesmas dimensões e idiomas. Não usar capturas antigas do tema Star Wars como referência da composição atual.

## Conferência visual após a abertura

- Primeira tela: nome/apresentação, três ofertas e CTAs legíveis em ambos os tamanhos. As logos ficam somente em Serviços, identificadas como experiência profissional; não aparecem na Home. Depois da seleção, o retrato deve aparecer junto da apresentação nas duas páginas, ainda na primeira tela.
- Desktop: a composição deve ocupar o lado esquerdo sem cobrir Glaucia, Prince, lanternas, estufa ou sinalizador. Testar todos os hotspots e a transição de rolagem.
- Celular: logos e texto sem corte lateral; cena inteira abaixo da apresentação; alvos continuam acessíveis por toque.
- `#formatos` aparece depois do hero e antes dos capítulos narrativos; os três blocos têm o mesmo peso visual. Mentoria menciona pessoas e empresas.
- Clicar e usar Tab/Enter em “Conheça os formatos” e “Vamos conversar”; confirmar preço sob consulta e os três `?assunto=`.
- Cada oferta em Serviços: mensagem/necessidade coerentes, portal, foco inicial, Tab preso, Esc/fechar e retorno do foco. Conferir que nenhuma interação envia ou escreve no formulário sem ação explícita.
- Sem JS/reduzido: conteúdo e referências visíveis; links nativos alcançam formatos e contato; ausência de molduras vazias.
- Fotografias escolhidas: aparência natural, proporção correta, legenda e fonte; não atribuir workshop, voluntariado ou evento sem prova.
- Conferir o menu curto “Serviços” e seus equivalentes, metadata e igualdade das três ofertas nos três idiomas.

Também executar as regressões existentes: `node tests/holonet.browser.mjs` e `node tests/aurelia.browser.mjs`. Compartilhar resultados e capturas antes de decidir pela integração na main.

## Antes e depois esperados

| Ponto | main de origem | Branch desta entrega |
| --- | --- | --- |
| Abertura Home | Engenharia/Liderança/IA; CTA de workshops/mentorias e projetos | Três formatos; apresentação aprovada; contato direto e `#formatos` |
| Prova profissional | Mais abaixo na trajetória | Faixa estática de Microsoft, Itaú e Zup na abertura de Serviços; sem logos na Home |
| Ofertas | Capítulo final da Home / jardim narrativo de Serviços | Três blocos equivalentes imediatamente após os dois heroes; detalhamento mantido |
| Serviços/menu | Workshops e mentorias | Palestras, workshops e mentorias / menu “Serviços” |
| Fotos reais | Ausentes | Componentes preparados; aguardam seleção explícita |
