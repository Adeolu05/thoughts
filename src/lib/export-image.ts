/**
 * Client-side PNG export for journal cards.
 * Uses html-to-image when available; falls back to a canvas-drawn card.
 */

import type { GradientId, ThemeId } from "./types";
import { EXPORT_SPEC, getGradient, getTheme } from "./design-system";
import { formatDate } from "./format";

export async function exportCardToPng(
  element: HTMLElement,
  filename = "thought.png"
): Promise<Blob> {
  const { toPng } = await import("html-to-image");

  // Double-resolution for crisp stories
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    width: EXPORT_SPEC.width,
    height: EXPORT_SPEC.height,
    style: {
      transform: "none",
      width: `${EXPORT_SPEC.width}px`,
      height: `${EXPORT_SPEC.height}px`,
    },
  });

  const res = await fetch(dataUrl);
  const blob = await res.blob();

  // Trigger download when called from UI
  if (typeof document !== "undefined" && filename) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  return blob;
}

export async function shareCard(
  element: HTMLElement,
  title = "My Thought"
): Promise<"shared" | "downloaded" | "copied"> {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    width: EXPORT_SPEC.width,
    height: EXPORT_SPEC.height,
  });

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], "thought.png", { type: "image/png" });
  const copied = await copyPngToClipboard(blob);

  if (
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      files: [file],
      title,
      text: "A reflection from Thoughts",
    });
    return "shared";
  }

  if (copied) {
    return "copied";
  }

  // Fallback: download
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "thought.png";
  a.click();
  return "downloaded";
}

async function copyPngToClipboard(blob: Blob): Promise<boolean> {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof ClipboardItem === "undefined"
  ) {
    return false;
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

/** Pure canvas fallback - no DOM dependency */
export function drawCardOnCanvas(opts: {
  content: string;
  title?: string;
  theme: ThemeId;
  gradient: GradientId;
  createdAt: string;
}): HTMLCanvasElement {
  const { width, height, padding, borderRadius } = EXPORT_SPEC;
  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  const g = getGradient(opts.gradient);
  const theme = getTheme(opts.theme);

  // Background gradient
  // Approximate: fill solid first then we can't easily parse CSS gradients -
  // use a solid fill from the accent palette via fillRect + style
  ctx.fillStyle = "#111";
  roundRect(ctx, 0, 0, width, height, borderRadius);
  ctx.fill();

  // Draw gradient via temporary approach: parse common stops roughly
  fillCssGradient(ctx, g.css, 0, 0, width, height, borderRadius);

  // Content
  ctx.fillStyle = g.textColor;
  const fontFamily =
    theme.id === "editorial"
      ? "Georgia, serif"
      : theme.id === "classic"
        ? "system-ui, sans-serif"
        : "system-ui, sans-serif";

  if (opts.title) {
    ctx.font = `500 12px ${fontFamily}`;
    ctx.globalAlpha = 0.75;
    ctx.fillText(opts.title.toUpperCase(), padding, padding + 24);
    ctx.globalAlpha = 1;
  }

  ctx.font =
    theme.id === "lyric"
      ? `600 26px ${fontFamily}`
      : theme.id === "editorial"
        ? `italic 500 24px ${fontFamily}`
        : `400 22px ${fontFamily}`;

  const maxWidth = width - padding * 2;
  const lines = wrapText(ctx, opts.content, maxWidth);
  let y = height / 2 - (lines.length * 34) / 2;
  if (theme.id === "lyric") {
    ctx.textAlign = "center";
    for (const line of lines) {
      ctx.fillText(line, width / 2, y);
      y += 36;
    }
  } else {
    ctx.textAlign = "left";
    for (const line of lines) {
      ctx.fillText(line, padding, y);
      y += 34;
    }
  }

  // Footer
  ctx.textAlign = "left";
  ctx.globalAlpha = 0.6;
  ctx.font = `400 11px system-ui, sans-serif`;
  ctx.fillStyle = g.mutedColor;
  ctx.fillText(formatDate(opts.createdAt), padding, height - padding - 16);
  ctx.fillText("thoughts.dpeluola.com", padding, height - padding);
  ctx.globalAlpha = 1;

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fillCssGradient(
  ctx: CanvasRenderingContext2D,
  css: string,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const colors = [...css.matchAll(/#[0-9a-fA-F]{3,8}/g)].map((m) => m[0]);
  if (colors.length < 2) {
    ctx.fillStyle = colors[0] ?? "#1a1a2e";
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
    return;
  }
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  colors.forEach((c, i) => {
    grad.addColorStop(i / (colors.length - 1), c);
  });
  ctx.fillStyle = grad;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 14);
}
