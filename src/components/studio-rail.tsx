"use client";

import { GRADIENTS, THEMES } from "@/lib/design-system";
import type { GradientId, ThemeId } from "@/lib/types";

interface StudioRailProps {
  theme: ThemeId;
  gradient: GradientId;
  onThemeChange: (t: ThemeId) => void;
  onGradientChange: (g: GradientId) => void;
  compact?: boolean;
}

export function StudioRail({
  theme,
  gradient,
  onThemeChange,
  onGradientChange,
  compact = true,
}: StudioRailProps) {
  return (
    <div
      className={
        compact
          ? "space-y-5 rounded-[1.35rem] border border-slate-900/[0.06] bg-white p-4 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#1c1930]"
          : "space-y-6"
      }
    >
      <div>
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Type
          </p>
          {compact && (
            <span className="rounded-md bg-slate-50 dark:bg-white/[0.08] px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 dark:text-slate-500 ring-1 ring-slate-900/5 dark:ring-white/10">
              T
            </span>
          )}
        </div>
        <div
          className={`flex flex-col gap-1.5 ${compact ? "" : "sm:flex-row sm:flex-wrap"}`}
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onThemeChange(t.id)}
              title={`${t.name} - ${t.description}`}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                theme === t.id
                  ? "border-violet-300 dark:border-violet-400/40 bg-violet-50 dark:bg-violet-500/15 text-violet-900 dark:text-violet-100 shadow-sm shadow-violet-600/10"
                  : "border-slate-900/[0.05] bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-800 dark:border-white/10 dark:bg-[#14121f] dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:text-slate-100"
              }`}
            >
              <span className="text-[13px] font-semibold">{t.name}</span>
              <span className="mt-0.5 block text-[10px] leading-snug text-slate-400 dark:text-slate-500">
                {t.description.split(":")[0]?.trim() ?? t.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Atmosphere
          </p>
          {compact && (
            <span className="rounded-md bg-slate-50 dark:bg-white/[0.08] px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 dark:text-slate-500 ring-1 ring-slate-900/5 dark:ring-white/10">
              G
            </span>
          )}
        </div>
        <div
          className={
            compact
              ? "grid grid-cols-4 gap-2"
              : "grid grid-cols-4 gap-2 sm:grid-cols-8"
          }
        >
          {GRADIENTS.map((g) => (
            <button
              key={g.id}
              type="button"
              title={`${g.name} - ${g.mood}`}
              onClick={() => onGradientChange(g.id)}
              className={`relative aspect-square overflow-hidden rounded-xl transition-all duration-200 ${
                gradient === g.id
                  ? "scale-105 shadow-md ring-2 ring-violet-500 ring-offset-2 ring-offset-white dark:ring-offset-[#0c0a14]"
                  : "ring-1 ring-slate-900/8 dark:ring-white/10 hover:scale-105 hover:shadow-sm"
              }`}
              style={{ background: g.css }}
            >
              <span className="sr-only">{g.name}</span>
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-[12px] font-medium text-slate-700 dark:text-slate-200">
          {GRADIENTS.find((g) => g.id === gradient)?.name}
          <span className="font-normal text-slate-400 dark:text-slate-500">
            {" "}
            · {GRADIENTS.find((g) => g.id === gradient)?.mood}
          </span>
        </p>
      </div>
    </div>
  );
}

export function AtmosphereStrip({
  gradient,
  onGradientChange,
}: {
  gradient: GradientId;
  onGradientChange: (g: GradientId) => void;
}) {
  return (
    <div className="lg:hidden">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        Quick atmosphere
      </p>
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2 px-1.5 py-1">
          {GRADIENTS.map((g) => {
            const selected = gradient === g.id;
            return (
              <button
                key={g.id}
                type="button"
                title={g.name}
                onClick={() => onGradientChange(g.id)}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition-all ${
                  selected
                    ? "border-violet-500"
                    : "border-transparent"
                }`}
              >
                <span
                  className="h-10 w-10 rounded-[0.7rem] ring-1 ring-slate-900/10 dark:ring-white/10"
                  style={{ background: g.css }}
                  aria-hidden
                />
                <span className="sr-only">{g.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
