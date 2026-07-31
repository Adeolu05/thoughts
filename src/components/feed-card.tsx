"use client";

import Link from "next/link";
import type { JournalEntry } from "@/lib/types";
import { getGradient, getTheme } from "@/lib/design-system";
import { formatRelative, truncate } from "@/lib/format";
import { entryPhoto } from "@/lib/image";

export function FeedCard({
  entry,
  featured = false,
}: {
  entry: JournalEntry;
  featured?: boolean;
}) {
  const gradient = getGradient(entry.gradient);
  const theme = getTheme(entry.theme);
  const photo = entryPhoto(entry);

  return (
    <Link
      href={`/thought/${entry.slug}`}
      className={`card-lift group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-900/[0.06] bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out active:scale-[0.99] hover:border-violet-300/50 hover:shadow-[0_20px_40px_-16px_rgba(124,58,237,0.18)] dark:border-white/[0.12] dark:bg-[#1c1930] dark:shadow-black/40 dark:hover:border-violet-400/35 dark:hover:shadow-[0_20px_40px_-16px_rgba(139,92,246,0.25)] ${
        featured ? "sm:rounded-[1.65rem]" : ""
      }`}
    >
      <div
        className={`relative flex flex-1 flex-col overflow-hidden ${
          featured
            ? "min-h-[240px] sm:min-h-[300px] lg:min-h-[340px]"
            : "min-h-[168px] sm:min-h-[190px]"
        }`}
        style={{
          background: `linear-gradient(165deg, transparent 20%, rgba(0,0,0,0.22) 100%), ${gradient.css}`,
          color: gradient.textColor,
        }}
      >
        {/* Soft light sheen */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 30% 0%, rgba(255,255,255,0.18), transparent 55%)",
          }}
        />

        {photo && (
          <div
            className={`relative shrink-0 overflow-hidden ${
              featured ? "h-40 sm:h-48" : "h-32 sm:h-36"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt=""
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.4) 100%)",
              }}
            />
          </div>
        )}

        <div
          className={`relative flex flex-1 flex-col justify-center ${
            featured
              ? "px-6 py-7 sm:px-8 sm:py-9 lg:px-10"
              : "px-5 py-6 sm:px-6 sm:py-7"
          }`}
        >
          {entry.title ? (
            <p
              className={`mb-2.5 ${theme.titleClass} ${featured ? "sm:text-sm" : ""}`}
              style={{ color: gradient.mutedColor }}
            >
              {entry.title}
            </p>
          ) : null}
          <p
            className={`${theme.className} break-words hyphens-auto ${
              theme.id === "lyric"
                ? `font-semibold leading-snug tracking-tight text-center ${
                    featured
                      ? "text-[1.35rem] sm:text-[1.85rem] lg:text-[2.05rem]"
                      : "text-[1.2rem] sm:text-[1.4rem]"
                  }`
                : theme.id === "editorial"
                  ? `font-medium italic leading-relaxed ${
                      featured
                        ? "text-lg sm:text-2xl"
                        : "text-[1.05rem] sm:text-lg"
                    }`
                  : `leading-relaxed ${
                      featured
                        ? "text-base sm:text-xl"
                        : "text-[0.95rem] sm:text-[1.05rem]"
                    }`
            } ${photo ? "line-clamp-3 sm:line-clamp-4" : "line-clamp-5 sm:line-clamp-6"}`}
          >
            {entry.content
              ? truncate(entry.content, featured ? 320 : 220)
              : photo
                ? "A moment with a photo"
                : ""}
          </p>
        </div>
      </div>

      <div
        className={`flex min-h-[2.75rem] items-center justify-between gap-2 border-t border-slate-900/[0.04] bg-white/95 text-xs dark:border-white/[0.1] dark:bg-[#1c1930] ${
          featured ? "px-5 py-3 sm:px-8 sm:py-3.5" : "px-4 py-2.5 sm:px-5 sm:py-3"
        }`}
      >
        <span className="flex min-w-0 items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <span className="shrink-0 font-medium text-slate-600 dark:text-slate-300">
            {formatRelative(entry.createdAt)}
          </span>
          {photo && (
            <span className="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              Photo
            </span>
          )}
          {entry.mood ? (
            <span className="hidden max-w-[5.5rem] truncate rounded-full bg-slate-50 px-2 py-0.5 capitalize text-slate-500 ring-1 ring-slate-900/5 dark:bg-white/[0.1] dark:text-slate-300 dark:ring-white/15 xs:inline-block sm:inline-block">
              {entry.mood}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 font-semibold text-violet-600 dark:text-violet-400">
          Open →
        </span>
      </div>
    </Link>
  );
}
