// Projects page: R2-D2's memory bank, on Tatooine.
import type { Category, SortKey } from "@/lib/repos";

export type Squad = "microsoft" | "Azure-Samples" | "MicrosoftDocs" | "Azure" | "nodejs" | "community";
type Quote = { text: string; sign: string };

export type TatooineCopy = {
  boot: { lines: [string, string, string, string]; granted: string; skip: string; label: string };
  hud: { channel: string; location: string; temp: string; suns: string; hint: string; touch: string };
  transmissions: [string, string, string, string, string];
  hero: { title: string; intro: string; extra: string; caption: string; scroll: string; r2: string; suns: [string, string]; sandcrawler: string };
  memory: {
    title: string; intro: string; statsLabel: string; offline: string;
    stats: { originals: string; stars: string; forks: string; followers: string; mergedPrs: string; gists: string; publicRepos: string; years: string };
    crystals: string; crystalsNote: string; other: string;
    dunes: string; dunesNote: string; dunesItem: string;
    terminal: string; terminalHint: string;
  };
  archive: {
    title: string; intro: string; featured: string; featuredCta: string;
    categoriesLabel: string; all: string; categories: Record<Category, string>;
    languagesLabel: string; anyLanguage: string; sortLabel: string; sorts: Record<SortKey, string>;
    search: string; placeholder: string; count: string; empty: string; clear: string;
    stars: string; forks: string; updated: string; open: string; more: string;
  };
  alliance: {
    title: string; intro: string; scoreboard: string; scoreboardNote: string;
    squads: Record<Squad, { name: string; callsign: string; motto: string }>;
    prs: string; prsLink: string; stars: string;
  };
  credits: { title: string; body: string; cta: string; secondary: string; hint: string; end: string };
  eggs: {
    close: string;
    npx: { title: string; reboot: string; rebooted: string; prompt: string };
    plans: { title: string; intro: string; weak: string; legend: [string, string, string, string, string, string] };
    utinni: { shout: string; stolen: string; bargain: string; returned: string };
    sunset: Quote; podrace: Quote; mindtrick: Quote & { after: string }; cantina: string;
    artoo: { lines: [string, string, string, string]; zap: string };
    sand: Quote & { sweep: string }; hellothere: { hello: string; reply: string; sign: string }; bb8: string;
  };
};

