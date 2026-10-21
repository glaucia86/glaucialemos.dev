import { getProjetos } from "./data";
import type { Projeto } from "./types";

const TIMEOUT_MS = 5_000;

export async function getProjetosComEstrelas(): Promise<Projeto[]> {
  return Promise.all(
    getProjetos().map(async (projeto) => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/glaucia86/${encodeURIComponent(projeto.nome)}`,
          {
            next: { revalidate: 86_400 },
            signal: AbortSignal.timeout(TIMEOUT_MS),
            headers: { Accept: "application/vnd.github+json" },
          },
        );

        if (!response.ok) return projeto;

        const payload: unknown = await response.json();
        if (
          typeof payload !== "object" ||
          payload === null ||
          !("stargazers_count" in payload) ||
          typeof payload.stargazers_count !== "number"
        ) {
          return projeto;
        }

        return { ...projeto, estrelas: payload.stargazers_count };
      } catch {
        return projeto;
      }
    }),
  );
}
