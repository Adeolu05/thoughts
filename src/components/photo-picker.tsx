"use client";

import { useCallback, useRef, useState } from "react";
import { compressImageFile } from "@/lib/image";

interface PhotoPickerProps {
  photoDataUrl?: string;
  onChange: (dataUrl: string | undefined) => void;
  compact?: boolean;
}

export function PhotoPicker({
  photoDataUrl,
  onChange,
  compact = false,
}: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      setBusy(true);
      setError(null);
      try {
        const dataUrl = await compressImageFile(file);
        onChange(dataUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add photo");
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      void processFile(e.dataTransfer.files?.[0]);
    },
    [processFile]
  );

  if (photoDataUrl) {
    return (
      <div className="relative overflow-hidden rounded-[1.25rem] border border-slate-900/[0.06] dark:border-white/10 bg-slate-100 dark:bg-[#1c1930] shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoDataUrl}
          alt="Attached photo"
          className={`w-full object-cover ${compact ? "max-h-28" : "max-h-48 sm:max-h-56"}`}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-900/75 via-slate-900/30 to-transparent px-3.5 pb-3 pt-10">
          <span className="text-[11px] font-semibold text-white/95">
            1 photo · editorial
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              disabled={busy}
              className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void processFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed px-4 text-center transition-all ${
          dragOver
            ? "border-violet-400 bg-violet-50 dark:bg-violet-500/15 shadow-sm shadow-violet-600/10"
            : "border-slate-300/80 bg-white hover:border-violet-300 hover:bg-violet-50 dark:border-white/15 dark:bg-[#1c1930] dark:hover:border-violet-400/40 dark:hover:bg-violet-500/15"
        } ${compact ? "py-4" : "py-7"}`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/25">
          <PhotoIcon />
        </span>
        <p className="mt-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
          {busy ? "Compressing…" : "Add one photo"}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
          Optional · editorial · drag or tap
        </p>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void processFile(e.target.files?.[0])}
      />
    </div>
  );
}

function PhotoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <path
        d="M3 16l5-4 4 3 3-2 6 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
