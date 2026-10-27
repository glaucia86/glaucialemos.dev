import { getEventCountries, getEventos } from "./data";
import type { Evento } from "./types";

// Atlas das Conexões. The factual rule lives here: a remote event ("Online", never with coordinates) is a signal, not a
// place. Only in-person events light a city; remote ones never become a visited country.
export type Format = "presencial" | "remoto";
export type AtlasEvent = Evento & { id: string; formato: Format; order: number };
export type City = { cidade: string; pais: string | null; lat: number; lon: number; first: number; count: number; events: string[] };

export const REMOTE_CITY = "Online";
export const formatOf = (event: Pick<Evento, "cidade">): Format => event.cidade === REMOTE_CITY ? "remoto" : "presencial";

const slug = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

// The dataset lists the newest first and has no dates inside a year: `order` is chronological by year, then by the
// record's position (the oldest record first). Ids are stable anchors for the log cards.
export function atlasEvents(events: readonly Evento[] = getEventos()): AtlasEvent[] {
  const seen = new Map<string, number>();
  const order = new Map(events.map((_, index) => index).sort((a, b) => events[a].ano - events[b].ano || b - a).map((index, rank) => [index, rank]));
  return events.map((event, index) => {
    const base = `${event.ano}-${slug(event.nome)}`;
    const n = (seen.get(base) ?? 0) + 1; seen.set(base, n);
    return { ...event, id: n > 1 ? `${base}-${n}` : base, formato: formatOf(event), order: order.get(index)! };
  });
}

const chronological = (events: readonly AtlasEvent[]) => [...events].sort((a, b) => a.order - b.order);

export function cities(events: readonly AtlasEvent[] = atlasEvents()): City[] {
  const map = new Map<string, City>();
  for (const event of chronological(events)) {
    if (event.formato !== "presencial" || event.lat === null || event.lon === null) continue;
    const key = `${event.cidade}|${event.pais}`;
    const city = map.get(key) ?? { cidade: event.cidade, pais: event.pais, lat: event.lat, lon: event.lon, first: event.ano, count: 0, events: [] };
    city.count++; city.events.push(event.id);
    map.set(key, city);
  }
  return [...map.values()];
}

const countryOk = (pais: string | null): pais is string => pais !== null && pais !== "Global";

// Countries with an in-person event, and those represented only by remote participation.
export function countriesSplit(events: readonly AtlasEvent[] = atlasEvents()) {
  const present = new Set(events.filter((event) => event.formato === "presencial").map((event) => event.pais).filter(countryOk));
  const remote = new Set(events.filter((event) => event.formato === "remoto").map((event) => event.pais).filter(countryOk));
  const sort = (values: Iterable<string>) => [...values].sort((a, b) => a.localeCompare(b, "pt-BR"));
  return { present: sort(present), remoteOnly: sort([...remote].filter((pais) => !present.has(pais))) };
}

export function presenceStats(events: readonly AtlasEvent[] = atlasEvents()) {
  const presencial = events.filter((event) => event.formato === "presencial").length;
  return {
    eventos: events.length,
    presenciais: presencial,
    remotos: events.length - presencial,
    cidades: cities(events).length,
    paisesPresenca: countriesSplit(events).present.length,
    paisesRepresentados: getEventCountries().length,
    idiomas: new Set(events.map((event) => event.idioma)).size,
  };
}

// Every year from the first to the last record, with in-person and remote counts (zero years included).
export function byYear(events: readonly AtlasEvent[] = atlasEvents()) {
  const years = events.map((event) => event.ano);
  const out: { year: number; presencial: number; remoto: number }[] = [];
  for (let year = Math.min(...years); year <= Math.max(...years); year++) {
    const own = events.filter((event) => event.ano === year);
    out.push({ year, presencial: own.filter((event) => event.formato === "presencial").length, remoto: own.filter((event) => event.formato === "remoto").length });
  }
  return out;
}

// orbital-trail: one full turn of the globe closes the orbit of a year, newest first, then cycles.
export const orbitYears = (events: readonly AtlasEvent[] = atlasEvents()) => [...new Set(events.map((event) => event.ano))].sort((a, b) => b - a);
export function orbitOf(year: number, events: readonly AtlasEvent[] = atlasEvents()) {
  const own = chronological(events.filter((event) => event.ano === year));
  return { year, cities: cities(own), presencial: own.filter((event) => event.formato === "presencial"), remoto: own.filter((event) => event.formato === "remoto") };
}

// constellation-route: the in-person cities in order of their first presence. Lines of a constellation, not travel routes.
export const constellationOrder = (events: readonly AtlasEvent[] = atlasEvents()) => cities(events);

// dog-navigation: every event, once each, in a fixed shuffled order (same on server and client).
export function visorQueue(events: readonly AtlasEvent[] = atlasEvents(), seed = 2017) {
  let state = seed;
  const next = () => (state = (state * 16807) % 2147483647) / 2147483647;
  const ids = chronological(events).map((event) => event.id);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  return ids;
}

// cobe orientation that faces a coordinate (same convention as the globe's phi/theta).
export function anglesOf(lat: number, lon: number): [phi: number, theta: number] {
  return [Math.PI - (lon * Math.PI / 180 - Math.PI / 2), lat * Math.PI / 180];
}
