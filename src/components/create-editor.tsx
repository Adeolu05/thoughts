"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThoughtCard } from "@/components/thought-card";
import { ThemePicker } from "@/components/theme-picker";
import { AtmosphereStrip, StudioRail } from "@/components/studio-rail";
import { PhotoPicker } from "@/components/photo-picker";
import { PageShell } from "@/components/page-shell";
import { TagInput } from "@/components/tag-input";
import { IconKeyboard, IconMic, IconSpark } from "@/components/icons";
import { useSpeech } from "@/hooks/use-speech";
import { exportCardToPng, shareCard } from "@/lib/export-image";
import { GRADIENTS, THEMES } from "@/lib/design-system";
import {
  clearDraft,
  formatDraftAge,
  getDraft,
  hasMeaningfulDraft,
  saveDraft,
} from "@/lib/draft";
import { addTag } from "@/lib/search";
import {
  createId,
  getEntries,
  isCloudConfigured,
  loadEntryBySlug,
  saveEntryEverywhere,
  slugify,
  type SaveResult,
} from "@/lib/storage";
import { currentStreak, writtenDayKeys } from "@/lib/streaks";
import type {
  DraftState,
  GradientId,
  JournalEntry,
  Mood,
  Source,
  ThemeId,
} from "@/lib/types";

type Step = "write" | "style" | "preview";
type DraftStatus = "idle" | "saving" | "saved" | "restored";

const AUTOSAVE_MS = 700;

function describeSave(base: string, result: SaveResult): string {
  if (result.error) {
    return `Saved on this device. Cloud sync failed: ${result.error}`;
  }
  if (result.destination === "local" && isCloudConfigured()) {
    return `${base} on this device. Sign in on Memories to sync.`;
  }
  return base;
}

