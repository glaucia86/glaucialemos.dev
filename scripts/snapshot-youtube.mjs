// Saves the channel's latest long upload (Shorts skipped) as the offline fallback of Lúmina's old TV.
// Run: node scripts/snapshot-youtube.mjs   (writes src/data/youtube.json)
import fs from "node:fs";

const FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=UC2Qzw5aqCBk_z0lWJnumWQQ";
const tag = (entry, name) => (entry.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").trim();

const xml = await (await fetch(FEED)).text();
const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, entry]) => ({ id: tag(entry, "yt:videoId"), title: tag(entry, "title"), published: tag(entry, "published") }));
for (const video of entries.slice(0, 8)) {
  const response = await fetch(`https://www.youtube.com/shorts/${video.id}`, { method: "HEAD", redirect: "manual" });
  if (response.status === 200) { console.log(`short, skipped: ${video.title}`); continue; }
  fs.writeFileSync("src/data/youtube.json", `${JSON.stringify(video, null, 2)}\n`);
  console.log(`saved: ${video.title} (${video.id}, ${video.published})`);
  process.exit(0);
}
console.error("No long video among the latest uploads; snapshot unchanged.");
process.exit(1);
