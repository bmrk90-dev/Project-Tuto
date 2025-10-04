import { Redis } from "@upstash/redis";
export type Category = "Cooking" | "Investing" | "Fitness" | "Tech" | "DIY" | "Outdoors" | "Languages";
export type Tutorial = { id: string; title: string; category: Category; tags: string[]; description: string; durationSec: number; votes: number; creator: { name: string }; createdAt: string; saved?: boolean; };
let memory: Tutorial[] | null = null;
function seed(): Tutorial[] {
  const now = Date.now();
  const mk = (t: Partial<Tutorial>): Tutorial => ({
    id: Math.random().toString(36).slice(2), title: t.title || "Untitled", category: (t.category || "Tech") as Category,
    tags: t.tags || [], description: t.description || "", durationSec: t.durationSec || 60, votes: t.votes ?? 0,
    creator: t.creator || { name: "System" }, createdAt: t.createdAt || new Date(now).toISOString(), saved: false,
  });
  return [
    mk({ title: "Knead dough properly", category: "Cooking", tags: ["bread","kneading"], description: "Light, springy crumb in 60s.", durationSec: 62, votes: 72, creator: { name: "Mia Baker" }, createdAt: new Date(now - 3*864e5).toISOString() }),
    mk({ title: "Read stock charts: trend + volume", category: "Investing", tags: ["charts","volume","trend"], description: "Trend line, volume spikes, support/resistance.", durationSec: 75, votes: 1024, creator: { name: "Alex Chen" }, createdAt: new Date(now - 1*864e5).toISOString() }),
    mk({ title: "Perfect push-up form", category: "Fitness", tags: ["calisthenics","form"], description: "Elbows 30–45°, core tight, neck neutral.", durationSec: 55, votes: 893, creator: { name: "Lina K" }, createdAt: new Date(now - 6*36e5).toISOString() }),
    mk({ title: "Format cells in Excel like a pro", category: "Tech", tags: ["excel","formatting"], description: "Fast number formats and conditional formatting.", durationSec: 68, votes: 549, creator: { name: "Sam Patel" }, createdAt: new Date(now - 36*36e5).toISOString() }),
    mk({ title: "Tie an improved clinch knot", category: "Outdoors", tags: ["fishing","knots"], description: "Secure your lure: 6 wraps + tuck.", durationSec: 45, votes: 311, creator: { name: "Ola Nordmann" }, createdAt: new Date(now - 12*36e5).toISOString() }),
  ];
}
const useRedis = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = useRedis ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! }) : null;
const KEY = "micro:tutorials";
export async function getAll(): Promise<Tutorial[]> {
  if (redis) { const data = await redis.get<Tutorial[]>(KEY); if (!data) { const s = seed(); await redis.set(KEY, s); return s; } return data; }
  else { if (!memory) memory = seed(); return memory; }
}
export async function saveAll(list: Tutorial[]) { if (redis) await redis.set(KEY, list); else memory = list; }
export async function addTutorial(t: Omit<Tutorial, "id" | "votes" | "createdAt" | "creator">) {
  const list = await getAll(); const item: Tutorial = { ...t, id: Math.random().toString(36).slice(2), votes: 0, createdAt: new Date().toISOString(), creator: { name: "You" }, saved: false };
  list.unshift(item); await saveAll(list); return item;
}
export async function vote(id: string) { const list = await getAll(); const i = list.findIndex(x => x.id === id); if (i >= 0) { list[i].votes += 1; await saveAll(list); return list[i]; } return null; }
export async function toggleSave(id: string) { const list = await getAll(); const i = list.findIndex(x => x.id === id); if (i >= 0) { list[i].saved = !list[i].saved; await saveAll(list); return list[i]; } return null; }
