import type { Locale } from './config';
import type { Subject } from '@/lib/aurelia-records';

type CommercialCopy = {
  menu: string; cta: string; ctaNote: string; nudgeTitle: string; nudgeBody: string; nudgeClose: string; headline: string; intro: string; primary: string; formatsLink: string;
  formatsTitle: string; formatsIntro: string; audience: string; focus: string;
  discuss: string; experience: string; galleryTitle: string; galleryIntro: string;
  video: { watch: string; label: string; note: string };
  source: string; mentoringAudience: string; metadataDescription: string;
  topicsTitle: string; topicsIntro: string; topicsCta: string; venues: string;
  testimonials: { title: string; intro: string; invite: string };
};

export const commercial: Record<Locale, CommercialCopy> = {
  pt: {
    menu: 'Workshops e mentorias', cta: 'Pedir uma proposta para o meu time', ctaNote: 'Respondo em até 2 dias úteis · sem compromisso', nudgeTitle: 'Chegou até aqui? Vamos marcar um papo.', nudgeBody: 'Conte o desafio do seu time em poucas linhas. Eu respondo pessoalmente.', nudgeClose: 'Agora não', headline: 'Palestras, workshops e mentorias',
    intro: 'Ajudo profissionais e equipes a aplicar IA no desenvolvimento de software, com código, estratégia e contexto.',
    primary: 'Vamos conversar', formatsLink: 'Conheça os formatos',
    formatsTitle: 'Três formatos para aplicar IA à engenharia.',
    formatsIntro: 'Escolha como começar: uma palestra, um workshop ou uma mentoria. O ponto de partida é o seu contexto.',
    audience: 'Para quem', focus: 'Foco', discuss: 'Conversar sobre', experience: 'Experiência profissional',
    galleryTitle: 'Conhecimento compartilhado, em pessoa.',
    galleryIntro: 'Registros da minha trajetória compartilhando conhecimento.', source: 'Fonte da imagem',
    video: { watch: 'Assistir à palestra', label: 'Palestra completa', note: 'O vídeo do YouTube só carrega quando você clica.' },
    mentoringAudience: 'Pessoas e empresas: profissionais seniores, lideranças e equipes de engenharia.',
    metadataDescription: 'Palestras, workshops e mentorias sobre IA aplicada à engenharia de software. Para pessoas e empresas, com código, estratégia e contexto.',
    topicsTitle: 'Temas de palestra que eu domino', topicsIntro: 'Assuntos que já levei a eventos e empresas. Cada um pode virar palestra, workshop prático ou mentoria para o seu time.', topicsCta: 'Convidar para uma palestra', venues: 'Onde já palestrei',
    testimonials: { title: 'O que dizem sobre o meu trabalho', intro: 'Depoimentos de quem participou de palestras, workshops e mentorias, publicados com autorização.', invite: 'Participou de uma palestra, workshop ou mentoria? Deixe seu depoimento.' },
  },
  en: {
    menu: 'Workshops & mentoring', cta: 'Request a proposal for my team', ctaNote: 'I reply within 2 business days · no commitment', nudgeTitle: 'Made it this far? Let’s have a chat.', nudgeBody: 'Tell me about your team’s challenge in a few lines. I reply personally.', nudgeClose: 'Not now', headline: 'Talks, workshops and mentoring',
    intro: 'I help professionals and teams apply AI in software development, with code, strategy and context.',
    primary: 'Let’s talk', formatsLink: 'Explore the formats',
    formatsTitle: 'Three ways to apply AI to engineering.',
    formatsIntro: 'Choose where to begin: a talk, a workshop or mentoring. Your context is the starting point.',
    audience: 'Who it’s for', focus: 'Focus', discuss: 'Let’s discuss', experience: 'Professional experience',
    galleryTitle: 'Sharing knowledge, in person.',
    video: { watch: 'Watch the talk', label: 'Full talk', note: 'The YouTube video only loads when you click. Talk in Portuguese.' },
    galleryIntro: 'Photos from my journey sharing knowledge.', source: 'Image source',
    mentoringAudience: 'Individuals and companies: senior professionals, leaders and engineering teams.',
    metadataDescription: 'Talks, workshops and mentoring on AI applied to software engineering. For individuals and companies, with code, strategy and context.',
    topicsTitle: 'Talk topics I master', topicsIntro: 'Subjects I have already brought to events and companies. Each one can become a talk, a hands-on workshop or mentoring for your team.', topicsCta: 'Invite me to speak', venues: 'Where I have spoken',
    testimonials: { title: 'What people say about my work', intro: 'Testimonials from people who attended talks, workshops and mentoring, published with permission.', invite: 'Attended a talk, workshop or mentoring session? Leave a testimonial.' },
  },
  es: {
    menu: 'Talleres y mentorías', cta: 'Pedir una propuesta para mi equipo', ctaNote: 'Respondo en hasta 2 días hábiles · sin compromiso', nudgeTitle: '¿Llegaste hasta aquí? Conversemos.', nudgeBody: 'Cuéntame el desafío de tu equipo en pocas líneas. Respondo personalmente.', nudgeClose: 'Ahora no', headline: 'Charlas, talleres y mentorías',
    intro: 'Ayudo a profesionales y equipos a aplicar IA en el desarrollo de software, con código, estrategia y contexto.',
    primary: 'Conversemos', formatsLink: 'Conoce los formatos',
    formatsTitle: 'Tres formatos para aplicar IA a la ingeniería.',
    formatsIntro: 'Elige cómo empezar: una charla, un taller o una mentoría. El punto de partida es tu contexto.',
    audience: 'Para quién', focus: 'Enfoque', discuss: 'Conversemos sobre', experience: 'Experiencia profesional',
    galleryTitle: 'Conocimiento compartido, en persona.',
    video: { watch: 'Ver la charla', label: 'Charla completa', note: 'El video de YouTube solo se carga cuando haces clic. Charla en portugués.' },
    galleryIntro: 'Fotos de mi trayectoria compartiendo conocimiento.', source: 'Fuente de la imagen',
    mentoringAudience: 'Personas y empresas: profesionales sénior, líderes y equipos de ingeniería.',
    metadataDescription: 'Charlas, talleres y mentorías sobre IA aplicada a la ingeniería de software. Para personas y empresas, con código, estrategia y contexto.',
    topicsTitle: 'Temas de charla que domino', topicsIntro: 'Temas que ya llevé a eventos y empresas. Cada uno puede convertirse en charla, taller práctico o mentoría para tu equipo.', topicsCta: 'Invitarme a una charla', venues: 'Dónde he dado charlas',
    testimonials: { title: 'Lo que dicen de mi trabajo', intro: 'Testimonios de quienes participaron en charlas, talleres y mentorías, publicados con autorización.', invite: '¿Participaste en una charla, taller o mentoría? Deja tu testimonio.' },
  },
};

