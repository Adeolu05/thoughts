"use client";

import { GRADIENTS, THEMES } from "@/lib/design-system";
import type { GradientId, ThemeId } from "@/lib/types";

interface ThemePickerProps {
  theme: ThemeId;
  gradient: GradientId;
  onThemeChange: (t: ThemeId) => void;
  onGradientChange: (g: GradientId) => void;
}

export function ThemePicker({
  theme,
  gradient,
  onThemeChange,
  onGradientChange,
}: ThemePickerProps) {
  return (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Typography
        </p>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onThemeChange(t.id)}
              title={t.description}
              className={`rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all ${
                theme === t.id
                  ? "border-violet-300 dark:border-violet-400/40 bg-violet-50 dark:bg-violet-500/15 text-violet-900 dark:text-violet-100 shadow-sm shadow-violet-600/10"
                  : "border-slate-900/[0.06] bg-white text-slate-500 hover:border-slate-200 hover:text-slate-800 dark:border-white/10 dark:bg-[#14121f] dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-slate-100"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <p className="mt-2.5 hidden text-xs text-slate-400 dark:text-slate-500 sm:block">
          {THEMES.find((t) => t.id === theme)?.description}
        </p>
      </div>

      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Atmosphere
        </p>
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-4 xl:grid-cols-8">
          {GRADIENTS.map((g) => (
            <button
              key={g.id}
              type="button"
              title={`${g.name} - ${g.mood}`}
              onClick={() => onGradientChange(g.id)}
              className={`group relative aspect-square overflow-hidden rounded-2xl transition-all duration-200 ${
                gradient === g.id
                  ? "scale-105 shadow-md ring-2 ring-violet-500 ring-offset-2 ring-offset-[#faf9ff] dark:ring-offset-[#0c0a14]"
                  : "ring-1 ring-slate-900/8 dark:ring-white/10 hover:scale-105 hover:shadow-sm"
              }`}
              style={{ background: g.css }}
            >
              <span className="sr-only">{g.name}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[13px] font-medium text-slate-700 dark:text-slate-200">
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
