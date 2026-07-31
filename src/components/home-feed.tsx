"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FeedCard } from "@/components/feed-card";
import { PageShell } from "@/components/page-shell";
import { DEMO_ENTRIES } from "@/lib/demo";
import { loadOnThisDay, loadPublishedEntries } from "@/lib/storage";
import type { JournalEntry } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function HomeFeed() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [memories, setMemories] = useState<JournalEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const [stored, dayMemories] = await Promise.all([
        loadPublishedEntries(),
        loadOnThisDay(),
      ]);
      if (!active) return;
      setEntries(stored.length > 0 ? stored : DEMO_ENTRIES);
      setMemories(dayMemories);
      setHydrated(true);
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const showingDemo =
    hydrated && entries.length > 0 && entries[0]?.id.startsWith("demo-");

  const featured = entries[0];
  const masonryEntries = entries;

  return (
    <PageShell wide className="pb-6 pt-6 sm:pb-28 sm:pt-12 lg:pt-16">
      {/* Hero - tighter on phone so feed starts sooner */}
      <section className="mb-8 grid items-center gap-8 sm:mb-12 sm:gap-10 lg:mb-16 lg:grid-cols-12 lg:gap-14">
        <div className="text-center sm:text-left lg:col-span-5 xl:col-span-5">
          <p className="ui-eyebrow mb-4 justify-center sm:mb-5 sm:justify-start">
            Beautiful thoughts, beautifully kept
          </p>
          <h1 className="font-display text-[2.35rem] leading-[1.08] tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-[3.4rem]">
            Your personal
            <br />
            <em className="not-italic text-violet-700 dark:text-violet-300">
              digital journal
            </em>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 sm:mx-0 sm:mt-5 sm:text-base lg:max-w-sm">
            Capture reflections. Export premium cards. Build an archive that
            becomes your own Wrapped, by{" "}
            <a
              href="https://dpeluola.com"
              className="font-semibold text-violet-700 underline decoration-violet-300/60 underline-offset-4 transition hover:decoration-violet-600 dark:text-violet-300 dark:decoration-violet-500/40"
              target="_blank"
              rel="noopener noreferrer"
            >
              David Peluola
            </a>
            .
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:justify-start">
            {/* Primary write lives in bottom dock on phone; keep hero CTA as full-width comfort tap */}
            <Link
              href="/create"
              className="btn-primary min-h-[48px] w-full max-w-xs sm:w-auto"
            >
              Write a thought
            </Link>
            <a
              href="#feed"
              className="btn-secondary min-h-[48px] w-full max-w-xs sm:w-auto"
            >
              Browse feed
            </a>
          </div>

          <div className="mt-12 hidden gap-5 border-t border-slate-900/[0.06] dark:border-white/[0.06] pt-8 lg:grid lg:grid-cols-3">
            {[
              { t: "Beauty", d: "Nothing competes with your words." },
              { t: "Speed", d: "Share in under a minute." },
              { t: "Memory", d: "Quiet data for Wrapped." },
            ].map((item) => (
              <div key={item.t} className="group">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800 dark:text-slate-200">
                  {item.t}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured - framed like portfolio showcase */}
        <div className="hidden lg:col-span-7 lg:block">
          {hydrated && featured ? (
            <div className="relative animate-in">
              <div className="mb-4 flex items-center justify-between">
                <p className="ui-eyebrow">Latest reflection</p>
                <Link
                  href={`/thought/${featured.slug}`}
                  className="text-xs font-semibold text-violet-600 transition hover:text-violet-800"
                >
                  View full →
                </Link>
              </div>
              <div className="relative">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-violet-400/20 via-fuchsia-300/10 to-transparent blur-3xl" />
                <div className="relative rounded-[1.85rem] border border-white/80 bg-white/40 p-2 shadow-[0_24px_60px_-20px_rgba(124,58,237,0.25)] backdrop-blur-sm dark:border-white/12 dark:bg-[#1c1930]">
                  <FeedCard entry={featured} featured />
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-[360px] animate-pulse rounded-[1.85rem] bg-[#f4f2fa] dark:bg-[#1c1930]" />
          )}
        </div>
      </section>

      {memories.length > 0 && (
        <section className="mb-10 overflow-hidden rounded-[1.5rem] border border-amber-200/70 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50/30 p-5 dark:border-amber-400/25 dark:from-amber-500/15 dark:via-[#1c1930] dark:to-orange-500/10 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800/70 dark:text-amber-300">
              On this day
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-100">
              {memories.length} memor{memories.length === 1 ? "y" : "ies"} from
              past years resurfaced.
            </p>
          </div>
          <Link
            href="/memories"
            className="mt-4 inline-flex rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-amber-900 shadow-sm ring-1 ring-amber-200/80 transition hover:bg-amber-50 dark:bg-amber-400/15 dark:text-amber-100 dark:ring-amber-400/30 dark:hover:bg-amber-400/25 sm:mt-0"
          >
            Reflect →
          </Link>
        </section>
      )}

      <section id="feed">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-slate-900 dark:text-slate-50 sm:text-[1.75rem]">
              {showingDemo ? "Sample reflections" : "Journal"}
            </h2>
            {showingDemo && (
              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                Write your first thought to replace these
              </p>
            )}
          </div>
        </div>

        {!hydrated ? (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="mb-5 h-52 break-inside-avoid animate-pulse rounded-[1.35rem] bg-[#f4f2fa] dark:bg-[#1c1930]"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="columns-1 gap-5 sm:columns-2 lg:hidden">
              {masonryEntries.map((entry) => (
                <div key={entry.id} className="mb-5 break-inside-avoid">
                  <FeedCard entry={entry} />
                </div>
              ))}
            </div>

            <div className="hidden columns-2 gap-5 lg:block xl:columns-3">
              {(masonryEntries.length > 1
                ? masonryEntries.slice(1)
                : masonryEntries
              ).map((entry) => (
                <div key={entry.id} className="mb-5 break-inside-avoid">
                  <FeedCard entry={entry} />
                </div>
              ))}
            </div>

            {entries.length === 0 && (
              <div className="ui-panel px-6 py-16 text-center">
                <p className="font-display text-xl text-slate-800 dark:text-slate-200">
                  No reflections yet
                </p>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                  Your first thought is one quiet moment away.
                </p>
                <Link href="/create" className="btn-primary mt-6">
                  Write your first →
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-16 border-t border-slate-900/[0.05] dark:border-white/[0.06] pt-12 lg:hidden">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              t: "Beauty over complexity",
              d: "The interface disappears. Nothing competes with your words.",
            },
            {
              t: "Instant gratification",
              d: "Open → write → share in under a minute.",
            },
            {
              t: "Quiet intelligence",
              d: "Structured metadata today. Wrapped tomorrow.",
            },
          ].map((item) => (
            <div key={item.t}>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.t}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {item.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-14 text-center text-[11px] tracking-wide text-slate-400 dark:text-slate-500 sm:mt-20">
        thoughts.dpeluola.com · {formatDate(new Date().toISOString())}
      </p>
    </PageShell>
  );
}
