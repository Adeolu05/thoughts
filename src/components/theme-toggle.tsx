"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolved, toggle, mode } = useTheme();
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={`group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/[0.08] bg-white/80 text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-violet-400/40 dark:hover:text-violet-300 sm:h-9 sm:w-9 ${className}`}
    >
      {/* Sun */}
      <svg
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          isDark
            ? "scale-50 rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100"
        }`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      {/* Moon */}
      <svg
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 -rotate-90 opacity-0"
        }`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">
        Theme: {mode === "system" ? `system (${resolved})` : mode}
      </span>
    </button>
  );
}
