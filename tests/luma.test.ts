import { describe, expect, it } from "vitest";
import { getEventos } from "@/lib/data";
import { getUpcomingConnections, lumaFormat, missingFromHistory, parseLuma, savedLuma, upcoming } from "@/lib/luma";

const entry = (name: string, start: string, type: string, url: string, city: string | null = "Rio de Janeiro") => ({ event: { api_id: `evt-${name}`, name, start_at: start, url, location_type: type, geo_address_info: city ? { city, country: "Brazil" } : null } });
const feed = { entries: [entry("Rio", "2027-03-10T12:00:00.000Z", "offline", "abc123"), entry("Live", "2027-02-01T20:00:00.000Z", "youtube", "https://luma.com/live1", null), { event: { name: "broken" } }] };
const now = new Date("2026-10-26T12:00:00Z");

describe("Luma: próximas conexões", () => {
  it("lê os eventos organizados e separa presencial de remoto", () => {
    const events = parseLuma(feed);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ id: "evt-Rio", name: "Rio", start: "2027-03-10T12:00:00.000Z", city: "Rio de Janeiro", country: "Brazil", format: "presencial", url: "https://luma.com/abc123" });
    expect(events[1]).toMatchObject({ format: "remoto", city: null, url: "https://luma.com/live1" });
    expect(lumaFormat("zoom")).toBe("remoto");
    expect(parseLuma(null)).toEqual([]);
  });

  it("mostra só o que ainda não começou, do mais próximo ao mais distante", () => {
    const events = parseLuma(feed);
    expect(upcoming(events, now).map((event) => event.name)).toEqual(["Live", "Rio"]);
    expect(upcoming(events, new Date("2027-04-01T00:00:00Z"))).toEqual([]);
  });

  it("cai no snapshot quando o Luma não responde", async () => {
    const offline = (async () => { throw new Error("offline"); }) as unknown as typeof fetch;
    await expect(getUpcomingConnections(offline, now)).resolves.toEqual(upcoming(savedLuma().future, now));
    const failing = (async () => new Response("no", { status: 500 })) as unknown as typeof fetch;
    await expect(getUpcomingConnections(failing, now)).resolves.toEqual(upcoming(savedLuma().future, now));
    const live = (async () => Response.json(feed)) as unknown as typeof fetch;
    await expect(getUpcomingConnections(live, now)).resolves.toHaveLength(2);
  });

  it("todo evento passado do Luma já está no histórico curado (a transmissão de SP é o mesmo evento)", () => {
    expect(missingFromHistory(savedLuma().past, getEventos().map((event) => event.fonte))).toEqual([]);
    expect(missingFromHistory(parseLuma(feed), getEventos().map((event) => event.fonte))).toHaveLength(2);
  });
});
