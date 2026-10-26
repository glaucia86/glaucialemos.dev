import { getArtigos } from "./data";
import type { Artigo } from "./types";

// Lúmina, the living library: every record comes from artigos.json. Curated lists are explicit URLs, checked here,
// so a renamed or removed article fails the build instead of showing an invented record.
const ARTICLES = getArtigos();
const byUrl = new Map(ARTICLES.map((article) => [article.url, article]));
export function record(url: string): Artigo {
  const article = byUrl.get(url);
  if (!article) throw new Error(`Missing Lúmina article: ${url}`);
  return article;
}

const chronological = (articles: readonly Artigo[]) => [...articles].sort((a, b) => a.data.localeCompare(b.data) || a.url.localeCompare(b.url));
export const oldestArticle = (articles: readonly Artigo[] = ARTICLES) => chronological(articles)[0];
export const newestArticle = (articles: readonly Artigo[] = ARTICLES) => chronological(articles).at(-1)!;
export const yearOf = (article: Pick<Artigo, "data">) => Number(article.data.slice(0, 4));

const tally = <K extends string | number>(articles: readonly Artigo[], key: (article: Artigo) => K) => {
  const counts = new Map<K, number>();
  for (const article of articles) counts.set(key(article), (counts.get(key(article)) ?? 0) + 1);
  return counts;
};

// The crystal rings: one column per year, from the first record to the latest (empty years included).
export function articlesByYear(articles: readonly Artigo[] = ARTICLES) {
  const counts = tally(articles, yearOf);
  const first = yearOf(oldestArticle(articles)); const last = yearOf(newestArticle(articles));
  return Array.from({ length: last - first + 1 }, (_, index) => ({ year: first + index, count: counts.get(first + index) ?? 0 }));
}
// Platforms by size, then name.
export const platformCounts = (articles: readonly Artigo[] = ARTICLES) =>
  [...tally(articles, (article) => article.plataforma)].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count }));
export const languageCounts = (articles: readonly Artigo[] = ARTICLES) =>
  (["pt-BR", "en", "es"] as const).map((language) => ({ language, count: articles.filter((article) => article.idioma === language).length }));

export function libraryStats(articles: readonly Artigo[] = ARTICLES) {
  const first = oldestArticle(articles); const last = newestArticle(articles);
  return {
    records: articles.length,
    platforms: new Set(articles.map((article) => article.plataforma)).size,
    languages: new Set(articles.map((article) => article.idioma)).size,
    years: yearOf(last) - yearOf(first) + 1,
    first, last,
  };
}

// Echoes (crystal-echo): the same title published again, on another platform or another day.
const titleKey = (title: string) => title.normalize("NFD").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
export type Echo = { original: Artigo; copies: Artigo[] };
export function echoes(articles: readonly Artigo[] = ARTICLES): Echo[] {
  const groups = new Map<string, Artigo[]>();
  for (const article of chronological(articles)) groups.set(titleKey(article.titulo), [...(groups.get(titleKey(article.titulo)) ?? []), article]);
  return [...groups.values()].filter((group) => group.length > 1).map(([original, ...copies]) => ({ original, copies }));
}
export const daysBetween = (a: Pick<Artigo, "data">, b: Pick<Artigo, "data">) =>
  Math.round((Date.parse(`${b.data}T00:00:00Z`) - Date.parse(`${a.data}T00:00:00Z`)) / 86_400_000);

// crystal-whisper: one whisper per year of the library, oldest year first.
export const WHISPERS = [
  "https://dev.to/azure/introducao-a-docker-conceitos-basicos-4g19",
  "https://dev.to/azure/github-cli-uma-nova-experiencia-no-github-236n",
  "https://dev.to/glaucia86/vs-code-day-primeiro-evento-oficial-do-visual-studio-code-8mg",
  "https://dev.to/azure/building-applications-with-astro-build-azure-static-web-apps-cli-a20",
  "https://dev.to/azure/step-by-step-guide-migrating-v3-to-v4-programming-model-for-azure-functions-for-nodejs-application-dbn",
  "https://techcommunity.microsoft.com/blog/educatordeveloperblog/langchain-js--azure-a-generative-ai-app-journey/4101258",
  "https://dev.to/glaucia86/close-those-20-browser-tabs-how-mcp-servers-bring-documentation-into-vs-code-435f",
  "https://dev.to/glaucia86/repo-doctor-ai-powered-github-repository-health-analyzer-136n",
].map(record);

