import type { AtlasEvent, Format } from "./atlas-records";
import type { Evento } from "./types";

// The log's filters, kept in the URL (?ano=&formato=&tipo=&idioma=&q=). The same parser serves the server (a GET form,
// so filtering works without JavaScript) and the client. Unknown values fall back to "all".
export type Filters = { year: number | null; format: Format | null; type: Evento["tipo"] | null; language: Evento["idioma"] | null; query: string };
export const NO_FILTERS: Filters = { year: null, format: null, type: null, language: null, query: "" };
export const FORMATS: readonly Format[] = ["presencial", "remoto"];
export const TYPES: readonly Evento["tipo"][] = ["palestra", "workshop", "organizacao"];
export const LANGUAGES: readonly Evento["idioma"][] = ["pt-BR", "en", "es"];
const KEYS = ["ano", "formato", "tipo", "idioma", "q"] as const;

type Input = string | URLSearchParams | Record<string, string | string[] | undefined>;
const toParams = (input: Input) => {
  if (typeof input === "string" || input instanceof URLSearchParams) return new URLSearchParams(input);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) { const first = Array.isArray(value) ? value[0] : value; if (first !== undefined) params.set(key, first); }
  return params;
};
const pick = <T extends string>(value: string | null, allowed: readonly T[]) => value && (allowed as readonly string[]).includes(value) ? value as T : null;

export function parseFilters(input: Input, years: readonly number[]): Filters {
  const params = toParams(input);
  const year = Number(params.get("ano"));
  return {
    year: years.includes(year) ? year : null,
    format: pick(params.get("formato"), FORMATS),
    type: pick(params.get("tipo"), TYPES),
    language: pick(params.get("idioma"), LANGUAGES),
    query: (params.get("q") ?? "").trim().slice(0, 80),
  };
}

// Writes only what differs from the defaults and keeps every unrelated parameter.
export function serializeFilters(filters: Filters, search = "") {
  const params = new URLSearchParams(search);
  for (const key of KEYS) params.delete(key);
  if (filters.year) params.set("ano", String(filters.year));
  if (filters.format) params.set("formato", filters.format);
  if (filters.type) params.set("tipo", filters.type);
  if (filters.language) params.set("idioma", filters.language);
  if (filters.query.trim()) params.set("q", filters.query.trim());
  const text = params.toString();
  return text ? `?${text}` : "";
}

export const isFiltered = (filters: Filters) => Boolean(filters.year || filters.format || filters.type || filters.language || filters.query.trim());

const fold = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function filterEvents<T extends AtlasEvent>(events: readonly T[], filters: Filters): T[] {
  const terms = fold(filters.query).split(/\s+/).filter(Boolean);
  return events.filter((event) =>
    (!filters.year || event.ano === filters.year)
    && (!filters.format || event.formato === filters.format)
    && (!filters.type || event.tipo === filters.type)
    && (!filters.language || event.idioma === filters.language)
    && terms.every((term) => fold(`${event.nome} ${event.cidade} ${event.pais ?? ""}`).includes(term)));
}
