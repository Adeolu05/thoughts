import type { JournalEntry } from "./types";

/** Local calendar day as YYYY-MM-DD. */
export function toDayKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function writtenDayKeys(entries: JournalEntry[]): Set<string> {
  const days = new Set<string>();
  for (const entry of entries) {
    days.add(toDayKey(entry.createdAt));
  }
  return days;
}

function shiftDay(dayKey: string, delta: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const next = new Date(y, m - 1, d + delta);
  return toDayKey(next);
}

/**
 * Consecutive days ending today, or yesterday if today is still empty.
 * Miss yesterday and today and the streak is 0.
 */
export function currentStreak(
  days: Set<string>,
  today = new Date()
): number {
  if (days.size === 0) return 0;

  const todayKey = toDayKey(today);
  const start = days.has(todayKey) ? todayKey : shiftDay(todayKey, -1);
  if (!days.has(start)) return 0;

  let count = 0;
  let cursor = start;
  while (days.has(cursor)) {
    count += 1;
    cursor = shiftDay(cursor, -1);
  }
  return count;
}

export function longestStreak(days: Set<string>): number {
  if (days.size === 0) return 0;

  const sorted = [...days].sort();
  let best = 1;
  let run = 1;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === shiftDay(sorted[i - 1], 1)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }

  return best;
}

export type CalendarCell = {
  key: string;
  dayOfMonth: number;
  inMonth: boolean;
  written: boolean;
};

export function monthGrid(
  year: number,
  month: number,
  written: Set<string>
): CalendarCell[] {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(year, month, i - startWeekday + 1);
    const key = toDayKey(d);
    cells.push({
      key,
      dayOfMonth: d.getDate(),
      inMonth: false,
      written: written.has(key),
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = toDayKey(new Date(year, month, day));
    cells.push({
      key,
      dayOfMonth: day,
      inMonth: true,
      written: written.has(key),
    });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const next = shiftDay(last.key, 1);
    const d = new Date(next);
    cells.push({
      key: next,
      dayOfMonth: d.getDate(),
      inMonth: false,
      written: written.has(next),
    });
  }

  return cells;
}

export function summarizeStreaks(
  entries: JournalEntry[],
  now = new Date()
): {
  current: number;
  longest: number;
  daysThisMonth: number;
  written: Set<string>;
} {
  const written = writtenDayKeys(entries);
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  let daysThisMonth = 0;
  for (const key of written) {
    if (key.startsWith(monthPrefix)) daysThisMonth += 1;
  }

  return {
    current: currentStreak(written, now),
    longest: longestStreak(written),
    daysThisMonth,
    written,
  };
}
