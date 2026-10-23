import type { Locale } from './config';
const pt = {
  journey: 'Ideias que conectam comunidades.',
  journeyBody: 'Do primeiro meetup às conferências internacionais. Explore os lugares e os encontros que fazem parte dessa trajetória.',
  globe: { hint: 'Arraste para explorar · use também as setas do teclado', label: 'Globo interativo de eventos. Use as setas para girar.', pause: 'Pausar rotação', play: 'Girar automaticamente', reset: 'Recentrar', unavailable: 'O globo não está disponível neste navegador. Consulte os países e eventos abaixo.' },
  search: 'Buscar evento, cidade ou país', all: 'Todos os anos', year: 'Ano', empty: 'Nenhum evento encontrado. Tente outro termo ou ano.', results: 'participações', resultSingular: 'participação',
  archive: 'Cada encontro, uma troca.', archiveBody: 'Palestras, workshops e comunidades. Um arquivo vivo de conhecimento compartilhado.',
};
type Copy = { [K in keyof typeof pt]: typeof pt[K] extends string ? string : { [P in keyof typeof pt[K]]: string } };
export const eventsUI: Record<Locale, Copy> = {
  pt,
  en: { journey: 'Ideas that connect communities.', journeyBody: 'From the first meetup to international conferences. Explore the places and gatherings along this journey.', globe: { hint: 'Drag to explore · or use the arrow keys', label: 'Interactive event globe. Use arrow keys to rotate.', pause: 'Pause rotation', play: 'Auto rotate', reset: 'Reset view', unavailable: 'The globe is unavailable in this browser. Browse the countries and events below.' }, search: 'Search event, city or country', all: 'All years', year: 'Year', empty: 'No events found. Try another term or year.', results: 'appearances', resultSingular: 'appearance', archive: 'Every gathering, an exchange.', archiveBody: 'Talks, workshops and communities. A living archive of shared knowledge.' },
  es: { journey: 'Ideas que conectan comunidades.', journeyBody: 'Del primer meetup a las conferencias internacionales. Explora los lugares y encuentros de esta trayectoria.', globe: { hint: 'Arrastra para explorar · o usa las flechas del teclado', label: 'Globo interactivo de eventos. Usa las flechas para girar.', pause: 'Pausar rotación', play: 'Girar automáticamente', reset: 'Centrar', unavailable: 'El globo no está disponible en este navegador. Consulta los países y eventos a continuación.' }, search: 'Buscar evento, ciudad o país', all: 'Todos los años', year: 'Año', empty: 'No se encontraron eventos. Prueba otro término o año.', results: 'participaciones', resultSingular: 'participación', archive: 'Cada encuentro, un intercambio.', archiveBody: 'Charlas, talleres y comunidades. Un archivo vivo de conocimiento compartido.' },
};
