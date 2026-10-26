// Events shared by Lúmina's islands: the hero and the rings ask the shelves to show an article or a year.
export const FIND_ARTICLE_EVENT = "lumina:find-article";
export const FILTER_YEAR_EVENT = "lumina:filter-year";

// Stable anchor for an article card, derived from its URL (FNV-1a, base 36).
export function articleAnchor(url: string) {
  let hash = 2166136261;
  for (let index = 0; index < url.length; index++) { hash ^= url.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return `artigo-${(hash >>> 0).toString(36)}`;
}

// Asks the shelves to clear their filters and light the card; returns false when nothing listened (no shelves).
export const findArticle = (url: string) => !dispatchEvent(new CustomEvent(FIND_ARTICLE_EVENT, { detail: url, cancelable: true }));
