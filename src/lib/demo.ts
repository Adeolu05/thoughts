import type { JournalEntry } from "./types";

export const DEMO_ENTRIES: JournalEntry[] = [
  {
    id: "demo-1",
    slug: "learning-to-trust-again-demo",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    content:
      "Today I chose stillness over noise.\nThe answers were quieter than I expected, and more honest.",
    title: "A Quiet Sunday",
    source: "typed",
    theme: "lyric",
    gradient: "midnight-muse",
    mood: "peaceful",
    tags: ["life", "reflection"],
    isPublished: true,
  },
  {
    id: "demo-2",
    slug: "shipping-something-small-demo",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    content:
      "Shipped something imperfect today.\nPerfect was the enemy of done, and done felt free.",
    title: "Imperfect and Free",
    source: "typed",
    theme: "classic",
    gradient: "aurora-mesh",
    mood: "determined",
    tags: ["building"],
    isPublished: true,
  },
  {
    id: "demo-3",
    slug: "grateful-for-small-things-demo",
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    content:
      "Grateful for the people who check in without needing a reason.\nThat’s the real luxury.",
    title: "Quiet Luxury",
    source: "typed",
    theme: "editorial",
    gradient: "sunset-glow",
    mood: "grateful",
    tags: ["relationships"],
    isPublished: true,
  },
];

export const DEMO_MAP: Record<string, JournalEntry> = Object.fromEntries(
  DEMO_ENTRIES.map((e) => [e.slug, e])
);
