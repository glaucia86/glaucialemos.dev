// One crystal colour per publishing platform (unknown platforms fall back to opal).
const COLORS: Record<string, string> = {
  "DEV Community": "#53e0e8",
  "Microsoft Tech Community": "#aa78f4",
  Medium: "#f7e6ff",
  LinkedIn: "#e474c7",
};
export const platformColor = (platform: string) => COLORS[platform] ?? "#f7e6ff";

// One beam colour per language, shared by the prisms and the shelves.
export const LANGUAGE_COLORS = { "pt-BR": "#e474c7", en: "#53e0e8", es: "#aa78f4" } as const;
