export const locales = ["pt", "en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localizePath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && isLocale(segments[0])) segments.shift();
  return `/${[locale, ...segments].join("/")}`;
}

export function preferredLocale(header: string | null): Locale {
  const languages = (header?.split(",") ?? [])
    .map((entry, index) => {
      const [tag = "", ...parameters] = entry.trim().split(";");
      const qualityText = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith("q="))
        ?.slice(2);
      const quality = qualityText === undefined ? 1 : Number(qualityText);
      return { tag, quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const language of languages) {
    const code = language.tag.split("-")[0]?.toLowerCase();
    if (language.quality > 0 && code && isLocale(code)) return code;
  }

  return defaultLocale;
}
