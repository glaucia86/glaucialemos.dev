// About page: Nivéora, the snow world of the auroras.
import type { Era } from "@/lib/career";

type Pair = [string, string];
export const BADGES = {
  mvp: { id: "mvp", symbol: "star", href: "https://mvp.microsoft.com/pt-BR/MVP/profile/d3200941-395d-423b-a0ec-eb0577d3bb86" },
  codex: { id: "codex", symbol: "terminal", href: "https://learn.chatgpt.com/community/codex-ambassadors/directory" },
  devin: { id: "devin", symbol: "gear", href: "https://devin.ai/community" },
  packt: { id: "packt", symbol: "book", href: "https://www.packtpub.com/en-us/product/building-agentic-ai-apps-with-nextjs-and-typescript-9781806700936" },
} as const;
export type Badge = (typeof BADGES)[keyof typeof BADGES] & { name: string; note: string; linkLabel: string };

export type NiveoraCopy = {
  discoveries: string;
  boot: { lines: [string, string, string, string]; granted: string; skip: string; label: string; brand: string };
  hud: {
    channel: string; location: string; temp: string; wind: string; hint: string; touch: string; ticker: [string, string, string, string, string, string];
    glaucia: string; prince: string; crystal: string; station: string; capsule: string; calm: string;
  };
  chapters: [string, string, string, string];
  hero: { caption: string; scroll: string };
  status: { tracks: string; found: string; capsule: string; whiteout: string; calm: string; prism: string; drift: string };
  capsule: { title: string; intro: string; close: string; source: string; labels: { first: string; event: string; microsoft: string; now: string }; microsoftYears: string };
  log: {
    title: string; intro: string; card: string; id: string; imageAlt: string; sheetLabel: string; sheet: [Pair, Pair, Pair, Pair];
    statsLabel: string; stats: [string, string, string, string, string];
    badgesTitle: string; badgesIntro: string; flip: string; back: string; badges: [Badge, Badge, Badge, Badge]; languages: string;
  };
  map: {
    title: string; intro: string; viewList: string; viewMap: string; filter: string; all: string; now: string; current: string; legend: string; roles: string;
    eras: Record<Era, { name: string; summary: string }>;
  };
  ice: { label: string; desktop: string; touch: string; done: string };
  credits: { title: string; body: string; cta: string; secondary: string; hint: string; end: string };
};