export const tatooine: Record<"pt" | "en" | "es", TatooineCopy> = {
  pt: {
    boot: { lines: ["R2-D2 // banco de memória astromecânico", "decodificando: planos de projetos", "origem: Tatooine · Mar de Dunas", "proprietária registrada: GL-0001"], granted: "PLANOS RECUPERADOS", skip: "Pular transmissão", label: "Transmissão do R2-D2" },
    hud: { channel: "CANAL ASTROMECH // R2-D2", location: "TATOOINE · MAR DE DUNAS", temp: "TEMP", suns: "SÓIS", hint: "Clique no R2 · segure para projetar", touch: "Toque no R2 · segure para projetar · toque nos sóis" },
    transmissions: ["Transmissão I — Tatooine", "Transmissão II — Banco de memória", "Transmissão III — Mercado de Mos Espa", "Transmissão IV — Esquadrão Microsoft", "Transmissão V — Pôr do sol binário"],
    hero: {
      title: "Os planos estão neste droide.",
      intro: "Mais de uma década de código aberto guardada na memória de um astromecânico: cursos, workshops, agentes de IA e servidores MCP que ensinam construindo.",
      extra: "As estrelas e os números vêm direto do GitHub e são atualizados todo mês. Quando o sinal cai, o R2 usa a última cópia que guardou.",
      caption: "Arquivo astromecânico", scroll: "Role para o banco de memória", r2: "Falar com o R2-D2", suns: ["Primeiro sol de Tatooine", "Segundo sol de Tatooine"], sandcrawler: "Sandcrawler dos Jawas",
    },
    memory: {
      title: "O que o R2 guardou.", intro: "Telemetria lida do GitHub em tempo real: cada número é um plano entregue, um fork negociado ou uma revisão aceita por outro time.",
      statsLabel: "Telemetria do GitHub", offline: "Sinal fraco: exibindo a última cópia salva pelo R2.",
      stats: { originals: "repositórios originais", stars: "estrelas nos originais", forks: "forks", followers: "seguidores", mergedPrs: "PRs mergeados fora da minha conta", gists: "gists", publicRepos: "repositórios públicos", years: "anos de commits" },
      crystals: "Cristais kyber", crystalsNote: "Linguagens dos repositórios originais. Cada cristal vibra numa cor.", other: "Outras",
      dunes: "Dunas do tempo", dunesNote: "Repositórios criados por ano. Quanto mais alta a duna, mais código naquele ano.", dunesItem: "{year}: {n} repositórios",
      terminal: "Terminal do R2", terminalHint: "Um comando antigo ainda responde aqui.",
    },
    archive: {
      title: "Mercado de Mos Espa.", intro: "Os Jawas organizaram o estoque. Filtre por setor ou linguagem, procure pelo nome e ordene como preferir.",
      featured: "Relíquia mais valiosa", featuredCta: "Abrir a relíquia",
      categoriesLabel: "Setor", all: "Tudo", categories: { ai: "IA e agentes", learn: "Cursos e workshops", cloud: "Azure e serverless", web: "Web e APIs" },
      languagesLabel: "Linguagem", anyLanguage: "Todas", sortLabel: "Ordenar", sorts: { stars: "Estrelas", recent: "Sinal recente", forks: "Forks" },
      search: "Buscar no arquivo", placeholder: "nome, tema ou linguagem…", count: "{n} de {total} planos", empty: "Nenhum plano com esse sinal. Tente outro termo.", clear: "Limpar filtros",
      stars: "estrelas", forks: "forks", updated: "último sinal", open: "GitHub", more: "Ver todos os repositórios no GitHub",
    },
    alliance: {
      title: "Esquadrão Microsoft.", intro: "Quando a Aliança precisou de pilotos, eu me alistei: samples oficiais, cursos do Microsoft Learn, documentação e o site do Node.js.",
      scoreboard: "{prs} PRs mergeados em {repos} repositórios de outras organizações", scoreboardNote: "Contagem ao vivo da busca do GitHub por PRs mergeados com a minha autoria.",
      squads: {
        microsoft: { name: "Esquadrão Vermelho", callsign: "VERMELHO", motto: "microsoft · o líder vermelho abre a formação" },
        "Azure-Samples": { name: "Esquadrão Ouro", callsign: "OURO", motto: "Azure-Samples · samples oficiais de IA e serverless" },
        MicrosoftDocs: { name: "Esquadrão Azul", callsign: "AZUL", motto: "MicrosoftDocs · cursos e documentação" },
        Azure: { name: "Esquadrão Verde", callsign: "VERDE", motto: "Azure · ferramentas oficiais" },
        nodejs: { name: "Esquadrão Rogue", callsign: "ROGUE", motto: "nodejs · o site oficial e a tradução" },
        community: { name: "Tripulação Fantasma", callsign: "FANTASMA", motto: "comunidade · fora do radar imperial" },
      },
      prs: "{n} PRs", prsLink: "Meus PRs", stars: "estrelas",
    },
    credits: { title: "Sua equipe é a próxima missão.", body: "Os sóis estão se pondo, mas o arquivo continua aberto. Traga o desafio do seu time e a gente transforma em código, curso ou workshop.", cta: "Iniciar a missão", secondary: "Mandar DM no LinkedIn", hint: "Dica do R2: este deserto esconde 11 segredos. Abra o comlink no canto da tela para caçar todos.", end: "Fim da transmissão // Que a Força esteja com seu código" },
    eggs: {
      close: "Fechar",
      npx: { title: "Holocron de 2018", reboot: "Atualizar para 2026", rebooted: "Cartão atualizado. Alguns links envelheceram melhor que outros.", prompt: "Executar npx glaucia_lemos86" },
      plans: { title: "Planos técnicos · estação glaucialemos.dev", intro: "Projeção recuperada da memória do R2. Classificação: aliada.", weak: "Ponto fraco: um pequeno porto de exaustão térmica logo abaixo do porto principal, o src/middleware.ts.", legend: ["Rotas por idioma", "Páginas no servidor", "Dados validados pelo Zod", "GitHub ao vivo", "Ilhas client", "Segredos e Comlink"] },
      utinni: { shout: "Utinni!", stolen: "Os Jawas levaram um plano para o sandcrawler.", bargain: "Negociar com os Jawas", returned: "Negócio fechado: o plano voltou. Os Jawas ficaram com um parafuso." },
      sunset: { text: "Dois sóis no horizonte. Toda grande jornada começa num fim de tarde em Tatooine.", sign: "— Lars, fazenda de umidade" },
      podrace: { text: "Isto sim é corrida de pods!", sign: "— A. Skywalker" },
      mindtrick: { text: "Estes não são os droides que você procura.", sign: "— Ben Kenobi", after: "Pode seguir. Circulando." },
      cantina: "Figrin D'an e os Modal Nodes assumiram o palco do arquivo.",
      artoo: { lines: ["Bip-bup-biiip! (Tradução do C-3PO: “Ele diz que os planos estão seguros.”)", "Biii-dup! (“Ele insiste que TypeScript evita naufrágios.”)", "Bup-bup-bwiiip! (“Ele quer saber quem deu merge sem revisão.”)", "Dwiii-bip! (“Ele diz que já carregou planos mais importantes.”)"], zap: "Bzzzt! O R2 levou um choque. Como em Tatooine, ele vai ficar bem." },
      sand: { text: "Não gosto de areia. É áspera, irritante, e entra em todo lugar.", sign: "— A. Skywalker", sweep: "Passe o cursor ou o dedo para varrer a areia." },
      hellothere: { hello: "Hello there!", reply: "General Kenobi!", sign: "— O. Kenobi" },
      bb8: "O BB-8 atravessou as dunas e aprovou o arquivo com um joinha.",
    },
  },
  en: {
    boot: { lines: ["R2-D2 // astromech memory bank", "decoding: project plans", "origin: Tatooine · Dune Sea", "registered owner: GL-0001"], granted: "PLANS RECOVERED", skip: "Skip transmission", label: "R2-D2 transmission" },
    hud: { channel: "ASTROMECH CHANNEL // R2-D2", location: "TATOOINE · DUNE SEA", temp: "TEMP", suns: "SUNS", hint: "Click R2 · hold to project", touch: "Tap R2 · hold to project · tap the suns" },
    transmissions: ["Transmission I — Tatooine", "Transmission II — Memory bank", "Transmission III — Mos Espa market", "Transmission IV — Microsoft Squadron", "Transmission V — Binary sunset"],
    hero: {
      title: "The plans are in this droid.",
      intro: "More than a decade of open source stored in an astromech's memory: courses, workshops, AI agents and MCP servers that teach by building.",
      extra: "Stars and numbers come straight from GitHub and refresh every month. When the signal drops, R2 uses the last copy it saved.",
      caption: "Astromech archive", scroll: "Scroll to the memory bank", r2: "Talk to R2-D2", suns: ["Tatooine's first sun", "Tatooine's second sun"], sandcrawler: "Jawa sandcrawler",
    },
    memory: {
      title: "What R2 kept.", intro: "Telemetry read live from GitHub: every number is a delivered plan, a traded fork or a review accepted by another team.",
      statsLabel: "GitHub telemetry", offline: "Weak signal: showing the last copy R2 saved.",
      stats: { originals: "original repositories", stars: "stars on originals", forks: "forks", followers: "followers", mergedPrs: "merged PRs outside my account", gists: "gists", publicRepos: "public repositories", years: "years of commits" },
      crystals: "Kyber crystals", crystalsNote: "Languages of the original repositories. Each crystal hums in its own color.", other: "Other",
      dunes: "Dunes of time", dunesNote: "Repositories created per year. The taller the dune, the more code that year.", dunesItem: "{year}: {n} repositories",
      terminal: "R2's terminal", terminalHint: "An old command still answers here.",
    },
    archive: {
      title: "Mos Espa market.", intro: "The Jawas sorted the stock. Filter by sector or language, search by name and sort however you like.",
      featured: "Most valuable relic", featuredCta: "Open the relic",
      categoriesLabel: "Sector", all: "All", categories: { ai: "AI & agents", learn: "Courses & workshops", cloud: "Azure & serverless", web: "Web & APIs" },
      languagesLabel: "Language", anyLanguage: "All", sortLabel: "Sort", sorts: { stars: "Stars", recent: "Recent signal", forks: "Forks" },
      search: "Search the archive", placeholder: "name, topic or language…", count: "{n} of {total} plans", empty: "No plans on that signal. Try another term.", clear: "Clear filters",
      stars: "stars", forks: "forks", updated: "last signal", open: "GitHub", more: "See every repository on GitHub",
    },
    alliance: {
      title: "Microsoft Squadron.", intro: "When the Alliance needed pilots, I signed up: official samples, Microsoft Learn courses, documentation and the Node.js website.",
      scoreboard: "{prs} merged PRs across {repos} repositories in other organizations", scoreboardNote: "Live count from GitHub's search for merged PRs I authored.",
      squads: {
        microsoft: { name: "Red Squadron", callsign: "RED", motto: "microsoft · Red Leader opens the formation" },
        "Azure-Samples": { name: "Gold Squadron", callsign: "GOLD", motto: "Azure-Samples · official AI and serverless samples" },
        MicrosoftDocs: { name: "Blue Squadron", callsign: "BLUE", motto: "MicrosoftDocs · courses and documentation" },
        Azure: { name: "Green Squadron", callsign: "GREEN", motto: "Azure · official tooling" },
        nodejs: { name: "Rogue Squadron", callsign: "ROGUE", motto: "nodejs · the official website and its translation" },
        community: { name: "Ghost Crew", callsign: "GHOST", motto: "community · off the Imperial radar" },
      },
      prs: "{n} PRs", prsLink: "My PRs", stars: "stars",
    },
    credits: { title: "Your team is the next mission.", body: "The suns are setting, but the archive stays open. Bring your team's challenge and we'll turn it into code, a course or a workshop.", cta: "Start the mission", secondary: "Send a LinkedIn DM", hint: "R2's tip: this desert hides 11 secrets. Open the comlink in the corner of the screen to hunt them all.", end: "End of transmission // May the Force be with your code" },
    eggs: {
      close: "Close",
      npx: { title: "2018 holocron", reboot: "Upgrade to 2026", rebooted: "Card upgraded. Some links aged better than others.", prompt: "Run npx glaucia_lemos86" },
      plans: { title: "Technical readouts · glaucialemos.dev station", intro: "Projection recovered from R2's memory. Clearance: Alliance.", weak: "Weak spot: a small thermal exhaust port, right below the main port: src/middleware.ts.", legend: ["Language routes", "Server pages", "Zod-validated data", "Live GitHub", "Client islands", "Secrets and Comlink"] },
      utinni: { shout: "Utinni!", stolen: "The Jawas hauled a plan into the sandcrawler.", bargain: "Bargain with the Jawas", returned: "Deal: the plan is back. The Jawas kept a bolt." },
      sunset: { text: "Two suns on the horizon. Every great journey starts on a late afternoon on Tatooine.", sign: "— Lars, moisture farm" },
      podrace: { text: "Now this is podracing!", sign: "— A. Skywalker" },
      mindtrick: { text: "These aren't the droids you're looking for.", sign: "— Ben Kenobi", after: "You can go about your business. Move along." },
      cantina: "Figrin D'an and the Modal Nodes took over the archive's stage.",
      artoo: { lines: ["Beep-boop-beeep! (C-3PO translates: “He says the plans are safe.”)", "Beee-doo! (“He insists TypeScript prevents shipwrecks.”)", "Boop-boop-bweeep! (“He wants to know who merged without review.”)", "Dweee-beep! (“He says he has carried more important plans.”)"], zap: "Bzzzt! R2 got zapped. Like on Tatooine, he'll be fine." },
      sand: { text: "I don't like sand. It's coarse and rough and irritating, and it gets everywhere.", sign: "— A. Skywalker", sweep: "Move the cursor or your finger to sweep the sand." },
      hellothere: { hello: "Hello there!", reply: "General Kenobi!", sign: "— O. Kenobi" },
      bb8: "BB-8 rolled across the dunes and gave the archive a thumbs-up.",
    },
  },
  es: {
    boot: { lines: ["R2-D2 // banco de memoria astromecánico", "decodificando: planos de proyectos", "origen: Tatooine · Mar de Dunas", "propietaria registrada: GL-0001"], granted: "PLANOS RECUPERADOS", skip: "Saltar transmisión", label: "Transmisión de R2-D2" },
    hud: { channel: "CANAL ASTROMECH // R2-D2", location: "TATOOINE · MAR DE DUNAS", temp: "TEMP", suns: "SOLES", hint: "Clic en R2 · mantén para proyectar", touch: "Toca a R2 · mantén para proyectar · toca los soles" },
    transmissions: ["Transmisión I — Tatooine", "Transmisión II — Banco de memoria", "Transmisión III — Mercado de Mos Espa", "Transmisión IV — Escuadrón Microsoft", "Transmisión V — Atardecer binario"],
    hero: {
      title: "Los planos están en este droide.",
      intro: "Más de una década de código abierto guardada en la memoria de un astromecánico: cursos, talleres, agentes de IA y servidores MCP que enseñan construyendo.",
      extra: "Las estrellas y los números vienen directo de GitHub y se actualizan cada mes. Cuando cae la señal, R2 usa la última copia que guardó.",
      caption: "Archivo astromecánico", scroll: "Desplázate al banco de memoria", r2: "Hablar con R2-D2", suns: ["Primer sol de Tatooine", "Segundo sol de Tatooine"], sandcrawler: "Reptador de arena de los jawas",
    },
    memory: {
      title: "Lo que R2 guardó.", intro: "Telemetría leída de GitHub en tiempo real: cada número es un plano entregado, un fork negociado o una revisión aceptada por otro equipo.",
      statsLabel: "Telemetría de GitHub", offline: "Señal débil: mostrando la última copia guardada por R2.",
      stats: { originals: "repositorios originales", stars: "estrellas en los originales", forks: "forks", followers: "seguidores", mergedPrs: "PRs fusionados fuera de mi cuenta", gists: "gists", publicRepos: "repositorios públicos", years: "años de commits" },
      crystals: "Cristales kyber", crystalsNote: "Lenguajes de los repositorios originales. Cada cristal vibra en su color.", other: "Otros",
      dunes: "Dunas del tiempo", dunesNote: "Repositorios creados por año. Cuanto más alta la duna, más código ese año.", dunesItem: "{year}: {n} repositorios",
      terminal: "Terminal de R2", terminalHint: "Un comando antiguo todavía responde aquí.",
    },
    archive: {
      title: "Mercado de Mos Espa.", intro: "Los jawas ordenaron el inventario. Filtra por sector o lenguaje, busca por nombre y ordena como prefieras.",
      featured: "Reliquia más valiosa", featuredCta: "Abrir la reliquia",
      categoriesLabel: "Sector", all: "Todo", categories: { ai: "IA y agentes", learn: "Cursos y talleres", cloud: "Azure y serverless", web: "Web y APIs" },
      languagesLabel: "Lenguaje", anyLanguage: "Todos", sortLabel: "Ordenar", sorts: { stars: "Estrellas", recent: "Señal reciente", forks: "Forks" },
      search: "Buscar en el archivo", placeholder: "nombre, tema o lenguaje…", count: "{n} de {total} planos", empty: "Ningún plano con esa señal. Prueba otro término.", clear: "Limpiar filtros",
      stars: "estrellas", forks: "forks", updated: "última señal", open: "GitHub", more: "Ver todos los repositorios en GitHub",
    },
    alliance: {
      title: "Escuadrón Microsoft.", intro: "Cuando la Alianza necesitó pilotos, me alisté: samples oficiales, cursos de Microsoft Learn, documentación y el sitio de Node.js.",
      scoreboard: "{prs} PRs fusionados en {repos} repositorios de otras organizaciones", scoreboardNote: "Conteo en vivo de la búsqueda de GitHub de PRs fusionados de mi autoría.",
      squads: {
        microsoft: { name: "Escuadrón Rojo", callsign: "ROJO", motto: "microsoft · el líder rojo abre la formación" },
        "Azure-Samples": { name: "Escuadrón Oro", callsign: "ORO", motto: "Azure-Samples · samples oficiales de IA y serverless" },
        MicrosoftDocs: { name: "Escuadrón Azul", callsign: "AZUL", motto: "MicrosoftDocs · cursos y documentación" },
        Azure: { name: "Escuadrón Verde", callsign: "VERDE", motto: "Azure · herramientas oficiales" },
        nodejs: { name: "Escuadrón Rogue", callsign: "ROGUE", motto: "nodejs · el sitio oficial y su traducción" },
        community: { name: "Tripulación Fantasma", callsign: "FANTASMA", motto: "comunidad · fuera del radar imperial" },
      },
      prs: "{n} PRs", prsLink: "Mis PRs", stars: "estrellas",
    },
    credits: { title: "Tu equipo es la próxima misión.", body: "Los soles se ponen, pero el archivo sigue abierto. Trae el desafío de tu equipo y lo convertimos en código, curso o taller.", cta: "Iniciar la misión", secondary: "Enviar DM en LinkedIn", hint: "Consejo de R2: este desierto esconde 11 secretos. Abre el comlink en la esquina de la pantalla para encontrarlos todos.", end: "Fin de la transmisión // Que la Fuerza acompañe a tu código" },
    eggs: {
      close: "Cerrar",
      npx: { title: "Holocrón de 2018", reboot: "Actualizar a 2026", rebooted: "Tarjeta actualizada. Algunos enlaces envejecieron mejor que otros.", prompt: "Ejecutar npx glaucia_lemos86" },
      plans: { title: "Planos técnicos · estación glaucialemos.dev", intro: "Proyección recuperada de la memoria de R2. Clasificación: aliada.", weak: "Punto débil: un pequeño puerto de escape térmico justo debajo del puerto principal: src/middleware.ts.", legend: ["Rutas por idioma", "Páginas en el servidor", "Datos validados con Zod", "GitHub en vivo", "Islas client", "Secretos y Comlink"] },
      utinni: { shout: "¡Utinni!", stolen: "Los jawas se llevaron un plano al reptador de arena.", bargain: "Negociar con los jawas", returned: "Trato hecho: el plano volvió. Los jawas se quedaron con un tornillo." },
      sunset: { text: "Dos soles en el horizonte. Todo gran viaje empieza en una tarde en Tatooine.", sign: "— Lars, granja de humedad" },
      podrace: { text: "¡Esto sí es una carrera de vainas!", sign: "— A. Skywalker" },
      mindtrick: { text: "Estos no son los droides que estás buscando.", sign: "— Ben Kenobi", after: "Puedes seguir con tus asuntos. Circula." },
      cantina: "Figrin D'an y los Modal Nodes tomaron el escenario del archivo.",
      artoo: { lines: ["¡Bip-bup-biiip! (Traducción de C-3PO: “Dice que los planos están a salvo.”)", "¡Biii-dup! (“Insiste en que TypeScript evita naufragios.”)", "¡Bup-bup-bwiiip! (“Quiere saber quién hizo merge sin revisión.”)", "¡Dwiii-bip! (“Dice que ya cargó planos más importantes.”)"], zap: "¡Bzzzt! R2 recibió una descarga. Como en Tatooine, estará bien." },
      sand: { text: "No me gusta la arena. Es áspera, irritante, y se mete por todas partes.", sign: "— A. Skywalker", sweep: "Pasa el cursor o el dedo para barrer la arena." },
      hellothere: { hello: "Hello there!", reply: "General Kenobi!", sign: "— O. Kenobi" },
      bb8: "BB-8 cruzó las dunas y aprobó el archivo con el pulgar arriba.",
    },
  },
};
