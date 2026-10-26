// Content page: Lúmina, the Living Library.
import type { SeriesId } from "@/lib/lumina-records";

type Lang = "pt-BR" | "en" | "es";

export type LuminaCopy = {
  discoveries: string;
  boot: { lines: [string, string, string, string]; granted: string; skip: string; label: string; brand: string };
  hud: { channel: string; location: string; light: string; hint: string; touch: string; glaucia: string; crystal: string; prince: string; books: string };
  chapters: [string, string, string, string, string];
  hero: { title: string; intro: string; extra: string; caption: string; scroll: string; jump: string; readouts: [string, string, string] };
  status: { touching: string; whispered: string; sniffing: string; found: string };
  readout: { whisper: string; whisperNote: string; first: string; firstNote: string; published: string; platform: string; language: string; shelf: string; again: string; close: string };
  languages: Record<Lang, string>;
  rings: { title: string; intro: string; statsLabel: string; stats: { records: string; platforms: string; languages: string; years: string }; yearsLabel: string; year: string; veins: string };
  shelves: {
    title: string; intro: string; platform: string; language: string; year: string; any: string; search: string; placeholder: string;
    sort: string; sorts: { recent: string; oldest: string }; count: string; empty: string; clear: string; open: string;
    echo: { label: string; title: string; later: string; earlier: string; same: string };
  };
  prism: { label: string; intro: string; turn: string; aligned: string; title: string; body: string; fallback: string };
  collections: { title: string; intro: string; parts: string; node: string; wrong: string; complete: string; names: Record<SeriesId, string> };
  dusk: { label: string; day: string; dusk: string; title: string; body: string; relight: string; fallback: string };
  tv: { kicker: string; power: string; off: string; open: string; tuning: string; saved: string; aired: string; thumb: string; screen: string };
  credits: { title: string; body: string; cta: string; secondary: string; last: string; lastNote: string; hint: string; end: string };
};

