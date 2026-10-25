// Projects page: Marte, the Valley of Inventions.
import type { Category, SortKey } from "@/lib/repos";

export type Station = "microsoft" | "Azure-Samples" | "MicrosoftDocs" | "Azure" | "nodejs" | "community";

export type MarteCopy = {
  discoveries: string;
  boot: { lines: [string, string, string, string]; granted: string; skip: string; label: string; brand: string };
  hud: {
    channel: string; location: string; temp: string; dust: string; hint: string; touch: string;
    glaucia: string; rover: string; prince: string; console: string;
  };
  chapters: [string, string, string, string, string];
  hero: { title: string; intro: string; extra: string; caption: string; scroll: string; jump: string; readouts: [string, string, string] };
  status: { scanning: string; scanned: string; sniffing: string; sample: string };
  readout: { scan: string; sample: string; sampleNote: string; created: string; stars: string; language: string; open: string; archive: string; again: string; close: string };
  memory: {
    title: string; intro: string; statsLabel: string; offline: string;
    stats: { originals: string; stars: string; forks: string; followers: string; mergedPrs: string; gists: string; publicRepos: string; years: string };
    samples: string; samplesNote: string; other: string;
    readAt: string;
  };
  archive: {
    title: string; intro: string; featured: string; featuredCta: string;
    categoriesLabel: string; all: string; categories: Record<Category, string>;
    languagesLabel: string; anyLanguage: string; sortLabel: string; sorts: Record<SortKey, string>;
    search: string; placeholder: string; count: string; empty: string; clear: string;
    stars: string; forks: string; updated: string; more: string;
  };
  bench: {
    open: string; close: string; title: string; firstCommit: string; today: string; created: string; lastPush: string; commits: string; source: string; unavailable: string;
    card: { title: string; then: string; now: string; career: string };
    site: {
      name: string; summary: string; title: string; intro: string; stations: [[string, string], [string, string], [string, string]];
      before: string; after: string; rejected: string; showRejected: string; showApproved: string; slider: string; decision: string; firstCommit: string;
    };
  };
  stations: {
    title: string; intro: string; scoreboard: string; scoreboardNote: string;
    names: Record<Station, { name: string; motto: string }>;
    prs: string; prsLink: string; stars: string;
  };
  bug: {
    label: string; title: string; intro: string; input: string; process: string; output: string; broken: string; pick: string;
    fixed: string; source: string; close: string; fallback: string;
  };
  credits: { title: string; body: string; cta: string; secondary: string; hint: string; end: string };
  dust: { label: string; fine: string; touch: string; title: string; body: string; pushed: string };
  sprout: { label: string; title: string; body: string; created: string; open: string };
  colony: { title: string; note: string; item: string };
  retro: {
    title: string; hint: string; prince: string; digging: string; floppy: string; insert: string; booting: string;
    then: string; now: string; reboot: string; rebooted: string; eject: string; fallback: string;
  };
};

