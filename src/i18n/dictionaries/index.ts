import en from "./en";
import es from "./es";
import pt, { type Dictionary } from "./pt";
import type { Locale } from "../config";

const dictionaries: Record<Locale, Dictionary> = { pt, en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
