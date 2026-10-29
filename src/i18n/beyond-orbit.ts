import type { Locale } from "./config";
import type { EggPage } from "@/lib/egg-catalog";

export type BeyondOrbitCopy = {
  chapter: string;
  title: string;
  eyebrow: string;
  intro: string;
  body: string;
  signalTitle: string;
  signalBody: string;
  signalAction: string;
  signalLocked: string;
  revisit: string;
  starAction: string;
  finale: string;
  postscript: string;
  back: string;
  explore: string;
  sceneAlt: string;
  starHint: string;
  skip: string;
  coordinates: string;
  constellation: string;
  found: string;
  mapped: string;
  noWorlds: string;
  worlds: Record<EggPage, string>;
  creditsTitle: string;
  creditsKicker: string;
  // `{found}`, `{total}` and `{worlds}` are filled with the visitor's journey on the client.
  credits: { role: string; name: string }[];
  thanks: string;
  postTitle: string;
  postSignal: string;
  postBody: string;
  postNone: string;
  voyage: string;
  letterTitle: string;
  letter: string[];
  signature: string;
  atlasTitle: string;
  atlasIntro: string;
  moons: string;
  missing: string;
  seeHint: string;
  revisitWorld: string;
  faint: string;
  allFound: string;
  nextStar: string;
  nextBody: string;
  replay: string;
  episode: { kicker: string; watch: string; title: string; close: string; note: string; tracks: Record<Locale, string> };
};

