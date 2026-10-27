import type { Locale } from './config';

// Copy for Aurélia's scroll story: orbits, proof, blooming garden, how we work, the beacon finale and the epilogue transmission.
// Every number shown next to this copy is computed from the site's own data (see aurelia-records.ts); nothing here is a claim.
type Pair = { title: string; body: string };
export type AureliaStoryCopy = {
  chapters: { proof: string; steps: string; finale: string };
  orbit: { label: string; scroll: string; rings: [Pair, Pair, Pair]; aligned: string; hud: { title: string; calibrating: string; locked: string; drag: string; tap: string; headline: string } };
  proof: { title: string; intro: string; source: string; labels: { events: string; cities: string; countries: string; articles: string; years: string; stars: string }; links: { events: string; articles: string; years: string; stars: string } };
  bloom: { label: string; scroll: string; count: string; cta: string; compare: string };
  steps: { title: string; intro: string; items: [Pair, Pair, Pair] };
  finale: { kicker: string; title: string; body: string; cta: string; continued: string; offMap: string };
  transmission: { kicker: string; title: string; body: string; locked: string; progress: string; found: string; silent: string; hint: string; worlds: Record<'home' | 'about' | 'projects' | 'content' | 'events', string> };
};

export const aureliaStory: Record<Locale, AureliaStoryCopy> = {
  pt: {
    chapters: { proof: 'Constelação de provas', steps: 'Como cultivamos', finale: 'Último sinal' },
    orbit: {
      label: 'Três órbitas, um jardim', scroll: 'Role para alinhar as órbitas',
      rings: [
        { title: 'Engenharia', body: 'Código, arquitetura e entrega. A IA entra no ciclo de desenvolvimento, não ao lado dele.' },
        { title: 'Liderança', body: 'Decisões, cultura e pessoas. Times que adotam IA com critério, segurança e propósito.' },
        { title: 'IA aplicada', body: 'Agentes, ferramentas e prática. Do experimento curioso ao fluxo de trabalho do dia a dia.' },
      ],
      aligned: 'Órbitas alinhadas: estratégia, engenharia e IA no mesmo ponto.',
      hud: { title: 'GIROSCÓPIO ORBITAL', calibrating: 'CALIBRANDO', locked: 'TRAVADOS {n}/3', drag: 'Arraste cada anel até a marca no alto.', tap: 'Toque nos anéis para girá-los até a marca no alto.', headline: 'ÓRBITAS ALINHADAS' },
    },
    proof: {
      title: 'Uma trajetória que dá para conferir.', intro: 'Cada estrela abaixo vem dos registros deste site. Clique para ver a origem.',
      source: 'Fonte',
      labels: { events: 'eventos e palestras', cities: 'cidades visitadas', countries: 'países com presença', articles: 'artigos publicados', years: 'anos de trajetória', stars: 'estrelas no GitHub' },
      links: { events: 'Ver no Atlas', articles: 'Ver na biblioteca', years: 'Ver a trajetória', stars: 'Ver os projetos' },
    },
    bloom: { label: 'O jardim floresce', scroll: 'Role para florescer', count: 'Canteiro {n} de {total}', cta: 'Quero este para o meu time', compare: 'Compare os canteiros' },
    steps: {
      title: 'Do primeiro sinal à prática.', intro: 'Cada colaboração começa com o contexto do seu time e termina em prática.',
      items: [
        { title: 'Conversa', body: 'Entendo o contexto do seu time: objetivos, momento com IA e o que precisa mudar.' },
        { title: 'Proposta', body: 'Desenho o formato sob medida (workshop, mentoria ou palestra), com escopo e agenda.' },
        { title: 'Prática', body: 'Ao vivo, com código e exemplos reais, conectando o conteúdo à rotina do time.' },
      ],
    },
    finale: {
      kicker: 'Último sinal', title: 'Seu time pode ser a próxima constelação.', body: 'O sinalizador está aceso. Falta a sua mensagem.',
      cta: 'Vamos conversar',
      continued: 'Continua…', offMap: 'Uma estrela fora do mapa',
    },
    transmission: {
      kicker: 'Transmissão desconhecida', title: 'Existe algo além da última órbita.',
      body: 'Cada mundo desta galáxia guarda segredos. Quem os encontra recebe um sinal.',
      locked: 'Sinal fraco. Descubra segredos em mais {n} mundos para recebê-lo.', progress: '{n} de 3 mundos', found: 'sinal captado', silent: 'em silêncio',
      hint: 'Clique nos personagens, explore a cena, digite palavras pelo caminho. O rádio estelar no topo ajuda.',
      worlds: { home: 'Observatório', about: 'Nivéora', projects: 'Marte', content: 'Lúmina', events: 'Atlas' },
    },
  },
  en: {
    chapters: { proof: 'Constellation of proof', steps: 'How we grow it', finale: 'Last signal' },
    orbit: {
      label: 'Three orbits, one garden', scroll: 'Scroll to align the orbits',
      rings: [
        { title: 'Engineering', body: 'Code, architecture and delivery. AI joins the development cycle, not the sidelines.' },
        { title: 'Leadership', body: 'Decisions, culture and people. Teams that adopt AI with judgment, safety and purpose.' },
        { title: 'Applied AI', body: 'Agents, tools and practice. From a curious experiment to everyday workflow.' },
      ],
      aligned: 'Orbits aligned: strategy, engineering and AI at the same point.',
      hud: { title: 'ORBITAL GYROSCOPE', calibrating: 'CALIBRATING', locked: 'LOCKED {n}/3', drag: 'Drag each ring to the mark at the top.', tap: 'Tap the rings to turn them to the mark at the top.', headline: 'ORBITS ALIGNED' },
    },
    proof: {
      title: 'A track record you can check.', intro: 'Every star below comes from this site’s records. Click to see the source.',
      source: 'Source',
      labels: { events: 'events and talks', cities: 'cities visited', countries: 'countries in person', articles: 'published articles', years: 'years of career', stars: 'GitHub stars' },
      links: { events: 'See the Atlas', articles: 'See the library', years: 'See the journey', stars: 'See the projects' },
    },
    bloom: { label: 'The garden blooms', scroll: 'Scroll to bloom', count: 'Garden bed {n} of {total}', cta: 'I want this for my team', compare: 'Compare the garden beds' },
    steps: {
      title: 'From the first signal to practice.', intro: 'Every collaboration starts with your team’s context and ends in practice.',
      items: [
        { title: 'Conversation', body: 'I learn your team’s context: goals, where you are with AI and what needs to change.' },
        { title: 'Proposal', body: 'I design a tailored format (workshop, mentoring or talk) with scope and agenda.' },
        { title: 'Practice', body: 'Live, with code and real examples, connecting the content to your team’s routine.' },
      ],
    },
    finale: {
      kicker: 'Last signal', title: 'Your team could be the next constellation.', body: 'The beacon is lit. All it needs is your message.',
      cta: "Let's talk",
      continued: 'To be continued…', offMap: 'A star beyond the map',
    },
    transmission: {
      kicker: 'Unknown transmission', title: 'There is something beyond the last orbit.',
      body: 'Every world in this galaxy keeps secrets. Those who find them receive a signal.',
      locked: 'Faint signal. Discover secrets in {n} more worlds to receive it.', progress: '{n} of 3 worlds', found: 'signal received', silent: 'silent',
      hint: 'Click the characters, explore the scene, type words along the way. The star radio at the top helps.',
      worlds: { home: 'Observatory', about: 'Nivéora', projects: 'Mars', content: 'Lúmina', events: 'Atlas' },
    },
  },
  es: {
    chapters: { proof: 'Constelación de pruebas', steps: 'Cómo cultivamos', finale: 'Última señal' },
    orbit: {
      label: 'Tres órbitas, un jardín', scroll: 'Desplázate para alinear las órbitas',
      rings: [
        { title: 'Ingeniería', body: 'Código, arquitectura y entrega. La IA entra en el ciclo de desarrollo, no al margen.' },
        { title: 'Liderazgo', body: 'Decisiones, cultura y personas. Equipos que adoptan IA con criterio, seguridad y propósito.' },
        { title: 'IA aplicada', body: 'Agentes, herramientas y práctica. Del experimento curioso al flujo de trabajo diario.' },
      ],
      aligned: 'Órbitas alineadas: estrategia, ingeniería e IA en el mismo punto.',
      hud: { title: 'GIROSCOPIO ORBITAL', calibrating: 'CALIBRANDO', locked: 'FIJADOS {n}/3', drag: 'Arrastra cada anillo hasta la marca de arriba.', tap: 'Toca los anillos para girarlos hasta la marca de arriba.', headline: 'ÓRBITAS ALINEADAS' },
    },
    proof: {
      title: 'Una trayectoria que puedes comprobar.', intro: 'Cada estrella viene de los registros de este sitio. Haz clic para ver el origen.',
      source: 'Fuente',
      labels: { events: 'eventos y charlas', cities: 'ciudades visitadas', countries: 'países en persona', articles: 'artículos publicados', years: 'años de trayectoria', stars: 'estrellas en GitHub' },
      links: { events: 'Ver el Atlas', articles: 'Ver la biblioteca', years: 'Ver la trayectoria', stars: 'Ver los proyectos' },
    },
    bloom: { label: 'El jardín florece', scroll: 'Desplázate para florecer', count: 'Jardín {n} de {total}', cta: 'Lo quiero para mi equipo', compare: 'Compara los jardines' },
    steps: {
      title: 'De la primera señal a la práctica.', intro: 'Cada colaboración empieza con el contexto de tu equipo y termina en práctica.',
      items: [
        { title: 'Conversación', body: 'Entiendo el contexto de tu equipo: objetivos, momento con la IA y lo que necesita cambiar.' },
        { title: 'Propuesta', body: 'Diseño el formato a medida (taller, mentoría o charla), con alcance y agenda.' },
        { title: 'Práctica', body: 'En vivo, con código y ejemplos reales, conectando el contenido con la rutina del equipo.' },
      ],
    },
    finale: {
      kicker: 'Última señal', title: 'Tu equipo puede ser la próxima constelación.', body: 'La baliza está encendida. Solo falta tu mensaje.',
      cta: 'Hablemos',
      continued: 'Continuará…', offMap: 'Una estrella fuera del mapa',
    },
    transmission: {
      kicker: 'Transmisión desconocida', title: 'Hay algo más allá de la última órbita.',
      body: 'Cada mundo de esta galaxia guarda secretos. Quien los encuentra recibe una señal.',
      locked: 'Señal débil. Descubre secretos en {n} mundos más para recibirla.', progress: '{n} de 3 mundos', found: 'señal captada', silent: 'en silencio',
      hint: 'Haz clic en los personajes, explora la escena, escribe palabras por el camino. La radio estelar de arriba ayuda.',
      worlds: { home: 'Observatorio', about: 'Nivéora', projects: 'Marte', content: 'Lúmina', events: 'Atlas' },
    },
  },
};
