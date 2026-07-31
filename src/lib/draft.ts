import type { DraftState } from "./types";

const DRAFT_KEY = "thoughts.draft.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getDraft(): DraftState | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(draft: DraftState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...draft, updatedAt: new Date().toISOString() })
    );
  } catch (e) {
    // Quota exceeded (often large photo) - try without photo once
    console.warn("Draft save failed, retrying without photo", e);
    try {
      const slim = { ...draft, photoDataUrl: undefined, updatedAt: new Date().toISOString() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(slim));
    } catch {
      console.error("Draft save failed completely");
    }
  }
}

export function clearDraft(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(DRAFT_KEY);
}

export function hasMeaningfulDraft(draft: DraftState | null): boolean {
  if (!draft) return false;
  return Boolean(draft.content?.trim() || draft.photoDataUrl || draft.title?.trim());
}

export function formatDraftAge(updatedAt: string): string {
  const ms = Date.now() - new Date(updatedAt).getTime();
  if (ms < 5000) return "just now";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(updatedAt).toLocaleDateString();
}