type OfferCopy = { title: string; audience: string; focus: string; description: string; cta: string };
type Offer = { subject: Subject; serviceId: string; copy: Record<Locale, OfferCopy> };

// Same order and visual weight in both pages; IDs match the existing service catalogue.
export const offers: readonly Offer[] = [
  { subject: 'palestra', serviceId: 'palestras', copy: {
    pt: { title: 'Palestras', audience: 'Eventos, comunidades e empresas.', focus: 'IA aplicada à engenharia e decisões técnicas.', description: 'Apresentações com exemplos de código sobre IA, JavaScript e TypeScript, conectando conceitos ao trabalho de desenvolvimento de software.', cta: 'Conversar sobre uma palestra' },
    en: { title: 'Talks', audience: 'Events, communities and companies.', focus: 'AI applied to engineering and technical decisions.', description: 'Talks with code examples on AI, JavaScript and TypeScript, connecting concepts to everyday software development.', cta: 'Discuss a talk' },
    es: { title: 'Charlas', audience: 'Eventos, comunidades y empresas.', focus: 'IA aplicada a la ingeniería y decisiones técnicas.', description: 'Presentaciones con ejemplos de código sobre IA, JavaScript y TypeScript, conectando conceptos con el trabajo de desarrollo de software.', cta: 'Conversar sobre una charla' },
  } },
  { subject: 'workshop', serviceId: 'workshop-sdlc-agentes-ia', copy: {
    pt: { title: 'Workshops', audience: 'Equipes de engenharia e empresas.', focus: 'Agentes de IA no ciclo de produto e de desenvolvimento (PDLC/SDLC).', description: 'Encontros práticos ao vivo para integrar agentes de IA ao PDLC/SDLC do time, do requisito à produção. Funciona com qualquer linguagem de programação: o foco é o processo, o contexto do time e a qualidade do que chega em produção.', cta: 'Conversar sobre um workshop' },
    en: { title: 'Workshops', audience: 'Engineering teams and companies.', focus: 'AI agents in the product and software development lifecycle (PDLC/SDLC).', description: 'Live, hands-on sessions to bring AI agents into your team’s PDLC/SDLC, from requirement to production. It works with any programming language: the focus is the process, the team’s context and the quality of what reaches production.', cta: 'Discuss a workshop' },
    es: { title: 'Talleres', audience: 'Equipos de ingeniería y empresas.', focus: 'Agentes de IA en el ciclo de producto y de desarrollo (PDLC/SDLC).', description: 'Encuentros prácticos en vivo para integrar agentes de IA en el PDLC/SDLC del equipo, del requisito a producción. Funciona con cualquier lenguaje de programación: el foco es el proceso, el contexto del equipo y la calidad de lo que llega a producción.', cta: 'Conversar sobre un taller' },
  } },
  { subject: 'mentoria', serviceId: 'mentoria-consultoria-lideranca-tecnica', copy: {
    pt: { title: 'Mentorias', audience: commercial.pt.mentoringAudience, focus: 'Estratégia técnica, liderança e adoção responsável de IA.', description: 'Acompanhamento personalizado para discutir desafios de engenharia, decisões de carreira e adoção de IA, considerando a realidade de cada pessoa ou empresa.', cta: 'Conversar sobre uma mentoria' },
    en: { title: 'Mentoring', audience: commercial.en.mentoringAudience, focus: 'Technical strategy, leadership and responsible AI adoption.', description: 'Personalized guidance on engineering challenges, career decisions and AI adoption, considering each individual’s or company’s context.', cta: 'Discuss mentoring' },
    es: { title: 'Mentorías', audience: commercial.es.mentoringAudience, focus: 'Estrategia técnica, liderazgo y adopción responsable de IA.', description: 'Acompañamiento personalizado para discutir desafíos de ingeniería, decisiones de carrera y adopción de IA, considerando la realidad de cada persona o empresa.', cta: 'Conversar sobre una mentoría' },
  } },
];

