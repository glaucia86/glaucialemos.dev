import { commercial } from "./commercial";
import type { Locale } from './config';

export type AureliaCopy = {
  boot: { lines: [string,string,string]; granted: string; skip: string; label: string; brand: string };
  chapters: [string,string,string,string];
  hero: { world: string; title: string; intro: string; extra: string; caption: string; scroll: string; jump: string; alt: string };
  hud: { channel: string; location: string; hint: string; touch: string; glaucia: string; prince: string; garden: string; beacon: string };
  discoveries: string;
  readout: { bloom: string; relay: string; close: string; next: string; contact: string };
  rings: { title: string; intro: string; label: string; position: string; aligned: string; reset: string; link: string };
  garden: { title: string; intro: string; seed: string; seedNote: string; open: string; swarm: string; swarmHint: string; progress: string; completed: string; reset: string; contact: string };
  contact: { title: string; intro: string; relay: string; ready: string; cinema: string; portal: { close: string; sending: string; delivered: string; failed: string } };
  dusk: { title: string; label: string; day: string; night: string; body: string; restore: string };
};
export const aurelia: Record<Locale, AureliaCopy> = {
  pt: {
    boot: { lines: ['ENTRANDO EM ÓRBITA DE AURÉLIA', 'JARDINS SUSPENSOS // LUZ ESTÁVEL', 'CANAL DE COLABORAÇÃO DISPONÍVEL'], granted: 'BEM-VINDA A AURÉLIA', skip: 'Pular', label: 'Abertura dos jardins', brand: '// AURÉLIA' },
    chapters: ['Jardins Suspensos', 'Órbitas em sintonia', 'Canteiros de possibilidades', 'Canal de colaboração'],
    hero: { world: 'Aurélia', title: 'Os Jardins Suspensos', intro: commercial.pt.intro, extra: 'Engenharia, liderança e IA. Um espaço para conectar conhecimento ao seu próximo desafio.', caption: 'Conhecimento cultivado em conjunto', scroll: 'Explore os jardins', jump: 'ENTRE OS JARDINS', alt: 'Estação orbital com jardins luminosos e um planeta de anéis, com Glaucia e Prince no terraço à direita' },
    hud: { channel: 'AURÉLIA // COLABORAÇÃO', location: 'ÓRBITA DOS JARDINS', hint: 'Uma luz aguarda resposta', touch: 'Toque nas luzes do jardim', glaucia: 'Glaucia — despertar o jardim', prince: 'Prince — acionar o sinalizador', garden: 'Explorar a estufa luminosa', beacon: 'Abrir o canal de colaboração' },
    discoveries: 'Descobertas em Aurélia · {n}/{total}',
    readout: { bloom: 'Uma possibilidade floresceu', relay: 'Sinal recebido. O canal está aberto.', close: 'Fechar descoberta', next: 'Outra possibilidade', contact: 'Conversar sobre este serviço' },
    rings: { title: 'Encontre uma órbita em comum.', intro: 'Três anéis, um ponto de encontro. Gire cada anel até alinhar os sinais no alto.', label: 'Girar anel {n}', position: 'Posição {n} de 4', aligned: 'Sinais alinhados. Vamos conectar estratégia, engenharia e IA à sua realidade.', reset: 'Desalinhar anéis', link: 'Conheça minha trajetória' },
    garden: { title: 'Da curiosidade à prática com IA.', intro: commercial.pt.formatsIntro, seed: 'Cofre de sementes', seedNote: 'Uma possibilidade guardada para o próximo passo.', open: 'Abrir o cofre', swarm: 'Prince, solte os vaga-lumes', swarmHint: 'Guie o enxame com o cursor, o dedo ou o Tab até cada canteiro. Ele poliniza o que sobrevoa.', progress: '{n} de {total} canteiros conectados', completed: 'O jardim está conectado. Escolha por onde começar a conversa.', reset: 'Recomeçar conexões', contact: 'Conversar sobre este serviço' },
    contact: { title: 'Vamos construir o próximo passo?', intro: 'Traga o desafio do seu time. Vamos conectar estratégia, engenharia e IA à sua realidade.', relay: 'Acionar sinalizador do Prince', ready: 'Canal de colaboração aberto. Conte um pouco sobre o desafio.', cinema: 'Um canal aberto. Sua mensagem é a próxima semente.', portal: { close: 'Fechar o canal', sending: 'O sinal está subindo do jardim…', delivered: 'Sinal entregue às estrelas', failed: 'O sinal falhou. Sua mensagem continua aqui.' } },
    dusk: { title: 'Eclipse sobre os jardins', label: 'Segure o planeta para o eclipse', day: 'Dia', night: 'Eclipse total: o jardim acendeu a própria luz.', body: 'Quando o planeta cobre o sol, Aurélia mostra a luz que guarda. Às vezes é no escuro que um time descobre o que já sabe fazer.', restore: 'Trazer o sol de volta' },
  },
  en: {
    boot: { lines: ['ENTERING AURELIA ORBIT', 'HANGING GARDENS // LIGHT STABLE', 'COLLABORATION CHANNEL AVAILABLE'], granted: 'WELCOME TO AURELIA', skip: 'Skip', label: 'Garden opening', brand: '// AURELIA' },
    chapters: ['Hanging Gardens', 'Orbits in harmony', 'Beds of possibility', 'Collaboration channel'],
    hero: { world: 'Aurelia', title: 'The Hanging Gardens', intro: commercial.en.intro, extra: 'Engineering, leadership and AI. A space to connect knowledge to your next challenge.', caption: 'Knowledge cultivated together', scroll: 'Explore the gardens', jump: 'THROUGH THE GARDENS', alt: 'Orbital station with luminous gardens and a ringed planet, with Glaucia and Prince on the terrace to the right' },
    hud: { channel: 'AURELIA // COLLABORATION', location: 'GARDEN ORBIT', hint: 'A light awaits an answer', touch: 'Touch the garden lights', glaucia: 'Glaucia — awaken the garden', prince: 'Prince — activate the beacon', garden: 'Explore the luminous greenhouse', beacon: 'Open the collaboration channel' },
    discoveries: 'Discoveries in Aurelia · {n}/{total}',
    readout: { bloom: 'A possibility has bloomed', relay: 'Signal received. The channel is open.', close: 'Close discovery', next: 'Another possibility', contact: 'Discuss this service' },
    rings: { title: 'Find an orbit in common.', intro: 'Three rings, one meeting point. Turn each ring until the signals align at the top.', label: 'Turn ring {n}', position: 'Position {n} of 4', aligned: 'Signals aligned. Connect strategy, engineering and AI to your reality.', reset: 'Misalign rings', link: 'Explore my journey' },
    garden: { title: 'From AI curiosity to practice.', intro: commercial.en.formatsIntro, seed: 'Seed vault', seedNote: 'A possibility kept for the next step.', open: 'Open the vault', swarm: 'Prince, release the fireflies', swarmHint: 'Guide the swarm with the cursor, your finger or Tab to each garden bed. It pollinates what it flies over.', progress: '{n} of {total} garden beds connected', completed: 'The garden is connected. Choose where to start the conversation.', reset: 'Restart connections', contact: 'Discuss this service' },
    contact: { title: 'Let us build what comes next.', intro: 'Bring your team challenge. Connect strategy, engineering and AI to your reality.', relay: "Activate Prince's beacon", ready: 'Collaboration channel open. Tell me about your challenge.', cinema: 'An open channel. Your message is the next seed.', portal: { close: 'Close the channel', sending: 'The signal is rising from the garden…', delivered: 'Signal delivered to the stars', failed: 'The signal faltered. Your message is still here.' } },
    dusk: { title: 'Eclipse over the gardens', label: 'Hold the planet for the eclipse', day: 'Day', night: 'Total eclipse: the garden lit its own light.', body: 'When the planet covers the sun, Aurélia shows the light it keeps. Sometimes a team finds what it can already do in the dark.', restore: 'Bring the sun back' },
  },
  es: {
    boot: { lines: ['ENTRANDO EN ÓRBITA DE AURELIA', 'JARDINES COLGANTES // LUZ ESTABLE', 'CANAL DE COLABORACIÓN DISPONIBLE'], granted: 'BIENVENIDA A AURELIA', skip: 'Saltar', label: 'Apertura de los jardines', brand: '// AURELIA' },
    chapters: ['Jardines Colgantes', 'Órbitas en sintonía', 'Jardines de posibilidades', 'Canal de colaboración'],
    hero: { world: 'Aurelia', title: 'Los Jardines Colgantes', intro: commercial.es.intro, extra: 'Ingeniería, liderazgo e IA. Un espacio para conectar conocimiento con tu próximo desafío.', caption: 'Conocimiento cultivado en conjunto', scroll: 'Explora los jardines', jump: 'ENTRE LOS JARDINES', alt: 'Estación orbital con jardines luminosos y un planeta con anillos, con Glaucia y Prince en la terraza a la derecha' },
    hud: { channel: 'AURELIA // COLABORACIÓN', location: 'ÓRBITA DE LOS JARDINES', hint: 'Una luz espera respuesta', touch: 'Toca las luces del jardín', glaucia: 'Glaucia — despertar el jardín', prince: 'Prince — activar la baliza', garden: 'Explorar el invernadero luminoso', beacon: 'Abrir el canal de colaboración' },
    discoveries: 'Descubrimientos en Aurelia · {n}/{total}',
    readout: { bloom: 'Una posibilidad ha florecido', relay: 'Señal recibida. El canal está abierto.', close: 'Cerrar descubrimiento', next: 'Otra posibilidad', contact: 'Conversar sobre este servicio' },
    rings: { title: 'Encuentra una órbita en común.', intro: 'Tres anillos, un punto de encuentro. Gira cada anillo hasta alinear las señales arriba.', label: 'Girar anillo {n}', position: 'Posición {n} de 4', aligned: 'Señales alineadas. Conectemos estrategia, ingeniería e IA con tu realidad.', reset: 'Desalinear anillos', link: 'Conoce mi trayectoria' },
    garden: { title: 'De la curiosidad a la práctica con IA.', intro: commercial.es.formatsIntro, seed: 'Bóveda de semillas', seedNote: 'Una posibilidad guardada para el próximo paso.', open: 'Abrir la bóveda', swarm: 'Prince, suelta las luciérnagas', swarmHint: 'Guía el enjambre con el cursor, el dedo o Tab hasta cada jardín. Poliniza lo que sobrevuela.', progress: '{n} de {total} jardines conectados', completed: 'El jardín está conectado. Elige por dónde empezar la conversación.', reset: 'Reiniciar conexiones', contact: 'Conversar sobre este servicio' },
    contact: { title: '¿Construimos el próximo paso?', intro: 'Trae el desafío de tu equipo. Conectemos estrategia, ingeniería e IA con tu realidad.', relay: 'Activar la baliza de Prince', ready: 'Canal de colaboración abierto. Cuéntame sobre tu desafío.', cinema: 'Un canal abierto. Tu mensaje es la próxima semilla.', portal: { close: 'Cerrar el canal', sending: 'La señal sube desde el jardín…', delivered: 'Señal entregada a las estrellas', failed: 'La señal falló. Tu mensaje sigue aquí.' } },
    dusk: { title: 'Eclipse sobre los jardines', label: 'Mantén el planeta para el eclipse', day: 'Día', night: 'Eclipse total: el jardín encendió su propia luz.', body: 'Cuando el planeta cubre el sol, Aurélia muestra la luz que guarda. A veces un equipo descubre en la oscuridad lo que ya sabe hacer.', restore: 'Traer el sol de vuelta' },
  },
};