export const beyondOrbit: Record<Locale, BeyondOrbitCopy> = {
  "pt": {
    "chapter": "EPÍLOGO // 08",
    "title": "Além da Última Órbita",
    "eyebrow": "COORDENADAS DESCONHECIDAS",
    "intro": "Você chegou onde o mapa termina.",
    "body": "Há viagens que terminam. E há viagens que apenas revelam a próxima estrela.",
    "signalTitle": "Transmissão desconhecida",
    "signalBody": "Detectamos coordenadas além do mapa conhecido.",
    "signalAction": "Seguir o sinal",
    "signalLocked": "O sinal ainda está fraco. Descubra algo em mais {n} mundos para recebê-lo.",
    "revisit": "Revisitar o epílogo",
    "starAction": "Revelar a última estrela",
    "finale": "To be continued…",
    "postscript": "Enquanto houver curiosidade, haverá caminho.",
    "back": "Voltar ao Observatório",
    "explore": "Explorar os mundos",
    "sceneAlt": "Glaucia à esquerda e Prince à direita flutuam de costas, voltados para o centro de uma nebulosa verde e âmbar. Usam trajes claros, capacetes e cabos de suporte de vida.",
    "starHint": "Uma estrela pulsa discretamente perto do horizonte.",
    "skip": "Pular cena",
    "coordinates": "AR 18h 36m 56s · DEC +38° 47′ 01″",
    "constellation": "Constelação da sua jornada",
    "found": "{found} de {total} segredos",
    "mapped": "{total} segredos no mapa",
    "noWorlds": "Nenhum, ainda",
    "worlds": { "home": "Observatório das Primeiras Luzes", "about": "Nivéora", "projects": "Vale das Invenções", "content": "Lúmina", "events": "Atlas das Conexões", "services": "Aurélia, os Jardins Suspensos", "notfound": "Maré Rubra", "global": "Entre os mundos", "epilogue": "Além da Última Órbita" },
    "creditsTitle": "Créditos",
    "creditsKicker": "Um filme de Glaucia Lemos",
    "credits": [
      { "role": "Direção, roteiro e código", "name": "Glaucia Lemos" },
      { "role": "Copiloto de quatro patas", "name": "Prince" },
      { "role": "Tripulação convidada", "name": "Você" },
      { "role": "Segredos encontrados", "name": "{found} de {total}" },
      { "role": "Mundos explorados", "name": "{worlds}" },
      { "role": "Filmado em", "name": "Pixel art, além da última órbita" },
      { "role": "Trilha sonora", "name": "Sintetizada ao vivo no seu navegador" },
      { "role": "Efeitos especiais", "name": "Poeira estelar e curiosidade" },
      { "role": "Nenhuma estrela foi apagada", "name": "durante as filmagens" }
    ],
    "thanks": "Obrigada por explorar.",
    "postTitle": "Cena pós-créditos",
    "postSignal": "Sinal interceptado",
    "postBody": "Novas coordenadas detectadas:",
    "postNone": "Todos os mundos foram mapeados. A tripulação aguarda a próxima missão.",
    "voyage": "A VIAGEM",
    "letterTitle": "Carta da tripulação",
    "letter": [
      "Para quem chegou até aqui:",
      "Cada mundo desta galáxia nasceu de uma pergunta.",
      "O Observatório perguntou onde tudo começou. Nivéora guardou o que aprendi no frio. Marte mostrou o que construí com as mãos. Lúmina guardou cada palavra que escrevi.",
      "Aurélia abriu os jardins para o que podemos cultivar juntos.",
      "Você não só visitou: procurou, clicou, digitou e esperou a neve cair.",
      "Foi a curiosidade que me trouxe até aqui, e foi ela que trouxe você.",
      "O Prince já está abanando o rabo para a próxima órbita.",
      "Obrigada por explorar comigo."
    ],
    "signature": "Glaucia & Prince",
    "atlasTitle": "Atlas da viagem",
    "atlasIntro": "Cada mundo é um planeta. Cada segredo que você encontrou virou uma lua.",
    "moons": "Luas encontradas",
    "missing": "Ainda escondidas",
    "seeHint": "Ver pista",
    "revisitWorld": "Revisitar {world}",
    "faint": "Sinal fraco. Este mundo ainda está a caminho.",
    "allFound": "Todas as luas encontradas!",
    "nextStar": "A próxima estrela",
    "nextBody": "Toda viagem termina num céu novo.",
    "replay": "Tocar a última luz de novo",
    "episode": { "kicker": "Episódio 08", "watch": "Assistir: Além da Última Órbita", "title": "Episódio — Além da Última Órbita", "close": "Fechar episódio", "note": "Com som e legendas. Narração em português.", "tracks": { "pt": "Português", "en": "English", "es": "Español" } }
  },
  "en": {
    "chapter": "EPILOGUE // 08",
    "title": "Beyond the Last Orbit",
    "eyebrow": "UNKNOWN COORDINATES",
    "intro": "You've reached the edge of the map.",
    "body": "Some journeys end. Others simply reveal the next star.",
    "signalTitle": "Unknown transmission",
    "signalBody": "We've detected coordinates beyond the known map.",
    "signalAction": "Follow the signal",
    "signalLocked": "The signal is still faint. Make a discovery in {n} more worlds to receive it.",
    "revisit": "Revisit the epilogue",
    "starAction": "Reveal the final star",
    "finale": "To be continued…",
    "postscript": "Where curiosity remains, there is always a way forward.",
    "back": "Back to the Observatory",
    "explore": "Explore the worlds",
    "sceneAlt": "Glaucia on the left and Prince on the right float with their backs to us, facing the center of a green and amber nebula. They wear light spacesuits and helmets with life-support cables.",
    "starHint": "One star pulses softly near the horizon.",
    "skip": "Skip scene",
    "coordinates": "RA 18h 36m 56s · DEC +38° 47′ 01″",
    "constellation": "Your journey's constellation",
    "found": "{found} of {total} secrets",
    "mapped": "{total} secrets on the map",
    "noWorlds": "None yet",
    "worlds": { "home": "Observatory of First Lights", "about": "Nivéora", "projects": "Valley of Inventions", "content": "Lúmina", "events": "Atlas of Connections", "services": "Aurélia, the Hanging Gardens", "notfound": "Red Tide", "global": "Between worlds", "epilogue": "Beyond the Last Orbit" },
    "creditsTitle": "Credits",
    "creditsKicker": "A film by Glaucia Lemos",
    "credits": [
      { "role": "Directed, written and coded by", "name": "Glaucia Lemos" },
      { "role": "Four-legged co-pilot", "name": "Prince" },
      { "role": "Guest crew", "name": "You" },
      { "role": "Secrets found", "name": "{found} of {total}" },
      { "role": "Worlds explored", "name": "{worlds}" },
      { "role": "Filmed in", "name": "Pixel art, beyond the last orbit" },
      { "role": "Soundtrack", "name": "Synthesized live in your browser" },
      { "role": "Special effects", "name": "Stardust and curiosity" },
      { "role": "No stars were harmed", "name": "in the making of this epilogue" }
    ],
    "thanks": "Thank you for exploring.",
    "postTitle": "Post-credits scene",
    "postSignal": "Signal intercepted",
    "postBody": "New coordinates detected:",
    "postNone": "Every world has been charted. The crew awaits the next mission.",
    "voyage": "THE VOYAGE",
    "letterTitle": "A letter from the crew",
    "letter": [
      "To whoever made it this far:",
      "Every world in this galaxy was born from a question.",
      "The Observatory asked where it all began. Nivéora kept what I learned in the cold. Mars showed what I built with my own hands. Lúmina kept every word I wrote.",
      "Aurélia opened its gardens to what we can grow together.",
      "You didn't just visit: you searched, clicked, typed and waited for the snow to fall.",
      "Curiosity brought me here, and it brought you too.",
      "Prince is already wagging his tail at the next orbit.",
      "Thank you for exploring with me."
    ],
    "signature": "Glaucia & Prince",
    "atlasTitle": "Atlas of the voyage",
    "atlasIntro": "Every world is a planet. Every secret you found became a moon.",
    "moons": "Moons found",
    "missing": "Still hidden",
    "seeHint": "Show hint",
    "revisitWorld": "Revisit {world}",
    "faint": "Faint signal. This world is still on its way.",
    "allFound": "Every moon found!",
    "nextStar": "The next star",
    "nextBody": "Every voyage ends under a new sky.",
    "replay": "Play the last light again",
    "episode": { "kicker": "Episode 08", "watch": "Watch: Beyond the Last Orbit", "title": "Episode — Beyond the Last Orbit", "close": "Close episode", "note": "With sound and captions. Narration in Portuguese.", "tracks": { "pt": "Português", "en": "English", "es": "Español" } }
  },
  "es": {
    "chapter": "EPÍLOGO // 08",
    "title": "Más allá de la última órbita",
    "eyebrow": "COORDENADAS DESCONOCIDAS",
    "intro": "Has llegado al límite del mapa.",
    "body": "Hay viajes que terminan. Y otros que simplemente revelan la próxima estrella.",
    "signalTitle": "Transmisión desconocida",
    "signalBody": "Hemos detectado coordenadas más allá del mapa conocido.",
    "signalAction": "Seguir la señal",
    "signalLocked": "La señal todavía es débil. Haz un descubrimiento en {n} mundos más para recibirla.",
    "revisit": "Volver al epílogo",
    "starAction": "Revelar la última estrella",
    "finale": "To be continued…",
    "postscript": "Mientras exista curiosidad, siempre habrá un camino.",
    "back": "Volver al Observatorio",
    "explore": "Explorar los mundos",
    "sceneAlt": "Glaucia a la izquierda y Prince a la derecha flotan de espaldas, mirando hacia el centro de una nebulosa verde y ámbar. Llevan trajes claros, cascos y cables de soporte vital.",
    "starHint": "Una estrella palpita suavemente cerca del horizonte.",
    "skip": "Saltar escena",
    "coordinates": "AR 18h 36m 56s · DEC +38° 47′ 01″",
    "constellation": "La constelación de tu viaje",
    "found": "{found} de {total} secretos",
    "mapped": "{total} secretos en el mapa",
    "noWorlds": "Ninguno, todavía",
    "worlds": { "home": "Observatorio de las Primeras Luces", "about": "Nivéora", "projects": "Valle de los Inventos", "content": "Lúmina", "events": "Atlas de las Conexiones", "services": "Aurélia, los Jardines Colgantes", "notfound": "Marea Roja", "global": "Entre los mundos", "epilogue": "Más allá de la última órbita" },
    "creditsTitle": "Créditos",
    "creditsKicker": "Una película de Glaucia Lemos",
    "credits": [
      { "role": "Dirección, guion y código", "name": "Glaucia Lemos" },
      { "role": "Copiloto de cuatro patas", "name": "Prince" },
      { "role": "Tripulación invitada", "name": "Tú" },
      { "role": "Secretos encontrados", "name": "{found} de {total}" },
      { "role": "Mundos explorados", "name": "{worlds}" },
      { "role": "Filmado en", "name": "Pixel art, más allá de la última órbita" },
      { "role": "Banda sonora", "name": "Sintetizada en vivo en tu navegador" },
      { "role": "Efectos especiales", "name": "Polvo de estrellas y curiosidad" },
      { "role": "Ninguna estrella se apagó", "name": "durante el rodaje" }
    ],
    "thanks": "Gracias por explorar.",
    "postTitle": "Escena poscréditos",
    "postSignal": "Señal interceptada",
    "postBody": "Nuevas coordenadas detectadas:",
    "postNone": "Todos los mundos han sido cartografiados. La tripulación espera la próxima misión.",
    "voyage": "EL VIAJE",
    "letterTitle": "Carta de la tripulación",
    "letter": [
      "Para quien llegó hasta aquí:",
      "Cada mundo de esta galaxia nació de una pregunta.",
      "El Observatorio preguntó dónde empezó todo. Nivéora guardó lo que aprendí en el frío. Marte mostró lo que construí con mis manos. Lúmina guardó cada palabra que escribí.",
      "Aurélia abrió sus jardines a lo que podemos cultivar juntos.",
      "No solo visitaste: buscaste, hiciste clic, escribiste y esperaste a que cayera la nieve.",
      "Fue la curiosidad la que me trajo hasta aquí, y fue ella la que te trajo a ti.",
      "Prince ya está moviendo la cola hacia la próxima órbita.",
      "Gracias por explorar conmigo."
    ],
    "signature": "Glaucia & Prince",
    "atlasTitle": "Atlas del viaje",
    "atlasIntro": "Cada mundo es un planeta. Cada secreto que encontraste se convirtió en una luna.",
    "moons": "Lunas encontradas",
    "missing": "Todavía escondidas",
    "seeHint": "Ver pista",
    "revisitWorld": "Volver a {world}",
    "faint": "Señal débil. Este mundo todavía está en camino.",
    "allFound": "¡Todas las lunas encontradas!",
    "nextStar": "La próxima estrella",
    "nextBody": "Todo viaje termina bajo un cielo nuevo.",
    "replay": "Tocar la última luz otra vez",
    "episode": { "kicker": "Episodio 08", "watch": "Ver: Más allá de la última órbita", "title": "Episodio — Más allá de la última órbita", "close": "Cerrar episodio", "note": "Con sonido y subtítulos. Narración en portugués.", "tracks": { "pt": "Português", "en": "English", "es": "Español" } }
  }
};
