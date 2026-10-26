import { describe, expect, it } from "vitest";
import { getLatestVideo, isShort, parseFeed, savedVideo } from "@/lib/youtube";
import { embedUrl } from "@/components/content/RetroTV";

const entry = (id: string, title: string, published: string, description = "") => `<entry><id>yt:video:${id}</id><yt:videoId>${id}</yt:videoId><title>${title}</title><published>${published}</published><media:group><media:title>${title}</media:title><media:description>${description}</media:description></media:group></entry>`;
const FEED = `<?xml version="1.0"?><feed>${[
  entry("Fjr8Fldb5h8", "A verdadeira guerra da IA", "2026-07-26T11:49:13+00:00", "#YouTubeShorts"),
  entry("PXdrWzHajnY", "Graph Engineering? Outro conceito?!", "2026-07-21T01:26:39+00:00"),
  entry("I_TlmQ1T3Ok", "Build in Public &amp; Copilot #02", "2026-02-04T03:13:55+00:00"),
  "<entry><yt:videoId>bad</yt:videoId></entry>",
].join("")}</feed>`;
const shorts = new Set(["Fjr8Fldb5h8", "PXdrWzHajnY"]);
// Feed answers with the XML; /shorts/{id} answers 200 for a Short and 303 for a regular video.
const youtube = (overrides: { feed?: () => Response; short?: (id: string) => Response } = {}) => (async (input: string | URL | Request) => {
  const url = String(input);
  if (url.includes("/feeds/")) return overrides.feed?.() ?? new Response(FEED);
  const id = url.split("/shorts/")[1];
  return overrides.short?.(id) ?? new Response(null, { status: shorts.has(id) ? 200 : 303 });
}) as typeof fetch;

describe("TV antiga: último vídeo do YouTube", () => {
  it("lê o feed em ordem, decodifica entidades e descarta entradas inválidas", () => {
    const videos = parseFeed(FEED);
    expect(videos.map((video) => video.id)).toEqual(["Fjr8Fldb5h8", "PXdrWzHajnY", "I_TlmQ1T3Ok"]);
    expect(videos[2].title).toBe("Build in Public & Copilot #02");
  });

  it("pula Shorts e devolve o último vídeo longo", async () => {
    expect(await getLatestVideo(youtube())).toEqual({ id: "I_TlmQ1T3Ok", title: "Build in Public & Copilot #02", published: "2026-02-04T03:13:55+00:00", url: "https://www.youtube.com/watch?v=I_TlmQ1T3Ok", live: true });
  });

  it("sem resposta da página de Shorts, decide pela hashtag", async () => {
    const [tagged, plain] = parseFeed(FEED);
    const offline = (() => Promise.reject(new Error("offline"))) as typeof fetch;
    expect(await isShort(tagged, offline)).toBe(true);
    expect(await isShort(plain, offline)).toBe(false);
  });

  it("usa a última transmissão salva quando o feed falha", async () => {
    expect(await getLatestVideo(youtube({ feed: () => new Response("", { status: 500 }) }))).toEqual(savedVideo());
    expect(await getLatestVideo((() => Promise.reject(new Error("offline"))) as typeof fetch)).toEqual(savedVideo());
    expect(savedVideo().live).toBe(false);
  });

  it("o player é o do modo de privacidade, só com o id do vídeo", () => {
    expect(embedUrl("I_TlmQ1T3Ok")).toBe("https://www.youtube-nocookie.com/embed/I_TlmQ1T3Ok?autoplay=1&rel=0&playsinline=1");
  });
});
