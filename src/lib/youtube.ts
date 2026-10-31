import './zod-config';
import { z } from "zod";
import snapshot from "@/data/youtube.json";

// The channel's public RSS feed: the latest 15 uploads, no API key, no cost. Read on the server once a day.
export const YOUTUBE_CHANNEL_ID = "UC2Qzw5aqCBk_z0lWJnumWQQ";
export const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
const REVALIDATE_SECONDS = 86_400;
// How many recent uploads may be checked for Shorts before giving up.
const MAX_CHECKS = 8;

const videoSchema = z.object({ id: z.string().regex(/^[\w-]{11}$/), title: z.string().min(1), published: z.iso.datetime({ offset: true }), description: z.string() });
export type FeedVideo = z.infer<typeof videoSchema>;
export type LatestVideo = { id: string; title: string; published: string; url: string; live: boolean };

const decode = (text: string) => text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").trim();
const tag = (entry: string, name: string) => decode(entry.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "");

// Entries in feed order (newest first); malformed entries are dropped.
export function parseFeed(xml: string): FeedVideo[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].flatMap(([, entry]) => {
    const parsed = videoSchema.safeParse({ id: tag(entry, "yt:videoId"), title: tag(entry, "title"), published: tag(entry, "published"), description: tag(entry, "media:description") });
    return parsed.success ? [parsed.data] : [];
  });
}

const tagged = (video: FeedVideo) => /#(youtube)?shorts?\b/i.test(`${video.title} ${video.description}`);

// youtube.com/shorts/{id} answers 200 for a Short and redirects to /watch for a regular video. When that check fails,
// the #shorts hashtag decides.
export async function isShort(video: FeedVideo, request: typeof fetch = fetch) {
  try {
    const response = await request(`https://www.youtube.com/shorts/${video.id}`, { method: "HEAD", redirect: "manual", next: { revalidate: REVALIDATE_SECONDS } } as RequestInit);
    if (response.status === 200) return true;
    if (response.status >= 300 && response.status < 400) return false;
  } catch { /* Fall back to the hashtag. */ }
  return tagged(video);
}

const toLatest = (video: Pick<FeedVideo, "id" | "title" | "published">, live: boolean): LatestVideo =>
  ({ id: video.id, title: video.title, published: video.published, url: `https://www.youtube.com/watch?v=${video.id}`, live });

export const savedVideo = () => toLatest(videoSchema.omit({ description: true }).parse(snapshot), false);

// The latest long upload (Shorts skipped); the saved snapshot when the feed is unreachable or only has Shorts.
export async function getLatestVideo(request: typeof fetch = fetch): Promise<LatestVideo> {
  try {
    const response = await request(FEED_URL, { next: { revalidate: REVALIDATE_SECONDS } } as RequestInit);
    if (!response.ok) return savedVideo();
    for (const video of parseFeed(await response.text()).slice(0, MAX_CHECKS)) if (!(await isShort(video, request))) return toLatest(video, true);
  } catch { /* Offline: the saved snapshot below. */ }
  return savedVideo();
}
