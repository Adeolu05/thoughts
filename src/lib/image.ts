/**
 * Compress a user photo for local draft/archive storage and card display.
 * Targets ~JPEG quality suitable for 9:16 cards without blowing localStorage.
 */

const MAX_EDGE = 960;
const JPEG_QUALITY = 0.78;

export async function compressImageFile(
  file: File,
  options?: { maxEdge?: number; quality?: number }
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }

  // Guard extreme uploads
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("Image is too large (max 25MB)");
  }

  const maxEdge = options?.maxEdge ?? MAX_EDGE;
  const quality = options?.quality ?? JPEG_QUALITY;

  const bitmap = await loadImage(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxEdge);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);

  if ("close" in bitmap && typeof bitmap.close === "function") {
    bitmap.close();
  }

  // Prefer JPEG for photos (smaller); keep PNG only for graphics with alpha if tiny
  const usePng = file.type === "image/png" && file.size < 400_000;
  const dataUrl = usePng
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", quality);

  // If still huge, re-encode smaller from the already-scaled canvas
  if (dataUrl.length > 1_200_000) {
    const tighter = fitWithin(width, height, 720);
    const c2 = document.createElement("canvas");
    c2.width = tighter.width;
    c2.height = tighter.height;
    const ctx2 = c2.getContext("2d");
    if (!ctx2) return dataUrl;
    ctx2.drawImage(canvas, 0, 0, tighter.width, tighter.height);
    return c2.toDataURL("image/jpeg", 0.7);
  }

  return dataUrl;
}

function fitWithin(w: number, h: number, maxEdge: number) {
  if (w <= maxEdge && h <= maxEdge) return { width: w, height: h };
  const ratio = Math.min(maxEdge / w, maxEdge / h);
  return {
    width: Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

/** Entry helper - prefer photoDataUrl, fall back to legacy imageDataUrl */
export function entryPhoto(
  entry: { photoDataUrl?: string; imageDataUrl?: string }
): string | undefined {
  return entry.photoDataUrl || entry.imageDataUrl;
}
