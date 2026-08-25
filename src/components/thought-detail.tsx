"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThoughtCard } from "@/components/thought-card";
import { PageShell } from "@/components/page-shell";
import { DEMO_MAP } from "@/lib/demo";
import { deleteEntryEverywhere, loadEntryBySlug } from "@/lib/storage";
import { exportCardToPng, shareCard } from "@/lib/export-image";
import { formatDateLong } from "@/lib/format";
import type { JournalEntry } from "@/lib/types";
import { entryPhoto } from "@/lib/image";

export function ThoughtDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const found = (await loadEntryBySlug(slug)) ?? DEMO_MAP[slug] ?? null;
      if (!active) return;
      setEntry(found);
      setReady(true);
    }

    void load();

    return () => {
      active = false;
    };
  }, [slug]);

  if (!ready) {
    return (
      <PageShell className="py-20">
        <div className="mx-auto h-80 max-w-sm animate-pulse rounded-3xl bg-slate-100 dark:bg-[#1c1930]" />
      </PageShell>
    );
  }

  if (!entry) {
    return (
      <PageShell className="py-20 text-center">
        <p className="text-slate-500 dark:text-slate-400">Thought not found.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-violet-400 hover:text-violet-700 dark:text-violet-300"
        >
          ← Back to feed
        </Link>
      </PageShell>
    );
  }

  async function onExport() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      await exportCardToPng(cardRef.current, `thought-${entry!.slug}.png`);
      setStatus("PNG downloaded");
    } catch {
      setStatus("Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function onShare() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const r = await shareCard(cardRef.current, entry!.title || "Thought");
      setStatus(r === "shared" ? "Shared" : "Downloaded");
    } catch {
      setStatus("Share cancelled");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (entry!.id.startsWith("demo-")) {
      setStatus("Demo entries can’t be deleted");
      return;
    }
    if (!confirm("Delete this thought permanently?")) return;
    await deleteEntryEverywhere(entry!.id);
    router.push("/");
  }

  const meta = (
    <>
      <Link
        href="/"
        className="mb-6 inline-flex text-sm text-slate-500 dark:text-slate-400 transition hover:text-slate-700 dark:text-slate-200"
      >
        ← Feed
      </Link>

      <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
        {formatDateLong(entry.createdAt)}
      </p>
      {entry.title && (
        <h1 className="mt-1 font-[family-name:var(--font-instrument)] text-3xl tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl lg:text-5xl">
          {entry.title}
        </h1>
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        {entry.mood && (
          <span className="rounded-full bg-slate-100 dark:bg-[#1c1930] px-2.5 py-1 capitalize text-slate-500 dark:text-slate-400">
            {entry.mood}
          </span>
        )}
        {entry.tags.map((t) => (
          <span key={t} className="rounded-full bg-slate-100 dark:bg-[#1c1930] px-2.5 py-1">
            #{t}
          </span>
        ))}
        <span className="rounded-full bg-slate-100 dark:bg-[#1c1930] px-2.5 py-1 capitalize">
          {entry.source}
        </span>
        <span className="rounded-full bg-slate-100 dark:bg-[#1c1930] px-2.5 py-1 capitalize">
          {entry.theme}
        </span>
        {entryPhoto(entry) && (
          <span className="rounded-full bg-slate-100 dark:bg-[#1c1930] px-2.5 py-1 text-slate-500 dark:text-slate-400">
            photo
          </span>
        )}
      </div>

      {/* Full text on desktop beside the card */}
      {entry.content ? (
        <p className="mt-8 hidden whitespace-pre-wrap text-base leading-relaxed text-slate-600 dark:text-slate-300 lg:block lg:text-lg lg:leading-relaxed">
          {entry.content}
        </p>
      ) : null}

      <div className="mt-8 flex max-w-md flex-col gap-2 sm:gap-2.5">
        {!entry.id.startsWith("demo-") && (
          <Link
            href={`/create?slug=${encodeURIComponent(entry.slug)}`}
            className="rounded-2xl border border-slate-200 bg-white py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/12 dark:bg-[#1c1930] dark:text-slate-200 dark:hover:bg-white/[0.08] sm:py-3.5"
          >
            Edit thought
          </Link>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={onExport}
          className="rounded-2xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50 sm:py-3.5"
        >
          Download for Stories
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onShare}
          className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/12 dark:bg-[#1c1930] dark:text-slate-200 dark:hover:bg-white/[0.08] sm:py-3.5"
        >
          Share image…
        </button>
      </div>

      {!entry.id.startsWith("demo-") && (
        <button
          type="button"
          onClick={() => void onDelete()}
          className="mt-4 py-2 text-left text-xs text-slate-500 dark:text-slate-400 transition hover:text-rose-600 dark:text-rose-400"
        >
          Delete thought
        </button>
      )}

      {status && (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{status}</p>
      )}
    </>
  );

  return (
    <PageShell wide className="pb-24 pt-6 sm:pt-8 lg:pt-12">
      {/* Mobile: card first. Desktop: card | meta */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
        <div className="relative lg:col-span-7 xl:col-span-7">
          <div className="pointer-events-none absolute -left-[9999px] top-0" aria-hidden>
            <ThoughtCard
              ref={cardRef}
              content={entry.content}
              title={entry.title}
              theme={entry.theme}
              gradient={entry.gradient}
              createdAt={entry.createdAt}
              photoDataUrl={entryPhoto(entry)}
              exportMode
            />
          </div>
          <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:mx-0 lg:max-w-[380px]">
            <div className="absolute -inset-4 hidden rounded-[2rem] bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 blur-2xl lg:block" />
            <ThoughtCard
              content={entry.content}
              title={entry.title}
              theme={entry.theme}
              gradient={entry.gradient}
              createdAt={entry.createdAt}
              photoDataUrl={entryPhoto(entry)}
              className="relative w-full"
            />
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-5">{meta}</div>
      </div>
    </PageShell>
  );
}
