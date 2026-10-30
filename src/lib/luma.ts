import './zod-config';
import { z } from "zod";
import snapshot from "@/data/luma.json";
import type { Format } from "./atlas-records";

// Events Glaucia hosts on Luma (luma.com/user/glaucia_lemos86), read from the public endpoint the profile page uses.
// It is not documented: every failure falls back to the saved snapshot (scripts/snapshot-luma.mjs), so the page never
// breaks. Upcoming events are shown as "next connections" only; the history stays curated in eventos.json.
export const LUMA_USER = "usr-vzS4gy5xft616VR";
export const LUMA_PROFILE = "https://luma.com/user/glaucia_lemos86";
export const lumaUrl = (period: "future" | "past") => `https://api2.luma.com/user/profile/events-hosting?user_api_id=${LUMA_USER}&period=${period}&pagination_limit=50`;
const REVALIDATE_SECONDS = 86_400;

const entrySchema = z.object({
  event: z.object({
    api_id: z.string(), name: z.string().min(1), start_at: z.iso.datetime({ offset: true }), url: z.string().min(1),
    location_type: z.string().optional().nullable(),
    geo_address_info: z.object({ city: z.string().optional().nullable(), country: z.string().optional().nullable() }).partial().optional().nullable(),
  }),
});
export type LumaEvent = { id: string; name: string; start: string; city: string | null; country: string | null; format: Format; url: string };

// In person when the event has a physical venue; YouTube, Zoom and other links are remote.
export const lumaFormat = (type: string | null | undefined): Format => type === "offline" ? "presencial" : "remoto";

export function parseLuma(json: unknown): LumaEvent[] {
  const entries = (json as { entries?: unknown[] } | null)?.entries;
  if (!Array.isArray(entries)) return [];
  return entries.flatMap((entry) => {
    const parsed = entrySchema.safeParse(entry);
    if (!parsed.success) return [];
    const { api_id, name, start_at, url, location_type, geo_address_info } = parsed.data.event;
    const format = lumaFormat(location_type);
    return [{ id: api_id, name, start: start_at, city: format === "presencial" ? geo_address_info?.city ?? null : null, country: format === "presencial" ? geo_address_info?.country ?? null : null, format, url: url.startsWith("http") ? url : `https://luma.com/${url}` }];
  });
}

const savedSchema = z.object({ saved: z.string(), future: z.array(z.custom<LumaEvent>()), past: z.array(z.custom<LumaEvent>()) });
export const savedLuma = () => savedSchema.parse(snapshot);

// Upcoming events, soonest first; never one that already started (the snapshot may be older than today).
export function upcoming(events: readonly LumaEvent[], now = new Date()) {
  return events.filter((event) => new Date(event.start) > now).sort((a, b) => a.start.localeCompare(b.start));
}

export async function getUpcomingConnections(request: typeof fetch = fetch, now = new Date()): Promise<LumaEvent[]> {
  try {
    const response = await request(lumaUrl("future"), { headers: { accept: "application/json" }, next: { revalidate: REVALIDATE_SECONDS } } as RequestInit);
    if (response.ok) return upcoming(parseLuma(await response.json()), now);
  } catch { /* Offline: the snapshot below. */ }
  return upcoming(savedLuma().future, now);
}

// One event published on two Luma pages: the livestream page points to the in-person one used as the source.
export const LUMA_SAME_EVENT: Record<string, string> = { "https://luma.com/56vdjyl6": "https://luma.com/ayg5q20m" };

// Luma events missing from the curated history (matched by URL): the snapshot script reports them, never adds them.
export function missingFromHistory(events: readonly LumaEvent[], sources: readonly string[]) {
  const known = new Set(sources.map((source) => source.replace(/\/$/, "")));
  return events.filter((event) => { const key = event.url.replace(/\/$/, ""); return !known.has(LUMA_SAME_EVENT[key] ?? key); });
}
