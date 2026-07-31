import type { GradientId, Mood, ThemeId } from "./types";

export interface GradientDef {
  id: GradientId;
  name: string;
  mood: string;
  css: string;
  textColor: string;
  mutedColor: string;
  accent: string;
}

export interface ThemeDef {
  id: ThemeId;
  name: string;
  description: string;
  fontFamily: string;
  fontVariable: string;
  className: string;
  contentClass: string;
  titleClass: string;
}

/**
 * Atmospheres - saturated enough to pop on #0a0a0f,
 * never muddy browns or near-black washes.
 */
export const GRADIENTS: GradientDef[] = [
  {
    id: "midnight-muse",
    name: "Midnight Muse",
    mood: "Reflection · Night · Focus",
    css: "linear-gradient(145deg, #1e1b4b 0%, #5b21b6 45%, #a855f7 100%)",
    textColor: "#faf5ff",
    mutedColor: "rgba(250, 245, 255, 0.72)",
    accent: "#e9d5ff",
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    mood: "Energy · Achievement · Celebration",
    css: "linear-gradient(145deg, #fb7185 0%, #f97316 50%, #fbbf24 100%)",
    textColor: "#1c0a0a",
    mutedColor: "rgba(28, 10, 10, 0.7)",
    accent: "#7f1d1d",
  },
  {
    id: "aurora-mesh",
    name: "Aurora Mesh",
    mood: "Deep work · Coding · Creativity",
    css: "linear-gradient(145deg, #042f2e 0%, #0d9488 40%, #22d3ee 75%, #a78bfa 100%)",
    textColor: "#ecfeff",
    mutedColor: "rgba(236, 254, 255, 0.72)",
    accent: "#67e8f9",
  },
  {
    id: "forest",
    name: "Forest",
    mood: "Growth · Calm · Grounded",
    css: "linear-gradient(160deg, #14532d 0%, #16a34a 50%, #84cc16 100%)",
    textColor: "#f0fdf4",
    mutedColor: "rgba(240, 253, 244, 0.72)",
    accent: "#bbf7d0",
  },
  {
    id: "ocean",
    name: "Ocean",
    mood: "Depth · Clarity · Flow",
    css: "linear-gradient(160deg, #0c4a6e 0%, #0284c7 45%, #38bdf8 100%)",
    textColor: "#f0f9ff",
    mutedColor: "rgba(240, 249, 255, 0.72)",
    accent: "#bae6fd",
  },
  {
    id: "noir",
    name: "Noir",
    mood: "Bold · Minimal · Night",
    css: "linear-gradient(165deg, #18181b 0%, #3f3f46 55%, #71717a 100%)",
    textColor: "#fafafa",
    mutedColor: "rgba(250, 250, 250, 0.65)",
    accent: "#e4e4e7",
  },
  {
    id: "paper",
    name: "Paper",
    mood: "Quiet · Literary · Soft",
    css: "linear-gradient(160deg, #fffbeb 0%, #fde68a 55%, #fcd34d 100%)",
    textColor: "#1c1917",
    mutedColor: "rgba(28, 25, 23, 0.65)",
    accent: "#a16207",
  },
  {
    id: "coffee",
    name: "Coffee",
    mood: "Warm · Morning · Intimate",
    // Was muddy brown - now warm amber / copper that pops on dark UI
    css: "linear-gradient(145deg, #9a3412 0%, #ea580c 40%, #fbbf24 100%)",
    textColor: "#fffbeb",
    mutedColor: "rgba(255, 251, 235, 0.75)",
    accent: "#fef3c7",
  },
];

export const THEMES: ThemeDef[] = [
  {
    id: "lyric",
    name: "Lyric",
    description: "Spotify lyrics energy: large, bold, centred",
    fontFamily: "var(--font-outfit)",
    fontVariable: "--font-outfit",
    className: "font-[family-name:var(--font-outfit)]",
    contentClass:
      "text-[1.65rem] sm:text-[1.85rem] leading-[1.35] font-semibold tracking-tight text-center",
    titleClass:
      "text-sm font-medium tracking-[0.2em] uppercase text-center opacity-80",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Luxury magazine: elegant, italic, asymmetrical",
    fontFamily: "var(--font-playfair)",
    fontVariable: "--font-playfair",
    className: "font-[family-name:var(--font-playfair)]",
    contentClass:
      "text-[1.5rem] sm:text-[1.7rem] leading-[1.45] font-medium italic text-left",
    titleClass: "text-sm font-normal tracking-wide italic text-left opacity-75",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Modern design systems: glass, balanced",
    fontFamily: "var(--font-space-grotesk)",
    fontVariable: "--font-space-grotesk",
    className: "font-[family-name:var(--font-space-grotesk)]",
    contentClass:
      "text-[1.35rem] sm:text-[1.5rem] leading-[1.5] font-normal text-left",
    titleClass:
      "text-xs font-medium tracking-[0.15em] uppercase text-left opacity-70",
  },
];

/** Soft washes for Memories mood panels (personal journal, not B2B) */
export const MOOD_AURAS: Record<
  string,
  { from: string; via: string; to: string; label: string }
> = {
  hopeful: {
    from: "rgba(251, 191, 36, 0.22)",
    via: "rgba(244, 114, 182, 0.12)",
    to: "transparent",
    label: "Hopeful",
  },
  reflective: {
    from: "rgba(139, 92, 246, 0.25)",
    via: "rgba(99, 102, 241, 0.12)",
    to: "transparent",
    label: "Reflective",
  },
  grateful: {
    from: "rgba(244, 114, 182, 0.22)",
    via: "rgba(251, 146, 60, 0.12)",
    to: "transparent",
    label: "Grateful",
  },
  anxious: {
    from: "rgba(248, 113, 113, 0.18)",
    via: "rgba(251, 146, 60, 0.1)",
    to: "transparent",
    label: "Anxious",
  },
  excited: {
    from: "rgba(250, 204, 21, 0.25)",
    via: "rgba(249, 115, 22, 0.15)",
    to: "transparent",
    label: "Excited",
  },
  peaceful: {
    from: "rgba(52, 211, 153, 0.22)",
    via: "rgba(45, 212, 191, 0.12)",
    to: "transparent",
    label: "Peaceful",
  },
  melancholy: {
    from: "rgba(129, 140, 248, 0.22)",
    via: "rgba(167, 139, 250, 0.12)",
    to: "transparent",
    label: "Melancholy",
  },
  determined: {
    from: "rgba(34, 211, 238, 0.22)",
    via: "rgba(59, 130, 246, 0.12)",
    to: "transparent",
    label: "Determined",
  },
  joyful: {
    from: "rgba(244, 114, 182, 0.25)",
    via: "rgba(251, 191, 36, 0.15)",
    to: "transparent",
    label: "Joyful",
  },
  neutral: {
    from: "rgba(161, 161, 170, 0.15)",
    via: "rgba(113, 113, 122, 0.08)",
    to: "transparent",
    label: "Neutral",
  },
};

export function getMoodAura(mood?: string | Mood | null) {
  if (!mood) return MOOD_AURAS.reflective;
  return MOOD_AURAS[mood] ?? MOOD_AURAS.reflective;
}

export function getGradient(id: GradientId): GradientDef {
  return GRADIENTS.find((g) => g.id === id) ?? GRADIENTS[0];
}

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Export card canvas specs from the PRD */
export const EXPORT_SPEC = {
  width: 360,
  height: 640,
  safeArea: 24,
  padding: 32,
  borderRadius: 32,
  aspectRatio: "9 / 16",
} as const;