export function CreateEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hydrated = useRef(false);
  const skipNextSave = useRef(false);

  const [step, setStep] = useState<Step>("write");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [wasPublished, setWasPublished] = useState(false);
  const [streakCurrent, setStreakCurrent] = useState(0);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState<ThemeId>("lyric");
  const [gradient, setGradient] = useState<GradientId>("midnight-muse");
  const [source, setSource] = useState<Source>("typed");
  const [mood, setMood] = useState<Mood | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [interim, setInterim] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(() => {
      void (async () => {
        setStreakCurrent(currentStreak(writtenDayKeys(getEntries())));

        if (editSlug) {
          const found = await loadEntryBySlug(editSlug);
          if (cancelled) return;
          if (found && !found.id.startsWith("demo-")) {
            setContent(found.content);
            setTitle(found.title ?? "");
            setTheme(found.theme);
            setGradient(found.gradient);
            setMood(found.mood);
            setTags(found.tags ?? []);
            setSource(found.source);
            setPhotoDataUrl(found.photoDataUrl ?? found.imageDataUrl);
            setCreatedAt(found.createdAt);
            setEditingId(found.id);
            setEditingSlug(found.slug);
            setWasPublished(found.isPublished);
            setStep("write");
            skipNextSave.current = true;
            hydrated.current = true;
            setReady(true);
            return;
          }
        }

        const draft = getDraft();
        if (hasMeaningfulDraft(draft) && draft) {
          setContent(draft.content ?? "");
          setTitle(draft.title ?? "");
          setTheme(draft.theme ?? "lyric");
          setGradient(draft.gradient ?? "midnight-muse");
          setMood(draft.mood);
          setTags(draft.tags ?? []);
          setSource(draft.source ?? "typed");
          setPhotoDataUrl(draft.photoDataUrl);
          setStep(draft.step ?? "write");
          setCreatedAt(draft.createdAt || new Date().toISOString());
          setDraftUpdatedAt(draft.updatedAt);
          setDraftStatus("restored");
          skipNextSave.current = true;
        }
        hydrated.current = true;
        setReady(true);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [editSlug]);

  useEffect(() => {
    if (!hydrated.current || !ready || editingId) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const meaningful =
      content.trim().length > 0 ||
      Boolean(photoDataUrl) ||
      title.trim().length > 0;

    if (!meaningful) {
      clearDraft();
      const t = window.setTimeout(() => {
        setDraftStatus("idle");
        setDraftUpdatedAt(null);
      }, 0);
      return () => window.clearTimeout(t);
    }

    const statusTimer = window.setTimeout(() => {
      setDraftStatus("saving");
    }, 0);

    const t = window.setTimeout(() => {
      const draft: DraftState = {
        content,
        title,
        theme,
        gradient,
        mood,
        tags,
        source,
        photoDataUrl,
        step,
        createdAt,
        updatedAt: new Date().toISOString(),
      };
      saveDraft(draft);
      setDraftUpdatedAt(draft.updatedAt);
      setDraftStatus("saved");
    }, AUTOSAVE_MS);

    return () => {
      window.clearTimeout(statusTimer);
      window.clearTimeout(t);
    };
  }, [
    content,
    title,
    theme,
    gradient,
    mood,
    tags,
    source,
    photoDataUrl,
    step,
    createdAt,
    ready,
    editingId,
  ]);

  const onTranscript = useCallback((text: string, isFinal: boolean) => {
    setSource("spoken");
    if (isFinal) {
      setContent((prev) =>
        (
          prev +
          (prev && !prev.endsWith(" ") ? " " : "") +
          text
        ).trim()
      );
      setInterim("");
    } else {
      setInterim(text);
    }
  }, []);

  const { supported, listening, error: speechError, toggle } =
    useSpeech(onTranscript);

  const displayContent = interim
    ? `${content}${content && !content.endsWith(" ") ? " " : ""}${interim}`
    : content;

  const canProceed = content.trim().length > 0 || Boolean(photoDataUrl);

  async function enrichWithAi() {
    if (content.trim().length < 8) return;
    setAiBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("AI failed");
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.mood) setMood(data.mood as Mood);
      if (Array.isArray(data.tags)) {
        setTags((prev) => {
          let next = [...prev];
          for (const tag of data.tags as string[]) {
            next = addTag(next, tag);
          }
          return next;
        });
      }
      setStatus("Title, mood & tags suggested");
    } catch {
      setStatus("Could not enrich. You can title it yourself");
    } finally {
      setAiBusy(false);
    }
  }

  function buildEntry(isPublished: boolean): JournalEntry {
    return {
      id: editingId ?? createId(),
      slug: editingSlug ?? slugify(title || content.slice(0, 40) || "moment"),
      createdAt,
      content: content.trim(),
      title: title.trim() || undefined,
      source,
      theme,
      gradient,
      mood,
      tags,
      isPublished,
      photoDataUrl,
    };
  }

  async function finishAndClear(message: string, entry: JournalEntry) {
    const result = await saveEntryEverywhere(entry);
    clearDraft();
    setDraftStatus("idle");
    setDraftUpdatedAt(null);
    setStatus(describeSave(message, result));
    router.push(`/thought/${result.entry.slug}`);
  }

  async function handleSave(publish: boolean) {
    if (!canProceed) {
      setStatus("Write something or add a photo");
      return;
    }
    setBusy(true);
    try {
      await finishAndClear(
        publish ? "Published to your archive" : "Saved privately",
        buildEntry(publish)
      );
    } catch {
      setStatus("Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleExport() {
    if (!cardRef.current || !canProceed) return;
    setBusy(true);
    setStatus(null);
    try {
      await exportCardToPng(cardRef.current, `thought-${Date.now()}.png`);
      await finishAndClear(
        "Exported PNG · archived privately",
        buildEntry(editingId ? wasPublished : false)
      );
    } catch (e) {
      console.error(e);
      setStatus("Export failed. Try another browser");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (!cardRef.current || !canProceed) return;
    setBusy(true);
    try {
      const result = await shareCard(cardRef.current, title || "My Thought");
      await finishAndClear(
        result === "shared"
          ? "Shared · archived privately"
          : result === "copied"
            ? "Copied image · archived privately"
            : "Downloaded · archived privately",
        buildEntry(editingId ? wasPublished : false)
      );
    } catch {
      setStatus("Share cancelled");
    } finally {
      setBusy(false);
    }
  }

  function discardDraft() {
    if (editingSlug) {
      router.push(`/thought/${editingSlug}`);
      return;
    }
    if (!confirm("Discard this draft? This cannot be undone.")) return;
    clearDraft();
    setContent("");
    setTitle("");
    setTheme("lyric");
    setGradient("midnight-muse");
    setMood(undefined);
    setTags([]);
    setSource("typed");
    setPhotoDataUrl(undefined);
    setStep("write");
    setCreatedAt(new Date().toISOString());
    setDraftStatus("idle");
    setDraftUpdatedAt(null);
    setStatus("Draft discarded");
    textareaRef.current?.focus();
  }

  const studioRef = useRef({
    content,
    step,
    theme,
    gradient,
    canProceed,
    handleExport,
    handleSave,
  });
  useEffect(() => {
    studioRef.current = {
      content,
      step,
      theme,
      gradient,
      canProceed,
      handleExport,
      handleSave,
    };
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "TEXTAREA" ||
          target.tagName === "INPUT" ||
          target.isContentEditable);
      const s = studioRef.current;

      if (e.key === "?" && !inField) {
        e.preventDefault();
        setShowShortcuts((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setShowShortcuts(false);
        return;
      }

      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "Enter") {
        e.preventDefault();
        if (!s.canProceed) {
          setStatus("Write something or add a photo");
          return;
        }
        if (s.step === "write") setStep("style");
        else if (s.step === "style") setStep("preview");
        else void s.handleExport();
        return;
      }
      if (meta && e.key === "s") {
        e.preventDefault();
        void s.handleSave(true);
        return;
      }
      if (meta && e.shiftKey && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        void s.handleExport();
        return;
      }
      if (inField) return;
      if (e.key === "1") setStep("write");
      if (e.key === "2" && s.canProceed) setStep("style");
      if (e.key === "3" && s.canProceed) setStep("preview");
      if (e.key === "t" || e.key === "T") {
        const idx = THEMES.findIndex((x) => x.id === s.theme);
        setTheme(THEMES[(idx + 1) % THEMES.length].id);
      }
      if (e.key === "g" || e.key === "G") {
        const idx = GRADIENTS.findIndex((x) => x.id === s.gradient);
        setGradient(GRADIENTS[(idx + 1) % GRADIENTS.length].id);
      }
      if (e.altKey && e.key === "1") setTheme("lyric");
      if (e.altKey && e.key === "2") setTheme("editorial");
      if (e.altKey && e.key === "3") setTheme("classic");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const steps: { id: Step; label: string }[] = [
    { id: "write", label: "Write" },
    { id: "style", label: "Style" },
    { id: "preview", label: "Export" },
  ];

  const liveCard = (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[300px] xl:max-w-[320px]">
      <ThoughtCard
        content={displayContent}
        title={title || undefined}
        theme={theme}
        gradient={gradient}
        createdAt={createdAt}
        photoDataUrl={photoDataUrl}
        className="w-full"
      />
      {canProceed && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleExport()}
          title="Download PNG for WhatsApp / Stories"
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-900/70 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg backdrop-blur-md ring-1 ring-white/20 transition hover:bg-slate-900/85 disabled:opacity-50 dark:bg-black/60"
        >
          <DownloadIcon />
          Stories
        </button>
      )}
    </div>
  );

  const wordCount = content.trim()
    ? content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const draftLabel =
    draftStatus === "saving"
      ? "Saving draft…"
      : draftStatus === "saved" && draftUpdatedAt
        ? `Draft saved · ${formatDraftAge(draftUpdatedAt)}`
        : draftStatus === "restored" && draftUpdatedAt
          ? `Draft restored · ${formatDraftAge(draftUpdatedAt)}`
          : null;

  if (!ready) {
    return (
      <PageShell wide className="py-20">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-[#1c1930]" />
      </PageShell>
    );
  }

  return (
    <PageShell wide className="pb-8 pt-5 sm:pt-8 lg:pb-14 lg:pt-8">
      {/* Studio chrome */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:mb-8">
        <div className="-mx-1 max-w-full overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex min-w-min items-center gap-0.5 rounded-full border border-slate-900/[0.06] bg-white p-1 shadow-sm dark:border-white/12 dark:bg-[#1c1930]">
            {steps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id !== "write" && !canProceed) return;
                  setStep(s.id);
                }}
                className={`min-h-[40px] shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-all sm:min-h-0 sm:px-4 sm:text-[13px] ${
                  step === s.id
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100"
                }`}
              >
                <span
                  className={`mr-1.5 tabular-nums ${
                    step === s.id
                      ? "text-white/50 dark:text-slate-900/40"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                >
                  {i + 1}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 sm:gap-3">
          {streakCurrent > 0 && (
            <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1.5 font-medium text-amber-800 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-200">
              {streakCurrent} day streak
            </span>
          )}
          {editingSlug && (
            <button
              type="button"
              onClick={() => router.push(`/thought/${editingSlug}`)}
              className="text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          )}
          {draftLabel && !editingId && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/[0.06] bg-white px-3 py-1.5 text-slate-600 shadow-sm dark:border-white/12 dark:bg-[#1c1930] dark:text-slate-300">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  draftStatus === "saving"
                    ? "animate-pulse bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />
              <span className="max-w-[9rem] truncate sm:max-w-none">
                {draftLabel}
              </span>
            </span>
          )}
          {(draftStatus === "saved" || draftStatus === "restored") &&
            !editingId && (
            <button
              type="button"
              onClick={discardDraft}
              className="text-slate-500 underline-offset-2 hover:text-rose-600 hover:underline dark:text-slate-400 dark:hover:text-rose-400"
            >
              Discard
            </button>
          )}
          <span className="hidden tabular-nums lg:inline">{wordCount} words</span>
          <button
            type="button"
            onClick={() => setShowShortcuts((v) => !v)}
            className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white lg:inline-flex"
          >
            <IconKeyboard />
            Shortcuts
          </button>
        </div>
      </div>

      {showShortcuts && (
        <div
          className="mb-5 hidden rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-white/12 dark:bg-[#1c1930] dark:text-slate-400 lg:block"
          role="dialog"
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["⌘/Ctrl + Enter", "Next step / Download PNG"],
              ["⌘/Ctrl + S", "Publish to feed"],
              ["⌘/Ctrl + Shift + E", "Download for Stories"],
              ["1 · 2 · 3", "Jump to step"],
              ["T / G", "Cycle type / atmosphere"],
              ["Auto-save", "Drafts every ~0.7s"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <kbd className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  {k}
                </kbd>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop studio */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8">
        <div className="min-w-0 lg:col-span-5">
          {step === "write" && (
            <section className="space-y-4 animate-in fade-in">
              <div>
                <h1 className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-50 xl:text-4xl">
                  {editingId ? "Edit this thought" : "Capture a thought"}
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {editingId
                    ? "Same moment, updated words and style."
                    : "Auto-saves as you go · one photo optional."}
                </p>
              </div>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={displayContent}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setInterim("");
                    if (source === "spoken") setSource("typed");
                  }}
                  onPaste={() => setSource("pasted")}
                  placeholder="What’s on your mind?"
                  rows={10}
                  autoFocus
                  className="min-h-[280px] w-full resize-none rounded-2xl border border-slate-900/[0.06] bg-white px-5 py-5 text-[17px] leading-relaxed text-slate-900 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)] outline-none ring-violet-600/25 placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 dark:border-white/12 dark:bg-[#14121f] dark:text-slate-50 dark:placeholder:text-slate-500 xl:min-h-[320px]"
                />
                {listening && (
                  <span className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    Listening…
                  </span>
                )}
              </div>

              <PhotoPicker
                photoDataUrl={photoDataUrl}
                onChange={setPhotoDataUrl}
              />

              <div className="flex flex-wrap gap-2">
                {supported && (
                  <button
                    type="button"
                    onClick={toggle}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      listening
                        ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30"
                        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-[#1c1930] dark:text-slate-200 dark:ring-white/10"
                    }`}
                  >
                    <IconMic />
                    {listening ? "Stop" : "Speak"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={enrichWithAi}
                  disabled={aiBusy || content.trim().length < 8}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40 dark:bg-[#1c1930] dark:text-slate-200 dark:ring-white/10"
                >
                  <IconSpark />
                  {aiBusy ? "Thinking…" : "Suggest title"}
                </button>
              </div>

              {speechError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {speechError}
                </p>
              )}

              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/12 dark:bg-[#1c1930]">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Title
                  </span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-50 dark:placeholder:text-slate-500"
                    placeholder="Optional, or use Suggest title"
                  />
                </label>
                {mood && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mood:{" "}
                    <span className="capitalize text-violet-700 dark:text-violet-300">
                      {mood}
                    </span>
                  </p>
                )}
                <div className="border-t border-slate-100 pt-3 dark:border-white/10">
                  <TagInput tags={tags} onChange={setTags} />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={() => setStep("style")}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                >
                  Focus style
                </button>
                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={() => setStep("preview")}
                  className="flex-[1.4] rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Continue to export →
                </button>
              </div>
            </section>
          )}

          {step === "style" && (
            <section className="space-y-5 animate-in fade-in">
              <div>
                <h1 className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-50">
                  Fine-tune style
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Type + atmosphere, still auto-saving.
                </p>
              </div>
              <ThemePicker
                theme={theme}
                gradient={gradient}
                onThemeChange={setTheme}
                onGradientChange={setGradient}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("write")}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                >
                  ← Write
                </button>
                <button
                  type="button"
                  onClick={() => setStep("preview")}
                  className="flex-[1.4] rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                  Continue to export →
                </button>
              </div>
            </section>
          )}

          {step === "preview" && (
            <section className="space-y-5 animate-in fade-in">
              <div>
                <h1 className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-50">
                  Save & export
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Download a 9:16 PNG for Stories. Publishing to the feed is separate.
                </p>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={handleExport}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700 disabled:opacity-50"
              >
                <DownloadIcon />
                Download for Stories
              </button>
              <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                PNG · 9:16 · WhatsApp · Instagram · TikTok · saved privately
                unless you publish
              </p>

              <button
                type="button"
                disabled={busy}
                onClick={handleShare}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/12 dark:bg-[#1c1930] dark:text-slate-200 dark:hover:bg-white/[0.08]"
              >
                Share image…
              </button>
              <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                Opens your device share sheet when available
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSave(true)}
                  className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  Publish to feed
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSave(false)}
                  className="rounded-2xl border border-slate-200 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                >
                  Save private
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStep("write")}
                className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ← Keep editing
              </button>
            </section>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="preview-sticky">
            <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Live canvas
            </p>
            <div className="relative flex justify-center">
              <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-b from-violet-400/25 via-fuchsia-300/10 to-transparent blur-3xl dark:from-violet-500/20" />
              <div className="relative rounded-[1.75rem] border border-white/90 bg-white/50 p-2.5 shadow-[0_24px_50px_-18px_rgba(124,58,237,0.28)] backdrop-blur-sm dark:border-white/12 dark:bg-[#1c1930]">
                {liveCard}
              </div>
            </div>
            <p className="mx-auto mt-4 max-w-[260px] text-center text-[11px] text-slate-500 dark:text-slate-400">
              Tap <span className="text-slate-700 dark:text-slate-200">Stories</span>{" "}
              on the card to download ·{" "}
              {THEMES.find((x) => x.id === theme)?.name}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="preview-sticky space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Style rail
            </p>
            <StudioRail
              theme={theme}
              gradient={gradient}
              onThemeChange={setTheme}
              onGradientChange={setGradient}
              compact
            />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        {step === "write" && (
          <section className="space-y-4 animate-in fade-in sm:space-y-5">
            <div>
              <h1 className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                {editingId ? "Edit this thought" : "Capture a thought"}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingId
                  ? "Same moment, updated words and style."
                  : "Auto-saves · optional photo · under a minute."}
              </p>
            </div>

            <div className="relative">
              <textarea
                value={displayContent}
                onChange={(e) => {
                  setContent(e.target.value);
                  setInterim("");
                  if (source === "spoken") setSource("typed");
                }}
                onPaste={() => setSource("pasted")}
                placeholder="What’s on your mind?"
                rows={8}
                autoFocus
                className="min-h-[180px] w-full resize-none rounded-2xl border border-slate-900/[0.06] bg-white px-4 py-4 text-base leading-relaxed text-slate-900 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)] outline-none ring-violet-600/25 placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 dark:border-white/12 dark:bg-[#14121f] dark:text-slate-50 dark:placeholder:text-slate-500 sm:min-h-[220px] sm:text-[17px] [font-size:16px] sm:[font-size:17px]"
              />
              {listening && (
                <span className="absolute bottom-3 right-3 text-xs text-rose-600 dark:text-rose-400">
                  Listening…
                </span>
              )}
            </div>

            <PhotoPicker
              photoDataUrl={photoDataUrl}
              onChange={setPhotoDataUrl}
              compact
            />

            <AtmosphereStrip
              gradient={gradient}
              onGradientChange={setGradient}
            />

            <div className="flex flex-wrap gap-2">
              {supported && (
                <button
                  type="button"
                  onClick={toggle}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                    listening
                      ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300"
                      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-[#1c1930] dark:text-slate-200 dark:ring-white/10"
                  }`}
                >
                  <IconMic />
                  {listening ? "Stop" : "Speak"}
                </button>
              )}
              <button
                type="button"
                onClick={enrichWithAi}
                disabled={aiBusy || content.trim().length < 8}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 disabled:opacity-40 dark:bg-[#1c1930] dark:text-slate-200 dark:ring-white/10"
              >
                <IconSpark />
                {aiBusy ? "Thinking…" : "Suggest title"}
              </button>
              <span className="self-center text-[11px] tabular-nums text-slate-400">
                {wordCount}w
              </span>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/12 dark:bg-[#1c1930]">
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm text-slate-900 outline-none dark:text-slate-50"
                  placeholder="Optional title"
                />
              </label>
              {mood && (
                <p className="text-xs capitalize text-violet-700 dark:text-violet-300">
                  {mood}
                </p>
              )}
              <div className="border-t border-slate-100 pt-3 dark:border-white/10">
                <TagInput tags={tags} onChange={setTags} compact />
              </div>
            </div>

            <button
              type="button"
              disabled={!canProceed}
              onClick={() => setStep("style")}
              className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900"
            >
              Choose style →
            </button>
          </section>
        )}

        {step === "style" && (
          <section className="space-y-6 animate-in fade-in">
            <div>
              <h1 className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-50">
                Make it beautiful
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Typography and atmosphere.
              </p>
            </div>
            <ThemePicker
              theme={theme}
              gradient={gradient}
              onThemeChange={setTheme}
              onGradientChange={setGradient}
            />
            <div className="mx-auto w-full max-w-[280px]">{liveCard}</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("write")}
                className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-medium text-slate-600 dark:border-white/10 dark:text-slate-300"
              >
                ← Edit
              </button>
              <button
                type="button"
                onClick={() => setStep("preview")}
                className="flex-[2] rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                Continue to export →
              </button>
            </div>
          </section>
        )}

        {step === "preview" && (
          <section className="space-y-5 animate-in fade-in">
            <div>
              <h1 className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-50">
                Save & export
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Download for Stories, or publish to your feed. Export stays private.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-[320px]">{liveCard}</div>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleExport}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700 disabled:opacity-50"
            >
              <DownloadIcon />
              Download for Stories
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleShare}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-medium text-slate-700 dark:border-white/12 dark:bg-[#1c1930] dark:text-slate-200 disabled:opacity-50"
            >
              Share image…
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => handleSave(true)}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Publish to feed
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleSave(false)}
                className="rounded-2xl border border-slate-200 py-3.5 text-sm font-medium text-slate-600 dark:border-white/10 dark:text-slate-300 disabled:opacity-50"
              >
                Save private
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep("style")}
              className="w-full text-center text-sm text-slate-500 dark:text-slate-400"
            >
              ← Back to style
            </button>
          </section>
        )}
      </div>

      <div
        className="pointer-events-none fixed -left-[9999px] top-0"
        aria-hidden
      >
        <ThoughtCard
          ref={cardRef}
          content={content}
          title={title || undefined}
          theme={theme}
          gradient={gradient}
          createdAt={createdAt}
          photoDataUrl={photoDataUrl}
          exportMode
        />
      </div>

      {status && (
        <p className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full border border-white/10 bg-slate-900/95 px-4 py-2 text-center text-xs text-white shadow-xl backdrop-blur sm:bottom-6 sm:text-sm">
          {status}
        </p>
      )}
    </PageShell>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
