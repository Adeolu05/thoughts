"use client";

import { forwardRef } from "react";
import type { GradientId, ThemeId } from "@/lib/types";
import { EXPORT_SPEC, getGradient, getTheme } from "@/lib/design-system";
import { formatDate } from "@/lib/format";

export interface ThoughtCardProps {
  content: string;
  title?: string;
  theme: ThemeId;
  gradient: GradientId;
  createdAt: string;
  /** Single optional photo (data URL or remote) */
  photoDataUrl?: string;
  /** When true, locks to export canvas size (360×640) */
  exportMode?: boolean;
  className?: string;
  showWatermark?: boolean;
}

export const ThoughtCard = forwardRef<HTMLDivElement, ThoughtCardProps>(
  function ThoughtCard(
    {
      content,
      title,
      theme: themeId,
      gradient: gradientId,
      createdAt,
      photoDataUrl,
      exportMode = false,
      className = "",
      showWatermark = true,
    },
    ref
  ) {
    const gradient = getGradient(gradientId);
    const theme = getTheme(themeId);
    const hasPhoto = Boolean(photoDataUrl);

    const sizeStyle = exportMode
      ? {
          width: EXPORT_SPEC.width,
          height: EXPORT_SPEC.height,
          borderRadius: EXPORT_SPEC.borderRadius,
        }
      : {
          aspectRatio: EXPORT_SPEC.aspectRatio,
          borderRadius: EXPORT_SPEC.borderRadius,
        };

    // Slightly tighter type when photo is present so words + image coexist
    const contentClass = hasPhoto
      ? theme.contentClass
          .replace("text-[1.65rem]", "text-[1.25rem]")
          .replace("sm:text-[1.85rem]", "sm:text-[1.35rem]")
          .replace("text-[1.5rem]", "text-[1.15rem]")
          .replace("sm:text-[1.7rem]", "sm:text-[1.25rem]")
          .replace("text-[1.35rem]", "text-[1.05rem]")
          .replace("sm:text-[1.5rem]", "sm:text-[1.15rem]")
      : theme.contentClass;

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden shadow-2xl ${theme.className} ${className}`}
        style={{
          ...sizeStyle,
          background: gradient.css,
          color: gradient.textColor,
          boxShadow: exportMode
            ? "none"
            : "0 25px 50px -12px rgba(0,0,0,0.45)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.08) 0%, transparent 55%)",
          }}
        />

        <div
          className="relative flex h-full flex-col"
          style={{ padding: EXPORT_SPEC.padding }}
        >
          {/* Title */}
          <div className={`${hasPhoto ? "mb-3" : "mb-6"} min-h-[1rem]`}>
            {title ? (
              <p
                className={theme.titleClass}
                style={{ color: gradient.mutedColor }}
              >
                {title}
              </p>
            ) : null}
          </div>

          {/* Optional photo - editorial inset */}
          {hasPhoto && (
            <div
              className="mb-4 shrink-0 overflow-hidden"
              style={{
                borderRadius: 16,
                maxHeight: exportMode ? 220 : "38%",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoDataUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{
                  maxHeight: exportMode ? 220 : undefined,
                  aspectRatio: "4 / 3",
                  display: "block",
                }}
                draggable={false}
              />
            </div>
          )}

          {/* Main content */}
          <div
            className={`flex flex-1 ${hasPhoto ? "items-start" : "items-center"} min-h-0`}
          >
            <p
              className={`${contentClass} w-full break-words whitespace-pre-wrap ${
                hasPhoto ? "line-clamp-8" : ""
              }`}
              style={{ color: gradient.textColor }}
            >
              {content || (
                <span style={{ color: gradient.mutedColor }}>
                  {hasPhoto
                    ? "Add a caption for this moment…"
                    : "Your thought will appear here…"}
                </span>
              )}
            </p>
          </div>

          {/* Footer */}
          <div
            className="mt-4 flex shrink-0 items-end justify-between gap-3 text-[11px] tracking-wide"
            style={{ color: gradient.mutedColor }}
          >
            <div className="flex flex-col gap-0.5">
              <span>{formatDate(createdAt)}</span>
              {showWatermark ? (
                <span className="opacity-80">thoughts.dpeluola.com</span>
              ) : null}
            </div>
            <span
              className="mb-1 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: gradient.accent }}
              aria-hidden
            />
          </div>
        </div>
      </div>
    );
  }
);
