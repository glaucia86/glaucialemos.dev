// Saves the events Glaucia hosts on Luma (future and past) as the offline fallback of the Atlas's "next connections",
// and reports hosted events that are not in src/data/eventos.json yet. It never edits the history: curate by hand.
// Run: node scripts/snapshot-luma.mjs   (writes src/data/luma.json)
import fs from "node:fs";

const USER = "usr-vzS4gy5xft616VR";
const url = (period) => `https://api2.luma.com/user/profile/events-hosting?user_api_id=${USER}&period=${period}&pagination_limit=50`;
const map = (entry) => {
  const event = entry.event ?? entry;
  const format = event.location_type === "offline" ? "presencial" : "remoto";
  return {
    id: event.api_id, name: event.name, start: event.start_at,
    city: format === "presencial" ? event.geo_address_info?.city ?? null : null,
    country: format === "presencial" ? event.geo_address_info?.country ?? null : null,
    format, url: event.url?.startsWith("http") ? event.url : `https://luma.com/${event.url}`,
  };
};
const read = async (period) => {
  const response = await fetch(url(period), { headers: { accept: "application/json", "user-agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`Luma ${period}: HTTP ${response.status}`);
  return ((await response.json()).entries ?? []).map(map);
};

const [future, past] = await Promise.all([read("future"), read("past")]);
fs.writeFileSync("src/data/luma.json", `${JSON.stringify({ saved: new Date().toISOString(), future, past }, null, 2)}\n`);
console.log(`saved: ${future.length} upcoming, ${past.length} past`);

// One event, two Luma pages (the in-person page is the source in eventos.json; keep in sync with LUMA_SAME_EVENT in src/lib/luma.ts).
const SAME_EVENT = { "https://luma.com/56vdjyl6": "https://luma.com/ayg5q20m" };
const sources = new Set(JSON.parse(fs.readFileSync("src/data/eventos.json", "utf8")).map((event) => event.fonte.replace(/\/$/, "")));
const missing = past.filter((event) => { const key = event.url.replace(/\/$/, ""); return !sources.has(SAME_EVENT[key] ?? key); });
if (!missing.length) console.log("history: every past Luma event is in eventos.json");
for (const event of missing) console.log(`missing from eventos.json: ${event.start.slice(0, 10)} · ${event.name} · ${event.city ?? event.format} · ${event.url}`);
