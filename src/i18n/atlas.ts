// Events page: Atlas das Conexões (Earth orbit). Factual rule: a remote event is a signal, never a visited place.
import type { Format } from "@/lib/atlas-records";
import type { Evento } from "@/lib/types";

type Lang = Evento["idioma"];

export type AtlasCopy = {
  discoveries: string;
  boot: { lines: [string, string, string, string]; granted: string; skip: string; label: string; brand: string };
  hud: { channel: string; location: string; signal: string; hint: string; touch: string; glaucia: string; holo: string; prince: string; orb: string };
  chapters: [string, string, string, string, string];
  hero: { title: string; intro: string; extra: string; caption: string; scroll: string; jump: string; readouts: [string, string, string]; holo: string };
  status: { tracing: string; traced: string; sniffing: string; locked: string; signal: string; orbit: string };
  readout: {
    constellation: string; constellationName: string; constellationNote: string; stars: string;
    visor: string; origin: string; remoteOrigin: string; orbit: string; orbitNote: string; orbitSignals: string; orbitOnlySignals: string;
    year: string; format: string; type: string; language: string; source: string; log: string; again: string; nextOrbit: string; close: string;
  };
  formats: Record<Format, string>;
  languages: Record<Lang, string>;
  globe: {
    title: string; intro: string; hint: string; label: string; pause: string; play: string; reset: string; unavailable: string;
    legendCity: string; legendSignal: string; odometer: string; odometerLabel: string;
  };
  stats: { label: string; eventos: string; presenciais: string; remotos: string; cidades: string; paisesPresenca: string; paisesRepresentados: string; idiomas: string };
  countries: { title: string; present: string; remoteOnly: string; note: string; summary: string; mapNote: string };
  log: {
    title: string; intro: string; filters: string; year: string; format: string; type: string; language: string; any: string; search: string; placeholder: string;
    apply: string; clear: string; count: string; empty: string; source: string; open: string; city: string;
  };
  signals: { title: string; intro: string; timeline: string; yearItem: string; filterYear: string; languages: string; types: string; formats: string; legend: string };
  credits: { title: string; body: string; cta: string; secondary: string; audience: string; hint: string; end: string };
  voyage: { label: string; count: string; onlySignals: string; land: string };
  upcoming: { title: string; empty: string; profile: string };
  dock: { label: string; tablet: string; holo: string; prince: string; satellite: string };
  tablet: { open: string; title: string; rotate: string; regions: string; brasil: string; americas: string; europa: string; year: string; all: string; constellation: string; orbit: string; close: string };
  prince: { antenna: string; decoding: string; firstSignal: string; firstNote: string; base: string; baseTitle: string; baseCount: string; baseLink: string; satellite: string; caught: string; postcard: string; postcardNote: string; close: string };
};

