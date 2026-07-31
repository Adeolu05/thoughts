import { getSupabaseClient } from "./supabase";
import type { JournalEntry } from "./types";

const STORAGE_KEY = "thoughts.journal_entries.v1";
const TABLE = "thoughts" as const;

type ThoughtRow = {
  id: string;
  user_id?: string;
  slug: string;
  created_at: string;
  content: string;
  title: string | null;
  source: JournalEntry["source"];
  theme: JournalEntry["theme"];
  gradient: JournalEntry["gradient"];
  mood: JournalEntry["mood"] | null;
  spotify_url: string | null;
  tags: string[] | null;
  is_published: boolean;
  photo_data_url: string | null;
  image_data_url: string | null;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function sortEntries(entries: JournalEntry[]): JournalEntry[] {
  return entries.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function toEntry(row: ThoughtRow): JournalEntry {
  return {
    id: row.id,
    slug: row.slug,
    createdAt: row.created_at,
    content: row.content,
    title: row.title ?? undefined,
    source: row.source,
    theme: row.theme,
    gradient: row.gradient,
    mood: row.mood ?? undefined,
    spotifyUrl: row.spotify_url ?? undefined,
    tags: row.tags ?? [],
    isPublished: row.is_published,
    photoDataUrl: row.photo_data_url ?? undefined,
    imageDataUrl: row.image_data_url ?? undefined,
  };
}

function toRow(entry: JournalEntry): Omit<ThoughtRow, "user_id"> {
  return {
    id: entry.id,
    slug: entry.slug,
    created_at: entry.createdAt,
    content: entry.content,
    title: entry.title ?? null,
    source: entry.source,
    theme: entry.theme,
    gradient: entry.gradient,
    mood: entry.mood ?? null,
    spotify_url: entry.spotifyUrl ?? null,
    tags: entry.tags,
    is_published: entry.isPublished,
    photo_data_url: entry.photoDataUrl ?? null,
    image_data_url: entry.imageDataUrl ?? null,
  };
}

export function getEntries(): JournalEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEntry[];
    return Array.isArray(parsed) ? sortEntries(parsed) : [];
  } catch {
    return [];
  }
}

export function getPublishedEntries(): JournalEntry[] {
  return getEntries().filter((e) => e.isPublished);
}

export async function loadEntries(options?: {
  publishedOnly?: boolean;
}): Promise<JournalEntry[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase
        .from(TABLE)
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.publishedOnly) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (error) throw error;

      const entries = sortEntries(((data ?? []) as ThoughtRow[]).map(toEntry));
      if (!options?.publishedOnly) {
        saveEntriesLocal(entries);
      }
      return entries;
    } catch {
      /* fall through to localStorage */
    }
  }

  return options?.publishedOnly ? getPublishedEntries() : getEntries();
}

export async function loadPublishedEntries(): Promise<JournalEntry[]> {
  return loadEntries({ publishedOnly: true });
}

export function getEntryBySlug(slug: string): JournalEntry | undefined {
  return getEntries().find((e) => e.slug === slug);
}

export async function loadEntryBySlug(
  slug: string
): Promise<JournalEntry | undefined> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (data) return toEntry(data as ThoughtRow);
    } catch {
      /* fall through to localStorage */
    }
  }

  return getEntryBySlug(slug);
}

export function getEntryById(id: string): JournalEntry | undefined {
  return getEntries().find((e) => e.id === id);
}

function saveEntriesLocal(entries: JournalEntry[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortEntries(entries)));
}

export function saveEntry(entry: JournalEntry): JournalEntry {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.unshift(entry);
  }
  saveEntriesLocal(entries);
  return entry;
}

export async function saveEntryEverywhere(
  entry: JournalEntry
): Promise<JournalEntry> {
  saveEntry(entry);

  const supabase = getSupabaseClient();
  if (!supabase) return entry;

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return entry;

    const row = { ...toRow(entry), user_id: auth.user.id };
    const table = supabase.from(TABLE) as unknown as {
      upsert: (
        value: typeof row,
        options: { onConflict: string }
      ) => {
        select: (columns: string) => {
          single: () => Promise<{ data: ThoughtRow | null; error: Error | null }>;
        };
      };
    };
    const { data, error } = await table
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();

    if (error) throw error;
    const saved = toEntry(data as ThoughtRow);
    saveEntry(saved);
    return saved;
  } catch {
    return entry;
  }
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  saveEntriesLocal(entries);
}

export async function deleteEntryEverywhere(id: string): Promise<void> {
  deleteEntry(id);

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from(TABLE).delete().eq("id", id);
  } catch {
    /* local delete has already succeeded */
  }
}

export function getOnThisDay(date = new Date()): JournalEntry[] {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();

  return getEntries().filter((e) => {
    const d = new Date(e.createdAt);
    return (
      d.getMonth() === month &&
      d.getDate() === day &&
      d.getFullYear() < year
    );
  });
}

export async function loadOnThisDay(date = new Date()): Promise<JournalEntry[]> {
  const entries = await loadEntries();
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();

  return entries.filter((e) => {
    const d = new Date(e.createdAt);
    return (
      d.getMonth() === month &&
      d.getDate() === day &&
      d.getFullYear() < year
    );
  });
}

export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 48);

  const suffix = Math.random().toString(36).slice(2, 7);
  return base ? `${base}-${suffix}` : `thought-${suffix}`;
}

export function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
