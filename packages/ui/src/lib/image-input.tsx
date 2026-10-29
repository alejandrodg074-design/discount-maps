'use client';

import { useState, type ChangeEvent } from 'react';
import { InputField, type InputFieldProps } from './field';

/** What the server accepts (mirrors `LOGO_MAX_BYTES` / `LOGO_MIME_TYPES` in `@org/domain`). */
export const UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
export const UPLOAD_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
/** Longest side after resizing: plenty for a coupon card or a logo. */
export const UPLOAD_MAX_DIMENSION = 1600;

/** Gives up decoding after this long (the original file is then uploaded). */
const DECODE_TIMEOUT_MS = 10_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const done = (ok: boolean) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      if (ok) resolve(img);
      else reject(new Error('IMAGE_DECODE_FAILED'));
    };
    const timer = setTimeout(() => done(false), DECODE_TIMEOUT_MS);
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function renamed(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'imagen';
  return `${base}.${ext}`;
}

/**
 * Makes a picked photo fit the upload rules before it leaves the phone.
 * iPhone photos are often 3–6 MB (and HEIC), above the 2 MB rule and the
 * server-action body limit, which used to crash the page. Small images of an
 * accepted type pass through untouched; anything else is redrawn at most
 * `maxDimension` px on its longest side, as PNG when it had transparency and
 * fits, otherwise as JPEG at decreasing quality. If the browser cannot decode
 * the file, the original is returned and the server explains the rule.
 */
export async function shrinkImage(
  file: File,
  {
    maxBytes = UPLOAD_MAX_BYTES,
    maxDimension = UPLOAD_MAX_DIMENSION,
  }: { maxBytes?: number; maxDimension?: number } = {},
): Promise<File> {
  if (UPLOAD_MIME_TYPES.includes(file.type) && file.size <= maxBytes) {
    return file;
  }
  try {
    const img = await loadImage(file);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) return file;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    if (file.type === 'image/png' || file.type === 'image/webp') {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const png = await canvasToBlob(canvas, 'image/png');
      if (png && png.size <= maxBytes) {
        return new File([png], renamed(file.name, 'png'), {
          type: 'image/png',
        });
      }
    }

    // JPEG has no transparency: paint a white background first.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let jpeg: Blob | null = null;
    for (const quality of [0.85, 0.75, 0.6, 0.45]) {
      jpeg = await canvasToBlob(canvas, 'image/jpeg', quality);
      if (jpeg && jpeg.size <= maxBytes) break;
    }
    if (!jpeg) return file;
    return new File([jpeg], renamed(file.name, 'jpg'), { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export interface ImageInputFieldProps extends Omit<
  InputFieldProps,
  'type' | 'accept' | 'onChange'
> {
  /** Called with the (possibly resized) file, or null when cleared. */
  onImageChange?: (file: File | null) => void;
}

/**
 * File input for logos and coupon images. Resizes the picked photo with
 * `shrinkImage` and swaps it into the input, so both native form actions and
 * code that reads `input.files` upload the small version.
 */
export function ImageInputField({
  onImageChange,
  hint = 'PNG, JPG o WebP. Las fotos grandes se ajustan solas.',
  ...rest
}: ImageInputFieldProps) {
  const [busy, setBusy] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const picked = input.files?.[0] ?? null;
    if (!picked) {
      onImageChange?.(null);
      return;
    }
    setBusy(true);
    try {
      const small = await shrinkImage(picked);
      if (small !== picked) {
        try {
          const dt = new DataTransfer();
          dt.items.add(small);
          input.files = dt.files;
        } catch {
          // Very old browsers: keep the original, the server checks the size.
        }
      }
      onImageChange?.(small);
    } finally {
      setBusy(false);
    }
  }

  return (
    <InputField
      {...rest}
      type="file"
      accept={UPLOAD_MIME_TYPES.join(',')}
      hint={busy ? 'Preparando la imagen…' : hint}
      aria-busy={busy || undefined}
      onChange={handleChange}
    />
  );
}