type TopicCopy = { title: string; detail: string };
// Topics taken from the real talk history in eventos.json (2023–2026), approved by Glaucia on 2026-10-28.
export const speakingTopics: readonly { id: string; copy: Record<Locale, TopicCopy> }[] = [
  { id: 'sdd', copy: {
    pt: { title: 'Spec-Driven Development e Harness Engineering para agentes de código', detail: 'Como escrever especificações que guiam agentes de IA e manter o controle do que eles entregam.' },
    en: { title: 'Spec-Driven Development and Harness Engineering for coding agents', detail: 'How to write specs that guide AI agents and stay in control of what they deliver.' },
    es: { title: 'Spec-Driven Development y Harness Engineering para agentes de código', detail: 'Cómo escribir especificaciones que guían a los agentes de IA y mantener el control de lo que entregan.' },
  } },
  { id: 'agents-sdlc', copy: {
    pt: { title: 'Agentes de IA no ciclo de produto e desenvolvimento (PDLC/SDLC)', detail: 'Codex, GitHub Copilot e outros agentes do requisito à produção, com revisão e qualidade, em qualquer linguagem de programação.' },
    en: { title: 'AI agents across the product and development lifecycle (PDLC/SDLC)', detail: 'Codex, GitHub Copilot and other agents from requirement to production, with review and quality, in any programming language.' },
    es: { title: 'Agentes de IA en el ciclo de producto y desarrollo (PDLC/SDLC)', detail: 'Codex, GitHub Copilot y otros agentes del requisito a producción, con revisión y calidad, en cualquier lenguaje de programación.' },
  } },
  { id: 'mcp', copy: {
    pt: { title: 'Servidores MCP com TypeScript', detail: 'Como conectar modelos de IA às ferramentas e dados da empresa.' },
    en: { title: 'MCP servers with TypeScript', detail: 'How to connect AI models to a company’s tools and data.' },
    es: { title: 'Servidores MCP con TypeScript', detail: 'Cómo conectar modelos de IA con las herramientas y los datos de la empresa.' },
  } },
  { id: 'rag', copy: {
    pt: { title: 'RAG e IA generativa com JavaScript', detail: 'Assistentes que respondem com base nos documentos certos, com LangChain.js.' },
    en: { title: 'RAG and generative AI with JavaScript', detail: 'Assistants that answer from the right documents, with LangChain.js.' },
    es: { title: 'RAG e IA generativa con JavaScript', detail: 'Asistentes que responden a partir de los documentos correctos, con LangChain.js.' },
  } },
  { id: 'career', copy: {
    pt: { title: 'Carreira e mulheres em tecnologia', detail: 'Trajetória, comunidade e crescimento profissional na área de tecnologia.' },
    en: { title: 'Careers and women in tech', detail: 'Career paths, community and professional growth in technology.' },
    es: { title: 'Carrera y mujeres en tecnología', detail: 'Trayectoria, comunidad y crecimiento profesional en tecnología.' },
  } },
];
