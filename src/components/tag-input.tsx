"use client";

import { useState, type KeyboardEvent } from "react";
import { MAX_TAGS, addTag, removeTag } from "@/lib/search";

export function TagInput({
  tags,
  onChange,
  compact = false,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  compact?: boolean;
}) {
  const [value, setValue] = useState("");

  function commit(raw: string) {
    const next = addTag(tags, raw);
    if (next !== tags) onChange(next);
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(value);
      return;
    }
    if (e.key === "Backspace" && !value && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Tags
        </span>
        <span className="text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
          {tags.length}/{MAX_TAGS}
        </span>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(removeTag(tags, tag))}
              className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-800 ring-1 ring-violet-200 transition hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-400/25 dark:hover:bg-violet-500/25"
              title={`Remove #${tag}`}
            >
              #{tag}
              <span aria-hidden className="text-violet-400 dark:text-violet-300">
                ×
              </span>
            </button>
          ))}
        </div>
      )}

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (value.trim()) commit(value);
        }}
        disabled={tags.length >= MAX_TAGS}
        placeholder={
          tags.length >= MAX_TAGS
            ? "Tag limit reached"
            : "Add a tag, press Enter"
        }
        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50 dark:text-slate-50 dark:placeholder:text-slate-500"
      />
    </div>
  );
}
