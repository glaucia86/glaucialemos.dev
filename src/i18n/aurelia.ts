import type { Locale } from './config';

export type AureliaCopy = {
  boot: { lines: [string,string,string]; granted: string; skip: string; label: string; brand: string };
  chapters: [string,string,string,string];
  hero: { world: string; title: string; intro: string; extra: string; caption: string; scroll: string; jump: string; alt: string };
  hud: { channel: string; location: string; hint: string; touch: string; glaucia: string; prince: string; garden: string; beacon: string };
  discoveries: string;
  readout: { bloom: string; relay: string; close: string; next: string; contact: string };
  rings: { title: string; intro: string; label: string; position: string; aligned: string; reset: string; link: string };
  garden: { title: string; intro: string; seed: string; seedNote: string; open: string; connect: string; progress: string; completed: string; order: string; reset: string; contact: string };
  contact: { title: string; intro: string; relay: string; ready: string };
  dusk: { title: string; label: string; day: string; night: string; body: string; restore: string };
};
export const aurelia: Record<Locale, AureliaCopy> = {
  pt: {
    boot: { lines: ['ENTRANDO EM ÓRBITA DE AURÉLIA', 'JARDINS SUSPENSOS // LUZ ESTÁVEL', 'CANAL DE COLABORAÇÃO DISPONÍVEL'], granted: 'BEM-VINDA A AURÉLIA', skip: 'Pular', label: 'Abertura dos jardins', brand: '// AURÉLIA' },
    chapters: ['Jardins Suspensos', 'Órbitas em sintonia', 'Canteiros de possibilidades', 'Canal de colaboração'],
    hero: { world: 'Aurélia', title: 'Os Jardins Suspensos', intro: 'Workshops e mentorias adaptados ao contexto do seu time, da estratégia à prática.', extra: 'Engenharia, liderança e IA. Um espaço para conectar conhecimento ao seu próximo desafio.', caption: 'Conhecimento cultivado em conjunto', scroll: 'Explore os jardins', jump: 'ENTRE OS JARDINS', alt: 'Estação orbital com jardins luminosos e um planeta de anéis, com Glaucia e Prince no terraço à direita' },
    hud: { channel: 'AURÉLIA // COLABORAÇÃO', location: 'ÓRBITA DOS JARDINS', hint: 'Uma luz aguarda resposta', touch: 'Toque nas luzes do jardim', glaucia: 'Glaucia — despertar o jardim', prince: 'Prince — acionar o sinalizador', garden: 'Explorar a estufa luminosa', beacon: 'Abrir o canal de colaboração' },
    discoveries: 'Descobertas em Aurélia · {n}/{total}',
    readout: { bloom: 'Uma possibilidade floresceu', relay: 'Sinal recebido. O canal está aberto.', close: 'Fechar descoberta', next: 'Outra possibilidade', contact: 'Conversar sobre este serviço' },
    rings: { title: 'Encontre uma órbita em comum.', intro: 'Três anéis, um ponto de encontro. Gire cada anel até alinhar os sinais no alto.', label: 'Girar anel {n}', position: 'Posição {n} de 4', aligned: 'Sinais alinhados. Vamos conectar estratégia, engenharia e IA à sua realidade.', reset: 'Desalinhar anéis', link: 'Conheça minha trajetória' },
    garden: { title: 'Da curiosidade à prática com IA.', intro: 'Workshops para times e mentorias para lideranças. Palestras que conectam tecnologia a decisões reais.', seed: 'Cofre de sementes', seedNote: 'Uma possibilidade guardada para o próximo passo.', open: 'Abrir o cofre', connect: 'Conectar canteiro {n}', progress: '{n} de {total} canteiros conectados', completed: 'O jardim está conectado. Escolha por onde começar a conversa.', order: 'Acenda os canteiros na ordem dos números. Cada conexão leva luz ao próximo.', reset: 'Recomeçar conexões', contact: 'Conversar sobre este serviço' },
    contact: { title: 'Vamos construir o próximo passo?', intro: 'Traga o desafio do seu time. Vamos conectar estratégia, engenharia e IA à sua realidade.', relay: 'Acionar sinalizador do Prince', ready: 'Canal de colaboração aberto. Conte um pouco sobre o desafio.' },
    dusk: { title: 'A estufa depois do pôr do sol', label: 'Luz dos jardins', day: 'Dia', night: 'Entardecer', body: 'Quando o jardim silencia, uma pergunta permanece: qual é o próximo desafio do seu time?', restore: 'Trazer a luz de volta' },
  },
  en: {
    boot: { lines: ['ENTERING AURELIA ORBIT', 'HANGING GARDENS // LIGHT STABLE', 'COLLABORATION CHANNEL AVAILABLE'], granted: 'WELCOME TO AURELIA', skip: 'Skip', label: 'Garden opening', brand: '// AURELIA' },
    chapters: ['Hanging Gardens', 'Orbits in harmony', 'Beds of possibility', 'Collaboration channel'],
    hero: { world: 'Aurelia', title: 'The Hanging Gardens', intro: "Workshops and mentoring tailored to your team's context, from strategy to hands-on practice.", extra: 'Engineering, leadership and AI. A space to connect knowledge to your next challenge.', caption: 'Knowledge cultivated together', scroll: 'Explore the gardens', jump: 'THROUGH THE GARDENS', alt: 'Orbital station with luminous gardens and a ringed planet, with Glaucia and Prince on the terrace to the right' },
    hud: { channel: 'AURELIA // COLLABORATION', location: 'GARDEN ORBIT', hint: 'A light awaits an answer', touch: 'Touch the garden lights', glaucia: 'Glaucia — awaken the garden', prince: 'Prince — activate the beacon', garden: 'Explore the luminous greenhouse', beacon: 'Open the collaboration channel' },
    discoveries: 'Discoveries in Aurelia · {n}/{total}',
    readout: { bloom: 'A possibility has bloomed', relay: 'Signal received. The channel is open.', close: 'Close discovery', next: 'Another possibility', contact: 'Discuss this service' },
    rings: { title: 'Find an orbit in common.', intro: 'Three rings, one meeting point. Turn each ring until the signals align at the top.', label: 'Turn ring {n}', position: 'Position {n} of 4', aligned: 'Signals aligned. Connect strategy, engineering and AI to your reality.', reset: 'Misalign rings', link: 'Explore my journey' },
    garden: { title: 'From AI curiosity to practice.', intro: 'Team workshops and leadership mentoring. Talks connecting technology to real decisions.', seed: 'Seed vault', seedNote: 'A possibility kept for the next step.', open: 'Open the vault', connect: 'Connect garden bed {n}', progress: '{n} of {total} garden beds connected', completed: 'The garden is connected. Choose where to start the conversation.', order: 'Light the beds in numerical order. Each connection carries light to the next.', reset: 'Restart connections', contact: 'Discuss this service' },
    contact: { title: 'Let us build what comes next.', intro: 'Bring your team challenge. Connect strategy, engineering and AI to your reality.', relay: "Activate Prince's beacon", ready: 'Collaboration channel open. Tell me about your challenge.' },
    dusk: { title: 'The greenhouse after sunset', label: 'Garden light', day: 'Day', night: 'Dusk', body: 'When the garden falls quiet, one question remains: what is your team’s next challenge?', restore: 'Bring the light back' },
  },
  es: {
    boot: { lines: ['ENTRANDO EN ÓRBITA DE AURELIA', 'JARDINES COLGANTES // LUZ ESTABLE', 'CANAL DE COLABORACIÓN DISPONIBLE'], granted: 'BIENVENIDA A AURELIA', skip: 'Saltar', label: 'Apertura de los jardines', brand: '// AURELIA' },
    chapters: ['Jardines Colgantes', 'Órbitas en sintonía', 'Jardines de posibilidades', 'Canal de colaboración'],
    hero: { world: 'Aurelia', title: 'Los Jardines Colgantes', intro: 'Talleres y mentorías adaptados a tu equipo, de la estrategia a la práctica.', extra: 'Ingeniería, liderazgo e IA. Un espacio para conectar conocimiento con tu próximo desafío.', caption: 'Conocimiento cultivado en conjunto', scroll: 'Explora los jardines', jump: 'ENTRE LOS JARDINES', alt: 'Estación orbital con jardines luminosos y un planeta con anillos, con Glaucia y Prince en la terraza a la derecha' },
    hud: { channel: 'AURELIA // COLABORACIÓN', location: 'ÓRBITA DE LOS JARDINES', hint: 'Una luz espera respuesta', touch: 'Toca las luces del jardín', glaucia: 'Glaucia — despertar el jardín', prince: 'Prince — activar la baliza', garden: 'Explorar el invernadero luminoso', beacon: 'Abrir el canal de colaboración' },
    discoveries: 'Descubrimientos en Aurelia · {n}/{total}',
    readout: { bloom: 'Una posibilidad ha florecido', relay: 'Señal recibida. El canal está abierto.', close: 'Cerrar descubrimiento', next: 'Otra posibilidad', contact: 'Conversar sobre este servicio' },
    rings: { title: 'Encuentra una órbita en común.', intro: 'Tres anillos, un punto de encuentro. Gira cada anillo hasta alinear las señales arriba.', label: 'Girar anillo {n}', position: 'Posición {n} de 4', aligned: 'Señales alineadas. Conectemos estrategia, ingeniería e IA con tu realidad.', reset: 'Desalinear anillos', link: 'Conoce mi trayectoria' },
    garden: { title: 'De la curiosidad a la práctica con IA.', intro: 'Talleres para equipos y mentorías para líderes. Charlas que conectan tecnología con decisiones reales.', seed: 'Bóveda de semillas', seedNote: 'Una posibilidad guardada para el próximo paso.', open: 'Abrir la bóveda', connect: 'Conectar jardín {n}', progress: '{n} de {total} jardines conectados', completed: 'El jardín está conectado. Elige por dónde empezar la conversación.', order: 'Enciende los jardines en orden numérico. Cada conexión lleva luz al siguiente.', reset: 'Reiniciar conexiones', contact: 'Conversar sobre este servicio' },
    contact: { title: '¿Construimos el próximo paso?', intro: 'Trae el desafío de tu equipo. Conectemos estrategia, ingeniería e IA con tu realidad.', relay: 'Activar la baliza de Prince', ready: 'Canal de colaboración abierto. Cuéntame sobre tu desafío.' },
    dusk: { title: 'El invernadero al caer el sol', label: 'Luz de los jardines', day: 'Día', night: 'Atardecer', body: 'Cuando el jardín calla, queda una pregunta: ¿cuál es el próximo desafío de tu equipo?', restore: 'Devolver la luz' },
  },
};
