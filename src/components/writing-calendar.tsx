"use client";

import { monthGrid } from "@/lib/streaks";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export function WritingCalendar({
  year,
  month,
  written,
  selected,
  onSelect,
  onPrevMonth,
  onNextMonth,
}: {
  year: number;
  month: number;
  written: Set<string>;
  selected: string | null;
  onSelect: (dayKey: string | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const cells = monthGrid(year, month, written);
  const label = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="mt-8 max-w-xl sm:mt-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-slate-900 dark:text-slate-50">
          Calendar
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            className="rounded-full px-2.5 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-slate-100"
            aria-label="Previous month"
          >
            ←
          </button>
          <p className="min-w-[9.5rem] text-center text-xs font-medium text-slate-600 dark:text-slate-300">
            {label}
          </p>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-full px-2.5 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-slate-100"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-slate-900/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#1c1930] sm:p-5">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {WEEKDAYS.map((d, i) => (
            <span key={`${d}-${i}`}>{d}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const isSelected = selected === cell.key;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() =>
                  onSelect(isSelected ? null : cell.key)
                }
                className={`flex h-11 min-h-[44px] items-center justify-center rounded-xl text-xs transition ${
                  !cell.inMonth
                    ? "text-slate-300 dark:text-slate-600"
                    : isSelected
                      ? "bg-slate-900 font-semibold text-white dark:bg-white dark:text-slate-900"
                      : cell.written
                        ? "bg-violet-100 font-medium text-violet-800 dark:bg-violet-500/20 dark:text-violet-200"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                }`}
              >
                {cell.dayOfMonth}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
          Filled days are days you wrote. Tap one to filter the archive.
        </p>
      </div>
    </section>
  );
}
