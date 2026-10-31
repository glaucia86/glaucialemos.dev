import en from "./en";
import es from "./es";
import pt, { type Dictionary } from "./pt";
import type { Locale } from "../config";
import type { ChromeDictionary } from "@/components/SiteChrome";

const dictionaries: Record<Locale, Dictionary> = { pt, en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

// Only shared chrome copy crosses the layout's server/client boundary.
export function chromeDictionary(locale: Locale): ChromeDictionary {
  const { accessibility, comlink, easterEgg, footer, holonet, motion, nav } = getDictionary(locale);
  return { accessibility, comlink, easterEgg, footer, holonet, motion, nav };
}
