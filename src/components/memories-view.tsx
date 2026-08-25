"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { FeedCard } from "@/components/feed-card";
import { PageShell } from "@/components/page-shell";
import { WritingCalendar } from "@/components/writing-calendar";
import { IconSearch } from "@/components/icons";
import { getMoodAura } from "@/lib/design-system";
import { collectTags, searchEntries } from "@/lib/search";
import { getSupabaseClient } from "@/lib/supabase";
import { loadEntries, loadOnThisDay, syncLocalToCloud } from "@/lib/storage";
import { summarizeStreaks, toDayKey } from "@/lib/streaks";
import type { JournalEntry } from "@/lib/types";

export function MemoriesView() {
  const [onThisDay, setOnThisDay] = useState<JournalEntry[]>([]);
  const [all, setAll] = useState<JournalEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [cal, setCal] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });
  const syncedRef = useRef(false);

  async function refreshArchive() {
    const [dayMemories, entries] = await Promise.all([
      loadOnThisDay(),
      loadEntries(),
    ]);
    setOnThisDay(dayMemories);
    setAll(entries);
  }

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseClient();

    async function syncIfNeeded(signedIn: boolean) {
      if (!signedIn || syncedRef.current) return;
      syncedRef.current = true;
      const result = await syncLocalToCloud();
      if (!active) return;
      if (result.error) {
        setAuthStatus(`Saved locally. Cloud sync failed: ${result.error}`);
      } else if (result.uploaded > 0) {
        setAuthStatus(
          result.uploaded === 1
            ? "Synced 1 thought to the cloud."
            : `Synced ${result.uploaded} thoughts to the cloud.`
        );
      }
    }

    async function load() {
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (active) setUser(data.user ?? null);
        await syncIfNeeded(Boolean(data.user));
      }
      const [dayMemories, entries] = await Promise.all([
        loadOnThisDay(),
        loadEntries(),
      ]);
      if (!active) return;
      setOnThisDay(dayMemories);
      setAll(entries);
      setHydrated(true);
    }

    void load();

    const authListener = supabase?.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) syncedRef.current = false;
        void (async () => {
          await syncIfNeeded(Boolean(session?.user));
          if (active) await refreshArchive();
        })();
      }
    );

    return () => {
      active = false;
      authListener?.data.subscription.unsubscribe();
    };
  }, []);

  async function sendMagicLink() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthStatus("Add Supabase env vars to enable cloud sync.");
      return;
    }
    if (!email.trim()) {
      setAuthStatus("Enter your email first.");
      return;
    }

    setAuthStatus("Sending sign-in link...");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin + "/memories",
      },
    });
    setAuthStatus(error ? error.message : "Check your email for the sign-in link.");
  }

  async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    await refreshArchive();
  }

  const moods = tally(all.map((e) => e.mood).filter(Boolean) as string[]);
  const themes = tally(all.map((e) => e.theme));
  const tagCounts = useMemo(() => collectTags(all), [all]);
  const streaks = useMemo(() => summarizeStreaks(all), [all]);
  const filtered = useMemo(() => {
    const searched = searchEntries(all, query, activeTag);
    if (!activeDay) return searched;
    return searched.filter((e) => toDayKey(e.createdAt) === activeDay);
  }, [all, query, activeTag, activeDay]);
  const topMood = moods[0]?.[0];
  const aura = getMoodAura(topMood);
  const hasFilters =
    query.trim().length > 0 || Boolean(activeTag) || Boolean(activeDay);

  return (
    <PageShell wide className="pb-24 pt-10 sm:pt-12">
      <header className="max-w-2xl">
        <p className="ui-eyebrow">Your story so far</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          Memories
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
          A soft archive of how you’ve felt, building quietly toward Thoughts
          Wrapped.
        </p>
      </header>

      {hydrated && (
        <section className="mt-6 max-w-2xl rounded-[1.5rem] border border-slate-900/[0.06] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1c1930] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-400">
                Cloud sync
              </span>
              <input
                type="email"
                value={user?.email ?? email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={Boolean(user)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-violet-600/20 placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 disabled:opacity-60 dark:border-white/15 dark:bg-[#14121f] dark:text-slate-50 dark:placeholder:text-slate-500"
              />
            </label>
            <div className="flex w-full gap-2 sm:w-auto">
              {user ? (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-500 transition hover:text-rose-600 dark:border-white/10 dark:text-slate-400 sm:w-auto"
                >
                  Sign out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void sendMagicLink()}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 sm:w-auto"
                >
                  Send link
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {authStatus ??
              (user
                ? "Cloud sync is active for this browser."
                : "Local archive works now. Sign in to sync through Supabase.")}
          </p>
        </section>
      )}

      {!hydrated ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-3xl bg-[#f4f2fa] dark:bg-[#1c1930]"
            />
          ))}
        </div>
      ) : (
        <>
          <section className="mt-8 space-y-3 sm:mt-10 sm:grid sm:grid-cols-5 sm:gap-4 sm:space-y-0 lg:max-w-3xl">
            <div className="grid grid-cols-3 gap-3 sm:contents">
              <SoftStat
                label="Moments"
                value={String(all.length)}
                glow="rgba(124, 58, 237, 0.12)"
              />
              <SoftStat
                label="Shared"
                value={String(all.filter((e) => e.isPublished).length)}
                glow="rgba(219, 39, 119, 0.1)"
              />
              <SoftStat
                label="This month"
                value={String(
                  all.filter((e) => {
                    const d = new Date(e.createdAt);
                    const n = new Date();
                    return (
                      d.getMonth() === n.getMonth() &&
                      d.getFullYear() === n.getFullYear()
                    );
                  }).length
                )}
                glow="rgba(16, 185, 129, 0.1)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:contents">
              <SoftStat
                label="Streak"
                value={String(streaks.current)}
                glow="rgba(251, 191, 36, 0.14)"
              />
              <SoftStat
                label="Best streak"
                value={String(streaks.longest)}
                glow="rgba(56, 189, 248, 0.12)"
              />
            </div>
          </section>

          <WritingCalendar
            year={cal.year}
            month={cal.month}
            written={streaks.written}
            selected={activeDay}
            onSelect={setActiveDay}
            onPrevMonth={() =>
              setCal((c) => {
                const d = new Date(c.year, c.month - 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })
            }
            onNextMonth={() =>
              setCal((c) => {
                const d = new Date(c.year, c.month + 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })
            }
          />

          {(moods.length > 0 || themes.length > 0) && (
            <section className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2 md:gap-5">
              {moods.length > 0 && (
                <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-900/[0.06] bg-[#f4f2fa] dark:border-white/10 dark:bg-[#1c1930] p-5 sm:p-6">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse 120% 100% at 0% 0%, ${aura.from}, ${aura.via} 45%, transparent 100%)`,
                    }}
                  />
                  <div className="relative">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      How you’ve been feeling
                    </h2>
                    {topMood && (
                      <p className="mt-2 font-display text-2xl capitalize text-slate-900 dark:text-slate-50 sm:text-3xl">
                        Mostly {topMood}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {moods.map(([mood, count]) => {
                        const m = getMoodAura(mood);
                        return (
                          <span
                            key={mood}
                            className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs capitalize text-slate-700 shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/[0.1] dark:text-slate-200"
                            style={{
                              backgroundImage: `linear-gradient(135deg, ${m.from}, transparent)`,
                            }}
                          >
                            {mood}{" "}
                            <span className="text-slate-400 dark:text-slate-300">{count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {themes.length > 0 && (
                <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-900/[0.06] dark:border-white/10 bg-white dark:bg-[#1c1930] p-5 sm:p-6">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Your visual voice
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Typefaces you return to when words need a home.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {themes.map(([theme, count]) => (
                      <span
                        key={theme}
                        className="rounded-full border border-violet-200 dark:border-violet-400/30 bg-violet-50 dark:bg-violet-500/15 px-3 py-1.5 text-xs capitalize text-violet-800 dark:text-violet-200"
                      >
                        {theme}{" "}
                        <span className="text-violet-400 dark:text-violet-400">{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="mt-10 sm:mt-12">
            <h2 className="font-display text-2xl text-slate-900 dark:text-slate-50">
              On this day
            </h2>
            {onThisDay.length === 0 ? (
              <div className="mt-3 rounded-[1.75rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/50 px-5 py-10 text-center dark:border-violet-500/25 dark:from-violet-500/15 dark:via-[#1c1930] dark:to-fuchsia-500/10 sm:py-12">
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Nothing from past years yet, and that’s okay.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Keep writing. Next year, this space fills with gentle echoes
                  of who you were.
                </p>
              </div>
            ) : (
              <div className="mt-4 columns-1 gap-4 sm:columns-2 lg:columns-3">
                {onThisDay.map((e) => (
                  <div key={e.id} className="mb-4 break-inside-avoid">
                    <FeedCard entry={e} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-10 sm:mt-12">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl text-slate-900 dark:text-slate-50">
                Full archive
              </h2>
              {all.length > 0 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {hasFilters
                    ? `${filtered.length} of ${all.length}`
                    : `${all.length} total`}
                </span>
              )}
            </div>

            {all.length > 0 && (
              <div className="mb-5 space-y-3">
                <label className="relative block max-w-xl">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <IconSearch />
                  </span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search title, words, mood, or tags…"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none ring-violet-600/20 placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 dark:border-white/12 dark:bg-[#1c1930] dark:text-slate-50 dark:placeholder:text-slate-500"
                  />
                </label>

                {tagCounts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTag(null)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        !activeTag
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/[0.1]"
                      }`}
                    >
                      All tags
                    </button>
                    {tagCounts.map(([tag, count]) => {
                      const selected = activeTag === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setActiveTag(selected ? null : tag)
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            selected
                              ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
                              : "bg-violet-50 text-violet-800 ring-1 ring-violet-200 hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-400/25 dark:hover:bg-violet-500/25"
                          }`}
                        >
                          #{tag}{" "}
                          <span
                            className={
                              selected
                                ? "text-violet-200"
                                : "text-violet-400 dark:text-violet-300"
                            }
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActiveTag(null);
                      setActiveDay(null);
                    }}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-violet-700 hover:underline dark:text-slate-400 dark:hover:text-violet-300"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {all.length === 0 ? (
              <div className="rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1c1930] px-4 py-12 text-center sm:py-14">
                <p className="text-sm text-slate-600 dark:text-slate-300">Your archive is quiet.</p>
                <Link
                  href="/create"
                  className="mt-4 inline-flex rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20"
                >
                  Write your first thought
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-12 text-center dark:border-white/10 dark:bg-[#1c1930] sm:py-14">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  No thoughts match that search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveTag(null);
                    setActiveDay(null);
                  }}
                  className="mt-4 text-sm font-semibold text-violet-700 dark:text-violet-300"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3">
                {filtered.map((e) => (
                  <div key={e.id} className="mb-4 break-inside-avoid sm:mb-5">
                    <FeedCard entry={e} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="relative mt-12 max-w-3xl overflow-hidden rounded-[1.75rem] border border-violet-200 bg-[#faf9ff] dark:border-violet-500/30 dark:bg-[#1c1930] p-6 sm:mt-16 sm:p-8">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 20% 0%, rgba(167,139,250,0.22), transparent 55%), radial-gradient(ellipse 60% 60% at 100% 100%, rgba(244,114,182,0.1), transparent)",
              }}
            />
            <div className="relative">
              <h2 className="font-display text-2xl text-violet-950 dark:text-violet-100">
                Thoughts Wrapped
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Every entry, mood, song, and season feeds a living memory
                system. At year-end, Thoughts will generate an immersive
                retrospective: your story through words, music, and moments.
              </p>
            </div>
          </section>
        </>
      )}
    </PageShell>
  );
}

function SoftStat({
  label,
  value,
  glow,
}: {
  label: string;
  value: string;
  glow: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-900/[0.06] bg-white dark:border-white/10 dark:bg-[#1c1930] px-3 py-5 text-center sm:px-4 sm:py-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${glow}, transparent 70%)`,
        }}
      />
      <div className="relative">
        <p className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          {value}
        </p>
        <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
          {label}
        </p>
      </div>
    </div>
  );
}

function tally(items: string[]): [string, number][] {
  const map = new Map<string, number>();
  for (const i of items) {
    map.set(i, (map.get(i) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}
