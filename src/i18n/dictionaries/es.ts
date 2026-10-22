import type { Dictionary } from "./pt";
import pt from "./pt";
const es: Dictionary = {
  ...pt,
  metadata: { title: "Glaucia Lemos — IA para quienes crean", description: "Ingeniería, liderazgo y adopción responsable de IA en software." }, nav: { home: "Inicio", about: "Sobre mí", projects: "Proyectos", content: "Contenido", events: "Eventos", services: "Servicios", language: "Idioma" }, motion: { reduce: "Reducir animaciones", enable: "Activar animaciones" }, common: { source: "Fuente", stars: "estrellas", language: "Lenguaje", all: "Todos", unavailable: "No informado" },
  accessibility: { skip: "Saltar al contenido", primaryNav: "Navegación principal", highlights: "Cifras destacadas" },
  home: { ...pt.home, eyebrow: "Ingeniería • Liderazgo • IA", value: "Enseño a ingenieros y líderes a adoptar IA en el ciclo de desarrollo — con práctica, estrategia y responsabilidad.", primaryCta: "Contrata un taller o mentoría", secondaryCta: "Ver eventos", stats: ["eventos","países","idiomas","estrellas en proyectos principales"], servicesEyebrow: "Cómo puedo ayudar", servicesTitle: "De la curiosidad a la práctica con IA", servicesBody: "Talleres, mentoría y charlas que conectan tecnología con decisiones reales.", crawlOpening: "Hace mucho tiempo, en una comunidad no tan lejana…", crawlSkip: "Saltar introducción", crawlTitle: "Una historia en construcción", crawl: ["De desarrolladora a educadora global, Glaucia construyó su camino compartiendo conocimiento.","Como Microsoft MVP y ex Cloud Advocate, acercó comunidades a JavaScript, TypeScript, nube e IA.","Hoy ayuda a convertir la adopción de IA en una capacidad de ingeniería, no solo en una herramienta."], heroImageAlt: "Maestro Yoda en los pantanos de Dagobah", aboutTitle: "Sobre mí", aboutImageAlt: "Glaucia Lemos representada como Jedi con túnica marrón y sable de luz azul" },
  about: { ...pt.about,
    bio: [
      [
        "Desarrolladora, educadora y líder técnica brasileña, Glaucia trabaja en la intersección entre la ingeniería de software, las comunidades y la inteligencia artificial.",
      ],
      [
        "Actualmente es Principal Software Engineer y AI Transformation Lead en Itaú Unibanco, donde ayuda a los equipos de ingeniería a llevar la IA generativa de experimentos aislados a entregas seguras, gobernadas y a escala, con arquitectura agéntica, RAG, context engineering y Spec-Driven Development.",
      ],
      [
        "Es ",
        { text: "Microsoft MVP", href: "https://mvp.microsoft.com/pt-BR/MVP/profile/d3200941-395d-423b-a0ec-eb0577d3bb86" },
        ", ",
        { text: "OpenAI Codex Ambassador", href: "https://developers.openai.com/community/codex-ambassadors/directory?site_locale=en&ambassador=glaucia-lemos" },
        " y ",
        { text: "Devin Ambassador", href: "https://devin.ai/community" },
        ". Como ex Cloud Advocate, pasó más de seis años en Microsoft haciendo que JavaScript, TypeScript, la nube y la IA fueran más accesibles para comunidades globales. Durante ese período, llegó a más de 100 mil desarrolladores con charlas y talleres en portugués, español e inglés, además de más de 100 vídeos y 30 artículos técnicos. Creó Microblog AI, contribuyó al currículo Generative AI for Beginners y lideró la modernización de Contoso Real Estate.",
      ],
      [
        "Es coautora y revisora técnica del libro ",
        { text: "Building Agentic AI Apps with Next.js, TypeScript and MCP", italic: true },
        " (Packt). Fuera del código, ha sido mentora de muchas mujeres en tecnología y sigue defendiendo una comunidad tech más diversa e inclusiva.",
      ],
    ],
    primaryCta: "Conoce mi trayectoria", secondaryCta: "LinkedIn", metadata: { title: "Sobre mí — Glaucia Lemos", description: "Trayectoria profesional y trabajo comunitario." }, eyebrow: "El viaje", title: "La tecnología cobra sentido cuando circula el conocimiento.", intro: "Desarrolladora, educadora y líder técnica brasileña en la intersección entre software, comunidades e IA.", mvp: "Microsoft MVP y ex Cloud Advocate, dedicó años a hacer JavaScript, TypeScript, nube e IA más accesibles.", timeline: "Trayectoria profesional", heroImageAlt: "Princesa Leia en el paisaje helado de Hoth" },
  projects: { ...pt.projects, primaryCta: "Ver en GitHub", secondaryCta: "Ver proyectos", metadata: { title: "Proyectos — Glaucia Lemos", description: "Proyectos open source y sus estrellas actuales." }, eyebrow: "Código abierto", title: "Proyectos que enseñan construyendo", intro: "Repositorios sobre TypeScript, JavaScript, IA y web. Las estrellas se actualizan desde GitHub cuando está disponible.", heroImageAlt: "R2-D2 entre las dunas claras de Tatooine" },
  content: { ...pt.content, primaryCta: "Leer artículos", secondaryCta: "Ver en YouTube", metadata: { title: "Contenido — Glaucia Lemos", description: "Artículos y recursos técnicos." }, eyebrow: "Biblioteca", title: "Contenido para aprender haciendo", intro: "Artículos en portugués, inglés y español en distintas plataformas.", filter: "Filtrar por plataforma", heroImageAlt: "Chewbacca en un bosque de Kashyyyk" },
  events: { ...pt.events, primaryCta: "Invítame a dar una charla", secondaryCta: "Ver eventos", metadata: { title: "Eventos — Glaucia Lemos", description: "Historia de charlas, talleres y organización." }, eyebrow: "Alrededor del mundo", title: "Conocimiento sin fronteras", intro: "Una trayectoria de encuentros con comunidades, presencialmente y en línea.", labels: ["eventos","países","idiomas"], languageBreakdown: "Por idioma", typeBreakdown: "Por formato", history: "Historia por año", note: "Datos de 2017–2023; nuevos eventos próximamente.", audienceNote: "El público no se suma: las estimaciones pueden superponerse.", heroImageAlt: "Grogu en el paisaje volcánico de Nevarro", types: { palestra: "Charlas", workshop: "Talleres", organizacao: "Organización" } },
  services: { ...pt.services, talkMessage: "Me gustaría invitarte a dar una charla.", metadata: { title: "Servicios — Glaucia Lemos", description: "Talleres, mentoría y charlas sobre IA e ingeniería." }, eyebrow: "Trabaja conmigo", title: "IA aplicada al trabajo real", intro: "Formatos adaptados a tu equipo, de la estrategia a la práctica.", price: "precio a consultar", formTitle: "Cuéntame sobre tu desafío", name: "Nombre", message: "Mensaje", send: "Enviar mensaje", sending: "Enviando…", success: "Mensaje enviado. ¡Gracias!", error: "No fue posible enviar. Inténtalo de nuevo.", missing: "El formulario aún no está configurado. Puedes contactar por LinkedIn.", linkedin: "Enviar DM en LinkedIn", heroImageAlt: "Darth Vader ante las nubes de Bespin", speech: "Únete a mí" },
  footer: { socialLabels: { youtube: "YouTube de Glaucia Lemos", x: "X de Glaucia Lemos", linkedin: "LinkedIn de Glaucia Lemos", instagram: "Instagram de Glaucia Lemos" }, tagline: "Construyendo puentes entre personas, software e IA.", rights: "Todos los derechos reservados." }, notFound: { title: "Esta no es la página que estás buscando", body: "La ruta se perdió en una galaxia lejana.", back: "Volver al inicio", heroImageAlt: "Stormtrooper en un corredor de la Estrella de la Muerte" }, easterEgg: { message: "Que la Fuerza te acompañe", close: "Cerrar" }
};
export default es;
