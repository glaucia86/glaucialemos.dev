// Maré Rubra recovers the lost coordinates: the real route of this site closest to what was typed.
// Only routes that exist; the epilogue (noindex, a secret) is never suggested.
export type RouteKey = 'home' | 'about' | 'projects' | 'content' | 'events' | 'services';
export const ROUTES: Record<RouteKey, string> = { home: '', about: '/sobre', projects: '/projetos', content: '/conteudo', events: '/eventos', services: '/servicos' };
// Words people guess in other languages (or old habits) that clearly mean one of the routes.
const ALIASES: Record<string, RouteKey> = {
  inicio: 'home', home: 'home', index: 'home',
  about: 'about', sobre: 'about', bio: 'about', perfil: 'about', trajetoria: 'about',
  projects: 'projects', projetos: 'projects', proyectos: 'projects', repos: 'projects', github: 'projects',
  content: 'content', conteudo: 'content', contenido: 'content', blog: 'content', artigos: 'content', articles: 'content', articulos: 'content', videos: 'content',
  events: 'events', eventos: 'events', palestras: 'events', talks: 'events', charlas: 'events',
  services: 'services', servicos: 'services', servicios: 'services', contato: 'services', contact: 'services', contacto: 'services', mentoria: 'services', workshop: 'services',
};

export function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** The closest real route for a lost pathname ("/pt/servicoss" → services), or null when nothing is near enough. */
export function nearestRoute(pathname: string): RouteKey | null {
  const parts = pathname.split(/[/?#]/).filter(Boolean);
  const words = (/^(pt|en|es)$/.test(parts[0] ?? '') ? parts.slice(1) : parts).map(normalize).filter(Boolean);
  if (!words.length) return 'home';
  for (const word of words) if (ALIASES[word]) return ALIASES[word];
  let best: { key: RouteKey; score: number } | null = null;
  for (const word of words) for (const [alias, key] of Object.entries(ALIASES)) {
    const score = distance(word, alias) / Math.max(word.length, alias.length);
    if (!best || score < best.score) best = { key, score };
  }
  return best && best.score <= .4 ? best.key : null;
}