// prism-align: the same idea written in two languages (pairs checked by hand, title by title).
export const TRANSLATIONS = [
  ["https://dev.to/glaucia86/repo-doctor-ai-powered-github-repository-health-analyzer-136n", "https://dev.to/glaucia86/github-copilot-sdk-construindo-aplicacoes-agenticas-com-ia-na-pratica-com-repo-doctor-25a6"],
  ["https://dev.to/glaucia86/from-zero-to-mcp-building-a-model-context-protocol-server-with-typescript-and-the-star-wars-api-1kdi", "https://dev.to/glaucia86/do-zero-ao-mcp-criando-um-servidor-model-context-protocol-com-typescript-e-a-api-do-star-wars-26n0"],
  ["https://dev.to/glaucia86/building-a-production-ready-weather-mcp-server-with-clean-architecture-redis-cache-and-solid-32cp", "https://dev.to/glaucia86/criando-mcp-server-de-clima-production-ready-com-clean-architecture-cache-redis-e-principios-solid-58i3"],
  ["https://dev.to/azure/special-edition-this-month-in-azure-static-web-apps-november-and-december-2024-2h41", "https://techcommunity.microsoft.com/blog/desenvolvedoresbr/edi%C3%A7%C3%A3o-especial---este-m%C3%AAs-no-azure-static-web-apps--novembro-e-dezembro-de-2024/4366863"],
  ["https://dev.to/azure/aplicacao-de-referencia-empresarial-em-javascript-contoso-real-estate-23ia", "https://dev.to/azure/aplicacion-de-referencia-empresarial-en-javascript-contoso-real-estate-63i"],
  ["https://dev.to/glaucia86/publicando-aplicacoes-estaticas-com-static-web-apps-azure-devops-4c1o", "https://dev.to/glaucia86/publicacion-de-aplicaciones-estaticas-con-azure-static-web-apps-y-azure-devops-5c63"],
  ["https://glaucia86.medium.com/criando-um-chatbot-em-menos-de-5-minutos-sim-%C3%A9-poss%C3%ADvel-82f240ac19ab", "https://dev.to/glaucia86/creando-un-chatbot-en-menos-de-5-minutos-si-es-posible-1gi1"],
].map(([a, b]) => [record(a), record(b)] as const);

// series-constellation: parts in reading order.
export const SERIES = {
  "typescript-zero-to-hero": [
    "https://dev.to/glaucia86/lancamento-modulo-01-typescript-zero-to-hero-40n4",
    "https://dev.to/glaucia86/modulo-02-videos-07-a-12-typescript-zero-to-hero-44oa",
    "https://dev.to/glaucia86/modulo-02-videos-13-a-18-1-typescript-zero-to-hero-5565",
    "https://dev.to/glaucia86/modulo-02-19-a-33-typescript-zero-to-hero-305n",
    "https://dev.to/glaucia86/modulo-03-34-a-41-typescript-zero-to-hero-1gjh",
    "https://dev.to/azure/modulos-0405-videos-42-a-63-typescript-zero-to-hero-4bo4",
  ],
  "azure-openai-guide": [
    "https://dev.to/azure/a-practical-guide-for-beginners-azure-openai-with-javascript-and-typescript-part-01-5ajh",
    "https://dev.to/azure/a-practical-guide-for-beginners-azure-openai-with-javascript-and-typescript-part-02-4ngm",
    "https://dev.to/azure/a-practical-guide-for-beginners-azure-openai-with-javascript-and-typescript-part-03-2n68",
  ],
  "vue-calculator": [
    "https://glaucia86.medium.com/desenvolvendo-calculadora-em-vue-js-parte-i-d789a928863f",
    "https://dev.to/azure/desenvolvendo-calculadora-em-vue-js-parte-i-2dc1",
    "https://dev.to/azure/desenvolvendo-calculadora-em-vue-js-logica-no-javascript-15n6",
    "https://dev.to/azure/desenvolvendo-calculadora-em-vue-js-refatorando-o-projeto-16e2",
    "https://dev.to/azure/desenvolvendo-calculadora-em-vue-js-hospedando-o-projeto-na-nuvem-2695",
  ],
  "star-wars-crawler": [
    "https://dev.to/azure/building-star-wars-crawler-with-azure-static-web-apps-part-1-3o39",
    "https://dev.to/azure/building-star-wars-crawler-with-azure-static-web-apps-part-2-3hc0",
    "https://dev.to/azure/building-star-wars-crawler-with-azure-static-web-apps-part-3-41ip",
  ],
} as const;
export type SeriesId = keyof typeof SERIES;
export const series = (Object.entries(SERIES) as [SeriesId, readonly string[]][]).map(([id, urls]) => {
  const parts = urls.map(record);
  return { id, parts, first: parts[0], last: parts.at(-1)! };
});

// library-dusk: the personal shelf, lit only at dusk.
export const DUSK = [
  "https://dev.to/glaucia86/sharing-my-story-from-public-school-to-the-largest-technology-company-in-the-world-1m2g",
  "https://dev.to/glaucia86/qual-e-o-segredo-para-aprender-ou-ser-uma-otima-ou-excelente-pessoa-desenvolvedora-cfj",
  "https://dev.to/glaucia86/guia-para-pessoas-desenvolvedoras-back-end-2021-o-que-eu-preciso-saber-10c6",
].map(record);
