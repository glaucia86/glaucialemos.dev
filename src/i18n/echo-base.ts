// About page: the Rebel archive at Echo Base, Hoth.
type Pair = [string, string];
type Medal = { name: string; note: string };

export type EchoCopy = {
  boot: { lines: [string, string, string, string]; granted: string; skip: string; label: string };
  hud: { channel: string; location: string; temp: string; shield: string; hint: string; touch: string; ticker: [string, string, string, string, string, string] };
  transmissions: [string, string, string, string];
  hero: { ion: string; ionDone: string; caption: string; scroll: string };
  dossier: {
    title: string; intro: string; card: string; id: string; imageAlt: string; sheetLabel: string; sheet: [Pair, Pair, Pair, Pair];
    statsLabel: string; stats: [string, string, string, string, string];
    odds: string; oddsValue: string; oddsQuote: string; oddsSign: string;
    medalsTitle: string; medalsIntro: string; flip: string; medals: [Medal, Medal, Medal, Medal];
    protocols: string;
  };
  ops: {
    title: string; intro: string; filter: string; all: string; now: string; current: string; legend: string; roles: string;
    eras: Record<"padawan" | "knight" | "master", { name: string; summary: string }>;
  };
  threepio: { label: string; lines: [string, string, string, string, string]; armOff: string; armOn: string; doomed: string; maker: string; relief: string };
  eggs: { holoTitle: string; holoBody: string; holoClose: string; iKnow: string; iKnowSign: string; tauntaun: string; probe: string; blizzard: string; iceLabel: string; iceCount: string; iceDone: string };
  credits: { title: string; body: string; cta: string; secondary: string; hint: string; end: string };
};