export const atlas: Record<"pt" | "en" | "es", AtlasCopy> = {
  pt: {
    discoveries: "Descobertas no Atlas: {n}/{total}",
    boot: { lines: ["GALÁXIA ENCANTADA // rota para a órbita da Terra", "sala de navegação: pressurizada", "visor do Prince sincronizado", "{events} encontros no registro · {cities} cidades acesas"], granted: "ATLAS EM ÓRBITA", skip: "Pular abertura", label: "Abertura do Atlas das Conexões", brand: "// ATLAS" },
    hud: {
      channel: "NAVEGAÇÃO // ATLAS DAS CONEXÕES", location: "ÓRBITA DA TERRA · SALA DE NAVEGAÇÃO", signal: "SINAL",
      hint: "Clique na Glaucia · no holograma · no Prince", touch: "Toque na Glaucia, no holograma ou no Prince",
      glaucia: "Glaucia: abrir o tablet de navegação", holo: "Holograma: girar o globo do Atlas", prince: "Prince: acionar o visor de navegação", orb: "Orbe de navegação: localizar um evento",
    },
    chapters: ["Atlas das Conexões", "O globo", "Diário de bordo", "Sinais", "Próxima conexão"],
    hero: {
      title: "Ideias que conectam comunidades.",
      intro: "Palestras, workshops e comunidades que organizei, presencialmente e online. Daqui de cima, cada encontro é uma luz no mapa ou um sinal que atravessou o céu.",
      extra: "{events} encontros documentados: {inPerson} presenciais em {cities} cidades e {remote} transmissões remotas. Cada registro tem a sua fonte.",
      caption: "Navegação em órbita", scroll: "Role para mergulhar no Atlas", jump: "Atlas aberto",
      readouts: ["encontros", "cidades acesas", "sinais remotos"], holo: "Holograma do Atlas",
    },
    status: { tracing: "Traçando as conexões…", traced: "Constelação formada", sniffing: "O Prince farejou um sinal…", locked: "Origem localizada", signal: "Sinal remoto captado", orbit: "Órbita completa" },
    readout: {
      constellation: "Constelação das conexões", constellationName: "A Tecelã", constellationNote: "Linhas de constelação, não rotas de viagem: cada estrela é uma cidade com encontro presencial, ligada pela ordem da primeira presença.",
      stars: "{n} estrelas",
      visor: "Visor do Prince", origin: "Origem: {city}", remoteOrigin: "Origem: sinal remoto (participação online)",
      orbit: "Órbita de {year}", orbitNote: "Luzes douradas: cidades com encontro presencial nesse ano. Anéis: participações remotas.",
      orbitSignals: "{n} sinais remotos", orbitOnlySignals: "Nesse ano os encontros foram só por sinal remoto.",
      year: "ano", format: "formato", type: "tipo", language: "idioma", source: "Fonte", log: "Ver no diário", again: "Próximo evento", nextOrbit: "Próxima órbita", close: "Fechar",
    },
    formats: { presencial: "Presencial", remoto: "Remoto" },
    languages: { "pt-BR": "Português", en: "Inglês", es: "Espanhol" },
    globe: {
      title: "O globo das conexões.", intro: "Arraste o globo para explorar as cidades onde houve encontro presencial. As participações remotas não viram pontos no mapa: elas aparecem no diário como sinais.",
      hint: "Arraste para explorar · use também as setas do teclado", label: "Globo interativo de eventos. Use as setas para girar.", pause: "Pausar rotação", play: "Girar automaticamente", reset: "Recentrar",
      unavailable: "O globo não está disponível neste navegador. Consulte os países e eventos abaixo.",
      legendCity: "Luz: cidade com encontro presencial", legendSignal: "Anel: participação remota (só na lista)", odometer: "Órbita {n}%", odometerLabel: "Quanto do globo você já girou",
    },
    stats: { label: "O Atlas em números", eventos: "encontros", presenciais: "presenciais", remotos: "remotos", cidades: "cidades com presença", paisesPresenca: "países com presença", paisesRepresentados: "países representados", idiomas: "idiomas" },
    countries: {
      title: "Países no histórico", present: "Com encontro presencial", remoteOnly: "Representados só por participação remota",
      note: "“Países representados” conta o país-sede dos eventos com país identificado, incluindo participações remotas, por isso não é uma contagem de países visitados. Eventos globais ou sem país identificado não entram no total.",
      summary: "Como contamos os países", mapNote: "O globo mostra só cidades com encontro presencial; eventos online aparecem apenas no diário.",
    },
    log: {
      title: "Cada encontro, uma troca.", intro: "O diário de bordo completo: palestras, workshops e comunidades. Filtre por ano, formato, tipo ou idioma, ou procure pelo nome, cidade ou país.",
      filters: "Filtros do diário", year: "Ano", format: "Formato", type: "Tipo", language: "Idioma", any: "Todos", search: "Buscar evento, cidade ou país", placeholder: "nome, cidade ou país…",
      apply: "Filtrar", clear: "Limpar filtros", count: "{n} de {total} participações", empty: "Nenhum registro nessa frequência. Tente outro termo ou ano.", source: "Fonte", open: "{n} participações", city: "Cidade",
    },
    signals: {
      title: "Sinais e luzes.", intro: "Ano a ano, quantos encontros foram presenciais e quantos chegaram por sinal remoto. Escolha um ano para abri-lo no diário.",
      timeline: "Linha das órbitas", yearItem: "{year}: {p} presenciais · {r} remotos", filterYear: "Ver {year} no diário", languages: "Por idioma", types: "Por tipo", formats: "Por formato", legend: "Dourado: presencial · ciano: remoto",
    },
    credits: {
      title: "A próxima conexão pode ser com a sua comunidade.", body: "Palestras, workshops e participações em eventos, presenciais ou online. Me conte sobre o seu público e a gente desenha o encontro juntos.",
      cta: "Convide para palestrar", secondary: "Workshops e mentorias", audience: "O público não é somado: estimativas podem se sobrepor entre eventos e transmissões.",
      hint: "Dica de navegação: o Atlas esconde 6 segredos. O rádio estelar, no cabeçalho, ajuda a encontrar todos.", end: "Fim da transmissão // Atlas em órbita",
    },
    voyage: { label: "Viagem da sala de navegação até o Atlas", count: "{cities} cidades acesas · {remote} sinais remotos", onlySignals: "Um ano só de sinais remotos", land: "Atlas aberto" },
    dock: { label: "Ações da cena", tablet: "Tablet", holo: "Holograma", prince: "Prince", satellite: "Satélite" },
    tablet: { open: "Glaucia: abrir o tablet de navegação", title: "Tablet de navegação", rotate: "Arraste para girar o holograma (ou use as setas)", regions: "Regiões", brasil: "Brasil", americas: "Américas", europa: "Europa", year: "Ano no holograma", all: "Todos", constellation: "Constelação", orbit: "Órbita", close: "Fechar tablet" },
    upcoming: { title: "Próximas conexões", empty: "Novas coordenadas em breve. Os próximos encontros aparecem aqui assim que forem publicados.", profile: "Acompanhar no Luma" },
    prince: { antenna: "Antena do Prince: escutar os sinais remotos", decoding: "Decodificando sinais…", firstSignal: "Primeiro sinal remoto captado", firstNote: "A transmissão mais antiga do histórico. Cada barra ciano é um ano de sinais.", base: "Prince: marcar a base no globo", baseTitle: "Base do Prince: {city}", baseCount: "{n} encontros presenciais, a cidade mais visitada do Atlas.", baseLink: "Ver no diário", satellite: "Satélite fujão: pegar!", caught: "Satélite capturado!", postcard: "Cartão-postal de {city}", postcardNote: "A orbe trouxe de volta um encontro presencial real.", close: "Fechar" },
  },
  en: {
    discoveries: "Discoveries in the Atlas: {n}/{total}",
    boot: { lines: ["ENCHANTED GALAXY // course set for Earth orbit", "navigation room: pressurized", "Prince's visor synced", "{events} gatherings on record · {cities} cities lit"], granted: "ATLAS IN ORBIT", skip: "Skip intro", label: "Atlas of Connections intro", brand: "// ATLAS" },
    hud: {
      channel: "NAVIGATION // ATLAS OF CONNECTIONS", location: "EARTH ORBIT · NAVIGATION ROOM", signal: "SIGNAL",
      hint: "Click Glaucia · the hologram · Prince", touch: "Tap Glaucia, the hologram or Prince",
      glaucia: "Glaucia: open the navigation tablet", holo: "Hologram: spin the Atlas globe", prince: "Prince: switch on the navigation visor", orb: "Navigation orb: locate an event",
    },
    chapters: ["Atlas of Connections", "The globe", "Logbook", "Signals", "Next connection"],
    hero: {
      title: "Ideas that connect communities.",
      intro: "Talks, workshops and communities I organized, in person and online. From up here, every gathering is a light on the map or a signal that crossed the sky.",
      extra: "{events} documented gatherings: {inPerson} in person across {cities} cities and {remote} remote broadcasts. Every record has its source.",
      caption: "Navigating in orbit", scroll: "Scroll to dive into the Atlas", jump: "Atlas open",
      readouts: ["gatherings", "cities lit", "remote signals"], holo: "Atlas hologram",
    },
    status: { tracing: "Tracing the connections…", traced: "Constellation formed", sniffing: "Prince sniffed out a signal…", locked: "Origin located", signal: "Remote signal received", orbit: "Orbit complete" },
    readout: {
      constellation: "Constellation of connections", constellationName: "The Weaver", constellationNote: "Constellation lines, not travel routes: every star is a city with an in-person gathering, linked in order of first presence.",
      stars: "{n} stars",
      visor: "Prince's visor", origin: "Origin: {city}", remoteOrigin: "Origin: remote signal (online participation)",
      orbit: "Orbit of {year}", orbitNote: "Golden lights: cities with an in-person gathering that year. Rings: remote participation.",
      orbitSignals: "{n} remote signals", orbitOnlySignals: "That year every gathering came through a remote signal.",
      year: "year", format: "format", type: "type", language: "language", source: "Source", log: "See it in the logbook", again: "Next event", nextOrbit: "Next orbit", close: "Close",
    },
    formats: { presencial: "In person", remoto: "Remote" },
    languages: { "pt-BR": "Portuguese", en: "English", es: "Spanish" },
    globe: {
      title: "The globe of connections.", intro: "Drag the globe to explore the cities with in-person gatherings. Remote participation never becomes a point on the map: it shows up in the logbook as a signal.",
      hint: "Drag to explore · or use the arrow keys", label: "Interactive event globe. Use arrow keys to rotate.", pause: "Pause rotation", play: "Auto rotate", reset: "Reset view",
      unavailable: "The globe is unavailable in this browser. Browse the countries and events below.",
      legendCity: "Light: city with an in-person gathering", legendSignal: "Ring: remote participation (list only)", odometer: "Orbit {n}%", odometerLabel: "How much of the globe you have turned",
    },
    stats: { label: "The Atlas in numbers", eventos: "gatherings", presenciais: "in person", remotos: "remote", cidades: "cities with presence", paisesPresenca: "countries with presence", paisesRepresentados: "countries represented", idiomas: "languages" },
    countries: {
      title: "Countries in the history", present: "With an in-person gathering", remoteOnly: "Represented only by remote participation",
      note: "“Countries represented” counts the host country of events with an identified country, including remote participation, so it is not a count of countries visited. Global events and entries without an identified country are excluded.",
      summary: "How countries are counted", mapNote: "The globe shows only cities with in-person gatherings; online events appear only in the logbook.",
    },
    log: {
      title: "Every gathering, an exchange.", intro: "The full logbook: talks, workshops and communities. Filter by year, format, type or language, or search by name, city or country.",
      filters: "Logbook filters", year: "Year", format: "Format", type: "Type", language: "Language", any: "All", search: "Search event, city or country", placeholder: "name, city or country…",
      apply: "Filter", clear: "Clear filters", count: "{n} of {total} appearances", empty: "No records on this frequency. Try another term or year.", source: "Source", open: "{n} appearances", city: "City",
    },
    signals: {
      title: "Signals and lights.", intro: "Year by year, how many gatherings were in person and how many arrived by remote signal. Pick a year to open it in the logbook.",
      timeline: "Orbit timeline", yearItem: "{year}: {p} in person · {r} remote", filterYear: "See {year} in the logbook", languages: "By language", types: "By type", formats: "By format", legend: "Gold: in person · cyan: remote",
    },
    credits: {
      title: "The next connection could be your community.", body: "Talks, workshops and event appearances, in person or online. Tell me about your audience and we will design the gathering together.",
      cta: "Invite me to speak", secondary: "Workshops and mentoring", audience: "Audience is not totaled: estimates may overlap across events and streams.",
      hint: "Navigation tip: the Atlas hides 6 secrets. The star radio in the header helps you find them all.", end: "End of transmission // Atlas in orbit",
    },
    voyage: { label: "Voyage from the navigation room to the Atlas", count: "{cities} cities lit · {remote} remote signals", onlySignals: "A year of remote signals only", land: "Atlas open" },
    dock: { label: "Scene actions", tablet: "Tablet", holo: "Hologram", prince: "Prince", satellite: "Satellite" },
    tablet: { open: "Glaucia: open the navigation tablet", title: "Navigation tablet", rotate: "Drag to spin the hologram (or use the arrow keys)", regions: "Regions", brasil: "Brazil", americas: "Americas", europa: "Europe", year: "Year on the hologram", all: "All", constellation: "Constellation", orbit: "Orbit", close: "Close tablet" },
    upcoming: { title: "Next connections", empty: "New coordinates soon. Upcoming gatherings show up here as soon as they are published.", profile: "Follow on Luma" },
    prince: { antenna: "Prince's antenna: listen to the remote signals", decoding: "Decoding signals…", firstSignal: "First remote signal received", firstNote: "The oldest broadcast on record. Each cyan bar is a year of signals.", base: "Prince: mark his base on the globe", baseTitle: "Prince's base: {city}", baseCount: "{n} in-person gatherings, the most visited city in the Atlas.", baseLink: "See it in the logbook", satellite: "Runaway satellite: catch it!", caught: "Satellite caught!", postcard: "Postcard from {city}", postcardNote: "The orb brought back a real in-person gathering.", close: "Close" },
  },
  es: {
    discoveries: "Descubrimientos en el Atlas: {n}/{total}",
    boot: { lines: ["GALAXIA ENCANTADA // rumbo a la órbita de la Tierra", "sala de navegación: presurizada", "visor de Prince sincronizado", "{events} encuentros en el registro · {cities} ciudades encendidas"], granted: "ATLAS EN ÓRBITA", skip: "Saltar intro", label: "Intro del Atlas de las Conexiones", brand: "// ATLAS" },
    hud: {
      channel: "NAVEGACIÓN // ATLAS DE LAS CONEXIONES", location: "ÓRBITA DE LA TIERRA · SALA DE NAVEGACIÓN", signal: "SEÑAL",
      hint: "Haz clic en Glaucia · el holograma · Prince", touch: "Toca a Glaucia, el holograma o a Prince",
      glaucia: "Glaucia: abrir la tableta de navegación", holo: "Holograma: girar el globo del Atlas", prince: "Prince: activar el visor de navegación", orb: "Orbe de navegación: localizar un evento",
    },
    chapters: ["Atlas de las Conexiones", "El globo", "Bitácora", "Señales", "Próxima conexión"],
    hero: {
      title: "Ideas que conectan comunidades.",
      intro: "Charlas, talleres y comunidades que organicé, en persona y en línea. Desde aquí arriba, cada encuentro es una luz en el mapa o una señal que cruzó el cielo.",
      extra: "{events} encuentros documentados: {inPerson} presenciales en {cities} ciudades y {remote} transmisiones remotas. Cada registro tiene su fuente.",
      caption: "Navegación en órbita", scroll: "Desplázate para sumergirte en el Atlas", jump: "Atlas abierto",
      readouts: ["encuentros", "ciudades encendidas", "señales remotas"], holo: "Holograma del Atlas",
    },
    status: { tracing: "Trazando las conexiones…", traced: "Constelación formada", sniffing: "Prince olfateó una señal…", locked: "Origen localizado", signal: "Señal remota captada", orbit: "Órbita completa" },
    readout: {
      constellation: "Constelación de las conexiones", constellationName: "La Tejedora", constellationNote: "Líneas de constelación, no rutas de viaje: cada estrella es una ciudad con un encuentro presencial, unida por el orden de la primera presencia.",
      stars: "{n} estrellas",
      visor: "Visor de Prince", origin: "Origen: {city}", remoteOrigin: "Origen: señal remota (participación en línea)",
      orbit: "Órbita de {year}", orbitNote: "Luces doradas: ciudades con encuentro presencial ese año. Anillos: participaciones remotas.",
      orbitSignals: "{n} señales remotas", orbitOnlySignals: "Ese año todos los encuentros llegaron por señal remota.",
      year: "año", format: "formato", type: "tipo", language: "idioma", source: "Fuente", log: "Ver en la bitácora", again: "Siguiente evento", nextOrbit: "Siguiente órbita", close: "Cerrar",
    },
    formats: { presencial: "Presencial", remoto: "Remoto" },
    languages: { "pt-BR": "Portugués", en: "Inglés", es: "Español" },
    globe: {
      title: "El globo de las conexiones.", intro: "Arrastra el globo para explorar las ciudades con encuentros presenciales. Las participaciones remotas no se vuelven puntos en el mapa: aparecen en la bitácora como señales.",
      hint: "Arrastra para explorar · o usa las flechas del teclado", label: "Globo interactivo de eventos. Usa las flechas para girar.", pause: "Pausar rotación", play: "Girar automáticamente", reset: "Centrar",
      unavailable: "El globo no está disponible en este navegador. Consulta los países y eventos a continuación.",
      legendCity: "Luz: ciudad con encuentro presencial", legendSignal: "Anillo: participación remota (solo en la lista)", odometer: "Órbita {n}%", odometerLabel: "Cuánto del globo ya giraste",
    },
    stats: { label: "El Atlas en números", eventos: "encuentros", presenciais: "presenciales", remotos: "remotos", cidades: "ciudades con presencia", paisesPresenca: "países con presencia", paisesRepresentados: "países representados", idiomas: "idiomas" },
    countries: {
      title: "Países en el historial", present: "Con encuentro presencial", remoteOnly: "Representados solo por participación remota",
      note: "“Países representados” cuenta el país sede de los eventos con país identificado, incluidas las participaciones remotas, así que no es un recuento de países visitados. Se excluyen los eventos globales o sin país identificado.",
      summary: "Cómo contamos los países", mapNote: "El globo muestra solo ciudades con encuentros presenciales; los eventos en línea aparecen solo en la bitácora.",
    },
    log: {
      title: "Cada encuentro, un intercambio.", intro: "La bitácora completa: charlas, talleres y comunidades. Filtra por año, formato, tipo o idioma, o busca por nombre, ciudad o país.",
      filters: "Filtros de la bitácora", year: "Año", format: "Formato", type: "Tipo", language: "Idioma", any: "Todos", search: "Buscar evento, ciudad o país", placeholder: "nombre, ciudad o país…",
      apply: "Filtrar", clear: "Limpiar filtros", count: "{n} de {total} participaciones", empty: "Ningún registro en esta frecuencia. Prueba otro término o año.", source: "Fuente", open: "{n} participaciones", city: "Ciudad",
    },
    signals: {
      title: "Señales y luces.", intro: "Año a año, cuántos encuentros fueron presenciales y cuántos llegaron por señal remota. Elige un año para abrirlo en la bitácora.",
      timeline: "Línea de las órbitas", yearItem: "{year}: {p} presenciales · {r} remotos", filterYear: "Ver {year} en la bitácora", languages: "Por idioma", types: "Por tipo", formats: "Por formato", legend: "Dorado: presencial · cian: remoto",
    },
    credits: {
      title: "La próxima conexión puede ser con tu comunidad.", body: "Charlas, talleres y participaciones en eventos, presenciales o en línea. Cuéntame sobre tu público y diseñamos el encuentro juntos.",
      cta: "Invítame a dar una charla", secondary: "Talleres y mentorías", audience: "El público no se suma: las estimaciones pueden superponerse.",
      hint: "Consejo de navegación: el Atlas esconde 6 secretos. La radio estelar, en el encabezado, te ayuda a encontrarlos todos.", end: "Fin de la transmisión // Atlas en órbita",
    },
    voyage: { label: "Viaje de la sala de navegación al Atlas", count: "{cities} ciudades encendidas · {remote} señales remotas", onlySignals: "Un año solo de señales remotas", land: "Atlas abierto" },
    dock: { label: "Acciones de la escena", tablet: "Tableta", holo: "Holograma", prince: "Prince", satellite: "Satélite" },
    tablet: { open: "Glaucia: abrir la tableta de navegación", title: "Tableta de navegación", rotate: "Arrastra para girar el holograma (o usa las flechas)", regions: "Regiones", brasil: "Brasil", americas: "Américas", europa: "Europa", year: "Año en el holograma", all: "Todos", constellation: "Constelación", orbit: "Órbita", close: "Cerrar tableta" },
    upcoming: { title: "Próximas conexiones", empty: "Nuevas coordenadas pronto. Los próximos encuentros aparecen aquí en cuanto se publican.", profile: "Seguir en Luma" },
    prince: { antenna: "Antena de Prince: escuchar las señales remotas", decoding: "Decodificando señales…", firstSignal: "Primera señal remota captada", firstNote: "La transmisión más antigua del historial. Cada barra cian es un año de señales.", base: "Prince: marcar su base en el globo", baseTitle: "Base de Prince: {city}", baseCount: "{n} encuentros presenciales, la ciudad más visitada del Atlas.", baseLink: "Ver en la bitácora", satellite: "Satélite fugitivo: ¡atrápalo!", caught: "¡Satélite capturado!", postcard: "Postal de {city}", postcardNote: "El orbe trajo de vuelta un encuentro presencial real.", close: "Cerrar" },
  },
};
