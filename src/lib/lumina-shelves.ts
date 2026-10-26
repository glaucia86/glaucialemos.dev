import type { Artigo } from "./types";

// The shelves' filters, kept in the URL (?plataforma=&idioma=&ano=&q=&ordem=). Unknown values fall back to "all".
export type Language = Artigo["idioma"];
export type ShelfSort = "recent" | "oldest";
export type Filters = { platform: string | null; language: Language | null; year: number | null; query: string; sort: ShelfSort };
export const NO_FILTERS: Filters = { platform: null, language: null, year: null, query: "", sort: "recent" };
const LANGUAGES: readonly Language[] = ["pt-BR", "en", "es"];

export function parseFilters(search: string, valid: { platforms: readonly string[]; years: readonly number[] }): Filters {
  const params = new URLSearchParams(search);
  const platform = params.get("plataforma"); const language = params.get("idioma"); const year = Number(params.get("ano"));
  return {
    platform: platform && valid.platforms.includes(platform) ? platform : null,
    language: language && (LANGUAGES as readonly string[]).includes(language) ? language as Language : null,
    year: valid.years.includes(year) ? year : null,
    query: (params.get("q") ?? "").slice(0, 80),
    sort: params.get("ordem") === "antigos" ? "oldest" : "recent",
  };
}

// Writes only what differs from the defaults and keeps every unrelated parameter.
export function serializeFilters(filters: Filters, search = "") {
  const params = new URLSearchParams(search);
  for (const key of ["plataforma", "idioma", "ano", "q", "ordem"]) params.delete(key);
  if (filters.platform) params.set("plataforma", filters.platform);
  if (filters.language) params.set("idioma", filters.language);
  if (filters.year) params.set("ano", String(filters.year));
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.sort === "oldest") params.set("ordem", "antigos");
  const text = params.toString();
  return text ? `?${text}` : "";
}

const fold = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function shelve(articles: readonly Artigo[], filters: Filters) {
  const terms = fold(filters.query).split(/\s+/).filter(Boolean);
  const shown = articles.filter((article) =>
    (!filters.platform || article.plataforma === filters.platform)
    && (!filters.language || article.idioma === filters.language)
    && (!filters.year || article.data.startsWith(String(filters.year)))
    && terms.every((term) => fold(`${article.titulo} ${article.plataforma}`).includes(term)));
  const order = filters.sort === "oldest" ? 1 : -1;
  return shown.sort((a, b) => order * (a.data.localeCompare(b.data) || a.titulo.localeCompare(b.titulo)));
}
