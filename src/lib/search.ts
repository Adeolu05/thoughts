import type { JournalEntry } from "@/lib/types";

export const MAX_TAGS = 6;
export const MAX_TAG_LENGTH = 24;

/** Normalize user/AI tag input into a stable slug-like token. */
export function normalizeTag(raw: string): string | null {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_TAG_LENGTH);

  return cleaned.length >= 2 ? cleaned : null;
}

export function addTag(tags: string[], raw: string): string[] {
  const next = normalizeTag(raw);
  if (!next) return tags;
  if (tags.some((t) => t.toLowerCase() === next)) return tags;
  if (tags.length >= MAX_TAGS) return tags;
  return [...tags, next];
}

export function removeTag(tags: string[], tag: string): string[] {
  return tags.filter((t) => t.toLowerCase() !== tag.toLowerCase());
}

/** Client-side archive search across title, body, mood, and tags. */
export function searchEntries(
  entries: JournalEntry[],
  query: string,
  activeTag?: string | null
): JournalEntry[] {
  const q = query.trim().toLowerCase();
  const tag = activeTag?.trim().toLowerCase() || null;

  return entries.filter((entry) => {
    if (tag && !entry.tags.some((t) => t.toLowerCase() === tag)) {
      return false;
    }
    if (!q) return true;

    const haystack = [
      entry.title ?? "",
      entry.content,
      entry.mood ?? "",
      ...entry.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function collectTags(entries: JournalEntry[]): [string, number][] {
  const map = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      const key = tag.toLowerCase();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
