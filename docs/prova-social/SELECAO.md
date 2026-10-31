# Seleção de fotografias — aguardando escolha da Glaucia

Conferência em 27/10/2026. As imagens foram abertas e inspecionadas. Fontes são arquivos publicados pela própria Glaucia. Nenhuma candidata está publicada no site ou usada como espaço reservado.

| Uso | Candidata | Origem e contexto | Qualidade e proposta |
| --- | --- | --- | --- |
| Retrato principal (recomendado) | [Ver retrato SDD](selecao/retrato-sdd.png) | [Repositório de palestras SDD](https://github.com/glaucia86/palestra-sdd/blob/main/resources/images/foto_perfil.png). Retrato no escritório; não é registro de workshop. | 631×649 px, frontal, rosto bem visível. Adequado para 84 px no celular e 120 px no desktop, em moldura natural. |
| Retrato alternativo | [Ver retrato de 2019](selecao/retrato-2019.png) | [Site anterior](https://github.com/glaucia86/glaucialemos/blob/master/src/assets/images/perfil-glaucia-2019.png). Retrato com óculos e gorro; o nome do arquivo informa 2019. | 250×252 px, recorte circular, menos detalhe e mais antigo. Suficiente para moldura pequena, sem ampliar. |
| Registro em Serviços (recomendado) | [Ver foto palestrando](selecao/palestra.jpg) | [Arquivo do site anterior](https://github.com/glaucia86/glaucialemos/blob/master/src/assets/images/palestra.jpg). Glaucia identificada pelo próprio slide, falando ao microfone diante do público. | 900×600 px. Fotografia real de apresentação presencial. A fonte não identifica evento, cidade ou data: não atribuir esses dados nem contratação. |

Legenda proposta PT: “Glaucia Lemos em uma palestra presencial. Registro publicado no seu site anterior.”
EN: “Glaucia Lemos giving an in-person talk. Photo published on her previous website.”
ES: “Glaucia Lemos en una charla presencial. Foto publicada en su sitio anterior.”

Foram descartados desta seleção uma paisagem de viagem (`foto-eu-03.jpg`, sem Glaucia identificável), banners de eventos e capas de gravações. Não se inventou uma foto de workshop ou de mentoria para completar uma grade.

## Experiência profissional

Microsoft, Zup Innovation, Packt, Pagar.me e GlobalLogic LATAM constam de `src/data/experiencia.json`, com as fontes preservadas em `src/data/prova-social.ts`. Os logos foram obtidos dos perfis oficiais das organizações no GitHub: [Microsoft](https://github.com/microsoft), [Zup](https://github.com/ZupIT), [Packt](https://github.com/PacktPublishing) e [Pagar.me](https://github.com/pagarme). GlobalLogic LATAM aparece com iniciais. São vínculos de carreira, não depoimentos, clientes ou patrocínios.

Por decisão da Glaucia (31/10/2026), Itaú aparece somente no contexto profissional/de carreira em Sobre e na trajetória da Home, nunca em Serviços ou nos demais textos da Home e de Projetos. A entrada na faixa e o logo público foram removidos; o histórico de carreira foi preservado.

As versões locais dos logos têm 96×96 px. A faixa fica somente em Serviços, conforme a correção da Glaucia; exibe 24–32 px, estática, com nomes e links para o vínculo. Os arquivos de origem ficam em `selecao/` para auditoria.

## Integração após a escolha

1. Aprovar um retrato e o registro de atividade (ou manter as fotos pendentes).
2. Converter somente os escolhidos para WebP em `public/prova-social/`, preservando proporção e aparência natural.
3. Marcar somente os IDs escolhidos como `approved` em `src/data/prova-social.ts`. As dimensões já estão registradas.
4. Executar os testes unitários novamente; depois validar o enquadramento no navegador.
