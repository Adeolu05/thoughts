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

export type SaveDestination = "local" | "cloud";

export type SaveResult = {
  entry: JournalEntry;
  destination: SaveDestination;
  error?: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function sortEntries(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort(
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

/** Union by id. `prefer` wins when the same thought exists on both sides. */
export function mergeById(
  local: JournalEntry[],
  remote: JournalEntry[],
  prefer: "local" | "remote"
): JournalEntry[] {
  const map = new Map<string, JournalEntry>();
  const first = prefer === "local" ? remote : local;
  const second = prefer === "local" ? local : remote;
  for (const entry of first) map.set(entry.id, entry);
  for (const entry of second) map.set(entry.id, entry);
  return sortEntries([...map.values()]);
}

export function isCloudConfigured(): boolean {
  return getSupabaseClient() !== null;
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
  const local = getEntries();
  const supabase = getSupabaseClient();

  if (!supabase) {
    return options?.publishedOnly ? getPublishedEntries() : local;
  }

  if (options?.publishedOnly) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return sortEntries(((data ?? []) as ThoughtRow[]).map(toEntry));
    } catch {
      return getPublishedEntries();
    }
  }

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return local;
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const remote = ((data ?? []) as ThoughtRow[]).map(toEntry);
    const merged = mergeById(local, remote, "remote");
    saveEntriesLocal(merged);
    return merged;
  } catch {
    return local;
  }
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
  const local = getEntryBySlug(slug);
  if (local) return local;

  const supabase = getSupabaseClient();
  if (!supabase) return undefined;

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (data) return toEntry(data as ThoughtRow);
  } catch {
    /* fall through */
  }

  return undefined;
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
): Promise<SaveResult> {
  const savedLocal = saveEntry(entry);
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { entry: savedLocal, destination: "local" };
  }

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return { entry: savedLocal, destination: "local" };
    }

    const row = { ...toRow(entry), user_id: auth.user.id };
    const table = supabase.from(TABLE) as unknown as {
      upsert: (
        value: typeof row,
        options: { onConflict: string }
      ) => {
        select: (columns: string) => {
          single: () => Promise<{
            data: ThoughtRow | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
    const { data, error } = await table
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      return {
        entry: savedLocal,
        destination: "local",
        error: error.message,
      };
    }

    const saved = toEntry(data as ThoughtRow);
    saveEntry(saved);
    return { entry: saved, destination: "cloud" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cloud sync failed";
    return { entry: savedLocal, destination: "local", error: message };
  }
}

/** Upload this device's archive after sign-in so local-only thoughts reach the cloud. */
export async function syncLocalToCloud(): Promise<{
  uploaded: number;
  error?: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) return { uploaded: 0 };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { uploaded: 0 };

  const local = getEntries();
  let uploaded = 0;

  for (const entry of local) {
    const result = await saveEntryEverywhere(entry);
    if (result.error) {
      return { uploaded, error: result.error };
    }
    if (result.destination === "cloud") uploaded += 1;
  }

  return { uploaded };
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
