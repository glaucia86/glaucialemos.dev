import type { Locale } from './config';
import type { RouteKey } from '@/lib/red-tide-routes';

export type RedTideCopy = {
  world: string; code: string; title: string; body: string; back: string; others: string; touch: string; close: string;
  routes: Record<RouteKey, string>;
  hud: { lost: string; route: string; restored: string };
  hot: { glaucia: string; prince: string; console: string };
  signal: { title: string; nearest: string; go: string; none: string };
  rescue: { title: string; body: string; portal: string };
  episode: { kicker: string; watch: string; title: string; close: string; note: string; tracks: Record<Locale, string> };
};

export const redTide: Record<Locale, RedTideCopy> = {
  pt: {
    world: 'Maré Rubra', code: '404', title: 'Coordenadas perdidas',
    body: 'Esta rota foi engolida pelo vórtice da Maré Rubra. A página que você procura não existe ou mudou de órbita.',
    back: 'Voltar para a base', others: 'Ou escolha outro mundo', touch: 'Toque na Glaucia, no Prince ou no console', close: 'Fechar',
    routes: { home: 'Observatório (início)', about: 'Nivéora (sobre)', projects: 'Marte (projetos)', content: 'Lúmina (conteúdo)', events: 'Atlas (eventos)', services: 'Aurélia (workshops e mentorias)' },
    hud: { lost: 'SINAL PERDIDO // 404', route: 'ROTA SOLICITADA', restored: 'NAVEGAÇÃO RESTAURADA' },
    hot: { glaucia: 'Glaucia — recalibrar a navegação', prince: 'Prince — farejar o sinal perdido', console: 'Ligar o console de navegação' },
    signal: { title: 'Sinal recuperado', nearest: 'Rota real mais próxima do endereço digitado:', go: 'Seguir para {name}', none: 'Nenhuma rota parecida. A base é o caminho mais seguro.' },
    rescue: { title: 'Prince encontrou o sinal', body: 'O sinalizador perdido voltou e o portal de navegação se abriu.', portal: 'Atravessar o portal para a base' },
    episode: { kicker: 'Episódio 404', watch: 'Assistir: Coordenadas Perdidas', title: 'Episódio — Coordenadas Perdidas', close: 'Fechar episódio', note: 'Com som e legendas. Narração em português.', tracks: { pt: 'Português', en: 'English', es: 'Español' } },
  },
  en: {
    world: 'Red Tide', code: '404', title: 'Lost coordinates',
    body: 'This route was swallowed by the Red Tide vortex. The page you are looking for does not exist or changed orbit.',
    back: 'Back to base', others: 'Or choose another world', touch: 'Tap Glaucia, Prince or the console', close: 'Close',
    routes: { home: 'Observatory (home)', about: 'Nivéora (about)', projects: 'Mars (projects)', content: 'Lúmina (content)', events: 'Atlas (events)', services: 'Aurélia (workshops and mentoring)' },
    hud: { lost: 'SIGNAL LOST // 404', route: 'REQUESTED ROUTE', restored: 'NAVIGATION RESTORED' },
    hot: { glaucia: 'Glaucia — recalibrate navigation', prince: 'Prince — sniff out the lost signal', console: 'Power up the navigation console' },
    signal: { title: 'Signal recovered', nearest: 'Closest real route to the address you typed:', go: 'Go to {name}', none: 'No similar route. Base is the safest way.' },
    rescue: { title: 'Prince found the signal', body: 'The lost beacon is back and the navigation portal has opened.', portal: 'Cross the portal to base' },
    episode: { kicker: 'Episode 404', watch: 'Watch: Lost Coordinates', title: 'Episode — Lost Coordinates', close: 'Close episode', note: 'With sound and captions. Narration in Portuguese.', tracks: { pt: 'Português', en: 'English', es: 'Español' } },
  },
  es: {
    world: 'Marea Roja', code: '404', title: 'Coordenadas perdidas',
    body: 'Esta ruta fue tragada por el vórtice de la Marea Roja. La página que buscas no existe o cambió de órbita.',
    back: 'Volver a la base', others: 'O elige otro mundo', touch: 'Toca a Glaucia, a Prince o la consola', close: 'Cerrar',
    routes: { home: 'Observatorio (inicio)', about: 'Nivéora (sobre mí)', projects: 'Marte (proyectos)', content: 'Lúmina (contenido)', events: 'Atlas (eventos)', services: 'Aurélia (talleres y mentorías)' },
    hud: { lost: 'SEÑAL PERDIDA // 404', route: 'RUTA SOLICITADA', restored: 'NAVEGACIÓN RESTAURADA' },
    hot: { glaucia: 'Glaucia — recalibrar la navegación', prince: 'Prince — olfatear la señal perdida', console: 'Encender la consola de navegación' },
    signal: { title: 'Señal recuperada', nearest: 'Ruta real más cercana a la dirección escrita:', go: 'Ir a {name}', none: 'Ninguna ruta parecida. La base es el camino más seguro.' },
    rescue: { title: 'Prince encontró la señal', body: 'La baliza perdida volvió y el portal de navegación se abrió.', portal: 'Cruzar el portal hacia la base' },
    episode: { kicker: 'Episodio 404', watch: 'Ver: Coordenadas Perdidas', title: 'Episodio — Coordenadas Perdidas', close: 'Cerrar episodio', note: 'Con sonido y subtítulos. Narración en portugués.', tracks: { pt: 'Português', en: 'English', es: 'Español' } },
  },
};
