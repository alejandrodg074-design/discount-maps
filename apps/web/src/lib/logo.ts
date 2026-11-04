import 'server-only';

import { LOGO_MAX_BYTES, LOGO_MIME_TYPES } from '@org/domain';
import type { getSession } from './session';

type ServerSupabase = Awaited<ReturnType<typeof getSession>>['supabase'];

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

/** The picked logo, or null when the input was left empty. */
export function logoFromForm(formData: FormData): File | null {
  const logo = formData.get('logo');
  return logo instanceof File && logo.size > 0 ? logo : null;
}

/** Spanish message when the file breaks the upload rules, else null. */
export function logoFileError(file: File): string | null {
  if (!(LOGO_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'El logo debe ser PNG, JPG o WebP.';
  }
  if (file.size > LOGO_MAX_BYTES) return 'El logo debe pesar máximo 2 MB.';
  return null;
}

export const LOGO_UPLOAD_ERROR = 'No pudimos subir el logo. Intenta de nuevo.';

/**
 * Uploads `<business id>/logo.<ext>` to the `logos` bucket and stores the
 * path on the business. Failures are logged (Vercel logs) and returned, never
 * swallowed: a silent failure used to leave new businesses without a logo.
 */
export async function uploadBusinessLogo(
  supabase: ServerSupabase,
  businessId: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  const path = `${businessId}/logo.${EXT[file.type]}`;
  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) {
    console.error('[logo] upload failed', businessId, uploadError);
    return { error: LOGO_UPLOAD_ERROR };
  }
  const { error: updateError } = await supabase
    .from('businesses')
    .update({ logo_path: path })
    .eq('id', businessId);
  if (updateError) {
    console.error('[logo] logo_path update failed', businessId, updateError);
    return { error: LOGO_UPLOAD_ERROR };
  }
  return { path };
}
