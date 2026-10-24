export type HolonetCopy = {
  boot: { lines: [string, string, string, string]; granted: string; skip: string; label: string };
  sound: { on: string; off: string };
  hud: { channel: string; location: string; signal: string; ticker: [string, string, string, string, string, string]; scroll: string; push: string; force: string; touch: string };
  episodes: [string, string, string, string, string];
  jedi: { title: string; sheetLabel: string; sheet: [[string, string], [string, string], [string, string], [string, string]]; route: string; card: string; deflect: string };
  holocron: { featured: string; run: string; grounded: string; refused: string; archive: string };
  galaxy: { title: string; routes: string; year: string; signal: string };
  missions: { title: string; intro: string; labels: [string, string, string]; accept: string };
  credits: { title: string; body: string; cta: string; secondary: string; top: string; end: string };
};

export const holonet: Record<"pt" | "en" | "es", HolonetCopy> = {
  pt: {
    boot: { lines: ["HOLONET v4.2 // estabelecendo conexão segura", "carregando perfil: GLAUCIA_LEMOS", "classe: principal software engineer · ai transformation lead · microsoft mvp", "sincronizando transmissões de {events} eventos em {countries} países"], granted: "ACESSO CONCEDIDO", skip: "Pular abertura", label: "Inicialização da HoloNet" },
    sound: { on: "Ligar sons", off: "Desligar sons" },
    hud: { channel: "CANAL ABERTO // HOLONET", location: "SISTEMA DAGOBAH · SETOR SLUIS", signal: "SINAL", ticker: ["AGENTES DE IA", "RAG", "SPEC-DRIVEN DEVELOPMENT", "TYPESCRIPT", "LIDERANÇA TÉCNICA", "MICROSOFT MVP"], scroll: "Role para saltar", push: "Clique para empurrar · segure para levitar", force: "Força", touch: "Toque para empurrar · segure para usar a Força" },
    episodes: ["Episódio I — A origem", "Episódio II — A Jedi", "Episódio III — O holocron", "Episódio IV — O mapa galáctico", "Episódio V — Sua missão"],
    jedi: { title: "Uma Jedi forjada em comunidade.", sheetLabel: "Ficha de personagem", sheet: [["Classe", "Principal Software Engineer · AI Lead"], ["Afiliação", "Itaú Unibanco · Microsoft MVP · Codex & Devin Ambassador · ex-Microsoft"], ["Especialidade", "IA aplicada · Agentes · RAG · TypeScript"], ["Idiomas", "Português · English · Español"]], route: "Rota de hiperespaço da carreira", card: "Jedi da Comunidade", deflect: "Rebater disparos" },
    holocron: { featured: "Holocron em destaque", run: "executar", grounded: "resposta com fonte", refused: "sem fonte: resposta recusada", archive: "Arquivo de holocrons" },
    galaxy: { title: "Mapa galáctico de encontros.", routes: "Rotas registradas", year: "Ano", signal: "transmissões" },
    missions: { title: "Escolha sua missão.", intro: "Workshops para times, mentoria para lideranças e palestras que conectam tecnologia a decisões reais.", labels: ["Missão 01 · Times", "Missão 02 · Lideranças", "Missão 03 · Palcos"], accept: "Aceitar missão" },
    credits: { title: "Seu time é a próxima parada.", body: "Conte o desafio. A gente escolhe juntos a rota: estratégia, engenharia e IA no ritmo do seu time.", cta: "Iniciar transmissão", secondary: "Mandar DM no LinkedIn", top: "Voltar ao topo", end: "Fim da transmissão // Que a Força esteja com você" },
  },
  en: {
    boot: { lines: ["HOLONET v4.2 // establishing secure link", "loading profile: GLAUCIA_LEMOS", "class: principal software engineer · ai transformation lead · microsoft mvp", "syncing transmissions from {events} events in {countries} countries"], granted: "ACCESS GRANTED", skip: "Skip intro", label: "HoloNet start-up" },
    sound: { on: "Turn sound on", off: "Turn sound off" },
    hud: { channel: "OPEN CHANNEL // HOLONET", location: "DAGOBAH SYSTEM · SLUIS SECTOR", signal: "SIGNAL", ticker: ["AI AGENTS", "RAG", "SPEC-DRIVEN DEVELOPMENT", "TYPESCRIPT", "TECH LEADERSHIP", "MICROSOFT MVP"], scroll: "Scroll to jump", push: "Click to push · hold to levitate", force: "Force", touch: "Tap to push · hold to use the Force" },
    episodes: ["Episode I — The origin", "Episode II — The Jedi", "Episode III — The holocron", "Episode IV — The galactic map", "Episode V — Your mission"],
    jedi: { title: "A Jedi forged in community.", sheetLabel: "Character sheet", sheet: [["Class", "Principal Software Engineer · AI Lead"], ["Affiliation", "Itaú Unibanco · Microsoft MVP · Codex & Devin Ambassador · ex-Microsoft"], ["Specialty", "Applied AI · Agents · RAG · TypeScript"], ["Languages", "Português · English · Español"]], route: "Career hyperspace route", card: "Community Jedi", deflect: "Deflect blaster bolts" },
    holocron: { featured: "Featured holocron", run: "run", grounded: "grounded answer", refused: "no source: answer refused", archive: "Holocron archive" },
    galaxy: { title: "A galactic map of encounters.", routes: "Recorded routes", year: "Year", signal: "transmissions" },
    missions: { title: "Choose your mission.", intro: "Workshops for teams, mentoring for leaders and talks that connect technology to real decisions.", labels: ["Mission 01 · Teams", "Mission 02 · Leaders", "Mission 03 · Stages"], accept: "Accept mission" },
    credits: { title: "Your team is the next stop.", body: "Share the challenge. We will chart the route together: strategy, engineering and AI at your team’s pace.", cta: "Start transmission", secondary: "Send a LinkedIn DM", top: "Back to top", end: "End of transmission // May the Force be with you" },
  },
  es: {
    boot: { lines: ["HOLONET v4.2 // estableciendo conexión segura", "cargando perfil: GLAUCIA_LEMOS", "clase: principal software engineer · ai transformation lead · microsoft mvp", "sincronizando transmisiones de {events} eventos en {countries} países"], granted: "ACCESO CONCEDIDO", skip: "Saltar apertura", label: "Inicio de la HoloNet" },
    sound: { on: "Activar sonidos", off: "Desactivar sonidos" },
    hud: { channel: "CANAL ABIERTO // HOLONET", location: "SISTEMA DAGOBAH · SECTOR SLUIS", signal: "SEÑAL", ticker: ["AGENTES DE IA", "RAG", "SPEC-DRIVEN DEVELOPMENT", "TYPESCRIPT", "LIDERAZGO TÉCNICO", "MICROSOFT MVP"], scroll: "Desplázate para saltar", push: "Clic para empujar · mantén para levitar", force: "Fuerza", touch: "Toca para empujar · mantén para usar la Fuerza" },
    episodes: ["Episodio I — El origen", "Episodio II — La Jedi", "Episodio III — El holocrón", "Episodio IV — El mapa galáctico", "Episodio V — Tu misión"],
    jedi: { title: "Una Jedi forjada en comunidad.", sheetLabel: "Ficha de personaje", sheet: [["Clase", "Principal Software Engineer · AI Lead"], ["Afiliación", "Itaú Unibanco · Microsoft MVP · Codex & Devin Ambassador · ex-Microsoft"], ["Especialidad", "IA aplicada · Agentes · RAG · TypeScript"], ["Idiomas", "Português · English · Español"]], route: "Ruta de hiperespacio de la carrera", card: "Jedi de la Comunidad", deflect: "Desviar disparos" },
    holocron: { featured: "Holocrón destacado", run: "ejecutar", grounded: "respuesta con fuente", refused: "sin fuente: respuesta rechazada", archive: "Archivo de holocrones" },
    galaxy: { title: "Mapa galáctico de encuentros.", routes: "Rutas registradas", year: "Año", signal: "transmisiones" },
    missions: { title: "Elige tu misión.", intro: "Talleres para equipos, mentoría para líderes y charlas que conectan la tecnología con decisiones reales.", labels: ["Misión 01 · Equipos", "Misión 02 · Líderes", "Misión 03 · Escenarios"], accept: "Aceptar misión" },
    credits: { title: "Tu equipo es la próxima parada.", body: "Cuéntame el desafío. Elegimos juntos la ruta: estrategia, ingeniería e IA al ritmo de tu equipo.", cta: "Iniciar transmisión", secondary: "Enviar DM en LinkedIn", top: "Volver arriba", end: "Fin de la transmisión // Que la Fuerza te acompañe" },
  },
};
