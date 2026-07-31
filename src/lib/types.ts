export type ThemeId = "lyric" | "editorial" | "classic";
export type GradientId =
  | "midnight-muse"
  | "sunset-glow"
  | "aurora-mesh"
  | "forest"
  | "ocean"
  | "noir"
  | "paper"
  | "coffee";

export type Mood =
  | "hopeful"
  | "reflective"
  | "grateful"
  | "anxious"
  | "excited"
  | "peaceful"
  | "melancholy"
  | "determined"
  | "joyful"
  | "neutral";

export type Source = "typed" | "pasted" | "spoken";

export interface JournalEntry {
  id: string;
  slug: string;
  createdAt: string;
  content: string;
  title?: string;
  source: Source;
  theme: ThemeId;
  gradient: GradientId;
  mood?: Mood;
  spotifyUrl?: string;
  tags: string[];
  isPublished: boolean;
  /** Single compressed photo as data URL (editorial, max one) */
  photoDataUrl?: string;
  /** @deprecated use photoDataUrl */
  imageDataUrl?: string;
}

/** In-progress editor state - auto-saved separately from the archive */
export interface DraftState {
  content: string;
  title: string;
  theme: ThemeId;
  gradient: GradientId;
  mood?: Mood;
  tags: string[];
  source: Source;
  photoDataUrl?: string;
  step: "write" | "style" | "preview";
  createdAt: string;
  updatedAt: string;
}

export interface SpotifyTrack {
  name: string;
  artist: string;
  albumArt?: string;
  url: string;
}