export const marte: Record<"pt" | "en" | "es", MarteCopy> = {
  pt: {
    discoveries: "Descobertas em Marte: {n}/{total}",
    boot: { lines: ["GALÁXIA ENCANTADA // rota para Marte", "pouso no Vale das Invenções: confirmado", "traje de EVA selado · Prince de capacete", "lendo a telemetria do GitHub"], granted: "SOLO FIRME", skip: "Pular abertura", label: "Abertura de Marte", brand: "// MARTE" },
    hud: {
      channel: "LABORATÓRIO // VALE DAS INVENÇÕES", location: "MARTE · VALE DAS INVENÇÕES", temp: "TEMP", dust: "POEIRA",
      hint: "Clique na Glaucia · no rover · no Prince", touch: "Toque na Glaucia, no rover ou no Prince",
      glaucia: "Glaucia: comandar a varredura do rover", rover: "Rover: varrer o vale", prince: "Prince: farejar uma amostra", console: "Console de análise: ler a varredura",
    },
    chapters: ["Vale das Invenções", "Telemetria do laboratório", "Arquivo de invenções", "Estações parceiras", "Próxima missão"],
    hero: {
      title: "Invenções que ensinam construindo.",
      intro: "Mais de uma década de código aberto num laboratório a céu aberto: cursos, workshops, agentes de IA e servidores MCP que ensinam construindo.",
      extra: "As estrelas e os números vêm direto do GitHub e são atualizados todo mês. Quando o sinal cai, o laboratório usa a última leitura salva.",
      caption: "Laboratório a céu aberto", scroll: "Role para a telemetria", jump: "Sinal adquirido",
      readouts: ["repositórios originais", "estrelas", "PRs mergeados fora da minha conta"],
    },
    status: { scanning: "Varredura em andamento…", scanned: "Sinal encontrado", sniffing: "O Prince farejou algo…", sample: "Amostra coletada" },
    readout: { scan: "Leitura do rover", sample: "Amostra mais antiga", sampleNote: "O repositório original mais antigo do arquivo, guardado como uma rocha do vale.", created: "criado em", stars: "estrelas", language: "linguagem", open: "Abrir no GitHub", archive: "Ver no arquivo", again: "Nova varredura", close: "Fechar a leitura" },
    memory: {
      title: "O que o laboratório registrou.", intro: "Telemetria lida do GitHub: cada número é um projeto entregue, um fork de outra pessoa ou uma revisão aceita por outro time.",
      statsLabel: "Telemetria do GitHub", offline: "Sinal fraco: exibindo a última leitura salva pelo laboratório.",
      stats: { originals: "repositórios originais", stars: "estrelas nos originais", forks: "forks", followers: "seguidores", mergedPrs: "PRs mergeados fora da minha conta", gists: "gists", publicRepos: "repositórios públicos", years: "anos no GitHub" },
      samples: "Amostras minerais", samplesNote: "Linguagens dos repositórios originais. Cada amostra tem a sua cor.", other: "Outras",
      readAt: "Leitura do GitHub em {date}",
    },
    archive: {
      title: "Arquivo de invenções.", intro: "Cada bancada guarda um projeto. Filtre por área ou linguagem, procure pelo nome e ordene como preferir.",
      featured: "Invenção em destaque", featuredCta: "Abrir a invenção",
      categoriesLabel: "Área", all: "Tudo", categories: { ai: "IA e agentes", learn: "Cursos e workshops", cloud: "Azure e serverless", web: "Web e APIs" },
      languagesLabel: "Linguagem", anyLanguage: "Todas", sortLabel: "Ordenar", sorts: { stars: "Estrelas", recent: "Atividade recente", forks: "Forks" },
      search: "Buscar no arquivo", placeholder: "nome, tema ou linguagem…", count: "{n} de {total} invenções", empty: "Nenhuma invenção com esse sinal. Tente outro termo.", clear: "Limpar filtros",
      stars: "estrelas", forks: "forks", updated: "último push", more: "Ver todos os repositórios no GitHub",
    },
    bench: {
      open: "Abrir a carcaça", close: "Fechar a carcaça", title: "Registro de bancada", firstCommit: "Primeiro commit", today: "Hoje", created: "Criado em", lastPush: "Último push", commits: "{n} commits na branch principal", source: "Fonte", unavailable: "Primeiro commit não registrado no snapshot.",
      card: { title: "O cartão de 2018 e o de hoje", then: "2018", now: "Hoje", career: "O cartão é de 2018, mas a trajetória profissional começa antes: {start}, como {role} na {company}." },
      site: {
        name: "glaucialemos.dev", summary: "Esta página. A Galáxia Encantada é desenhada, recortada e montada neste repositório.", title: "Esta página, antes de ficar bonita",
        intro: "Arraste a linha para comparar a pose aprovada que saiu do Grok com o sprite que está na cena de Marte.",
        stations: [["Pose aprovada", "A Glaucia de traje de EVA, como saiu do Grok, em alta resolução."], ["Recorte automático", "O script de assets separa cada pose e ancora os pés no chão da placa."], ["Pixel da placa", "Cada pixel de arte vira um pixel da placa, com borda dura e paleta limitada."]],
        before: "Antes · Grok", after: "Depois · na cena", rejected: "Recusada · 3 × 3", showRejected: "Ver a versão recusada (3 × 3)", showApproved: "Voltar à versão aprovada",
        slider: "Comparar antes e depois", decision: "Decisão registrada: a primeira versão, com pixels de 3 × 3 e 40 cores, foi recusada por ficar “pixelada demais”.", firstCommit: "chore: initial README and .gitignore",
      },
    },
    stations: {
      title: "Estações parceiras.", intro: "O laboratório não trabalha sozinho: samples oficiais, cursos do Microsoft Learn, documentação e o site do Node.js.",
      scoreboard: "{prs} PRs mergeados em {repos} repositórios de outras organizações", scoreboardNote: "Contagem ao vivo da busca do GitHub por PRs mergeados com a minha autoria.",
      names: {
        microsoft: { name: "Estação Microsoft", motto: "microsoft · currículos e cenários oficiais" },
        "Azure-Samples": { name: "Estação Azure Samples", motto: "Azure-Samples · samples oficiais de IA e serverless" },
        MicrosoftDocs: { name: "Estação Microsoft Docs", motto: "MicrosoftDocs · cursos e documentação" },
        Azure: { name: "Estação Azure", motto: "Azure · ferramentas oficiais" },
        nodejs: { name: "Estação Node.js", motto: "nodejs · o site oficial e a tradução" },
        community: { name: "Estação Comunidade", motto: "comunidade · projetos coletivos" },
      },
      prs: "{n} PRs", prsLink: "Meus PRs", stars: "estrelas",
    },
    bug: {
      label: "Um bug perdido no laboratório", title: "Circuito do swa init", intro: "Um projeto Next.js entra no comando swa init, o CLI reconhece o framework e gera a configuração. Duas peças saíam erradas.",
      input: "Entrada", process: "Processamento", output: "Saída", broken: "peça com defeito", pick: "Trocar por",
      fixed: "Circuito fechado. Corrigido no PR #555 do Azure Static Web Apps CLI, mesclado em 12/09/2022.", source: "Ver o PR #555", close: "Fechar o circuito",
      fallback: "No Azure Static Web Apps CLI, o swa init gerava “npm dev” e a saída “.” para projetos Next.js. O PR #555 trocou por “npm run dev” e “.next”.",
    },
    credits: { title: "A próxima invenção pode ser do seu time.", body: "O laboratório continua aberto. Traga o desafio do seu time e a gente transforma em código, curso ou workshop.", cta: "Iniciar a missão", secondary: "Mandar DM no LinkedIn", hint: "Dica do laboratório: este vale esconde 7 segredos. O rádio estelar, no cabeçalho, ajuda a encontrar todos.", end: "Fim da transmissão // Solo firme, código aberto" },
    dust: { label: "Painel coberto de poeira", fine: "Passe o cursor para limpar ou pressione Enter", touch: "Toque 3 vezes para limpar", title: "Último sinal do vale", body: "O repositório com o push mais recente no arquivo.", pushed: "último push em" },
    sprout: { label: "Uma estufa na cúpula de {year}", title: "O broto mais novo do vale", body: "O repositório original criado mais recentemente no arquivo.", created: "criado em", open: "Abrir no GitHub" },
    colony: { title: "A colônia que cresceu", note: "Cada lote é um ano: os módulos sobem conforme os repositórios criados naquele ano.", item: "{year}: {n} repositórios" },
    retro: {
      title: "Terminal antigo", hint: "O drive está vazio. O Prince farejou alguma coisa na areia.", prince: "Prince: farejar a areia ao lado do computador", digging: "O Prince desenterrou um disquete!",
      floppy: "Disquete encontrado · glaucia_lemos86 · 2018", insert: "Inserir o disquete no computador (Enter, toque ou arraste até o drive)", booting: "Lendo o disquete…",
      then: "2018", now: "hoje", reboot: "Atualizar para hoje", rebooted: "Cartão atualizado. Alguns links envelheceram melhor que outros.", eject: "Ejetar o disquete",
      fallback: "Disquete de 2018: npx glaucia_lemos86",
    },
  },
  en: {
    discoveries: "Discoveries on Mars: {n}/{total}",
    boot: { lines: ["ENCHANTED GALAXY // course set for Mars", "landing in the Valley of Inventions: confirmed", "EVA suit sealed · Prince in his helmet", "reading GitHub telemetry"], granted: "SOLID GROUND", skip: "Skip intro", label: "Mars intro", brand: "// MARS" },
    hud: {
      channel: "LAB // VALLEY OF INVENTIONS", location: "MARS · VALLEY OF INVENTIONS", temp: "TEMP", dust: "DUST",
      hint: "Click Glaucia · the rover · Prince", touch: "Tap Glaucia, the rover or Prince",
      glaucia: "Glaucia: direct the rover's scan", rover: "Rover: scan the valley", prince: "Prince: sniff out a sample", console: "Analysis console: read the scan",
    },
    chapters: ["Valley of Inventions", "Lab telemetry", "Archive of inventions", "Partner stations", "Next mission"],
    hero: {
      title: "Inventions that teach by building.",
      intro: "More than a decade of open source in an open-air lab: courses, workshops, AI agents and MCP servers that teach by building.",
      extra: "Stars and numbers come straight from GitHub and refresh every month. When the signal drops, the lab uses the last saved reading.",
      caption: "Open-air lab", scroll: "Scroll to the telemetry", jump: "Signal acquired",
      readouts: ["original repositories", "stars", "merged PRs outside my account"],
    },
    status: { scanning: "Scanning…", scanned: "Signal found", sniffing: "Prince smelled something…", sample: "Sample collected" },
    readout: { scan: "Rover reading", sample: "Oldest sample", sampleNote: "The oldest original repository in the archive, kept like a rock of the valley.", created: "created", stars: "stars", language: "language", open: "Open on GitHub", archive: "See it in the archive", again: "Scan again", close: "Close the reading" },
    memory: {
      title: "What the lab recorded.", intro: "Telemetry read from GitHub: every number is a delivered project, someone else's fork or a review accepted by another team.",
      statsLabel: "GitHub telemetry", offline: "Weak signal: showing the last reading the lab saved.",
      stats: { originals: "original repositories", stars: "stars on originals", forks: "forks", followers: "followers", mergedPrs: "merged PRs outside my account", gists: "gists", publicRepos: "public repositories", years: "years on GitHub" },
      samples: "Mineral samples", samplesNote: "Languages of the original repositories. Each sample has its own colour.", other: "Other",
      readAt: "GitHub reading from {date}",
    },
    archive: {
      title: "Archive of inventions.", intro: "Each workbench holds a project. Filter by area or language, search by name and sort however you like.",
      featured: "Featured invention", featuredCta: "Open the invention",
      categoriesLabel: "Area", all: "All", categories: { ai: "AI & agents", learn: "Courses & workshops", cloud: "Azure & serverless", web: "Web & APIs" },
      languagesLabel: "Language", anyLanguage: "All", sortLabel: "Sort", sorts: { stars: "Stars", recent: "Recent activity", forks: "Forks" },
      search: "Search the archive", placeholder: "name, topic or language…", count: "{n} of {total} inventions", empty: "No inventions on that signal. Try another term.", clear: "Clear filters",
      stars: "stars", forks: "forks", updated: "last push", more: "See every repository on GitHub",
    },
    bench: {
      open: "Open the casing", close: "Close the casing", title: "Workbench log", firstCommit: "First commit", today: "Today", created: "Created", lastPush: "Last push", commits: "{n} commits on the main branch", source: "Source", unavailable: "First commit not recorded in the snapshot.",
      card: { title: "The 2018 card and today's", then: "2018", now: "Today", career: "The card is from 2018, but the career starts earlier: {start}, as {role} at {company}." },
      site: {
        name: "glaucialemos.dev", summary: "This page. The Enchanted Galaxy is drawn, cut out and assembled in this repository.", title: "This page, before it was pretty",
        intro: "Drag the line to compare the approved pose that came out of Grok with the sprite standing in the Mars scene.",
        stations: [["Approved pose", "Glaucia in her EVA suit, straight from Grok, in high resolution."], ["Automatic cut-out", "The asset script separates each pose and anchors the feet on the plate's ground."], ["Plate pixel", "Each art pixel becomes one plate pixel, with hard edges and a limited palette."]],
        before: "Before · Grok", after: "After · in the scene", rejected: "Turned down · 3 × 3", showRejected: "See the rejected version (3 × 3)", showApproved: "Back to the approved version",
        slider: "Compare before and after", decision: "Recorded decision: the first version, with 3 × 3 pixels and 40 colours, was turned down for being “too pixelated”.", firstCommit: "chore: initial README and .gitignore",
      },
    },
    stations: {
      title: "Partner stations.", intro: "The lab doesn't work alone: official samples, Microsoft Learn courses, documentation and the Node.js website.",
      scoreboard: "{prs} merged PRs across {repos} repositories in other organizations", scoreboardNote: "Live count from GitHub's search for merged PRs I authored.",
      names: {
        microsoft: { name: "Microsoft station", motto: "microsoft · official curricula and scenarios" },
        "Azure-Samples": { name: "Azure Samples station", motto: "Azure-Samples · official AI and serverless samples" },
        MicrosoftDocs: { name: "Microsoft Docs station", motto: "MicrosoftDocs · courses and documentation" },
        Azure: { name: "Azure station", motto: "Azure · official tooling" },
        nodejs: { name: "Node.js station", motto: "nodejs · the official website and its translation" },
        community: { name: "Community station", motto: "community · shared projects" },
      },
      prs: "{n} PRs", prsLink: "My PRs", stars: "stars",
    },
    bug: {
      label: "A bug lost in the lab", title: "The swa init circuit", intro: "A Next.js project goes into swa init, the CLI recognises the framework and writes the configuration. Two parts came out wrong.",
      input: "Input", process: "Processing", output: "Output", broken: "faulty part", pick: "Swap for",
      fixed: "Circuit closed. Fixed in PR #555 of the Azure Static Web Apps CLI, merged on 2022-09-12.", source: "See PR #555", close: "Close the circuit",
      fallback: "In the Azure Static Web Apps CLI, swa init wrote “npm dev” and the output “.” for Next.js projects. PR #555 changed them to “npm run dev” and “.next”.",
    },
    credits: { title: "The next invention could be your team's.", body: "The lab stays open. Bring your team's challenge and we'll turn it into code, a course or a workshop.", cta: "Start the mission", secondary: "Send a LinkedIn DM", hint: "Lab tip: this valley hides 7 secrets. The star radio, in the header, helps you find them all.", end: "End of transmission // Solid ground, open code" },
    dust: { label: "Dust-covered panel", fine: "Move the cursor to wipe it, or press Enter", touch: "Tap 3 times to wipe it", title: "Latest signal from the valley", body: "The repository with the most recent push in the archive.", pushed: "last push on" },
    sprout: { label: "A greenhouse on the {year} dome", title: "The valley's newest sprout", body: "The most recently created original repository in the archive.", created: "created", open: "Open on GitHub" },
    colony: { title: "The colony that grew", note: "Each lot is a year: modules rise with the repositories created that year.", item: "{year}: {n} repositories" },
    retro: {
      title: "Old terminal", hint: "The drive is empty. Prince smelled something in the sand.", prince: "Prince: sniff the sand by the computer", digging: "Prince dug up a floppy disk!",
      floppy: "Floppy disk found · glaucia_lemos86 · 2018", insert: "Insert the floppy disk into the computer (Enter, tap or drag it to the drive)", booting: "Reading the floppy disk…",
      then: "2018", now: "today", reboot: "Update to today", rebooted: "Card updated. Some links aged better than others.", eject: "Eject the floppy disk",
      fallback: "2018 floppy disk: npx glaucia_lemos86",
    },
  },
  es: {
    discoveries: "Descubrimientos en Marte: {n}/{total}",
    boot: { lines: ["GALAXIA ENCANTADA // rumbo a Marte", "aterrizaje en el Valle de los Inventos: confirmado", "traje EVA sellado · Prince con casco", "leyendo la telemetría de GitHub"], granted: "SUELO FIRME", skip: "Saltar apertura", label: "Apertura de Marte", brand: "// MARTE" },
    hud: {
      channel: "LABORATORIO // VALLE DE LOS INVENTOS", location: "MARTE · VALLE DE LOS INVENTOS", temp: "TEMP", dust: "POLVO",
      hint: "Clic en Glaucia · el rover · Prince", touch: "Toca a Glaucia, el rover o Prince",
      glaucia: "Glaucia: dirigir el escaneo del rover", rover: "Rover: escanear el valle", prince: "Prince: olfatear una muestra", console: "Consola de análisis: leer el escaneo",
    },
    chapters: ["Valle de los Inventos", "Telemetría del laboratorio", "Archivo de inventos", "Estaciones aliadas", "Próxima misión"],
    hero: {
      title: "Inventos que enseñan construyendo.",
      intro: "Más de una década de código abierto en un laboratorio al aire libre: cursos, talleres, agentes de IA y servidores MCP que enseñan construyendo.",
      extra: "Las estrellas y los números vienen directo de GitHub y se actualizan cada mes. Cuando cae la señal, el laboratorio usa la última lectura guardada.",
      caption: "Laboratorio al aire libre", scroll: "Desplázate a la telemetría", jump: "Señal adquirida",
      readouts: ["repositorios originales", "estrellas", "PRs fusionados fuera de mi cuenta"],
    },
    status: { scanning: "Escaneo en curso…", scanned: "Señal encontrada", sniffing: "Prince olfateó algo…", sample: "Muestra recolectada" },
    readout: { scan: "Lectura del rover", sample: "Muestra más antigua", sampleNote: "El repositorio original más antiguo del archivo, guardado como una roca del valle.", created: "creado el", stars: "estrellas", language: "lenguaje", open: "Abrir en GitHub", archive: "Ver en el archivo", again: "Nuevo escaneo", close: "Cerrar la lectura" },
    memory: {
      title: "Lo que registró el laboratorio.", intro: "Telemetría leída de GitHub: cada número es un proyecto entregado, un fork de otra persona o una revisión aceptada por otro equipo.",
      statsLabel: "Telemetría de GitHub", offline: "Señal débil: mostrando la última lectura guardada por el laboratorio.",
      stats: { originals: "repositorios originales", stars: "estrellas en los originales", forks: "forks", followers: "seguidores", mergedPrs: "PRs fusionados fuera de mi cuenta", gists: "gists", publicRepos: "repositorios públicos", years: "años en GitHub" },
      samples: "Muestras minerales", samplesNote: "Lenguajes de los repositorios originales. Cada muestra tiene su color.", other: "Otros",
      readAt: "Lectura de GitHub del {date}",
    },
    archive: {
      title: "Archivo de inventos.", intro: "Cada banco de trabajo guarda un proyecto. Filtra por área o lenguaje, busca por nombre y ordena como prefieras.",
      featured: "Invento destacado", featuredCta: "Abrir el invento",
      categoriesLabel: "Área", all: "Todo", categories: { ai: "IA y agentes", learn: "Cursos y talleres", cloud: "Azure y serverless", web: "Web y APIs" },
      languagesLabel: "Lenguaje", anyLanguage: "Todos", sortLabel: "Ordenar", sorts: { stars: "Estrellas", recent: "Actividad reciente", forks: "Forks" },
      search: "Buscar en el archivo", placeholder: "nombre, tema o lenguaje…", count: "{n} de {total} inventos", empty: "Ningún invento con esa señal. Prueba otro término.", clear: "Limpiar filtros",
      stars: "estrellas", forks: "forks", updated: "último push", more: "Ver todos los repositorios en GitHub",
    },
    bench: {
      open: "Abrir la carcasa", close: "Cerrar la carcasa", title: "Registro del banco", firstCommit: "Primer commit", today: "Hoy", created: "Creado el", lastPush: "Último push", commits: "{n} commits en la rama principal", source: "Fuente", unavailable: "Primer commit no registrado en el snapshot.",
      card: { title: "La tarjeta de 2018 y la de hoy", then: "2018", now: "Hoy", career: "La tarjeta es de 2018, pero la trayectoria profesional empieza antes: {start}, como {role} en {company}." },
      site: {
        name: "glaucialemos.dev", summary: "Esta página. La Galaxia Encantada se dibuja, recorta y monta en este repositorio.", title: "Esta página, antes de ponerse bonita",
        intro: "Arrastra la línea para comparar la pose aprobada que salió de Grok con el sprite que está en la escena de Marte.",
        stations: [["Pose aprobada", "Glaucia con su traje EVA, tal como salió de Grok, en alta resolución."], ["Recorte automático", "El script de assets separa cada pose y ancla los pies en el suelo de la placa."], ["Píxel de la placa", "Cada píxel de arte es un píxel de la placa, con borde duro y paleta limitada."]],
        before: "Antes · Grok", after: "Después · en la escena", rejected: "Rechazada · 3 × 3", showRejected: "Ver la versión rechazada (3 × 3)", showApproved: "Volver a la versión aprobada",
        slider: "Comparar antes y después", decision: "Decisión registrada: la primera versión, con píxeles de 3 × 3 y 40 colores, fue rechazada por quedar “demasiado pixelada”.", firstCommit: "chore: initial README and .gitignore",
      },
    },
    stations: {
      title: "Estaciones aliadas.", intro: "El laboratorio no trabaja solo: samples oficiales, cursos de Microsoft Learn, documentación y el sitio de Node.js.",
      scoreboard: "{prs} PRs fusionados en {repos} repositorios de otras organizaciones", scoreboardNote: "Conteo en vivo de la búsqueda de GitHub de PRs fusionados de mi autoría.",
      names: {
        microsoft: { name: "Estación Microsoft", motto: "microsoft · currículos y escenarios oficiales" },
        "Azure-Samples": { name: "Estación Azure Samples", motto: "Azure-Samples · samples oficiales de IA y serverless" },
        MicrosoftDocs: { name: "Estación Microsoft Docs", motto: "MicrosoftDocs · cursos y documentación" },
        Azure: { name: "Estación Azure", motto: "Azure · herramientas oficiales" },
        nodejs: { name: "Estación Node.js", motto: "nodejs · el sitio oficial y su traducción" },
        community: { name: "Estación Comunidad", motto: "comunidad · proyectos colectivos" },
      },
      prs: "{n} PRs", prsLink: "Mis PRs", stars: "estrellas",
    },
    bug: {
      label: "Un bug perdido en el laboratorio", title: "Circuito de swa init", intro: "Un proyecto Next.js entra en swa init, la CLI reconoce el framework y escribe la configuración. Dos piezas salían mal.",
      input: "Entrada", process: "Procesamiento", output: "Salida", broken: "pieza defectuosa", pick: "Cambiar por",
      fixed: "Circuito cerrado. Corregido en el PR #555 de Azure Static Web Apps CLI, fusionado el 12/09/2022.", source: "Ver el PR #555", close: "Cerrar el circuito",
      fallback: "En Azure Static Web Apps CLI, swa init escribía “npm dev” y la salida “.” para proyectos Next.js. El PR #555 los cambió por “npm run dev” y “.next”.",
    },
    credits: { title: "El próximo invento puede ser de tu equipo.", body: "El laboratorio sigue abierto. Trae el desafío de tu equipo y lo convertimos en código, un curso o un taller.", cta: "Iniciar la misión", secondary: "Enviar DM por LinkedIn", hint: "Pista del laboratorio: este valle esconde 7 secretos. La radio estelar, en la cabecera, ayuda a encontrarlos todos.", end: "Fin de la transmisión // Suelo firme, código abierto" },
    dust: { label: "Panel cubierto de polvo", fine: "Pasa el cursor para limpiarlo o pulsa Enter", touch: "Toca 3 veces para limpiarlo", title: "Última señal del valle", body: "El repositorio con el push más reciente del archivo.", pushed: "último push el" },
    sprout: { label: "Un invernadero en la cúpula de {year}", title: "El brote más nuevo del valle", body: "El repositorio original creado más recientemente en el archivo.", created: "creado el", open: "Abrir en GitHub" },
    colony: { title: "La colonia que creció", note: "Cada lote es un año: los módulos suben con los repositorios creados ese año.", item: "{year}: {n} repositorios" },
    retro: {
      title: "Terminal antigua", hint: "La unidad está vacía. Prince olfateó algo en la arena.", prince: "Prince: olfatear la arena junto a la computadora", digging: "¡Prince desenterró un disquete!",
      floppy: "Disquete encontrado · glaucia_lemos86 · 2018", insert: "Insertar el disquete en la computadora (Enter, toque o arrástralo a la unidad)", booting: "Leyendo el disquete…",
      then: "2018", now: "hoy", reboot: "Actualizar a hoy", rebooted: "Tarjeta actualizada. Algunos enlaces envejecieron mejor que otros.", eject: "Expulsar el disquete",
      fallback: "Disquete de 2018: npx glaucia_lemos86",
    },
  },
};