export const lumina: Record<"pt" | "en" | "es", LuminaCopy> = {
  pt: {
    discoveries: "Descobertas em Lúmina: {n}/{total}",
    boot: { lines: ["GALÁXIA ENCANTADA // rota para Lúmina", "pouso no terraço de cristal: confirmado", "scanner do Prince calibrado", "acendendo {records} registros da biblioteca"], granted: "ARQUIVO ACESO", skip: "Pular abertura", label: "Abertura de Lúmina", brand: "// LÚMINA" },
    hud: {
      channel: "ARQUIVO // BIBLIOTECA VIVA", location: "LÚMINA · TERRAÇO DE CRISTAL", light: "LUZ",
      hint: "Clique na Glaucia · no cristal · no Prince", touch: "Toque na Glaucia, no cristal ou no Prince",
      glaucia: "Glaucia: tocar o cristal", crystal: "Cristal: ouvir um sussurro do arquivo", prince: "Prince: farejar a pilha de livros", books: "Livros: o que o Prince encontrou",
    },
    chapters: ["Biblioteca Viva", "Anéis de cristal", "Estantes", "Coleções", "Próximo capítulo"],
    hero: {
      title: "Uma biblioteca que cresce em cristal.",
      intro: "Artigos, tutoriais e guias para aprender fazendo, em português, inglês e espanhol. Cada texto publicado ficou guardado aqui como um cristal de luz.",
      extra: "{records} registros desde {first}, em {platforms} plataformas. Filtre, procure e siga as séries do começo ao fim.",
      caption: "Biblioteca a céu aberto", scroll: "Role para os anéis de cristal", jump: "Arquivo aberto",
      readouts: ["registros", "plataformas", "idiomas"],
    },
    status: { touching: "O cristal está ouvindo…", whispered: "Um sussurro do arquivo", sniffing: "O Prince farejou algo…", found: "Primeira página encontrada" },
    readout: {
      whisper: "Sussurro de {year}", whisperNote: "Cada toque traz um texto de um ano da biblioteca.",
      first: "A primeira página", firstNote: "O registro mais antigo da biblioteca, guardado embaixo da pilha.",
      published: "publicado em", platform: "plataforma", language: "idioma", shelf: "Ver na estante", again: "Outro sussurro", close: "Fechar",
    },
    languages: { "pt-BR": "Português", en: "Inglês", es: "Espanhol" },
    rings: {
      title: "Os anéis da biblioteca.", intro: "Como num tronco, cada ano deixa um anel: uma coluna de cristal por ano de publicação. Escolha um ano para abrir a estante nele.",
      statsLabel: "A biblioteca em números", stats: { records: "registros", platforms: "plataformas", languages: "idiomas", years: "anos de biblioteca" },
      yearsLabel: "Registros por ano", year: "{year}: {n} registros", veins: "Veios por plataforma",
    },
    shelves: {
      title: "Estantes.", intro: "Todos os registros, do mais novo ao mais antigo. Filtre por plataforma, idioma ou ano e procure pelo título.",
      platform: "Plataforma", language: "Idioma", year: "Ano", any: "Todos", search: "Buscar nas estantes", placeholder: "título ou tema…",
      sort: "Ordem", sorts: { recent: "Mais novos", oldest: "Mais antigos" }, count: "{n} de {total} registros", empty: "Nenhum cristal com esse brilho. Tente outro termo.", clear: "Limpar filtros", open: "Ler o artigo",
      echo: { label: "Eco: publicado de novo", title: "Este texto tem um eco", later: "{n} dias depois", earlier: "{n} dias antes", same: "no mesmo dia" },
    },
    prism: {
      label: "Portal prismático", intro: "Três prismas, um por idioma. Gire cada um até o feixe apontar para o portal.",
      turn: "Prisma {lang}: girar (posição {n} de 4)", aligned: "Feixes alinhados", title: "Mesma ideia, outra língua", body: "Textos que escrevi duas vezes, para leitores de idiomas diferentes.",
      fallback: "Mesma ideia, outra língua: pares de tradução",
    },
    collections: {
      title: "Coleções.", intro: "Séries que se leem em ordem. Acenda os cristais do primeiro ao último para ver a constelação inteira.",
      parts: "{n} partes", node: "Acender o cristal {n} de {total}: {title}", wrong: "Esse cristal vem depois. Comece pelo primeiro aceso.",
      complete: "Constelação completa: {n} partes, de {first} a {last}.",
      names: { "typescript-zero-to-hero": "TypeScript Zero to Hero", "azure-openai-guide": "Guia prático: Azure OpenAI com JavaScript e TypeScript", "vue-calculator": "Calculadora em Vue.js", "star-wars-crawler": "Star Wars Crawler com Azure Static Web Apps" },
    },
    dusk: {
      label: "Luz da biblioteca", day: "Dia", dusk: "Entardecer", title: "Coleção do entardecer", body: "Quando a luz baixa, acendem os textos mais pessoais: histórias de carreira e conselhos para quem está começando.",
      relight: "Reacender a biblioteca", fallback: "Coleção do entardecer: textos pessoais",
    },
    tv: { kicker: "Último vídeo do canal", power: "Ligar a TV", off: "Desligar a TV", open: "Abrir no YouTube", tuning: "Sintonizando…", saved: "Última transmissão salva", aired: "Transmitido em {date}", thumb: "Miniatura do vídeo: {title}", screen: "TV antiga" },
    credits: {
      title: "O próximo capítulo pode ser do seu time.", body: "Muitos destes textos nasceram de workshops e mentorias. Traga o desafio do seu time e a gente escreve o próximo juntos.",
      cta: "Workshops e mentorias", secondary: "Assistir no YouTube", last: "A última página escrita", lastNote: "O registro mais recente da biblioteca.",
      hint: "Dica do arquivo: Lúmina esconde 7 segredos. O rádio estelar, no cabeçalho, ajuda a encontrar todos.", end: "Fim da transmissão // Arquivo aceso",
    },
  },
  en: {
    discoveries: "Discoveries in Lúmina: {n}/{total}",
    boot: { lines: ["ENCHANTED GALAXY // course set for Lúmina", "landing on the crystal terrace: confirmed", "Prince's scanner calibrated", "lighting up {records} library records"], granted: "ARCHIVE LIT", skip: "Skip intro", label: "Lúmina intro", brand: "// LÚMINA" },
    hud: {
      channel: "ARCHIVE // LIVING LIBRARY", location: "LÚMINA · CRYSTAL TERRACE", light: "LIGHT",
      hint: "Click Glaucia · the crystal · Prince", touch: "Tap Glaucia, the crystal or Prince",
      glaucia: "Glaucia: touch the crystal", crystal: "Crystal: hear a whisper from the archive", prince: "Prince: sniff the stack of books", books: "Books: what Prince found",
    },
    chapters: ["Living Library", "Crystal rings", "Shelves", "Collections", "Next chapter"],
    hero: {
      title: "A library that grows in crystal.",
      intro: "Articles, tutorials and guides for learning by doing, in Portuguese, English and Spanish. Every text I published is kept here as a crystal of light.",
      extra: "{records} records since {first}, across {platforms} platforms. Filter, search and follow each series from start to finish.",
      caption: "Open-air library", scroll: "Scroll to the crystal rings", jump: "Archive open",
      readouts: ["records", "platforms", "languages"],
    },
    status: { touching: "The crystal is listening…", whispered: "A whisper from the archive", sniffing: "Prince smelled something…", found: "First page found" },
    readout: {
      whisper: "Whisper from {year}", whisperNote: "Each touch brings back a text from one year of the library.",
      first: "The first page", firstNote: "The oldest record in the library, kept at the bottom of the stack.",
      published: "published", platform: "platform", language: "language", shelf: "See it on the shelf", again: "Another whisper", close: "Close",
    },
    languages: { "pt-BR": "Portuguese", en: "English", es: "Spanish" },
    rings: {
      title: "The library's rings.", intro: "Like a tree trunk, each year leaves a ring: one crystal column per year of publishing. Pick a year to open the shelves on it.",
      statsLabel: "The library in numbers", stats: { records: "records", platforms: "platforms", languages: "languages", years: "years of library" },
      yearsLabel: "Records per year", year: "{year}: {n} records", veins: "Veins by platform",
    },
    shelves: {
      title: "Shelves.", intro: "Every record, newest to oldest. Filter by platform, language or year and search by title.",
      platform: "Platform", language: "Language", year: "Year", any: "All", search: "Search the shelves", placeholder: "title or topic…",
      sort: "Order", sorts: { recent: "Newest", oldest: "Oldest" }, count: "{n} of {total} records", empty: "No crystal shines like that. Try another term.", clear: "Clear filters", open: "Read the article",
      echo: { label: "Echo: published again", title: "This text has an echo", later: "{n} days later", earlier: "{n} days earlier", same: "the same day" },
    },
    prism: {
      label: "Prismatic gate", intro: "Three prisms, one per language. Turn each one until its beam points at the gate.",
      turn: "{lang} prism: turn (position {n} of 4)", aligned: "Beams aligned", title: "Same idea, another language", body: "Texts I wrote twice, for readers of different languages.",
      fallback: "Same idea, another language: translation pairs",
    },
    collections: {
      title: "Collections.", intro: "Series meant to be read in order. Light the crystals from first to last to see the whole constellation.",
      parts: "{n} parts", node: "Light crystal {n} of {total}: {title}", wrong: "That crystal comes later. Start from the first unlit one.",
      complete: "Constellation complete: {n} parts, from {first} to {last}.",
      names: { "typescript-zero-to-hero": "TypeScript Zero to Hero", "azure-openai-guide": "A practical guide: Azure OpenAI with JavaScript and TypeScript", "vue-calculator": "A calculator in Vue.js", "star-wars-crawler": "Star Wars Crawler with Azure Static Web Apps" },
    },
    dusk: {
      label: "Library light", day: "Day", dusk: "Dusk", title: "The dusk collection", body: "When the light goes down, the most personal texts light up: career stories and advice for people starting out.",
      relight: "Light the library again", fallback: "The dusk collection: personal texts",
    },
    tv: { kicker: "Latest video on the channel", power: "Turn the TV on", off: "Turn the TV off", open: "Open on YouTube", tuning: "Tuning in…", saved: "Last saved broadcast", aired: "Aired on {date}", thumb: "Video thumbnail: {title}", screen: "Old TV" },
    credits: {
      title: "The next chapter could be your team's.", body: "Many of these texts were born in workshops and mentoring. Bring your team's challenge and we'll write the next one together.",
      cta: "Workshops and mentoring", secondary: "Watch on YouTube", last: "The latest page written", lastNote: "The most recent record in the library.",
      hint: "Archive tip: Lúmina hides 7 secrets. The star radio, in the header, helps you find them all.", end: "End of transmission // Archive lit",
    },
  },
  es: {
    discoveries: "Descubrimientos en Lúmina: {n}/{total}",
    boot: { lines: ["GALAXIA ENCANTADA // rumbo a Lúmina", "aterrizaje en la terraza de cristal: confirmado", "escáner de Prince calibrado", "encendiendo {records} registros de la biblioteca"], granted: "ARCHIVO ENCENDIDO", skip: "Saltar intro", label: "Intro de Lúmina", brand: "// LÚMINA" },
    hud: {
      channel: "ARCHIVO // BIBLIOTECA VIVA", location: "LÚMINA · TERRAZA DE CRISTAL", light: "LUZ",
      hint: "Haz clic en Glaucia · el cristal · Prince", touch: "Toca a Glaucia, el cristal o Prince",
      glaucia: "Glaucia: tocar el cristal", crystal: "Cristal: oír un susurro del archivo", prince: "Prince: olfatear la pila de libros", books: "Libros: lo que encontró Prince",
    },
    chapters: ["Biblioteca Viva", "Anillos de cristal", "Estanterías", "Colecciones", "Próximo capítulo"],
    hero: {
      title: "Una biblioteca que crece en cristal.",
      intro: "Artículos, tutoriales y guías para aprender haciendo, en portugués, inglés y español. Cada texto que publiqué quedó guardado aquí como un cristal de luz.",
      extra: "{records} registros desde {first}, en {platforms} plataformas. Filtra, busca y sigue cada serie de principio a fin.",
      caption: "Biblioteca a cielo abierto", scroll: "Desplázate a los anillos de cristal", jump: "Archivo abierto",
      readouts: ["registros", "plataformas", "idiomas"],
    },
    status: { touching: "El cristal está escuchando…", whispered: "Un susurro del archivo", sniffing: "Prince olfateó algo…", found: "Primera página encontrada" },
    readout: {
      whisper: "Susurro de {year}", whisperNote: "Cada toque trae un texto de un año de la biblioteca.",
      first: "La primera página", firstNote: "El registro más antiguo de la biblioteca, guardado al fondo de la pila.",
      published: "publicado el", platform: "plataforma", language: "idioma", shelf: "Ver en la estantería", again: "Otro susurro", close: "Cerrar",
    },
    languages: { "pt-BR": "Portugués", en: "Inglés", es: "Español" },
    rings: {
      title: "Los anillos de la biblioteca.", intro: "Como en un tronco, cada año deja un anillo: una columna de cristal por año de publicación. Elige un año para abrir la estantería en él.",
      statsLabel: "La biblioteca en números", stats: { records: "registros", platforms: "plataformas", languages: "idiomas", years: "años de biblioteca" },
      yearsLabel: "Registros por año", year: "{year}: {n} registros", veins: "Vetas por plataforma",
    },
    shelves: {
      title: "Estanterías.", intro: "Todos los registros, del más nuevo al más antiguo. Filtra por plataforma, idioma o año y busca por título.",
      platform: "Plataforma", language: "Idioma", year: "Año", any: "Todos", search: "Buscar en las estanterías", placeholder: "título o tema…",
      sort: "Orden", sorts: { recent: "Más nuevos", oldest: "Más antiguos" }, count: "{n} de {total} registros", empty: "Ningún cristal brilla así. Prueba otro término.", clear: "Limpiar filtros", open: "Leer el artículo",
      echo: { label: "Eco: publicado de nuevo", title: "Este texto tiene un eco", later: "{n} días después", earlier: "{n} días antes", same: "el mismo día" },
    },
    prism: {
      label: "Portal prismático", intro: "Tres prismas, uno por idioma. Gira cada uno hasta que su haz apunte al portal.",
      turn: "Prisma {lang}: girar (posición {n} de 4)", aligned: "Haces alineados", title: "La misma idea, otro idioma", body: "Textos que escribí dos veces, para lectores de idiomas distintos.",
      fallback: "La misma idea, otro idioma: pares de traducción",
    },
    collections: {
      title: "Colecciones.", intro: "Series que se leen en orden. Enciende los cristales del primero al último para ver la constelación completa.",
      parts: "{n} partes", node: "Encender el cristal {n} de {total}: {title}", wrong: "Ese cristal viene después. Empieza por el primero sin encender.",
      complete: "Constelación completa: {n} partes, de {first} a {last}.",
      names: { "typescript-zero-to-hero": "TypeScript Zero to Hero", "azure-openai-guide": "Guía práctica: Azure OpenAI con JavaScript y TypeScript", "vue-calculator": "Calculadora en Vue.js", "star-wars-crawler": "Star Wars Crawler con Azure Static Web Apps" },
    },
    dusk: {
      label: "Luz de la biblioteca", day: "Día", dusk: "Atardecer", title: "Colección del atardecer", body: "Cuando baja la luz, se encienden los textos más personales: historias de carrera y consejos para quien empieza.",
      relight: "Volver a encender la biblioteca", fallback: "Colección del atardecer: textos personales",
    },
    tv: { kicker: "Último video del canal", power: "Encender la TV", off: "Apagar la TV", open: "Abrir en YouTube", tuning: "Sintonizando…", saved: "Última transmisión guardada", aired: "Emitido el {date}", thumb: "Miniatura del video: {title}", screen: "TV antigua" },
    credits: {
      title: "El próximo capítulo puede ser de tu equipo.", body: "Muchos de estos textos nacieron en talleres y mentorías. Trae el desafío de tu equipo y escribimos el próximo juntos.",
      cta: "Talleres y mentorías", secondary: "Ver en YouTube", last: "La última página escrita", lastNote: "El registro más reciente de la biblioteca.",
      hint: "Pista del archivo: Lúmina esconde 7 secretos. La radio estelar, en el encabezado, ayuda a encontrarlos todos.", end: "Fin de la transmisión // Archivo encendido",
    },
  },
};