export const niveora: Record<"pt" | "en" | "es", NiveoraCopy> = {
  pt: {
    discoveries: "Descobertas em Nivéora: {n}/{total}",
    boot: { lines: ["GALÁXIA ENCANTADA // rota para Nivéora", "pouso na estação polar: confirmado", "traje térmico selado · Prince aquecido", "sincronizando registros da trajetória"], granted: "AURORA ESTÁVEL", skip: "Pular abertura", label: "Abertura de Nivéora", brand: "// NIVÉORA" },
    hud: {
      channel: "ESTAÇÃO POLAR // NIVÉORA", location: "NIVÉORA · MUNDO DAS AURORAS", temp: "TEMP", wind: "VENTO", hint: "Clique no Prince · na Glaucia · no cristal", touch: "Toque no Prince, na Glaucia ou no cristal",
      ticker: ["MICROSOFT MVP", "OPENAI CODEX AMBASSADOR", "DEVIN AMBASSADOR", "COAUTORA PACKT", "+100 MIL DEVS", "IA GENERATIVA E AGÊNTICA"],
      glaucia: "Glaucia: abrir a cápsula de memória", prince: "Prince: seguir as pegadas na neve", crystal: "Cristal prismático: acender a aurora", station: "Estação meteorológica: chamar a nevasca", capsule: "Cápsula de memória", calm: "Acalmar o vento",
    },
    chapters: ["Quem sou", "Em números", "Trajetória profissional", "Vamos conversar"],
    hero: { caption: "Mundo nevado das auroras", scroll: "Role para o diário" },
    status: { tracks: "O Prince farejou uma pista…", found: "Uma cápsula de memória!", capsule: "Cápsula aberta", whiteout: "Alerta: nevasca", calm: "O vento acalmou", prism: "Aurora intensificada", drift: "A neve se acumula…" },
    capsule: { title: "Cápsula de memória", intro: "Registros da trajetória preservados no gelo de Nivéora. Cada um traz a sua fonte.", close: "Fechar a cápsula", source: "Fonte", labels: { first: "Primeiro registro", event: "Primeiro evento documentado", microsoft: "Microsoft", now: "Hoje" }, microsoftYears: "{n} anos na Microsoft" },
    log: {
      title: "Minha trajetória em números.", intro: "Mais de uma década levando código, comunidade e IA para mais gente: cargo atual, especialidades, reconhecimentos e alcance.",
      card: "Exploradora", id: "GE-ID · GL-0001 · NIVÉORA · ESTAÇÃO POLAR", imageAlt: "Glaucia Lemos em pixel art, com parca térmica, na neve de Nivéora sob a aurora", sheetLabel: "Ficha da expedição",
      sheet: [["Cargo", "Principal Software Engineer · AI Transformation Lead"], ["Base atual", "Itaú Unibanco"], ["Especialidade", "IA generativa e agêntica · RAG · Spec-Driven Development · Context Engineering · Harness Engineering"], ["Equipamento", "TypeScript · JavaScript · Node.js · Agentes de IA"]],
      statsLabel: "Registro de campo", stats: ["anos de carreira", "eventos", "países", "devs alcançados", "anos na Microsoft"],
      badgesTitle: "Insígnias de cristal", badgesIntro: "Reconhecimentos reais, lapidados no gelo. Use o botão para virar cada insígnia.", flip: "Virar insígnia",
      back: "Voltar",
      badges: [
        { ...BADGES.mvp, linkLabel: "Ver perfil MVP", name: "Microsoft MVP", note: "Reconhecimento da Microsoft por contribuição técnica contínua à comunidade." },
        { ...BADGES.codex, linkLabel: "Ver diretório de embaixadores", name: "OpenAI Codex Ambassador", note: "Embaixadora do Codex: agentes de código aplicados ao dia a dia de times reais." },
        { ...BADGES.devin, linkLabel: "Conhecer o programa", name: "Devin Ambassador", note: "Embaixadora do Devin, o engenheiro de software autônomo da Cognition." },
        { ...BADGES.packt, linkLabel: "Ver livro na Packt", name: "Coautora Packt", note: "Building Agentic AI Apps with Next.js, TypeScript and MCP: coautoria e revisão técnica." },
      ],
      languages: "Idiomas: Português · English · Español",
    },
    map: {
      viewList: "Ver em lista", viewMap: "Ver mapa",
      title: "Trajetória profissional.", intro: "Todos os meus cargos em uma linha do tempo, com a fonte de cada um. Cargos ao mesmo tempo aparecem em trilhas lado a lado. Escolha uma fase da carreira para ver de perto.",
      filter: "Filtrar por etapa", all: "Todas as etapas", now: "agora", current: "em curso", legend: "Linha do tempo de cargos em trilhas paralelas", roles: "trechos",
      eras: {
        foundation: { name: "Primeira neve", summary: "Código em produção, consultoria e as primeiras aulas: a base técnica." },
        advocacy: { name: "Travessia", summary: "Microsoft: Cloud Advocate e Developer Advocate para JavaScript, TypeScript e IA." },
        leadership: { name: "Cume", summary: "IA generativa e agêntica em escala: liderança, squads e livro pela Packt." },
      },
    },
    ice: { label: "Quebrar o gelo: faltam {n} golpes", desktop: "Raspe ou clique 3×", touch: "Toque 3×", done: "Gelo quebrado" },
    credits: { title: "A próxima expedição começa com você.", body: "A nave já está aquecendo os motores na estação polar. Traga o desafio do seu time e a gente traça a rota: estratégia, engenharia e IA no ritmo de vocês.", cta: "Conversar sobre workshops e mentorias", secondary: "Mandar DM no LinkedIn", hint: "Dica da estação: Nivéora esconde segredos. Abra o rádio estelar no topo da tela para encontrar todos.", end: "Fim do diário // Até a próxima aurora" },
  },
  en: {
    discoveries: "Discoveries in Nivéora: {n}/{total}",
    boot: { lines: ["ENCHANTED GALAXY // course set for Nivéora", "landing at the polar station: confirmed", "thermal suit sealed · Prince warmed up", "syncing career records"], granted: "AURORA STABLE", skip: "Skip intro", label: "Nivéora intro", brand: "// NIVÉORA" },
    hud: {
      channel: "POLAR STATION // NIVÉORA", location: "NIVÉORA · WORLD OF AURORAS", temp: "TEMP", wind: "WIND", hint: "Click Prince · Glaucia · the crystal", touch: "Tap Prince, Glaucia or the crystal",
      ticker: ["MICROSOFT MVP", "OPENAI CODEX AMBASSADOR", "DEVIN AMBASSADOR", "PACKT CO-AUTHOR", "100K+ DEVS", "GENERATIVE & AGENTIC AI"],
      glaucia: "Glaucia: open the memory capsule", prince: "Prince: follow the tracks in the snow", crystal: "Prismatic crystal: light up the aurora", station: "Weather station: call the blizzard", capsule: "Memory capsule", calm: "Calm the wind",
    },
    chapters: ["Who I am", "By the numbers", "Career path", "Let's talk"],
    hero: { caption: "Snow world of the auroras", scroll: "Scroll to the log" },
    status: { tracks: "Prince picked up a scent…", found: "A memory capsule!", capsule: "Capsule open", whiteout: "Alert: blizzard", calm: "The wind has calmed", prism: "Aurora flaring", drift: "Snow is piling up…" },
    capsule: { title: "Memory capsule", intro: "Career records preserved in Nivéora's ice. Each one comes with its source.", close: "Close the capsule", source: "Source", labels: { first: "First record", event: "First documented event", microsoft: "Microsoft", now: "Today" }, microsoftYears: "{n} years at Microsoft" },
    log: {
      title: "My career by the numbers.", intro: "More than a decade bringing code, community and AI to more people: current role, specialties, recognitions and reach.",
      card: "Explorer", id: "GE-ID · GL-0001 · NIVÉORA · POLAR STATION", imageAlt: "Glaucia Lemos in pixel art, wearing a thermal parka, in Nivéora's snow under the aurora", sheetLabel: "Expedition record",
      sheet: [["Role", "Principal Software Engineer · AI Transformation Lead"], ["Current base", "Itaú Unibanco"], ["Specialty", "Generative and agentic AI · RAG · Spec-Driven Development · Context Engineering · Harness Engineering"], ["Gear", "TypeScript · JavaScript · Node.js · AI agents"]],
      statsLabel: "Field log", stats: ["years of career", "events", "countries", "developers reached", "years at Microsoft"],
      badgesTitle: "Crystal badges", badgesIntro: "Real recognitions, cut from the ice. Use the button to flip each badge.", flip: "Flip badge",
      back: "Back",
      badges: [
        { ...BADGES.mvp, linkLabel: "View MVP profile", name: "Microsoft MVP", note: "Microsoft's recognition for ongoing technical contribution to the community." },
        { ...BADGES.codex, linkLabel: "View ambassador directory", name: "OpenAI Codex Ambassador", note: "Codex ambassador: coding agents applied to the daily work of real teams." },
        { ...BADGES.devin, linkLabel: "Explore the program", name: "Devin Ambassador", note: "Ambassador for Devin, Cognition's autonomous software engineer." },
        { ...BADGES.packt, linkLabel: "View book on Packt", name: "Packt co-author", note: "Building Agentic AI Apps with Next.js, TypeScript and MCP: co-author and technical reviewer." },
      ],
      languages: "Languages: Português · English · Español",
    },
    map: {
      viewList: "View list", viewMap: "View map",
      title: "Career path.", intro: "Every role I have held on one timeline, each with its source. Roles held at the same time sit on parallel trails. Pick a career phase to zoom in.",
      filter: "Filter by stage", all: "All stages", now: "now", current: "ongoing", legend: "Timeline of roles in parallel trails", roles: "stretches",
      eras: {
        foundation: { name: "First snow", summary: "Production code, consulting and the first courses: the technical foundation." },
        advocacy: { name: "The crossing", summary: "Microsoft: Cloud Advocate and Developer Advocate for JavaScript, TypeScript and AI." },
        leadership: { name: "The summit", summary: "Generative and agentic AI at scale: leadership, squads and a Packt book." },
      },
    },
    ice: { label: "Break the ice: {n} hits left", desktop: "Scrape or click 3×", touch: "Tap 3×", done: "Ice broken" },
    credits: { title: "The next expedition starts with you.", body: "The ship is already warming up at the polar station. Bring your team's challenge and we'll chart the course together: strategy, engineering and AI at your pace.", cta: "Talk about workshops and mentoring", secondary: "Send a LinkedIn DM", hint: "Station tip: Nivéora hides secrets. Open the star radio at the top of the screen to find them all.", end: "End of log // Until the next aurora" },
  },
  es: {
    discoveries: "Descubrimientos en Nivéora: {n}/{total}",
    boot: { lines: ["GALAXIA ENCANTADA // rumbo a Nivéora", "aterrizaje en la estación polar: confirmado", "traje térmico sellado · Prince abrigado", "sincronizando registros de la trayectoria"], granted: "AURORA ESTABLE", skip: "Saltar apertura", label: "Apertura de Nivéora", brand: "// NIVÉORA" },
    hud: {
      channel: "ESTACIÓN POLAR // NIVÉORA", location: "NIVÉORA · MUNDO DE LAS AURORAS", temp: "TEMP", wind: "VIENTO", hint: "Clic en Prince · Glaucia · el cristal", touch: "Toca a Prince, a Glaucia o el cristal",
      ticker: ["MICROSOFT MVP", "OPENAI CODEX AMBASSADOR", "DEVIN AMBASSADOR", "COAUTORA EN PACKT", "+100 MIL DEVS", "IA GENERATIVA Y AGÉNTICA"],
      glaucia: "Glaucia: abrir la cápsula de memoria", prince: "Prince: seguir las huellas en la nieve", crystal: "Cristal prismático: encender la aurora", station: "Estación meteorológica: llamar a la ventisca", capsule: "Cápsula de memoria", calm: "Calmar el viento",
    },
    chapters: ["Quién soy", "En números", "Trayectoria profesional", "Conversemos"],
    hero: { caption: "Mundo nevado de las auroras", scroll: "Desplázate al diario" },
    status: { tracks: "Prince olfateó una pista…", found: "¡Una cápsula de memoria!", capsule: "Cápsula abierta", whiteout: "Alerta: ventisca", calm: "El viento se calmó", prism: "Aurora intensificada", drift: "La nieve se acumula…" },
    capsule: { title: "Cápsula de memoria", intro: "Registros de la trayectoria conservados en el hielo de Nivéora. Cada uno trae su fuente.", close: "Cerrar la cápsula", source: "Fuente", labels: { first: "Primer registro", event: "Primer evento documentado", microsoft: "Microsoft", now: "Hoy" }, microsoftYears: "{n} años en Microsoft" },
    log: {
      title: "Mi trayectoria en números.", intro: "Más de una década acercando código, comunidad e IA a más personas: cargo actual, especialidades, reconocimientos y alcance.",
      card: "Exploradora", id: "GE-ID · GL-0001 · NIVÉORA · ESTACIÓN POLAR", imageAlt: "Glaucia Lemos en pixel art, con parka térmica, en la nieve de Nivéora bajo la aurora", sheetLabel: "Ficha de la expedición",
      sheet: [["Cargo", "Principal Software Engineer · AI Transformation Lead"], ["Base actual", "Itaú Unibanco"], ["Especialidad", "IA generativa y agéntica · RAG · Spec-Driven Development · Context Engineering · Harness Engineering"], ["Equipo", "TypeScript · JavaScript · Node.js · Agentes de IA"]],
      statsLabel: "Registro de campo", stats: ["años de carrera", "eventos", "países", "devs alcanzados", "años en Microsoft"],
      badgesTitle: "Insignias de cristal", badgesIntro: "Reconocimientos reales, tallados en el hielo. Usa el botón para girar cada insignia.", flip: "Girar insignia",
      back: "Volver",
      badges: [
        { ...BADGES.mvp, linkLabel: "Ver perfil MVP", name: "Microsoft MVP", note: "Reconocimiento de Microsoft por su contribución técnica continua a la comunidad." },
        { ...BADGES.codex, linkLabel: "Ver directorio de embajadores", name: "OpenAI Codex Ambassador", note: "Embajadora de Codex: agentes de código aplicados al día a día de equipos reales." },
        { ...BADGES.devin, linkLabel: "Conocer el programa", name: "Devin Ambassador", note: "Embajadora de Devin, el ingeniero de software autónomo de Cognition." },
        { ...BADGES.packt, linkLabel: "Ver libro en Packt", name: "Coautora en Packt", note: "Building Agentic AI Apps with Next.js, TypeScript and MCP: coautoría y revisión técnica." },
      ],
      languages: "Idiomas: Português · English · Español",
    },
    map: {
      viewList: "Ver lista", viewMap: "Ver mapa",
      title: "Trayectoria profesional.", intro: "Todos mis cargos en una línea de tiempo, cada uno con su fuente. Los cargos simultáneos aparecen en senderos paralelos. Elige una etapa de la carrera para verla de cerca.",
      filter: "Filtrar por etapa", all: "Todas las etapas", now: "ahora", current: "en curso", legend: "Línea de tiempo de cargos en senderos paralelos", roles: "tramos",
      eras: {
        foundation: { name: "Primera nieve", summary: "Código en producción, consultoría y los primeros cursos: la base técnica." },
        advocacy: { name: "La travesía", summary: "Microsoft: Cloud Advocate y Developer Advocate de JavaScript, TypeScript e IA." },
        leadership: { name: "La cumbre", summary: "IA generativa y agéntica a escala: liderazgo, squads y un libro con Packt." },
      },
    },
    ice: { label: "Romper el hielo: faltan {n} golpes", desktop: "Raspa o haz clic 3×", touch: "Toca 3×", done: "Hielo roto" },
    credits: { title: "La próxima expedición empieza contigo.", body: "La nave ya está calentando motores en la estación polar. Trae el desafío de tu equipo y trazamos juntos la ruta: estrategia, ingeniería e IA a su ritmo.", cta: "Conversar sobre talleres y mentorías", secondary: "Enviar DM en LinkedIn", hint: "Consejo de la estación: Nivéora esconde secretos. Abre la radio estelar en la parte superior de la pantalla para encontrarlos todos.", end: "Fin del diario // Hasta la próxima aurora" },
  },
};