export const echo: Record<"pt" | "en" | "es", EchoCopy> = {
  pt: {
    boot: { lines: ["ALIANÇA REBELDE // canal criptografado", "decodificando arquivo: GL-0001", "origem: Base Eco · sistema Hoth", "autorização: Princesa Leia Organa"], granted: "ARQUIVO ABERTO", skip: "Pular transmissão", label: "Transmissão da Aliança" },
    hud: { channel: "CANAL ECO // ALIANÇA", location: "BASE ECO · SISTEMA HOTH", temp: "TEMP", shield: "ESCUDO", hint: "Clique no domo · canhão de íons", touch: "Toque no domo · segure a Leia · toque na neve", ticker: ["MICROSOFT MVP", "OPENAI CODEX AMBASSADOR", "DEVIN AMBASSADOR", "COAUTORA PACKT", "+100 MIL DEVS", "IA GENERATIVA E AGÊNTICA"] },
    transmissions: ["Transmissão I — Base Eco", "Transmissão II — Dossiê rebelde", "Transmissão III — Mapa de operações", "Transmissão IV — Recrutamento"],
    hero: { ion: "Disparar canhão de íons", ionDone: "Disparo de íons confirmado. Rota de fuga liberada.", caption: "Arquivo secreto da Aliança", scroll: "Role para o dossiê" },
    dossier: {
      title: "Dossiê da agente GL-0001.", intro: "Arquivo preservado no gelo de Hoth. Descongele para ler a ficha completa de quem passou mais de uma década levando código, comunidade e IA para mais gente.",
      card: "Agente da Aliança", id: "REBEL-ID · GL-0001 · CLASSE: GENERAL DA COMUNIDADE", imageAlt: "Glaucia Lemos representada como Jedi, em holograma", sheetLabel: "Ficha rebelde",
      sheet: [["Patente", "Principal Software Engineer · AI Transformation Lead"], ["Base atual", "Itaú Unibanco"], ["Especialidade", "IA generativa e agêntica · RAG · Spec-Driven Development"], ["Arsenal", "TypeScript · JavaScript · Node.js · Agentes de IA"]],
      statsLabel: "Registro de campo", stats: ["anos de carreira", "eventos", "países", "devs alcançados", "anos na Microsoft"],
      odds: "Chance de desistir", oddsValue: "3.720 para 1", oddsQuote: "Nunca me diga as probabilidades.", oddsSign: "— H. Solo",
      medalsTitle: "Cerimônia de Yavin", medalsIntro: "Medalhas concedidas pela Aliança. Passe o mouse, foque ou clique para virar.", flip: "Virar medalha",
      medals: [
        { name: "Microsoft MVP", note: "Reconhecimento da Microsoft por contribuição técnica contínua à comunidade." },
        { name: "OpenAI Codex Ambassador", note: "Embaixadora do Codex: agentes de código aplicados ao dia a dia de times reais." },
        { name: "Devin Ambassador", note: "Embaixadora do Devin, o engenheiro de software autônomo da Cognition." },
        { name: "Coautora Packt", note: "Building Agentic AI Apps with Next.js, TypeScript and MCP: coautoria e revisão técnica." },
      ],
      protocols: "Idiomas: Português · English · Español",
    },
    ops: {
      title: "Mapa de operações.", intro: "Cada barra é uma missão. Quando duas correm em paralelo, ganham faixas próprias, como naves em formação. Escolha uma era para dar zoom.",
      filter: "Filtrar por era", all: "Todas as eras", now: "agora", current: "em curso", legend: "Linha do tempo de cargos em faixas paralelas", roles: "missões",
      eras: {
        padawan: { name: "Era Padawan", summary: "Código em produção, consultoria e as primeiras aulas: a base técnica." },
        knight: { name: "Era Cavaleira", summary: "Microsoft: Cloud Advocate e Developer Advocate para JavaScript, TypeScript e IA." },
        master: { name: "Era Mestre", summary: "IA generativa e agêntica em escala: liderança, squads e livro pela Packt." },
      },
    },
    threepio: {
      label: "Falar com o C-3PO",
      lines: [
        "Sou fluente em mais de seis milhões de formas de comunicação. TypeScript é a minha favorita.",
        "Oh, não! Um merge conflict! Estamos condenados!",
        "Não me culpe. Sou um intérprete, não fui feito para revisar pull requests.",
        "O R2 disse que os testes passaram. Eu não confiaria nele.",
        "Deploy na sexta-feira? Senhora, as probabilidades não são nada boas.",
      ],
      armOff: "Oh, céus! Meu braço!", armOn: "Pronto. Como novo.", doomed: "Uma nevasca! Estamos condenados!", maker: "Graças ao Criador! A sonda se foi.", relief: "Base Eco restaurada. Que alívio!",
    },
    eggs: { holoTitle: "Holomensagem recebida", holoBody: "Ajude-me, dev. Você é minha única esperança… de um PR revisado.", holoClose: "Encerrar holomensagem", iKnow: "Eu sei.", iKnowSign: "— H. Solo", tauntaun: "Pelo menos ele não cheira mal… por fora.", probe: "Sonda imperial neutralizada", blizzard: "Alerta: nevasca", iceLabel: "Quebrar o gelo: faltam {n} golpes", iceCount: "Gelo quebrado {n}/{total}", iceDone: "Base Eco degelada!" },
    credits: { title: "A Aliança precisa de você.", body: "O transporte já está aquecendo os motores. Traga o desafio do seu time e a gente traça a rota de fuga: estratégia, engenharia e IA no ritmo de vocês.", cta: "Embarcar na missão", secondary: "Mandar DM no LinkedIn", hint: "Dica da Aliança: a Base Eco esconde segredos. Abra o comlink no canto da tela para caçar todos.", end: "Fim da transmissão // Que a Força esteja com você" },
  },
  en: {
    boot: { lines: ["REBEL ALLIANCE // encrypted channel", "decoding file: GL-0001", "origin: Echo Base · Hoth system", "clearance: Princess Leia Organa"], granted: "FILE UNSEALED", skip: "Skip transmission", label: "Alliance transmission" },
    hud: { channel: "ECHO CHANNEL // ALLIANCE", location: "ECHO BASE · HOTH SYSTEM", temp: "TEMP", shield: "SHIELD", hint: "Click the dome · ion cannon", touch: "Tap the dome · hold Leia · tap the snow", ticker: ["MICROSOFT MVP", "OPENAI CODEX AMBASSADOR", "DEVIN AMBASSADOR", "PACKT CO-AUTHOR", "100K+ DEVS", "GENERATIVE & AGENTIC AI"] },
    transmissions: ["Transmission I — Echo Base", "Transmission II — Rebel dossier", "Transmission III — Operations map", "Transmission IV — Recruitment"],
    hero: { ion: "Fire the ion cannon", ionDone: "Ion blast confirmed. Escape route is clear.", caption: "Secret Alliance archive", scroll: "Scroll to the dossier" },
    dossier: {
      title: "Dossier of agent GL-0001.", intro: "A file preserved in Hoth's ice. Thaw it to read the full record of someone who spent more than a decade bringing code, community and AI to more people.",
      card: "Alliance agent", id: "REBEL-ID · GL-0001 · CLASS: COMMUNITY GENERAL", imageAlt: "Glaucia Lemos portrayed as a Jedi, as a hologram", sheetLabel: "Rebel record",
      sheet: [["Rank", "Principal Software Engineer · AI Transformation Lead"], ["Current base", "Itaú Unibanco"], ["Specialty", "Generative and agentic AI · RAG · Spec-Driven Development"], ["Arsenal", "TypeScript · JavaScript · Node.js · AI agents"]],
      statsLabel: "Field log", stats: ["years of career", "events", "countries", "developers reached", "years at Microsoft"],
      odds: "Odds of giving up", oddsValue: "3,720 to 1", oddsQuote: "Never tell me the odds.", oddsSign: "— H. Solo",
      medalsTitle: "Yavin ceremony", medalsIntro: "Medals awarded by the Alliance. Hover, focus or click to flip them.", flip: "Flip medal",
      medals: [
        { name: "Microsoft MVP", note: "Microsoft's recognition for ongoing technical contribution to the community." },
        { name: "OpenAI Codex Ambassador", note: "Codex ambassador: coding agents applied to the daily work of real teams." },
        { name: "Devin Ambassador", note: "Ambassador for Devin, Cognition's autonomous software engineer." },
        { name: "Packt co-author", note: "Building Agentic AI Apps with Next.js, TypeScript and MCP: co-author and technical reviewer." },
      ],
      protocols: "Languages: Português · English · Español",
    },
    ops: {
      title: "Operations map.", intro: "Each bar is a mission. When two run in parallel they get their own lanes, like ships in formation. Pick an era to zoom in.",
      filter: "Filter by era", all: "All eras", now: "now", current: "ongoing", legend: "Timeline of roles in parallel lanes", roles: "missions",
      eras: {
        padawan: { name: "Padawan Era", summary: "Production code, consulting and the first courses: the technical foundation." },
        knight: { name: "Knight Era", summary: "Microsoft: Cloud Advocate and Developer Advocate for JavaScript, TypeScript and AI." },
        master: { name: "Master Era", summary: "Generative and agentic AI at scale: leadership, squads and a Packt book." },
      },
    },
    threepio: {
      label: "Talk to C-3PO",
      lines: [
        "I am fluent in over six million forms of communication. TypeScript is my favorite.",
        "Oh no! A merge conflict! We're doomed!",
        "Don't blame me. I'm an interpreter, I wasn't built to review pull requests.",
        "R2 says the tests have passed. I wouldn't trust him.",
        "Deploying on a Friday? Madam, the odds are not good at all.",
      ],
      armOff: "Oh, my! My arm!", armOn: "There. Good as new.", doomed: "A blizzard! We're doomed!", maker: "Thank the Maker! The probe is gone.", relief: "Echo Base restored. What a relief!",
    },
    eggs: { holoTitle: "Holomessage received", holoBody: "Help me, dev. You're my only hope… for a reviewed PR.", holoClose: "End holomessage", iKnow: "I know.", iKnowSign: "— H. Solo", tauntaun: "At least it doesn't smell bad… on the outside.", probe: "Imperial probe neutralized", blizzard: "Alert: blizzard", iceLabel: "Break the ice: {n} hits left", iceCount: "Ice broken {n}/{total}", iceDone: "Echo Base thawed!" },
    credits: { title: "The Alliance needs you.", body: "The transport is already warming up its engines. Bring your team's challenge and we'll chart the escape route together: strategy, engineering and AI at your pace.", cta: "Board the mission", secondary: "Send a LinkedIn DM", hint: "Alliance tip: Echo Base hides secrets. Open the comlink in the corner of the screen to hunt them all.", end: "End of transmission // May the Force be with you" },
  },
  es: {
    boot: { lines: ["ALIANZA REBELDE // canal cifrado", "decodificando archivo: GL-0001", "origen: Base Eco · sistema Hoth", "autorización: Princesa Leia Organa"], granted: "ARCHIVO ABIERTO", skip: "Saltar transmisión", label: "Transmisión de la Alianza" },
    hud: { channel: "CANAL ECO // ALIANZA", location: "BASE ECO · SISTEMA HOTH", temp: "TEMP", shield: "ESCUDO", hint: "Clic en la cúpula · cañón de iones", touch: "Toca la cúpula · mantén a Leia · toca la nieve", ticker: ["MICROSOFT MVP", "OPENAI CODEX AMBASSADOR", "DEVIN AMBASSADOR", "COAUTORA EN PACKT", "+100 MIL DEVS", "IA GENERATIVA Y AGÉNTICA"] },
    transmissions: ["Transmisión I — Base Eco", "Transmisión II — Expediente rebelde", "Transmisión III — Mapa de operaciones", "Transmisión IV — Reclutamiento"],
    hero: { ion: "Disparar el cañón de iones", ionDone: "Disparo de iones confirmado. Ruta de escape libre.", caption: "Archivo secreto de la Alianza", scroll: "Desplázate al expediente" },
    dossier: {
      title: "Expediente de la agente GL-0001.", intro: "Un archivo conservado en el hielo de Hoth. Descongélalo para leer el registro completo de quien pasó más de una década acercando código, comunidad e IA a más personas.",
      card: "Agente de la Alianza", id: "REBEL-ID · GL-0001 · CLASE: GENERAL DE LA COMUNIDAD", imageAlt: "Glaucia Lemos representada como Jedi, en holograma", sheetLabel: "Ficha rebelde",
      sheet: [["Rango", "Principal Software Engineer · AI Transformation Lead"], ["Base actual", "Itaú Unibanco"], ["Especialidad", "IA generativa y agéntica · RAG · Spec-Driven Development"], ["Arsenal", "TypeScript · JavaScript · Node.js · Agentes de IA"]],
      statsLabel: "Registro de campo", stats: ["años de carrera", "eventos", "países", "devs alcanzados", "años en Microsoft"],
      odds: "Probabilidad de rendirse", oddsValue: "3.720 a 1", oddsQuote: "Nunca me digas las probabilidades.", oddsSign: "— H. Solo",
      medalsTitle: "Ceremonia de Yavin", medalsIntro: "Medallas otorgadas por la Alianza. Pasa el ratón, enfoca o haz clic para girarlas.", flip: "Girar medalla",
      medals: [
        { name: "Microsoft MVP", note: "Reconocimiento de Microsoft por su contribución técnica continua a la comunidad." },
        { name: "OpenAI Codex Ambassador", note: "Embajadora de Codex: agentes de código aplicados al día a día de equipos reales." },
        { name: "Devin Ambassador", note: "Embajadora de Devin, el ingeniero de software autónomo de Cognition." },
        { name: "Coautora en Packt", note: "Building Agentic AI Apps with Next.js, TypeScript and MCP: coautoría y revisión técnica." },
      ],
      protocols: "Idiomas: Português · English · Español",
    },
    ops: {
      title: "Mapa de operaciones.", intro: "Cada barra es una misión. Cuando dos corren en paralelo tienen carriles propios, como naves en formación. Elige una era para acercarte.",
      filter: "Filtrar por era", all: "Todas las eras", now: "ahora", current: "en curso", legend: "Línea de tiempo de cargos en carriles paralelos", roles: "misiones",
      eras: {
        padawan: { name: "Era Padawan", summary: "Código en producción, consultoría y los primeros cursos: la base técnica." },
        knight: { name: "Era Caballera", summary: "Microsoft: Cloud Advocate y Developer Advocate de JavaScript, TypeScript e IA." },
        master: { name: "Era Maestra", summary: "IA generativa y agéntica a escala: liderazgo, squads y un libro con Packt." },
      },
    },
    threepio: {
      label: "Hablar con C-3PO",
      lines: [
        "Domino más de seis millones de formas de comunicación. TypeScript es mi favorita.",
        "¡Oh, no! ¡Un merge conflict! ¡Estamos perdidos!",
        "No me culpe. Soy un intérprete, no me hicieron para revisar pull requests.",
        "R2 dice que los tests pasaron. Yo no me fiaría de él.",
        "¿Deploy un viernes? Señora, las probabilidades no son nada buenas.",
      ],
      armOff: "¡Oh, cielos! ¡Mi brazo!", armOn: "Listo. Como nuevo.", doomed: "¡Una ventisca! ¡Estamos perdidos!", maker: "¡Gracias al Hacedor! La sonda se fue.", relief: "Base Eco restaurada. ¡Qué alivio!",
    },
    eggs: { holoTitle: "Holomensaje recibido", holoBody: "Ayúdame, dev. Eres mi única esperanza… de un PR revisado.", holoClose: "Cerrar holomensaje", iKnow: "Lo sé.", iKnowSign: "— H. Solo", tauntaun: "Al menos no huele mal… por fuera.", probe: "Sonda imperial neutralizada", blizzard: "Alerta: ventisca", iceLabel: "Romper el hielo: faltan {n} golpes", iceCount: "Hielo roto {n}/{total}", iceDone: "¡Base Eco descongelada!" },
    credits: { title: "La Alianza te necesita.", body: "El transporte ya está calentando motores. Trae el desafío de tu equipo y trazamos juntos la ruta de escape: estrategia, ingeniería e IA a su ritmo.", cta: "Embarcar en la misión", secondary: "Enviar DM en LinkedIn", hint: "Consejo de la Alianza: la Base Eco esconde secretos. Abre el comlink en la esquina de la pantalla para encontrarlos todos.", end: "Fin de la transmisión // Que la Fuerza te acompañe" },
  },
};
