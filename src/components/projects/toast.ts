// Tatooine's toast bus: any island can show a line; TatooineEggs renders it.
export const SAY_EVENT = "tatooine:say";
export type Line = { text: string; sign?: string };

export const say = (text: string, sign?: string) => window.dispatchEvent(new CustomEvent<Line>(SAY_EVENT, { detail: { text, sign } }));
